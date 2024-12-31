"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("../src/app");
const config_1 = __importDefault(require("../src/config"));
try {
    dotenv_1.default.config();
}
catch (error) {
    console.log("No .env file found, using process.env variables");
}
const { port } = config_1.default;
async function main() {
    console.log("\n=== Server Initialization ===");
    console.log(`Environment: ${config_1.default.environment}`);
    const server = app_1.app.listen(port, () => {
        console.log("\n🚀 Server is running!");
        console.log(`📡 Port: ${port}`);
        console.log(`🌍 URL: http://localhost:${port}\n`);
    });
    return server;
}
main().catch(async (e) => {
    console.error("❌ Server failed to start:", e);
    await app_1.prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=www.js.map