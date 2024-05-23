export const ValidTimeInputBehaviors = (isHhmmss: boolean): string[] => {
  const VALID_TIME_INPUT_BEHAVIORS: string[] = [
    "first",
    "second",
    "third",
    "never",
  ];

  if (isHhmmss) {
    // Don't include "third" option for HH:MM:SS
    VALID_TIME_INPUT_BEHAVIORS.splice(2, 1);
  }

  Object.freeze(VALID_TIME_INPUT_BEHAVIORS);

  return VALID_TIME_INPUT_BEHAVIORS;
};
