export const ReplaceMultisetSetOrderStringIds = (
  oldSetOrderString: string,
  idReplacementMap: Map<string, string>
) => {
  const newSetOrderString = oldSetOrderString
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

  return newSetOrderString;
};
