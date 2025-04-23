export const GetValidatedNumNewSets = (
  default_num_new_sets: string,
  numSetsOptions: string[]
) => {
  if (numSetsOptions.includes(default_num_new_sets))
    return default_num_new_sets;

  return "3";
};
