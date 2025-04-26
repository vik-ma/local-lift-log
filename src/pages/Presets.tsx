import { useState, useEffect, useMemo, useRef } from "react";
import {
  DistanceUnitDropdown,
  LoadingSpinner,
  WeightUnitDropdown,
  DeleteModal,
  ListPageSearchInput,
  FavoriteButton,
  EmptyListLabel,
  PresetsListOptions,
  PlateCollectionModal,
  PlateCollectionButton,
  FilterPresetsListModal,
  ListFilters,
} from "../components";
import Database from "tauri-plugin-sql-api";
import {
  EquipmentWeight,
  Distance,
  UserSettings,
  PlateCollection,
} from "../typings";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  ConvertNumberToTwoDecimals,
  CreateDefaultDistances,
  CreateDefaultEquipmentWeights,
  DeleteItemFromList,
  GetUserSettings,
  GetValidatedUserSettingsUnits,
  IsStringInvalidNumberOr0,
  UpdateItemInList,
  UpdateUserSetting,
} from "../helpers";
import toast from "react-hot-toast";
import {
  usePlateCollectionModal,
  usePresetsList,
  useValidateName,
} from "../hooks";
import { VerticalMenuIcon } from "../assets";
import { useSearchParams } from "react-router-dom";

type OperationType = "add" | "edit" | "delete";

type PresetTab = "equipment" | "distance" | "plate";

export default function Presets() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [nameInput, setNameInput] = useState<string>("");
  const [valueInput, setValueInput] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<PresetTab>("equipment");
  const [isOperatingPlateCollection, setIsOperatingPlateCollection] =
    useState<boolean>(false);

  const [searchParams] = useSearchParams();

  const defaultEquipmentWeight: EquipmentWeight = useMemo(() => {
    return {
      id: 0,
      name: "",
      weight: 0,
      weight_unit: "kg",
      is_favorite: 0,
    };
  }, []);

  const defaultDistance: Distance = useMemo(() => {
    return {
      id: 0,
      name: "",
      distance: 0,
      distance_unit: "km",
      is_favorite: 0,
    };
  }, []);

  const [operatingEquipmentWeight, setOperatingEquipmentWeight] =
    useState<EquipmentWeight>(defaultEquipmentWeight);
  const [operatingDistance, setOperatingDistance] =
    useState<Distance>(defaultDistance);

  const deleteModal = useDisclosure();
  const presetModal = useDisclosure();
  const setUnitsModal = useDisclosure();
  const plateCollectionModal = usePlateCollectionModal();

  const presetsList = usePresetsList(true, true);

  const {
    presetsType,
    setPresetsType,
    equipmentWeights,
    setEquipmentWeights,
    distances,
    setDistances,
    getEquipmentWeights,
    getDistances,
    filterQueryEquipment,
    setFilterQueryEquipment,
    filteredEquipmentWeights,
    filterQueryDistance,
    setFilterQueryDistance,
    filteredDistances,
    toggleFavoriteEquipmentWeight,
    toggleFavoriteDistance,
    sortEquipmentWeightByActiveCategory,
    sortDistancesByActiveCategory,
    plateCollections,
    setPlateCollections,
    filterQueryPlateCollection,
    setFilterQueryPlateCollection,
    filteredPlateCollections,
    operatingPlateCollection,
    setOperatingPlateCollection,
    defaultPlateCollection,
    setOtherUnitPlateCollection,
    listFilters,
    isEquipmentWeightListLoaded,
    isDistanceListLoaded,
  } = presetsList;

  const {
    filterMap,
    removeFilter,
    prefixMap,
    resetFilter,
    setFilterWeightRangeUnit,
    setFilterDistanceRangeUnit,
    showResetFilterButton,
  } = listFilters;

  const defaultWeightUnit = useRef<string>("kg");
  const defaultDistanceUnit = useRef<string>("km");

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);

      const validUnits = GetValidatedUserSettingsUnits(userSettings);

      setOperatingEquipmentWeight((prev) => ({
        ...prev,
        weight_unit: validUnits.weightUnit,
      }));

      setOperatingDistance((prev) => ({
        ...prev,
        distance_unit: validUnits.distanceUnit,
      }));

      setFilterWeightRangeUnit(validUnits.weightUnit);
      setFilterDistanceRangeUnit(validUnits.distanceUnit);

      defaultWeightUnit.current = validUnits.weightUnit;
      defaultDistanceUnit.current = validUnits.distanceUnit;
    };

    if (searchParams.get("tab") === "distance") {
      setSelectedTab("distance");
    } else if (searchParams.get("tab") === "plate") {
      setSelectedTab("plate");
    }

    loadUserSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isNameInputValid = useValidateName(nameInput);

  const isValueInputInvalid = useMemo(() => {
    return IsStringInvalidNumberOr0(valueInput);
  }, [valueInput]);

  const isNewPresetInvalid = useMemo(() => {
    if (!isNameInputValid) return true;
    if (isValueInputInvalid) return true;
    return false;
  }, [isNameInputValid, isValueInputInvalid]);

  const addEquipmentWeight = async () => {
    if (
      isNewPresetInvalid ||
      operationType !== "add" ||
      presetsType !== "equipment"
    )
      return;

    const weight = ConvertNumberToTwoDecimals(Number(valueInput));

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        `INSERT into equipment_weights 
         (name, weight, weight_unit, is_favorite) 
         VALUES ($1, $2, $3, $4)`,
        [
          nameInput,
          weight,
          operatingEquipmentWeight.weight_unit,
          operatingEquipmentWeight.is_favorite,
        ]
      );

      const newEquipment: EquipmentWeight = {
        ...operatingEquipmentWeight,
        id: result.lastInsertId,
        name: nameInput,
        weight: weight,
      };

      sortEquipmentWeightByActiveCategory([...equipmentWeights, newEquipment]);

      resetOperatingEquipment();
      presetModal.onClose();

      toast.success("Equipment Weight Added");
    } catch (error) {
      console.log(error);
    }
  };

  const addDistance = async () => {
    if (
      isNewPresetInvalid ||
      operationType !== "add" ||
      presetsType !== "distance"
    )
      return;

    const distance = ConvertNumberToTwoDecimals(Number(valueInput));

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        `INSERT into distances (name, distance, distance_unit, is_favorite) 
         VALUES ($1, $2, $3, $4)`,
        [
          nameInput,
          distance,
          operatingDistance.distance_unit,
          operatingDistance.is_favorite,
        ]
      );

      const newDistance: Distance = {
        ...operatingDistance,
        id: result.lastInsertId,
        name: nameInput,
        distance: distance,
      };

      sortDistancesByActiveCategory([...distances, newDistance]);

      resetOperatingDistance();
      presetModal.onClose();

      toast.success("Distance Added");
    } catch (error) {
      console.log(error);
    }
  };

  const addPlateCollection = async () => {
    if (operationType !== "add" && operatingPlateCollection.id !== 0) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        `INSERT into plate_collections 
         (name, handle_id, available_plates_string, num_handles, weight_unit) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          operatingPlateCollection.name,
          operatingPlateCollection.handle_id,
          operatingPlateCollection.available_plates_string,
          operatingPlateCollection.num_handles,
          operatingPlateCollection.weight_unit,
        ]
      );

      const newPlateCollection: PlateCollection = {
        ...operatingPlateCollection,
        id: result.lastInsertId,
      };

      const updatedPlateCollections = [...plateCollections, newPlateCollection];

      setPlateCollections(updatedPlateCollections);

      resetOperatingPlateCollection();
      plateCollectionModal.plateCollectionModal.onClose();

      toast.success("Plate Collection Added");
    } catch (error) {
      console.log(error);
    }
  };

  const updateEquipmentWeight = async () => {
    if (
      operatingEquipmentWeight.id === 0 ||
      isNewPresetInvalid ||
      operationType !== "edit" ||
      presetsType !== "equipment"
    )
      return;

    const weight = ConvertNumberToTwoDecimals(Number(valueInput));

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        `UPDATE equipment_weights 
         SET name = $1, weight = $2, weight_unit = $3, is_favorite = $4 
         WHERE id = $5`,
        [
          nameInput,
          weight,
          operatingEquipmentWeight.weight_unit,
          operatingEquipmentWeight.is_favorite,
          operatingEquipmentWeight.id,
        ]
      );

      const updatedEquipment: EquipmentWeight = {
        ...operatingEquipmentWeight,
        name: nameInput,
        weight: weight,
      };

      const updatedEquipmentWeights = UpdateItemInList(
        equipmentWeights,
        updatedEquipment
      );

      sortEquipmentWeightByActiveCategory(updatedEquipmentWeights);

      resetOperatingEquipment();
      presetModal.onClose();

      toast.success("Equipment Weight Updated");
    } catch (error) {
      console.log(error);
    }
  };

  const updateDistance = async () => {
    if (
      operatingDistance.id === 0 ||
      isNewPresetInvalid ||
      operationType !== "edit" ||
      presetsType !== "distance"
    )
      return;

    const distance = ConvertNumberToTwoDecimals(Number(valueInput));

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        `UPDATE distances 
         SET name = $1, distance = $2, distance_unit = $3, is_favorite = $4 
         WHERE id = $5`,
        [
          nameInput,
          distance,
          operatingDistance.distance_unit,
          operatingDistance.is_favorite,
          operatingDistance.id,
        ]
      );

      const updatedDistance: Distance = {
        ...operatingDistance,
        name: nameInput,
        distance: distance,
      };

      const updatedDistances = UpdateItemInList(distances, updatedDistance);

      sortDistancesByActiveCategory(updatedDistances);

      resetOperatingDistance();
      presetModal.onClose();

      toast.success("Distance Updated");
    } catch (error) {
      console.log(error);
    }
  };

  const updatePlateCollection = async () => {
    if (operationType !== "edit" || operatingPlateCollection.id === 0) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        `UPDATE plate_collections 
         SET name = $1, handle_id = $2, available_plates_string = $3, num_handles = $4,
         weight_unit = $5 
         WHERE id = $6`,
        [
          operatingPlateCollection.name,
          operatingPlateCollection.handle_id,
          operatingPlateCollection.available_plates_string,
          operatingPlateCollection.num_handles,
          operatingPlateCollection.weight_unit,
          operatingDistance.id,
        ]
      );

      const updatedPlateCollections = UpdateItemInList(
        plateCollections,
        operatingPlateCollection
      );

      setPlateCollections(updatedPlateCollections);

      resetOperatingPlateCollection();
      plateCollectionModal.plateCollectionModal.onClose();

      toast.success("Plate Collection Added");
    } catch (error) {
      console.log(error);
    }
  };

  const deleteEquipmentWeight = async (
    equipmentWeightToDelete?: EquipmentWeight
  ) => {
    const equipmentWeight = equipmentWeightToDelete ?? operatingEquipmentWeight;

    if (equipmentWeight.id === 0) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from equipment_weights WHERE id = $1", [
        equipmentWeight.id,
      ]);

      const updatedEquipmentWeights = DeleteItemFromList(
        equipmentWeights,
        equipmentWeight.id
      );

      setEquipmentWeights(updatedEquipmentWeights);

      toast.success("Equipment Weight Deleted");
    } catch (error) {
      console.log(error);
    }

    resetOperatingEquipment();
    deleteModal.onClose();
  };

  const deleteDistance = async (distanceToDelete?: Distance) => {
    const distance = distanceToDelete ?? operatingDistance;

    if (distance.id === 0) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from distances WHERE id = $1", [distance.id]);

      const updatedDistances = DeleteItemFromList(distances, distance.id);

      setDistances(updatedDistances);

      toast.success("Distance Deleted");
    } catch (error) {
      console.log(error);
    }

    resetOperatingDistance();
    deleteModal.onClose();
  };

  const deletePlateCollection = async (
    plateCollectionToDelete?: PlateCollection
  ) => {
    const plateCollection = plateCollectionToDelete ?? operatingPlateCollection;

    if (plateCollection.id === 0) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from plate_collections WHERE id = $1", [
        plateCollection.id,
      ]);

      const updatedPlateCollections = DeleteItemFromList(
        plateCollections,
        plateCollection.id
      );

      setPlateCollections(updatedPlateCollections);

      toast.success("Plate Collection Deleted");
    } catch (error) {
      console.log(error);
    }

    resetOperatingPlateCollection();
    deleteModal.onClose();
  };

  const handleCreateButton = async () => {
    if (presetsType === "equipment") await addEquipmentWeight();
    if (presetsType === "distance") await addDistance();
  };

  const handleUpdateButton = async () => {
    if (presetsType === "equipment") await updateEquipmentWeight();
    if (presetsType === "distance") await updateDistance();
  };

  const resetOperatingEquipment = () => {
    if (userSettings === undefined) return;

    setPresetsType("equipment");
    setOperationType("add");
    setNameInput("");
    setValueInput("");
    setOperatingEquipmentWeight({
      ...defaultEquipmentWeight,
      weight_unit: defaultWeightUnit.current,
    });
    setIsOperatingPlateCollection(false);
  };

  const resetOperatingDistance = () => {
    if (userSettings === undefined) return;

    setPresetsType("distance");
    setOperationType("add");
    setNameInput("");
    setValueInput("");
    setOperatingDistance({
      ...defaultDistance,
      distance_unit: defaultDistanceUnit.current,
    });
    setIsOperatingPlateCollection(false);
  };

  const resetOperatingPlateCollection = () => {
    if (userSettings === undefined) return;

    setOperationType("add");
    setOperatingPlateCollection({
      ...defaultPlateCollection,
      weight_unit: defaultWeightUnit.current,
    });
    setOtherUnitPlateCollection({
      ...defaultPlateCollection,
      weight_unit: defaultWeightUnit.current,
    });
    setIsOperatingPlateCollection(false);
  };

  const handleAddEquipmentWeightButton = () => {
    resetOperatingEquipment();
    presetModal.onOpen();
  };

  const handleAddDistanceButton = () => {
    resetOperatingDistance();
    presetModal.onOpen();
  };

  const handleAddPlateCollectionButton = () => {
    resetOperatingPlateCollection();
    plateCollectionModal.resetAndOpenPlateCollectionModal();
  };

  const handleEquipmentWeightOptionSelection = (
    key: string,
    equipment: EquipmentWeight
  ) => {
    if (userSettings === undefined) return;

    setPresetsType("equipment");
    setOperatingEquipmentWeight(equipment);
    setValueInput(equipment.weight.toString());
    setIsOperatingPlateCollection(false);

    if (key === "edit") {
      setOperationType("edit");
      setNameInput(equipment.name);
      presetModal.onOpen();
    } else if (key === "delete" && !!userSettings.never_show_delete_modal) {
      deleteEquipmentWeight(equipment);
    } else if (key === "delete") {
      setOperationType("delete");
      deleteModal.onOpen();
    } else if (key === "toggle-favorite") {
      toggleFavoriteEquipmentWeight(equipment);
      resetOperatingEquipment();
    }
  };

  const handleDistanceOptionSelection = (key: string, distance: Distance) => {
    if (userSettings === undefined) return;

    setPresetsType("distance");
    setOperatingDistance(distance);
    setValueInput(distance.distance.toString());
    setIsOperatingPlateCollection(false);

    if (key === "edit") {
      setOperationType("edit");
      setNameInput(distance.name);
      presetModal.onOpen();
    } else if (key === "delete" && !!userSettings.never_show_delete_modal) {
      deleteDistance(distance);
    } else if (key === "delete") {
      setOperationType("delete");
      deleteModal.onOpen();
    } else if (key === "toggle-favorite") {
      toggleFavoriteDistance(distance);
      resetOperatingDistance();
    }
  };

  const handlePlateCollectionOptionSelection = (
    key: string,
    plateCollection: PlateCollection
  ) => {
    if (userSettings === undefined) return;

    setOperatingPlateCollection(plateCollection);
    setOtherUnitPlateCollection({
      ...defaultPlateCollection,
      weight_unit: plateCollection.weight_unit === "kg" ? "lbs" : "kg",
    });
    setIsOperatingPlateCollection(true);

    if (key === "edit") {
      setOperationType("edit");
      plateCollectionModal.resetAndOpenPlateCollectionModal();
    } else if (key === "delete" && !!userSettings.never_show_delete_modal) {
      deletePlateCollection(plateCollection);
    } else if (key === "delete") {
      setOperationType("delete");
      deleteModal.onOpen();
    } else if (key === "set-default") {
      updateDefaultPlateCollectionId(plateCollection.id);
      resetOperatingPlateCollection();
    }
  };

  const updateDefaultPlateCollectionId = async (plateCollectionId: number) => {
    if (
      userSettings === undefined ||
      plateCollectionId === userSettings.default_plate_collection_id
    )
      return;

    await UpdateUserSetting(
      "default_plate_collection_id",
      plateCollectionId,
      userSettings,
      setUserSettings
    );
  };

  const handleRestoreEquipmentButton = async () => {
    setPresetsType("equipment");
    setUnitsModal.onOpen();
  };

  const handleRestoreDistanceButton = async () => {
    setPresetsType("distance");
    setUnitsModal.onOpen();
  };

  const createDefaultEquipmentWeights = async (useMetricUnits: boolean) => {
    if (presetsType !== "equipment") return;

    await CreateDefaultEquipmentWeights(useMetricUnits);
    await getEquipmentWeights();
    setUnitsModal.onClose();
    toast.success("Default Equipment Weights Restored");
  };

  const createDefaultDistances = async (useMetricUnits: boolean) => {
    if (presetsType !== "distance") return;

    await CreateDefaultDistances(useMetricUnits);
    await getDistances();
    setUnitsModal.onClose();
    toast.success("Default Distances Restored");
  };

  const handleDeleteButton = async () => {
    if (isOperatingPlateCollection) {
      await deletePlateCollection();
    } else {
      if (presetsType === "equipment") {
        await deleteEquipmentWeight();
      } else {
        await deleteDistance();
      }
    }
  };

  const changeTab = (key: PresetTab) => {
    if (selectedTab === key) return;

    if (showResetFilterButton) resetFilter();

    if (key === "equipment") setPresetsType("equipment");

    if (key === "distance") setPresetsType("distance");

    setSelectedTab(key);
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <DeleteModal
        deleteModal={deleteModal}
        header={
          isOperatingPlateCollection
            ? "Delete Plate Collection"
            : presetsType === "equipment"
            ? "Delete Equipment Weight"
            : "Delete Distance"
        }
        body={
          <p>
            Are you sure you want to permanently delete{" "}
            <span className="text-secondary truncate max-w-[23rem] inline-block align-top">
              {isOperatingPlateCollection
                ? operatingPlateCollection.name
                : presetsType === "equipment"
                ? operatingEquipmentWeight.name
                : operatingDistance.name}
            </span>
            ?
          </p>
        }
        deleteButtonAction={handleDeleteButton}
      />
      <PlateCollectionModal
        usePlateCollectionModal={plateCollectionModal}
        plateCollection={operatingPlateCollection}
        setPlateCollection={setOperatingPlateCollection}
        usePresetsList={presetsList}
        buttonAction={
          operationType === "edit" ? updatePlateCollection : addPlateCollection
        }
      />
      <FilterPresetsListModal
        usePresetsList={presetsList}
        userSettings={userSettings}
      />
      <Modal
        isOpen={presetModal.isOpen}
        onOpenChange={presetModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {operationType === "edit" ? "Edit" : "New"}{" "}
                {presetsType === "equipment" ? "Equipment Weight" : "Distance"}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-0.5">
                  <Input
                    className="h-[5rem]"
                    value={nameInput}
                    isInvalid={!isNameInputValid}
                    label="Name"
                    errorMessage={!isNameInputValid && "Name can't be empty"}
                    variant="faded"
                    onValueChange={(value) => setNameInput(value)}
                    isRequired
                    isClearable
                  />
                  <div className="flex justify-between gap-2 items-center">
                    <Input
                      value={valueInput}
                      label={
                        presetsType === "equipment" ? "Weight" : "Distance"
                      }
                      variant="faded"
                      onValueChange={(value) => setValueInput(value)}
                      isInvalid={isValueInputInvalid}
                      isRequired
                      isClearable
                    />
                    {presetsType === "equipment" ? (
                      <WeightUnitDropdown
                        value={operatingEquipmentWeight.weight_unit}
                        setEquipmentWeight={setOperatingEquipmentWeight}
                        targetType="equipment"
                        showLabel
                      />
                    ) : (
                      <DistanceUnitDropdown
                        value={operatingDistance.distance_unit}
                        setDistance={setOperatingDistance}
                        targetType="distance"
                        showLabel
                      />
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={
                    operationType === "edit"
                      ? handleUpdateButton
                      : handleCreateButton
                  }
                  isDisabled={isNewPresetInvalid}
                >
                  {operationType === "edit" ? "Update" : "Create"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={setUnitsModal.isOpen}
        onOpenChange={setUnitsModal.onOpenChange}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Choose Unit Type</ModalHeader>
              <ModalBody>
                <p>Use Metric or Imperial units?</p>
              </ModalBody>
              <ModalFooter className="flex justify-center gap-5">
                <Button
                  className="text-lg font-medium"
                  size="lg"
                  color="primary"
                  onPress={
                    presetsType === "equipment"
                      ? () => createDefaultEquipmentWeights(true)
                      : () => createDefaultDistances(true)
                  }
                >
                  Metric
                </Button>
                <Button
                  className="text-lg font-medium"
                  size="lg"
                  color="primary"
                  onPress={
                    presetsType === "equipment"
                      ? () => createDefaultEquipmentWeights(false)
                      : () => createDefaultDistances(false)
                  }
                >
                  Imperial
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col items-center">
        <Tabs
          className="sticky top-[4.5rem] z-30"
          aria-label="Preset Types"
          size="sm"
          fullWidth
          selectedKey={selectedTab}
          onSelectionChange={(key) => changeTab(key as PresetTab)}
        >
          <Tab
            className="flex flex-col gap-1 w-full px-0 py-1.5"
            key="equipment"
            title="Equipment Weights"
          >
            {!isEquipmentWeightListLoaded.current ? (
              <LoadingSpinner />
            ) : (
              <>
                <ListPageSearchInput
                  header="Equipment Weight List"
                  filterQuery={filterQueryEquipment}
                  setFilterQuery={setFilterQueryEquipment}
                  filteredListLength={filteredEquipmentWeights.length}
                  totalListLength={equipmentWeights.length}
                  isListFiltered={filterMap.size > 0}
                  extraTopSpace={true}
                  bottomContent={
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <Button
                          color="secondary"
                          variant="flat"
                          onPress={handleAddEquipmentWeightButton}
                          size="sm"
                        >
                          New Equipment Weight
                        </Button>
                        <PresetsListOptions usePresetsList={presetsList} />
                      </div>
                      {filterMap.size > 0 && (
                        <ListFilters
                          filterMap={filterMap}
                          removeFilter={removeFilter}
                          prefixMap={prefixMap}
                        />
                      )}
                    </div>
                  }
                />
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-col gap-1">
                    {filteredEquipmentWeights.map((equipment) => (
                      <div
                        className="flex justify-between items-center cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                        key={`equipment-${equipment.id}`}
                        onClick={() =>
                          handleEquipmentWeightOptionSelection(
                            "edit",
                            equipment
                          )
                        }
                      >
                        <div className="flex flex-col justify-start items-start pl-2 py-1">
                          <span className="w-[15.5rem] truncate text-left">
                            {equipment.name}
                          </span>
                          <span className="text-xs text-secondary text-left">
                            {equipment.weight} {equipment.weight_unit}
                          </span>
                        </div>
                        <div className="flex items-center pr-1">
                          <FavoriteButton
                            name={equipment.name}
                            isFavorite={!!equipment.is_favorite}
                            item={equipment}
                            toggleFavorite={toggleFavoriteEquipmentWeight}
                          />
                          <Dropdown shouldBlockScroll={false}>
                            <DropdownTrigger>
                              <Button
                                aria-label={`Toggle ${equipment.name} Options Menu`}
                                isIconOnly
                                className="z-1"
                                radius="lg"
                                variant="light"
                              >
                                <VerticalMenuIcon size={19} color="#888" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                              aria-label={`Option Menu For ${equipment.name} Equipment Weight`}
                              onAction={(key) =>
                                handleEquipmentWeightOptionSelection(
                                  key as string,
                                  equipment
                                )
                              }
                            >
                              <DropdownItem key="edit">Edit</DropdownItem>
                              <DropdownItem
                                key="toggle-favorite"
                                className="text-secondary"
                              >
                                {equipment.is_favorite
                                  ? "Remove Favorite"
                                  : "Set Favorite"}
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                              >
                                Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </div>
                    ))}
                    {filteredEquipmentWeights.length === 0 && (
                      <EmptyListLabel itemName="Equipment Weights" />
                    )}
                  </div>
                  <div className="flex justify-center">
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={handleRestoreEquipmentButton}
                    >
                      Restore Default Equipment Weights
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Tab>
          <Tab
            className="flex flex-col gap-1 w-full px-0 py-1.5"
            key="distance"
            title="Distances"
          >
            {!isDistanceListLoaded.current ? (
              <LoadingSpinner />
            ) : (
              <>
                <ListPageSearchInput
                  header="Distance List"
                  filterQuery={filterQueryDistance}
                  setFilterQuery={setFilterQueryDistance}
                  filteredListLength={filteredDistances.length}
                  totalListLength={distances.length}
                  isListFiltered={filterMap.size > 0}
                  extraTopSpace={true}
                  bottomContent={
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <Button
                          color="secondary"
                          variant="flat"
                          onPress={handleAddDistanceButton}
                          size="sm"
                        >
                          New Distance
                        </Button>
                        <PresetsListOptions usePresetsList={presetsList} />
                      </div>
                      {filterMap.size > 0 && (
                        <ListFilters
                          filterMap={filterMap}
                          removeFilter={removeFilter}
                          prefixMap={prefixMap}
                        />
                      )}
                    </div>
                  }
                />
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-col gap-1">
                    {filteredDistances.map((distance) => (
                      <div
                        className="flex justify-between items-center cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                        key={`distance-${distance.id}`}
                        onClick={() =>
                          handleDistanceOptionSelection("edit", distance)
                        }
                      >
                        <div className="flex flex-col justify-start items-start pl-2 py-1">
                          <span className="w-[18.5rem] truncate text-left">
                            {distance.name}
                          </span>
                          <span className="text-xs text-secondary text-left">
                            {distance.distance} {distance.distance_unit}
                          </span>
                        </div>
                        <div className="flex items-center pr-1">
                          <FavoriteButton
                            name={distance.name}
                            isFavorite={!!distance.is_favorite}
                            item={distance}
                            toggleFavorite={toggleFavoriteDistance}
                          />
                          <Dropdown shouldBlockScroll={false}>
                            <DropdownTrigger>
                              <Button
                                aria-label={`Toggle ${distance.name} Options Menu`}
                                isIconOnly
                                className="z-1"
                                radius="lg"
                                variant="light"
                              >
                                <VerticalMenuIcon size={19} color="#888" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                              aria-label={`Option Menu For ${distance.name} Distance`}
                              onAction={(key) =>
                                handleDistanceOptionSelection(
                                  key as string,
                                  distance
                                )
                              }
                            >
                              <DropdownItem key="edit">Edit</DropdownItem>
                              <DropdownItem
                                key="toggle-favorite"
                                className="text-secondary"
                              >
                                {distance.is_favorite
                                  ? "Remove Favorite"
                                  : "Set Favorite"}
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                              >
                                Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </div>
                    ))}
                    {filteredDistances.length === 0 && (
                      <EmptyListLabel itemName="Distances" />
                    )}
                  </div>
                  <div className="flex justify-center">
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={handleRestoreDistanceButton}
                    >
                      Restore Default Distances
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Tab>
          <Tab
            className="flex flex-col gap-1 w-full px-0 py-1.5"
            key="plate"
            title="Plate Collections"
          >
            {!isEquipmentWeightListLoaded.current ? (
              <LoadingSpinner />
            ) : (
              <>
                <ListPageSearchInput
                  header="Plate Collection List"
                  filterQuery={filterQueryPlateCollection}
                  setFilterQuery={setFilterQueryPlateCollection}
                  filteredListLength={filteredPlateCollections.length}
                  totalListLength={plateCollections.length}
                  isListFiltered={false}
                  extraTopSpace={true}
                  bottomContent={
                    <div className="flex justify-between gap-1 w-full items-center">
                      <Button
                        color="secondary"
                        variant="flat"
                        onPress={handleAddPlateCollectionButton}
                        size="sm"
                      >
                        New Plate Collection
                      </Button>
                    </div>
                  }
                />
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-col gap-1">
                    {filteredPlateCollections.map((plate) => {
                      const isAvailablePlatesStringInvalid =
                        plate.availablePlatesMap!.size === 0;
                      const isPlateCollectionInvalid =
                        isAvailablePlatesStringInvalid ||
                        plate.handle === undefined;

                      return (
                        <div
                          className="flex justify-between items-center cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                          key={`plate-calculation-${plate.id}`}
                          onClick={() =>
                            handlePlateCollectionOptionSelection("edit", plate)
                          }
                        >
                          <div className="flex flex-col justify-start items-start pl-2 py-1">
                            <span className="w-[17.5rem] truncate">
                              {plate.name}
                            </span>
                            {isAvailablePlatesStringInvalid ? (
                              <span className="text-xs text-red-700">
                                No Available Plates
                              </span>
                            ) : (
                              <span className="w-[17.5rem] truncate text-xs text-secondary">
                                {plate.formattedAvailablePlatesString}{" "}
                                {plate.weight_unit}
                              </span>
                            )}
                            <span className="text-xs text-stone-400">
                              {plate.num_handles === 1
                                ? "1 Handle"
                                : "2 Handles"}
                              {plate.handle !== undefined ? (
                                ` (${plate.handle.name}: ${plate.handle.weight} ${plate.handle.weight_unit})`
                              ) : (
                                <span className="text-red-700">
                                  {" "}
                                  (Unknown Handle)
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center pr-1">
                            {!isPlateCollectionInvalid && (
                              <PlateCollectionButton
                                userSettings={userSettings}
                                setUserSettings={setUserSettings}
                                plateCollection={plate}
                              />
                            )}
                            <Dropdown shouldBlockScroll={false}>
                              <DropdownTrigger>
                                <Button
                                  aria-label={`Toggle ${plate.name} Options Menu`}
                                  isIconOnly
                                  className="z-1"
                                  radius="lg"
                                  variant="light"
                                >
                                  <VerticalMenuIcon size={19} color="#888" />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                aria-label={`Option Menu For ${plate.name} Plate Collection`}
                                onAction={(key) =>
                                  handlePlateCollectionOptionSelection(
                                    key as string,
                                    plate
                                  )
                                }
                              >
                                <DropdownItem key="edit">Edit</DropdownItem>
                                <DropdownItem
                                  className={
                                    plate.id ===
                                      userSettings.default_plate_collection_id ||
                                    isPlateCollectionInvalid
                                      ? "hidden"
                                      : "text-success"
                                  }
                                  key="set-default"
                                >
                                  Set As Default
                                </DropdownItem>
                                <DropdownItem
                                  key="delete"
                                  className="text-danger"
                                >
                                  Delete
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </div>
                      );
                    })}
                    {filteredPlateCollections.length === 0 && (
                      <EmptyListLabel itemName="Plate Collections" />
                    )}
                  </div>
                </div>
              </>
            )}
          </Tab>
        </Tabs>
      </div>
    </>
  );
}
