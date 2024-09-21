import Database from "tauri-plugin-sql-api";
import { CalculationListItem, Exercise, PresetsType } from "../../typings";
import { CreateCalculationString, CalculationStringsRegex } from "..";

type UpdateCalculationStringReturnType = {
  success: boolean;
  updatedExercise: Exercise;
};

export const UpdateCalculationString = async (
  calculationList: CalculationListItem[],
  presetsType: PresetsType,
  exercise: Exercise,
  totalMultiplier: number
): Promise<UpdateCalculationStringReturnType> => {
  let calculationString = "";

  if (exercise.calculation_string === null) {
    calculationString = CreateCalculationString(
      calculationList,
      presetsType,
      totalMultiplier
    );
  } else {
    // Split current calculation string between Equipment Weights
    // and Distances, if calculation string contains both
    const calculationStrings = exercise.calculation_string.split("/");

    // Updated calculation string list
    const newCalculationStrings: string[] = [];

    // Calculation strings must be of format "e[**]/d[**]", e[**] or d[**]
    const { regexEquipment, regexDistance } = CalculationStringsRegex();

    for (const string of calculationStrings) {
      const equipmentMatch = string.match(regexEquipment);
      const distanceMatch = string.match(regexDistance);

      const isValidEquipmentString =
        presetsType === "equipment" && equipmentMatch;
      const isValidDistanceString = presetsType === "distance" && distanceMatch;

      if (isValidEquipmentString || isValidDistanceString) {
        // If updating current presetsType
        calculationString = CreateCalculationString(
          calculationList,
          presetsType,
          totalMultiplier
        );
        newCalculationStrings.push(calculationString);
      }

      if (
        (equipmentMatch && presetsType !== "equipment") ||
        (distanceMatch && presetsType !== "distance")
      ) {
        // Add new calculationList for presetType that does not currently exist in string
        calculationString = CreateCalculationString(
          calculationList,
          presetsType,
          totalMultiplier
        );
        newCalculationStrings.push(calculationString);

        // Keep existing string for other presetsType
        newCalculationStrings.push(string);
      }
    }

    if (newCalculationStrings.length === 0) {
      // If current string is invalid, replace string with new value
      calculationString = CreateCalculationString(
        calculationList,
        presetsType,
        totalMultiplier
      );
    } else {
      calculationString = newCalculationStrings.join("/");
    }
  }

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      `UPDATE exercises
       SET calculation_string = $1
       WHERE id = $2`,
      [calculationString, exercise.id]
    );

    const updatedExercise: Exercise = {
      ...exercise,
      calculation_string: calculationString,
    };

    return { success: true, updatedExercise: updatedExercise };
  } catch (error) {
    console.log(error);
    return { success: false, updatedExercise: exercise };
  }
};
