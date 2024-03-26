import {
  SetTrackingValuesNumbers,
  SetTrackingValuesInput,
} from "../../typings";
import { ConvertNumberToTwoDecimals } from "..";

export const ConvertSetInputValuesToNumbers = (
  setTrackingValuesInput: SetTrackingValuesInput
): SetTrackingValuesNumbers => {
  const setTrackingValuesNumber: SetTrackingValuesNumbers = {
    weight:
      setTrackingValuesInput.weight.trim().length === 0
        ? 0
        : ConvertNumberToTwoDecimals(Number(setTrackingValuesInput.weight)),
    reps:
      setTrackingValuesInput.reps.trim().length === 0
        ? 0
        : Number(setTrackingValuesInput.reps),
    rir:
      setTrackingValuesInput.rir.trim().length === 0
        ? 0
        : Number(setTrackingValuesInput.rir),
    rpe:
      setTrackingValuesInput.rpe.trim().length === 0
        ? 0
        : Number(setTrackingValuesInput.rpe),
    distance:
      setTrackingValuesInput.distance.trim().length === 0
        ? 0
        : ConvertNumberToTwoDecimals(Number(setTrackingValuesInput.distance)),
    resistance_level:
      setTrackingValuesInput.resistance_level.trim().length === 0
        ? 0
        : ConvertNumberToTwoDecimals(
            Number(setTrackingValuesInput.resistance_level)
          ),
  };
  return setTrackingValuesNumber;
};
