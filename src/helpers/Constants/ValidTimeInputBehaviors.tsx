type TimeInputType = "hhmmss" | "mmss";

export const ValidTimeInputBehaviors = (type: TimeInputType): string[] => {
  const VALID_TIME_INPUT_BEHAVIORS: string[] = [];

  if (type === "hhmmss") {
    VALID_TIME_INPUT_BEHAVIORS.push(
      "Automatically skip after first digit in hours"
    );
    VALID_TIME_INPUT_BEHAVIORS.push(
      "Automatically skip after second digit in hours"
    );
    VALID_TIME_INPUT_BEHAVIORS.push("Never automatically skip");
  }

  if (type === "mmss") {
    VALID_TIME_INPUT_BEHAVIORS.push(
      "Automatically skip after first digit in minutes"
    );
    VALID_TIME_INPUT_BEHAVIORS.push(
      "Automatically skip after second digit in minutes"
    );
    VALID_TIME_INPUT_BEHAVIORS.push(
      "Automatically skip after third digit in minutes"
    );
    VALID_TIME_INPUT_BEHAVIORS.push("Never automatically skip");
  }

  Object.freeze(VALID_TIME_INPUT_BEHAVIORS);

  return VALID_TIME_INPUT_BEHAVIORS;
};
