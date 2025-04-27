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

      const activeMeasurements =
        ConvertUserMeasurementValuesToMeasurementInputs(
          bodyMeasurements.bodyMeasurementsValues,
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
      handleActiveMeasurementInputChange,
      activeMeasurements,
      setActiveMeasurements,
      activeMeasurementsValue,
    };
  };
