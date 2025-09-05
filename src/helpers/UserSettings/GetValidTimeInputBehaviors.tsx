export const GetValidTimeInputBehaviors = (isHhmmss: boolean) => {
  const timeType = isHhmmss ? "hours" : "minutes";

  const VALID_TIME_INPUT_BEHAVIORS = new Map([
    ["first", `Hop after first digit in ${timeType}`],
    ["second", `Hop after second digit in ${timeType}`],
    ["third", `Hop after third digit in ${timeType}`],
    ["never", "Never Hop"],
  ]);

  if (isHhmmss) {
    // Don't include "third" option for HH:MM:SS
    VALID_TIME_INPUT_BEHAVIORS.delete("third");
  }

  Object.freeze(VALID_TIME_INPUT_BEHAVIORS);

  return VALID_TIME_INPUT_BEHAVIORS;
};
