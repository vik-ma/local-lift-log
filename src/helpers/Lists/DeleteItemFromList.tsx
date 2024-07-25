import { Identifiable } from "../../typings";

export const DeleteItemFromList = <T extends Identifiable>(
  list: T[],
  id: number | string
): T[] => list.filter((item) => item.id !== id);
