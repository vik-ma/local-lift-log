import {
  CalculationListItem,
  Distance,
  EquipmentWeight,
  PresetsType,
} from "../../typings";
import { IsCalculationStringValid, CreateNewCalculationItem } from "..";
import { CALCULATION_STRINGS_REGEX } from "../../constants";

const createCalculationItemNumber = (
  number: number,
  unit: string,
  multiplier: number
) => {
  const calculationItem = CreateNewCalculationItem(
    "number",
    unit,
    multiplier,
    number
  );

  return calculationItem;
};

const createCalculationItemEquipmentWeight = (
  presetId: number,
  unit: string,
  equipmentWeights: EquipmentWeight[],
  multiplier: number
) => {
  const equipment = equipmentWeights.find((item) => item.id === presetId);

  if (equipment !== undefined) {
    const calculationItem = CreateNewCalculationItem(
      "preset",
      unit,
      multiplier,
      undefined,
      undefined,
      equipment
    );

    return calculationItem;
  }
};

const createCalculationItemDistance = (
  presetId: number,
  unit: string,
  distances: Distance[],
  multiplier: number
) => {
  const distance = distances.find((item) => item.id === presetId);

  if (distance !== undefined) {
    const calculationItem = CreateNewCalculationItem(
      "preset",
      unit,
      multiplier,
      undefined,
      undefined,
      undefined,
      distance
    );

    return calculationItem;
  }
};

const createCalculationItemCalculation = (
  calculationString: string,
  unit: string,
  multiplier: number
) => {
  const { isCalculationValid, result } =
    IsCalculationStringValid(calculationString);

  if (!isCalculationValid) return;

  const calculationItem = CreateNewCalculationItem(
    "calculation",
    unit,
    multiplier,
    result,
    calculationString
  );

  return calculationItem;
};

type LoadCalculationStringReturnType = {
  calculationList: CalculationListItem[];
  totalMultiplier: number;
};

export const LoadCalculationString = (
  calculationString: string,
  unit: string,
  presetsType: PresetsType,
  equipmentWeights: EquipmentWeight[],
  distances: Distance[]
): LoadCalculationStringReturnType => {
  // Split Equipment Weight calculation string with Distance
  // calculation strings, if calculation string contains both
  const calculationStrings = calculationString.split("/");

  const calculationList: CalculationListItem[] = [];

  let totalMultiplier = 1;

  if (calculationStrings.length === 0)
    return { calculationList, totalMultiplier };

  // Calculation strings must be of format "e[**]/d[**]", e[**] or d[**]
  const { regexEquipment, regexDistance } = CALCULATION_STRINGS_REGEX;

  // Number values must be of format "n**", where ** is a valid number above 0
  const regexNumber =
    /^n(\d+(\.\d{1,2})?)x([1-9]\d*(?:\.\d{1,2})?|0\.\d{1,2})$/;
  // Preset values must be of format "p**", where ** is a valid integer above 0
  const regexPreset = /^p([1-9]\d*)x([1-9]\d*(?:\.\d{1,2})?|0\.\d{1,2})$/;
  // Calculation values must be of format "c(**)", where ** is a valid calculation string
  const regexCalc = /^c\((.*)\)x([1-9]\d*(?:\.\d{1,2})?|0\.\d{1,2})$/;

  for (const string of calculationStrings) {
    const equipmentMatch = string.match(regexEquipment);
    const distanceMatch = string.match(regexDistance);

    const isValidEquipmentString =
      presetsType === "equipment" && equipmentMatch;
    const isValidDistanceString = presetsType === "distance" && distanceMatch;

    // Extract text from inside calculation string brackets (e[**] or d[**])
    const calculationListString = isValidEquipmentString
      ? equipmentMatch[1]
      : isValidDistanceString
      ? distanceMatch[1]
      : undefined;

    // Do nothing if calculation string is invalid
    if (calculationListString === undefined) continue;

    if (equipmentMatch && equipmentMatch[2]) {
      totalMultiplier = parseFloat(equipmentMatch[2]);
    }

    const calculationItems = calculationListString.split(",");

    // Loop through every item in the string
    for (const item of calculationItems) {
      // Check if itemType is number

      const numberMatch = item.match(regexNumber);

      if (numberMatch && numberMatch[1] && numberMatch[3]) {
        const number = parseFloat(numberMatch[1]);
        const multiplier = parseFloat(numberMatch[3]);

        const calculationItem = createCalculationItemNumber(
          number,
          unit,
          multiplier
        );

        if (calculationItem !== undefined) {
          calculationList.push(calculationItem);
          continue;
        }
      }

      // Check if itemType is preset
      const presetMatch = item.match(regexPreset);

      if (presetMatch && presetMatch[1] && presetMatch[2]) {
        const presetId = parseInt(presetMatch[1]);
        const multiplier = parseFloat(presetMatch[2]);

        if (presetsType === "equipment") {
          const calculationItem = createCalculationItemEquipmentWeight(
            presetId,
            unit,
            equipmentWeights,
            multiplier
          );

          if (calculationItem !== undefined) {
            calculationList.push(calculationItem);
            continue;
          }
        }

        if (presetsType === "distance") {
          const calculationItem = createCalculationItemDistance(
            presetId,
            unit,
            distances,
            multiplier
          );

          if (calculationItem !== undefined) {
            calculationList.push(calculationItem);
            continue;
          }
        }
      }

      // Check if itemType is calculation
      const calcMatch = item.match(regexCalc);

      if (calcMatch && calcMatch[1] && calcMatch[2]) {
        const multiplier = parseFloat(calcMatch[2]);

        const calculationItem = createCalculationItemCalculation(
          calcMatch[1],
          unit,
          multiplier
        );

        if (calculationItem !== undefined) {
          calculationList.push(calculationItem);
        }
      }
    }
  }

  return { calculationList, totalMultiplier };
};
