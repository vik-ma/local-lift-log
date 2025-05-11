import { useMemo, useRef, useState } from "react";
import {
  BodyFatCalculationAgeGroups,
  CalculateBodyFatPercentage,
  ConvertBodyMeasurementsValuesToMeasurementInputs,
  CreateActiveMeasurementInputs,
  GenerateActiveMeasurementString,
  GenerateBodyFatCalculationSettingsString,
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
import toast from "react-hot-toast";
import { useDisclosure } from "@heroui/react";

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
  const [isMale, setIsMale] = useState<boolean>(true);
  const [ageGroup, setAgeGroup] = useState<string>("20-29");
  const [bodyFatMeasurementList, setBodyFatMeasurementList] = useState<
    (Measurement | undefined)[]
  >([undefined, undefined, undefined, undefined]);

  const activeMeasurementsValue = useRef<Measurement[]>([]);

  const validBodyFatInputs = useRef<Set<number>>(new Set());

  const bodyFatCalculationModal = useDisclosure();

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

  const validateBodyFatMeasurementInput = (value: string, id: number) => {
    if (!bodyFatMeasurementsMap.has(id)) return;

    if (IsStringInvalidNumberOr0(value)) {
      validBodyFatInputs.current.delete(id);
    } else {
      validBodyFatInputs.current.add(id);
    }
  };

  const handleActiveMeasurementInputChange = (value: string, index: number) => {
    const updatedInputs = [...activeMeasurements];
    updatedInputs[index] = { ...updatedInputs[index], input: value };
    setActiveMeasurements(updatedInputs);
    validateActiveMeasurementInput(value, index);
    validateBodyFatMeasurementInput(value, updatedInputs[index].id);
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

    const { updatedActiveMeasurements, updatedValidBodyFatInputs } =
      ConvertBodyMeasurementsValuesToMeasurementInputs(
        bodyMeasurements.bodyMeasurementsValues,
        measurementMap,
        bodyFatMeasurementsMap
      );

    setActiveMeasurements(updatedActiveMeasurements);
    validBodyFatInputs.current = updatedValidBodyFatInputs;
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

  const loadBodyFatCalculationSettingsString = (
    bodyFatCalculationSettingsString: string,
    measurementMap: MeasurementMap
  ) => {
    const stats = bodyFatCalculationSettingsString.split("/");

    if (stats.length !== 3) return;

    setIsMale(stats[0] === "male");

    const validAgeGroups = BodyFatCalculationAgeGroups();

    if (validAgeGroups.has(stats[1])) {
      setAgeGroup(stats[1]);
    }

    const measurementIds = stats[2].split(",");

    if (measurementIds.length === 0) return;

    const updatedMeasurementIds = [...bodyFatMeasurementList];

    const seenMeasurementIds = new Set<string>();

    // 1. Biceps, 2. Triceps, 3. Subscapular, 4. Suprailiac
    for (let i = 0; i < 4; i++) {
      const measurementId = measurementIds[i];

      if (
        measurementId !== undefined &&
        measurementMap.has(measurementId) &&
        !seenMeasurementIds.has(measurementId)
      ) {
        updatedMeasurementIds[i] = measurementMap.get(measurementId);
        seenMeasurementIds.add(measurementId);
      }
    }

    setBodyFatMeasurementList(updatedMeasurementIds);
  };

  const { bodyFatMeasurementsMap, isBodyFatMeasurementListInvalid } =
    useMemo(() => {
      const bodyFatMeasurementsMap = new Map<number, Measurement>();
      let isBodyFatMeasurementListInvalid = false;

      for (const measurement of bodyFatMeasurementList) {
        if (measurement !== undefined) {
          bodyFatMeasurementsMap.set(measurement.id, measurement);
        } else {
          isBodyFatMeasurementListInvalid = true;
        }
      }

      return {
        bodyFatMeasurementsMap,
        isBodyFatMeasurementListInvalid,
      };
    }, [bodyFatMeasurementList]);

  const saveBodyFatCalculationSettingsString = async () => {
    if (userSettings === undefined) return;

    const bodyFatCalculationSettingsString =
      GenerateBodyFatCalculationSettingsString(
        isMale,
        ageGroup,
        bodyFatMeasurementList
      );

    const success = UpdateUserSetting(
      "body_fat_calculation_settings",
      bodyFatCalculationSettingsString,
      userSettings,
      setUserSettings
    );

    if (!success) return;

    bodyFatCalculationModal.onClose();
    toast.success("Settings Updated");
  };

  const calculateBodyFatPercentage = () => {
    if (validBodyFatInputs.current.size !== 4) return;

    const measurementInputs: string[] = [];

    for (const measurement of activeMeasurements) {
      if (validBodyFatInputs.current.has(measurement.id)) {
        measurementInputs.push(measurement.input!);
      }
    }

    const bodyFatPercentage = CalculateBodyFatPercentage(
      isMale,
      ageGroup,
      measurementInputs
    );

    setBodyFatPercentageInput(bodyFatPercentage.toString());
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
    getActiveMeasurements,
    updateActiveTrackingMeasurementOrder,
    isMale,
    setIsMale,
    ageGroup,
    setAgeGroup,
    bodyFatMeasurementList,
    setBodyFatMeasurementList,
    bodyFatCalculationModal,
    loadBodyFatCalculationSettingsString,
    bodyFatMeasurementsMap,
    isBodyFatMeasurementListInvalid,
    saveBodyFatCalculationSettingsString,
    validBodyFatInputs,
    calculateBodyFatPercentage,
  };
};
