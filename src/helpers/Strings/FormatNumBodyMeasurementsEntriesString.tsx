export const FormatNumBodyMeasurementsEntriesString = (
  num: number | undefined
) => {
  if (num === 1) return "1 Measurement Recorded";

  if (num && num > 0 && num !== Infinity) return `${num} Measurements Recorded`;

  return "0 Measurements Recorded";
};
