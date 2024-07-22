import { IsStringInvalidIntegerOr0 } from "..";

export const GenerateMultisetSetOrderList = (setOrderString: string): number[] => {
  const setIds = setOrderString.split(",");
  const setOrderList: number[] = [];

  for (const id of setIds) {
    if (!IsStringInvalidIntegerOr0(id)) {
      setOrderList.push(Number(id));
    }
  }

  return setOrderList;
};
