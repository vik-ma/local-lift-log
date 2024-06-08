import { useState, useEffect, useMemo, useCallback } from "react";
import { Measurement, UserSettings, UserWeight } from "../typings";
import {
  DeleteModal,
  LoadingSpinner,
  MeasurementUnitDropdown,
  UserWeightModal,
} from "../components";
import {
  FormatDateTimeString,
  GetLatestUserWeight,
  IsStringInvalidNumber,
  GetUserSettings,
  CreateActiveMeasurementInputs,
  UpdateActiveTrackingMeasurements,
  GenerateActiveMeasurementString,
  ConvertEmptyStringToNull,
  IsStringEmpty,
  GetCurrentDateTimeISOString,
  UpdateUserWeight,
  DeleteUserWeightById,
} from "../helpers";
import {
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
} from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Reorder } from "framer-motion";
import { Link } from "react-router-dom";
import { useDefaultUserWeight, useIsStringValidNumber } from "../hooks";
import { VerticalMenuIcon } from "../assets";

type OperationType = "add-weight" | "edit-weight";

export default function BodyMeasurementsPage() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userWeightInput, setUserWeightInput] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<string>("");
  const [weightCommentInput, setWeightCommentInput] = useState<string>("");
  const [operationType, setOperationType] =
    useState<OperationType>("add-weight");

  const [activeMeasurements, setActiveMeasurements] = useState<Measurement[]>(
    []
  );
  const [invalidMeasurementInputs, setInvalidMeasurementInputs] = useState<
    Set<number>
  >(new Set<number>());
  const [measurementsCommentInput, setMeasurementsCommentInput] =
    useState<string>("");
  const [isReordering, setIsReordering] = useState<boolean>(false);

  const defaultUserWeight = useDefaultUserWeight();

  const [latestUserWeight, setLatestUserWeight] =
    useState<UserWeight>(defaultUserWeight);

  const navigate = useNavigate();

  const deleteModal = useDisclosure();
  const userWeightModal = useDisclosure();

  const getActiveMeasurements = useCallback(
    async (activeMeasurementsString: string) => {
      try {
        const activeMeasurements = await CreateActiveMeasurementInputs(
          activeMeasurementsString
        );
        setActiveMeasurements(activeMeasurements);
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

  useEffect(() => {
    const loadUserSettings = async () => {
      const settings: UserSettings | undefined = await GetUserSettings();
      if (settings !== undefined) {
        setUserSettings(settings);
        setWeightUnit(settings.default_unit_weight!);
        getActiveMeasurements(settings.active_tracking_measurements!);
        getLatestUserWeight(settings.clock_style!);
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, [getActiveMeasurements, getLatestUserWeight]);

  const isWeightInputValid = useIsStringValidNumber(userWeightInput);

  const addUserWeight = async () => {
    if (!isWeightInputValid) return;

    const newWeight = Number(userWeightInput);

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
    if (latestUserWeight.id === 0) return;

    if (!isWeightInputValid) return;

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
    setOperationType("add-weight");
  };

  const handleActiveMeasurementInputChange = (value: string, index: number) => {
    const updatedInputs = [...activeMeasurements];
    updatedInputs[index] = { ...updatedInputs[index], input: value };
    setActiveMeasurements(updatedInputs);
    validateActiveMeasurementInput(value, index);
  };

  const validateActiveMeasurementInput = (value: string, index: number) => {
    const updatedSet = new Set(invalidMeasurementInputs);
    if (IsStringInvalidNumber(value)) {
      updatedSet.add(index);
    } else {
      updatedSet.delete(index);
    }

    setInvalidMeasurementInputs(updatedSet);
  };

  const addActiveMeasurements = async () => {
    if (
      activeMeasurements.length < 1 ||
      invalidMeasurementInputs.size > 0 ||
      areActiveMeasurementInputsEmpty
    )
      return;

    const currentDateString = GetCurrentDateTimeISOString();

    const commentToInsert = ConvertEmptyStringToNull(measurementsCommentInput);

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        `INSERT into user_measurement_entries (date, comment) 
        VALUES ($1, $2)`,
        [currentDateString, commentToInsert]
      );

      const userMeasurementEntryId: number = result.lastInsertId;

      for (let i = 0; i < activeMeasurements.length; i++) {
        const measurement = activeMeasurements[i];

        if (
          measurement.input === undefined ||
          IsStringEmpty(measurement.input)
        ) {
          continue;
        }

        const inputNumber: number = Number(measurement.input);

        db.execute(
          `INSERT into user_measurements (measurement_id, value, unit, user_measurement_entry_id) 
          VALUES ($1, $2, $3, $4)`,
          [
            measurement.id,
            inputNumber,
            measurement.default_unit,
            userMeasurementEntryId,
          ]
        );
      }
    } catch (error) {
      console.log(error);
    }

    const updatedInputs = activeMeasurements.map((measurement) => ({
      ...measurement,
      input: "",
    }));
    setActiveMeasurements(updatedInputs);
    setMeasurementsCommentInput("");
    toast.success("Measurements Added");
  };

  const areActiveMeasurementInputsEmpty = useMemo(() => {
    let isEmpty: boolean = true;

    let i = 0;
    while (isEmpty && i < activeMeasurements.length) {
      if (activeMeasurements[i].input!.trim().length !== 0) isEmpty = false;
      i++;
    }

    return isEmpty;
  }, [activeMeasurements]);

  const updateActiveTrackingMeasurementOrder = async () => {
    if (userSettings === undefined) return;

    const activeTrackingMeasurementIdList: number[] = activeMeasurements.map(
      (obj) => obj.id
    );

    const activeTrackingMeasurementString: string =
      GenerateActiveMeasurementString(activeTrackingMeasurementIdList);

    await UpdateActiveTrackingMeasurements(
      activeTrackingMeasurementString,
      userSettings.id
    );

    setIsReordering(false);
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Body Weight Entry"
        body={
          <p className="break-words">
            Are you sure you want to permanently delete the latest Body Weight
            entry? ?
          </p>
        }
        deleteButtonAction={() => deleteLatestUserWeight()}
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
                <h3 className="flex text-lg font-semibold items-center gap-3">
                  {latestUserWeight.id === 0 ? (
                    <span className="text-stone-400">
                      No Body Weight Entries Added
                    </span>
                  ) : (
                    <>
                      Latest Weight
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
                        aria-label={`Option Menu For ${latestUserWeight.id}`}
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
              <Button onPress={handleAddWeightButton}>Add Weight</Button>
              <h2 className="flex text-3xl font-semibold">Body Measurements</h2>
              <div className="flex justify-between gap-3">
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
                <Button
                  color="success"
                  variant="flat"
                  size="sm"
                  onPress={() => navigate("/measurements/measurement-list")}
                >
                  List of Measurements
                </Button>
              </div>
              <h3 className="flex text-lg font-semibold">
                Active Measurements
              </h3>
              {isReordering ? (
                <div className="flex flex-col gap-2.5 items-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      className="font-medium"
                      color="danger"
                      size="sm"
                      onPress={() => setIsReordering(false)}
                    >
                      Cancel Reordering
                    </Button>
                    <Button
                      className="font-medium"
                      color="success"
                      size="sm"
                      onPress={() => updateActiveTrackingMeasurementOrder()}
                    >
                      Save Current Order
                    </Button>
                  </div>
                  <div className="flex justify-center w-full">
                    <Reorder.Group
                      className="flex flex-col gap-1.5 w-full"
                      values={activeMeasurements}
                      onReorder={setActiveMeasurements}
                    >
                      {activeMeasurements.map((measurement) => (
                        <Reorder.Item key={measurement.id} value={measurement}>
                          <div className="w-80 h-11 leading-9 truncate cursor-grab active:cursor-grabbing bg-stone-100 hover:bg-white px-2 py-1 rounded outline outline-2 outline-stone-300">
                            <span className="text-lg text-stone-700">
                              {measurement.name}
                            </span>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>
                </div>
              ) : (
                <div>
                  {activeMeasurements.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {activeMeasurements.length > 1 && (
                        <div className="flex justify-center">
                          <Button
                            className="font-medium"
                            color="success"
                            variant="flat"
                            size="sm"
                            onPress={() => setIsReordering(true)}
                          >
                            Reorder Measurements
                          </Button>
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        {activeMeasurements.map((measurement, index) => (
                          <div
                            className="flex justify-between gap-2 items-center"
                            key={`measurement-${measurement.id}`}
                          >
                            <Input
                              value={measurement.input}
                              label={measurement.name}
                              size="sm"
                              variant="faded"
                              onValueChange={(value) =>
                                handleActiveMeasurementInputChange(value, index)
                              }
                              isInvalid={invalidMeasurementInputs.has(index)}
                              isClearable
                            />
                            <MeasurementUnitDropdown
                              value={measurement.default_unit}
                              measurements={activeMeasurements}
                              setMeasurements={setActiveMeasurements}
                              measurement={measurement}
                              targetType="active"
                              isDisabled={
                                measurement.measurement_type === "Caliper"
                              }
                            />
                          </div>
                        ))}
                        <Input
                          value={measurementsCommentInput}
                          label="Comment"
                          size="sm"
                          variant="faded"
                          onValueChange={(value) =>
                            setMeasurementsCommentInput(value)
                          }
                          isClearable
                        />
                      </div>
                      <Button
                        className="font-medium"
                        color="success"
                        onPress={addActiveMeasurements}
                        isDisabled={
                          invalidMeasurementInputs.size > 0 ||
                          areActiveMeasurementInputsEmpty
                        }
                      >
                        Save Measurements
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs text-stone-500 font-normal">
                        Add Measurements to actively track in the{" "}
                        <Link className="text-success" to={"measurement-list"}>
                          List of Measurements
                        </Link>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
