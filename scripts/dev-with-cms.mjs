import { spawn } from "node:child_process";

const children = [
  spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev"], {
    stdio: "inherit",
  }),
  spawn(process.execPath, ["node_modules/decap-server/dist/index.js"], {
    stdio: "inherit",
  }),
];

let shuttingDown = false;

function stop(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exitCode = exitCode;
}

for (const child of children) {
  child.on("error", (error) => {
    console.error(error);
    stop(1);
  });
  child.on("exit", (code, signal) => {
    if (!shuttingDown) stop(code ?? (signal ? 1 : 0));
  });
}

process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
