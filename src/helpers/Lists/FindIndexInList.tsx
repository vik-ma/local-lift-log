import { Identifiable } from "../../typings";

export const FindIndexInList = <T extends Identifiable>(
  list: T[],
  idToFind: number | string
): number => list.findIndex((obj) => obj.id === idToFind);
