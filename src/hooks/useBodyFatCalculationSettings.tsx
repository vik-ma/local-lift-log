import { useState } from "react";
import {
  MeasurementMap,
  UseBodyFatCalculationSettingsReturnType,
} from "../typings";

export const useBodyFatCalculationSettings =
  (): UseBodyFatCalculationSettingsReturnType => {
    const [isMale, setIsMale] = useState<boolean>(true);
    const [ageGroup, setAgeGroup] = useState<string>("20-29");
    const [measurementIdList, setMeasurementIdList] = useState<number[]>([
      0, 0, 0, 0,
    ]);

    const loadBodyFatCalculationSettingsString = (
      bodyFatCalculationSettingsString: string,
      measurementMap: MeasurementMap
    ) => {
      const stats = bodyFatCalculationSettingsString.split("/");

      if (stats.length !== 3) return;

      setIsMale(stats[0] === "male");

      const validAgeGroups = new Set([
        "17-19",
        "20-29",
        "30-39",
        "40-49",
        "50+",
      ]);

      if (validAgeGroups.has(stats[1])) {
        setAgeGroup(stats[0]);
      }

      const measurementIds = stats[2].split(",");

      if (measurementIds.length === 0) return;

      const updatedMeasurementIds = [...measurementIdList];

      // 1. Biceps, 2. Triceps, 3. Subscapular, 4. Suprailiac
      for (let i = 0; i < 4; i++) {
        const measurementId = measurementIds[i];

        if (measurementId !== undefined && measurementMap.has(measurementId)) {
          updatedMeasurementIds[i] = Number(measurementId);
        }
      }

      setMeasurementIdList(updatedMeasurementIds);
    };

    return {
      isMale,
      setIsMale,
      ageGroup,
      setAgeGroup,
      measurementIdList,
      loadBodyFatCalculationSettingsString,
    };
  };
