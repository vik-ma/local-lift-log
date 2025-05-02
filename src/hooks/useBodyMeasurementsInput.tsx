import { useMemo, useRef, useState } from "react";
import {
  ConvertBodyMeasurementsValuesToMeasurementInputs,
  CreateActiveMeasurementInputs,
  GenerateActiveMeasurementString,
  IsNumberValidPercentage,
  IsStringEmpty,
  IsStringInvalidNumberOr0,
  UpdateUserSetting,
} from "../helpers";
import {
  BodyMeasurements,
  Measurement,
  MeasurementMap,
  UseBodyMeasurementsInputReturnType,
  UserSettings,
} from "../typings";

export const useBodyMeasurementsInput = (
  userSettings: UserSettings | undefined,
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >
): UseBodyMeasurementsInputReturnType => {
  const [weightInput, setWeightInput] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<string>("kg");
  const [commentInput, setCommentInput] = useState<string>("");
  const [bodyFatPercentageInput, setBodyFatPercentageInput] =
    useState<string>("");
  const [invalidMeasurementInputs, setInvalidMeasurementInputs] = useState<
    Set<number>
  >(new Set<number>());
  const [activeMeasurements, setActiveMeasurements] = useState<Measurement[]>(
    []
  );

  const activeMeasurementsValue = useRef<Measurement[]>([]);

  const isWeightInputValid = useMemo(() => {
    if (IsStringEmpty(weightInput)) return true;
    if (IsStringInvalidNumberOr0(weightInput)) return false;

    return true;
  }, [weightInput]);

  const isBodyFatPercentageInputValid = useMemo(() => {
    if (IsStringEmpty(bodyFatPercentageInput)) return true;
    if (IsStringInvalidNumberOr0(bodyFatPercentageInput)) return false;
    if (!IsNumberValidPercentage(Number(bodyFatPercentageInput), false))
      return false;

    return true;
  }, [bodyFatPercentageInput]);

  const areActiveMeasurementsInputsEmpty = useMemo(() => {
    let isEmpty = true;

    let i = 0;
    while (isEmpty && i < activeMeasurements.length) {
      if (activeMeasurements[i].input!.trim().length !== 0) isEmpty = false;
      i++;
    }

    return isEmpty;
  }, [activeMeasurements]);

  const areBodyMeasurementsValid = useMemo(() => {
    if (!isWeightInputValid) return false;
    if (!isBodyFatPercentageInputValid) return false;
    if (invalidMeasurementInputs.size > 0) return false;
    if (
      IsStringEmpty(weightInput) &&
      IsStringEmpty(bodyFatPercentageInput) &&
      areActiveMeasurementsInputsEmpty
    )
      return false;

    return true;
  }, [
    isWeightInputValid,
    isBodyFatPercentageInputValid,
    invalidMeasurementInputs,
    weightInput,
    bodyFatPercentageInput,
    areActiveMeasurementsInputsEmpty,
  ]);

  const validateActiveMeasurementInput = (value: string, index: number) => {
    const updatedInvalidInputs = new Set(invalidMeasurementInputs);
    if (!IsStringEmpty(value) && IsStringInvalidNumberOr0(value)) {
      updatedInvalidInputs.add(index);
    } else {
      updatedInvalidInputs.delete(index);
    }

    setInvalidMeasurementInputs(updatedInvalidInputs);
  };

  const handleActiveMeasurementInputChange = (value: string, index: number) => {
    const updatedInputs = [...activeMeasurements];
    updatedInputs[index] = { ...updatedInputs[index], input: value };
    setActiveMeasurements(updatedInputs);
    validateActiveMeasurementInput(value, index);
  };

  const resetBodyMeasurementsInput = () => {
    setWeightInput("");
    setCommentInput("");
    setBodyFatPercentageInput("");

    const updatedInputs = activeMeasurementsValue.current.map(
      (measurement) => ({
        ...measurement,
        input: "",
      })
    );

    setActiveMeasurements(updatedInputs);
  };

  const loadBodyMeasurementsInputs = (
    bodyMeasurements: BodyMeasurements,
    measurementMap: MeasurementMap
  ) => {
    if (bodyMeasurements.bodyMeasurementsValues === undefined) return;

    setWeightInput(
      bodyMeasurements.weight === 0 ? "" : bodyMeasurements.weight.toString()
    );
    setCommentInput(bodyMeasurements.comment ?? "");
    setBodyFatPercentageInput(
      bodyMeasurements.body_fat_percentage
        ? bodyMeasurements.body_fat_percentage.toString()
        : ""
    );
    setWeightUnit(bodyMeasurements.weight_unit);

    const activeMeasurements = ConvertBodyMeasurementsValuesToMeasurementInputs(
      bodyMeasurements.bodyMeasurementsValues,
      measurementMap
    );

    setActiveMeasurements(activeMeasurements);
  };

  const getActiveMeasurements = async (activeMeasurementsString: string) => {
    try {
      const activeMeasurements = await CreateActiveMeasurementInputs(
        activeMeasurementsString
      );

      setActiveMeasurements(activeMeasurements);
      activeMeasurementsValue.current = activeMeasurements;
    } catch (error) {
      console.log(error);
    }
  };

  const updateActiveTrackingMeasurementOrder = async () => {
    if (userSettings === undefined) return;

    const newActiveTrackingMeasurementIdList = activeMeasurements.map(
      (obj) => obj.id
    );

    const newActiveTrackingMeasurementString = GenerateActiveMeasurementString(
      newActiveTrackingMeasurementIdList
    );

    const success = await UpdateUserSetting(
      "active_tracking_measurements",
      newActiveTrackingMeasurementString,
      userSettings,
      setUserSettings
    );

    if (!success) return;

    activeMeasurementsValue.current = activeMeasurements;
  };

  return {
    weightInput,
    setWeightInput,
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
    handleActiveMeasurementInputChange,
    activeMeasurements,
    setActiveMeasurements,
    activeMeasurementsValue,
    getActiveMeasurements,
    updateActiveTrackingMeasurementOrder,
  };
};
