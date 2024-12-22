import * as dotenv from "dotenv";
dotenv.config();

import config from "../config/index";
import { app, prisma } from "../app";

const { port } = config;

const server = app.listen(port, () => {
  console.log("Server listening on port", port);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});
