#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

function pad(n) {
  return n < 10 ? "0" + n : "" + n;
}
function timestamp() {
  const d = new Date();
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

async function run() {
  const arg = (process.argv[2] || "backend").toLowerCase();
  const repoRoot = path.resolve(__dirname, "..");
  let buildDir;
  if (arg === "backend") buildDir = path.join(repoRoot, "dist");
  else if (arg === "frontend")
    buildDir = path.join(repoRoot, "frontend", "dist");
  else {
    console.error("Unknown target:", arg);
    process.exit(2);
  }

  if (!fs.existsSync(buildDir)) {
    console.error("Build folder not found:", buildDir);
    process.exit(3);
  }

  // read project name
  let projectName = path.basename(repoRoot);
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"),
    );
    if (pkg && pkg.name) projectName = pkg.name.replace(/[^a-z0-9-_\.]/gi, "-");
  } catch (e) {
    /* ignore */
  }

  const outName = `${projectName}-${arg}-${timestamp()}.zip`;
  const outPath = path.join(repoRoot, outName);

  const output = fs.createWriteStream(outPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    console.log(`${outName} created (${archive.pointer()} total bytes)`);
  });

  archive.on("warning", (err) => {
    if (err.code === "ENOENT") console.warn(err.message);
    else throw err;
  });
  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);
  // add the build dir contents at the root of the zip
  archive.directory(buildDir, false);

  await archive.finalize();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
