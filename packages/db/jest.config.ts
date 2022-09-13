import type { Config } from "jest";

const config: Config = {
  transformIgnorePatterns: [],
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
};

export default config;
