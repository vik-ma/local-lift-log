export const CreateMultisetIndexCutoffs = (setListIdList: number[][]) => {
  const indexCutoffs = new Map<number, number>();

  let startIndex = 0;

  for (let i = 0; i < setListIdList.length; i++) {
    indexCutoffs.set(startIndex, i + 1);
    startIndex += setListIdList[i].length;
  }

  return indexCutoffs;
};
