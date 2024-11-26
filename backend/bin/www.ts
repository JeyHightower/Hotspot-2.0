#!/usr/bin/env node

import dotenv from "dotenv";
dotenv.config();

import config from "../config/index.js";
const { port } = config;

import { app, prisma } from "../app.js";

async function main() {
	app.listen(port, () => console.log("listening on port", port, "..."));
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
