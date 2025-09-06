import { IsStringInvalidInteger } from "..";

export const GenerateMultisetSetOrderList = (
  setOrderString: string
): number[] => {
  const setIds = setOrderString.split(",");
  const setOrderList: number[] = [];

  const minValue = 0;
  const doNotAllowMinValue = true;

  for (const id of setIds) {
    if (!IsStringInvalidInteger(id, minValue, doNotAllowMinValue)) {
      setOrderList.push(Number(id));
    }
  }

  return setOrderList;
};
