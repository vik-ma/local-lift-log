export const FormatNumItemsString = (
  num: number | undefined,
  name: string
): string => {
  if (num === 1) return `1 ${name}`;

  if (num && num > 0 && num !== Infinity) return `${num} ${name}s`;

  return `0 ${name}`;
};
