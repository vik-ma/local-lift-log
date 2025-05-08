import { useMemo, useState } from "react";
import {
  Measurement,
  MeasurementMap,
  UseBodyFatCalculationSettingsReturnType,
  UserSettings,
} from "../typings";
import {
  BodyFatCalculationAgeGroups,
  GenerateBodyFatCalculationSettingsString,
  UpdateUserSetting,
} from "../helpers";
import { useDisclosure } from "@heroui/react";
import toast from "react-hot-toast";

export const useBodyFatCalculationSettings = (
  userSettings: UserSettings | undefined,
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >
): UseBodyFatCalculationSettingsReturnType => {
  const [isMale, setIsMale] = useState<boolean>(true);
  const [ageGroup, setAgeGroup] = useState<string>("20-29");
  const [measurementList, setMeasurementList] = useState<
    (Measurement | undefined)[]
  >([undefined, undefined, undefined, undefined]);

  const bodyFatCalculationModal = useDisclosure();

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

    const updatedMeasurementIds = [...measurementList];

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

    setMeasurementList(updatedMeasurementIds);
  };

  const { bodyFatCalculationMeasurements, isMeasurementListInvalid } = useMemo(() => {
    const bodyFatCalculationMeasurements = new Map<number, Measurement>();
    let isMeasurementListInvalid = false;

    for (const measurement of measurementList) {
      if (measurement !== undefined) {
        bodyFatCalculationMeasurements.set(measurement.id, measurement);
      } else {
        isMeasurementListInvalid = true;
      }
    }

    return { bodyFatCalculationMeasurements, isMeasurementListInvalid };
  }, [measurementList]);

  const saveBodyFatCalculationSettingsString = async () => {
    if (userSettings === undefined) return;

    const bodyFatCalculationSettingsString =
      GenerateBodyFatCalculationSettingsString(
        isMale,
        ageGroup,
        measurementList
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
    isMale,
    setIsMale,
    ageGroup,
    setAgeGroup,
    measurementList,
    setMeasurementList,
    bodyFatCalculationModal,
    loadBodyFatCalculationSettingsString,
    bodyFatCalculationMeasurements,
    isMeasurementListInvalid,
    saveBodyFatCalculationSettingsString,
  };
};
