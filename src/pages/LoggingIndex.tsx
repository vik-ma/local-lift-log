import { useState, useEffect } from "react";
import {
  Measurement,
  UserSettings,
  UserWeight,
  UserMeasurement,
  BodyMeasurementsOperationType,
  BodyMeasurements,
} from "../typings";
import {
  DeleteModal,
  LoadingSpinner,
  BodyMeasurementsAccordions,
  BodyMeasurementsModal,
  NameInputModal,
  UserWeightListItem,
} from "../components";
import {
  GetLatestUserWeight,
  GetUserSettings,
  CreateActiveMeasurementInputs,
  DeleteUserWeightWithId,
  CreateDetailedUserMeasurementList,
  DeleteUserMeasurementWithId,
  ConvertBodyMeasurementsValuesToMeasurementInputs,
  UpdateUserMeasurements,
  GenerateActiveMeasurementString,
  GetUserMeasurements,
  ValidateISODateString,
  FormatDateTimeString,
  UpdateUserWeight,
  GetValidatedUserSettingsUnits,
  UpdateUserSetting,
  IsStringEmpty,
  ConvertNumberToTwoDecimals,
  ConvertEmptyStringToNull,
  ConvertInputStringToNumberWithTwoDecimalsOrNull,
  CreateUserMeasurementValues,
  InsertBodyMeasurementsIntoDatabase,
  DefaultNewBodyMeasurements,
  GetLatestBodyMeasurements,
  CreateDetailedBodyMeasurementsList,
  UpdateBodyMeasurements,
  DeleteBodyMeasurementsWithId,
} from "../helpers";
import { Button, useDisclosure } from "@heroui/react";
import Database from "tauri-plugin-sql-api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  useDefaultUserMeasurements,
  useDefaultUserWeight,
  useMeasurementList,
  useReassignMeasurement,
  useLatestUserWeightInput,
  useBodyMeasurementsInput,
} from "../hooks";

export default function LoggingIndex() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [operationType, setOperationType] =
    useState<BodyMeasurementsOperationType>("add");

  const defaultUserWeight = useDefaultUserWeight();

  const [latestUserWeight, setLatestUserWeight] =
    useState<UserWeight>(defaultUserWeight);

  const defaultUserMeasurements = useDefaultUserMeasurements();

  const [latestUserMeasurements, setLatestUserMeasurements] =
    useState<UserMeasurement>(defaultUserMeasurements);

  const defaultBodyMeasurements = DefaultNewBodyMeasurements();

  const [latestBodyMeasurements, setLatestBodyMeasurements] =
    useState<BodyMeasurements>(defaultBodyMeasurements);

  const navigate = useNavigate();

  const deleteModal = useDisclosure();
  const userWeightModal = useDisclosure();
  const bodyMeasurementsModal = useDisclosure();
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

  const bodyMeasurementsInput = useBodyMeasurementsInput();

  const {
    activeMeasurements,
    setActiveMeasurements,
    activeMeasurementsValue,
    areBodyMeasurementsValid,
    weightInput,
    weightUnit,
    bodyFatPercentageInput,
    commentInput,
    resetBodyMeasurementsInput,
    loadBodyMeasurementsInputs,
  } = bodyMeasurementsInput;

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

      const validUnits = GetValidatedUserSettingsUnits(userSettings);

      setWeightUnit(validUnits.weightUnit);

      await Promise.all([
        getActiveMeasurements(userSettings.active_tracking_measurements),
        getLatestBodyMeasurements(userSettings.clock_style),
      ]);

      setIsLoading(false);
    };

    loadUserSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUserWeightTimeStamp = async (dateString: string) => {
    if (
      latestUserWeight.id === 0 ||
      operationType !== "edit-timestamp" ||
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
    if (userSettings === undefined) return;

    if (key === "edit") {
      loadUserWeightInputs(latestUserWeight);
      setOperationType("edit");
      userWeightModal.onOpen();
    } else if (key === "delete" && !!userSettings.never_show_delete_modal) {
      deleteLatestUserWeight();
    } else if (key === "delete") {
      setOperationType("delete");
      deleteModal.onOpen();
    } else if (key === "edit-timestamp") {
      setOperationType("edit-timestamp");
      timeInputModal.onOpen();
    }
  };

  const handleAddWeightButton = () => {
    resetLatestUserWeightInput();
    userWeightModal.onOpen();
  };

  const addActiveMeasurements = async () => {
    // if (!areActiveMeasurementsValid || userSettings === undefined) return;
    // const commentToInsert = ConvertEmptyStringToNull(measurementsCommentInput);
    // const userMeasurementValues =
    //   CreateUserMeasurementValues(activeMeasurements);
    // const newUserMeasurements = await InsertUserMeasurementIntoDatabase(
    //   userMeasurementValues,
    //   commentToInsert,
    //   userSettings.clock_style,
    //   measurementMap.current
    // );
    // if (newUserMeasurements === undefined) return;
    // setLatestUserMeasurements(newUserMeasurements);
    // if (userSettings.automatically_update_active_measurements === 1) {
    //   await updateActiveTrackingMeasurementOrder();
    // }
    // resetMeasurementsInput();
    // bodyMeasurementsModal.onClose();
    // toast.success("Body Measurements Added");
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
    // if (
    //   latestUserMeasurements.id === 0 ||
    //   !areActiveMeasurementsValid ||
    //   userSettings === undefined
    // )
    //   return;
    // const commentToInsert = ConvertEmptyStringToNull(measurementsCommentInput);
    // const userMeasurementValues =
    //   CreateUserMeasurementValues(activeMeasurements);
    // const updatedUserMeasurements: UserMeasurement = {
    //   ...latestUserMeasurements,
    //   comment: commentToInsert,
    //   measurement_values: userMeasurementValues,
    // };
    // const success = await UpdateUserMeasurements(updatedUserMeasurements);
    // if (!success) return;
    // const detailedUpdatedUserMeasurement = CreateDetailedUserMeasurementList(
    //   [updatedUserMeasurements],
    //   measurementMap.current,
    //   userSettings.clock_style,
    //   updatedUserMeasurements.id
    // );
    // setLatestUserMeasurements(detailedUpdatedUserMeasurement[0]);
    // resetMeasurementsInput();
    // toast.success("Body Measurements Entry Updated");
    // bodyMeasurementsModal.onClose();
  };

  const updateUserMeasurementsTimeStamp = async (dateString: string) => {
    if (
      latestUserMeasurements.id === 0 ||
      operationType !== "edit-timestamp" ||
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

  const handleAddMeasurementsButton = () => {
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

  const handleEditUserMeasurements = () => {
    if (latestUserMeasurements.userMeasurementValues === undefined) return;

    const activeMeasurements = ConvertBodyMeasurementsValuesToMeasurementInputs(
      latestUserMeasurements.userMeasurementValues,
      measurementMap.current
    );

    setActiveMeasurements(activeMeasurements);
    // setMeasurementsCommentInput(latestUserMeasurements.comment ?? "");

    setOperationType("edit");
    bodyMeasurementsModal.onOpen();
  };

  const handleUserMeasurementsOptionSelection = (key: string) => {
    if (userSettings === undefined) return;

    if (key === "edit") {
      handleEditUserMeasurements();
    } else if (key === "delete" && !!userSettings.never_show_delete_modal) {
      deleteLatestUserMeasurements();
    } else if (key === "delete") {
      setOperationType("delete");
      deleteModal.onOpen();
    } else if (key === "edit-timestamp") {
      setOperationType("edit-timestamp");
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

    const success = await UpdateUserSetting(
      "active_tracking_measurements",
      newActiveTrackingMeasurementString,
      userSettings,
      setUserSettings
    );

    if (!success) return;

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

  const addBodyMeasurements = async () => {
    if (userSettings === undefined || !areBodyMeasurementsValid) return;

    const weight = IsStringEmpty(weightInput)
      ? 0
      : ConvertNumberToTwoDecimals(Number(weightInput));

    const bodyFatPercentage = ConvertInputStringToNumberWithTwoDecimalsOrNull(
      bodyFatPercentageInput
    );

    const commentToInsert = ConvertEmptyStringToNull(commentInput);

    const measurementValues = CreateUserMeasurementValues(activeMeasurements);

    const newBodyMeasurements = await InsertBodyMeasurementsIntoDatabase(
      weight,
      weightUnit,
      bodyFatPercentage,
      measurementValues,
      commentToInsert,
      userSettings.clock_style,
      measurementMap.current
    );

    if (newBodyMeasurements === undefined) return;

    const detailedBodyMeasurements = CreateDetailedBodyMeasurementsList(
      [newBodyMeasurements],
      measurementMap.current,
      userSettings.clock_style,
      newBodyMeasurements.id
    );

    setLatestBodyMeasurements(detailedBodyMeasurements[0]);

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
      !areBodyMeasurementsValid ||
      latestBodyMeasurements.id === 0
    )
      return;

    const weight = IsStringEmpty(weightInput)
      ? 0
      : ConvertNumberToTwoDecimals(Number(weightInput));

    const bodyFatPercentage = ConvertInputStringToNumberWithTwoDecimalsOrNull(
      bodyFatPercentageInput
    );

    const commentToInsert = ConvertEmptyStringToNull(commentInput);

    const measurementValues = CreateUserMeasurementValues(activeMeasurements);

    const updatedBodyMeasurements: BodyMeasurements = {
      ...latestBodyMeasurements,
      weight: weight,
      weight_unit: weightUnit,
      body_fat_percentage: bodyFatPercentage,
      measurement_values: measurementValues,
      comment: commentToInsert,
    };

    const success = await UpdateBodyMeasurements(updatedBodyMeasurements);

    if (!success) return;

    const detailedBodyMeasurements = CreateDetailedBodyMeasurementsList(
      [updatedBodyMeasurements],
      measurementMap.current,
      userSettings.clock_style,
      updatedBodyMeasurements.id
    );

    setLatestBodyMeasurements(detailedBodyMeasurements[0]);

    resetBodyMeasurements();
    bodyMeasurementsModal.onClose();
    toast.success("Body Measurements Updated");
  };

  const deleteBodyMeasurements = async () => {
    if (latestBodyMeasurements.id === 0 || userSettings === undefined) return;

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

    if (key === "edit") {
      loadBodyMeasurementsInputs(bodyMeasurements, measurementMap.current);
      setOperationType("edit");
      bodyMeasurementsModal.onOpen();
    } else if (key === "delete" && !!userSettings.never_show_delete_modal) {
      deleteBodyMeasurements();
    } else if (key === "delete") {
      setOperationType("delete");
      deleteModal.onOpen();
    }
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
      {/* <UserWeightModal
        userWeightModal={userWeightModal}
        userWeightInputs={userWeightInputs}
        buttonAction={
          operationType === "edit-weight" ? updateUserWeight : addUserWeight
        }
        isEditing={operationType === "edit-weight"}
      /> */}
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
      {/* TODO: FIX */}
      {/* <TimeInputModal
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
      /> */}
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
                  {latestBodyMeasurements.id === 0 ? (
                    <span className="flex justify-center text-stone-400">
                      No Body Measurements Added
                    </span>
                  ) : (
                    <span className="font-semibold text-lg">
                      Last Body Measurements
                    </span>
                  )}
                  {latestBodyMeasurements.id !== 0 && (
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
                {latestBodyMeasurements.id !== 0 && (
                  <BodyMeasurementsAccordions
                    bodyMeasurementsEntries={[latestBodyMeasurements]}
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
              </div>
              <Button
                className="font-medium"
                variant="flat"
                onPress={handleAddMeasurementsButton}
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
