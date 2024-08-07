export const FormatSetsCompletedString = (num: number | undefined): string => {
  if (num === 1) return "1 Set Completed";

  if (num && num > 0 && num !== Infinity) return `${num} Sets Completed`;

  return "0 Sets Completed";
};
