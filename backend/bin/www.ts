import dotenv from "dotenv";
dotenv.config();

import config from "../dist/config/index.js";
const { port } = config;

import { app, prismaClient } from "../src/app";

async function main() {
  console.log("\n=== Server Initialization ===");
  console.log(`Environment: ${config.environment}`);

  const server = app.listen(port, () => {
    console.log("\n🚀 Server is running!");
    console.log(`📡 Port: ${port}`);
    console.log(`🌍 URL: http://localhost:${port}\n`);
  });

  return server;
}

main().catch(async (e) => {
  console.error("❌ Server failed to start:", e);
  await prismaClient.$disconnect();
  process.exit(1);
});
