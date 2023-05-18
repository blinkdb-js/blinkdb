import { Database } from "blinkdb";
import { createContext } from "react";
import { Model } from "./types";

export const DbContext = createContext<Database | null>(null);

export const ModelContext = createContext<Model | null>(null);
