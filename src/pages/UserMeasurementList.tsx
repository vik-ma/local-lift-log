import { useState, useEffect, useCallback } from "react";
import {
  LoadingSpinner,
  UserMeasurementAccordion,
  DeleteModal,
  UserMeasurementModal,
  NameInputModal,
} from "../components";
import Database from "tauri-plugin-sql-api";
import {
  Measurement,
  MeasurementMap,
  UserMeasurement,
  UserSettings,
  ReassignMeasurementsProps,
} from "../typings";
import {
  ConvertUserMeasurementValuesToMeasurementInputs,
  CreateDetailedUserMeasurementList,
  DeleteUserMeasurementById,
  GetMeasurementsMap,
  GetUserSettings,
  ConvertEmptyStringToNull,
  CreateUserMeasurementValues,
  UpdateUserMeasurements,
  InsertMeasurementIntoDatabase,
  ReassignMeasurementIdForUserMeasurements,
} from "../helpers";
import {
  useDefaultUserMeasurements,
  useMeasurementsInputs,
  useValidateName,
} from "../hooks";
import { useDisclosure } from "@nextui-org/react";
import { toast, Toaster } from "react-hot-toast";

type OperationType = "edit" | "delete" | "reassign";

export default function UserMeasurementList() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userMeasurements, setUserMeasurements] = useState<UserMeasurement[]>(
    []
  );
  const [measurementMap, setMeasurementMap] = useState<MeasurementMap>(
    new Map<string, Measurement>()
  );
  const [operationType, setOperationType] = useState<OperationType>("edit");
  const [activeMeasurements, setActiveMeasurements] = useState<Measurement[]>(
    []
  );
  const [measurementsCommentInput, setMeasurementsCommentInput] =
    useState<string>("");
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const defaultUserMeasurements = useDefaultUserMeasurements();

  const [operatingUserMeasurements, setOperatingUserMeasurements] =
    useState<UserMeasurement>(defaultUserMeasurements);

  const [newMeasurementName, setNewMeasurementName] = useState<string>("");

  const isNewMeasurementNameValid = useValidateName(newMeasurementName);

  const [measurementToReassign, setMeasurementToReassign] =
    useState<ReassignMeasurementsProps>();

  const {
    invalidMeasurementInputs,
    areActiveMeasurementsValid,
    handleActiveMeasurementInputChange,
  } = useMeasurementsInputs(activeMeasurements, setActiveMeasurements);

  const deleteModal = useDisclosure();
  const userMeasurementModal = useDisclosure();
  const nameInputModal = useDisclosure();

  const getUserMeasurements = useCallback(
    async (clockStyle: string, measurementMap: MeasurementMap) => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<UserMeasurement[]>(
          "SELECT * FROM user_measurements ORDER BY id DESC"
        );

        const detailedUserMeasurements = CreateDetailedUserMeasurementList(
          result,
          measurementMap,
          clockStyle
        );

        setUserMeasurements(detailedUserMeasurements);
      } catch (error) {
        console.log(error);
      }
    },
    []
  );

  useEffect(() => {
    const getMeasurements = async (clockStyle: string) => {
      const measurementMap = await GetMeasurementsMap();
      setMeasurementMap(measurementMap);
      getUserMeasurements(clockStyle, measurementMap);
    };

    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings) {
        setUserSettings(userSettings);
        getMeasurements(userSettings.clock_style);
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, [getUserMeasurements]);

  const handleMeasurementAccordionClick = (
    measurement: UserMeasurement,
    index: number
  ) => {
    const updatedMeasurement: UserMeasurement = {
      ...measurement,
      isExpanded: !measurement.isExpanded,
    };

    const updatedMeasurementEntries = [...userMeasurements];
    updatedMeasurementEntries[index] = updatedMeasurement;

    setUserMeasurements(updatedMeasurementEntries);
  };

  const updateUserMeasurements = async () => {
    if (
      operatingUserMeasurements.id === 0 ||
      !areActiveMeasurementsValid ||
      userSettings === undefined
    )
      return;

    const commentToInsert = ConvertEmptyStringToNull(measurementsCommentInput);

    const userMeasurementValues =
      CreateUserMeasurementValues(activeMeasurements);

    const updatedUserMeasurements: UserMeasurement = {
      ...operatingUserMeasurements,
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

    setUserMeasurements((prev) =>
      prev.map((item) =>
        item.id === operatingUserMeasurements.id
          ? detailedUpdatedUserMeasurement[0]
          : item
      )
    );

    resetUserMeasurements();

    toast.success("Body Measurements Entry Updated");
    userMeasurementModal.onClose();
  };

  const deleteUserMeasurements = async () => {
    if (operatingUserMeasurements.id === 0 || operationType !== "delete")
      return;

    const success = await DeleteUserMeasurementById(
      operatingUserMeasurements.id
    );

    if (!success) return;

    const updatedUserMeasurements: UserMeasurement[] = userMeasurements.filter(
      (item) => item.id !== operatingUserMeasurements.id
    );

    setUserMeasurements(updatedUserMeasurements);

    resetUserMeasurements();

    toast.success("Body Measurements Entry Deleted");
    deleteModal.onClose();
  };

  const resetUserMeasurements = () => {
    setOperatingUserMeasurements(defaultUserMeasurements);
    setOperationType("edit");
    setActiveMeasurements([]);
    setMeasurementsCommentInput("");
  };

  const handleEditUserMeasurements = (userMeasurements: UserMeasurement) => {
    if (userMeasurements.userMeasurementValues === undefined) return;

    const activeMeasurements = ConvertUserMeasurementValuesToMeasurementInputs(
      userMeasurements.userMeasurementValues,
      measurementMap
    );

    setActiveMeasurements(activeMeasurements);
    setMeasurementsCommentInput(userMeasurements.comment ?? "");

    setOperatingUserMeasurements(userMeasurements);
    setOperationType("edit");
    userMeasurementModal.onOpen();
  };

  const handleUserMeasurementsOptionSelection = (
    key: string,
    userMeasurements: UserMeasurement
  ) => {
    if (key === "edit") {
      handleEditUserMeasurements(userMeasurements);
    } else if (key === "delete") {
      setOperatingUserMeasurements(userMeasurements);
      setOperationType("delete");
      deleteModal.onOpen();
    }
  };

  const handleReassignMeasurement = (values: ReassignMeasurementsProps) => {
    setMeasurementToReassign(values);
    setOperationType("reassign");
    nameInputModal.onOpen();
  };

  const reassignMeasurement = async () => {
    if (
      measurementToReassign === undefined ||
      !isNewMeasurementNameValid ||
      operationType !== "reassign" ||
      userSettings === undefined
    )
      return;

    const newMeasurement: Measurement = {
      id: 0,
      name: newMeasurementName,
      default_unit: measurementToReassign.unit,
      measurement_type: measurementToReassign.measurement_type,
    };

    const newMeasurementId = await InsertMeasurementIntoDatabase(
      newMeasurement
    );

    if (newMeasurementId === 0) return;

    const success = await ReassignMeasurementIdForUserMeasurements(
      measurementToReassign.id,
      newMeasurementId.toString(),
      userMeasurements,
      measurementMap
    );

    if (!success) return;

    await getUserMeasurements(userSettings?.clock_style, measurementMap);

    setMeasurementToReassign(undefined);
    setNewMeasurementName("");
    resetUserMeasurements();

    nameInputModal.onClose();
    toast.success("Measurement Reassigned");
  };

  if (userSettings === undefined || isLoading) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Body Measurements Entry"
        body={
          <p className="break-words">
            Are you sure you want to permanently delete the Body Measurements
            entry on{" "}
            <span className="text-yellow-600">
              {operatingUserMeasurements.formattedDate}
            </span>
            ?
          </p>
        }
        deleteButtonAction={deleteUserMeasurements}
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
        buttonAction={updateUserMeasurements}
        isEditing={operationType === "edit"}
      />
      <NameInputModal
        nameInputModal={nameInputModal}
        name={newMeasurementName}
        setName={setNewMeasurementName}
        header="Enter Measurement Name"
        isNameValid={isNewMeasurementNameValid}
        buttonAction={reassignMeasurement}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            User Measurements
          </h1>
        </div>
        <UserMeasurementAccordion
          userMeasurementEntries={userMeasurements}
          handleMeasurementAccordionClick={handleMeasurementAccordionClick}
          measurementMap={measurementMap}
          handleUserMeasurementsOptionSelection={
            handleUserMeasurementsOptionSelection
          }
          handleReassignMeasurement={handleReassignMeasurement}
        />
      </div>
    </>
  );
}
