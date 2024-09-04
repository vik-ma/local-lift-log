import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Distance, EquipmentWeight, PresetsType } from "../typings";
import Database from "tauri-plugin-sql-api";
import { useDisclosure } from "@nextui-org/react";
import { UpdateIsFavorite, UpdateItemInList } from "../helpers";

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
  const [equipmentFavoritesCheckboxValue, setEquipmentFavoritesCheckboxValue] =
    useState<boolean>(true);
  const [distanceFavoritesCheckboxValue, setDistanceFavoritesCheckboxValue] =
    useState<boolean>(true);
  const [filterQueryEquipment, setFilterQueryEquipment] = useState<string>("");
  const [filterQueryDistance, setFilterQueryDistance] = useState<string>("");

  const equipmentWeightsAreLoaded = useRef(false);
  const distancesAreLoaded = useRef(false);

  const presetsListModal = useDisclosure();

  const filteredEquipmentWeights = useMemo(() => {
    if (filterQueryEquipment !== "") {
      return equipmentWeights.filter(
        (item) =>
          item.name
            .toLocaleLowerCase()
            .includes(filterQueryEquipment.toLocaleLowerCase()) ||
          item.weight
            .toString()
            .toLocaleLowerCase()
            .includes(filterQueryEquipment.toLocaleLowerCase())
      );
    }
    return equipmentWeights;
  }, [equipmentWeights, filterQueryEquipment]);

  const filteredDistances = useMemo(() => {
    if (filterQueryDistance !== "") {
      return distances.filter(
        (item) =>
          item.name
            .toLocaleLowerCase()
            .includes(filterQueryDistance.toLocaleLowerCase()) ||
          item.distance
            .toString()
            .toLocaleLowerCase()
            .includes(filterQueryDistance.toLocaleLowerCase())
      );
    }
    return distances;
  }, [distances, filterQueryDistance]);

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

  const sortEquipmentWeightsByName = (
    equipmentWeightList: EquipmentWeight[],
    listFavoritesFirst: boolean
  ) => {
    equipmentWeightList.sort((a, b) => {
      if (listFavoritesFirst && b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      } else {
        return a.name.localeCompare(b.name);
      }
    });
    setEquipmentWeights(equipmentWeightList);
  };

  const sortDistancesByName = (
    distanceList: Distance[],
    listFavoritesFirst: boolean
  ) => {
    distanceList.sort((a, b) => {
      if (listFavoritesFirst && b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      } else {
        return a.name.localeCompare(b.name);
      }
    });
    setDistances(distanceList);
  };

  const handleListFavoritesFirstChange = (
    presetsType: PresetsType,
    value: boolean
  ) => {
    if (presetsType === "equipment") {
      sortEquipmentWeightsByName([...equipmentWeights], value);
      setEquipmentFavoritesCheckboxValue(value);
    } else if (presetsType === "distance") {
      sortDistancesByName([...distances], value);
      setDistanceFavoritesCheckboxValue(value);
    }
  };

  const toggleFavoriteEquipmentWeight = async (
    equipmentWeight: EquipmentWeight
  ) => {
    const newFavoriteValue = equipmentWeight.is_favorite === 1 ? 0 : 1;

    const success = await UpdateIsFavorite(
      equipmentWeight.id,
      "equipment",
      newFavoriteValue
    );

    if (!success) return;

    const updatedEquipmentWeight: EquipmentWeight = {
      ...equipmentWeight,
      is_favorite: newFavoriteValue,
    };

    const updatedEquipmentWeights = UpdateItemInList(
      equipmentWeights,
      updatedEquipmentWeight
    );

    setEquipmentWeights(updatedEquipmentWeights);
  };

  const toggleFavoriteDistance = async (distance: Distance) => {
    const newFavoriteValue = distance.is_favorite === 1 ? 0 : 1;

    const success = await UpdateIsFavorite(
      distance.id,
      "distance",
      newFavoriteValue
    );

    if (!success) return;

    const updatedDistance: Distance = {
      ...distance,
      is_favorite: newFavoriteValue,
    };

    const updatedDistances = UpdateItemInList(distances, updatedDistance);

    setDistances(updatedDistances);
  };

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
    filterQueryEquipment,
    setFilterQueryEquipment,
    filteredEquipmentWeights,
    filterQueryDistance,
    setFilterQueryDistance,
    filteredDistances,
    handleListFavoritesFirstChange,
    equipmentFavoritesCheckboxValue,
    distanceFavoritesCheckboxValue,
    toggleFavoriteEquipmentWeight,
    toggleFavoriteDistance,
  };
};
