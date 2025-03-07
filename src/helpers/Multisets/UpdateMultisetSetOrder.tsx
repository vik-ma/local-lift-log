import { Multiset } from "../../typings";
import {
  GenerateSetListText,
  UpdateMultiset,
  GenerateMultisetSetOrderString,
} from "..";

type UpdateMultisetSetOrderReturnType = {
  success: boolean;
  updatedMultiset: Multiset;
};

export const UpdateMultisetSetOrder = async (
  multiset: Multiset,
  setListIdOrder: number[][]
): Promise<UpdateMultisetSetOrderReturnType> => {
  const updatedMultiset = { ...multiset };

  const setOrder = GenerateMultisetSetOrderString(setListIdOrder);

  updatedMultiset.set_order = setOrder;

  const updatedSetListValues = GenerateSetListText(updatedMultiset.setList);
  updatedMultiset.setListText = updatedSetListValues.setListText;
  updatedMultiset.setListTextString = updatedSetListValues.setListTextString;

  const success = await UpdateMultiset(updatedMultiset);

  return { success, updatedMultiset };
};
