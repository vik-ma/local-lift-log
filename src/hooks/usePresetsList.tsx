import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Distance,
  EquipmentWeight,
  PresetsType,
  EquipmentWeightSortCategory,
  DistanceSortCategory,
  UsePresetsListReturnType,
} from "../typings";
import Database from "tauri-plugin-sql-api";
import { UpdateIsFavorite, UpdateItemInList } from "../helpers";

export const usePresetsList = (
  getEquipmentWeightsOnLoad: boolean,
  getDistancesOnLoad: boolean
): UsePresetsListReturnType => {
  const [equipmentWeights, setEquipmentWeights] = useState<EquipmentWeight[]>(
    []
  );
  const [distances, setDistances] = useState<Distance[]>([]);
  const [presetsType, setPresetsType] = useState<PresetsType>("equipment");
  const [filterQueryEquipment, setFilterQueryEquipment] = useState<string>("");
  const [filterQueryDistance, setFilterQueryDistance] = useState<string>("");
  const [sortCategoryEquipment, setSortCategoryEquipment] =
    useState<EquipmentWeightSortCategory>("favorite");
  const [sortCategoryDistance, setSortCategoryDistance] =
    useState<DistanceSortCategory>("favorite");
  const [isLoadingEquipment, setIsLoadingEquipment] = useState<boolean>(true);
  const [isLoadingDistance, setIsLoadingDistance] = useState<boolean>(true);
  const [plateCalculatorHandle, setPlateCalculatorHandle] =
    useState<EquipmentWeight>();
  const [isDefaultHandleIdInvalid, setIsDefaultHandleIdInvalid] =
    useState<boolean>(false);

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

  const getEquipmentWeights = useCallback(
    async (defaultEquipmentHandleId?: number) => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<EquipmentWeight[]>(
          "SELECT * FROM equipment_weights"
        );

        sortEquipmentWeightsByFavoritesFirst(result);
        setIsLoadingEquipment(false);

        if (defaultEquipmentHandleId !== undefined) {
          const defaultHandle = result.find(
            (equipment) => equipment.id === defaultEquipmentHandleId
          );

          if (defaultHandle !== undefined) {
            setPlateCalculatorHandle(defaultHandle);
          } else {
            setIsDefaultHandleIdInvalid(true);
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    []
  );

  const getDistances = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<Distance[]>("SELECT * FROM distances");

      sortDistancesByFavoritesFirst(result);
      setIsLoadingDistance(false);
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

  const sortEquipmentWeightsByName = (
    equipmentWeightList: EquipmentWeight[]
  ) => {
    equipmentWeightList.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    setEquipmentWeights(equipmentWeightList);
  };

  const sortDistancesByName = (distanceList: Distance[]) => {
    distanceList.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    setDistances(distanceList);
  };

  const sortEquipmentWeightsByFavoritesFirst = (
    equipmentWeightList: EquipmentWeight[]
  ) => {
    equipmentWeightList.sort((a, b) => {
      if (b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setEquipmentWeights(equipmentWeightList);
  };

  const sortDistancesByFavoritesFirst = (distanceList: Distance[]) => {
    distanceList.sort((a, b) => {
      if (b.is_favorite !== a.is_favorite) {
        return b.is_favorite - a.is_favorite;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setDistances(distanceList);
  };

  const sortEquipmentWeightsByWeight = (
    equipmentWeightList: EquipmentWeight[],
    isAscending: boolean
  ) => {
    equipmentWeightList.sort((a, b) => {
      if (isAscending) {
        return a.weight - b.weight;
      } else {
        return b.weight - a.weight;
      }
    });

    setEquipmentWeights(equipmentWeightList);
  };

  const sortDistancesByDistance = (
    distanceList: Distance[],
    isAscending: boolean
  ) => {
    distanceList.sort((a, b) => {
      if (isAscending) {
        return a.distance - b.distance;
      } else {
        return b.distance - a.distance;
      }
    });

    setDistances(distanceList);
  };

  const sortEquipmentWeightsByPlateCalcFirst = (
    equipmentWeightList: EquipmentWeight[]
  ) => {
    equipmentWeightList.sort((a, b) => {
      if (b.is_in_plate_calculator !== a.is_in_plate_calculator) {
        return b.is_in_plate_calculator - a.is_in_plate_calculator;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setEquipmentWeights(equipmentWeightList);
  };

  const handleSortOptionSelectionEquipment = (key: string) => {
    if (key === "favorite") {
      setSortCategoryEquipment(key);
      sortEquipmentWeightsByFavoritesFirst([...equipmentWeights]);
    } else if (key === "weight-desc") {
      setSortCategoryEquipment(key);
      sortEquipmentWeightsByWeight([...equipmentWeights], false);
    } else if (key === "weight-asc") {
      setSortCategoryEquipment(key);
      sortEquipmentWeightsByWeight([...equipmentWeights], true);
    } else if (key === "name") {
      setSortCategoryEquipment(key);
      sortEquipmentWeightsByName([...equipmentWeights]);
    } else if (key === "plate-calc") {
      setSortCategoryEquipment(key);
      sortEquipmentWeightsByPlateCalcFirst([...equipmentWeights]);
    }
  };

  const handleSortOptionSelectionDistance = (key: string) => {
    if (key === "favorite") {
      setSortCategoryDistance(key);
      sortDistancesByFavoritesFirst([...distances]);
    } else if (key === "distance-desc") {
      setSortCategoryDistance(key);
      sortDistancesByDistance([...distances], false);
    } else if (key === "distance-asc") {
      setSortCategoryDistance(key);
      sortDistancesByDistance([...distances], true);
    } else if (key === "name") {
      setSortCategoryDistance(key);
      sortDistancesByName([...distances]);
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

    if (sortCategoryEquipment === "favorite") {
      sortEquipmentWeightsByFavoritesFirst(updatedEquipmentWeights);
    }
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

    if (sortCategoryDistance === "favorite") {
      sortDistancesByFavoritesFirst(updatedDistances);
    }
  };

  const togglePlateCalculator = async (equipmentWeight: EquipmentWeight) => {
    const newFavoriteValue =
      equipmentWeight.is_in_plate_calculator === 1 ? 0 : 1;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        `UPDATE equipment_weights 
         SET is_in_plate_calculator = $1 
         WHERE id = $2`,
        [newFavoriteValue, equipmentWeight.id]
      );

      const updatedEquipmentWeight: EquipmentWeight = {
        ...equipmentWeight,
        is_in_plate_calculator: newFavoriteValue,
      };

      const updatedEquipmentWeights = UpdateItemInList(
        equipmentWeights,
        updatedEquipmentWeight
      );

      if (sortCategoryEquipment === "plate-calc") {
        sortEquipmentWeightsByPlateCalcFirst(updatedEquipmentWeights);
      }
    } catch (error) {
      console.log(error);
    }
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
    filterQueryEquipment,
    setFilterQueryEquipment,
    filteredEquipmentWeights,
    filterQueryDistance,
    setFilterQueryDistance,
    filteredDistances,
    toggleFavoriteEquipmentWeight,
    toggleFavoriteDistance,
    sortCategoryEquipment,
    sortCategoryDistance,
    handleSortOptionSelectionEquipment,
    handleSortOptionSelectionDistance,
    isLoadingEquipment,
    isLoadingDistance,
    togglePlateCalculator,
    plateCalculatorHandle,
    setPlateCalculatorHandle,
    isDefaultHandleIdInvalid,
    setIsDefaultHandleIdInvalid,
  };
};
