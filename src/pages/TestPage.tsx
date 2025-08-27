import { useEffect, useRef, useState } from "react";
import { useCalculationModal, useListFilters, usePresetsList } from "../hooks";
import { Button, useDisclosure } from "@heroui/react";
import {
  CalculationModal,
  FilterPresetsListModal,
  LoadingSpinner,
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
  LoadStore,
  ValidateAndModifyDefaultUnits,
} from "../helpers";
import { Store } from "@tauri-apps/plugin-store";

export default function Test() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMetric, setIsMetric] = useState<boolean>(true);

  const store = useRef<Store>(null);

  const [storeTest, setStoreTest] = useState<number>(0);
  const [sortCategoryTimePeriods, setSortCategoryTimePeriods] =
    useState<string>("");

  const currentDate = GetCurrentDateTimeISOString();

  const [userSettings, setUserSettings] = useState<UserSettings>();

  const calculationModal = useCalculationModal();
  const timeInputModal = useDisclosure();

  const presetsList = usePresetsList({ store: store });

  const listFilters = useListFilters({ store: store, filterMapSuffix: "test" });

  // TODO: FIX
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

  const changeStoreValue = async () => {
    if (store.current === null) return;

    const newVal = storeTest + 1;

    setStoreTest(newVal);

    await store.current.set("test", { value: newVal });
  };

  useEffect(() => {
    const loadStore = async () => {
      await LoadStore(store);

      if (store.current === null) return;

      const testVal = await store.current.get<{ value: number }>("test");
      const sortCategoryVal = await store.current.get<{ value: string }>(
        "sort-category-time-periods"
      );

      if (testVal === undefined || sortCategoryVal === undefined) return;

      setStoreTest(testVal.value);
      setSortCategoryTimePeriods(sortCategoryVal.value);
    };

    const loadPage = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);

      ValidateAndModifyDefaultUnits(userSettings, new Set(["weight"]));

      // TODO: FIX
      setFilterWeightRangeUnit(userSettings.default_unit_weight);
    };

    loadStore();
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
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
        userSettings={userSettings}
        setUserSettings={setUserSettings}
        store={store}
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
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <span className="font-semibold">Store Value:</span>
            <span>{storeTest}</span>
          </div>
          <div className="flex gap-1">
            <span className="font-semibold">Category:</span>
            <span>{sortCategoryTimePeriods}</span>
          </div>
          <Button size="sm" onPress={changeStoreValue}>
            Change
          </Button>
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
              ? "fixed bottom-0 top-16 bg-red-500 w-[400px] flex flex-col"
              : "fixed bottom-0 bg-red-500 h-20 w-[400px] flex flex-col"
          }
        >
          <button
            className="h-20 w-[400px] cursor-pointer hover:bg-red-400"
            onClick={() => setIsExpanded(!isExpanded)}
          ></button>

          {isExpanded && (
            <div className="overflow-auto flex flex-col">
              <div className="bg-white overflow-y-auto scroll-gradient scrollable-hidden-scrollbar">
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
                Scrollable <br />
              </div>
              <div className="bg-blue-200">
                Always Shown 1 <br />
                Always Shown 2 <br />
                Always Shown 3 <br />
                Always Shown 4 <br />
                Always Shown 5 <br />
                Always Shown 6 <br />
                Always Shown 7 <br />
                Always Shown 8 <br />
                Always Shown 9 <br />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
