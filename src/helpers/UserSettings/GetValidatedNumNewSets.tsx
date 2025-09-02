export const GetValidatedNumNewSets = (
  num_new_sets: string,
  numSetsOptions: Readonly<string[]>
) => {
  if (numSetsOptions.includes(num_new_sets))
    return num_new_sets;

  return "3";
};
