import { useMemo, useRef, useState } from "react";
import {
  BodyFatCalculationAgeGroups,
  CreateActiveMeasurementInputs,
  GenerateActiveMeasurementString,
  GenerateBodyFatCalculationSettingsString,
  UpdateUserSetting,
} from "../helpers";
import {
  Measurement,
  MeasurementMap,
  UseActiveMeasurementsReturnType,
  UserSettings,
} from "../typings";
import toast from "react-hot-toast";
import { useDisclosure } from "@heroui/react";

export const useActiveMeasurements = (
  userSettings: UserSettings | undefined,
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >
): UseActiveMeasurementsReturnType => {
  const [activeMeasurements, setActiveMeasurements] = useState<Measurement[]>(
    []
  );
  const [weightUnit, setWeightUnit] = useState<string>("kg");
  const [isMale, setIsMale] = useState<boolean>(true);
  const [ageGroup, setAgeGroup] = useState<string>("20-29");
  const [bodyFatMeasurementList, setBodyFatMeasurementList] = useState<
    (Measurement | undefined)[]
  >([undefined, undefined, undefined, undefined]);

  const activeMeasurementsValue = useRef<Measurement[]>([]);

  const validBodyFatInputs = useRef<Set<number>>(new Set());

  const bodyFatCalculationModal = useDisclosure();

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

  return {
    weightUnit,
    setWeightUnit,
    activeMeasurementsValue,
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
  };
};
