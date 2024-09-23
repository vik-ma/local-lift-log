import { useState, useEffect, useMemo } from "react";
import {
  DistanceUnitDropdown,
  LoadingSpinner,
  WeightUnitDropdown,
  DeleteModal,
  ListPageSearchInput,
  FavoriteButton,
  EmptyListLabel,
} from "../components";
import Database from "tauri-plugin-sql-api";
import { EquipmentWeight, UserSettingsOptional, Distance } from "../typings";
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
  Checkbox,
  Tabs,
  Tab,
} from "@nextui-org/react";
import {
  ConvertNumberToTwoDecimals,
  CreateDefaultDistances,
  CreateDefaultEquipmentWeights,
  DeleteItemFromList,
  GetDefaultUnitValues,
  IsStringInvalidNumberOr0,
  UpdateItemInList,
} from "../helpers";
import toast, { Toaster } from "react-hot-toast";
import { usePresetsList, useValidateName } from "../hooks";
import { VerticalMenuIcon, WeightPlatesIcon } from "../assets";

type OperationType = "add" | "edit" | "delete";

type PresetType = "equipment" | "distance";

export default function Presets() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userSettings, setUserSettings] = useState<UserSettingsOptional>();
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [presetType, setPresetType] = useState<PresetType>("equipment");
  const [nameInput, setNameInput] = useState<string>("");
  const [valueInput, setValueInput] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("equipment");

  const defaultEquipmentWeight: EquipmentWeight = useMemo(() => {
    return {
      id: 0,
      name: "",
      weight: 0,
      weight_unit: "kg",
      is_favorite: 0,
      is_in_plate_calculator: 0,
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

  const {
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
    handleListFavoritesFirstChange,
    favoritesCheckboxValueEquipment,
    favoritesCheckboxValueDistance,
    toggleFavoriteEquipmentWeight,
    toggleFavoriteDistance,
    sortCategoryEquipment,
    sortCategoryDistance,
    handleSortOptionSelectionEquipment,
    handleSortOptionSelectionDistance,
  } = usePresetsList(true, true);

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings: UserSettingsOptional | undefined =
        await GetDefaultUnitValues();
      if (userSettings !== undefined) {
        setUserSettings(userSettings);
        setOperatingEquipmentWeight((prev) => ({
          ...prev,
          weight_unit: userSettings.default_unit_weight!,
        }));
        setOperatingDistance((prev) => ({
          ...prev,
          distance_unit: userSettings.default_unit_distance!,
        }));
      }
      setIsLoading(false);
    };

    loadUserSettings();
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
      presetType !== "equipment"
    )
      return;

    const weight = ConvertNumberToTwoDecimals(Number(valueInput));

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        `INSERT into equipment_weights (name, weight, weight_unit, is_favorite) 
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

      setEquipmentWeights([...equipmentWeights, newEquipment]);

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
      presetType !== "distance"
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

      setDistances([...distances, newDistance]);

      resetOperatingDistance();
      presetModal.onClose();

      toast.success("Distance Added");
    } catch (error) {
      console.log(error);
    }
  };

  const updateEquipmentWeight = async () => {
    if (
      operatingEquipmentWeight.id === 0 ||
      isNewPresetInvalid ||
      operationType !== "edit" ||
      presetType !== "equipment"
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

      setEquipmentWeights(updatedEquipmentWeights);

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
      presetType !== "distance"
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

      setDistances(updatedDistances);

      resetOperatingDistance();
      presetModal.onClose();

      toast.success("Distance Updated");
    } catch (error) {
      console.log(error);
    }
  };

  const deleteEquipmentWeight = async () => {
    if (
      operatingEquipmentWeight.id === 0 ||
      operationType !== "delete" ||
      presetType !== "equipment"
    )
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from equipment_weights WHERE id = $1", [
        operatingEquipmentWeight.id,
      ]);

      const updatedEquipmentWeights = DeleteItemFromList(
        equipmentWeights,
        operatingEquipmentWeight.id
      );

      setEquipmentWeights(updatedEquipmentWeights);

      toast.success("Equipment Weight Deleted");
    } catch (error) {
      console.log(error);
    }

    resetOperatingEquipment();
    deleteModal.onClose();
  };

  const deleteDistance = async () => {
    if (
      operatingDistance.id === 0 ||
      operationType !== "delete" ||
      presetType !== "distance"
    )
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from distances WHERE id = $1", [operatingDistance.id]);

      const updatedDistances = DeleteItemFromList(
        distances,
        operatingDistance.id
      );

      setDistances(updatedDistances);

      toast.success("Distance Deleted");
    } catch (error) {
      console.log(error);
    }

    resetOperatingDistance();
    deleteModal.onClose();
  };

  const handleCreateButton = async () => {
    if (presetType === "equipment") await addEquipmentWeight();
    if (presetType === "distance") await addDistance();
  };

  const handleUpdateButton = async () => {
    if (presetType === "equipment") await updateEquipmentWeight();
    if (presetType === "distance") await updateDistance();
  };

  const resetOperatingEquipment = () => {
    if (userSettings === undefined) return;

    setPresetType("equipment");
    setOperationType("add");
    setNameInput("");
    setValueInput("");
    setOperatingEquipmentWeight({
      ...defaultEquipmentWeight,
      weight_unit: userSettings.default_unit_weight!,
    });
  };

  const resetOperatingDistance = () => {
    if (userSettings === undefined) return;

    setPresetType("distance");
    setOperationType("add");
    setNameInput("");
    setValueInput("");
    setOperatingDistance({
      ...defaultDistance,
      distance_unit: userSettings.default_unit_distance!,
    });
  };

  const handleAddEquipmentWeightButton = () => {
    resetOperatingEquipment();
    presetModal.onOpen();
  };

  const handleAddDistanceButton = () => {
    resetOperatingDistance();
    presetModal.onOpen();
  };

  const handleEquipmentWeightOptionSelection = (
    key: string,
    equipment: EquipmentWeight
  ) => {
    setPresetType("equipment");
    setOperatingEquipmentWeight(equipment);
    setValueInput(equipment.weight.toString());

    if (key === "edit") {
      setOperationType("edit");
      setNameInput(equipment.name);
      presetModal.onOpen();
    } else if (key === "delete") {
      setOperationType("delete");
      deleteModal.onOpen();
    }
  };

  const handleDistanceOptionSelection = (key: string, distance: Distance) => {
    setPresetType("distance");
    setOperatingDistance(distance);
    setValueInput(distance.distance.toString());

    if (key === "edit") {
      setOperationType("edit");
      setNameInput(distance.name);
      presetModal.onOpen();
    } else if (key === "delete") {
      setOperationType("delete");
      deleteModal.onOpen();
    }
  };

  const handleRestoreEquipmentButton = async () => {
    setPresetType("equipment");
    setUnitsModal.onOpen();
  };

  const handleRestoreDistanceButton = async () => {
    setPresetType("distance");
    setUnitsModal.onOpen();
  };

  const createDefaultEquipmentWeights = async (useMetricUnits: boolean) => {
    if (presetType !== "equipment") return;

    await CreateDefaultEquipmentWeights(useMetricUnits);
    await getEquipmentWeights();
    setUnitsModal.onClose();
    toast.success("Default Equipment Weights Restored");
  };

  const createDefaultDistances = async (useMetricUnits: boolean) => {
    if (presetType !== "distance") return;

    await CreateDefaultDistances(useMetricUnits);
    await getDistances();
    setUnitsModal.onClose();
    toast.success("Default Distances Restored");
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <DeleteModal
        deleteModal={deleteModal}
        header={
          presetType === "equipment"
            ? "Delete Equipment Weight"
            : "Delete Distance"
        }
        body={
          <p className="break-words">
            Are you sure you want to permanently delete{" "}
            {presetType === "equipment"
              ? operatingEquipmentWeight.name
              : operatingDistance.name}
            ?
          </p>
        }
        deleteButtonAction={
          presetType === "equipment" ? deleteEquipmentWeight : deleteDistance
        }
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
                {presetType === "equipment" ? "Equipment Weight" : "Distance"}
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
                      label={presetType === "equipment" ? "Weight" : "Distance"}
                      variant="faded"
                      onValueChange={(value) => setValueInput(value)}
                      isInvalid={isValueInputInvalid}
                      isRequired
                      isClearable
                    />
                    {presetType === "equipment" ? (
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
                    presetType === "equipment"
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
                    presetType === "equipment"
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
          className="sticky top-16 z-30"
          aria-label="Preset Type Option"
          fullWidth
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
        >
          <Tab
            className="w-full px-0"
            key="equipment"
            title="Equipment Weights"
          >
            <>
              <ListPageSearchInput
                header="Equipment Weight List"
                filterQuery={filterQueryEquipment}
                setFilterQuery={setFilterQueryEquipment}
                filteredListLength={filteredEquipmentWeights.length}
                totalListLength={equipmentWeights.length}
                extraTopSpace={true}
                bottomContent={
                  <div className="flex justify-between gap-1 w-full items-center">
                    <Button
                      color="secondary"
                      variant="flat"
                      onPress={handleAddEquipmentWeightButton}
                      size="sm"
                    >
                      New Equipment Weight
                    </Button>
                    <Checkbox
                      className="px-3"
                      isSelected={favoritesCheckboxValueEquipment}
                      onValueChange={(value) =>
                        handleListFavoritesFirstChange("equipment", value)
                      }
                      size="sm"
                    >
                      List Favorites First
                    </Checkbox>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button className="z-1" variant="flat" size="sm">
                          Sort By
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        selectionMode="single"
                        selectedKeys={[sortCategoryEquipment]}
                        onAction={(key) =>
                          handleSortOptionSelectionEquipment(key as string)
                        }
                      >
                        <DropdownItem key="name">Name (A-Z)</DropdownItem>
                        <DropdownItem key="weight-desc">
                          Weight (High-Low)
                        </DropdownItem>
                        <DropdownItem key="weight-asc">
                          Weight (Low-High)
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                }
              />
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-col gap-1">
                    {filteredEquipmentWeights.map((equipment) => (
                      <div
                        className="flex justify-between items-center cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                        key={`equipment-${equipment.id}`}
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
                          <Button
                            aria-label={
                              equipment.is_in_plate_calculator === 1
                                ? `Remove ${equipment.name} From Plate Calculator`
                                : `Add ${equipment.name} To Plate Calculator`
                            }
                            isIconOnly
                            className="z-1 w-[3.5rem]"
                            color={
                              equipment.is_in_plate_calculator === 1
                                ? "success"
                                : "default"
                            }
                            variant="light"
                            // onPress={() => togglePlateCalculator(item)}
                          >
                            <WeightPlatesIcon
                              isChecked={equipment.is_in_plate_calculator === 1}
                              size={31}
                            />
                          </Button>
                          <FavoriteButton
                            name={equipment.name}
                            isFavorite={!!equipment.is_favorite}
                            item={equipment}
                            toggleFavorite={toggleFavoriteEquipmentWeight}
                          />
                          <Dropdown>
                            <DropdownTrigger>
                              <Button
                                aria-label={`Toggle ${equipment.name} Options Menu`}
                                isIconOnly
                                className="z-1"
                                radius="lg"
                                variant="light"
                              >
                                <VerticalMenuIcon size={19} />
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
              )}
            </>
          </Tab>
          <Tab className="w-full px-0" key="distance" title="Distances">
            <ListPageSearchInput
              header="Distance List"
              filterQuery={filterQueryDistance}
              setFilterQuery={setFilterQueryDistance}
              filteredListLength={filteredDistances.length}
              totalListLength={distances.length}
              extraTopSpace={true}
              bottomContent={
                <div className="flex justify-between gap-1 w-full items-center">
                  <Button
                    color="secondary"
                    variant="flat"
                    onPress={handleAddDistanceButton}
                    size="sm"
                  >
                    New Distance
                  </Button>
                  <Checkbox
                    className="px-3"
                    isSelected={favoritesCheckboxValueDistance}
                    onValueChange={(value) =>
                      handleListFavoritesFirstChange("distance", value)
                    }
                    size="sm"
                  >
                    List Favorites First
                  </Checkbox>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button className="z-1" variant="flat" size="sm">
                        Sort By
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      selectionMode="single"
                      selectedKeys={[sortCategoryDistance]}
                      onAction={(key) =>
                        handleSortOptionSelectionDistance(key as string)
                      }
                    >
                      <DropdownItem key="name">Name (A-Z)</DropdownItem>
                      <DropdownItem key="distance-desc">
                        Distance (High-Low)
                      </DropdownItem>
                      <DropdownItem key="distance-asc">
                        Distance (Low-High)
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              }
            />
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-col gap-1">
                  {filteredDistances.map((distance) => (
                    <div
                      className="flex justify-between items-center cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                      key={`distance-${distance.id}`}
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
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              aria-label={`Toggle ${distance.name} Options Menu`}
                              isIconOnly
                              className="z-1"
                              radius="lg"
                              variant="light"
                            >
                              <VerticalMenuIcon size={19} />
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
                            <DropdownItem key="delete" className="text-danger">
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
            )}
          </Tab>
        </Tabs>
      </div>
    </>
  );
}
