import { MultisetTypes } from "../Constants/MultisetTypes";

export const GetValidatedMultisetType = (multisetType: number) => {
  const validMultisetTypes = MultisetTypes();

  if (validMultisetTypes.has(multisetType)) return multisetType;

  return 0;
};
