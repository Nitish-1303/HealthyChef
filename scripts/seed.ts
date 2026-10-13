// Fills the local SQLite database with clearly fake demo data.
// Usage: npm run seed          (refuses to overwrite a database that already has data)
//        npm run seed -- --force
import { buildDemoData } from "../src/server/demoData";
import { readSqlite, replaceSqlite, sqlitePath } from "../src/server/sqliteStore";

async function main() {
  const force = process.argv.includes("--force");
  const current = await readSqlite();
  if ((current.items.length || current.invoices.length) && !force) {
    console.error(`${sqlitePath} already has data. Run \`npm run seed -- --force\` to replace it.`);
    process.exit(1);
  }
  await replaceSqlite(buildDemoData());
  console.log(`Wrote demo data to ${sqlitePath}`);
}

main();
