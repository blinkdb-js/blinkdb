import { glob } from "glob";
import { relative, resolve } from "path";
import { Bench } from "tinybench";

const relPath = process.argv[2] ?? "**/*.ts";
const absPath = resolve(__dirname, "benchmarks/", relPath);
const escapedPath = absPath.replace(/\\/g, "/");

// Loads all files from `./benchmarks/**/*.ts` (by default)
glob(escapedPath, async (err, files) => {
  if (err) return console.error(err);
  let fileCount = 0;
  // Dynamically import all modules
  const modules = await Promise.all(
    files.map(async (f) => ({
      name: f,
      module: await import(f),
    }))
  );
  for (const mod of modules) {
    if ("bench" in mod.module) {
      const bench: Bench = mod.module.bench;
      bench.addEventListener("error", (err) => {
        console.error(`Error in task ${err.task.name} at benchmark`, mod.name);
        console.error(err);
        process.exit(-1);
      });
      // Run the benchmark
      await bench.run();
      // Output Results
      console.log(
        `${relative(resolve(__dirname, "./benchmarks"), mod.name)} ${getComparisonOutput(
          bench
        )}`
      );
      console.table(getOutputTable(bench));
      fileCount++;
    }
  }
  console.log(`DONE (${fileCount} files)`);
});

/**
 * Returns a nice relative comparison between the first two elements in tbe benchmark
 */
function getComparisonOutput(bench: Bench): string {
  const tasks = bench.tasks.sort((a, b) => (b.result?.hz ?? 0) - (a.result?.hz ?? 0));
  if (tasks.length < 2) {
    return "";
  }
  const first = tasks[0];
  const second = tasks[1];
  const times = ((second.result?.mean ?? 0) / (first.result?.mean ?? 0)).toFixed(2);
  return `--- ${first.name} is ${times}x faster than ${second.name}`;
}

/**
 * Takes a bench that has already run and returns
 * nicely formatted output that can be passed
 * to `console.table`.
 */
function getOutputTable(bench: Bench): any {
  return bench.tasks
    .sort((a, b) => (b.result?.hz ?? 0) - (a.result?.hz ?? 0))
    .map(({ name, result }) => ({
      name: name,
      "ops/sec": result?.hz ?? 0,
      "Average Time (ns)": (result?.mean ?? 0) * 1000 * 1000,
      Margin: `\xb1${result?.rme.toFixed(2)}%`,
      Samples: result?.samples.length,
    }));
}
