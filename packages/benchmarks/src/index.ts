import { glob } from "glob";
import { basename, relative, resolve } from "path";
import { Bench } from "tinybench";

const relPath = process.argv[2] ?? "**/*.ts";
const absPath = resolve(__dirname, "./benchmarks", relPath);

// Loads all files from `./benchmarks/**/*.ts` (by default)
glob(absPath, async (err, files) => {
  if (err) return console.error(err);
  let fileCount = 0;
  // Dynamically import all modules
  const modules = await Promise.all(files.map(async (f) => ({
    name: f,
    module: await import(f)
  })));
  for (const mod of modules) {
    if ("bench" in mod.module) {
      const bench: Bench = mod.module.bench;
      // Run the benchmark
      await bench.run();
      // Output Results
      console.log(relative(resolve(__dirname, "./benchmarks"), mod.name));
      console.table(getOutputTable(basename(mod.name), bench));
      fileCount++;
    }
  }
  console.log(`DONE (${fileCount} files)`);
});

/**
 * Takes a bench that has already run and returns
 * nicely formatted output that can be passed
 * to `console.table`.
 */
function getOutputTable(benchName: string, bench: Bench): any {
  return bench.tasks.map(({ name, result }) => ({
    Type: name,
    "Ops/s": result?.hz ?? 0,
    "Average Time (ps)": result?.mean ?? 0 * 1000,
    "Variance (ps)": result?.variance ?? 0 * 1000,
  }));
}
