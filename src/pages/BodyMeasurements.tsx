import { useState, useEffect, useMemo, useCallback } from "react";
import { Measurement, UserSettings, UserWeight } from "../typings";
import {
  LoadingSpinner,
  MeasurementUnitDropdown,
  WeightUnitDropdown,
} from "../components";
import {
  FormatDateTimeString,
  GetLatestUserWeight,
  IsStringInvalidNumber,
  GetUserSettings,
  CreateActiveMeasurementInputs,
  UpdateActiveTrackingMeasurements,
  GenerateActiveMeasurementString,
} from "../helpers";
import { Button, Input } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Reorder } from "framer-motion";

export default function BodyMeasurementsPage() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [latestUserWeight, setLatestUserWeight] = useState<UserWeight>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newWeightInput, setNewWeightInput] = useState<string>("");
  const [newWeightUnit, setNewWeightUnit] = useState<string>("");
  const [newWeightCommentInput, setNewWeightCommentInput] =
    useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeMeasurements, setActiveMeasurements] = useState<Measurement[]>(
    []
  );
  const [invalidMeasurementInputs, setInvalidMeasurementInputs] = useState<
    Set<number>
  >(new Set<number>());
  const [measurementsCommentInput, setMeasurementsCommentInput] =
    useState<string>("");
  const [isReordering, setIsReordering] = useState<boolean>(false);

  const navigate = useNavigate();

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

  useEffect(() => {
    const loadUserSettings = async () => {
      const settings: UserSettings | undefined = await GetUserSettings();
      if (settings !== undefined) {
        setUserSettings(settings);
        setNewWeightUnit(settings.default_unit_weight!);
        await getActiveMeasurements(settings.active_tracking_measurements!);
      }
    };

    const getLatestUserWeight = async () => {
      const userWeight: UserWeight | undefined = await GetLatestUserWeight();
      if (userWeight !== undefined) setLatestUserWeight(userWeight);
      setIsLoading(false);
    };

    loadUserSettings();
    getLatestUserWeight();
  }, [getActiveMeasurements]);

  const isWeightInputInvalid = useMemo(() => {
    return IsStringInvalidNumber(newWeightInput);
  }, [newWeightInput]);

  const addUserWeight = async () => {
    if (isWeightInputInvalid || newWeightInput.trim().length === 0) return;

    const newWeight = Number(newWeightInput);

    const currentDate = new Date();
    const dateString = currentDate.toString();

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const commentToInsert: string | null =
        newWeightCommentInput.trim().length === 0
          ? null
          : newWeightCommentInput;

      const result = await db.execute(
        "INSERT into user_weights (weight, weight_unit, date, comment) VALUES ($1, $2, $3, $4)",
        [newWeight, newWeightUnit, dateString, commentToInsert]
      );

      const formattedDate: string = FormatDateTimeString(dateString);

      const newUserWeight: UserWeight = {
        id: result.lastInsertId,
        weight: newWeight,
        weight_unit: newWeightUnit,
        date: dateString,
        formattedDate: formattedDate,
        comment: commentToInsert,
      };

      setLatestUserWeight(newUserWeight);
      setNewWeightInput("");
      setNewWeightCommentInput("");

      toast.success("Body Weight Added");
    } catch (error) {
      console.log(error);
    }
  };

  const updateUserWeight = async () => {
    if (latestUserWeight === undefined) return;

    if (isWeightInputInvalid || newWeightInput.trim().length === 0) return;

    const newWeight = Number(newWeightInput);

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const commentToInsert: string | null =
        newWeightCommentInput.trim().length === 0
          ? null
          : newWeightCommentInput;

      await db.execute(
        "UPDATE user_weights SET weight = $1, weight_unit = $2, comment = $3 WHERE id = $4",
        [newWeight, newWeightUnit, commentToInsert, latestUserWeight.id]
      );

      const updatedUserWeight: UserWeight = {
        ...latestUserWeight,
        weight: newWeight,
        weight_unit: newWeightUnit,
        comment: commentToInsert,
      };

      setLatestUserWeight(updatedUserWeight);
      setNewWeightInput("");
      setIsEditing(false);
      setNewWeightCommentInput("");

      toast.success("Body Weight Updated");
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditButton = () => {
    if (latestUserWeight === undefined) return;

    setNewWeightInput(latestUserWeight.weight.toString());
    setNewWeightUnit(latestUserWeight.weight_unit);
    setNewWeightCommentInput(latestUserWeight.comment ?? "");
    setIsEditing(true);
  };

  const handleCancelButton = () => {
    if (userSettings === undefined) return;

    setNewWeightInput("");
    setIsEditing(false);
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

    const currentDate = new Date().toString();

    const commentToInsert: string | null =
      measurementsCommentInput.trim().length === 0
        ? null
        : measurementsCommentInput;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        `INSERT into user_measurement_entries (date, comment) 
        VALUES ($1, $2)`,
        [currentDate, commentToInsert]
      );

      const userMeasurementEntryId: number = result.lastInsertId;

      for (let i = 0; i < activeMeasurements.length; i++) {
        const measurement = activeMeasurements[i];

        if (
          measurement.input === undefined ||
          measurement.input.trim().length === 0
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

    const activeTrackinMeasurementString: string =
      GenerateActiveMeasurementString(activeTrackingMeasurementIdList);

    await UpdateActiveTrackingMeasurements(
      activeTrackinMeasurementString,
      userSettings.id
    );

    setIsReordering(false);
  };

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
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
              <div className="flex flex-col items-center text-stone-600 gap-2">
                <h3 className="flex text-lg font-semibold items-center gap-3">
                  Latest Weight
                  <Button
                    color="success"
                    variant="flat"
                    size="sm"
                    onClick={() => navigate("/measurements/body-weight-list")}
                  >
                    View History
                  </Button>
                </h3>
                <div className="flex flex-col">
                  <div className="flex gap-2 font-medium items-center">
                    <span>
                      {latestUserWeight?.weight}
                      {latestUserWeight?.weight_unit}
                    </span>
                    <span className="text-stone-400">
                      {latestUserWeight?.formattedDate}
                    </span>
                    <Button
                      color={isEditing ? "danger" : "success"}
                      variant="flat"
                      size="sm"
                      onPress={
                        isEditing ? handleCancelButton : handleEditButton
                      }
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                  </div>
                  {latestUserWeight?.comment !== null && (
                    <div className="flex justify-center gap-2">
                      <span className="font-medium">Comment</span>
                      <span className="font-medium text-stone-400">
                        {latestUserWeight?.comment}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between gap-2 items-center">
                  <Input
                    value={newWeightInput}
                    label="Weight"
                    size="sm"
                    variant="faded"
                    onValueChange={(value) => setNewWeightInput(value)}
                    isInvalid={isWeightInputInvalid}
                    isClearable
                  />
                  <WeightUnitDropdown
                    value={newWeightUnit}
                    setState={setNewWeightUnit}
                    targetType="state"
                  />
                  <Button
                    className="font-medium"
                    color="success"
                    onPress={isEditing ? updateUserWeight : addUserWeight}
                    isDisabled={
                      isWeightInputInvalid || newWeightInput.trim().length === 0
                    }
                  >
                    {isEditing ? "Update" : "Add"}
                  </Button>
                </div>
                <Input
                  value={newWeightCommentInput}
                  label="Comment"
                  size="sm"
                  variant="faded"
                  onValueChange={(value) => setNewWeightCommentInput(value)}
                  isClearable
                />
              </div>
              <h2 className="flex text-3xl font-semibold">Body Measurements</h2>
              <div className="flex justify-between gap-3">
                <Button
                  color="success"
                  variant="flat"
                  size="sm"
                  onClick={() => navigate("/measurements/measurement-list")}
                >
                  List of Measurements
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  size="sm"
                  onClick={() => navigate("/measurements/body-weight-list")}
                >
                  View History
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
                      Save Order
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
                          <div className="w-80 h-11 leading-9 truncate cursor-pointer bg-stone-100 hover:bg-white px-2 py-1 rounded outline outline-2 outline-stone-300">
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
                <div className="flex flex-col gap-2">
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
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
