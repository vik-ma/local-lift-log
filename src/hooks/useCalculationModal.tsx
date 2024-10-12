import { useDisclosure } from "@nextui-org/react";
import { useState } from "react";
import {
  CalculationModalTab,
  Exercise,
  UseCalculationModalReturnType,
} from "../typings";

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
  const [targetWeight, setTargetWeight] = useState<string>("");

  const calculationModal = useDisclosure();

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
    targetWeight,
    setTargetWeight,
  };
};
