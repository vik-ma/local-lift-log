export const ValidTimePeriodPropertiesMap = () => {
  const VALID_TIME_PERIOD_PROPERTIES_MAP: Map<string, string> = new Map<
    string,
    string
  >();

  VALID_TIME_PERIOD_PROPERTIES_MAP.set("caloric-intake", "Caloric Intake");
  VALID_TIME_PERIOD_PROPERTIES_MAP.set("injury", "Injury");
  VALID_TIME_PERIOD_PROPERTIES_MAP.set("note", "Note");

  Object.freeze(VALID_TIME_PERIOD_PROPERTIES_MAP);
  return VALID_TIME_PERIOD_PROPERTIES_MAP;
};
