try {
  require("dotenv").config();
} catch (error) {
  console.log("No .env file found, using process.env variables");
}

import config from "../src/config/index.js";
const { port } = config;

import { app, prisma } from "../src/app";

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
  await prisma.$disconnect();
  process.exit(1);
});
