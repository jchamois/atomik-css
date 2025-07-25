import { hexToRgb } from "./hexToRgb.mjs";
import { pxToRem } from "./pxToRem.mjs";

export const generateVariables = (obj, prefix) => {
  if (!obj) return "";
  const entries = Object.entries(obj).map(([key, value]) => {
    if (prefix === "color") {
      const rgb = hexToRgb(value);
      return `--${prefix}-${key}: ${value};\n--${prefix}-${key}-rgb: ${rgb};`;
    }
    return `--${prefix}-${key}: ${pxToRem(value)};`;
  });
  return entries.join("\n");
}
