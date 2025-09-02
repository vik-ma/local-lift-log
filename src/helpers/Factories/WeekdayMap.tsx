export const WeekdayMap = () => {
  const WEEKDAY_MAP = new Map<string, string>();
  WEEKDAY_MAP.set("1", "Monday");
  WEEKDAY_MAP.set("2", "Tuesday");
  WEEKDAY_MAP.set("3", "Wednesday");
  WEEKDAY_MAP.set("4", "Thursday");
  WEEKDAY_MAP.set("5", "Friday");
  WEEKDAY_MAP.set("6", "Saturday");
  WEEKDAY_MAP.set("0", "Sunday");

  Object.freeze(WEEKDAY_MAP);

  return WEEKDAY_MAP;
};
