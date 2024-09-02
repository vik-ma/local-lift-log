import { useCallback, useEffect, useRef, useState } from "react";
import { Distance, EquipmentWeight, PresetsType } from "../typings";
import Database from "tauri-plugin-sql-api";
import { useDisclosure } from "@nextui-org/react";

export const usePresetsList = (
  getEquipmentWeightsOnLoad: boolean,
  getDistancesOnLoad: boolean,
  defaultPresetType?: PresetsType
) => {
  const [equipmentWeights, setEquipmentWeights] = useState<EquipmentWeight[]>(
    []
  );
  const [distances, setDistances] = useState<Distance[]>([]);
  const [presetsType, setPresetsType] = useState<PresetsType>(
    defaultPresetType ?? "equipment"
  );

  const equipmentWeightsAreLoaded = useRef(false);
  const distancesAreLoaded = useRef(false);

  const presetsListModal = useDisclosure();

  const getEquipmentWeights = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<EquipmentWeight[]>(
        "SELECT * FROM equipment_weights"
      );

      setEquipmentWeights(result);
      equipmentWeightsAreLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getDistances = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<Distance[]>("SELECT * FROM distances");

      setDistances(result);
      distancesAreLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    if (getEquipmentWeightsOnLoad) {
      getEquipmentWeights();
    }

    if (getDistancesOnLoad) {
      getDistances();
    }
  }, [
    getEquipmentWeightsOnLoad,
    getDistancesOnLoad,
    getEquipmentWeights,
    getDistances,
  ]);

  const handleOpenPresetsModal = useCallback(
    (presetsType: PresetsType) => {
      if (
        presetsType === "equipment" &&
        equipmentWeightsAreLoaded.current === false
      ) {
        getEquipmentWeights();
      }

      if (presetsType === "distance" && distancesAreLoaded.current === false) {
        getDistances();
      }

      presetsListModal.onOpen();
    },
    [presetsListModal, getEquipmentWeights, getDistances]
  );

  return {
    equipmentWeights,
    setEquipmentWeights,
    distances,
    setDistances,
    getEquipmentWeights,
    getDistances,
    presetsType,
    setPresetsType,
    presetsListModal,
    handleOpenPresetsModal,
  };
};
