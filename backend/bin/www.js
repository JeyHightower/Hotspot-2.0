"use strict";
//#!/usr/bin/env node
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const index_js_1 = __importDefault(require("../config/index.js"));
const { port } = index_js_1.default;
const app_js_1 = require("../app.js");
async function main() {
    app_js_1.app.listen(port, () => console.log("listening on port", port, "..."));
}
main()
    .then(async () => {
    await app_js_1.prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await app_js_1.prisma.$disconnect();
    process.exit(1);
});
