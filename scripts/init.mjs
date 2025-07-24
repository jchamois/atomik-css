// scripts/init.js
import fs from 'fs';
import readline from 'readline';
import path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const configPath = path.resolve('config/atomik.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

rl.question('Voulez-vous inclure le reset CSS ? (y/n): ', (answer) => {
  const wantsReset = answer.trim().toLowerCase() === 'y';

  // S'assurer que `includes` existe
  config.includes = config.includes || {};
  config.includes.reset = wantsReset;

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`\n✅ Fichier de config mis à jour : includes.reset = ${wantsReset}`);
  rl.close();
});
