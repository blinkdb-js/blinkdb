import { Database } from "blinkdb";
import { createContext } from "react";
import { ValidModel } from "./types";

export const DbContext = createContext<Database | null>(null);

export const ModelContext = createContext<ValidModel | null>(null);
