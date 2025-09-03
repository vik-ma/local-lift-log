import { useMemo, useRef, useState } from "react";
import {
  CreateActiveMeasurementInputs,
  GenerateActiveMeasurementString,
  GenerateBodyFatCalculationSettingsString,
  UpdateUserSetting,
} from "../helpers";
import {
  Measurement,
  MeasurementMap,
  UseBodyMeasurementsSettingsReturnType,
  UserSettings,
} from "../typings";
import toast from "react-hot-toast";
import { useDisclosure } from "@heroui/react";
import { BODY_FAT_CALCULATION_AGE_GROUPS } from "../constants";

type UseBodyMeasurementsSettingsProps = {
  userSettings: UserSettings | undefined;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
};

export const useBodyMeasurementsSettings = ({
  userSettings,
  setUserSettings,
}: UseBodyMeasurementsSettingsProps): UseBodyMeasurementsSettingsReturnType => {
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

    if (BODY_FAT_CALCULATION_AGE_GROUPS.has(stats[1])) {
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

  const loadBodyMeasurementsSettings = (
    userSettings: UserSettings,
    measurementMap: MeasurementMap
  ) => {
    setWeightUnit(userSettings.default_unit_weight);

    loadBodyFatCalculationSettingsString(
      userSettings.body_fat_calculation_settings,
      measurementMap
    );

    const activeMeasurements = CreateActiveMeasurementInputs(
      userSettings.active_tracking_measurements,
      measurementMap
    );

    setActiveMeasurements(activeMeasurements);
    activeMeasurementsValue.current = activeMeasurements;
  };

  return {
    weightUnit,
    setWeightUnit,
    activeMeasurementsValue,
    activeMeasurements,
    setActiveMeasurements,
    updateActiveTrackingMeasurementOrder,
    isMale,
    setIsMale,
    ageGroup,
    setAgeGroup,
    bodyFatMeasurementList,
    setBodyFatMeasurementList,
    bodyFatCalculationModal,
    bodyFatMeasurementsMap,
    isBodyFatMeasurementListInvalid,
    saveBodyFatCalculationSettingsString,
    validBodyFatInputs,
    loadBodyMeasurementsSettings,
  };
};
