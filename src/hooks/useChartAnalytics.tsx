import { useDisclosure } from "@heroui/react";
import { useMemo, useRef, useState } from "react";
import {
  ChartComment,
  ChartDataCategory,
  ChartDataCategoryNoUndefined,
  ChartDataExerciseCategory,
  ChartDataExerciseCategoryBase,
  ChartDataItem,
  ChartDataUnitCategory,
  ChartReferenceAreaItem,
  UserSettings,
} from "../typings";
import { useDefaultChartMapsAndConfig, useLoadExerciseOptionsMap } from ".";
import {
  GetPaceUnitFromDistanceUnit,
  GetSpeedUnitFromDistanceUnit,
  GetValidatedUserSettingsUnits,
  ValidLoadExerciseOptionsCategories,
} from "../helpers";
import { ChartConfig } from "../components/ui/chart";

export const useChartAnalytics = () => {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [weightUnit, setWeightUnit] = useState<string>("kg");
  const [distanceUnit, setDistanceUnit] = useState<string>("km");
  const [speedUnit, setSpeedUnit] = useState<string>("km/h");
  const [paceUnit, setPaceUnit] = useState<string>("min/km");
  const [circumferenceUnit, setCircumferenceUnit] = useState<string>("cm");
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [chartDataAreas, setChartDataAreas] = useState<ChartDataCategory[]>([]);
  const [chartDataLines, setChartDataLines] = useState<ChartDataCategory[]>([]);
  const [primaryDataKey, setPrimaryDataKey] = useState<ChartDataCategory>();
  const [secondaryDataKey, setSecondaryDataKey] = useState<ChartDataCategory>();
  const [secondaryDataUnitCategory, setSecondaryDataUnitCategory] =
    useState<ChartDataUnitCategory>();
  const [chartLineUnitCategorySet, setChartLineUnitCategorySet] = useState<
    Set<ChartDataUnitCategory>
  >(new Set());
  const [shownChartDataAreas, setShownChartDataAreas] = useState<
    ChartDataCategory[]
  >([]);
  const [shownChartDataLines, setShownChartDataLines] = useState<
    ChartDataCategory[]
  >([]);
  const [referenceAreas, setReferenceAreas] = useState<
    ChartReferenceAreaItem[]
  >([]);
  const [shownReferenceAreas, setShownReferenceAreas] = useState<
    ChartReferenceAreaItem[]
  >([]);
  const [chartCommentMap, setChartCommentMap] = useState<
    Map<string, ChartComment[]>
  >(new Map());
  const [chartStartDate, setChartStartDate] = useState<Date | null>(null);
  const [chartEndDate, setChartEndDate] = useState<Date | null>(null);
  const [filterMinDate, setFilterMinDate] = useState<Date | null>(null);
  const [filterMaxDate, setFilterMaxDate] = useState<Date | null>(null);
  const [filteredChartData, setFilteredChartData] = useState<ChartDataItem[]>(
    []
  );
  const [loadExerciseOptions, setLoadExerciseOptions] = useState<
    Set<ChartDataExerciseCategoryBase>
  >(new Set());
  const [
    loadExerciseOptionsUnitCategoryPrimary,
    setLoadExerciseOptionsUnitCategoryPrimary,
  ] = useState<ChartDataUnitCategory>();
  const [
    loadExerciseOptionsUnitCategorySecondary,
    setLoadExerciseOptionsUnitCategorySecondary,
  ] = useState<ChartDataUnitCategory>();
  const [
    loadExerciseOptionsUnitCategoriesPrimary,
    setLoadExerciseOptionsUnitCategoriesPrimary,
  ] = useState<Set<ChartDataUnitCategory>>(new Set());
  const [
    loadExerciseOptionsUnitCategoriesSecondary,
    setLoadExerciseOptionsUnitCategoriesSecondary,
  ] = useState<ChartDataUnitCategory[]>([]);
  const [disabledLoadExerciseOptions, setDisabledLoadExerciseOptions] =
    useState<Set<ChartDataExerciseCategoryBase>>(new Set());

  const loadExerciseOptionsModal = useDisclosure();
  const deleteModal = useDisclosure();

  const loadExerciseOptionsMap = useLoadExerciseOptionsMap();

  const validLoadExerciseOptionsCategories =
    ValidLoadExerciseOptionsCategories();

  const highestCategoryValues = useRef<Map<ChartDataCategory, number>>(
    new Map()
  );
  const filteredHighestCategoryValues = useRef<Map<ChartDataCategory, number>>(
    new Map()
  );

  const loadedCharts = useRef<Set<ChartDataCategoryNoUndefined>>(new Set());

  // Don't replace with size of loadedCharts
  const isChartDataLoaded = useRef<boolean>(false);

  const {
    defaultChartDataUnitMap,
    defaultChartDataUnitCategoryMap,
    defaultChartConfig,
  } = useDefaultChartMapsAndConfig();

  const chartDataUnitMap = useRef<Map<ChartDataCategory, string>>(
    new Map(defaultChartDataUnitMap)
  );

  const chartDataUnitCategoryMap = useRef(
    new Map<ChartDataCategory, ChartDataUnitCategory>(
      defaultChartDataUnitCategoryMap
    )
  );

  const chartConfig = useRef<ChartConfig>({ ...defaultChartConfig });

  const allChartDataCategories = useMemo(
    () => new Set([...chartDataAreas, ...chartDataLines]),
    [chartDataAreas, chartDataLines]
  );

  const includesMultisetMap = useRef<Map<string, Set<ChartDataCategory>>>(
    new Map()
  );

  const {
    weightCharts,
    distanceCharts,
    paceCharts,
    speedCharts,
    circumferenceCharts,
  } = useMemo(() => {
    const weightCharts = new Set<ChartDataCategoryNoUndefined>();
    const distanceCharts = new Set<ChartDataCategoryNoUndefined>();
    const speedCharts = new Set<ChartDataCategoryNoUndefined>();
    const paceCharts = new Set<ChartDataCategoryNoUndefined>();
    const circumferenceCharts = new Set<ChartDataCategoryNoUndefined>();

    for (const chart of allChartDataCategories) {
      if (chart === undefined) continue;

      const unitCategory = chartDataUnitCategoryMap.current.get(chart);

      switch (unitCategory) {
        case "Weight":
          weightCharts.add(chart);
          break;
        case "Distance":
          distanceCharts.add(chart);
          break;
        case "Speed":
          speedCharts.add(chart);
          break;
        case "Pace":
          paceCharts.add(chart);
          break;
        case "Circumference":
          circumferenceCharts.add(chart);
          break;
        default:
          break;
      }
    }

    return {
      weightCharts,
      distanceCharts,
      paceCharts,
      speedCharts,
      circumferenceCharts,
    };
  }, [allChartDataCategories]);

  const updateExerciseStatUnit = (
    chartName: ChartDataExerciseCategory,
    optionCategory: ChartDataUnitCategory
  ) => {
    let unit = "";

    switch (optionCategory) {
      case "Weight":
        unit = ` ${weightUnit}`;
        break;
      case "Distance":
        unit = ` ${distanceUnit}`;
        break;
      case "Time":
        unit = " min";
        break;
      case "Speed":
        unit = ` ${speedUnit}`;
        break;
      case "Pace":
        unit = ` ${paceUnit}`;
        break;
      case "Number Of Sets":
        unit = " sets";
        break;
      case "Number Of Reps":
        unit = " reps";
        break;
      case "RIR":
        unit = " RIR";
        break;
      case "RPE":
        unit = " RPE";
        break;
      case "Resistance Level":
        unit = " RL";
        break;
      default:
        break;
    }

    chartDataUnitMap.current.set(chartName, unit);
  };

  const assignDefaultUnits = (userSettings: UserSettings) => {
    const validUnits = GetValidatedUserSettingsUnits(userSettings);

    setWeightUnit(validUnits.weightUnit);
    setDistanceUnit(validUnits.distanceUnit);
    setCircumferenceUnit(validUnits.measurementUnit);
    setSpeedUnit(GetSpeedUnitFromDistanceUnit(validUnits.distanceUnit));
    setPaceUnit(GetPaceUnitFromDistanceUnit(validUnits.distanceUnit));

    chartDataUnitMap.current.set("body_weight", ` ${validUnits.weightUnit}`);
  };

  const updateChartDataAndFilteredHighestCategoryValues = (
    updatedChartData: ChartDataItem[],
    minDate: Date | null,
    maxDate: Date | null
  ) => {
    setChartData(updatedChartData);

    if (!minDate && !maxDate) {
      setFilteredChartData(updatedChartData);

      filteredHighestCategoryValues.current = highestCategoryValues.current;
    } else {
      const updatedFilteredChartData: ChartDataItem[] = [];
      const updatedFilteredHighestCategoryValues = new Map<
        ChartDataCategory,
        number
      >();

      for (const entry of chartData) {
        if (minDate && new Date(entry.date) < minDate) continue;
        if (maxDate && new Date(entry.date) > maxDate) continue;

        updatedFilteredChartData.push(entry);

        Object.keys(entry).forEach((key) => {
          if (key !== "date") {
            const category = key as ChartDataCategoryNoUndefined;
            const value = entry[category] ?? 0;

            if (
              !updatedFilteredHighestCategoryValues.has(category) ||
              value > updatedFilteredHighestCategoryValues.get(category)!
            ) {
              updatedFilteredHighestCategoryValues.set(category, value);
            }
          }
        });
      }

      setFilteredChartData(updatedFilteredChartData);

      filteredHighestCategoryValues.current =
        updatedFilteredHighestCategoryValues;
    }
  };

  const resetChart = () => {
    if (userSettings === undefined) return;

    updateChartDataAndFilteredHighestCategoryValues([], null, null);
    setChartDataAreas([]);
    setChartDataLines([]);
    setShownChartDataAreas([]);
    setShownChartDataLines([]);
    setPrimaryDataKey(undefined);
    setSecondaryDataKey(undefined);
    setChartLineUnitCategorySet(new Set());
    setSecondaryDataUnitCategory(undefined);
    setReferenceAreas([]);
    setShownReferenceAreas([]);
    setChartCommentMap(new Map());
    setChartStartDate(null);
    setChartEndDate(null);
    setFilterMinDate(null);
    setFilterMaxDate(null);

    setDisabledLoadExerciseOptions(new Set());

    isChartDataLoaded.current = false;
    chartConfig.current = { ...defaultChartConfig };
    loadedCharts.current = new Set();
    chartDataUnitMap.current = new Map(defaultChartDataUnitMap);
    chartDataUnitCategoryMap.current = new Map(defaultChartDataUnitCategoryMap);
    highestCategoryValues.current = new Map();
    filteredHighestCategoryValues.current = new Map();
    includesMultisetMap.current = new Map();

    assignDefaultUnits(userSettings);

    deleteModal.onClose();
  };

  return {
    userSettings,
    setUserSettings,
    weightUnit,
    setWeightUnit,
    distanceUnit,
    setDistanceUnit,
    speedUnit,
    setSpeedUnit,
    paceUnit,
    setPaceUnit,
    circumferenceUnit,
    setCircumferenceUnit,
    chartData,
    chartDataAreas,
    setChartDataAreas,
    chartDataLines,
    setChartDataLines,
    primaryDataKey,
    setPrimaryDataKey,
    secondaryDataKey,
    setSecondaryDataKey,
    secondaryDataUnitCategory,
    setSecondaryDataUnitCategory,
    chartLineUnitCategorySet,
    setChartLineUnitCategorySet,
    shownChartDataAreas,
    setShownChartDataAreas,
    shownChartDataLines,
    setShownChartDataLines,
    referenceAreas,
    setReferenceAreas,
    shownReferenceAreas,
    setShownReferenceAreas,
    chartCommentMap,
    setChartCommentMap,
    chartStartDate,
    setChartStartDate,
    chartEndDate,
    setChartEndDate,
    filterMinDate,
    setFilterMinDate,
    filterMaxDate,
    setFilterMaxDate,
    filteredChartData,
    loadExerciseOptions,
    setLoadExerciseOptions,
    disabledLoadExerciseOptions,
    setDisabledLoadExerciseOptions,
    loadExerciseOptionsUnitCategoryPrimary,
    setLoadExerciseOptionsUnitCategoryPrimary,
    loadExerciseOptionsUnitCategorySecondary,
    setLoadExerciseOptionsUnitCategorySecondary,
    loadExerciseOptionsUnitCategoriesPrimary,
    setLoadExerciseOptionsUnitCategoriesPrimary,
    loadExerciseOptionsUnitCategoriesSecondary,
    setLoadExerciseOptionsUnitCategoriesSecondary,
    allChartDataCategories,
    chartDataUnitMap,
    chartDataUnitCategoryMap,
    chartConfig,
    loadedCharts,
    isChartDataLoaded,
    highestCategoryValues,
    filteredHighestCategoryValues,
    weightCharts,
    distanceCharts,
    paceCharts,
    speedCharts,
    circumferenceCharts,
    loadExerciseOptionsMap,
    loadExerciseOptionsModal,
    deleteModal,
    validLoadExerciseOptionsCategories,
    includesMultisetMap,
    updateExerciseStatUnit,
    resetChart,
    assignDefaultUnits,
    updateChartDataAndFilteredHighestCategoryValues,
  };
};
