export const ShouldDietLogDisableExpansion = (
  fat: number | null,
  carbs: number | null,
  protein: number | null
) => {
  return fat === null && carbs === null && protein === null;
};
