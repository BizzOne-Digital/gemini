import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

const localPath = resolve(process.cwd(), ".env.local");
const envPath = resolve(process.cwd(), ".env");

if (existsSync(localPath)) {
  config({ path: localPath });
} else if (existsSync(envPath)) {
  config({ path: envPath });
} else {
  config();
}
