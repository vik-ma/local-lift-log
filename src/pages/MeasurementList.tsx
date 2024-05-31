import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LoadingSpinner,
  MeasurementUnitDropdown,
  DeleteModal,
} from "../components";
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
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownTrigger,
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import {
  CreateDefaultMeasurements,
  GenerateActiveMeasurementList,
  GetUserSettings,
  UpdateActiveTrackingMeasurements,
  GenerateActiveMeasurementString,
} from "../helpers";
import { CheckmarkIcon, VerticalMenuIcon } from "../assets";
import { useValidateName } from "../hooks";

export default function MeasurementListPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [measurementToDelete, setMeasurementToDelete] = useState<Measurement>();
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeMeasurementList, setActiveMeasurementList] =
    useState<number[]>();

  const defaultNewMeasurement: Measurement = useMemo(() => {
    return {
      id: 0,
      name: "",
      default_unit: "",
      measurement_type: "Circumference",
    };
  }, []);

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
        setActiveMeasurementList(
          GenerateActiveMeasurementList(
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
    if (newMeasurement === undefined || !isNewMeasurementNameValid) return;

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
    if (!isNewMeasurementNameValid) return;

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

      if (activeMeasurementList?.includes(measurementToDelete.id)) {
        // Modify active_tracking_measurements string in user_settings
        // if measurementToDelete id is currently included
        const updatedMeasurementList: number[] = activeMeasurementList.filter(
          (item) => item !== measurementToDelete.id
        );
        setActiveMeasurementList(updatedMeasurementList);
        updateActiveMeasurementString(updatedMeasurementList);
      }

      toast.success("Measurement Deleted");
    } catch (error) {
      console.log(error);
    }

    setMeasurementToDelete(undefined);
    deleteModal.onClose();
  };

  const handleDeleteButton = (measurement: Measurement) => {
    setMeasurementToDelete(measurement);
    deleteModal.onOpen();
  };

  const handleSaveButton = async () => {
    if (isEditing) {
      await updateMeasurement();
    } else {
      await addMeasurement();
    }
  };

  const handleAddButton = () => {
    if (isEditing) resetMeasurementToDefault();

    newMeasurementModal.onOpen();
  };

  const handleEditButton = (measurement: Measurement) => {
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

  const isNewMeasurementNameValid = useValidateName(newMeasurement.name);

  const createDefaultMeasurements = async (useMetricUnits: boolean) => {
    await CreateDefaultMeasurements(useMetricUnits);
    await getMeasurements();
    setUnitsModal.onClose();
    toast.success("Default Measurements Restored");
  };

  const trackMeasurement = async (measurement: Measurement) => {
    if (activeMeasurementList === undefined) return;

    const updatedMeasurementList: number[] = [
      ...activeMeasurementList,
      measurement.id,
    ];
    setActiveMeasurementList(updatedMeasurementList);

    updateActiveMeasurementString(updatedMeasurementList);
    toast.success("Measurement Tracked");
  };

  const untrackMeasurement = async (measurement: Measurement) => {
    if (activeMeasurementList === undefined) return;

    const updatedMeasurementList: number[] = activeMeasurementList.filter(
      (number) => number !== measurement.id
    );

    setActiveMeasurementList(updatedMeasurementList);

    updateActiveMeasurementString(updatedMeasurementList);
    toast.success("Measurement Untracked");
  };

  const updateActiveMeasurementString = async (numberList: number[]) => {
    if (userSettings === undefined) return;

    const activeMeasurementTrackingString =
      GenerateActiveMeasurementString(numberList);

    await UpdateActiveTrackingMeasurements(
      activeMeasurementTrackingString,
      userSettings.id
    );
  };

  const handleOptionSelection = (key: string, measurement: Measurement) => {
    if (key === "edit") {
      handleEditButton(measurement);
    } else if (key === "delete") {
      handleDeleteButton(measurement);
    } else if (key === "track") {
      trackMeasurement(measurement);
    } else if (key === "untrack") {
      untrackMeasurement(measurement);
    }
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Measurement"
        body={
          <p className="break-words">
            Are you sure you want to permanently delete{" "}
            {measurementToDelete?.name} measurement?
          </p>
        }
        deleteButtonAction={deleteMeasurement}
      />
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
                <div className="flex flex-col gap-0.5">
                  <Input
                    className="h-[5rem]"
                    value={newMeasurement.name}
                    isInvalid={!isNewMeasurementNameValid}
                    label="Name"
                    errorMessage={
                      !isNewMeasurementNameValid && "Name can't be empty"
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
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
                  isDisabled={!isNewMeasurementNameValid}
                  onPress={handleSaveButton}
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
                    createDefaultMeasurements(true);
                  }}
                >
                  Metric
                </Button>
                <Button
                  className="text-lg font-medium"
                  size="lg"
                  color="primary"
                  onPress={() => {
                    createDefaultMeasurements(false);
                  }}
                >
                  Imperial
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col items-center gap-3">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Measurements
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex gap-1 justify-center">
              <Button color="success" onPress={handleAddButton}>
                Add New Measurement
              </Button>
              <Button color="success" onPress={() => setUnitsModal.onOpen()}>
                Restore Default Measurements
              </Button>
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <span className="flex justify-center text-xs italic text-stone-500 font-normal">
                Click on a Measurement to add to Active Measurements
              </span>
              <div className="flex flex-col gap-1.5">
                {measurements.map((measurement) => (
                  <div
                    key={measurement.id}
                    className="flex flex-col gap-0.5 cursor-pointer rounded-lg px-2 py-1 outline outline-2 outline-stone-300 bg-white hover:bg-stone-100"
                    onClick={
                      activeMeasurementList?.includes(measurement.id)
                        ? () => untrackMeasurement(measurement)
                        : () => trackMeasurement(measurement)
                    }
                  >
                    <div className="flex justify-between items-center">
                      <CheckmarkIcon
                        isChecked={activeMeasurementList?.includes(
                          measurement.id
                        )}
                      />
                      <div className="flex flex-col ml-2">
                        <div className="text-lg truncate w-56">
                          {measurement.name}
                        </div>
                        <div className="text-xs text-stone-500">
                          {measurement.measurement_type}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
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
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly radius="lg" variant="light">
                              <VerticalMenuIcon />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label={`Option Menu For ${measurement.name} Measurement`}
                            itemClasses={{
                              base: "hover:text-[#404040] gap-4",
                            }}
                            onAction={(key) =>
                              handleOptionSelection(key as string, measurement)
                            }
                          >
                            {activeMeasurementList?.includes(measurement.id) ? (
                              <DropdownItem key="untrack">Untrack</DropdownItem>
                            ) : (
                              <DropdownItem key="track">Track</DropdownItem>
                            )}
                            <DropdownItem key="edit">Edit</DropdownItem>
                            <DropdownItem className="text-danger" key="delete">
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
