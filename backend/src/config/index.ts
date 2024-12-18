import config from "./config.node.json" assert { type: "json" };
const { security } = config;
assert: {
  type: "json";
}

const data = {
  environment: process.env["NODE_ENV"] || "development",
  port: process.env["PORT"] || 5000,
  dbFile: process.env["DB_FILE"],
  jwtConfig: {
    secret: process.env["JWT_SECRET"] || config.security.jwtSecret,
    expiresIn: process.env["JWT_EXPIRES_IN"] || "604800",
  },
  isProduction: false,
};

data.isProduction = data.environment === "production";

export default data;
