#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

// Infos chemin
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = process.cwd();

// Récupérer les arguments
const args = process.argv.slice(2);
const command = args[0]; // ex: init, watch, etc.
const options = args.slice(1); // les options ex: --base-dir=...

// Utilitaires
function copyIfNotExists(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`✅ Copié : ${path.basename(src)} → ${dest}`);
  } else {
    console.log(`ℹ️  ${path.basename(dest)} existe déjà.`);
  }
}

function runScript(relativePath, args = []) {
  const scriptPath = path.resolve(__dirname, relativePath);
  const child = spawn("node", [scriptPath, ...args], { stdio: "inherit" });
  child.on("close", code => {
    process.exit(code);
  });
}

// === ROUTEUR DE COMMANDE ===
switch (command) {
  case "init": {

    const configSrc = path.resolve(__dirname, "../src/atomik.config.json");
    const baseSrc = path.resolve(__dirname, "../src/atomik.base.scss");

    const configDest = path.resolve(basePath, "atomik/atomik.config.json");
    const baseDest = path.resolve(basePath, "atomik/atomik.base.scss");

    console.log("🚀 Atomik init en cours...");

    copyIfNotExists(configSrc, configDest);
    copyIfNotExists(baseSrc, baseDest);
    console.log("✅ init terminé !");
    break;
  }

  case "watch": {
    runScript("../scripts/gen-atomik.mjs", ["--watch"]);
    break;
  }

  case "build":
  case "generate":
  case "gen": {
    runScript("../scripts/gen-atomik.mjs");
    break;
  }

  default:
    console.error("❌ Commande inconnue :", command);
    console.log("Utilise :");
    console.log("  npx atomik init [--base-dir=...]");
    console.log("  npx atomik watch");
    console.log("  npx atomik gen");
    process.exit(1);
}
