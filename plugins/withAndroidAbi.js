const { withGradleProperties } = require("expo/config-plugins");

/**
 * Pins Android Gradle packaging to a single CPU architecture.
 *
 * Development APKs otherwise bundle all four ABIs (arm64-v8a, armeabi-v7a,
 * x86, x86_64), quadrupling native-lib weight (Hermes, pdfium, dev client)
 * for a size no device ever uses in full. arm64-v8a covers the target test
 * device; production builds go through an AAB where the Play Store serves
 * per-device slices regardless.
 *
 * Flip TARGET to "arm64-v8a,x86_64" if emulator testing is ever needed
 * (one EAS rebuild).
 */
const TARGET_ABI = "arm64-v8a";

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
