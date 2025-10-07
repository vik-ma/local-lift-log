import { MULTISET_TYPES } from "../../constants";

export const GetValidatedMultisetType = (multisetType: string) => {
  if (MULTISET_TYPES.includes(multisetType)) return multisetType;

  return MULTISET_TYPES[0];
};
