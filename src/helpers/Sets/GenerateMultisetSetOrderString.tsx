export const GenerateMultisetSetOrderString = (
  setListIdOrder: number[]
): string => {
  const setListOrderString = setListIdOrder.join(",");

  return setListOrderString;
};
