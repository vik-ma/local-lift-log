import { useState, useEffect, useCallback } from "react";
import { LoadingSpinner, DeleteModal, MeasurementModal } from "../components";
import { Measurement, UserSettings } from "../typings";
import Database from "tauri-plugin-sql-api";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
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
  InsertMeasurementIntoDatabase,
  UpdateItemInList,
  DeleteItemFromList,
} from "../helpers";
import { CheckmarkIcon, VerticalMenuIcon } from "../assets";
import {
  useDefaultMeasurement,
  useValidateName,
  useHandleMeasurementTypeChange,
} from "../hooks";

type OperationType = "add" | "edit" | "delete";

export default function MeasurementList() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [activeMeasurementSet, setActiveMeasurementSet] = useState<Set<number>>(
    new Set()
  );
  const [operationType, setOperationType] = useState<OperationType>("add");

  const defaultMeasurement = useDefaultMeasurement();

  const [operatingMeasurement, setOperatingMeasurement] =
    useState<Measurement>(defaultMeasurement);

  const deleteModal = useDisclosure();
  const measurementModal = useDisclosure();
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
        setOperatingMeasurement((prev) => ({
          ...prev,
          default_unit: userSettings.default_unit_measurement!,
        }));

        const activeMeasurementList = GenerateActiveMeasurementList(
          userSettings.active_tracking_measurements
        );

        if (activeMeasurementList.length > 0) {
          setActiveMeasurementSet(new Set(activeMeasurementList));
        }

        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getMeasurements();
    loadUserSettings();
  }, [getMeasurements]);

  const addMeasurement = async () => {
    if (operationType !== "add" || !isNewMeasurementNameValid) return;

    const id = await InsertMeasurementIntoDatabase(operatingMeasurement);

    if (id === 0) return;

    const addedMeasurement: Measurement = {
      id: id,
      name: operatingMeasurement.name,
      default_unit: operatingMeasurement.default_unit,
      measurement_type: operatingMeasurement.measurement_type,
    };

    setMeasurements([...measurements, addedMeasurement]);
    resetOperatingMeasurement();

    measurementModal.onClose();
    toast.success("Measurement Added");
  };

  const updateMeasurement = async () => {
    if (
      !isNewMeasurementNameValid ||
      operatingMeasurement.id === 0 ||
      operationType !== "edit"
    )
      return;

    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      "UPDATE measurements SET name = $1, default_unit = $2, measurement_type = $3 WHERE id = $4",
      [
        operatingMeasurement.name,
        operatingMeasurement.default_unit,
        operatingMeasurement.measurement_type,
        operatingMeasurement.id,
      ]
    );

    const updatedMeasurement: Measurement = {
      ...operatingMeasurement,
      name: operatingMeasurement.name,
      default_unit: operatingMeasurement.default_unit,
      measurement_type: operatingMeasurement.measurement_type,
    };

    const updatedMeasurements = UpdateItemInList(
      measurements,
      updatedMeasurement
    );

    setMeasurements(updatedMeasurements);

    resetOperatingMeasurement();

    measurementModal.onClose();
    toast.success("Measurement Updated");
  };

  const deleteMeasurement = async () => {
    if (operatingMeasurement.id === 0 || operationType !== "delete") return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from measurements WHERE id = $1", [
        operatingMeasurement.id,
      ]);

      const updatedMeasurements = DeleteItemFromList(
        measurements,
        operatingMeasurement.id
      );

      setMeasurements(updatedMeasurements);

      if (activeMeasurementSet.has(operatingMeasurement.id)) {
        // Modify active_tracking_measurements string in user_settings
        // if measurementToDelete id is currently included
        const updatedMeasurementSet = new Set(activeMeasurementSet);
        updatedMeasurementSet.delete(operatingMeasurement.id);

        setActiveMeasurementSet(updatedMeasurementSet);
        updateActiveMeasurementString([...updatedMeasurementSet]);
      }

      toast.success("Measurement Deleted");
    } catch (error) {
      console.log(error);
    }

    resetOperatingMeasurement();
    deleteModal.onClose();
  };

  const handleDeleteButton = (measurement: Measurement) => {
    setOperatingMeasurement(measurement);
    setOperationType("delete");
    deleteModal.onOpen();
  };

  const handleSaveButton = async () => {
    if (operationType === "edit") {
      await updateMeasurement();
    } else if (operationType === "add") {
      await addMeasurement();
    }
  };

  const handleAddButton = () => {
    resetOperatingMeasurement();
    measurementModal.onOpen();
  };

  const handleEditButton = (measurement: Measurement) => {
    setOperatingMeasurement(measurement);
    setOperationType("edit");
    measurementModal.onOpen();
  };

  const resetOperatingMeasurement = () => {
    setOperationType("add");
    setOperatingMeasurement({
      ...defaultMeasurement,
      default_unit: userSettings!.default_unit_measurement!,
    });
  };

  const handleMeasurementTypeChange = useHandleMeasurementTypeChange(
    userSettings?.default_unit_measurement ?? "cm",
    setOperatingMeasurement
  );

  const isNewMeasurementNameValid = useValidateName(operatingMeasurement.name);

  const createDefaultMeasurements = async (useMetricUnits: boolean) => {
    await CreateDefaultMeasurements(useMetricUnits);
    await getMeasurements();
    setUnitsModal.onClose();
    toast.success("Default Measurements Restored");
  };

  const trackMeasurement = async (measurementId: number) => {
    if (activeMeasurementSet === undefined) return;

    const updatedMeasurementSet = new Set(activeMeasurementSet);
    updatedMeasurementSet.add(measurementId);

    setActiveMeasurementSet(updatedMeasurementSet);
    updateActiveMeasurementString([...updatedMeasurementSet]);

    toast.success("Measurement Tracked");
  };

  const untrackMeasurement = async (measurementId: number) => {
    if (activeMeasurementSet === undefined) return;

    const updatedMeasurementSet = new Set(activeMeasurementSet);
    updatedMeasurementSet.delete(measurementId);

    setActiveMeasurementSet(updatedMeasurementSet);
    updateActiveMeasurementString([...updatedMeasurementSet]);

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
      trackMeasurement(measurement.id);
    } else if (key === "untrack") {
      untrackMeasurement(measurement.id);
    }
  };

  const handleMeasurementClick = (measurementId: number) => {
    if (activeMeasurementSet.has(measurementId)) {
      untrackMeasurement(measurementId);
    } else {
      trackMeasurement(measurementId);
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
            {operatingMeasurement.name} measurement?
          </p>
        }
        deleteButtonAction={deleteMeasurement}
      />
      <MeasurementModal
        measurementModal={measurementModal}
        measurement={operatingMeasurement}
        setMeasurement={setOperatingMeasurement}
        isMeasurementNameValid={isNewMeasurementNameValid}
        handleMeasurementTypeChange={handleMeasurementTypeChange}
        buttonAction={handleSaveButton}
        isEditing={operationType === "edit"}
      />
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
              <div className="flex flex-col gap-1">
                {measurements.map((measurement) => (
                  <div
                    key={measurement.id}
                    className="flex flex-row cursor-pointer gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                    onClick={() => handleMeasurementClick(measurement.id)}
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className="flex pl-0.5 gap-2.5 items-center">
                        <CheckmarkIcon
                          isChecked={activeMeasurementSet.has(measurement.id)}
                          size={29}
                        />
                        <div className="flex flex-col justify-start items-start">
                          <span className="w-[15.5rem] truncate text-left">
                            {measurement.name}
                          </span>
                          <span className="text-xs text-stone-400 text-left">
                            {measurement.measurement_type}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col text-sm text-stone-500">
                        <span>Unit</span>
                        <span className="font-semibold">
                          {measurement.default_unit}
                        </span>
                      </div>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            aria-label={`Toggle ${measurement.name} Options Menu`}
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
                          aria-label={`Option Menu For ${measurement.name} Measurement`}
                          onAction={(key) =>
                            handleOptionSelection(key as string, measurement)
                          }
                        >
                          {activeMeasurementSet.has(measurement.id) ? (
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
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
