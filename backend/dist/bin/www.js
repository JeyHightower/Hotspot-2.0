"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
try {
    require("dotenv").config();
}
catch (error) {
    console.log("No .env file found, using process.env variables");
}
const config_1 = __importDefault(require("../src/config"));
const { port } = config_1.default;
const app_1 = require("../src/app");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n=== Server Initialization ===");
        console.log(`Environment: ${config_1.default.environment}`);
        const server = app_1.app.listen(port, () => {
            console.log("\n🚀 Server is running!");
            console.log(`📡 Port: ${port}`);
            console.log(`🌍 URL: http://localhost:${port}\n`);
        });
        return server;
    });
}
main().catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error("❌ Server failed to start:", e);
    yield app_1.prisma.$disconnect();
    process.exit(1);
}));
