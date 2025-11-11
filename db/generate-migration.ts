import { execSync } from "child_process"
import * as path from "path"

const args = process.argv.slice(2)

if (!args.length) {
  console.error("❌ Migration name is required. Example: npm run migration:generate -- SyncFix")
  process.exit(1)
}

const rawName = args[0]
const safeName = rawName.replace(/[^a-zA-Z0-9]/g, "") // Remove invalid characters
const timestamp = Date.now()

const fileName = `${safeName}-${timestamp}`
const filePath = path.join("db", "migrations", fileName)

try {
  execSync(`tsc && npx typeorm-ts-node-commonjs migration:generate ${filePath} -d ./db/typeorm.config.ts`, { stdio: "inherit" })
} catch (err) {
  process.exit(1)
}
