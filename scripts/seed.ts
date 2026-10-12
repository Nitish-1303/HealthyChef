// Fills db.json with clearly fake demo data.
// Usage: npm run seed          (refuses to overwrite an existing db.json)
//        npm run seed -- --force
import fs from "fs/promises";
import path from "path";
import { buildDemoData } from "../src/server/demoData";

const DB_FILE = path.resolve(process.cwd(), "db.json");

async function main() {
  const force = process.argv.includes("--force");
  const exists = await fs.access(DB_FILE).then(() => true, () => false);
  if (exists && !force) {
    console.error("db.json already exists. Run `npm run seed -- --force` to overwrite it.");
    process.exit(1);
  }
  await fs.writeFile(DB_FILE, JSON.stringify(buildDemoData(), null, 2));
  console.log(`Wrote demo data to ${DB_FILE}`);
}

main();
