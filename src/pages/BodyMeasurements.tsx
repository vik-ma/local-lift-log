import { useState, useEffect, useRef } from "react";
import {
  Measurement,
  UserSettings,
  UserWeight,
  UserMeasurement,
  BodyMeasurementsOperationType,
} from "../typings";
import {
  DeleteModal,
  LoadingSpinner,
  UserMeasurementAccordions,
  UserMeasurementModal,
  UserWeightModal,
  NameInputModal,
  UserWeightListItem,
  TimeInputModal,
} from "../components";
import {
  GetLatestUserWeight,
  GetUserSettings,
  CreateActiveMeasurementInputs,
  ConvertEmptyStringToNull,
  DeleteUserWeightWithId,
  CreateUserMeasurementValues,
  CreateDetailedUserMeasurementList,
  DeleteUserMeasurementWithId,
  ConvertUserMeasurementValuesToMeasurementInputs,
  UpdateUserMeasurements,
  GenerateActiveMeasurementString,
  UpdateActiveTrackingMeasurements,
  GetUserMeasurements,
  InsertUserMeasurementIntoDatabase,
  ValidateISODateString,
  FormatDateTimeString,
  UpdateUserWeight,
} from "../helpers";
import { Button, useDisclosure } from "@heroui/react";
import Database from "tauri-plugin-sql-api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  useDefaultUserMeasurements,
  useDefaultUserWeight,
  useMeasurementList,
  useMeasurementsInputs,
  useReassignMeasurement,
  useLatestUserWeightInput,
} from "../hooks";

export default function BodyMeasurements() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [operationType, setOperationType] =
    useState<BodyMeasurementsOperationType>("add");

  const [activeMeasurements, setActiveMeasurements] = useState<Measurement[]>(
    []
  );

  const activeMeasurementsValue = useRef<Measurement[]>([]);

  const [measurementsCommentInput, setMeasurementsCommentInput] =
    useState<string>("");

  const defaultUserWeight = useDefaultUserWeight();

  const [latestUserWeight, setLatestUserWeight] =
    useState<UserWeight>(defaultUserWeight);

  const defaultUserMeasurements = useDefaultUserMeasurements();

  const [latestUserMeasurements, setLatestUserMeasurements] =
    useState<UserMeasurement>(defaultUserMeasurements);

  const navigate = useNavigate();

  const deleteModal = useDisclosure();
  const userWeightModal = useDisclosure();
  const userMeasurementModal = useDisclosure();
  const timeInputModal = useDisclosure();

  const {
    addUserWeight,
    updateUserWeight,
    userWeightInputs,
    resetLatestUserWeightInput,
  } = useLatestUserWeightInput(
    latestUserWeight,
    setLatestUserWeight,
    userWeightModal,
    userSettings,
    setOperationType
  );

  const { setWeightUnit, loadUserWeightInputs } = userWeightInputs;

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

  const measurementsInputs = useMeasurementsInputs(
    activeMeasurements,
    setActiveMeasurements
  );

  const getActiveMeasurements = async (activeMeasurementsString: string) => {
    try {
      const activeMeasurements = await CreateActiveMeasurementInputs(
        activeMeasurementsString
      );
      setActiveMeasurements(activeMeasurements);
      activeMeasurementsValue.current = activeMeasurements;
    } catch (error) {
      console.log(error);
    }
  };

  const getLatestUserWeight = async (clockStyle: string) => {
    const userWeight: UserWeight | undefined = await GetLatestUserWeight(
      clockStyle
    );

    setLatestUserWeight(userWeight ?? defaultUserWeight);
  };

  const getLatestUserMeasurement = async (clockStyle: string) => {
    if (!isMeasurementListLoaded.current) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      // Get the user_measurement row with the latest valid ISO 8601 date string value
      const result = await db.select<UserMeasurement[]>(
        `SELECT *
           FROM user_measurements
           WHERE date IS NOT NULL 
            AND date LIKE '____-__-__T__:__:__.___Z'
            AND date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9].[0-9][0-9][0-9]Z'
           ORDER BY date DESC
           LIMIT 1`
      );

      if (result[0] === undefined) return;

      const detailedUserMeasurement = CreateDetailedUserMeasurementList(
        result,
        measurementMap.current,
        clockStyle,
        result[0].id
      );

      setLatestUserMeasurements(detailedUserMeasurement[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);

      setWeightUnit(userSettings.default_unit_weight);

      await Promise.all([
        getActiveMeasurements(userSettings.active_tracking_measurements),
        getLatestUserWeight(userSettings.clock_style),
        getLatestUserMeasurement(userSettings.clock_style),
      ]);

      setIsLoading(false);
    };

    loadUserSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUserWeightTimeStamp = async (dateString: string) => {
    if (
      latestUserWeight.id === 0 ||
      operationType !== "edit-weight-timestamp" ||
      userSettings === undefined ||
      !ValidateISODateString(dateString)
    )
      return;

    const formattedDate = FormatDateTimeString(
      dateString,
      userSettings.clock_style === "24h"
    );

    const updatedUserWeight: UserWeight = {
      ...latestUserWeight,
      date: dateString,
      formattedDate,
    };

    const success = await UpdateUserWeight(updatedUserWeight);

    if (!success) return;

    await getLatestUserWeight(userSettings.clock_style);

    toast.success("Timestamp Updated");
    timeInputModal.onClose();
  };

  const deleteLatestUserWeight = async () => {
    if (latestUserWeight.id === 0 || userSettings === undefined) return;

    const success = await DeleteUserWeightWithId(latestUserWeight.id);

    if (!success) return;

    await getLatestUserWeight(userSettings.clock_style);

    toast.success("Body Weight Entry Deleted");
    deleteModal.onClose();
  };

  const handleLatestUserWeightOptionSelection = (key: string) => {
    if (key === "edit") {
      loadUserWeightInputs(latestUserWeight);
      setOperationType("edit-weight");
      userWeightModal.onOpen();
    } else if (key === "delete") {
      setOperationType("delete-weight");
      deleteModal.onOpen();
    } else if (key === "edit-timestamp") {
      setOperationType("edit-weight-timestamp");
      timeInputModal.onOpen();
    }
  };

  const handleAddWeightButton = () => {
    resetLatestUserWeightInput();
    userWeightModal.onOpen();
  };

  const addActiveMeasurements = async () => {
    if (
      !measurementsInputs.areActiveMeasurementsValid ||
      userSettings === undefined
    )
      return;

    const commentToInsert = ConvertEmptyStringToNull(measurementsCommentInput);

    const userMeasurementValues =
      CreateUserMeasurementValues(activeMeasurements);

    const newUserMeasurements = await InsertUserMeasurementIntoDatabase(
      userMeasurementValues,
      commentToInsert,
      userSettings.clock_style,
      measurementMap.current
    );

    if (newUserMeasurements === undefined) return;

    setLatestUserMeasurements(newUserMeasurements);

    if (userSettings.automatically_update_active_measurements === 1) {
      await updateActiveTrackingMeasurementOrder();
    }

    resetMeasurementsInput();

    userMeasurementModal.onClose();
    toast.success("Body Measurements Added");
  };

  const deleteLatestUserMeasurements = async () => {
    if (latestUserMeasurements.id === 0 || userSettings === undefined) return;

    const success = await DeleteUserMeasurementWithId(
      latestUserMeasurements.id
    );

    if (!success) return;

    await getLatestUserMeasurement(userSettings.clock_style);

    toast.success("Body Measurements Entry Deleted");
    deleteModal.onClose();
  };

  const updateUserMeasurements = async () => {
    if (
      latestUserMeasurements.id === 0 ||
      !measurementsInputs.areActiveMeasurementsValid ||
      userSettings === undefined
    )
      return;

    const commentToInsert = ConvertEmptyStringToNull(measurementsCommentInput);

    const userMeasurementValues =
      CreateUserMeasurementValues(activeMeasurements);

    const updatedUserMeasurements: UserMeasurement = {
      ...latestUserMeasurements,
      comment: commentToInsert,
      measurement_values: userMeasurementValues,
    };

    const success = await UpdateUserMeasurements(updatedUserMeasurements);

    if (!success) return;

    const detailedUpdatedUserMeasurement = CreateDetailedUserMeasurementList(
      [updatedUserMeasurements],
      measurementMap.current,
      userSettings.clock_style,
      updatedUserMeasurements.id
    );

    setLatestUserMeasurements(detailedUpdatedUserMeasurement[0]);

    resetMeasurementsInput();

    toast.success("Body Measurements Entry Updated");
    userMeasurementModal.onClose();
  };

  const updateUserMeasurementsTimeStamp = async (dateString: string) => {
    if (
      latestUserMeasurements.id === 0 ||
      operationType !== "edit-measurements-timestamp" ||
      userSettings === undefined ||
      !ValidateISODateString(dateString)
    )
      return;

    const formattedDate = FormatDateTimeString(
      dateString,
      userSettings.clock_style === "24h"
    );

    const updatedUserMeasurements: UserMeasurement = {
      ...latestUserMeasurements,
      date: dateString,
      formattedDate,
    };

    const success = await UpdateUserMeasurements(updatedUserMeasurements);

    if (!success) return;

    await getLatestUserMeasurement(userSettings.clock_style);

    toast.success("Timestamp Updated");
    timeInputModal.onClose();
  };

  const handleAddMeasurements = () => {
    resetMeasurementsInput();
    userMeasurementModal.onOpen();
  };

  const resetMeasurementsInput = () => {
    const updatedInputs = activeMeasurementsValue.current.map(
      (measurement) => ({
        ...measurement,
        input: "",
      })
    );

    setActiveMeasurements(updatedInputs);
    setMeasurementsCommentInput("");
    setOperationType("add");
  };

  const handleMeasurementAccordionClick = (measurement: UserMeasurement) => {
    const updatedMeasurement: UserMeasurement = {
      ...measurement,
      isExpanded: !measurement.isExpanded,
    };

    setLatestUserMeasurements(updatedMeasurement);
  };

  const handleEditUserMeasurements = () => {
    if (latestUserMeasurements.userMeasurementValues === undefined) return;

    const activeMeasurements = ConvertUserMeasurementValuesToMeasurementInputs(
      latestUserMeasurements.userMeasurementValues,
      measurementMap.current
    );

    setActiveMeasurements(activeMeasurements);
    setMeasurementsCommentInput(latestUserMeasurements.comment ?? "");

    setOperationType("edit-measurements");
    userMeasurementModal.onOpen();
  };

  const handleUserMeasurementsOptionSelection = (key: string) => {
    if (key === "edit") {
      handleEditUserMeasurements();
    } else if (key === "delete") {
      setOperationType("delete-measurements");
      deleteModal.onOpen();
    } else if (key === "edit-timestamp") {
      setOperationType("edit-measurements-timestamp");
      timeInputModal.onOpen();
    }
  };

  const updateActiveTrackingMeasurementOrder = async (
    newActiveMeasurements?: Measurement[]
  ) => {
    if (userSettings === undefined) return;

    // Use parameter value if passed, otherwise activeMeasurements
    const updatedActiveMeasurements =
      newActiveMeasurements ?? activeMeasurements;

    const newActiveTrackingMeasurementIdList: number[] =
      updatedActiveMeasurements.map((obj) => obj.id);

    const newActiveTrackingMeasurementString: string =
      GenerateActiveMeasurementString(newActiveTrackingMeasurementIdList);

    const success = await UpdateActiveTrackingMeasurements(
      newActiveTrackingMeasurementString,
      userSettings.id
    );

    if (!success) return;

    const updatedUserSettings: UserSettings = {
      ...userSettings,
      active_tracking_measurements: newActiveTrackingMeasurementString,
    };

    setUserSettings(updatedUserSettings);

    activeMeasurementsValue.current = updatedActiveMeasurements;
  };

  const reassignLatestMeasurement = async () => {
    if (userSettings === undefined) return;

    const userMeasurements = await GetUserMeasurements(
      userSettings.clock_style,
      measurementMap.current
    );

    const success = await reassignMeasurement(userMeasurements);

    if (!success) return;

    nameInputModal.onClose();
    toast.success("Measurement Reassigned");
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <DeleteModal
        deleteModal={deleteModal}
        header={
          operationType === "delete-weight"
            ? "Delete Body Weight Entry"
            : "Delete Body Measurement Entry"
        }
        body={
          <p className="break-words">
            Are you sure you want to permanently delete the latest{" "}
            {operationType === "delete-weight"
              ? "Body Weight"
              : "Body Measurement"}{" "}
            entry?
          </p>
        }
        deleteButtonAction={
          operationType === "delete-weight"
            ? () => deleteLatestUserWeight()
            : () => deleteLatestUserMeasurements()
        }
      />
      <UserWeightModal
        userWeightModal={userWeightModal}
        userWeightInputs={userWeightInputs}
        buttonAction={
          operationType === "edit-weight" ? updateUserWeight : addUserWeight
        }
        isEditing={operationType === "edit-weight"}
      />
      <UserMeasurementModal
        userMeasurementModal={userMeasurementModal}
        activeMeasurements={activeMeasurements}
        setActiveMeasurements={setActiveMeasurements}
        measurementsCommentInput={measurementsCommentInput}
        setMeasurementsCommentInput={setMeasurementsCommentInput}
        useMeasurementList={measurementList}
        useMeasurementsInputs={measurementsInputs}
        buttonAction={
          operationType === "edit-measurements"
            ? updateUserMeasurements
            : addActiveMeasurements
        }
        isEditing={operationType === "edit-measurements"}
        updateActiveTrackingMeasurementOrder={
          updateActiveTrackingMeasurementOrder
        }
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
        value={
          operationType === "edit-weight-timestamp"
            ? latestUserWeight.date
            : latestUserMeasurements.date
        }
        saveButtonAction={
          operationType === "edit-weight-timestamp"
            ? updateUserWeightTimeStamp
            : updateUserMeasurementsTimeStamp
        }
      />
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
            <div className="flex flex-col gap-2.5 items-center">
              <h2 className="flex text-3xl font-semibold">Body Weight</h2>
              <div className="flex flex-col items-center gap-2 relative">
                <h3 className="flex items-center gap-2">
                  {latestUserWeight.id === 0 ? (
                    <span className="text-stone-400">
                      No Body Weight Entries Added
                    </span>
                  ) : (
                    <span className="font-semibold text-lg">Latest Weight</span>
                  )}
                  {latestUserWeight.id !== 0 && (
                    <Button
                      className="absolute right-0"
                      color="secondary"
                      variant="flat"
                      size="sm"
                      onPress={() => navigate("/measurements/body-weight-list")}
                    >
                      View History
                    </Button>
                  )}
                </h3>
                {latestUserWeight.id !== 0 && (
                  <UserWeightListItem
                    userWeight={latestUserWeight}
                    handleUserWeightOptionSelection={
                      handleLatestUserWeightOptionSelection
                    }
                  />
                )}
              </div>
              <Button
                className="font-medium"
                variant="flat"
                onPress={handleAddWeightButton}
              >
                Add Weight
              </Button>
              <h2 className="flex text-3xl font-semibold">Body Measurements</h2>
              <div className="flex flex-col gap-1 items-center text-xs font-normal">
                <span className="text-stone-500">
                  Add or remove Measurements to actively track in the
                </span>
                <Button
                  variant="flat"
                  size="sm"
                  onPress={() => navigate("/measurements/measurement-list")}
                >
                  List of Measurements
                </Button>
              </div>
              <div className="flex flex-col items-center gap-2 relative">
                <h3 className="flex items-center gap-2">
                  {latestUserMeasurements.id === 0 ? (
                    <span className="flex justify-center text-stone-400">
                      No Body Measurement Entries Added
                    </span>
                  ) : (
                    <span className="font-semibold text-lg">
                      Latest Measurements
                    </span>
                  )}
                  {latestUserMeasurements.id !== 0 && (
                    <Button
                      className="absolute right-0"
                      color="secondary"
                      variant="flat"
                      size="sm"
                      onPress={() =>
                        navigate("/measurements/user-measurement-list")
                      }
                    >
                      View History
                    </Button>
                  )}
                </h3>
                {latestUserMeasurements.id !== 0 && (
                  <UserMeasurementAccordions
                    userMeasurementEntries={[latestUserMeasurements]}
                    handleMeasurementAccordionClick={
                      handleMeasurementAccordionClick
                    }
                    measurementMap={measurementMap.current}
                    handleUserMeasurementsOptionSelection={
                      handleUserMeasurementsOptionSelection
                    }
                    handleReassignMeasurement={handleReassignMeasurement}
                  />
                )}
              </div>
              <Button
                className="font-medium"
                variant="flat"
                onPress={handleAddMeasurements}
              >
                Add Measurements
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
