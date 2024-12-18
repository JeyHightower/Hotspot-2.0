import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nodeConfig = JSON.parse(
  fs.readFileSync(join(__dirname, "./config.node.json"), "utf8")
);

const data = {
  environment: process.env["NODE_ENV"] || "development",
  port: process.env["PORT"] || 5000,
  dbFile: process.env["DB_FILE"],
  jwtConfig: {
    secret: process.env["JWT_SECRET"] || nodeConfig.security.jwtSecret,
    expiresIn: process.env["JWT_EXPIRES_IN"] || "604800",
  },
  isProduction: false,
};

data.isProduction = data.environment === "production";

export default data;
