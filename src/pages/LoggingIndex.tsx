import { useState, useEffect } from "react";
import {
  UserSettings,
  BodyMeasurementsOperationType,
  BodyMeasurements,
  DietLog,
  DietLogDateEntryType,
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
} from "../helpers";
import { Button, useDisclosure } from "@heroui/react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  useMeasurementList,
  useReassignMeasurement,
  useActiveMeasurements,
  useDietLogList,
} from "../hooks";

export default function LoggingIndex() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] =
    useState<BodyMeasurementsOperationType>("add");
  const [isOperatingBodyMeasurements, setIsOperatingBodyMeasurements] =
    useState<boolean>(true);
  const [dateEntryType, setDateEntryType] =
    useState<DietLogDateEntryType>("recent");

  const defaultBodyMeasurements = DefaultNewBodyMeasurements();

  const [latestBodyMeasurements, setLatestBodyMeasurements] =
    useState<BodyMeasurements>(defaultBodyMeasurements);

  const [operatingBodyMeasurements, setOperatingBodyMeasurements] =
    useState<BodyMeasurements>({ ...defaultBodyMeasurements });

  const deleteModal = useDisclosure();
  const bodyMeasurementsModal = useDisclosure();
  const timeInputModal = useDisclosure();
  const dietLogModal = useDisclosure();

  const measurementList = useMeasurementList(true);

  const { measurementMap, isMeasurementListLoaded } = measurementList;

  const { nameInputModal, handleReassignMeasurement, reassignMeasurement } =
    useReassignMeasurement(measurementList);

  const activeMeasurements = useActiveMeasurements(
    userSettings,
    setUserSettings
  );

  const {
    setWeightUnit,
    getActiveMeasurements,
    updateActiveTrackingMeasurementOrder,
    bodyFatCalculationModal,
    loadBodyFatCalculationSettingsString,
  } = activeMeasurements;

  const dietLogList = useDietLogList(true);

  const {
    isDietLogListLoaded,
    addDietLog,
    updateDietLog,
    deleteDietLog,
    dietLogMap,
    addDietLogEntryRange,
    latestDietLog,
    setLatestDietLog,
    defaultDietLog,
  } = dietLogList;

  const [operatingDietLog, setOperatingDietLog] = useState<DietLog>({
    ...defaultDietLog,
  });

  useEffect(() => {
    if (!isDietLogListLoaded.current) return;

    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      const validUnits = GetValidatedUserSettingsUnits(userSettings);

      setWeightUnit(validUnits.weightUnit);

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
    // TODO: FIX
    // resetBodyMeasurements();
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

  const reassignLatestMeasurement = async (name: string) => {
    if (userSettings === undefined) return;

    const bodyMeasurements = await GetAllBodyMeasurements(
      userSettings.clock_style,
      measurementMap.current
    );

    const success = await reassignMeasurement(bodyMeasurements, name);

    if (!success) return;

    await getLatestBodyMeasurements(userSettings.clock_style);

    nameInputModal.onClose();
    toast.success("Measurement Reassigned");
  };

  const addBodyMeasurements = async () => {
    if (userSettings === undefined || !isOperatingBodyMeasurements) return;

    const newBodyMeasurements = await InsertBodyMeasurementsIntoDatabase(
      activeMeasurements,
      userSettings.clock_style,
      measurementMap.current
    );

    if (newBodyMeasurements === undefined) return;

    setLatestBodyMeasurements(newBodyMeasurements);

    if (userSettings.automatically_update_active_measurements === 1) {
      updateActiveTrackingMeasurementOrder();
    }

    // TODO: FIX
    // resetBodyMeasurements();
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
      activeMeasurements,
      userSettings.clock_style,
      measurementMap.current
    );

    if (updatedBodyMeasurements === undefined) return;

    setLatestBodyMeasurements(updatedBodyMeasurements);

    // TODO: FIX
    // resetBodyMeasurements();
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

  // TODO: REPLACE
  // const resetBodyMeasurements = () => {
  //   resetBodyMeasurementsInput();
  //   setOperationType("add");
  // };

  const handleBodyMeasurementsOptionSelection = (
    key: string,
    bodyMeasurements: BodyMeasurements
  ) => {
    if (userSettings === undefined) return;

    setIsOperatingBodyMeasurements(true);

    if (key === "edit") {
      // TODO: REPLACE
      // loadBodyMeasurementsInputs(bodyMeasurements, measurementMap.current);
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

    // TODO: FIX
    // resetBodyMeasurements();
    toast.success("Timestamp Updated");
    timeInputModal.onClose();
  };

  const handleAddDietLogEntryButton = () => {
    if (operationType !== "add") {
      setOperationType("add");
      setOperatingDietLog({ ...defaultDietLog });
    }

    setIsOperatingBodyMeasurements(false);
    setDateEntryType("recent");
    dietLogModal.onOpen();
  };

  const handleAddDietLogRangeEntryButton = () => {
    if (operationType !== "add") {
      setOperationType("add");
      setOperatingDietLog({ ...defaultDietLog });
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
    setOperatingDietLog(latestDietLog);
    setDateEntryType("custom");

    dietLogModal.onOpen();
  };

  const addDietLogEntry = async (dietLog: DietLog) => {
    if (operationType !== "add" || isOperatingBodyMeasurements) return;

    const newDietLog = await addDietLog(dietLog);

    if (newDietLog === undefined) return;

    if (latestDietLog === undefined || newDietLog.date > latestDietLog.date) {
      setLatestDietLog(newDietLog);
    }

    dietLogModal.onClose();
    toast.success("Diet Log Entry Added");
  };

  const updateDietLogEntry = async (dietLog: DietLog) => {
    if (operationType !== "edit") return;

    const updatedLatestDietLog = await updateDietLog(dietLog);

    if (updatedLatestDietLog === undefined) return;

    updatedLatestDietLog.isExpanded = !updatedLatestDietLog.disableExpansion;
    setLatestDietLog(updatedLatestDietLog);

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
    overwriteExistingDietLogs: boolean,
    dietLog: DietLog
  ) => {
    const latestDate = !isNaN(Date.parse(latestDietLog.date))
      ? Date.parse(latestDietLog.date)
      : 0;

    const newLatestDietLog = await addDietLogEntryRange(
      startDate,
      endDate,
      overwriteExistingDietLogs,
      dietLog,
      latestDate
    );

    if (newLatestDietLog !== undefined) {
      setLatestDietLog(newLatestDietLog);
    }

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
        useActiveMeasurements={activeMeasurements}
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
        header="Enter Measurement Name"
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
        dietLog={operatingDietLog}
        dateEntryType={dateEntryType}
        setDateEntryType={setDateEntryType}
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
        useActiveMeasurements={activeMeasurements}
        useMeasurementList={measurementList}
      />
      <div className="flex flex-col gap-3 items-center w-full">
        <div className="flex flex-col gap-1 items-center w-full">
          <div className="bg-neutral-900 px-5 py-1.5 rounded-xl text-center">
            <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-4xl bg-clip-text text-transparent bg-gradient-to-b truncate">
              Measurements
            </h1>
          </div>
          <div className="grid grid-cols-2 w-full px-1.5 text-sm pt-1">
            <Link
              // TODO: FIX LINK COLOR
              className="text-slate-500 text-center"
              to="/logging/measurement-list"
            >
              Measurement List
            </Link>
            <Link
              // TODO: FIX LINK COLOR
              className="text-slate-500 text-center"
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
            <div className="flex justify-between w-full px-px gap-1.5 pt-1">
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
            <div className="flex justify-between w-full px-px gap-1.5 pt-1">
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
      </div>
    </>
  );
}
