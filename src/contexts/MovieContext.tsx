import MovieType from "../types/MovieType";
import { createContext } from "react";

interface MovieContextType {
  create: () => {};
  update: () => {};
  delete: () => {};
}

export const MovieContext = createContext<MovieContextType>(
  {} as MovieContextType
);
