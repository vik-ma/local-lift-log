type TimeInputBehaviorType = {
  key: string;
  label: string;
};

export const ValidTimeInputBehaviors = (
  isHhmmss: boolean
): TimeInputBehaviorType[] => {
  const timeType = isHhmmss ? "hours" : "minutes";

  const VALID_TIME_INPUT_BEHAVIORS: TimeInputBehaviorType[] = [
    {
      key: "first",
      label: `Hop after first digit in ${timeType}`,
    },
    {
      key: "second",
      label: `Hop after second digit in ${timeType}`,
    },
    {
      key: "third",
      label: `Hop after third digit in ${timeType}`,
    },
    { key: "never", label: "Never Hop" },
  ];

  if (isHhmmss) {
    // Don't include "third" option for HH:MM:SS
    VALID_TIME_INPUT_BEHAVIORS.splice(2, 1);
  }

  Object.freeze(VALID_TIME_INPUT_BEHAVIORS);

  return VALID_TIME_INPUT_BEHAVIORS;
};
