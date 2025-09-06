import { IsStringInvalidInteger } from "..";

export const GenerateMultisetSetListIdList = (
  setOrderString: string
): number[][] => {
  const setOrderListList = setOrderString.split("/");

  const setListIdList: number[][] = [];

  const minValue = 0;
  const doNotAllowMinValue = true;

  setOrderListList.map((setOrderList) => {
    const setIds = setOrderList.split(",");

    const setIdList = [];

    for (let i = 0; i < setIds.length; i++) {
      if (!IsStringInvalidInteger(setIds[i], minValue, doNotAllowMinValue)) {
        setIdList.push(Number(setIds[i]));
      }
    }

    setListIdList.push(setIdList);
  });

  return setListIdList;
};
