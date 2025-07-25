
import { safeKey } from "./safeKey.mjs";
import { pxToRem } from "./pxToRem.mjs";

export const classMatrix = {
  colors: (key, val) => [
    `.c-${key} { color: ${val}; }`,
    `.bgc-${key} { background-color: ${val}; }`,
    `.f-${key} { fill: ${val}; }`,
  ],
  opacity: (key, val) => [`.o-${safeKey(val)} { opacity: ${val}; }`],
  aspectRatio: (key, val) => [`.ar-${safeKey(val)} { aspect-ratio: ${val}; }`],
  zIndex: (key, val) => [`.zi-${val} { z-index: ${val}; }`],
  lineHeight: (key, val) => [`.lh-${safeKey(val)} { line-height: ${val}; }`],
  font: (key, val, category) => {
    if (category === "sizes")
      return [`.fs-${val} { font-size: ${pxToRem(val)}; }`];
    if (category === "weight") return [`.fw-${val} { font-weight: ${val}; }`];
    if (category === "family") {
      const safe = val.toLowerCase().replace(/\s+/g, "-");
      return [`.ff-${safe} { font-family: \"${val}\"; }`];
    }
    return [];
  },
  width: (key, val, category) => {
    if (category === "percent") {
      return [
        `.w-${safeKey(val)} { width: ${val}%; }`,
        `.fb-${safeKey(val)} { flex-basis: ${val}%; }`,
      ];
    }
    if (category === "vh") return [`.w-${safeKey(val)}vh { width: ${val}vh; }`];
    return [];
  },
  height: (key, val, category) => {
    if (category === "percent")
      return [`.w-${safeKey(val)}p { height: ${val}%; }`];
    if (category === "vh")
      return [`.w-${safeKey(val)}vh { height: ${val}vh; }`];
    return [];
  },
  borderRadius: (key, val) => [
    `.brad-${safeKey(val)} { border-radius: ${pxToRem(val)}; }`,
  ],
  spacing: (key, val) => {
    const v = pxToRem(val);
    return [
      `.m-${key} { margin: ${v}; }`,
      `.mt-${key} { margin-top: ${v}; }`,
      `.mb-${key} { margin-bottom: ${v}; }`,
      `.ml-${key} { margin-left: ${v}; }`,
      `.mr-${key} { margin-right: ${v}; }`,
      `.min-${key} { margin-inline: ${v}; }`,
      `.mbl-${key} { margin-block: ${v}; }`,
      `.p-${key} { padding: ${v}; }`,
      `.pt-${key} { padding-top: ${v}; }`,
      `.pb-${key} { padding-bottom: ${v}; }`,
      `.pl-${key} { padding-left: ${v}; }`,
      `.pr-${key} { padding-right: ${v}; }`,
      `.pin-${key} { padding-inline: ${v}; }`,
      `.pbl-${key} { padding-block: ${v}; }`,
    ];
  },
  flex: (key, values) => {
    if (!Array.isArray(values)) return [];
    if (key === "order") return values.map((v) => `.fo-${v} { order: ${v}; }`);
    if (key === "grow")
      return values.map((v) => `.fg-${v} { flex-grow: ${v}; }`);
    if (key === "shrink")
      return values.map((v) => `.fs-${v} { flex-shrink: ${v}; }`);
    return [];
  },
};
