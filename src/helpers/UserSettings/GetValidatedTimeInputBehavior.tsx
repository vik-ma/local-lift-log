import { UserSettings } from "../../typings";
import { TimeInputMap, ValidTimeInputBehaviors } from "..";

export const GetValidatedTimeInputBehavior = (userSettings: UserSettings) => {
  const timeInputMap = TimeInputMap();

  const validTimeInputBehaviorsHhmmss = ValidTimeInputBehaviors(true);

  const validTimeInputBehaviorsMmss = ValidTimeInputBehaviors(false);

  if (!timeInputMap.has(userSettings.default_time_input))
    userSettings.default_time_input = timeInputMap.keys().next().value!;

  if (
    !validTimeInputBehaviorsHhmmss.has(userSettings.time_input_behavior_hhmmss)
  )
    userSettings.time_input_behavior_hhmmss = validTimeInputBehaviorsHhmmss
      .keys()
      .next().value!;

  if (!validTimeInputBehaviorsMmss.has(userSettings.time_input_behavior_mmss))
    userSettings.time_input_behavior_mmss = validTimeInputBehaviorsMmss
      .keys()
      .next().value!;
};
