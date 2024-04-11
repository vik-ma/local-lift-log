import { useState, useEffect, useMemo, useCallback } from "react";
import { LoadingSpinner, MeasurementUnitDropdown } from "../components";
import { Measurement, SetMeasurementsAction, UserSettings } from "../typings";
import Database from "tauri-plugin-sql-api";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Radio,
  RadioGroup,
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import {
  CreateDefaultMeasurementList,
  GenerateActiveMeasurementSet,
  GetUserSettings,
} from "../helpers";

export default function MeasurementListPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [measurementToDelete, setMeasurementToDelete] = useState<Measurement>();
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeMeasurementSet, setActiveMeasurementSet] =
    useState<Set<number>>();

  const defaultNewMeasurement: Measurement = {
    id: 0,
    name: "",
    default_unit: "",
    measurement_type: "Circumference",
  };

  const [newMeasurement, setNewMeasurement] = useState<Measurement>(
    defaultNewMeasurement
  );

  const deleteModal = useDisclosure();
  const newMeasurementModal = useDisclosure();
  const setUnitsModal = useDisclosure();

  const getMeasurements = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<Measurement[]>(
        "SELECT * FROM measurements"
      );

      setMeasurements(result);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const userSettings = await GetUserSettings();
        if (userSettings === undefined) return;
        setUserSettings(userSettings);
        setNewMeasurement((prev) => ({
          ...prev,
          default_unit: userSettings.default_unit_measurement!,
        }));
        setActiveMeasurementSet(
          GenerateActiveMeasurementSet(
            userSettings.active_tracking_measurements
          )
        );
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getMeasurements();
    loadUserSettings();
  }, [getMeasurements]);

  const addMeasurement = async () => {
    if (newMeasurement === undefined || isNewMeasurementNameInvalid) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        "INSERT into measurements (name, default_unit, measurement_type) VALUES ($1, $2, $3)",
        [
          newMeasurement.name,
          newMeasurement.default_unit,
          newMeasurement.measurement_type,
        ]
      );

      const addedMeasurement: Measurement = {
        id: result.lastInsertId,
        name: newMeasurement.name,
        default_unit: newMeasurement.default_unit,
        measurement_type: newMeasurement.measurement_type,
      };

      setMeasurements([...measurements, addedMeasurement]);
      resetMeasurementToDefault();

      newMeasurementModal.onClose();
      toast.success("Measurement Added");
    } catch (error) {
      console.log(error);
    }
  };

  const updateMeasurement = async () => {
    if (
      newMeasurement === undefined ||
      isNewMeasurementNameInvalid ||
      isEditing === false
    )
      return;

    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      "UPDATE measurements SET name = $1, default_unit = $2, measurement_type = $3 WHERE id = $4",
      [
        newMeasurement.name,
        newMeasurement.default_unit,
        newMeasurement.measurement_type,
        newMeasurement.id,
      ]
    );

    const updatedMeasurement: Measurement = {
      ...newMeasurement,
      name: newMeasurement.name,
      default_unit: newMeasurement.default_unit,
      measurement_type: newMeasurement.measurement_type,
    };

    setMeasurements((prev) =>
      prev.map((item) =>
        item.id === newMeasurement.id ? updatedMeasurement : item
      )
    );

    resetMeasurementToDefault();

    newMeasurementModal.onClose();
    toast.success("Measurement Updated");
  };

  const deleteMeasurement = async () => {
    if (measurementToDelete === undefined) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from measurements WHERE id = $1", [
        measurementToDelete.id,
      ]);

      const updatedMeasurements: Measurement[] = measurements.filter(
        (item) => item.id !== measurementToDelete?.id
      );
      setMeasurements(updatedMeasurements);

      toast.success("Measurement Deleted");
    } catch (error) {
      console.log(error);
    }

    setMeasurementToDelete(undefined);
    deleteModal.onClose();
  };

  const handleDeleteButtonPress = (measurement: Measurement) => {
    setMeasurementToDelete(measurement);
    deleteModal.onOpen();
  };

  const handleSaveButtonPressed = async () => {
    if (isEditing) {
      await updateMeasurement();
    } else {
      await addMeasurement();
    }
  };

  const handleAddButtonPressed = () => {
    if (isEditing) resetMeasurementToDefault();

    newMeasurementModal.onOpen();
  };

  const handleEditButtonPressed = (measurement: Measurement) => {
    setNewMeasurement(measurement);
    setIsEditing(true);

    newMeasurementModal.onOpen();
  };

  const resetMeasurementToDefault = () => {
    setIsEditing(false);
    setNewMeasurement({
      ...defaultNewMeasurement,
      default_unit: userSettings!.default_unit_measurement!,
    });
  };

  const handleMeasurementTypeChange = (measurementType: string) => {
    const newDefaultUnit: string =
      measurementType === "Caliper"
        ? "mm"
        : userSettings!.default_unit_measurement!;

    setNewMeasurement((prev) => ({
      ...prev,
      default_unit: newDefaultUnit,
      measurement_type: measurementType,
    }));
  };

  const isNewMeasurementNameInvalid = useMemo(() => {
    return (
      newMeasurement.name === null ||
      newMeasurement.name === undefined ||
      newMeasurement.name.trim().length === 0
    );
  }, [newMeasurement.name]);

  const createDefaultMeasurementList = async (useMetricUnits: boolean) => {
    await CreateDefaultMeasurementList(useMetricUnits);
    await getMeasurements();
    setUnitsModal.onClose();
    toast.success("Default Measurements Restored");
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
                Delete Measurement
              </ModalHeader>
              <ModalBody>
                <p className="break-all">
                  Are you sure you want to permanently delete{" "}
                  {measurementToDelete?.name} measurement?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={deleteMeasurement}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={newMeasurementModal.isOpen}
        onOpenChange={newMeasurementModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                New Measurement
              </ModalHeader>
              <ModalBody>
                <Input
                  value={newMeasurement.name}
                  isInvalid={isNewMeasurementNameInvalid}
                  label="Name"
                  errorMessage={
                    isNewMeasurementNameInvalid && "Name can't be empty"
                  }
                  variant="faded"
                  onValueChange={(value) =>
                    setNewMeasurement((prev) => ({
                      ...prev,
                      name: value,
                    }))
                  }
                  isRequired
                  isClearable
                />
                <div className="flex justify-around items-center px-1">
                  <RadioGroup
                    value={newMeasurement.measurement_type}
                    onValueChange={(value) =>
                      handleMeasurementTypeChange(value)
                    }
                    label="Measurement Type"
                  >
                    <Radio value="Circumference">Circumference</Radio>
                    <Radio value="Caliper">Caliper</Radio>
                  </RadioGroup>
                  <MeasurementUnitDropdown
                    measurement={newMeasurement}
                    isDisabled={
                      newMeasurement.measurement_type === "Caliper"
                        ? true
                        : false
                    }
                    setMeasurement={setNewMeasurement}
                    targetType="modal"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
                  isDisabled={isNewMeasurementNameInvalid}
                  onPress={handleSaveButtonPressed}
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
              <ModalHeader className="flex flex-col gap-1">
                Choose Unit Type
              </ModalHeader>
              <ModalBody>
                <p>Use Metric or Imperial units?</p>
              </ModalBody>
              <ModalFooter className="flex justify-center gap-5">
                <Button
                  className="text-lg font-medium"
                  size="lg"
                  color="primary"
                  onPress={() => {
                    createDefaultMeasurementList(true);
                  }}
                >
                  Metric
                </Button>
                <Button
                  className="text-lg font-medium"
                  size="lg"
                  color="primary"
                  onPress={() => {
                    createDefaultMeasurementList(false);
                  }}
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
            Measurements
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="w-full">
              <div className="flex flex-col gap-1.5">
                {measurements.map((measurement) => (
                  <div
                    key={measurement.id}
                    className="flex flex-col gap-0.5 rounded-lg px-2 py-1 outline outline-2 outline-stone-300 bg-white hover:bg-stone-100"
                  >
                    <div className="flex justify-between gap-1 items-center">
                      <div className="flex flex-col">
                        <div className="text-lg truncate w-56">
                          {measurement.name}
                        </div>
                        <div className="text-xs text-stone-500">
                          {measurement.measurement_type}
                        </div>
                      </div>
                      <MeasurementUnitDropdown
                        measurement={measurement}
                        isDisabled={
                          measurement.measurement_type === "Caliper"
                            ? true
                            : false
                        }
                        measurements={measurements}
                        setMeasurements={
                          setMeasurements as SetMeasurementsAction
                        }
                        targetType="list"
                      />
                    </div>
                    <div className="flex justify-between">
                      <div className="flex gap-0.5">
                        <Button
                          className="h-6"
                          size="sm"
                          color="primary"
                          onPress={() => handleEditButtonPressed(measurement)}
                        >
                          Edit
                        </Button>
                        <Button
                          className="h-6"
                          size="sm"
                          color="danger"
                          onPress={() => handleDeleteButtonPress(measurement)}
                        >
                          Delete
                        </Button>
                      </div>
                      <div>
                        <Button
                          className="h-6"
                          size="sm"
                          color="success"
                          onPress={() => handleDeleteButtonPress(measurement)}
                        >
                          Set Active
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        <div className="flex flex-col gap-1 justify-center">
          <Button color="success" onPress={handleAddButtonPressed}>
            Add New Measurement
          </Button>
          <Button color="success" onPress={() => setUnitsModal.onOpen()}>
            Restore Default Measurements
          </Button>
        </div>
      </div>
    </>
  );
}
