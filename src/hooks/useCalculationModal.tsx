import { useDisclosure } from "@nextui-org/react";
import { useState } from "react";
import { CalculationModalPage } from "../typings";

export const useCalculationModal = () => {
  const [calculationModalPage, setCalculationModalPage] =
    useState<CalculationModalPage>("base");

  const calculationModal = useDisclosure();

  return { calculationModal, calculationModalPage, setCalculationModalPage };
};
