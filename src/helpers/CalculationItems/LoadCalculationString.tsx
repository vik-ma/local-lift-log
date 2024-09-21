import {
  CalculationListItem,
  Distance,
  EquipmentWeight,
  PresetsType,
} from "../../typings";
import {
  CalculationStringsRegex,
  IsCalculationStringValid,
  CreateNewCalculationItem,
} from "..";

const createCalculationItemNumber = (number: number, unit: string) => {
  const calculationItem = CreateNewCalculationItem("number", unit, number);

  return calculationItem;
};

const createCalculationItemEquipmentWeight = (
  presetId: number,
  unit: string,
  equipmentWeights: EquipmentWeight[]
) => {
  const equipment = equipmentWeights.find((item) => item.id === presetId);

  if (equipment !== undefined) {
    const calculationItem = CreateNewCalculationItem(
      "preset",
      unit,
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
  distances: Distance[]
) => {
  const distance = distances.find((item) => item.id === presetId);

  if (distance !== undefined) {
    const calculationItem = CreateNewCalculationItem(
      "preset",
      unit,
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
  unit: string
) => {
  const { isCalculationValid, result } =
    IsCalculationStringValid(calculationString);

  if (!isCalculationValid) return;

  const calculationItem = CreateNewCalculationItem(
    "calculation",
    unit,
    result,
    calculationString
  );

  return calculationItem;
};

export const LoadCalculationString = (
  calculationString: string,
  unit: string,
  presetsType: PresetsType,
  equipmentWeights: EquipmentWeight[],
  distances: Distance[]
): CalculationListItem[] => {
  // Split Equipment Weight calculation string with Distance
  // calculation strings, if calculation string contains both
  const calculationStrings = calculationString.split("/");

  if (calculationStrings.length === 0) return [];

  const calculationList: CalculationListItem[] = [];

  // Calculation strings must be of format "e[**]/d[**]", e[**] or d[**]
  const { regexEquipment, regexDistance } = CalculationStringsRegex();

  // Number values must be of format "n**", where ** is a valid number above 0
  const regexNumber = /^n(\d+(\.\d{1,2})?)$/;
  // Preset values must be of format "p**", where ** is a valid integer above 0
  const regexPreset = /^p([1-9]\d*)$/;
  // Calculation values must be of format "c(**)", where ** is a valid calculation string
  const regexCalc = /^c\((.*)\)$/;

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

    const calculationItems = calculationListString.split(",");

    // Loop through every item in the string
    for (const item of calculationItems) {
      // Check if itemType is number

      const numberMatch = item.match(regexNumber);

      if (numberMatch && numberMatch[1]) {
        const number = parseFloat(numberMatch[1]);
        const calculationItem = createCalculationItemNumber(number, unit);

        if (calculationItem !== undefined) {
          calculationList.push(calculationItem);
          continue;
        }
      }

      // Check if itemType is preset
      const presetMatch = item.match(regexPreset);

      if (presetMatch && presetMatch[1]) {
        const presetId = parseInt(presetMatch[1]);

        if (presetsType === "equipment") {
          const calculationItem = createCalculationItemEquipmentWeight(
            presetId,
            unit,
            equipmentWeights
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
            distances
          );

          if (calculationItem !== undefined) {
            calculationList.push(calculationItem);
            continue;
          }
        }
      }

      // Check if itemType is calculation
      const calcMatch = item.match(regexCalc);

      if (calcMatch && calcMatch[1]) {
        const calculationItem = createCalculationItemCalculation(
          calcMatch[1],
          unit
        );

        if (calculationItem !== undefined) {
          calculationList.push(calculationItem);
        }
      }
    }
  }

  return calculationList;
};
