import { useState, useEffect, useMemo, useCallback } from "react";
import {
  DistanceUnitDropdown,
  LoadingSpinner,
  WeightUnitDropdown,
  DeleteModal,
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
} from "@nextui-org/react";
import {
  ConvertNumberToTwoDecimals,
  CreateDefaultDistances,
  CreateDefaultEquipmentWeights,
  GetDefaultUnitValues,
  IsStringInvalidNumberOr0,
} from "../helpers";
import toast, { Toaster } from "react-hot-toast";
import { useValidateName } from "../hooks";
import { VerticalMenuIcon } from "../assets";

type OperationType = "add" | "edit" | "delete";

type PresetType = "equipment" | "distance";

export default function Presets() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [equipmentWeights, setEquipmentWeights] = useState<EquipmentWeight[]>(
    []
  );
  const [distances, setDistances] = useState<Distance[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettingsOptional>();
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [presetType, setPresetType] = useState<PresetType>("equipment");
  const [nameInput, setNameInput] = useState<string>("");

  const defaultEquipmentWeight: EquipmentWeight = useMemo(() => {
    return {
      id: 0,
      name: "",
      weight: 0,
      weight_unit: "kg",
      input: "",
    };
  }, []);

  const defaultDistance: Distance = useMemo(() => {
    return {
      id: 0,
      name: "",
      distance: 0,
      distance_unit: "km",
      input: "",
    };
  }, []);

  const [operatingEquipmentWeight, setOperatingEquipmentWeight] =
    useState<EquipmentWeight>(defaultEquipmentWeight);
  const [operatingDistance, setOperatingDistance] =
    useState<Distance>(defaultDistance);

  const deleteModal = useDisclosure();
  const newPresetModal = useDisclosure();
  const setUnitsModal = useDisclosure();

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
    } catch (error) {
      console.log(error);
    }
  }, []);

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

    getEquipmentWeights();
    getDistances();
    loadUserSettings();
  }, [getEquipmentWeights, getDistances]);

  const isNameInputValid = useValidateName(nameInput);

  const isWeightInputInvalid = useMemo(() => {
    return IsStringInvalidNumberOr0(operatingEquipmentWeight.input ?? "");
  }, [operatingEquipmentWeight.input]);

  const isDistanceInputInvalid = useMemo(() => {
    return IsStringInvalidNumberOr0(operatingDistance.input ?? "");
  }, [operatingDistance.input]);

  const isNewPresetInvalid = useMemo(() => {
    if (!isNameInputValid) return true;
    if (isWeightInputInvalid && presetType === "equipment") return true;
    if (isDistanceInputInvalid && presetType === "distance") return true;
    return false;
  }, [
    isNameInputValid,
    isWeightInputInvalid,
    isDistanceInputInvalid,
    presetType,
  ]);

  const addEquipmentWeight = async () => {
    if (
      isNewPresetInvalid ||
      operationType !== "add" ||
      presetType !== "equipment"
    )
      return;

    const weight = ConvertNumberToTwoDecimals(
      Number(operatingEquipmentWeight.input)
    );

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        "INSERT into equipment_weights (name, weight, weight_unit) VALUES ($1, $2, $3)",
        [nameInput, weight, operatingEquipmentWeight.weight_unit]
      );

      const newEquipment: EquipmentWeight = {
        id: result.lastInsertId,
        name: nameInput,
        weight: weight,
        weight_unit: operatingEquipmentWeight.weight_unit,
      };

      setEquipmentWeights([...equipmentWeights, newEquipment]);

      resetOperatingEquipment();
      newPresetModal.onClose();

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

    const distance = ConvertNumberToTwoDecimals(
      Number(operatingDistance.input)
    );

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        "INSERT into distances (name, distance, distance_unit) VALUES ($1, $2, $3)",
        [nameInput, distance, operatingDistance.distance_unit]
      );

      const newDistance: Distance = {
        id: result.lastInsertId,
        name: nameInput,
        distance: distance,
        distance_unit: operatingDistance.distance_unit,
      };

      setDistances([...distances, newDistance]);

      resetOperatingDistance();
      newPresetModal.onClose();

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

    const weight = ConvertNumberToTwoDecimals(
      Number(operatingEquipmentWeight.input)
    );

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE equipment_weights SET name = $1, weight = $2, weight_unit = $3 WHERE id = $4",
        [
          nameInput,
          weight,
          operatingEquipmentWeight.weight_unit,
          operatingEquipmentWeight.id,
        ]
      );

      const updatedEquipment: EquipmentWeight = {
        ...operatingEquipmentWeight,
        name: nameInput,
        weight: weight,
      };

      setEquipmentWeights((prev) =>
        prev.map((item) =>
          item.id === operatingEquipmentWeight.id ? updatedEquipment : item
        )
      );

      resetOperatingEquipment();
      newPresetModal.onClose();

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

    const distance = ConvertNumberToTwoDecimals(
      Number(operatingDistance.input)
    );

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE distances SET name = $1, distance = $2, distance_unit = $3 WHERE id = $4",
        [
          nameInput,
          distance,
          operatingDistance.distance_unit,
          operatingDistance.id,
        ]
      );

      const updatedDistance: Distance = {
        ...operatingDistance,
        name: nameInput,
        distance: distance,
        distance_unit: operatingDistance.distance_unit,
      };

      setDistances((prev) =>
        prev.map((item) =>
          item.id === operatingDistance.id ? updatedDistance : item
        )
      );

      resetOperatingDistance();
      newPresetModal.onClose();

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

      const updatedEquipmentWeights: EquipmentWeight[] =
        equipmentWeights.filter(
          (item) => item.id !== operatingEquipmentWeight.id
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

      const updatedDistances: Distance[] = distances.filter(
        (item) => item.id !== operatingDistance.id
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
    setOperatingDistance({
      ...defaultDistance,
      distance_unit: userSettings.default_unit_distance!,
    });
  };

  const handleAddEquipmentWeightButton = () => {
    resetOperatingEquipment();
    newPresetModal.onOpen();
  };

  const handleAddDistanceButton = () => {
    resetOperatingDistance();
    newPresetModal.onOpen();
  };

  // const handleEditEquipmentButton = (equipment: EquipmentWeight) => {
  //   setNewEquipment(equipment);
  //   setNewName(equipment.name);
  //   setNewWeightInput(equipment.weight.toString());
  //   setNewWeightUnit(equipment.weight_unit);
  //   setOperationType("equipment");
  //   setIsEditing(true);
  //   newPresetModal.onOpen();
  // };

  // const handleEditDistanceButton = (distance: Distance) => {
  //   setNewDistance(distance);
  //   setNewName(distance.name);
  //   setNewDistanceInput(distance.distance.toString());
  //   setNewDistanceUnit(distance.distance_unit);
  //   setOperationType("distance");
  //   setIsEditing(true);
  //   newPresetModal.onOpen();
  // };

  // const handleDeleteEquipmentButton = (equipment: EquipmentWeight) => {
  //   setEquipmentToDelete(equipment);
  //   setOperationType("equipment");
  //   deleteModal.onOpen();
  // };

  // const handleDeleteDistanceButton = (distance: Distance) => {
  //   setDistanceToDelete(distance);
  //   setOperationType("distance");
  //   deleteModal.onOpen();
  // };

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
        isOpen={newPresetModal.isOpen}
        onOpenChange={newPresetModal.onOpenChange}
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
                    size="sm"
                    errorMessage={!isNameInputValid && "Name can't be empty"}
                    variant="faded"
                    onValueChange={(value) => setNameInput(value)}
                    isRequired
                    isClearable
                  />
                  {presetType === "equipment" && (
                    <div className="flex justify-between gap-2 items-center">
                      <Input
                        value={operatingEquipmentWeight.input}
                        label="Weight"
                        size="sm"
                        variant="faded"
                        onValueChange={(value) =>
                          setOperatingEquipmentWeight((prev) => ({
                            ...prev,
                            input: value,
                          }))
                        }
                        isInvalid={isWeightInputInvalid}
                        isRequired
                        isClearable
                      />
                      <WeightUnitDropdown
                        value={operatingEquipmentWeight.weight_unit}
                        setEquipmentWeight={setOperatingEquipmentWeight}
                        targetType="equipment"
                      />
                    </div>
                  )}
                  {presetType === "distance" && (
                    <div className="flex justify-between gap-2 items-center">
                      <Input
                        value={operatingDistance.input}
                        label="Distance"
                        size="sm"
                        variant="faded"
                        onValueChange={(value) =>
                          setOperatingDistance((prev) => ({
                            ...prev,
                            input: value,
                          }))
                        }
                        isInvalid={isDistanceInputInvalid}
                        isRequired
                        isClearable
                      />
                      <DistanceUnitDropdown
                        value={operatingDistance.distance_unit}
                        setDistance={setOperatingDistance}
                        targetType="distance"
                      />
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
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
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Presets
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col gap-3 w-full">
              <h2 className="flex justify-center text-2xl font-semibold">
                Equipment Weights
              </h2>
              <div className="flex flex-col gap-1">
                {equipmentWeights.map((equipment) => (
                  <div
                    className="flex flex-row justify-between items-center gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                    key={`equipment-${equipment.id}`}
                  >
                    <div className="flex flex-col justify-start items-start">
                      <span className="w-[21.5rem] truncate text-left">
                        {equipment.name}
                      </span>
                      <span className="text-xs text-stone-500 text-left">
                        {equipment.weight} {equipment.weight_unit}
                      </span>
                    </div>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          className="z-1"
                          size="sm"
                          radius="lg"
                          variant="light"
                        >
                          <VerticalMenuIcon size={17} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label={`Option Menu For ${equipment.name} Equipment Weight`}
                        // onAction={(key) =>
                        //   handleEquipmentWeightOptionSelection(key as string, equipment)
                        // }
                      >
                        <DropdownItem key="edit">Edit</DropdownItem>
                        <DropdownItem key="delete" className="text-danger">
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 justify-center">
                <Button
                  size="sm"
                  color="success"
                  onPress={() => handleAddEquipmentWeightButton()}
                >
                  Add Equipment Weight
                </Button>
                <Button size="sm" onPress={handleRestoreEquipmentButton}>
                  Restore Default Equipment Weights
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <h2 className="flex justify-center text-2xl font-semibold ">
                Distances
              </h2>
              <div className="flex flex-col gap-1">
                {distances.map((distance) => (
                  <div
                    className="flex flex-row justify-between items-center gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                    key={`distance-${distance.id}`}
                  >
                    <div className="flex flex-col justify-start items-start">
                      <span className="w-[21.5rem] truncate text-left">
                        {distance.name}
                      </span>
                      <span className="text-xs text-stone-500 text-left">
                        {distance.distance} {distance.distance_unit}
                      </span>
                    </div>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          className="z-1"
                          size="sm"
                          radius="lg"
                          variant="light"
                        >
                          <VerticalMenuIcon size={17} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label={`Option Menu For ${distance.name} Distance`}
                        // onAction={(key) =>
                        //   handleDistanceOptionSelection(key as string, distance)
                        // }
                      >
                        <DropdownItem key="edit">Edit</DropdownItem>
                        <DropdownItem key="delete" className="text-danger">
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 justify-center">
                <Button
                  color="success"
                  size="sm"
                  onPress={() => handleAddDistanceButton()}
                >
                  Add Distance
                </Button>
                <Button size="sm" onPress={handleRestoreDistanceButton}>
                  Restore Default Distances
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
