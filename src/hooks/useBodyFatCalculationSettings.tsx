import { useState } from "react";
import {
  Measurement,
  MeasurementMap,
  UseBodyFatCalculationSettingsReturnType,
} from "../typings";
import { BodyFatCalculationAgeGroups } from "../helpers";
import { useDisclosure } from "@heroui/react";

export const useBodyFatCalculationSettings =
  (): UseBodyFatCalculationSettingsReturnType => {
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

    return {
      isMale,
      setIsMale,
      ageGroup,
      setAgeGroup,
      measurementList,
      bodyFatCalculationModal,
      loadBodyFatCalculationSettingsString,
    };
  };
