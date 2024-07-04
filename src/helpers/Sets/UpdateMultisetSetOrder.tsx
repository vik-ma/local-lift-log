import { Multiset } from "../../typings";
import { GenerateSetListText, UpdateMultiset } from "..";

type UpdateMultisetSetOrderReturnProps = {
  success: boolean;
  updatedMultiset: Multiset;
};

export const UpdateMultisetSetOrder = async (
  multiset: Multiset,
  setListIdOrder: number[]
): Promise<UpdateMultisetSetOrderReturnProps> => {
  const updatedMultiset = multiset;

  const setOrder = setListIdOrder.join(",");

  updatedMultiset.set_order = setOrder;
  updatedMultiset.setListText = GenerateSetListText(updatedMultiset.setList);

  const success = await UpdateMultiset(updatedMultiset);

  return { success, updatedMultiset };
};
