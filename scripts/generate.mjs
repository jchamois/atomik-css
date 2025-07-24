import fs from "fs";
import path from "path";

const configPath = path.resolve("config/atomik.config.json");
const outputPath = path.resolve("dist/atomik.generated.scss");

if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const baseFontSize = 16;

const pxToRem = (val, base = baseFontSize) => {
  if (typeof val === "string" && val.trim().endsWith("px")) {
    return `${parseFloat(val) / base}rem`;
  }
  return typeof val === "number" ? `${val / base}rem` : val;
};

function hexToRgb(hex) {
  hex = hex.trim();
  let r, g, b;
  if (hex[0] === "#") hex = hex.slice(1);

  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else {
    return null;
  }

  return `${r}, ${g}, ${b}`;
}

function toRgbIfPossible(color) {
  if (typeof color !== "string") return color;
  color = color.trim().toLowerCase();

  if (color.startsWith("#")) {
    const rgb = hexToRgb(color);
    return rgb || color;
  }

  return color;
}

const generateVariables = (obj, prefix) =>
  Object.entries(obj)
    .map(([k, v]) => {
      if (prefix === "color") {
        const rgb = toRgbIfPossible(v);
        return `  --${prefix}-${k}: ${v};
  --${prefix}-${k}-rgb: ${rgb};`;
      }
      return `  --${prefix}-${k}: ${pxToRem(v)};`;
    })
    .join("\n");

const safeKey = (val) => val.toString().replace(/[./]/g, "-");

const classGenerators = {
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
    if (category === "sizes") {
      return [`.fs-${val} { font-size: ${pxToRem(val)}; }`];
    }
    if (category === "weight") {
      return [`.fw-${val} { font-weight: ${val}; }`];
    }
    if (category === "family") {
      const safe = val.toLowerCase().replace(/\s+/g, "-");
      return [`.ff-${safe} { font-family: "${val}"; }`];
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
    if (category === "vh") {
      return [`.w-${safeKey(val)}vh { width: ${val}vh; }`];
    }
    return [];
  },
  height: (key, val, category) => {
    if (category === "percent") {
      return [`.w-${safeKey(val)}p { height: ${val}%; }`];
    }
    if (category === "vh") {
      return [`.w-${safeKey(val)}vh { height: ${val}vh; }`];
    }
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
    if (key === "order") {
      return values.map((val) => `.fo-${val} { order: ${val}; }`);
    }
    if (key === "grow") {
      return values.map((val) => `.fg-${val} { flex-grow: ${val}; }`);
    }
    if (key === "shrink") {
      return values.map((val) => `.fs-${val} { flex-shrink: ${val}; }`);
    }
    return [];
  },
};

const toResponsiveSelector = (rule, bpName) => {
  const i = rule.indexOf("{");
  if (i === -1) return rule;
  const selector = rule.slice(0, i).trim();
  const declarations = rule.slice(i);
  return `${selector}\\@\\<${bpName} ${declarations}`;
};

const indent = (str, spaces = 2) =>
  str
    .split("\n")
    .map((line) => (line ? " ".repeat(spaces) + line : ""))
    .join("\n");

function generateClasses(config, breakpoints = {}) {
  let baseCSS = "";
  const responsiveBlocks = Object.fromEntries(
    Object.keys(breakpoints).map((bp) => [bp, ""])
  );

  for (const [section, generator] of Object.entries(classGenerators)) {
    const values = config[section];
    if (!values) continue;

    if (Array.isArray(values)) {
      values.forEach((val) => {
        baseCSS += generator(null, val).join("\n") + "\n";
        for (const bpName of Object.keys(breakpoints)) {
          responsiveBlocks[bpName] +=
            generator(null, val)
              .map((r) => toResponsiveSelector(r, bpName))
              .join("\n") + "\n";
        }
      });
    } else if (typeof values === "object") {
      for (const [key, val] of Object.entries(values)) {
        if (Array.isArray(val)) {
          if (section === "flex") {
            baseCSS += generator(key, val).join("\n") + "\n";
            for (const bpName of Object.keys(breakpoints)) {
              responsiveBlocks[bpName] +=
                generator(key, val)
                  .map((r) => toResponsiveSelector(r, bpName))
                  .join("\n") + "\n";
            }
          } else {
            val.forEach((v) => {
              baseCSS += generator(key, v, key).join("\n") + "\n";
              for (const bpName of Object.keys(breakpoints)) {
                responsiveBlocks[bpName] +=
                  generator(key, v, key)
                    .map((r) => toResponsiveSelector(r, bpName))
                    .join("\n") + "\n";
              }
            });
          }
        } else if (typeof val === "object" && generator.length >= 3) {
          for (const [subKey, subVal] of Object.entries(val)) {
            baseCSS += generator(subKey, subVal, subKey).join("\n") + "\n";
            for (const bpName of Object.keys(breakpoints)) {
              responsiveBlocks[bpName] +=
                generator(subKey, subVal, subKey)
                  .map((r) => toResponsiveSelector(r, bpName))
                  .join("\n") + "\n";
            }
          }
        } else {
          baseCSS += generator(key, val).join("\n") + "\n";
          for (const bpName of Object.keys(breakpoints)) {
            responsiveBlocks[bpName] +=
              generator(key, val)
                .map((r) => toResponsiveSelector(r, bpName))
                .join("\n") + "\n";
          }
        }
      }
    }
  }

  let responsiveCSS = "";
  for (const [bpName, bpVal] of Object.entries(breakpoints)) {
    responsiveCSS += `@media (max-width: ${pxToRem(bpVal)}) {\n${indent(
      responsiveBlocks[bpName]
    )}}\n`;
  }

  return { baseCSS, responsiveCSS };
}

function generateSCSS(config) {
  const rootVars = [
    generateVariables(config.colors, "color"),
    generateVariables(config.font.sizes, "font-size"),
    generateVariables(config.font.weight, "font-weight"),
    generateVariables(config.font.family, "font-family"),
    generateVariables(config.spacing, "spacing"),
    generateVariables(config.gutters, "gutter"),
    generateVariables(config.breakpoints, "bp"),
  ]
    .filter(Boolean)
    .join("\n");

  const { baseCSS, responsiveCSS } = generateClasses(
    config,
    config.breakpoints
  );

  let scss = `:root {\n${rootVars}\n}\n\n${baseCSS}\n${responsiveCSS}`;

  if (config.includes) {
    const optionalFiles = {
      reset: path.resolve("src/includes/_reset.scss"),
    };
    for (const [key, enabled] of Object.entries(config.includes)) {
      if (enabled && optionalFiles[key]) {
        const content = fs.readFileSync(optionalFiles[key], "utf-8");
        scss = content + "\n\n" + scss;
      }
    }
  }

  return scss.trim();
}

const scssContent = generateSCSS(config);
fs.writeFileSync(outputPath, scssContent);

console.log(`✅ SCSS généré dans : ${outputPath}`);
