export const IsMetricUnit = (unit: string) => {
  return (
    unit === "kg" ||
    unit === "m" ||
    unit === "km" ||
    unit === "cm" ||
    unit === "mm"
  );
};
