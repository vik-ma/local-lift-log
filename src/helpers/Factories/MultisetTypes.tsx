import { MultisetTypeMap } from "../../typings";

export const MultisetTypes = () => {
  const MULTISET_TYPES: MultisetTypeMap = new Map();
  MULTISET_TYPES.set(0, "Superset");
  MULTISET_TYPES.set(1, "Drop Set");
  MULTISET_TYPES.set(2, "Giant Set");
  MULTISET_TYPES.set(3, "Pyramid Set");

  Object.freeze(MULTISET_TYPES);

  return MULTISET_TYPES;
};
