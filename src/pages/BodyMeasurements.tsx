import { useState, useEffect, useMemo } from "react";
import { UserSettingsOptional, UserWeight } from "../typings";
import { LoadingSpinner, WeightUnitDropdown } from "../components";
import {
  FormatDateTimeString,
  GetDefaultUnitValues,
  GetLatestUserWeight,
  IsStringInvalidNumber,
} from "../helpers";
import { Button, Input } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function BodyMeasurementsPage() {
  const [userSettings, setUserSettings] = useState<UserSettingsOptional>();
  const [latestUserWeight, setLatestUserWeight] = useState<UserWeight>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newWeightInput, setNewWeightInput] = useState<string>("");
  const [newWeightUnit, setNewWeightUnit] = useState<string>("");
  const [newWeightCommentInput, setNewWeightCommentInput] =
    useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadUserSettings = async () => {
      const settings: UserSettingsOptional | undefined =
        await GetDefaultUnitValues();
      if (settings !== undefined) {
        setUserSettings(settings);
        setNewWeightUnit(settings.default_unit_weight!);
      }
    };

    const getLatestUserWeight = async () => {
      const userWeight: UserWeight | undefined = await GetLatestUserWeight();
      if (userWeight !== undefined) setLatestUserWeight(userWeight);
      setIsLoading(false);
    };

    loadUserSettings();
    getLatestUserWeight();
  }, []);

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

      await db.execute(
        "UPDATE user_weights SET weight = $1, weight_unit = $2 WHERE id = $3",
        [newWeight, newWeightUnit, latestUserWeight.id]
      );

      const updatedUserWeight: UserWeight = {
        ...latestUserWeight,
        weight: newWeight,
        weight_unit: newWeightUnit,
      };

      setLatestUserWeight(updatedUserWeight);
      setNewWeightInput("");
      setIsEditing(false);

      toast.success("Body Weight Updated");
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditButton = () => {
    if (latestUserWeight === undefined) return;

    setNewWeightInput(latestUserWeight.weight.toString());
    setNewWeightUnit(latestUserWeight.weight_unit);
    setIsEditing(true);
  };

  const handleCancelButton = () => {
    if (userSettings === undefined) return;

    setNewWeightInput("");
    setIsEditing(false);
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
            <div className="flex flex-col gap-4 items-center">
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
                    View Full List
                  </Button>
                </h3>
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
                    onPress={isEditing ? handleCancelButton : handleEditButton}
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
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
              <div className="flex justify-center">
                <Button
                  color="success"
                  variant="flat"
                  onClick={() => navigate("/measurements/measurement-list")}
                >
                  List of Measurements
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
