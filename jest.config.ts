import type { Config } from "jest";

const config: Config = {
  projects: ["packages/*"],
  transformIgnorePatterns: [],
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
};

export default config;
