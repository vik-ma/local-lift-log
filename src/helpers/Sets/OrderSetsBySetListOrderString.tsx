import { WorkoutSet } from "../../typings";

export const OrderSetsBySetListOrderString = (
  setList: WorkoutSet[],
  setListOrderString: string
): WorkoutSet[] => {
  const sortedArray = setList.slice().sort((a, b) => {
    const idA = setListOrderString.indexOf(a.id.toString());
    const idB = setListOrderString.indexOf(b.id.toString());
    return idA - idB;
  });

  sortedArray.map((item) => console.log(item.id));

  return sortedArray;
};
