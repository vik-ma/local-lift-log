import { useState, useEffect, useCallback, useRef } from "react";
import {
  Measurement,
  UserSettings,
  UserWeight,
  UserMeasurement,
  MeasurementMap,
} from "../typings";
import {
  DeleteModal,
  LoadingSpinner,
  UserMeasurementAccordion,
  UserMeasurementModal,
  UserWeightModal,
  NameInputModal,
} from "../components";
import {
  FormatDateTimeString,
  GetLatestUserWeight,
  GetUserSettings,
  CreateActiveMeasurementInputs,
  ConvertEmptyStringToNull,
  GetCurrentDateTimeISOString,
  UpdateUserWeight,
  DeleteUserWeightById,
  CreateUserMeasurementValues,
  CreateDetailedUserMeasurementList,
  GetMeasurementsMap,
  ConvertNumberToTwoDecimals,
  DeleteUserMeasurementById,
  ConvertUserMeasurementValuesToMeasurementInputs,
  UpdateUserMeasurements,
  GenerateActiveMeasurementString,
  UpdateActiveTrackingMeasurements,
  GetUserMeasurements,
} from "../helpers";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
} from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  useDefaultUserMeasurements,
  useDefaultUserWeight,
  useIsStringValidNumber,
  useMeasurementsInputs,
  useReassignMeasurement,
} from "../hooks";
import { VerticalMenuIcon } from "../assets";

type OperationType =
  | "add"
  | "edit-weight"
  | "delete-weight"
  | "edit-measurements"
  | "delete-measurements";

export default function BodyMeasurements() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userWeightInput, setUserWeightInput] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<string>("");
  const [weightCommentInput, setWeightCommentInput] = useState<string>("");
  const [clockStyle, setClockStyle] = useState<string>("");
  const [operationType, setOperationType] = useState<OperationType>("add");

  const [activeMeasurements, setActiveMeasurements] = useState<Measurement[]>(
    []
  );
  const [measurementMap, setMeasurementMap] = useState<MeasurementMap>(
    new Map<string, Measurement>()
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

  const {
    newMeasurementName,
    setNewMeasurementName,
    isNewMeasurementNameValid,
    nameInputModal,
    handleReassignMeasurement,
    reassignMeasurement,
  } = useReassignMeasurement();

  const {
    invalidMeasurementInputs,
    areActiveMeasurementsValid,
    handleActiveMeasurementInputChange,
  } = useMeasurementsInputs(activeMeasurements, setActiveMeasurements);

  const getActiveMeasurements = useCallback(
    async (activeMeasurementsString: string) => {
      try {
        const activeMeasurements = await CreateActiveMeasurementInputs(
          activeMeasurementsString
        );
        setActiveMeasurements(activeMeasurements);
        activeMeasurementsValue.current = activeMeasurements;
      } catch (error) {
        console.log(error);
      }
    },
    []
  );

  const getLatestUserWeight = useCallback(
    async (clockStyle: string) => {
      const userWeight: UserWeight | undefined = await GetLatestUserWeight(
        clockStyle
      );

      setLatestUserWeight(userWeight ?? defaultUserWeight);
    },
    [defaultUserWeight]
  );

  const getLatestUserMeasurement = useCallback(
    async (clockStyle: string) => {
      const measurementMap = await GetMeasurementsMap();

      setMeasurementMap(measurementMap);

      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<UserMeasurement[]>(
          `SELECT * FROM user_measurements 
          ORDER BY id DESC LIMIT 1`
        );

        if (result.length === 0) {
          setLatestUserMeasurements(defaultUserMeasurements);
          return;
        }

        const detailedUserMeasurement = CreateDetailedUserMeasurementList(
          result,
          measurementMap,
          clockStyle
        );

        if (detailedUserMeasurement.length === 1) {
          setLatestUserMeasurements(detailedUserMeasurement[0]);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [defaultUserMeasurements]
  );

  useEffect(() => {
    const loadUserSettings = async () => {
      const settings: UserSettings | undefined = await GetUserSettings();
      if (settings !== undefined) {
        setUserSettings(settings);
        setWeightUnit(settings.default_unit_weight!);
        setClockStyle(settings.clock_style!);
        getActiveMeasurements(settings.active_tracking_measurements!);
        getLatestUserWeight(settings.clock_style!);
        getLatestUserMeasurement(settings.clock_style!);
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, [getActiveMeasurements, getLatestUserWeight, getLatestUserMeasurement]);

  const isWeightInputValid = useIsStringValidNumber(userWeightInput);

  const addUserWeight = async () => {
    if (!isWeightInputValid) return;

    const newWeight = ConvertNumberToTwoDecimals(Number(userWeightInput));

    const commentToInsert = ConvertEmptyStringToNull(weightCommentInput);

    const currentDateString = GetCurrentDateTimeISOString();

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        "INSERT into user_weights (weight, weight_unit, date, comment) VALUES ($1, $2, $3, $4)",
        [newWeight, weightUnit, currentDateString, commentToInsert]
      );

      const formattedDate: string = FormatDateTimeString(
        currentDateString,
        userSettings?.clock_style === "24h"
      );

      const newUserWeight: UserWeight = {
        id: result.lastInsertId,
        weight: newWeight,
        weight_unit: weightUnit,
        date: currentDateString,
        formattedDate: formattedDate,
        comment: commentToInsert,
      };

      setLatestUserWeight(newUserWeight);

      resetWeightInput();

      userWeightModal.onClose();
      toast.success("Body Weight Entry Added");
    } catch (error) {
      console.log(error);
    }
  };

  const updateUserWeight = async () => {
    if (latestUserWeight.id === 0 || !isWeightInputValid) return;

    const newWeight = Number(userWeightInput);

    const commentToInsert = ConvertEmptyStringToNull(weightCommentInput);

    const updatedUserWeight: UserWeight = {
      ...latestUserWeight,
      weight: newWeight,
      comment: commentToInsert,
    };

    const success = await UpdateUserWeight(updatedUserWeight);

    if (!success) return;

    setLatestUserWeight(updatedUserWeight);

    resetWeightInput();

    userWeightModal.onClose();
    toast.success("Body Weight Entry Updated");
  };

  const deleteLatestUserWeight = async () => {
    if (latestUserWeight.id === 0 || userSettings === undefined) return;

    const success = await DeleteUserWeightById(latestUserWeight.id);

    if (!success) return;

    getLatestUserWeight(userSettings.clock_style);

    toast.success("Body Weight Entry Deleted");
    deleteModal.onClose();
  };

  const handleLatestUserWeightOptionSelection = (key: string) => {
    if (key === "edit") {
      setUserWeightInput(latestUserWeight.weight.toString());
      setWeightCommentInput(latestUserWeight.comment ?? "");
      setWeightUnit(latestUserWeight.weight_unit);
      setOperationType("edit-weight");
      userWeightModal.onOpen();
    } else if (key === "delete") {
      setOperationType("delete-weight");
      deleteModal.onOpen();
    }
  };

  const handleAddWeightButton = () => {
    resetWeightInput();
    userWeightModal.onOpen();
  };

  const resetWeightInput = () => {
    setUserWeightInput("");
    setWeightCommentInput("");
    setOperationType("add");
  };

  const addActiveMeasurements = async () => {
    if (!areActiveMeasurementsValid) return;

    const currentDateString = GetCurrentDateTimeISOString();

    const commentToInsert = ConvertEmptyStringToNull(measurementsCommentInput);

    const userMeasurementValues =
      CreateUserMeasurementValues(activeMeasurements);

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        `INSERT into user_measurements (date, comment, measurement_values) 
        VALUES ($1, $2, $3)`,
        [currentDateString, commentToInsert, userMeasurementValues]
      );

      const newUserMeasurements: UserMeasurement = {
        id: result.lastInsertId,
        date: currentDateString,
        comment: commentToInsert,
        measurement_values: userMeasurementValues,
      };

      const detailedActiveMeasurement = CreateDetailedUserMeasurementList(
        [newUserMeasurements],
        measurementMap,
        clockStyle
      );

      setLatestUserMeasurements(detailedActiveMeasurement[0]);
    } catch (error) {
      console.log(error);
    }

    resetMeasurementsInput();

    userMeasurementModal.onClose();
    toast.success("Body Measurements Added");
  };

  const deleteLatestUserMeasurements = async () => {
    if (latestUserMeasurements.id === 0 || userSettings === undefined) return;

    const success = await DeleteUserMeasurementById(latestUserMeasurements.id);

    if (!success) return;

    getLatestUserMeasurement(userSettings.clock_style);

    toast.success("Body Measurements Entry Deleted");
    deleteModal.onClose();
  };

  const updateLatestUserMeasurements = async () => {
    if (
      latestUserMeasurements.id === 0 ||
      !areActiveMeasurementsValid ||
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

    const success = UpdateUserMeasurements(updatedUserMeasurements);

    if (!success) return;

    const detailedUpdatedUserMeasurement = CreateDetailedUserMeasurementList(
      [updatedUserMeasurements],
      measurementMap,
      userSettings.clock_style
    );

    setLatestUserMeasurements(detailedUpdatedUserMeasurement[0]);

    resetMeasurementsInput();

    toast.success("Body Measurements Entry Updated");
    userMeasurementModal.onClose();
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
      measurementMap
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

    await UpdateActiveTrackingMeasurements(
      newActiveTrackingMeasurementString,
      userSettings.id
    );

    activeMeasurementsValue.current = updatedActiveMeasurements;
  };

  const reassignLatestMeasurement = async () => {
    if (userSettings === undefined) return;

    const updatedMeasurementMap = await GetMeasurementsMap();

    setMeasurementMap(updatedMeasurementMap);

    const userMeasurements = await GetUserMeasurements(
      userSettings.clock_style,
      updatedMeasurementMap
    );

    const success = await reassignMeasurement(userMeasurements);

    if (!success) return;

    await getLatestUserMeasurement(userSettings.clock_style);

    nameInputModal.onClose();
    toast.success("Measurement Reassigned");
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
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
        userWeightInput={userWeightInput}
        setUserWeightInput={setUserWeightInput}
        isWeightInputValid={isWeightInputValid}
        weightUnit={weightUnit}
        setWeightUnit={setWeightUnit}
        commentInput={weightCommentInput}
        setCommentInput={setWeightCommentInput}
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
        invalidMeasurementInputs={invalidMeasurementInputs}
        handleActiveMeasurementInputChange={handleActiveMeasurementInputChange}
        areActiveMeasurementsValid={areActiveMeasurementsValid}
        measurementMap={measurementMap}
        buttonAction={
          operationType === "edit-measurements"
            ? updateLatestUserMeasurements
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
              <div className="flex flex-col items-center gap-2">
                <h3 className="flex items-center gap-2.5">
                  {latestUserWeight.id === 0 ? (
                    <span className="text-stone-400">
                      No Body Weight Entries Added
                    </span>
                  ) : (
                    <>
                      <span className="font-semibold text-lg">
                        Latest Weight
                      </span>
                      <Button
                        color="success"
                        variant="flat"
                        size="sm"
                        onPress={() =>
                          navigate("/measurements/body-weight-list")
                        }
                      >
                        View History
                      </Button>
                    </>
                  )}
                </h3>
                {latestUserWeight.id !== 0 && (
                  <div className="flex flex-row justify-between items-center gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400">
                    <div className="flex flex-col justify-start items-start">
                      <span className="w-[21.5rem] truncate text-left">
                        {latestUserWeight.weight} {latestUserWeight.weight_unit}
                      </span>
                      <span className="text-xs text-yellow-600 text-left">
                        {latestUserWeight.formattedDate}
                      </span>
                      <span className="w-[21.5rem] break-all text-xs text-stone-500 text-left">
                        {latestUserWeight.comment}
                      </span>
                    </div>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
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
                        aria-label={`Option Menu For ${latestUserWeight.formattedDate} Body Weight Entry`}
                        onAction={(key) =>
                          handleLatestUserWeightOptionSelection(key as string)
                        }
                      >
                        <DropdownItem key="edit">Edit</DropdownItem>
                        <DropdownItem key="delete" className="text-danger">
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                )}
              </div>
              <Button className="font-medium" onPress={handleAddWeightButton}>
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
              <h3 className="flex items-center gap-2.5">
                {latestUserMeasurements.id === 0 ? (
                  <span className="flex justify-center text-stone-400">
                    No Body Measurement Entries Added
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-lg">
                      Latest Measurements
                    </span>
                    <Button
                      color="success"
                      variant="flat"
                      size="sm"
                      onPress={() =>
                        navigate("/measurements/user-measurement-list")
                      }
                    >
                      View History
                    </Button>
                  </>
                )}
              </h3>
              {latestUserMeasurements.id !== 0 && (
                <UserMeasurementAccordion
                  userMeasurementEntries={[latestUserMeasurements]}
                  handleMeasurementAccordionClick={
                    handleMeasurementAccordionClick
                  }
                  measurementMap={measurementMap}
                  handleUserMeasurementsOptionSelection={
                    handleUserMeasurementsOptionSelection
                  }
                  handleReassignMeasurement={handleReassignMeasurement}
                />
              )}
              <Button className="font-medium" onPress={handleAddMeasurements}>
                Add Measurements
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
