import { IsStringInvalidInteger } from "..";

export const GenerateMultisetSetOrderList = (
  setOrderString: string
): number[] => {
  const setIds = setOrderString.split(",");
  const setOrderList: number[] = [];

  for (const id of setIds) {
    if (!IsStringInvalidInteger(id, 0, true)) {
      setOrderList.push(Number(id));
    }
  }

  return setOrderList;
};
