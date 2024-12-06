import { useDisclosure } from "@nextui-org/react";
import { useState } from "react";
import { PlateCollectionPage } from "../typings";

export const usePlateCollectionModal = () => {
  const [plateCalculatorPage, setPlateCalculatorPage] =
    useState<PlateCollectionPage>("base");

  const plateCollectionModal = useDisclosure();

  const resetAndOpenPlateCollectionModal = () => {
    setPlateCalculatorPage("base");
    plateCollectionModal.onOpen();
  };

  return {
    plateCalculatorPage,
    setPlateCalculatorPage,
    plateCollectionModal,
    resetAndOpenPlateCollectionModal,
  };
};
