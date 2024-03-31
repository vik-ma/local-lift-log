import { useState, useEffect, useMemo } from "react";
import { LoadingSpinner, WeightUnitDropdown } from "../components";
import Database from "tauri-plugin-sql-api";
import { EquipmentWeight, UserSettingsOptional } from "../typings";
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
import { GetDefaultUnitValues, IsStringInvalidNumberOr0 } from "../helpers";
import toast, { Toaster } from "react-hot-toast";

export default function EquipmentWeights() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [equipmentWeights, setEquipmentWeights] = useState<EquipmentWeight[]>(
    []
  );
  const [newEquipmentName, setNewEquipmentName] = useState<string>("");
  const [newWeightInput, setNewWeightInput] = useState<string>("");
  const [newWeightUnit, setNewWeightUnit] = useState<string>("");
  const [userSettings, setUserSettings] = useState<UserSettingsOptional>();
  const [operatingEquipment, setOperatingEquipment] =
    useState<EquipmentWeight>();
  const [equipmentToDelete, setEquipmentToDelete] = useState<EquipmentWeight>();

  const deleteModal = useDisclosure();
  const newEquipmentModal = useDisclosure();

  useEffect(() => {
    const loadUserSettings = async () => {
      const settings: UserSettingsOptional | undefined =
        await GetDefaultUnitValues();
      if (settings !== undefined) {
        setUserSettings(settings);
        setNewWeightUnit(settings.default_unit_weight!);
      }
    };

    const getEquipmentWeights = async () => {
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
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    loadUserSettings();
    getEquipmentWeights();
  }, []);

  const isNewEquipmentNameInvalid = useMemo(() => {
    return (
      newEquipmentName === null ||
      newEquipmentName === undefined ||
      newEquipmentName.trim().length === 0
    );
  }, [newEquipmentName]);

  const isWeightInputInvalid = useMemo(() => {
    return IsStringInvalidNumberOr0(newWeightInput);
  }, [newWeightInput]);

  const isNewEquipmentInvalid = useMemo(() => {
    if (isNewEquipmentNameInvalid) return true;
    if (isWeightInputInvalid) return true;
    return false;
  }, [isNewEquipmentNameInvalid, isWeightInputInvalid]);

  const addEquipmentWeight = async () => {
    if (isNewEquipmentInvalid) return;

    const weight = Number(newWeightInput);

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        "INSERT into equipment_weights (name, weight, weight_unit) VALUES ($1, $2, $3)",
        [newEquipmentName, weight, newWeightUnit]
      );

      const newEquipment: EquipmentWeight = {
        id: result.lastInsertId,
        name: newEquipmentName,
        weight: weight,
        weight_unit: newWeightUnit,
      };

      setEquipmentWeights([...equipmentWeights, newEquipment]);

      resetNewEquipment();
      newEquipmentModal.onClose();

      toast.success("Equipment Weight Added");
    } catch (error) {
      console.log(error);
    }
  };

  const updateEquipmentWeight = async () => {
    if (operatingEquipment === undefined || isNewEquipmentInvalid) return;

    const weight = Number(newWeightInput);

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE equipment_weights SET name = $1, weight = $2, weight_unit = $3 WHERE id = $4",
        [newEquipmentName, weight, newWeightUnit, operatingEquipment.id]
      );

      const updatedEquipment: EquipmentWeight = {
        ...operatingEquipment,
        name: newEquipmentName,
        weight: weight,
        weight_unit: newWeightUnit,
      };

      setEquipmentWeights((prev) =>
        prev.map((item) =>
          item.id === operatingEquipment.id ? updatedEquipment : item
        )
      );

      resetNewEquipment();
      newEquipmentModal.onClose();

      toast.success("Equipment Weight Updated");
    } catch (error) {
      console.log(error);
    }
  };

  const deleteEquipmentWeight = async () => {
    if (equipmentToDelete === undefined) return;

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
    deleteModal.onClose();
  };

  const resetNewEquipment = () => {
    if (userSettings === undefined) return;
    setOperatingEquipment(undefined);
    setNewEquipmentName("");
    setNewWeightInput("");
    setNewWeightUnit(userSettings.default_unit_weight!);
  };

  const handleNewButtonPressed = () => {
    if (operatingEquipment !== undefined) resetNewEquipment();
    newEquipmentModal.onOpen();
  };

  const handleEditButtonPressed = (equipment: EquipmentWeight) => {
    setOperatingEquipment(equipment);
    setNewEquipmentName(equipment.name);
    setNewWeightInput(equipment.weight.toString());
    setNewWeightUnit(equipment.weight_unit);
    newEquipmentModal.onOpen();
  };

  const handleDeleteButtonPress = (equipment: EquipmentWeight) => {
    setEquipmentToDelete(equipment);
    deleteModal.onOpen();
  };

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <Modal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Equipment Weight
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to permanently delete{" "}
                  {equipmentToDelete?.name}?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={deleteEquipmentWeight}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={newEquipmentModal.isOpen}
        onOpenChange={newEquipmentModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                New Equipment Weight
              </ModalHeader>
              <ModalBody>
                <Input
                  value={newEquipmentName}
                  isInvalid={isNewEquipmentNameInvalid}
                  label="Name"
                  size="sm"
                  errorMessage={
                    isNewEquipmentNameInvalid && "Name can't be empty"
                  }
                  variant="faded"
                  onValueChange={(value) => setNewEquipmentName(value)}
                  isRequired
                  isClearable
                />
                <div className="flex justify-between gap-2">
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
                <div className="flex justify-between items-center px-1 gap-4"></div>
              </ModalBody>
              <ModalFooter>
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
                  onPress={
                    operatingEquipment === undefined
                      ? addEquipmentWeight
                      : updateEquipmentWeight
                  }
                  isDisabled={isNewEquipmentInvalid}
                >
                  {operatingEquipment === undefined ? "Create" : "Update"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Equipment
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col gap-1 w-full">
              {equipmentWeights?.map((equipment) => (
                <div
                  className="flex flex-row justify-between gap-4 bg-white rounded-xl py-2 px-2.5 items-center"
                  key={`${equipment}`}
                >
                  <div className="flex flex-row justify-between w-full">
                    <span>{equipment.name}</span>
                    <span>
                      {equipment.weight}
                      {equipment.weight_unit}
                    </span>
                  </div>
                  <div className="flex justify-end gap-1">
                    <Button
                      color="primary"
                      size="sm"
                      onPress={() => handleEditButtonPressed(equipment)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      onPress={() => handleDeleteButtonPress(equipment)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex justify-center mt-1">
                <Button
                  color="success"
                  onPress={() => handleNewButtonPressed()}
                >
                  Create New Equipment Weight
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
