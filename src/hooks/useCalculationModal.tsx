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

  const calculationModal = useDisclosure();

  return {
    calculationModal,
    calculationModalPage,
    setCalculationModalPage,
    calculationString,
    setCalculationString,
  };
};
