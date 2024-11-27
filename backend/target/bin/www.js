//#!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config();
import config from "../config/index.js";
const { port } = config;
import { app, prisma } from "../app.js";
async function main() {
    try {
        // Start the server
        app.listen(port, () => {
            console.log("Listening on port", port, "...");
        });
    }
    catch (error) {
        console.error("Error starting the server:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}
// Call the main function
main();
// Graceful shutdown on process exit
process.on("SIGINT", async () => {
    console.log("Shutting down gracefully...");
    await prisma.$disconnect();
    process.exit(0);
});
process.on("SIGTERM", async () => {
    console.log("Shutting down gracefully...");
    await prisma.$disconnect();
    process.exit(0);
});
//!original below:
// #!/usr/bin/env node
// import dotenv from "dotenv";
// dotenv.config();
// import config from "../config/index.js";
// const { port } = config;
// import { app, prisma } from "../app.js";
// async function main() {
// 	app.listen(port, () => console.log("listening on port", port, "..."));
// }
// main()
// 	.then(async () => {
// 		await prisma.$disconnect();
// 	})
// 	.catch(async (e) => {
// 		console.error(e);
// 		await prisma.$disconnect();
// 		process.exit(1);
// 	});
//# sourceMappingURL=www.js.map