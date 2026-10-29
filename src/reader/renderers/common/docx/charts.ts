/**
 * OOXML chart part parser (option (a) scope: chart → readable data).
 *
 * `word/charts/chartN.xml` is a c:chartSpace document; this walks it with
 * the stream scanner and pulls out title, series names, categories and
 * cached numeric values. Pixel-faithful rendering would need a graphics
 * dependency — the data model here is the zero-dep contract the renderer
 * visualizes (': chart rendering as data' spec).
 *
 * Total function (same philosophy as blocks.ts): malformed/unsupported
 * parts degrade to `null` and the renderer shows a placeholder.
 */

import { scanXml } from "./xml";

export type ChartSeries = {
  name: string | null;
  values: number[];
};

export type ParsedChart = {
  title: string | null;
  /** Category labels (one per row of the data table). */
  categories: string[];
  series: ChartSeries[];
  /**
   * `bar` = pure-View bar visualization justified (bar/column/line);
   * `other` = pie/doughnut/scatter/radar/etc — data table only.
   */
  kind: "bar" | "other";
};

/** Upper bound of chart points honored as rendered data. */
const MAX_CHART_POINTS = 200;

type ChartCtx = {
  title: string[];
  inTitle: boolean;
  inTx: boolean;
  inCat: boolean;
  inVal: boolean;
  /** `c:f` cell formulas are wiring, not content — text suppressed. */
  inFormula: boolean;
  /** Axis sub-titles are axes labels, not the chart title. */
  inAxis: boolean;
  /** Categories are global; later series repeat them — first ser wins. */
  categoriesSealed: boolean;
  series: ChartSeries[];
  findsBar: boolean;
  findsLine: boolean;
  findsPie: boolean;
  findsOther: boolean;
};

function pushValue(ctx: ChartCtx, raw: string): void {
  const series = ctx.series[ctx.series.length - 1];
  if (!series || series.values.length >= MAX_CHART_POINTS) {
    return;
  }
  const num = Number(raw);
  if (Number.isFinite(num)) {
    series.values.push(num);
  }
}

export function parseChartXml(chartXml: string): ParsedChart | null {
  const ctx: ChartCtx = {
    title: [],
    inTitle: false,
    inTx: false,
    inCat: false,
    inVal: false,
    inFormula: false,
    inAxis: false,
    categoriesSealed: false,
    series: [],
    findsBar: false,
    findsLine: false,
    findsPie: false,
    findsOther: false,
  };

  const categories: string[] = [];

  scanXml(chartXml, {
    onOpen: (name) => {
      switch (name) {
        case "f":
          ctx.inFormula = true;
          return;
        case "valAx":
        case "catAx":
        case "dateAx":
        case "serAx":
          ctx.inAxis = true;
          return;
        case "title":
          ctx.inTitle = true;
          return;
        case "tx":
          ctx.inTx = ctx.series.length > 0;
          return;
        case "cat":
          ctx.inCat = true;
          return;
        case "val":
          ctx.inVal = ctx.series.length > 0;
          return;
        case "ser": {
          ctx.inTx = false;
          ctx.inCat = false;
          ctx.inVal = false;
          ctx.series.push({ name: null, values: [] });
          return;
        }
        case "barChart":
        case "bar3DChart":
          ctx.findsBar = true;
          return;
        case "lineChart":
        case "line3DChart":
          ctx.findsLine = true;
          return;
        case "pieChart":
        case "doughnutChart":
          ctx.findsPie = true;
          return;
        case "areaChart":
        case "scatterChart":
        case "radarChart":
        case "bubbleChart":
        case "ofPieChart":
          ctx.findsOther = true;
          return;
      }
    },
    onClose: (name) => {
      switch (name) {
        case "f":
          ctx.inFormula = false;
          return;
        case "valAx":
        case "catAx":
        case "dateAx":
        case "serAx":
          ctx.inAxis = false;
          return;
        case "ser":
          // Word repeats the first series' categories in every ser.
          ctx.categoriesSealed = true;
          return;
        case "title":
          ctx.inTitle = false;
          return;
        case "tx":
          ctx.inTx = false;
          return;
        case "cat":
          ctx.inCat = false;
          return;
        case "val":
          ctx.inVal = false;
          return;
      }
    },
    onText: (text) => {
      if (ctx.inFormula) {
        return;
      }
      const value = text.trim();
      if (!value) {
        return;
      }
      if (ctx.inTitle && !ctx.inAxis && ctx.title.length < 10) {
        ctx.title.push(value);
        return;
      }
      if (ctx.inTx && ctx.series.length > 0) {
        const series = ctx.series[ctx.series.length - 1];
        if (series.name === null && value.length <= 60) {
          series.name = value;
        }
        return;
      }
      if (ctx.inCat && !ctx.categoriesSealed && categories.length < MAX_CHART_POINTS) {
        categories.push(value);
        return;
      }
      if (ctx.inVal) {
        pushValue(ctx, value);
      }
    },
  });

  const hasData = ctx.series.some((s) => s.values.length > 0);
  if (!hasData && ctx.title.length === 0) {
    return null;
  }

  const visualizable = (ctx.findsBar || ctx.findsLine) && !ctx.findsPie && !ctx.findsOther;

  return {
    title: ctx.title.length > 0 ? ctx.title.join(" ") : null,
    categories,
    series: ctx.series,
    kind: visualizable ? "bar" : "other",
  };
}
