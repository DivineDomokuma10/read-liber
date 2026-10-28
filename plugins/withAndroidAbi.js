const { withGradleProperties } = require("expo/config-plugins");

/**
 * Restricts Android Gradle packaging to the CPU architectures that matter.
 *
 * The original dev APK bundled all four ABIs (arm64-v8a, armeabi-v7a, x86,
 * x86_64) — quadrupling native-lib weight (Hermes, pdfium, dev client) that
 * no device ever uses in full.
 *
 * Primary test device: Samsung Galaxy A02s (Snapdragon 450, Cortex-A53) —
 * 64-bit-capable SoC that ships with a 32-bit Android userland, so an
 * arm64-only APK is rejected by its installer.
 *
 * armeabi-v7a + arm64-v8a covers that device and any modern phone (64-bit
 * userlands still accept v7a via compat mode) while x86/x86_64 emulator
 * libs stay cut off. Flip TARGET_ABI per the note below if ever needed.
 *
 * - Emulator testing someday: "arm64-v8a,x86_64" (or all four) — one EAS
 *   rebuild.
 * - Production builds are AABs; the Play Store serves per-device slices
 *   regardless of this pin.
 */
const TARGET_ABI = "armeabi-v7a,arm64-v8a";

module.exports = function withAndroidAbi(config) {
  return withGradleProperties(config, (cfg) => {
    const prop = cfg.modResults.find(
      (item) => item.type === "property" && item.key === "reactNativeArchitectures",
    );
    if (prop) {
      prop.value = TARGET_ABI;
    } else {
      cfg.modResults.push({
        type: "property",
        key: "reactNativeArchitectures",
        value: TARGET_ABI,
      });
    }
    return cfg;
  });
};
