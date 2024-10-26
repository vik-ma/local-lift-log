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
  CreatePlateCalculationList,
  GenerateFormattedAvailablePlatesString,
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
  const [plateCalculations, setPlateCalculations] = useState<
    PlateCalculation[]
  >([]);
  const [
    isDefaultPlateCalculationInvalid,
    setIsDefaultPlateCalculationInvalid,
  ] = useState<boolean>(false);

  const defaultPlateCalculation: PlateCalculation = useMemo(() => {
    return {
      id: 0,
      name: "",
      handle_id: 0,
      available_plates_string: "",
      num_handles: 1,
      weight_unit: "kg",
      availablePlatesMap: new Map(),
    };
  }, []);

  const [operatingPlateCalculation, setOperatingPlateCalculation] =
    useState<PlateCalculation>(defaultPlateCalculation);
  const [otherUnitPlateCalculation, setOtherUnitPlateCalculation] =
    useState<PlateCalculation>(defaultPlateCalculation);

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
    async (defaultPlateCalculationId?: number) => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const equipmentWeights = await db.select<EquipmentWeight[]>(
          "SELECT * FROM equipment_weights"
        );

        const plateCalculations = await db.select<PlateCalculation[]>(
          "SELECT * FROM plate_calculations"
        );

        sortEquipmentWeightsByFavoritesFirst(equipmentWeights);

        const plateCalculationList = CreatePlateCalculationList(
          plateCalculations,
          equipmentWeights
        );

        setPlateCalculations(plateCalculationList);
        setIsLoadingEquipment(false);

        if (defaultPlateCalculationId !== undefined) {
          const defaultPlateCalculation = plateCalculationList.find(
            (plateCalculation) =>
              plateCalculation.id === defaultPlateCalculationId
          );

          if (defaultPlateCalculation !== undefined) {
            setOperatingPlateCalculation(defaultPlateCalculation);
          }
        } else {
          setIsDefaultPlateCalculationInvalid(true);
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
    if (operatingPlateCalculation.availablePlatesMap === undefined) return;

    const platesMap = operatingPlateCalculation.availablePlatesMap;

    equipmentWeightList.sort((a, b) => {
      const aInMap = platesMap.has(a) ? 1 : 0;
      const bInMap = platesMap.has(b) ? 1 : 0;

      if (platesMap.has(b) !== platesMap.has(a)) {
        return bInMap - aInMap;
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

  const updateAvailablePlatesMapKeys = (equipmentWeight: EquipmentWeight) => {
    if (operatingPlateCalculation.availablePlatesMap === undefined) return;

    const updatedAvailablePlatesMap = new Map(
      operatingPlateCalculation.availablePlatesMap
    );

    if (updatedAvailablePlatesMap.has(equipmentWeight)) {
      updatedAvailablePlatesMap.delete(equipmentWeight);
    } else {
      updatedAvailablePlatesMap.set(equipmentWeight, 12);
    }

    const sortedPlates = Array.from(updatedAvailablePlatesMap.keys()).sort(
      (a, b) => a.weight - b.weight
    );

    const sortedAvailablePlatesMap = new Map<EquipmentWeight, number>();

    for (const key of sortedPlates) {
      const value = updatedAvailablePlatesMap.get(key);
      if (value !== undefined) {
        sortedAvailablePlatesMap.set(key, value);
      }
    }

    const {
      available_plates_string,
      formattedAvailablePlatesString,
      formattedAvailablePlatesMapString,
    } = GenerateFormattedAvailablePlatesString(sortedAvailablePlatesMap);

    const updatedPlateCalculation = {
      ...operatingPlateCalculation,
      available_plates_string,
      availablePlatesMap: sortedAvailablePlatesMap,
      formattedAvailablePlatesString,
      formattedAvailablePlatesMapString,
    };

    setOperatingPlateCalculation(updatedPlateCalculation);
  };

  const updateAvailablePlatesMapValue = (
    equipmentWeight: EquipmentWeight,
    newValue: number
  ) => {
    if (operatingPlateCalculation.availablePlatesMap === undefined) return;

    const updatedAvailablePlatesMap = new Map(
      operatingPlateCalculation.availablePlatesMap
    );

    updatedAvailablePlatesMap.set(equipmentWeight, newValue);

    const {
      available_plates_string,
      formattedAvailablePlatesString,
      formattedAvailablePlatesMapString,
    } = GenerateFormattedAvailablePlatesString(updatedAvailablePlatesMap);

    const updatedPlateCalculation = {
      ...operatingPlateCalculation,
      available_plates_string,
      availablePlatesMap: updatedAvailablePlatesMap,
      formattedAvailablePlatesString,
      formattedAvailablePlatesMapString,
    };

    setOperatingPlateCalculation(updatedPlateCalculation);
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
    sortEquipmentWeightByActiveCategory,
    sortDistancesByActiveCategory,
    plateCalculations,
    setPlateCalculations,
    operatingPlateCalculation,
    setOperatingPlateCalculation,
    filteredPlateCalculations,
    filterQueryPlateCalculation,
    setFilterQueryPlateCalculation,
    updateAvailablePlatesMapKeys,
    otherUnitPlateCalculation,
    setOtherUnitPlateCalculation,
    defaultPlateCalculation,
    updateAvailablePlatesMapValue,
    isDefaultPlateCalculationInvalid,
    setIsDefaultPlateCalculationInvalid,
  };
};
