import { useCallback, useEffect, useRef, useState } from "react";
import { Distance, EquipmentWeight } from "../typings";
import Database from "tauri-plugin-sql-api";
import { useDisclosure } from "@nextui-org/react";

type PresetsType = "equipment" | "distance";

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

  const presetsModal = useDisclosure();

  const getEquipmentWeights = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<EquipmentWeight[]>(
        "SELECT * FROM equipment_weights"
      );

      const equipmentWeights: EquipmentWeight[] = result.map((row) => ({
        id: row.id,
        name: row.name,
        weight: row.weight,
        weight_unit: row.weight_unit,
      }));

      setEquipmentWeights(equipmentWeights);
      equipmentWeightsAreLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getDistances = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<Distance[]>("SELECT * FROM distances");

      const distances: Distance[] = result.map((row) => ({
        id: row.id,
        name: row.name,
        distance: row.distance,
        distance_unit: row.distance_unit,
      }));

      setDistances(distances);
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

      presetsModal.onOpen();
    },
    [presetsModal, getEquipmentWeights, getDistances]
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
    presetsModal,
    handleOpenPresetsModal,
  };
};
