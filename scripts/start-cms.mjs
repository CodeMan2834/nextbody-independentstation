import { spawn } from "node:child_process";
const child = spawn(process.execPath, ["node_modules/decap-server/dist/index.js"], {
  stdio: "inherit",
  env: { ...process.env, PORT: process.env.CMS_LOCAL_PORT || "8081", BIND_HOST: "127.0.0.1", MODE: "fs" },
});
child.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 1; });
process.on("SIGINT", () => child.kill());
process.on("SIGTERM", () => child.kill());
