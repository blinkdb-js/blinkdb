import { createContext } from "react";
import { Database } from "blinkdb";
import { Model } from "./types";

export const DbContext = createContext<Database|null>(null);

export const ModelContext = createContext<Model|null>(null);