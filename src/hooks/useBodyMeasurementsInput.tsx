import { useMemo, useState } from "react";
import {
  IsNumberValidPercentage,
  IsStringEmpty,
  IsStringInvalidNumber,
  IsStringInvalidNumberOr0,
} from "../helpers";
import {
  BodyMeasurements,
  Measurement,
  UseBodyMeasurementsInputReturnType,
} from "../typings";

export const useBodyMeasurementsInput = (
  activeMeasurements: Measurement[],
  setActiveMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>
): UseBodyMeasurementsInputReturnType => {
  const [userWeightInput, setUserWeightInput] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<string>("kg");
  const [commentInput, setCommentInput] = useState<string>("");
  const [bodyFatPercentageInput, setBodyFatPercentageInput] =
    useState<string>("");
  const [invalidMeasurementInputs, setInvalidMeasurementInputs] = useState<
    Set<number>
  >(new Set<number>());

  const isWeightInputValid = useMemo(() => {
    if (IsStringEmpty(userWeightInput)) return true;
    if (IsStringInvalidNumber(userWeightInput)) return false;

    return true;
  }, [userWeightInput]);

  const isBodyFatPercentageInputValid = useMemo(() => {
    if (IsStringEmpty(bodyFatPercentageInput)) return true;
    if (IsStringInvalidNumber(bodyFatPercentageInput)) return false;
    if (!IsNumberValidPercentage(Number(bodyFatPercentageInput), false))
      return false;

    return true;
  }, [bodyFatPercentageInput]);

  const areBodyMeasurementsValid = useMemo(() => {
    if (!isWeightInputValid) return false;
    if (!isBodyFatPercentageInputValid) return false;
    return true;
  }, [isWeightInputValid, isBodyFatPercentageInputValid]);

  const areActiveMeasurementsInputsEmpty = useMemo(() => {
    let isEmpty: boolean = true;

    let i = 0;
    while (isEmpty && i < activeMeasurements.length) {
      if (activeMeasurements[i].input!.trim().length !== 0) isEmpty = false;
      i++;
    }

    return isEmpty;
  }, [activeMeasurements]);

  const validateActiveMeasurementInput = (value: string, index: number) => {
    const updatedSet = new Set(invalidMeasurementInputs);
    if (IsStringInvalidNumberOr0(value)) {
      updatedSet.add(index);
    } else {
      updatedSet.delete(index);
    }

    setInvalidMeasurementInputs(updatedSet);
  };

  // TODO: REMOVE?
  const areActiveMeasurementsValid = useMemo(() => {
    if (
      activeMeasurements.length < 1 ||
      invalidMeasurementInputs.size > 0 ||
      areActiveMeasurementsInputsEmpty
    )
      return false;
    return true;
  }, [
    activeMeasurements,
    invalidMeasurementInputs,
    areActiveMeasurementsInputsEmpty,
  ]);

  const handleActiveMeasurementInputChange = (value: string, index: number) => {
    const updatedInputs = [...activeMeasurements];
    updatedInputs[index] = { ...updatedInputs[index], input: value };
    setActiveMeasurements(updatedInputs);
    validateActiveMeasurementInput(value, index);
  };

  const resetBodyMeasurementsInput = () => {
    // TODO:FIX
    setUserWeightInput("");
    setCommentInput("");
    setBodyFatPercentageInput("");
  };

  const loadBodyMeasurementsInputs = (bodyMeasurements: BodyMeasurements) => {
    // TODO: FIX
    // setUserWeightInput(userWeight.weight.toString());
    // setCommentInput(userWeight.comment ?? "");
    // setBodyFatPercentageInput(
    //   userWeight.body_fat_percentage
    //     ? userWeight.body_fat_percentage.toString()
    //     : ""
    // );
    // setWeightUnit(userWeight.weight_unit);
  };

  return {
    userWeightInput,
    setUserWeightInput,
    weightUnit,
    setWeightUnit,
    commentInput,
    setCommentInput,
    bodyFatPercentageInput,
    setBodyFatPercentageInput,
    isWeightInputValid,
    isBodyFatPercentageInputValid,
    areBodyMeasurementsValid,
    resetBodyMeasurementsInput,
    loadBodyMeasurementsInputs,
    invalidMeasurementInputs,
    areActiveMeasurementsValid,
    handleActiveMeasurementInputChange,
  };
};
