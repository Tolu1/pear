import { readFileSync, readdirSync } from "fs";

const hit = readdirSync("dist")
  .filter((f) => f.endsWith(".js"))
  .find((f) => readFileSync(`dist/${f}`, "utf8").includes("localhost"));

if (hit) {
  console.error(`dist/${hit} points at localhost, flip .env before releasing.`);
  process.exit(1);
}
