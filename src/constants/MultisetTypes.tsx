import { MultisetTypeMap } from "../typings";

export const MULTISET_TYPES: MultisetTypeMap = Object.freeze(
  new Map([
    [0, "Superset"],
    [1, "Drop Set"],
    [2, "Giant Set"],
    [3, "Pyramid Set"],
  ])
);
