import { useState, useEffect, useMemo } from "react";
import { UserSettingsOptional, UserWeight } from "../typings";
import { LoadingSpinner, WeightUnitDropdown } from "../components";
import { GetDefaultUnitValues, IsStringInvalidNumber } from "../helpers";
import { Button, Input } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";

export default function UserMeasurementsPage() {
  const [userSettings, setUserSettings] = useState<UserSettingsOptional>();
  const [userWeights, setUserWeights] = useState<UserWeight[]>([]);
  const [latestUserWeight, setLatestUserWeight] = useState<UserWeight>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newWeightInput, setNewWeightInput] = useState<string>("");
  const [newWeightUnit, setNewWeightUnit] = useState<string>("");

  useEffect(() => {
    const loadUserSettings = async () => {
      const settings: UserSettingsOptional | undefined =
        await GetDefaultUnitValues();
      if (settings !== undefined) {
        setUserSettings(settings);
        setNewWeightUnit(settings.default_unit_weight!);
      }
      setIsLoading(false);
    };

    loadUserSettings();
  }, []);

  const isWeightInputInvalid = useMemo(() => {
    return IsStringInvalidNumber(newWeightInput);
  }, [newWeightInput]);

  const addUserWeight = async () => {
    if (isWeightInputInvalid || newWeightInput.trim().length === 0) return;

    const newWeight = Number(newWeightInput);

    const currentDate = new Date().toString();

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        "INSERT into user_weights (weight, weight_unit, date) VALUES ($1, $2, $3)",
        [newWeight, newWeightUnit, currentDate]
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Measurements
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="flex flex-col gap-4">
            <h2 className="flex text-3xl font-semibold justify-center">
              Body Weight
            </h2>
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
                actionMeasurements={setNewWeightUnit}
                targetType="measurements"
              />
              <Button
                className="font-medium"
                color="success"
                onPress={addUserWeight}
                isDisabled={
                  isWeightInputInvalid || newWeightInput.trim().length === 0
                }
              >
                Add
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
