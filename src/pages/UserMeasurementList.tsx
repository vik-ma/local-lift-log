import { useState, useEffect } from "react";
import {
  LoadingSpinner,
  UserMeasurementAccordion,
  DeleteModal,
  UserMeasurementModal,
} from "../components";
import Database from "tauri-plugin-sql-api";
import {
  Measurement,
  MeasurementMap,
  UserMeasurement,
  UserSettings,
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
} from "../helpers";
import { useDefaultUserMeasurements, useMeasurementsInputs } from "../hooks";
import { useDisclosure } from "@nextui-org/react";
import { toast, Toaster } from "react-hot-toast";

type OperationType = "edit" | "delete";

export default function UserMeasurementList() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userMeasurements, setUserMeasurements] = useState<UserMeasurement[]>(
    []
  );
  const [measurementMap, setMeasurementMap] = useState<MeasurementMap>({});
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

  const {
    invalidMeasurementInputs,
    areActiveMeasurementsValid,
    handleActiveMeasurementInputChange,
  } = useMeasurementsInputs(activeMeasurements, setActiveMeasurements);

  const deleteModal = useDisclosure();
  const userMeasurementModal = useDisclosure();

  useEffect(() => {
    const getUserMeasurements = async (clockStyle: string) => {
      const measurementMap = await GetMeasurementsMap();

      setMeasurementMap(measurementMap);

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
    };

    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings) {
        setUserSettings(userSettings);
        getUserMeasurements(userSettings.clock_style);
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, []);

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
        buttonAction={updateUserMeasurements}
        isEditing={operationType === "edit"}
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
        />
      </div>
    </>
  );
}
