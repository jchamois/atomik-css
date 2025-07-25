import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import postcss from "postcss";
import scssSyntax from "postcss-scss";
import cssnano from "cssnano";

import { pxToRem } from "./utils/pxToRem.mjs";
import { generateVariables } from "./utils/generateVariables.mjs";
import { classGenerator } from "./utils/classGenerator.mjs";

// === PATHS ===

const basePath = process.cwd(); // Dossier du projet utilisateur

// Chemins vers les fichiers utilisateur
const userConfigPath = path.resolve(basePath, "atomik/atomik.config.json");
const userBasePath = path.resolve(basePath, "atomik/atomik.base.scss");
const generatedAtomikFile = "_atomik.generated";

// Vérifications
if (!fs.existsSync(userConfigPath)) {
  console.log(
    "⚠️ Pas de fichier atomik.config.json trouvé dans le projet utilisateur."
  );
  process.exit(0);
}
if (!fs.existsSync(userBasePath)) {
  console.log(
    "⚠️ Pas de fichier atomik.base.scss trouvé dans le projet utilisateur."
  );
  process.exit(0);
}

// Chemin vers le node_modules du projet utilisateur
let resolvedPackageEntry = path.resolve(
  basePath,
  "node_modules/atomik-css/package.json"
);

// try {
//   resolvedPackageEntry = require.resolve("atomik-css/package.json", {
//     paths: [basePath],
//   });
// } catch {
//   // fallback local : on suppose que atomik-css est en ../atomik (monorepo) ou dans node_modules
//   const localPath1 = path.resolve(basePath, "../atomik/package.json");
//   const localPath2 = path.resolve(
//     basePath,
//     "node_modules/atomik-css/package.json"
//   );

//   if (fs.existsSync(localPath1)) {
//     resolvedPackageEntry = localPath1;
//   } else if (fs.existsSync(localPath2)) {
//     resolvedPackageEntry = localPath2;
//   } else {
//     console.error("❌ Impossible de trouver atomik-css localement.");
//     process.exit(1);
//   }
// }

const packageRoot = path.dirname(resolvedPackageEntry);
const outputPath = path.resolve(
  packageRoot,
  `dist/${generatedAtomikFile}.scss`
);

console.log("packageRoot", packageRoot);
console.log("outputPath", outputPath);

// Résumé des chemins
const paths = {
  config: userConfigPath,
  base: userBasePath,
  output: outputPath,
};

console.log("🛠 Atomik va générer ici :", paths.output);

async function build() {
  try {
    const config = JSON.parse(fs.readFileSync(paths.config, "utf-8"));

    console.log(`🔧 Configuration chargée depuis : ${paths.config}`);

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

    const { base: jsonClasses, responsive: jsonResponsive } = classGenerator(config);

    const variables = [
      generateVariables(config.colors, "color"),
      generateVariables(config.font?.sizes, "font-size"),
      generateVariables(config.font?.weight, "font-weight"),
      generateVariables(config.font?.family, "font-family"),
      generateVariables(config.spacing, "spacing"),
      generateVariables(config.gutters, "gutter"),
      generateVariables(config.breakpoints, "bp"),
    ].filter(Boolean).join("\n");

    const baseClassesSection = baseRules.length ? `/* base atomik classes */ 
    ${baseRules.map((r) => r.toString()).join("\n")}`: "";

    const responsiveBaseSection = baseRules.length ? `
    /* base atomik responsive */ 

    ${Object.entries(config.breakpoints).map(([bp, val]) => {
        const mediaRules = baseRules.map((rule) => {
            const clone = rule.clone();
            clone.selectors = clone.selectors.map((s) => s + `\\@\\<${bp}`);
           
            return "  " + clone.toString().replace(/\n/g, "\n  ");
          }).join("\n");

          return `@media (max-width: ${pxToRem(val)}) {
            ${mediaRules}}`;}).join("\n\n")}` : "";

        const out = `/* GENERATED atomik.generated.scss */
       
        :root {
        ${variables}
        }

        /*  atomik  classes */
        
        ${jsonClasses}
        ${baseClassesSection}
        /*  atomik responsive classes */
        ${jsonResponsive}
        ${responsiveBaseSection}`;
let finalCSS = out;
          if (config.minify !== false) {
      try {
        const result = await postcss([
          cssnano({
            preset: ['default', {
              discardComments: {
                removeAll: true,
                removeAllButFirst: false
              },
              normalizeWhitespace: true,
              minifySelectors: false, // Garder les sélecteurs atomiques intacts
            }]
          })
        ]).process(finalCSS, { from: undefined });
        
        finalCSS = result.css;
        console.log('🗜️  CSS minifié avec cssnano');
      } catch (minifyError) {
        console.warn('⚠️  Erreur de minification, utilisation du CSS non minifié:', minifyError.message);
      }
    }

    fs.mkdirSync(path.dirname(paths.output), { recursive: true });
    fs.writeFileSync(paths.output, finalCSS, "utf-8");
    
    const size = Buffer.byteLength(finalCSS, 'utf8');
    const sizeKB = (size / 1024).toFixed(2);
    
    console.log(`✅ ${generatedAtomikFile}.scss mis à jour (${sizeKB}KB)`, paths.output);
   
    // Génère le _index.scss qui forward le fichier généré

    const forwardPath = path.resolve(path.dirname(paths.output), "_index.scss");
    const forwardContent = `@forward "${generatedAtomikFile}.scss";\n`;

    fs.writeFileSync(forwardPath, forwardContent, "utf-8");

    console.log(`✅ _index.scss généré avec @forward`, forwardPath);
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
