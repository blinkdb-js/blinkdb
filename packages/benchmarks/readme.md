<p align="center">
  <a href="http://blinkdb.io/" target="blank"><img src="../../packages/docs/src/assets/logo.svg" width="120" alt="BlinkDB Logo" /></a>
</p>

<p align="center">
  <a href="http://blinkdb.io/" target="blank">BlinkDB</a> is a in-memory JS database optimized for large scale storage
  on the frontend.
</p>

<hr />

# Benchmarks

This node package contains benchmarks for BlinkDB against comparable systems as well as low-level benchmarks against `sorted-btree`, the underlying data structure.

To execute all benchmarks, run `npm run start`. A glob that controls which benchmarks are run can be supplied as a parameter. As an example:

- `npm run start` runs all benchmarks in the `./src/benchmarks` directory.
- `npm run start -- "btree/**/*.ts"` runs all benchmarks in the `./src/benchmarks/btree/` directory.
- `npm run start -- "btree/init.ts"` runs the benchmark present in `./src/benchmarks/btree/init.ts`.
