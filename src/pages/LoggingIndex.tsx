import { useState, useEffect } from "react";
import {
  UserSettings,
  BodyMeasurementsOperationType,
  BodyMeasurements,
} from "../typings";
import {
  DeleteModal,
  LoadingSpinner,
  BodyMeasurementsAccordions,
  BodyMeasurementsModal,
  NameInputModal,
  TimeInputModal,
} from "../components";
import {
  GetUserSettings,
  GetValidatedUserSettingsUnits,
  InsertBodyMeasurementsIntoDatabase,
  DefaultNewBodyMeasurements,
  GetLatestBodyMeasurements,
  CreateDetailedBodyMeasurementsList,
  UpdateBodyMeasurements,
  DeleteBodyMeasurementsWithId,
  GetAllBodyMeasurements,
  UpdateBodyMeasurementsTimestamp,
} from "../helpers";
import { Button, useDisclosure } from "@heroui/react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  useMeasurementList,
  useReassignMeasurement,
  useBodyMeasurementsInput,
} from "../hooks";

export default function LoggingIndex() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] =
    useState<BodyMeasurementsOperationType>("add");
  const [isOperatingBodyMeasurements, setIsOperatingBodyMeasurements] =
    useState<boolean>(true);

  const defaultBodyMeasurements = DefaultNewBodyMeasurements();

  const [latestBodyMeasurements, setLatestBodyMeasurements] =
    useState<BodyMeasurements>(defaultBodyMeasurements);

  const deleteModal = useDisclosure();
  const bodyMeasurementsModal = useDisclosure();
  const timeInputModal = useDisclosure();

  const measurementList = useMeasurementList(true);

  const { measurementMap, isMeasurementListLoaded } = measurementList;

  const {
    newMeasurementName,
    setNewMeasurementName,
    isNewMeasurementNameValid,
    nameInputModal,
    handleReassignMeasurement,
    reassignMeasurement,
  } = useReassignMeasurement(measurementList);

  const bodyMeasurementsInput = useBodyMeasurementsInput(
    userSettings,
    setUserSettings
  );

  const {
    setWeightUnit,
    resetBodyMeasurementsInput,
    loadBodyMeasurementsInputs,
    getActiveMeasurements,
    updateActiveTrackingMeasurementOrder,
  } = bodyMeasurementsInput;

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      const validUnits = GetValidatedUserSettingsUnits(userSettings);

      setWeightUnit(validUnits.weightUnit);

      await Promise.all([
        getActiveMeasurements(userSettings.active_tracking_measurements),
        getLatestBodyMeasurements(userSettings.clock_style),
      ]);

      setUserSettings(userSettings);
    };

    loadUserSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddMeasurementsButton = () => {
    setIsOperatingBodyMeasurements(true);
    resetBodyMeasurements();
    bodyMeasurementsModal.onOpen();
  };

  const handleBodyMeasurementsAccordionClick = (
    bodyMeasurements: BodyMeasurements
  ) => {
    const updatedMeasurement: BodyMeasurements = {
      ...bodyMeasurements,
      isExpanded: !bodyMeasurements.isExpanded,
    };

    setLatestBodyMeasurements(updatedMeasurement);
  };

  const reassignLatestMeasurement = async () => {
    if (userSettings === undefined) return;

    const bodyMeasurements = await GetAllBodyMeasurements(
      userSettings.clock_style,
      measurementMap.current
    );

    const success = await reassignMeasurement(bodyMeasurements);

    if (!success) return;

    await getLatestBodyMeasurements(userSettings.clock_style);

    nameInputModal.onClose();
    toast.success("Measurement Reassigned");
  };

  const addBodyMeasurements = async () => {
    if (userSettings === undefined || !isOperatingBodyMeasurements) return;

    const newBodyMeasurements = await InsertBodyMeasurementsIntoDatabase(
      bodyMeasurementsInput,
      userSettings.clock_style,
      measurementMap.current
    );

    if (newBodyMeasurements === undefined) return;

    setLatestBodyMeasurements(newBodyMeasurements);

    if (userSettings.automatically_update_active_measurements === 1) {
      await updateActiveTrackingMeasurementOrder();
    }

    resetBodyMeasurements();
    bodyMeasurementsModal.onClose();
    toast.success("Body Measurements Added");
  };

  const updateBodyMeasurements = async () => {
    if (
      userSettings === undefined ||
      latestBodyMeasurements.id === 0 ||
      !isOperatingBodyMeasurements
    )
      return;

    const updatedBodyMeasurements = await UpdateBodyMeasurements(
      latestBodyMeasurements,
      bodyMeasurementsInput,
      userSettings.clock_style,
      measurementMap.current
    );

    if (updatedBodyMeasurements === undefined) return;

    setLatestBodyMeasurements(updatedBodyMeasurements);

    resetBodyMeasurements();
    bodyMeasurementsModal.onClose();
    toast.success("Body Measurements Updated");
  };

  const deleteBodyMeasurements = async () => {
    if (
      latestBodyMeasurements.id === 0 ||
      userSettings === undefined ||
      !isOperatingBodyMeasurements
    )
      return;

    const success = await DeleteBodyMeasurementsWithId(
      latestBodyMeasurements.id
    );

    if (!success) return;

    await getLatestBodyMeasurements(userSettings.clock_style);

    toast.success("Body Measurements Deleted");
    deleteModal.onClose();
  };

  const getLatestBodyMeasurements = async (clockStyle: string) => {
    if (!isMeasurementListLoaded.current) return;

    const bodyMeasurements = await GetLatestBodyMeasurements();

    if (bodyMeasurements === undefined) {
      setLatestBodyMeasurements(defaultBodyMeasurements);
      return;
    }

    const detailedBodyMeasurements = CreateDetailedBodyMeasurementsList(
      [bodyMeasurements],
      measurementMap.current,
      clockStyle,
      bodyMeasurements.id
    );

    setLatestBodyMeasurements(detailedBodyMeasurements[0]);
  };

  const resetBodyMeasurements = () => {
    resetBodyMeasurementsInput();
    setOperationType("add");
  };

  const handleBodyMeasurementsOptionSelection = (
    key: string,
    bodyMeasurements: BodyMeasurements
  ) => {
    if (userSettings === undefined) return;

    setIsOperatingBodyMeasurements(true);

    if (key === "edit") {
      loadBodyMeasurementsInputs(bodyMeasurements, measurementMap.current);
      setOperationType("edit");
      bodyMeasurementsModal.onOpen();
    } else if (key === "delete" && !!userSettings.never_show_delete_modal) {
      deleteBodyMeasurements();
    } else if (key === "delete") {
      setOperationType("delete");
      deleteModal.onOpen();
    } else if (key === "edit-timestamp") {
      setOperationType("edit-timestamp");
      timeInputModal.onOpen();
    }
  };

  const updateBodyMeasurementsTimeStamp = async (dateString: string) => {
    if (
      latestBodyMeasurements.id === 0 ||
      operationType !== "edit-timestamp" ||
      userSettings === undefined ||
      !isOperatingBodyMeasurements
    )
      return;

    await UpdateBodyMeasurementsTimestamp(
      latestBodyMeasurements,
      dateString,
      userSettings.clock_style
    );

    await getLatestBodyMeasurements(userSettings.clock_style);

    resetBodyMeasurements();
    toast.success("Timestamp Updated");
    timeInputModal.onClose();
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Body Measurements Entry"
        body={
          <p>
            Are you sure you want to permanently delete the latest Body
            Measurements entry?
          </p>
        }
        deleteButtonAction={deleteBodyMeasurements}
      />
      <BodyMeasurementsModal
        bodyMeasurementsModal={bodyMeasurementsModal}
        useBodyMeasurementInputs={bodyMeasurementsInput}
        useMeasurementList={measurementList}
        doneButtonAction={
          operationType === "edit"
            ? updateBodyMeasurements
            : addBodyMeasurements
        }
        isEditing={operationType === "edit"}
      />
      <NameInputModal
        nameInputModal={nameInputModal}
        name={newMeasurementName}
        setName={setNewMeasurementName}
        header="Enter Measurement Name"
        isNameValid={isNewMeasurementNameValid}
        buttonAction={reassignLatestMeasurement}
      />
      <TimeInputModal
        timeInputModal={timeInputModal}
        header="Edit Timestamp"
        clockStyle={userSettings.clock_style}
        locale={userSettings.locale}
        value={latestBodyMeasurements.date}
        saveButtonAction={updateBodyMeasurementsTimeStamp}
      />
      <div className="flex flex-col items-center gap-2">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Measurements
          </h1>
        </div>
        {userSettings === undefined ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col gap-1 items-center w-full">
              <h2 className="flex text-3xl font-semibold">Body Measurements</h2>
              <div className="flex w-full justify-center gap-10 pt-0.5 px-1.5 text-sm">
                <Link
                  // TODO: FIX LINK COLOR
                  className="text-slate-500"
                  to="/logging/measurement-list"
                >
                  Measurement List
                </Link>
                <Link
                  // TODO: FIX LINK COLOR
                  className="text-slate-500"
                  to="/logging/body-measurement-list"
                >
                  Body Measurements History
                </Link>
              </div>
              <div className="flex flex-col gap-0.5 items-center relative w-full">
                <h3>
                  {latestBodyMeasurements.id === 0 ? (
                    <span className="flex justify-center text-stone-400">
                      No Body Measurements Added
                    </span>
                  ) : (
                    <span className="font-semibold text-lg">
                      Last Body Measurements
                    </span>
                  )}
                </h3>
                {latestBodyMeasurements.id !== 0 && (
                  <BodyMeasurementsAccordions
                    bodyMeasurements={[latestBodyMeasurements]}
                    handleBodyMeasurementsAccordionClick={
                      handleBodyMeasurementsAccordionClick
                    }
                    measurementMap={measurementMap.current}
                    handleBodyMeasurementsOptionSelection={
                      handleBodyMeasurementsOptionSelection
                    }
                    handleReassignMeasurement={handleReassignMeasurement}
                  />
                )}
                <div className="pt-1">
                  <Button
                    className="font-medium"
                    variant="flat"
                    onPress={handleAddMeasurementsButton}
                  >
                    Add Measurements
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
