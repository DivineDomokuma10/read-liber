/**
 * Minimal namespace-agnostic XML stream scanner.
 *
 * OOXML parsers usually pull in a real XML library; this file exists so the
 * app stays zero-dependency. It emits a SAX-style event stream (open/close/
 * text) with local element names (namespace prefix stripped) and decoded
 * attribute values, so the DOCX block builder in blocks.ts can consume it
 * without ever materializing a DOM.
 *
 * Total function by construction (same philosophy as common/markdown.ts):
 * no input makes it throw. Malformed constructs are skipped rather than
 * crashing — a corrupt document.xml degrades to missing content, not an
 * error screen.
 */

export type XmlAttrs = Record<string, string>;

export type XmlHandler = {
  /** Element start (local name, decoded attrs, whether `<name/>`). */
  onOpen?: (name: string, attrs: XmlAttrs, selfClosed: boolean) => void;
  /** Element end (local name). No parent matching is done here. */
  onClose?: (name: string) => void;
  /** Character data, entity-decoded. CDATA is passed through undecoded. */
  onText?: (text: string) => void;
};

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (raw, hex) => safeCodePoint(parseInt(hex, 16), raw))
    .replace(/&#(\d+);/g, (raw, dec) => safeCodePoint(parseInt(dec, 10), raw))
    .replace(/&(amp|lt|gt|quot|apos);/g, (raw, name) => NAMED_ENTITIES[name] ?? raw);
}

function safeCodePoint(value: number, raw: string): string {
  // RangeError-free: out-of-parse-range references render literally.
  return Number.isFinite(value) && value >= 0 && value <= 0x10ffff
    ? String.fromCodePoint(value)
    : raw;
}

/** Windows-style line breaks and tabs must not interrupt markup scanning. */
const WHITESPACE = " \t\r\n";

/** Characters that terminate an XML name in this pragmatic scanner. */
const NAME_STOP = WHITESPACE + "/>=<";

function decodeAttrValue(raw: string): string {
  return decodeXmlEntities(raw);
}

/**
 * Local-name lookup covering prefixed and unprefixed attributes
 * (`r:embed`, `embed`) in one call.
 */
export function getAttr(attrs: XmlAttrs, localName: string): string | undefined {
  let unprefixed: string | undefined;
  for (const key of Object.keys(attrs)) {
    if (key === localName) {
      unprefixed = attrs[key];
    } else if (key.endsWith(`:${localName}`)) {
      return attrs[key];
    }
  }
  return unprefixed;
}

/**
 * Streams the document through the handler. Events arrive in document
 * order; text runs are entity-decoded. There is no stack or parent
 * tracking — the consumer owns nesting semantics.
 */
export function scanXml(xml: string, handler: XmlHandler): void {
  const len = xml.length;
  let pos = 0;

  while (pos < len) {
    const lt = xml.indexOf("<", pos);
    emitText(handler, xml, pos, lt === -1 ? len : lt);
    if (lt === -1) {
      return;
    }

    pos = consumeMarkup(xml, lt, handler);
  }
}

function emitText(
  handler: XmlHandler,
  xml: string,
  from: number,
  to: number,
): void {
  if (to > from) {
    handler.onText?.(decodeXmlEntities(xml.slice(from, to)));
  }
}

/**
 * Consumes one markup construct starting at `lt` (the '<') and returns the
 * next scan position. Malformed constructs resume scanning right where
 * parsing failed so following content can still stream.
 */
function consumeMarkup(
  xml: string,
  lt: number,
  handler: XmlHandler,
): number {
  // Comments: <!-- ... -->
  if (xml.startsWith("<!--", lt)) {
    const end = xml.indexOf("-->", lt + 4);
    return end === -1 ? xml.length : end + 3;
  }

  // CDATA: <![CDATA[ ... ]]> — text, but not entity-decoded.
  if (xml.startsWith("<![CDATA[", lt)) {
    const end = xml.indexOf("]]>", lt + 9);
    const chunk = end === -1 ? xml.slice(lt + 9) : xml.slice(lt + 9, end);
    if (chunk) {
      handler.onText?.(chunk);
    }
    return end === -1 ? xml.length : end + 3;
  }

  // DOCTYPE and processing instructions: skip to '>' (no such nested
  // constructs in OOXML parts, so the naive scan is correct here).
  const isDoctypeOrPI = xml.startsWith("<!", lt) || xml.startsWith("<?", lt);
  if (isDoctypeOrPI) {
    const end = xml.indexOf(">", lt);
    return end === -1 ? xml.length : end + 1;
  }

  const isClose = xml.startsWith("</", lt);
  return isClose ? consumeCloseTag(xml, lt, handler) : consumeOpenTag(xml, lt, handler);
}

function consumeCloseTag(
  xml: string,
  lt: number,
  handler: XmlHandler,
): number {
  let j = lt + 2;
  let name = "";
  while (j < xml.length) {
    const ch = xml[j];
    if (ch === ">") {
      handler.onClose?.(localName(name));
      return j + 1;
    }
    if (NAME_STOP.indexOf(ch) !== -1 && ch !== "=") {
      // Tolerate `</name >` and garbage inside the tag: scan to '>'.
      const end = xml.indexOf(">", j);
      if (end !== -1) {
        handler.onClose?.(localName(name));
        return end + 1;
      }
      return xml.length;
    }
    name += ch;
    j += 1;
  }
  return xml.length; // Unclosed close-tag at EOF — stop scanning.
}

function consumeOpenTag(
  xml: string,
  lt: number,
  handler: XmlHandler,
): number {
  let j = lt + 1;
  let name = "";
  while (j < xml.length) {
    const ch = xml[j];
    if (NAME_STOP.indexOf(ch) !== -1) {
      break;
    }
    name += ch;
    j += 1;
  }

  if (j >= xml.length || xml[j] === "<" || name === "") {
    // Not a parseable element: resume scanning just past this '<'.
    return lt + 1;
  }

  return consumeAttributes(xml, lt, j, name, handler);
}

/**
 * Attribute loop. Returns the next scan position: after '>' for a normal
 * element, after '/>' for self-closed, or [lt + 1] when the tag turns out
 * malformed ('<' inside the plain-tag zone or premature EOF), so inter-tag
 * content can still be picked up as text.
 */
function consumeAttributes(
  xml: string,
  lt: number,
  start: number,
  name: string,
  handler: XmlHandler,
): number {
  const attrs: XmlAttrs = {};
  let j = start;

  while (j < xml.length) {
    const ch = xml[j];

    if (ch === ">") {
      handler.onOpen?.(localName(name), attrs, false);
      return j + 1;
    }
    if (ch === "/" && xml[j + 1] === ">") {
      handler.onOpen?.(localName(name), attrs, true);
      return j + 2;
    }
    if (ch === "/" || ch === "<" || ch === "=") {
      return lt + 1; // Malformed attribute zone — bail out.
    }
    if (WHITESPACE.indexOf(ch) !== -1) {
      j += 1;
      continue;
    }

    // Attribute name.
    let attrName = "";
    while (j < xml.length) {
      const c = xml[j];
      if (NAME_STOP.indexOf(c) !== -1) {
        break;
      }
      attrName += c;
      j += 1;
    }
    if (j >= xml.length || xml[j] === "<" || attrName === "") {
      return lt + 1;
    }
    if (xml[j] === ">") {
      continue; // Trailing boolean attr right at tag end — harmlessly ignored.
    }

    // Optional '=' then quoted value.
    while (j < xml.length && WHITESPACE.indexOf(xml[j]) !== -1) {
      j += 1;
    }
    if (xml[j] !== "=") {
      continue; // Boolean-ish attr (`booleans default`) — ignored.
    }
    j += 1;
    while (j < xml.length && WHITESPACE.indexOf(xml[j]) !== -1) {
      j += 1;
    }
    const quote = xml[j];
    if (quote !== '"' && quote !== "'") {
      return lt + 1;
    }
    const close = xml.indexOf(quote, j + 1);
    if (close === -1) {
      return xml.length; // Unterminated value — end of docx.
    }
    attrs[attrName] = decodeAttrValue(xml.slice(j + 1, close));
    j = close + 1;
  }

  return xml.length; // Tag never closed at EOF.
}

/** Strips the namespace prefix: `w:t` → `t`. */
function localName(name: string): string {
  const colon = name.lastIndexOf(":");
  return colon === -1 ? name : name.slice(colon + 1);
}
