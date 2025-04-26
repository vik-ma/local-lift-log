import { useMemo, useRef, useState } from "react";
import {
  ConvertUserMeasurementValuesToMeasurementInputs,
  IsNumberValidPercentage,
  IsStringEmpty,
  IsStringInvalidNumberOr0,
} from "../helpers";
import {
  BodyMeasurements,
  Measurement,
  MeasurementMap,
  UseBodyMeasurementsInputReturnType,
} from "../typings";

export const useBodyMeasurementsInput =
  (): UseBodyMeasurementsInputReturnType => {
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

    const handleActiveMeasurementInputChange = (
      value: string,
      index: number
    ) => {
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
      if (bodyMeasurements.userMeasurementValues === undefined) return;

      setWeightInput(bodyMeasurements.weight.toString());
      setCommentInput(bodyMeasurements.comment ?? "");
      setBodyFatPercentageInput(
        bodyMeasurements.body_fat_percentage
          ? bodyMeasurements.body_fat_percentage.toString()
          : ""
      );
      setWeightUnit(bodyMeasurements.weight_unit);

      const activeMeasurements =
        ConvertUserMeasurementValuesToMeasurementInputs(
          bodyMeasurements.userMeasurementValues,
          measurementMap
        );

      setActiveMeasurements(activeMeasurements);
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
      areActiveMeasurementsValid,
      handleActiveMeasurementInputChange,
      activeMeasurements,
      setActiveMeasurements,
      activeMeasurementsValue,
    };
  };
