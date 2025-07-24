import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import postcss from "postcss";
import scssSyntax from "postcss-scss";

// === PATHS ===
const paths = {
  config: path.resolve("config/atomik.config.json"),
  base: path.resolve("src/atomik.base.scss"),
  output: path.resolve("dist/atomik.generated.scss"),
};

const baseFontSize = 16;
const pxToRem = (val) => {
  if (typeof val === "string" && val.trim().endsWith("px")) {
    return `${parseFloat(val) / baseFontSize}rem`;
  }
  return typeof val === "number" ? `${val / baseFontSize}rem` : val;
};

function hexToRgb(hex) {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((ch) => ch + ch).join("");
  if (h.length !== 6) return null;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `${r}, ${g}, ${b}`;
}

function toRgbIfPossible(col) {
  if (typeof col !== "string") return col;
  const c = col.trim().toLowerCase();
  if (c.startsWith("#")) return hexToRgb(c) || col;
  return col;
}

function generateVariables(obj, prefix) {
  if (!obj) return "";
  const entries = Object.entries(obj).map(([key, value]) => {
    if (prefix === "color") {
      const rgb = toRgbIfPossible(value);
      return `--${prefix}-${key}: ${value};\n--${prefix}-${key}-rgb: ${rgb};`;
    }
    return `--${prefix}-${key}: ${pxToRem(value)};`;
  });
  return entries.join("\n");
}

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
    if (category === "sizes") return [`.fs-${val} { font-size: ${pxToRem(val)}; }`];
    if (category === "weight") return [`.fw-${val} { font-weight: ${val}; }`];
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
    if (category === "vh") return [`.w-${safeKey(val)}vh { width: ${val}vh; }`];
    return [];
  },
  height: (key, val, category) => {
    if (category === "percent") return [`.w-${safeKey(val)}p { height: ${val}%; }`];
    if (category === "vh") return [`.w-${safeKey(val)}vh { height: ${val}vh; }`];
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
    if (key === "grow") return values.map((v) => `.fg-${v} { flex-grow: ${v}; }`);
    if (key === "shrink") return values.map((v) => `.fs-${v} { flex-shrink: ${v}; }`);
    return [];
  },
};

function generateClasses(config) {
  let baseCSS = "";
  const respBlocks = Object.fromEntries(
    Object.keys(config.breakpoints || {}).map((bp) => [bp, ""])
  );

  for (const [section, gen] of Object.entries(classGenerators)) {
    const vals = config[section];
    if (!vals) continue;

    if (Array.isArray(vals)) {
      vals.forEach((v) => {
        const rules = gen(null, v);
        baseCSS += rules.join("\n") + "\n";
        Object.keys(respBlocks).forEach((bp) => {
          respBlocks[bp] +=
            rules.map((r) => r.replace(" {", `\\@\\<${bp} {`)).join("\n") + "\n";
        });
      });
    } else {
      Object.entries(vals).forEach(([key, val]) => {
        const valList = Array.isArray(val) ? val : [val];
        valList.forEach((v) => {
          const rules = gen(key, v, key);
          baseCSS += rules.join("\n") + "\n";
          Object.keys(respBlocks).forEach((bp) => {
            respBlocks[bp] +=
              rules.map((r) => r.replace(" {", `\\@\\<${bp} {`)).join("\n") + "\n";
          });
        });
      });
    }
  }

  const respCSS = Object.entries(respBlocks)
    .map(
      ([bp, rules]) =>
        `@media (max-width: ${pxToRem(config.breakpoints[bp])}) {\n` +
        rules
          .trim()
          .split("\n")
          .map((l) => "  " + l)
          .join("\n") +
        `\n}`
    )
    .join("\n\n");

  return { base: baseCSS.trim(), responsive: respCSS };
}

function build() {
  try {
    const config = JSON.parse(fs.readFileSync(paths.config, "utf-8"));

    let baseRules = [];
    if (fs.existsSync(paths.base)) {
      const root = postcss.parse(fs.readFileSync(paths.base, "utf-8"), {
        syntax: scssSyntax,
      });

      root.walkRules((rule) => {
        if (rule.parent && rule.parent.type !== "root") {
          console.error(`❌ Règle imbriquée : ${rule.selector}`);
          process.exit(1);
        }
        if (!rule.selectors.every((sel) => /^\.[A-Za-z0-9_\-]+$/.test(sel))) {
          console.error(`❌ Sélecteur invalide : ${rule.selector}`);
          process.exit(1);
        }
        baseRules.push(rule.clone());
      });
    }

    const { base: jsonClasses, responsive: jsonResponsive } = generateClasses(config);

    let out = "/* GENERATED atomik.generated.scss */\n\n";

    out += ":root {\n" +
      [
        generateVariables(config.colors, "color"),
        generateVariables(config.font?.sizes, "font-size"),
        generateVariables(config.font?.weight, "font-weight"),
        generateVariables(config.font?.family, "font-family"),
        generateVariables(config.spacing, "spacing"),
        generateVariables(config.gutters, "gutter"),
        generateVariables(config.breakpoints, "bp"),
      ]
        .filter(Boolean)
        .join("\n") +
      "\n}\n\n";

    out += "/* JSON utility classes */\n" + jsonClasses + "\n\n";

    if (baseRules.length) {
      out += "/* base.scss hard-coded */\n" + baseRules.map(r => r.toString()).join("\n") + "\n\n";
    }

    out += "/* JSON responsive classes */\n" + jsonResponsive + "\n\n";

    if (baseRules.length) {
      out += "/* base.scss responsive */\n";
      Object.entries(config.breakpoints).forEach(([bp, val]) => {
        out += `@media (max-width: ${pxToRem(val)}) {\n`;
        baseRules.forEach((rule) => {
          const clone = rule.clone();
          clone.selectors = clone.selectors.map((s) => s + `\\@\\<${bp}`);
          out += "  " + clone.toString().replace(/\n/g, "\n  ") + "\n";
        });
        out += "}\n\n";
      });
    }

    fs.mkdirSync(path.dirname(paths.output), { recursive: true });
    fs.writeFileSync(paths.output, out, "utf-8");
    console.log(`✅ atomik.generated.scss mis à jour`);
  } catch (err) {
    console.error("❌ Erreur :", err.message);
  }
}

// --- LANCEMENT ---
build();

if (process.argv.includes("--watch")) {
  console.log("👀 Mode watch activé...");
  chokidar.watch([paths.base, paths.config]).on("change", (file) => {
    console.log(`🔁 Changement détecté : ${file}`);
    build();
  });
}
