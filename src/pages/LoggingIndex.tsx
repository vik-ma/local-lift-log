import { useState, useEffect } from "react";
import {
  UserSettings,
  BodyMeasurementsOperationType,
  BodyMeasurements,
  DietLog,
} from "../typings";
import {
  DeleteModal,
  LoadingSpinner,
  BodyMeasurementsAccordions,
  BodyMeasurementsModal,
  NameInputModal,
  TimeInputModal,
  DietLogAccordions,
  DietLogModal,
  BodyFatCalculationModal,
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
  DefaultNewDietLog,
} from "../helpers";
import { Button, useDisclosure } from "@heroui/react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  useMeasurementList,
  useReassignMeasurement,
  useBodyMeasurementsInput,
  useDietLogList,
  useDietLogEntryInputs,
} from "../hooks";

export default function LoggingIndex() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] =
    useState<BodyMeasurementsOperationType>("add");
  const [isOperatingBodyMeasurements, setIsOperatingBodyMeasurements] =
    useState<boolean>(true);

  const defaultBodyMeasurements = DefaultNewBodyMeasurements();
  const defaultDietLog = DefaultNewDietLog();

  const [latestBodyMeasurements, setLatestBodyMeasurements] =
    useState<BodyMeasurements>(defaultBodyMeasurements);
  const [latestDietLog, setLatestDietLog] = useState<DietLog>(defaultDietLog);

  const deleteModal = useDisclosure();
  const bodyMeasurementsModal = useDisclosure();
  const timeInputModal = useDisclosure();
  const dietLogModal = useDisclosure();

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
    bodyFatCalculationModal,
    loadBodyFatCalculationSettingsString,
  } = bodyMeasurementsInput;

  const dietLogList = useDietLogList(true);

  const {
    isDietLogListLoaded,
    dietLogs,
    addDietLog,
    updateDietLog,
    deleteDietLog,
    dietLogMap,
    addDietLogEntryRange,
  } = dietLogList;

  const dietLogEntryInputs = useDietLogEntryInputs("custom");

  const {
    resetDietLogInputs,
    setDateEntryType,
    loadDietLogInputs,
    setTargetDay,
  } = dietLogEntryInputs;

  useEffect(() => {
    if (!isDietLogListLoaded.current) return;

    if (dietLogs[0] !== undefined) {
      if (!dietLogs[0].disableExpansion) {
        dietLogs[0].isExpanded = true;
      }

      setLatestDietLog(dietLogs[0]);
    }

    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      const validUnits = GetValidatedUserSettingsUnits(userSettings);

      setWeightUnit(validUnits.weightUnit);

      if (userSettings.default_diet_log_day_is_yesterday === 1) {
        setTargetDay("Yesterday");
      }

      loadBodyFatCalculationSettingsString(
        userSettings.body_fat_calculation_settings,
        measurementMap.current
      );

      await Promise.all([
        getActiveMeasurements(userSettings.active_tracking_measurements),
        getLatestBodyMeasurements(userSettings.clock_style),
      ]);

      setUserSettings(userSettings);
    };

    loadUserSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDietLogListLoaded.current]);

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

    if (bodyMeasurements === undefined) return;

    const detailedBodyMeasurements = CreateDetailedBodyMeasurementsList(
      [bodyMeasurements],
      measurementMap.current,
      clockStyle,
      bodyMeasurements.id
    );

    if (detailedBodyMeasurements.length === 0) return;

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

  const resetDietLogEntry = () => {
    setOperationType("add");
    resetDietLogInputs();
  };

  const handleAddDietLogEntryButton = () => {
    if (operationType !== "add") {
      resetDietLogEntry();
    }

    setIsOperatingBodyMeasurements(false);
    setDateEntryType("recent");
    dietLogModal.onOpen();
  };

  const handleAddDietLogRangeEntryButton = () => {
    if (operationType !== "add") {
      resetDietLogEntry();
    }

    setIsOperatingBodyMeasurements(false);
    setDateEntryType("range");
    dietLogModal.onOpen();
  };

  const handleDietLogAccordionClick = (dietLog: DietLog) => {
    const updatedDietLog: DietLog = {
      ...dietLog,
      isExpanded: !dietLog.isExpanded,
    };

    setLatestDietLog(updatedDietLog);
  };

  const handleDietLogOptionSelection = (key: string) => {
    if (userSettings === undefined) return;

    setIsOperatingBodyMeasurements(false);

    if (key === "edit") {
      handleEditLatestDietLog();
    } else if (key === "delete" && !!userSettings.never_show_delete_modal) {
      deleteDietLogEntry();
    } else if (key === "delete") {
      setOperationType("delete");
      deleteModal.onOpen();
    }
  };

  const handleEditLatestDietLog = () => {
    if (latestDietLog.id === 0) return;

    setOperationType("edit");
    loadDietLogInputs(latestDietLog);
    setDateEntryType("custom");

    dietLogModal.onOpen();
  };

  const addDietLogEntry = async (date: string) => {
    if (operationType !== "add" || isOperatingBodyMeasurements) return;

    const newDietLog = await addDietLog(date, dietLogEntryInputs);

    if (newDietLog === undefined) return;

    if (latestDietLog === undefined || newDietLog.date > latestDietLog.date) {
      setLatestDietLog(newDietLog);
    }

    resetDietLogEntry();
    dietLogModal.onClose();
    toast.success("Diet Log Entry Added");
  };

  const updateDietLogEntry = async (date: string) => {
    if (operationType !== "edit") return;

    const updatedLatestDietLog = await updateDietLog(
      date,
      latestDietLog.id,
      dietLogEntryInputs
    );

    if (updatedLatestDietLog === undefined) return;

    updatedLatestDietLog.isExpanded = !updatedLatestDietLog.disableExpansion;
    setLatestDietLog(updatedLatestDietLog);

    resetDietLogEntry();
    dietLogModal.onClose();
    toast.success("Diet Log Entry Updated");
  };

  const deleteDietLogEntry = async () => {
    if (latestDietLog.id === 0) return;

    const newLatestDietLog = await deleteDietLog(latestDietLog);

    if (newLatestDietLog !== undefined) {
      newLatestDietLog.isExpanded = !newLatestDietLog.disableExpansion;
      setLatestDietLog(newLatestDietLog);
    } else {
      setLatestDietLog(defaultDietLog);
    }

    toast.success("Diet Log Entry Deleted");
    deleteModal.onClose();
  };

  const addDietLogEntries = async (
    startDate: Date,
    endDate: Date,
    overwriteExistingDietLogs: boolean
  ) => {
    const latestDate = !isNaN(Date.parse(latestDietLog.date))
      ? Date.parse(latestDietLog.date)
      : 0;

    const newLatestDietLog = await addDietLogEntryRange(
      startDate,
      endDate,
      overwriteExistingDietLogs,
      dietLogEntryInputs,
      latestDate
    );

    if (newLatestDietLog !== undefined) {
      setLatestDietLog(newLatestDietLog);
    }

    resetDietLogEntry();
    dietLogModal.onClose();
    toast.success("Diet Log Entries Added");
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <DeleteModal
        deleteModal={deleteModal}
        header={`Delete ${
          isOperatingBodyMeasurements ? "Body Measurements" : "Diet Log"
        } Entry`}
        body={
          <p>
            Are you sure you want to permanently delete the latest{" "}
            {isOperatingBodyMeasurements ? "Body Measurements" : "Diet Log"}{" "}
            entry?
          </p>
        }
        deleteButtonAction={
          isOperatingBodyMeasurements
            ? deleteBodyMeasurements
            : deleteDietLogEntry
        }
      />
      <BodyMeasurementsModal
        bodyMeasurementsModal={bodyMeasurementsModal}
        useBodyMeasurementsInputs={bodyMeasurementsInput}
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
      <DietLogModal
        dietLogModal={dietLogModal}
        dietLog={latestDietLog}
        useDietLogEntryInputs={dietLogEntryInputs}
        dietLogMap={dietLogMap}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
        isEditing={operationType === "edit"}
        doneButtonAction={
          operationType === "edit" ? updateDietLogEntry : addDietLogEntry
        }
        saveRangeButtonAction={addDietLogEntries}
      />
      <BodyFatCalculationModal
        useBodyMeasurementsInputs={bodyMeasurementsInput}
        useMeasurementList={measurementList}
      />
      <div className="flex flex-col gap-3 items-center w-full">
        <div className="flex flex-col gap-1 items-center w-full">
          <div className="bg-neutral-900 px-5 py-1.5 rounded-xl text-center">
            <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-4xl bg-clip-text text-transparent bg-gradient-to-b truncate">
              Measurements
            </h1>
          </div>
          <div className="flex w-full justify-center gap-10 px-1.5 text-sm pt-1">
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
          <div className="flex flex-col gap-0.5 items-center w-full">
            <h2>
              {latestBodyMeasurements.id === 0 ? (
                <span className="text-stone-400">
                  No Body Measurements Added
                </span>
              ) : (
                <span className="font-semibold text-lg">
                  Last Body Measurements
                </span>
              )}
            </h2>
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
            <div className="flex justify-center gap-1.5 pt-1">
              <Button
                className="font-medium"
                variant="flat"
                color="secondary"
                size="sm"
                onPress={handleAddMeasurementsButton}
              >
                Add Measurements
              </Button>
              <Button
                className="font-medium"
                variant="flat"
                size="sm"
                onPress={() => bodyFatCalculationModal.onOpen()}
              >
                Body Fat % Calculation Settings
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1 items-center w-full">
          <div className="bg-neutral-900 px-5 py-1.5 rounded-xl text-center">
            <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-4xl bg-clip-text text-transparent bg-gradient-to-b truncate">
              Diet Logs
            </h1>
          </div>
          <div className="flex justify-center text-sm pt-1">
            <Link
              // TODO: FIX LINK COLOR
              className="text-slate-500"
              to="/logging/diet-log-list"
            >
              Diet Log History
            </Link>
          </div>
          <div className="flex flex-col gap-0.5 items-center w-full">
            <h2>
              {latestDietLog.id === 0 ? (
                <span className="text-stone-400">No Diet Logs Added</span>
              ) : (
                <span className="font-semibold text-lg">Latest Diet Log</span>
              )}
            </h2>
            {latestDietLog.id !== 0 && (
              <DietLogAccordions
                dietLogEntries={[latestDietLog]}
                handleDietLogAccordionClick={handleDietLogAccordionClick}
                handleDietLogOptionSelection={handleDietLogOptionSelection}
                showDayLabel
              />
            )}
          </div>
          <div className="flex justify-center gap-1.5 pt-1">
            <Button
              className="font-medium"
              variant="flat"
              color="secondary"
              size="sm"
              onPress={handleAddDietLogEntryButton}
            >
              Add Diet Log
            </Button>
            <Button
              className="font-medium"
              variant="flat"
              size="sm"
              onPress={handleAddDietLogRangeEntryButton}
            >
              Add Diet Logs For Multiple Dates
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
