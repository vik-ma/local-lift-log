import { MULTISET_TYPES } from "../../constants";

export const GetValidatedMultisetType = (multisetType: number) => {
  if (MULTISET_TYPES.has(multisetType)) return multisetType;

  return 0;
};
