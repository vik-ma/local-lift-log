import { useDisclosure } from "@nextui-org/react";
import { useState } from "react";
import { PlateCalculationPage } from "../typings";

export const usePlateCalculationModal = () => {
  const [plateCalculatorPage, setPlateCalculatorPage] =
    useState<PlateCalculationPage>("base");

  const plateCalculationModal = useDisclosure();

  const resetAndOpenPlateCalculationModal = () => {
    setPlateCalculatorPage("base");
    plateCalculationModal.onOpen();
  };

  return {
    plateCalculatorPage,
    setPlateCalculatorPage,
    plateCalculationModal,
    resetAndOpenPlateCalculationModal,
  };
};
