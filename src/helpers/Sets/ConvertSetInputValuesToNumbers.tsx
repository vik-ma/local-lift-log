import {
  SetTrackingValuesNumbers,
  SetTrackingValuesInput,
} from "../../typings";
import { ConvertNumberToTwoDecimals, IsStringEmpty } from "..";

export const ConvertSetInputValuesToNumbers = (
  setTrackingValuesInput: SetTrackingValuesInput
): SetTrackingValuesNumbers => {
  const setTrackingValuesNumber: SetTrackingValuesNumbers = {
    weight: IsStringEmpty(setTrackingValuesInput.weight)
      ? 0
      : ConvertNumberToTwoDecimals(Number(setTrackingValuesInput.weight)),
    reps: IsStringEmpty(setTrackingValuesInput.reps)
      ? 0
      : Number(setTrackingValuesInput.reps),
    rir: IsStringEmpty(setTrackingValuesInput.rir)
      ? -1
      : Number(setTrackingValuesInput.rir),
    rpe: IsStringEmpty(setTrackingValuesInput.rpe)
      ? 0
      : Number(setTrackingValuesInput.rpe),
    distance: IsStringEmpty(setTrackingValuesInput.distance)
      ? 0
      : ConvertNumberToTwoDecimals(Number(setTrackingValuesInput.distance)),
    resistance_level: IsStringEmpty(setTrackingValuesInput.resistance_level)
      ? 0
      : ConvertNumberToTwoDecimals(
          Number(setTrackingValuesInput.resistance_level)
        ),
    partial_reps: IsStringEmpty(setTrackingValuesInput.partial_reps)
      ? 0
      : Number(setTrackingValuesInput.partial_reps),
    user_weight: IsStringEmpty(setTrackingValuesInput.user_weight)
      ? 0
      : Number(setTrackingValuesInput.user_weight),
  };
  return setTrackingValuesNumber;
};
