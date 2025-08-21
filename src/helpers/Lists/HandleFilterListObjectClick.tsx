export const HandleFilterListObjectClick = <T extends { id: number }>(
  item: T,
  filterList: Set<number>,
  setFilterList: React.Dispatch<React.SetStateAction<Set<number>>>
) => {
  const updatedSet = new Set(filterList);

  if (updatedSet.has(item.id)) {
    updatedSet.delete(item.id);
  } else {
    updatedSet.add(item.id);
  }

  setFilterList(updatedSet);
};
