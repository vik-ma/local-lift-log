export const ReplaceNumberIn2DList = (
  numToReplace: number,
  newNum: number,
  numberListList: number[][]
) => {
  for (const list of numberListList) {
    const index = list.findIndex((num) => num === numToReplace);
    if (index !== -1) {
      list[index] = newNum;
      break;
    }
  }
};
