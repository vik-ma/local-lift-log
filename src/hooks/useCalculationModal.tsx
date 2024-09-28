import { useDisclosure } from "@nextui-org/react";
import { useState } from "react";
import {
  CalculationModalPage,
  UseCalculationModalReturnType,
} from "../typings";

export const useCalculationModal = (): UseCalculationModalReturnType => {
  const [calculationModalPage, setCalculationModalPage] =
    useState<CalculationModalPage>("base");
  const [calculationString, setCalculationString] = useState<string | null>(
    null
  );
  const [isActiveSet, setIsActiveSet] = useState<boolean>(false);

  const calculationModal = useDisclosure();

  return {
    calculationModal,
    calculationModalPage,
    setCalculationModalPage,
    calculationString,
    setCalculationString,
    isActiveSet,
    setIsActiveSet,
  };
};
