export const GenerateMultisetSetOrderString = (
  setListIdOrder: number[][]
): string => {
  const setListOrderStringList: string[] = [];

  for (const setList of setListIdOrder) {
    const setListOrderString = setList.join(",");

    setListOrderStringList.push(setListOrderString);
  }

  const setListOrderString = setListOrderStringList.join("-");

  return setListOrderString;
};
