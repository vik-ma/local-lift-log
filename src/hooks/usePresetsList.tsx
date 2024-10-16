import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Distance,
  EquipmentWeight,
  PresetsType,
  EquipmentWeightSortCategory,
  DistanceSortCategory,
  UsePresetsListReturnType,
  PlateCalculation,
} from "../typings";
import Database from "tauri-plugin-sql-api";
import {
  ConvertDistanceToMeter,
  ConvertWeightToKg,
  UpdateIsFavorite,
  UpdateItemInList,
} from "../helpers";

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
  const [filterQueryPlateCalculation, setFilterQueryPlateCalculation] =
    useState<string>("");
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

  const [plateCalculations, setPlateCalculations] = useState<
    PlateCalculation[]
  >([]);
  const [selectedPlateCalculation, setSelectedPlateCalculation] =
    useState<PlateCalculation>();

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

  const filteredPlateCalculations = useMemo(() => {
    if (filterQueryPlateCalculation !== "") {
      return plateCalculations.filter((item) =>
        item.name
          .toLocaleLowerCase()
          .includes(filterQueryPlateCalculation.toLocaleLowerCase())
      );
    }
    return plateCalculations;
  }, [plateCalculations, filterQueryPlateCalculation]);

  const getEquipmentWeights = useCallback(
    async (
      defaultEquipmentHandleId?: number,
      defaultPlateCalculationId?: number
    ) => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const equipmentWeights = await db.select<EquipmentWeight[]>(
          "SELECT * FROM equipment_weights"
        );

        const plateCalculations = await db.select<PlateCalculation[]>(
          "SELECT * FROM plate_calculations"
        );

        sortEquipmentWeightsByFavoritesFirst(equipmentWeights);
        setPlateCalculations(plateCalculations);
        setIsLoadingEquipment(false);

        if (defaultPlateCalculationId !== undefined) {
          const defaultPlateCalculation = plateCalculations.find(
            (plateCalculation) =>
              plateCalculation.id === defaultPlateCalculationId
          );

          if (defaultPlateCalculation !== undefined) {
            setSelectedPlateCalculation(defaultPlateCalculation);
          } else {
            setIsDefaultHandleIdInvalid(true);
          }
        }

        // TODO: REMOVE
        if (defaultEquipmentHandleId !== undefined) {
          const defaultHandle = equipmentWeights.find(
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
      const weightAInKg = ConvertWeightToKg(a.weight, a.weight_unit);
      const weightBInKg = ConvertWeightToKg(b.weight, b.weight_unit);

      if (weightAInKg !== weightBInKg) {
        if (isAscending) {
          return weightAInKg - weightBInKg;
        } else {
          return weightBInKg - weightAInKg;
        }
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setEquipmentWeights(equipmentWeightList);
  };

  const sortDistancesByDistance = (
    distanceList: Distance[],
    isAscending: boolean
  ) => {
    distanceList.sort((a, b) => {
      const distanceAInMeters = ConvertDistanceToMeter(
        a.distance,
        a.distance_unit
      );
      const distanceBInMeters = ConvertDistanceToMeter(
        b.distance,
        b.distance_unit
      );

      if (distanceAInMeters !== distanceBInMeters) {
        if (isAscending) {
          return distanceAInMeters - distanceBInMeters;
        } else {
          return distanceBInMeters - distanceAInMeters;
        }
      } else {
        return a.name.localeCompare(b.name);
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

    sortEquipmentWeightByActiveCategory(updatedEquipmentWeights);
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

    sortDistancesByActiveCategory(updatedDistances);
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

      sortEquipmentWeightByActiveCategory(updatedEquipmentWeights);
    } catch (error) {
      console.log(error);
    }
  };

  const sortEquipmentWeightByActiveCategory = (
    equipmentWeightList: EquipmentWeight[]
  ) => {
    switch (sortCategoryEquipment) {
      case "favorite":
        sortEquipmentWeightsByFavoritesFirst(equipmentWeightList);
        break;
      case "name":
        sortEquipmentWeightsByName(equipmentWeightList);
        break;
      case "weight-asc":
        sortEquipmentWeightsByWeight(equipmentWeightList, true);
        break;
      case "weight-desc":
        sortEquipmentWeightsByWeight(equipmentWeightList, false);
        break;
      case "plate-calc":
        sortEquipmentWeightsByPlateCalcFirst(equipmentWeightList);
        break;
      default:
        break;
    }
  };

  const sortDistancesByActiveCategory = (distanceList: Distance[]) => {
    switch (sortCategoryDistance) {
      case "favorite":
        sortDistancesByFavoritesFirst(distanceList);
        break;
      case "name":
        sortDistancesByName(distanceList);
        break;
      case "distance-asc":
        sortDistancesByDistance(distanceList, true);
        break;
      case "distance-desc":
        sortDistancesByDistance(distanceList, false);
        break;
      default:
        break;
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
    sortEquipmentWeightByActiveCategory,
    sortDistancesByActiveCategory,
    plateCalculations,
    setPlateCalculations,
    selectedPlateCalculation,
    setSelectedPlateCalculation,
    filteredPlateCalculations,
    filterQueryPlateCalculation,
    setFilterQueryPlateCalculation,
  };
};
