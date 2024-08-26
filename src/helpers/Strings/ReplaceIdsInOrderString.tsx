export const ReplaceIdsInOrderString = (
  oldOrderString: string,
  idReplacementMap: Map<string, string>
) => {
  // Works with Workout/Workout Template exercise_order and Multiset set_order strings
  const newOrderString = oldOrderString
    .split(",")
    .map((component) => {
      return component
        .split("-")
        .map((oldId) => {
          // Replace old Id with new Id if it has an entry in the map
          return idReplacementMap.has(oldId)
            ? idReplacementMap.get(oldId)
            : oldId;
        })
        .join("-");
    })
    .join(",");

  return newOrderString;
};
