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

export default function Presets() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [equipmentWeights, setEquipmentWeights] = useState<EquipmentWeight[]>(
    []
  );
  const [distances, setDistances] = useState<Distance[]>([]);
  const [newName, setNewName] = useState<string>("");
  const [newWeightInput, setNewWeightInput] = useState<string>("");
  const [newWeightUnit, setNewWeightUnit] = useState<string>("");
  const [userSettings, setUserSettings] = useState<UserSettingsOptional>();
  const [newEquipment, setNewEquipment] = useState<EquipmentWeight>();
  const [equipmentToDelete, setEquipmentToDelete] = useState<EquipmentWeight>();
  const [newDistance, setNewDistance] = useState<Distance>();
  const [newDistanceInput, setNewDistanceInput] = useState<string>("");
  const [newDistanceUnit, setNewDistanceUnit] = useState<string>("");
  const [distanceToDelete, setDistanceToDelete] = useState<Distance>();
  const [operatingType, setOperatingType] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);

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
      const settings: UserSettingsOptional | undefined =
        await GetDefaultUnitValues();
      if (settings !== undefined) {
        setUserSettings(settings);
        setNewWeightUnit(settings.default_unit_weight!);
        setNewDistanceUnit(settings.default_unit_distance!);
      }
      setIsLoading(false);
    };

    getEquipmentWeights();
    getDistances();
    loadUserSettings();
  }, [getEquipmentWeights, getDistances]);

  const isNewNameValid = useValidateName(newName);

  const isWeightInputInvalid = useMemo(() => {
    return IsStringInvalidNumberOr0(newWeightInput);
  }, [newWeightInput]);

  const isDistanceInputInvalid = useMemo(() => {
    return IsStringInvalidNumberOr0(newDistanceInput);
  }, [newDistanceInput]);

  const isNewPresetInvalid = useMemo(() => {
    if (!isNewNameValid) return true;
    if (isWeightInputInvalid && operatingType === "equipment") return true;
    if (isDistanceInputInvalid && operatingType === "distance") return true;
    return false;
  }, [
    isNewNameValid,
    isWeightInputInvalid,
    isDistanceInputInvalid,
    operatingType,
  ]);

  const addEquipmentWeight = async () => {
    if (isNewPresetInvalid || operatingType !== "equipment") return;

    const weight = ConvertNumberToTwoDecimals(Number(newWeightInput));

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        "INSERT into equipment_weights (name, weight, weight_unit) VALUES ($1, $2, $3)",
        [newName, weight, newWeightUnit]
      );

      const newEquipment: EquipmentWeight = {
        id: result.lastInsertId,
        name: newName,
        weight: weight,
        weight_unit: newWeightUnit,
      };

      setEquipmentWeights([...equipmentWeights, newEquipment]);

      resetOperatingEquipment();
      setOperatingType("");
      newPresetModal.onClose();

      toast.success("Equipment Weight Added");
    } catch (error) {
      console.log(error);
    }
  };

  const addDistance = async () => {
    if (isNewPresetInvalid || operatingType !== "distance") return;

    const distance = ConvertNumberToTwoDecimals(Number(newDistanceInput));

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        "INSERT into distances (name, distance, distance_unit) VALUES ($1, $2, $3)",
        [newName, distance, newDistanceUnit]
      );

      const newDistance: Distance = {
        id: result.lastInsertId,
        name: newName,
        distance: distance,
        distance_unit: newDistanceUnit,
      };

      setDistances([...distances, newDistance]);

      resetOperatingDistance();
      setOperatingType("");
      newPresetModal.onClose();

      toast.success("Distance Added");
    } catch (error) {
      console.log(error);
    }
  };

  const updateEquipmentWeight = async () => {
    if (
      newEquipment === undefined ||
      isNewPresetInvalid ||
      operatingType !== "equipment"
    )
      return;

    const weight = Number(newWeightInput);

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE equipment_weights SET name = $1, weight = $2, weight_unit = $3 WHERE id = $4",
        [newName, weight, newWeightUnit, newEquipment.id]
      );

      const updatedEquipment: EquipmentWeight = {
        ...newEquipment,
        name: newName,
        weight: weight,
        weight_unit: newWeightUnit,
      };

      setEquipmentWeights((prev) =>
        prev.map((item) =>
          item.id === newEquipment.id ? updatedEquipment : item
        )
      );

      resetOperatingEquipment();
      setOperatingType("");
      newPresetModal.onClose();

      toast.success("Equipment Weight Updated");
    } catch (error) {
      console.log(error);
    }
  };

  const updateDistance = async () => {
    if (
      newDistance === undefined ||
      isNewPresetInvalid ||
      operatingType !== "distance"
    )
      return;

    const distance = Number(newDistanceInput);

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE distances SET name = $1, distance = $2, distance_unit = $3 WHERE id = $4",
        [newName, distance, newDistanceUnit, newDistance.id]
      );

      const updatedDistance: Distance = {
        ...newDistance,
        name: newName,
        distance: distance,
        distance_unit: newDistanceUnit,
      };

      setDistances((prev) =>
        prev.map((item) =>
          item.id === newDistance.id ? updatedDistance : item
        )
      );

      resetOperatingDistance();
      setOperatingType("");
      newPresetModal.onClose();

      toast.success("Distance Updated");
    } catch (error) {
      console.log(error);
    }
  };

  const deleteEquipmentWeight = async () => {
    if (equipmentToDelete === undefined || operatingType !== "equipment")
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from equipment_weights WHERE id = $1", [
        equipmentToDelete.id,
      ]);

      const updatedEquipmentWeights: EquipmentWeight[] =
        equipmentWeights.filter((item) => item.id !== equipmentToDelete?.id);
      setEquipmentWeights(updatedEquipmentWeights);

      toast.success("Equipment Weight Deleted");
    } catch (error) {
      console.log(error);
    }

    setEquipmentToDelete(undefined);
    setOperatingType("");
    deleteModal.onClose();
  };

  const deleteDistance = async () => {
    if (distanceToDelete === undefined || operatingType !== "distance") return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from distances WHERE id = $1", [distanceToDelete.id]);

      const updatedDistances: Distance[] = distances.filter(
        (item) => item.id !== distanceToDelete?.id
      );
      setDistances(updatedDistances);

      toast.success("Distance Deleted");
    } catch (error) {
      console.log(error);
    }

    setDistanceToDelete(undefined);
    setOperatingType("");
    deleteModal.onClose();
  };

  const resetOperatingEquipment = () => {
    if (userSettings === undefined) return;
    setNewEquipment(undefined);
    setNewName("");
    setNewWeightInput("");
    setNewWeightUnit(userSettings.default_unit_weight!);
    setIsEditing(false);
  };

  const resetOperatingDistance = () => {
    if (userSettings === undefined) return;
    setNewDistance(undefined);
    setNewName("");
    setNewDistanceInput("");
    setNewDistanceUnit(userSettings.default_unit_distance!);
    setIsEditing(false);
  };

  const handleAddEquipmentWeightButton = () => {
    if (isEditing) resetOperatingEquipment();
    setOperatingType("equipment");
    newPresetModal.onOpen();
  };

  const handleAddDistanceButton = () => {
    if (isEditing) resetOperatingDistance();
    setOperatingType("distance");
    newPresetModal.onOpen();
  };

  const handleEditEquipmentButton = (equipment: EquipmentWeight) => {
    setNewEquipment(equipment);
    setNewName(equipment.name);
    setNewWeightInput(equipment.weight.toString());
    setNewWeightUnit(equipment.weight_unit);
    setOperatingType("equipment");
    setIsEditing(true);
    newPresetModal.onOpen();
  };

  const handleEditDistanceButton = (distance: Distance) => {
    setNewDistance(distance);
    setNewName(distance.name);
    setNewDistanceInput(distance.distance.toString());
    setNewDistanceUnit(distance.distance_unit);
    setOperatingType("distance");
    setIsEditing(true);
    newPresetModal.onOpen();
  };

  const handleDeleteEquipmentButton = (equipment: EquipmentWeight) => {
    setEquipmentToDelete(equipment);
    setOperatingType("equipment");
    deleteModal.onOpen();
  };

  const handleDeleteDistanceButton = (distance: Distance) => {
    setDistanceToDelete(distance);
    setOperatingType("distance");
    deleteModal.onOpen();
  };

  const handleCreateButton = async () => {
    if (operatingType === "equipment") await addEquipmentWeight();
    if (operatingType === "distance") await addDistance();
  };

  const handleUpdateButton = async () => {
    if (operatingType === "equipment") await updateEquipmentWeight();
    if (operatingType === "distance") await updateDistance();
  };

  const handleRestoreEquipmentButton = async () => {
    setOperatingType("equipment");
    setUnitsModal.onOpen();
  };

  const handleRestoreDistanceButton = async () => {
    setOperatingType("distance");
    setUnitsModal.onOpen();
  };

  const createDefaultEquipmentWeights = async (useMetricUnits: boolean) => {
    if (operatingType !== "equipment") return;

    await CreateDefaultEquipmentWeights(useMetricUnits);
    await getEquipmentWeights();
    setUnitsModal.onClose();
    setOperatingType("");
    toast.success("Default Equipment Weights Restored");
  };

  const createDefaultDistances = async (useMetricUnits: boolean) => {
    if (operatingType !== "distance") return;

    await CreateDefaultDistances(useMetricUnits);
    await getDistances();
    setUnitsModal.onClose();
    setOperatingType("");
    toast.success("Default Distances Restored");
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <DeleteModal
        deleteModal={deleteModal}
        header={
          operatingType === "equipment"
            ? "Delete Equipment Weight"
            : "Delete Distance"
        }
        body={
          <p className="break-words">
            Are you sure you want to permanently delete{" "}
            {operatingType === "equipment"
              ? equipmentToDelete?.name
              : distanceToDelete?.name}
            ?
          </p>
        }
        deleteButtonAction={
          operatingType === "equipment" ? deleteEquipmentWeight : deleteDistance
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
                {isEditing ? "Edit" : "New"}{" "}
                {operatingType === "equipment"
                  ? "Equipment Weight"
                  : "Distance"}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-0.5">
                  <Input
                    className="h-[5rem]"
                    value={newName}
                    isInvalid={!isNewNameValid}
                    label="Name"
                    size="sm"
                    errorMessage={!isNewNameValid && "Name can't be empty"}
                    variant="faded"
                    onValueChange={(value) => setNewName(value)}
                    isRequired
                    isClearable
                  />
                  {operatingType === "equipment" && (
                    <div className="flex justify-between gap-2 items-center">
                      <Input
                        value={newWeightInput}
                        label="Weight"
                        size="sm"
                        variant="faded"
                        onValueChange={(value) => setNewWeightInput(value)}
                        isInvalid={isWeightInputInvalid}
                        isRequired
                        isClearable
                      />
                      <WeightUnitDropdown
                        value={newWeightUnit}
                        setState={setNewWeightUnit}
                        targetType="state"
                      />
                    </div>
                  )}
                  {operatingType === "distance" && (
                    <div className="flex justify-between gap-2 items-center">
                      <Input
                        value={newDistanceInput}
                        label="Distance"
                        size="sm"
                        variant="faded"
                        onValueChange={(value) => setNewDistanceInput(value)}
                        isInvalid={isDistanceInputInvalid}
                        isRequired
                        isClearable
                      />
                      <DistanceUnitDropdown
                        value={newDistanceUnit}
                        setState={setNewDistanceUnit}
                        targetType="state"
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
                  onPress={isEditing ? handleUpdateButton : handleCreateButton}
                  isDisabled={isNewPresetInvalid}
                >
                  {isEditing ? "Update" : "Create"}
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
                    operatingType === "equipment"
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
                    operatingType === "equipment"
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
                {equipmentWeights?.map((equipment) => (
                  <div
                    className="flex flex-row justify-between gap-4 bg-white rounded-xl py-2 px-2.5 items-center"
                    key={`equipment-${equipment.id}`}
                  >
                    <div className="flex flex-row justify-between w-3/5">
                      <span className="truncate">{equipment.name}</span>
                      <span>
                        {equipment.weight}
                        {equipment.weight_unit}
                      </span>
                    </div>
                    <div className="flex justify-end gap-1">
                      <Button
                        color="primary"
                        size="sm"
                        onPress={() => handleEditEquipmentButton(equipment)}
                      >
                        Edit
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        onPress={() => handleDeleteEquipmentButton(equipment)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-center">
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
                {distances?.map((distance) => (
                  <div
                    className="flex flex-row justify-between gap-4 bg-white rounded-xl py-2 px-2.5 items-center"
                    key={`distance-${distance.id}`}
                  >
                    <div className="flex flex-row justify-between w-3/5">
                      <span className="truncate">{distance.name}</span>
                      <span>
                        {distance.distance}
                        {distance.distance_unit}
                      </span>
                    </div>
                    <div className="flex justify-end gap-1">
                      <Button
                        color="primary"
                        size="sm"
                        onPress={() => handleEditDistanceButton(distance)}
                      >
                        Edit
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        onPress={() => handleDeleteDistanceButton(distance)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-center">
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
