import { useEffect, useState } from "react";
import { useCalculationModal, useListFilters, usePresetsList } from "../hooks";
import { Button, useDisclosure } from "@heroui/react";
import {
  CalculationModal,
  FilterPresetsListModal,
  LoadingSpinner,
  TextInputModal,
  TimeInputModal,
} from "../components";
import {
  CalculationListItem,
  Exercise,
  PresetsType,
  UserSettings,
} from "../typings";
import {
  CreateDefaultDistances,
  CreateDefaultEquipmentWeights,
  CreateDefaultExercises,
  CreateDefaultMeasurements,
  GetCurrentDateTimeISOString,
  GetUserSettings,
} from "../helpers";

export default function Test() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [isMetric, setIsMetric] = useState<boolean>(true);

  const currentDate = GetCurrentDateTimeISOString();

  const [userSettings, setUserSettings] = useState<UserSettings>();

  const calculationModal = useCalculationModal();
  const textInputModal = useDisclosure();
  const timeInputModal = useDisclosure();

  const presetsList = usePresetsList(false, false);

  const listFilters = useListFilters();

  const { setFilterWeightRangeUnit } = listFilters;

  const handleCreateDefaultsButton = async (key: string) => {
    if (key === "exercises") {
      await CreateDefaultExercises();
    } else if (key === "measurements") {
      await CreateDefaultMeasurements(isMetric);
    } else if (key === "equipment-weights") {
      await CreateDefaultEquipmentWeights(isMetric);
    } else if (key === "distances") {
      await CreateDefaultDistances(isMetric);
    }
  };

  const changePresetType = () => {
    if (presetsList.presetsType === "equipment") {
      presetsList.setPresetsType("distance");
    } else {
      presetsList.setPresetsType("equipment");
    }
  };

  const calculationModalDoneButtonAction = async (
    value: number,
    presetsType: PresetsType,
    calculationList: CalculationListItem[],
    exercise: Exercise,
    totalMultiplier: number,
    isActiveSet: boolean
  ) => {
    console.log(
      value,
      presetsType,
      calculationList,
      exercise,
      totalMultiplier,
      isActiveSet
    );
  };

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();
      if (userSettings === undefined) return;
      setUserSettings(userSettings);
      setFilterWeightRangeUnit(userSettings.default_unit_weight);
    };

    loadUserSettings();
  }, []);

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <TextInputModal
        textInputModal={textInputModal}
        value={text}
        setValue={setText}
        label="Test"
        header="Test Text Input Modal"
        buttonAction={() => {}}
      />
      <TimeInputModal
        timeInputModal={timeInputModal}
        header="Test Time Input Modal"
        clockStyle={userSettings.clock_style}
        locale={userSettings.locale}
        value={currentDate}
        saveButtonAction={() => {}}
      />
      <CalculationModal
        useCalculationModal={calculationModal}
        usePresetsList={presetsList}
        doneButtonAction={calculationModalDoneButtonAction}
        multiplierIncrement={2}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
      />
      <FilterPresetsListModal
        usePresetsList={presetsList}
        userSettings={userSettings}
      />
      <div className="flex flex-col gap-2">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            TEST
          </h1>
        </div>
        <Button onPress={() => calculationModal.calculationModal.onOpen()}>
          Open Calculation Modal
        </Button>
        <div className="flex gap-2 justify-center items-center">
          <span className="font-medium">Presets Type:</span>
          <span>{presetsList.presetsType}</span>
          <Button size="sm" variant="flat" onPress={changePresetType}>
            Change
          </Button>
        </div>
        <div className="flex gap-2 justify-center items-center">
          <span className="font-medium">Metric Units:</span>
          <span>{isMetric ? "True" : "False"}</span>
          <Button
            size="sm"
            variant="flat"
            onPress={() => setIsMetric(!isMetric)}
          >
            Change
          </Button>
        </div>
        <div className="flex gap-1 justify-center">
          <Button color="primary" size="sm" variant="flat">
            Primary
          </Button>
          <Button color="secondary" size="sm" variant="flat">
            Secondary
          </Button>
          <Button color="danger" size="sm" variant="flat">
            Danger
          </Button>
          <Button color="success" size="sm" variant="flat">
            Success
          </Button>
        </div>
        <h2 className="flex justify-center text-xl font-semibold">
          CREATE DEFAULTS
        </h2>
        <div className="flex gap-1 justify-center">
          <Button
            size="sm"
            variant="flat"
            onPress={() => handleCreateDefaultsButton("exercises")}
          >
            Exercises
          </Button>
          <Button
            size="sm"
            variant="flat"
            onPress={() => handleCreateDefaultsButton("measurements")}
          >
            Measurements
          </Button>
          <Button
            size="sm"
            variant="flat"
            onPress={() => handleCreateDefaultsButton("equipment-weights")}
          >
            Equipment Weights
          </Button>
          <Button
            size="sm"
            variant="flat"
            onPress={() => handleCreateDefaultsButton("distances")}
          >
            Distances
          </Button>
        </div>
        <Button variant="flat" onPress={() => textInputModal.onOpen()}>
          Open Text Input Modal
        </Button>
        <Button variant="flat" onPress={() => timeInputModal.onOpen()}>
          Open Time Input Modal
        </Button>
        <div className="flex flex-col bg-white border border-black overflow-auto mb-20">
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
        </div>
        <div
          className={
            isExpanded
              ? "fixed bottom-0 top-16 bg-red-500 w-[400px]"
              : "fixed bottom-0 bg-red-500 h-20 w-[400px]"
          }
        >
          <button
            className="h-20 w-[400px] cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          ></button>
        </div>
      </div>
    </>
  );
}
