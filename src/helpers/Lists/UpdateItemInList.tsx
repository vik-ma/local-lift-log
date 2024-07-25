import { Identifiable } from "../../typings";

export const UpdateItemInList = <T extends Identifiable>(
  list: T[],
  updatedItem: T
): T[] => list.map((item) => (item.id === updatedItem.id ? updatedItem : item));
