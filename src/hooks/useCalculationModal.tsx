import { useDisclosure } from "@nextui-org/react";
import { useState } from "react";
import {
  CalculationModalTab,
  Exercise,
  UseCalculationModalReturnType,
  UsePresetsListReturnType,
  UserSettings,
  UseSetTrackingInputsReturnType,
  WorkoutSet,
} from "../typings";
import { ValidCalculationModalTabs } from "../helpers";

export const useCalculationModal = (): UseCalculationModalReturnType => {
  const [calculationModalTab, setCalculationModalTab] =
    useState<CalculationModalTab>("sum");
  const [calculationString, setCalculationString] = useState<string | null>(
    null
  );
  const [isActiveSet, setIsActiveSet] = useState<boolean>(false);
  const [calculationExercise, setCalculationExercise] = useState<
    Exercise | undefined
  >();
  const [weightUnit, setWeightUnit] = useState<string>("kg");
  const [distanceUnit, setDistanceUnit] = useState<string>("km");
  const [targetWeightInput, setTargetWeightInput] = useState<string>("");

  const calculationModal = useDisclosure();

  const openCalculationModal = async (
    isWeight: boolean,
    exercise: Exercise,
    isActiveSet: boolean,
    setInputs: UseSetTrackingInputsReturnType,
    set: WorkoutSet,
    presetsList: UsePresetsListReturnType,
    userSettings: UserSettings
  ) => {
    if (isWeight && presetsList.isLoadingEquipment) {
      await presetsList.getEquipmentWeights(
        userSettings.default_plate_calculation_id
      );
    } else if (!isWeight && presetsList.isLoadingDistance) {
      await presetsList.getDistances();
    }

    if (isWeight) {
      presetsList.setPresetsType("equipment");

      setWeightUnit(set.weight_unit);

      if (!setInputs.setInputsInvalidityMap.weight) {
        setTargetWeightInput(setInputs.setTrackingValuesInput.weight);
      }

      if (
        ValidCalculationModalTabs().includes(
          userSettings.default_calculation_tab
        )
      ) {
        setCalculationModalTab(
          userSettings.default_calculation_tab as CalculationModalTab
        );
      }

      setUpPlateCalculationValues(set, presetsList);
    } else {
      presetsList.setPresetsType("distance");

      setCalculationModalTab("sum");
      setDistanceUnit(set.distance_unit);
    }

    setCalculationString(exercise.calculation_string);
    setIsActiveSet(isActiveSet);
    setCalculationExercise(exercise);
    calculationModal.onOpen();
  };

  const setUpPlateCalculationValues = (
    set: WorkoutSet,
    presetsList: UsePresetsListReturnType
  ) => {
    if (
      presetsList.operatingPlateCalculation.id !== 0 &&
      presetsList.operatingPlateCalculation.weight_unit !== set.weight_unit
    ) {
      // Reset operatingPlateCalculation if Set unit doesn't match operatingPlateCalculation
      // if operatingPlateCalculation is not defaultPlateCalculation
      presetsList.setOperatingPlateCalculation({
        ...presetsList.defaultPlateCalculation,
        weight_unit: set.weight_unit,
      });
    }

    // Add opposite weight unit to otherUnitPlateCalculation
    presetsList.setOtherUnitPlateCalculation({
      ...presetsList.defaultPlateCalculation,
      weight_unit: set.weight_unit === "kg" ? "lbs" : "kg",
    });
  };

  return {
    calculationModal,
    calculationModalTab,
    setCalculationModalTab,
    calculationString,
    setCalculationString,
    isActiveSet,
    setIsActiveSet,
    calculationExercise,
    setCalculationExercise,
    weightUnit,
    setWeightUnit,
    distanceUnit,
    setDistanceUnit,
    targetWeightInput,
    setTargetWeightInput,
    openCalculationModal,
  };
};
