import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  transformIgnorePatterns: [],
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
};

export default config;
