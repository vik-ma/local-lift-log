import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
} from "@heroui/react";
import {
  useExerciseList,
  useFilterExerciseList,
  useLoadExerciseOptionsMap,
  useMeasurementList,
  useTimePeriodList,
} from "../hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ExerciseModalList,
  FilterExerciseGroupsModal,
  FilterMinAndMaxDatesModal,
  LoadExerciseChartModal,
  LoadingSpinner,
  MeasurementModalList,
  TimePeriodModalList,
} from "../components";
import {
  ChartComment,
  ChartDataCategory,
  ChartDataExerciseCategory,
  ChartDataExerciseCategoryBase,
  ChartDataUnitCategory,
  Exercise,
  Measurement,
  TimePeriod,
  UserMeasurementValues,
  UserSettings,
  WorkoutSet,
} from "../typings";
import {
  ConvertDateToYmdString,
  ConvertISODateStringToYmdDateString,
  ConvertMeasurementValue,
  ConvertNumberToTwoDecimals,
  ConvertWeightValue,
  CreateLoadExerciseOptionsList,
  CreateShownPropertiesSet,
  FormatDateToShortString,
  GetAllDietLogs,
  GetAllUserWeights,
  GetAnalyticsValuesForSetList,
  GetCompletedSetsWithExerciseId,
  GetCurrentYmdDateString,
  GetUserMeasurementsWithMeasurementId,
  GetUserSettings,
  UpdateDefaultLoadExerciseOptions,
  ValidMeasurementUnits,
} from "../helpers";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Area,
  Line,
  ReferenceArea,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../components/ui/chart";
import toast from "react-hot-toast";

type ListModalPage = "exercise-list" | "measurement-list" | "time-period-list";

type ChartDataItem = {
  date: string;
} & {
  [key in Exclude<ChartDataCategory, undefined>]?: number;
};

type LoadedChartType =
  | "diet-logs-calories"
  | "diet-logs-macros"
  | "user-weights-weight"
  | "user-weights-body-fat"
  | `measurement_${number}`
  | ChartDataExerciseCategory;

type ReferenceAreaItem = {
  timePeriodId: number;
  x1: string;
  x2: string;
  label: string;
  startDate: string;
  endDate: string | null;
};

export default function AnalyticsIndex() {
  const [listModalPage, setListModalPage] =
    useState<ListModalPage>("exercise-list");
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [chartDataAreas, setChartDataAreas] = useState<ChartDataCategory[]>([]);
  const [chartDataLines, setChartDataLines] = useState<ChartDataCategory[]>([]);
  const [primaryDataKey, setPrimaryDataKey] = useState<ChartDataCategory>();
  const [secondaryDataKey, setSecondaryDataKey] = useState<ChartDataCategory>();
  const [chartLineUnitCategorySet, setChartLineUnitCategorySet] = useState<
    Set<ChartDataUnitCategory>
  >(new Set());
  const [secondaryDataUnitCategory, setSecondaryDataUnitCategory] =
    useState<ChartDataUnitCategory>();
  const [shownChartDataAreas, setShownChartDataAreas] = useState<
    ChartDataCategory[]
  >([]);
  const [shownChartDataLines, setShownChartDataLines] = useState<
    ChartDataCategory[]
  >([]);
  const [referenceAreas, setReferenceAreas] = useState<ReferenceAreaItem[]>([]);
  const [shownReferenceAreas, setShownReferenceAreas] = useState<
    ReferenceAreaItem[]
  >([]);
  const [weightUnit, setWeightUnit] = useState<string>("kg");
  const [distanceUnit, setDistanceUnit] = useState<string>("km");
  const [circumferenceUnit, setCircumferenceUnit] = useState<string>("cm");
  const [chartCommentMap, setChartCommentMap] = useState<
    Map<string, ChartComment[]>
  >(new Map());
  const [chartStartDate, setChartStartDate] = useState<Date | null>(null);
  const [chartEndDate, setChartEndDate] = useState<Date | null>(null);
  const [filterMinDate, setFilterMinDate] = useState<Date | null>(null);
  const [filterMaxDate, setFilterMaxDate] = useState<Date | null>(null);
  const [loadChartAsArea, setLoadChartAsArea] = useState<boolean>(true);
  const [loadedMeasurements, setLoadedMeasurements] = useState<
    Map<number, Measurement>
  >(new Map());
  const [selectedExercise, setSelectedExercise] = useState<Exercise>();
  const [loadExerciseOptions, setLoadExerciseOptions] = useState<
    Set<ChartDataExerciseCategoryBase>
  >(new Set());
  const [loadExerciseOptionsUnitCategory, setLoadExerciseOptionsUnitCategory] =
    useState<ChartDataUnitCategory>();
  const [
    loadExerciseOptionsUnitCategories,
    setLoadExerciseOptionsUnitCategories,
  ] = useState<Set<ChartDataUnitCategory>>(new Set());
  const [disabledLoadExerciseOptions, setDisabledLoadExerciseOptions] =
    useState<Set<ChartDataExerciseCategoryBase>>(new Set());

  const [showTestButtons, setShowTestButtons] = useState<boolean>(false);

  const highestCategoryValues = useRef<Map<ChartDataCategory, number>>(
    new Map()
  );

  const dateMap = useMemo(() => {
    const dateMap = new Map<string, Date>();

    const date30DaysAgo = new Date();
    date30DaysAgo.setHours(-720, 0, 0, 0);
    const date90DaysAgo = new Date();
    date90DaysAgo.setHours(-2160, 0, 0, 0);
    const date180DaysAgo = new Date();
    date180DaysAgo.setHours(-4320, 0, 0, 0);
    const date365DaysAgo = new Date();
    date365DaysAgo.setHours(-8760, 0, 0, 0);
    const date730DaysAgo = new Date();
    date730DaysAgo.setHours(-17520, 0, 0, 0);

    dateMap.set("Last 30 Days", date30DaysAgo);
    dateMap.set("Last 90 Days", date90DaysAgo);
    dateMap.set("Last 180 Days", date180DaysAgo);
    dateMap.set("Last Year", date365DaysAgo);
    dateMap.set("Last Two Years", date730DaysAgo);

    return dateMap;
  }, []);

  const validCircumferenceUnits = new Set(ValidMeasurementUnits());

  const timePeriodIdSet = useMemo(
    () =>
      new Set<string>(
        referenceAreas.map((area) => area.timePeriodId.toString())
      ),
    [referenceAreas]
  );

  const shownTimePeriodIdSet = useMemo(
    () =>
      new Set<string>(
        shownReferenceAreas.map((area) => area.timePeriodId.toString())
      ),
    [shownReferenceAreas]
  );

  const isChartDataLoaded = useRef<boolean>(false);

  const loadedCharts = useRef<Set<LoadedChartType>>(new Set());

  const filteredChartData: ChartDataItem[] = useMemo(() => {
    const filteredChartData: ChartDataItem[] = [];

    // Filter out dates before/after min/max date filters from chartData and
    // then filter out the props in the remaining items that are not available
    // in either chartDataAreas or chartDataLines. Always keep date prop.
    for (const entry of chartData) {
      if (filterMinDate && new Date(entry.date) < filterMinDate) continue;
      if (filterMaxDate && new Date(entry.date) > filterMaxDate) continue;

      const chartDataItem = Object.fromEntries(
        Object.entries(entry).filter(
          ([key]) =>
            key === "date" ||
            chartDataAreas.includes(key as ChartDataCategory) ||
            chartDataLines.includes(key as ChartDataCategory)
        )
      );

      filteredChartData.push(chartDataItem as ChartDataItem);
    }

    return filteredChartData;
  }, [chartData, chartDataAreas, chartDataLines, filterMinDate, filterMaxDate]);

  const listModal = useDisclosure();
  const loadExerciseChartModal = useDisclosure();
  const filterMinAndMaxDatesModal = useDisclosure();

  const exerciseList = useExerciseList(false, true, true);

  const { isExerciseListLoaded, getExercises } = exerciseList;

  const filterExerciseList = useFilterExerciseList(exerciseList);

  const measurementList = useMeasurementList(false, true, true);

  const { isMeasurementListLoaded, getMeasurements } = measurementList;

  const timePeriodList = useTimePeriodList();

  const {
    getTimePeriods,
    isTimePeriodListLoaded,
    setSelectedTimePeriodProperties,
  } = timePeriodList;

  const chartDataCategoryLabelMap = useRef<Map<ChartDataCategory, string>>(
    new Map([
      ["calories", "Calories"],
      ["fat", "Fat"],
      ["carbs", "Carbs"],
      ["protein", "Protein"],
      ["body_weight", "Body Weight"],
      ["body_fat_percentage", "Body Fat %"],
      ["test", "Test"],
    ])
  );

  const chartDataUnitMap = useRef<Map<ChartDataCategory, string>>(
    new Map([
      ["calories", " kcal"],
      ["fat", " g"],
      ["carbs", " g"],
      ["protein", " g"],
      ["body_fat_percentage", " %"],
    ])
  );

  const chartDataUnitCategoryMap = useRef(
    new Map<ChartDataCategory, ChartDataUnitCategory>([
      ["calories", "Calories"],
      ["fat", "Macros"],
      ["carbs", "Macros"],
      ["protein", "Macros"],
      ["body_weight", "Weight"],
      ["body_fat_percentage", "Body Fat %"],
      ["weight_min", "Weight"],
      ["weight_max", "Weight"],
      ["weight_avg", "Weight"],
      ["weight_volume", "Weight"],
      ["num_sets", "Number Of Sets"],
      ["num_reps_min", "Number Of Reps"],
      ["num_reps_max", "Number Of Reps"],
      ["num_reps_avg", "Number Of Reps"],
      ["num_reps_total", "Number Of Reps"],
      ["num_reps_and_partial_reps_min", "Number Of Reps"],
      ["num_reps_and_partial_reps_max", "Number Of Reps"],
      ["num_reps_and_partial_reps_total", "Number Of Reps"],
      ["num_partial_reps_min", "Number Of Reps"],
      ["num_partial_reps_max", "Number Of Reps"],
      ["num_partial_reps_avg", "Number Of Reps"],
      ["num_partial_reps_total", "Number Of Reps"],
      ["set_body_weight", "Weight"],
      ["rir_min", "RIR"],
      ["rir_max", "RIR"],
      ["rir_avg", "RIR"],
      ["rpe_min", "RPE"],
      ["rpe_max", "RPE"],
      ["rpe_avg", "RPE"],
      ["distance_min", "Distance"],
      ["distance_max", "Distance"],
      ["distance_avg", "Distance"],
      ["distance_total", "Distance"],
      ["time_min", "Time"],
      ["time_max", "Time"],
      ["time_avg", "Time"],
      ["time_total", "Time"],
      ["distance_per_time_min", "Pace"],
      ["distance_per_time_max", "Pace"],
      ["distance_per_time_avg", "Pace"],
      ["resistance_level_min", "Resistance Level"],
      ["resistance_level_max", "Resistance Level"],
      ["resistance_level_avg", "Resistance Level"],
      ["test", "Weight"],
    ])
  );

  const chartConfig = useRef<ChartConfig>({
    calories: {
      label: chartDataCategoryLabelMap.current.get("calories"),
    },
    fat: { label: chartDataCategoryLabelMap.current.get("fat") },
    carbs: { label: chartDataCategoryLabelMap.current.get("carbs") },
    protein: { label: chartDataCategoryLabelMap.current.get("protein") },
    body_weight: {
      label: chartDataCategoryLabelMap.current.get("body_weight"),
    },
    body_fat_percentage: {
      label: chartDataCategoryLabelMap.current.get("body_fat_percentage"),
    },
    test: { label: chartDataCategoryLabelMap.current.get("test") },
  });

  const chartLineColorList = [
    "#6b80ed",
    "#e6475a",
    "#525252",
    "#07e0e7",
    "#8739cf",
    "#56db67",
  ];

  const chartAreaColorList = [
    "#edc345",
    "#f57489",
    "#8ba1db",
    "#9c9794",
    "#8fe296",
    "#c3a6e4",
    "#e9b287",
  ];

  const referenceAreaColorList = [
    "#2862cc",
    "#26be21",
    "#ff3ba7",
    "#c93814",
    "#1ab2f8",
  ];

  const loadExerciseOptionsMap = useLoadExerciseOptionsMap();

  const updateLoadExerciseOptions = (loadExerciseOptionsString: string) => {
    const disabledKeys = new Set<ChartDataExerciseCategoryBase>();

    // Disable any options that have already been loaded for Exercise
    if (selectedExercise !== undefined) {
      const id = selectedExercise.id;

      // Check if a ChartDataExerciseCategoryBase value exists for selectedExercise id
      for (const chart of loadedCharts.current) {
        const lastIndex = chart.lastIndexOf("_");

        if (lastIndex === -1) continue;

        const chartName = chart.substring(0, lastIndex);
        const chartId = chart.substring(lastIndex + 1);

        if (chartId === id.toString() && chartName !== "measurement") {
          disabledKeys.add(chartName as ChartDataExerciseCategoryBase);
        }
      }
    }

    setDisabledLoadExerciseOptions(disabledKeys);

    // Create list from default string, without any disabled options
    const loadExerciseOptionsList = CreateLoadExerciseOptionsList(
      loadExerciseOptionsString
    ).filter((option) => !disabledKeys.has(option));

    setLoadExerciseOptions(new Set(loadExerciseOptionsList));

    if (loadExerciseOptionsList.length > 0) {
      const unitCategories = loadExerciseOptionsList.map((option) =>
        chartDataUnitCategoryMap.current.get(option)
      );

      setLoadExerciseOptionsUnitCategories(new Set(unitCategories));
      setLoadExerciseOptionsUnitCategory(unitCategories[0]);
    } else {
      setLoadExerciseOptionsUnitCategories(new Set());
      setLoadExerciseOptionsUnitCategory(undefined);
    }
  };

  useEffect(() => {
    if (userSettings === undefined) return;

    updateLoadExerciseOptions(userSettings.default_load_exercise_options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExercise]);

  useEffect(
    () => {
      const loadUserSettings = async () => {
        const userSettings = await GetUserSettings();

        if (userSettings === undefined) return;

        setUserSettings(userSettings);
        setWeightUnit(userSettings.default_unit_weight);
        setDistanceUnit(userSettings.default_unit_distance);
        setCircumferenceUnit(userSettings.default_unit_measurement);

        chartDataUnitMap.current.set(
          "body_weight",
          ` ${userSettings.default_unit_weight}`
        );
        chartDataUnitMap.current.set(
          "test",
          ` ${userSettings.default_unit_weight}`
        );

        updateLoadExerciseOptions(userSettings.default_load_exercise_options);

        loadDietLogListCalories(userSettings.locale, true);
        // loadUserWeightListWeights(
        //   userSettings.locale,
        //   userSettings.default_unit_weight,
        //   false
        // );
      };

      loadUserSettings();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleOpenListModal = async (modalListType: ListModalPage) => {
    if (userSettings === undefined) return;

    setListModalPage(modalListType);

    if (modalListType === "exercise-list" && !isExerciseListLoaded.current) {
      await getExercises();
    }

    if (
      modalListType === "measurement-list" &&
      !isMeasurementListLoaded.current
    ) {
      await getMeasurements();
    }

    if (
      modalListType === "time-period-list" &&
      !isTimePeriodListLoaded.current
    ) {
      await getTimePeriods(userSettings.locale);

      const timePeriodPropertySet = CreateShownPropertiesSet(
        userSettings.shown_time_period_properties,
        "time-period"
      );

      setSelectedTimePeriodProperties(timePeriodPropertySet);
    }

    listModal.onOpen();
  };

  const loadDietLogListCalories = async (
    locale: string,
    loadPrimary: boolean
  ) => {
    if (loadedCharts.current.has("diet-logs-calories")) return;

    const dietLogs = await GetAllDietLogs(true);

    if (dietLogs.length === 0) {
      loadedCharts.current.add("diet-logs-calories");
      loadedCharts.current.add("diet-logs-macros");
      toast.error("No Diet Logs Entries Recorded");
      return;
    }

    const loadedChartData: ChartDataItem[] = [];

    let highestValue = 0;

    const updatedChartCommentMap = new Map(chartCommentMap);
    const commentDataKeys: Set<ChartDataCategory> = new Set([
      "calories",
      "fat",
      "carbs",
      "protein",
    ]);
    const commentLabel = "Diet Log Comment";

    const areCommentsAlreadyLoaded =
      loadedCharts.current.has("diet-logs-macros");

    for (const dietLog of dietLogs) {
      const date = FormatDateToShortString(new Date(dietLog.date), locale);

      const chartDataItem: ChartDataItem = {
        date,
      };

      if (!areCommentsAlreadyLoaded && dietLog.comment !== null) {
        addChartComment(
          updatedChartCommentMap,
          date,
          commentDataKeys,
          commentLabel,
          dietLog.comment
        );
      }

      chartDataItem.calories = dietLog.calories;

      if (dietLog.calories > highestValue) {
        highestValue = dietLog.calories;
      }

      loadedChartData.push(chartDataItem);
    }

    setChartCommentMap(updatedChartCommentMap);

    const filledInChartData = fillInMissingDates(loadedChartData, locale);

    const mergedChartData = mergeChartData(
      filledInChartData,
      chartData,
      locale
    );

    setChartData(mergedChartData);

    highestCategoryValues.current.set("calories", highestValue);

    if (loadPrimary) {
      loadChartAreas(["calories"]);
    } else {
      loadChartLines(["calories"], ["Calories"], "calories");
    }

    loadedCharts.current.add("diet-logs-calories");
    if (!isChartDataLoaded.current) isChartDataLoaded.current = true;
  };

  const loadDietLogListMacros = async (
    locale: string,
    loadPrimary: boolean
  ) => {
    if (loadedCharts.current.has("diet-logs-macros")) return;

    const dietLogs = await GetAllDietLogs(true);

    if (dietLogs.length === 0) {
      loadedCharts.current.add("diet-logs-calories");
      loadedCharts.current.add("diet-logs-macros");
      toast.error("No Diet Logs Entries Recorded");
      return;
    }

    const loadedChartData: ChartDataItem[] = [];

    const highestValueMap = new Map<ChartDataCategory, number>();
    highestValueMap.set("fat", -1);
    highestValueMap.set("carbs", -1);
    highestValueMap.set("protein", -1);

    const updatedChartCommentMap = new Map(chartCommentMap);
    const commentDataKeys: Set<ChartDataCategory> = new Set([
      "calories",
      "fat",
      "carbs",
      "protein",
    ]);
    const commentLabel = "Diet Log Comment";

    const areCommentsAlreadyLoaded =
      loadedCharts.current.has("diet-logs-calories");

    for (const dietLog of dietLogs) {
      const date = FormatDateToShortString(new Date(dietLog.date), locale);

      const chartDataItem: ChartDataItem = {
        date,
      };

      if (!areCommentsAlreadyLoaded && dietLog.comment !== null) {
        addChartComment(
          updatedChartCommentMap,
          date,
          commentDataKeys,
          commentLabel,
          dietLog.comment
        );
      }

      if (dietLog.fat !== null) {
        chartDataItem.fat = dietLog.fat;

        if (dietLog.fat > highestValueMap.get("fat")!) {
          highestValueMap.set("fat", dietLog.fat);
        }
      }

      if (dietLog.carbs !== null) {
        chartDataItem.carbs = dietLog.carbs;

        if (dietLog.carbs > highestValueMap.get("carbs")!) {
          highestValueMap.set("carbs", dietLog.carbs);
        }
      }

      if (dietLog.protein !== null) {
        chartDataItem.protein = dietLog.protein;

        if (dietLog.protein > highestValueMap.get("protein")!) {
          highestValueMap.set("protein", dietLog.protein);
        }
      }

      loadedChartData.push(chartDataItem);
    }

    // Filter out categories with no values
    const updatedHighestValueMap = new Map(
      Array.from(highestValueMap).filter(([, value]) => value > -1)
    );

    if (updatedHighestValueMap.size === 0) {
      loadedCharts.current.add("diet-logs-macros");
      toast.error("No Diet Logs With Macros Recorded");
      return;
    }

    setChartCommentMap(updatedChartCommentMap);

    const filledInChartData = fillInMissingDates(loadedChartData, locale);

    const mergedChartData = mergeChartData(
      filledInChartData,
      chartData,
      locale
    );

    setChartData(mergedChartData);

    highestCategoryValues.current = new Map([
      ...highestCategoryValues.current,
      ...updatedHighestValueMap,
    ]);

    const dataKeys: ChartDataCategory[] = Array.from(
      updatedHighestValueMap.keys()
    );

    if (loadPrimary) {
      loadChartAreas(dataKeys);
    } else {
      // All macro dataKeys will work, even if they have no values loaded
      loadChartLines(dataKeys, ["Macros"], "fat");
    }

    loadedCharts.current.add("diet-logs-macros");
    if (!isChartDataLoaded.current) isChartDataLoaded.current = true;
  };

  const updateShownChartLines = (chartLines: ChartDataCategory[]) => {
    const chartLineUnitCategorySet = new Set<ChartDataUnitCategory>();

    for (const line of chartLines) {
      chartLineUnitCategorySet.add(chartDataUnitCategoryMap.current.get(line));
    }

    setShownChartDataLines(chartLines);
    setChartLineUnitCategorySet(chartLineUnitCategorySet);

    updateRightYAxis(chartLines, secondaryDataKey);
  };

  const formatXAxisDate = (date: string) => {
    const cutoff =
      userSettings === undefined || userSettings.locale === "en-US" ? 6 : 5;

    return date.substring(0, date.length - cutoff);
  };

  const addTestArea = () => {
    if (chartDataAreas.includes("test") || chartDataLines.includes("test"))
      return;

    const updatedChartData: ChartDataItem[] = [...chartData];

    let maxNum = 0;

    for (let i = 0; i < chartData.length; i++) {
      const testNum = Math.floor(Math.random() * 1000);

      if (testNum > maxNum) {
        maxNum = testNum;
      }

      updatedChartData[i].test = testNum;
    }

    highestCategoryValues.current.set("test", maxNum);

    setChartData(updatedChartData);
    setChartDataAreas([...chartDataAreas, "test"]);

    const updatedShownChartDataAreas: ChartDataCategory[] = [
      ...shownChartDataAreas,
      "test",
    ];

    updateLeftYAxis(updatedShownChartDataAreas);
  };

  const removeTestArea = () => {
    // Remove the test prop from chartData
    const updatedChartData: ChartDataItem[] = chartData.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ test, ...rest }) => rest
    );

    const updatedChartDataAreas: ChartDataCategory[] = chartDataAreas.filter(
      (item) => item !== "test"
    );

    const updatedShownChartDataAreas: ChartDataCategory[] =
      shownChartDataAreas.filter((item) => item !== "test");

    if (updatedShownChartDataAreas.length === 0 && chartDataAreas.length > 0) {
      updatedShownChartDataAreas.push(chartDataAreas[0]);
      setPrimaryDataKey(chartDataAreas[0]);
    } else if (
      updatedShownChartDataAreas.length === 0 &&
      chartDataAreas.length === 0
    ) {
      setPrimaryDataKey(undefined);
    }

    setChartData(updatedChartData);
    setChartDataAreas(updatedChartDataAreas);

    updateLeftYAxis(updatedShownChartDataAreas);
  };

  const addTestLine = () => {
    if (chartDataAreas.includes("test") || chartDataLines.includes("test"))
      return;

    const updatedChartData: ChartDataItem[] = [...chartData];

    let maxNum = 0;

    for (let i = 0; i < chartData.length; i++) {
      const testNum = Math.floor(Math.random() * 1000);

      if (testNum > maxNum) {
        maxNum = testNum;
      }

      updatedChartData[i].test = testNum;
    }

    highestCategoryValues.current.set("test", maxNum);

    setChartData(updatedChartData);
    setChartDataLines([...chartDataLines, "test"]);

    const updatedShownChartDataLines: ChartDataCategory[] = [
      ...shownChartDataLines,
      "test",
    ];

    setShownChartDataLines(updatedShownChartDataLines);

    if (!chartLineUnitCategorySet.has("Weight")) {
      const updatedChartLineUnitCategorySet = new Set(chartLineUnitCategorySet);
      updatedChartLineUnitCategorySet.add("Weight");
      setChartLineUnitCategorySet(updatedChartLineUnitCategorySet);
    }

    if (secondaryDataUnitCategory === undefined) {
      setSecondaryDataUnitCategory("Weight");
    }

    updateRightYAxis(updatedShownChartDataLines, secondaryDataKey);
  };

  const removeTestLine = () => {
    // Remove the test prop from chartData
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updatedChartData = chartData.map(({ test, ...rest }) => rest);

    const updatedChartDataLines = chartDataLines.filter(
      (item) => item !== "test"
    );

    setChartData(updatedChartData);
    setChartDataLines(updatedChartDataLines);

    highestCategoryValues.current.delete("test");

    if (updatedChartDataLines.length === 0) {
      setSecondaryDataUnitCategory(undefined);
      setChartLineUnitCategorySet(new Set());
    }

    hideChartLine("test");
  };

  const hideChartLine = (chartDataCategory: ChartDataCategory) => {
    if (chartDataCategory === undefined) return;

    const updatedShownChartDataLines = shownChartDataLines.filter(
      (item) => item !== chartDataCategory
    );

    setShownChartDataLines(updatedShownChartDataLines);

    setSecondaryDataKey(updatedShownChartDataLines[0]);

    const updatedSecondaryDataUnitCategory =
      chartDataUnitCategoryMap.current.get(updatedShownChartDataLines[0]);

    setSecondaryDataUnitCategory(updatedSecondaryDataUnitCategory);

    updateShownChartLines(updatedShownChartDataLines);
  };

  const changeSecondaryDataUnitCategory = (unitCategory: string) => {
    switch (unitCategory) {
      case "Macros": {
        updateRightYAxis(shownChartDataLines, "fat");
        break;
      }
      case "Calories":
        updateRightYAxis(shownChartDataLines, "calories");
        break;
      case "Body Weight":
        updateRightYAxis(shownChartDataLines, "body_weight");
        break;
      case "Body Fat %":
        updateRightYAxis(shownChartDataLines, "body_fat_percentage");
        break;
      case "Caliper":
        for (const [key, value] of loadedMeasurements) {
          if (value.measurement_type === "Caliper") {
            updateRightYAxis(shownChartDataLines, `measurement_${key}`);
            break;
          }
        }
        break;
      case "Circumference":
        for (const [key, value] of loadedMeasurements) {
          if (value.measurement_type === "Circumference") {
            updateRightYAxis(shownChartDataLines, `measurement_${key}`);
            break;
          }
        }
        break;
      default:
        break;
    }
  };

  const toggleTestTimePeriod = () => {
    if (userSettings === undefined) return;

    const testPeriodIndex = referenceAreas.findIndex(
      (obj) => obj.timePeriodId === 0
    );

    if (testPeriodIndex === -1) {
      const newReferenceArea: ReferenceAreaItem = {
        timePeriodId: 0,
        x1: FormatDateToShortString(
          new Date("2025-01-22"),
          userSettings.locale
        ),
        x2: FormatDateToShortString(
          new Date("2025-01-25"),
          userSettings.locale
        ),
        label: "Test Period",
        startDate: "2025-01-22",
        endDate: "2025-01-25",
      };

      const updatedReferenceAreas = [...referenceAreas, newReferenceArea];
      const updatedShownReferenceAreas = [
        ...shownReferenceAreas,
        newReferenceArea,
      ];

      setReferenceAreas(updatedReferenceAreas);
      setShownReferenceAreas(updatedShownReferenceAreas);
    } else {
      const updatedReferenceAreas = referenceAreas.filter(
        (item) => item.timePeriodId !== 0
      );
      const updatedShownReferenceAreas = shownReferenceAreas.filter(
        (item) => item.timePeriodId !== 0
      );

      setReferenceAreas(updatedReferenceAreas);
      setShownReferenceAreas(updatedShownReferenceAreas);
    }
  };

  const handleClickTimePeriod = (timePeriod: TimePeriod) => {
    if (
      timePeriodIdSet.has(timePeriod.id.toString()) ||
      timePeriod.start_date === null ||
      userSettings === undefined
    )
      return;

    const startAndEndDates = getTimePeriodStartAndEndDates(
      timePeriod.start_date,
      timePeriod.end_date,
      userSettings.locale
    );

    if (startAndEndDates === undefined) return;

    const { formattedStartDate, formattedEndDate } = startAndEndDates;

    const referenceArea: ReferenceAreaItem = {
      timePeriodId: timePeriod.id,
      x1: formattedStartDate,
      x2: formattedEndDate,
      label: timePeriod.name,
      startDate: timePeriod.start_date,
      endDate: timePeriod.end_date,
    };

    setReferenceAreas([...referenceAreas, referenceArea]);
    setShownReferenceAreas([...shownReferenceAreas, referenceArea]);

    listModal.onClose();
  };

  const updateShownReferenceAreas = (timePeriodIds: Set<string>) => {
    const updatedShownReferenceAreas = referenceAreas.filter((item) =>
      timePeriodIds.has(item.timePeriodId.toString())
    );

    setShownReferenceAreas(updatedShownReferenceAreas);
  };

  const fillInMissingDates = (
    loadedChartData: ChartDataItem[],
    locale: string
  ): ChartDataItem[] => {
    if (loadedChartData.length === 0) return [];

    const filledInChartData: ChartDataItem[] = [];

    const chartDataDateMap = new Map(
      loadedChartData.map((item) => [item.date, item])
    );

    const currentDate = new Date(loadedChartData[0].date);
    const endDate = new Date(loadedChartData[loadedChartData.length - 1].date);

    while (currentDate <= endDate) {
      const dateString = FormatDateToShortString(currentDate, locale);

      if (chartDataDateMap.has(dateString)) {
        filledInChartData.push(chartDataDateMap.get(dateString)!);
      } else {
        // Fill in empty ChartDataItems for missing dates
        const chartDataItem: ChartDataItem = {
          date: dateString,
        };

        filledInChartData.push(chartDataItem);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return filledInChartData;
  };

  const getTimePeriodStartAndEndDates = (
    startDateString: string,
    endDateString: string | null,
    locale: string
  ) => {
    if (filteredChartData.length === 0) return;

    const chartStartDate = new Date(filteredChartData[0].date);
    const chartEndDate = new Date(
      filteredChartData[filteredChartData.length - 1].date
    );

    const ymdChartStartDate = ConvertDateToYmdString(chartStartDate);
    const ymdChartEndDate = ConvertDateToYmdString(chartEndDate);

    const timePeriodStartDate =
      ConvertISODateStringToYmdDateString(startDateString);

    // Assign if Time Period is ongoing (end_date is null) set Time Periods's end point as today
    const timePeriodEndDate =
      endDateString === null
        ? GetCurrentYmdDateString()
        : ConvertISODateStringToYmdDateString(endDateString);

    // If Time Period's Start Date is outside of visible chart, set start date to first item in chart's X-axis
    const formattedStartDate = FormatDateToShortString(
      timePeriodStartDate < ymdChartStartDate
        ? chartStartDate
        : new Date(timePeriodStartDate),
      locale
    );
    // If Time Period's End Date is outside of visible chart, set end date to last item in chart's X-axis
    const formattedEndDate = FormatDateToShortString(
      timePeriodEndDate > ymdChartEndDate
        ? chartEndDate
        : new Date(timePeriodEndDate),
      locale
    );

    return { formattedStartDate, formattedEndDate };
  };

  const loadUserWeightListWeights = async (
    locale: string,
    weightUnit: string,
    loadPrimary: boolean
  ) => {
    if (loadedCharts.current.has("user-weights-weight")) return;

    const userWeights = await GetAllUserWeights(true);

    if (userWeights.length === 0) {
      loadedCharts.current.add("user-weights-weight");
      loadedCharts.current.add("user-weights-body-fat");
      toast.error("No Body Weight Entries Recorded");
      return;
    }

    const loadedChartData: ChartDataItem[] = [];

    let highestValue = 0;

    const dateSet = new Set<string>();

    const updatedChartCommentMap = new Map(chartCommentMap);
    const commentDataKeys: Set<ChartDataCategory> = new Set([
      "body_weight",
      "body_fat_percentage",
    ]);
    const commentLabel = "Body Weight Comment";

    const areCommentsAlreadyLoaded = loadedCharts.current.has(
      "user-weights-body-fat"
    );

    for (const userWeight of userWeights) {
      const date = FormatDateToShortString(new Date(userWeight.date), locale);

      // Only load first entry per day
      if (dateSet.has(date)) continue;

      dateSet.add(date);

      const chartDataItem: ChartDataItem = {
        date,
      };

      if (!areCommentsAlreadyLoaded && userWeight.comment !== null) {
        addChartComment(
          updatedChartCommentMap,
          date,
          commentDataKeys,
          commentLabel,
          userWeight.comment
        );
      }

      chartDataItem.body_weight = ConvertNumberToTwoDecimals(
        ConvertWeightValue(
          userWeight.weight,
          userWeight.weight_unit,
          weightUnit
        )
      );

      if (userWeight.weight > highestValue) {
        highestValue = userWeight.weight;
      }

      loadedChartData.push(chartDataItem);
    }

    setChartCommentMap(updatedChartCommentMap);

    const filledInChartData = fillInMissingDates(loadedChartData, locale);

    const mergedChartData = mergeChartData(
      filledInChartData,
      chartData,
      locale
    );

    setChartData(mergedChartData);

    highestCategoryValues.current.set("body_weight", highestValue);

    if (loadPrimary) {
      loadChartAreas(["body_weight"]);
    } else {
      loadChartLines(["body_weight"], ["Weight"], "body_weight");
    }

    loadedCharts.current.add("user-weights-weight");
    if (!isChartDataLoaded.current) isChartDataLoaded.current = true;
  };

  const loadUserWeightListBodyFat = async (
    locale: string,
    loadPrimary: boolean
  ) => {
    if (loadedCharts.current.has("user-weights-body-fat")) return;

    const userWeights = await GetAllUserWeights(true);

    if (userWeights.length === 0) {
      loadedCharts.current.add("user-weights-weight");
      loadedCharts.current.add("user-weights-body-fat");
      toast.error("No Body Weight Entries Recorded");
      return;
    }

    const loadedChartData: ChartDataItem[] = [];

    let highestValue = 0;

    const dateSet = new Set<string>();

    const updatedChartCommentMap = new Map(chartCommentMap);
    const commentDataKeys: Set<ChartDataCategory> = new Set([
      "body_weight",
      "body_fat_percentage",
    ]);
    const commentLabel = "Body Weight Comment";

    const areCommentsAlreadyLoaded = loadedCharts.current.has(
      "user-weights-weight"
    );

    for (const userWeight of userWeights) {
      const date = FormatDateToShortString(new Date(userWeight.date), locale);

      // Only load first entry per day
      if (dateSet.has(date)) continue;

      dateSet.add(date);

      const chartDataItem: ChartDataItem = {
        date,
      };

      if (!areCommentsAlreadyLoaded && userWeight.comment !== null) {
        addChartComment(
          updatedChartCommentMap,
          date,
          commentDataKeys,
          commentLabel,
          userWeight.comment
        );
      }

      if (userWeight.body_fat_percentage !== null) {
        chartDataItem.body_fat_percentage = userWeight.body_fat_percentage;

        if (userWeight.body_fat_percentage > highestValue) {
          highestValue = userWeight.body_fat_percentage;
        }
      }

      loadedChartData.push(chartDataItem);
    }

    if (highestValue === 0) {
      loadedCharts.current.add("user-weights-body-fat");
      toast.error("No Body Fat Percentages Recorded");
      return;
    }

    setChartCommentMap(updatedChartCommentMap);

    const filledInChartData = fillInMissingDates(loadedChartData, locale);

    const mergedChartData = mergeChartData(
      filledInChartData,
      chartData,
      locale
    );

    setChartData(mergedChartData);

    highestCategoryValues.current.set("body_fat_percentage", highestValue);

    if (loadPrimary) {
      loadChartAreas(["body_fat_percentage"]);
    } else {
      loadChartLines(
        ["body_fat_percentage"],
        ["Body Fat %"],
        "body_fat_percentage"
      );
    }

    loadedCharts.current.add("user-weights-body-fat");
    if (!isChartDataLoaded.current) isChartDataLoaded.current = true;
  };

  const mergeChartData = (
    list1: ChartDataItem[],
    list2: ChartDataItem[],
    locale: string
  ) => {
    const chartDataDateMap = new Map<string, ChartDataItem>();

    if (list1.length > 0 && list2.length > 0) {
      const minDate1 = new Date(list1[0].date);
      const maxDate1 = new Date(list1[list1.length - 1].date);
      maxDate1.setDate(maxDate1.getDate() + 1);
      const minDate2 = new Date(list2[0].date);
      const maxDate2 = new Date(list2[list2.length - 1].date);
      maxDate2.setDate(maxDate2.getDate() + 1);

      // Check if there is a gap of dates between the end of one list and the start of the other
      const isGapAndList1ComesFirst = maxDate1.getTime() < minDate2.getTime();
      const isGapAndList2ComesFirst = maxDate2.getTime() < minDate1.getTime();

      if (isGapAndList1ComesFirst || isGapAndList2ComesFirst) {
        const currentDate = isGapAndList1ComesFirst ? maxDate1 : maxDate2;
        const endDate = isGapAndList1ComesFirst ? minDate2 : minDate1;

        while (currentDate < endDate) {
          const dateString = FormatDateToShortString(currentDate, locale);

          const chartDataItem: ChartDataItem = { date: dateString };

          // Fill in the gaps in list that is chronologically first
          if (isGapAndList1ComesFirst) {
            list1.push(chartDataItem);
          } else {
            list2.push(chartDataItem);
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }

    // Add all props from both lists to ChartDataItem of same date
    const mergeIntoMap = (list: ChartDataItem[]) => {
      for (const item of list) {
        if (!chartDataDateMap.has(item.date)) {
          chartDataDateMap.set(item.date, { ...item });
        } else {
          chartDataDateMap.set(item.date, {
            ...chartDataDateMap.get(item.date),
            ...item,
          });
        }
      }
    };

    mergeIntoMap(list1);
    mergeIntoMap(list2);

    // Create chartData array with dates sorted from oldest to newest
    const mergedChartData = Array.from(chartDataDateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setChartStartDate(new Date(mergedChartData[0].date));
    setChartEndDate(new Date(mergedChartData[mergedChartData.length - 1].date));

    return mergedChartData;
  };

  const changeChartDataLineToArea = (chartDataLine: ChartDataCategory) => {
    const updatedChartDataLines = chartDataLines.filter(
      (item) => item !== chartDataLine
    );
    const updatedShownChartDataLines = shownChartDataLines.filter(
      (item) => item !== chartDataLine
    );

    if (
      chartDataUnitMap.current.get(chartDataLine) ===
      chartDataUnitMap.current.get(shownChartDataAreas[0])
    ) {
      // Add new Chart Area if same unit as current Chart Area
      setChartDataAreas([...chartDataAreas, chartDataLine]);

      const updatedShownChartDataAreas = [
        ...shownChartDataAreas,
        chartDataLine,
      ];

      updateLeftYAxis(updatedShownChartDataAreas);
    } else {
      // Create new Chart Area and change all existing Chart Areas to Chart Lines
      updatedChartDataLines.push(...[...chartDataAreas]);
      updatedShownChartDataLines.push(...[...shownChartDataAreas]);

      setChartDataAreas([chartDataLine]);

      updateLeftYAxis([chartDataLine]);
    }

    setChartDataLines(updatedChartDataLines);
    setShownChartDataLines(updatedShownChartDataLines);

    const updatedChartLineUnitCategorySet = new Set(
      updatedShownChartDataLines.map((item) =>
        chartDataUnitCategoryMap.current.get(item)
      )
    );

    setChartLineUnitCategorySet(updatedChartLineUnitCategorySet);

    updateRightYAxis(updatedShownChartDataLines, secondaryDataKey);
  };

  const changeChartDataAreaToLine = (chartDataArea: ChartDataCategory) => {
    if (chartDataAreas.length < 2) return;

    const updatedChartDataAreas = chartDataAreas.filter(
      (item) => item !== chartDataArea
    );
    const updatedShownChartDataAreas = shownChartDataAreas.filter(
      (item) => item !== chartDataArea
    );

    setChartDataAreas(updatedChartDataAreas);
    setChartDataLines([...chartDataLines, chartDataArea]);

    const updatedShownChartDataLines = [...shownChartDataLines, chartDataArea];

    const updatedChartLineUnitCategorySet = new Set(
      updatedShownChartDataLines.map((item) =>
        chartDataUnitCategoryMap.current.get(item)
      )
    );

    setShownChartDataLines(updatedShownChartDataLines);

    setChartLineUnitCategorySet(updatedChartLineUnitCategorySet);

    updateLeftYAxis(updatedShownChartDataAreas);

    updateRightYAxis(updatedShownChartDataLines, secondaryDataKey);
  };

  const changeChartDataLineCategoryToArea = (
    unitCategory: ChartDataUnitCategory
  ) => {
    const updatedChartDataLines: ChartDataCategory[] = [];
    const updatedShownChartDataLines: ChartDataCategory[] = [];
    const updatedChartDataAreas: ChartDataCategory[] = [];
    const updatedShownChartDataAreas: ChartDataCategory[] = [];

    for (const line of chartDataLines) {
      if (chartDataUnitCategoryMap.current.get(line) === unitCategory) {
        updatedChartDataAreas.push(line);
      } else {
        updatedChartDataLines.push(line);
      }
    }

    for (const line of shownChartDataLines) {
      if (chartDataUnitCategoryMap.current.get(line) === unitCategory) {
        updatedShownChartDataAreas.push(line);
      } else {
        updatedShownChartDataLines.push(line);
      }
    }

    if (
      chartDataUnitCategoryMap.current.get(shownChartDataAreas[0]) ===
      unitCategory
    ) {
      updatedChartDataAreas.push(...chartDataAreas);
      updatedShownChartDataAreas.push(...shownChartDataAreas);
    } else {
      updatedChartDataLines.push(...chartDataAreas);
      updatedShownChartDataLines.push(...shownChartDataAreas);
    }

    setChartDataAreas(updatedChartDataAreas);
    setChartDataLines(updatedChartDataLines);
    setShownChartDataLines(updatedChartDataLines);

    const updatedChartLineUnitCategorySet = new Set(
      updatedShownChartDataLines.map((item) =>
        chartDataUnitCategoryMap.current.get(item)
      )
    );

    setChartLineUnitCategorySet(updatedChartLineUnitCategorySet);

    updateLeftYAxis(updatedShownChartDataAreas);
    updateRightYAxis(updatedShownChartDataLines, secondaryDataKey);
  };

  const setCustomMinAndMaxDatesFilter = (
    minDate: Date | null,
    maxDate: Date | null
  ) => {
    setFilterMinDate(minDate);
    setFilterMaxDate(maxDate);

    filterMinAndMaxDatesModal.onClose();
  };

  const updateRightYAxis = (
    chartLines: ChartDataCategory[],
    activeSecondaryDataKey: ChartDataCategory
  ) => {
    if (chartLines.length === 0) {
      setSecondaryDataKey(undefined);
      setSecondaryDataUnitCategory(undefined);
      return;
    }

    const activeUnitCategory = chartDataUnitCategoryMap.current.get(
      activeSecondaryDataKey
    );

    let shouldChangeCategory = true;

    for (const line of chartLines) {
      if (chartDataUnitCategoryMap.current.get(line) === activeUnitCategory) {
        shouldChangeCategory = false;
        break;
      }
    }

    const unitCategory = shouldChangeCategory
      ? chartDataUnitCategoryMap.current.get(chartLines[0])
      : activeUnitCategory;

    const chartLineSet = new Set(chartLines);

    let highestCategory: ChartDataCategory = undefined;
    let highestValue = 0;

    for (const [key, value] of highestCategoryValues.current) {
      if (
        !chartLineSet.has(key) ||
        chartDataUnitCategoryMap.current.get(key) !== unitCategory
      )
        continue;

      if (value > highestValue) {
        highestCategory = key;
        highestValue = value;
      }
    }

    setSecondaryDataKey(highestCategory);
    setSecondaryDataUnitCategory(unitCategory);
  };

  const updateLeftYAxis = (chartAreas: ChartDataCategory[]) => {
    if (chartAreas.length === 0) return;

    if (chartAreas.length === 1) {
      setPrimaryDataKey(chartAreas[0]);
      setShownChartDataAreas(chartAreas);
      return;
    }

    const unitCategory = chartDataUnitCategoryMap.current.get(chartAreas[0]);

    const chartAreaSet = new Set(chartAreas);

    const chartAreasValueMap = new Map<ChartDataCategory, number>();

    for (const [key, value] of highestCategoryValues.current) {
      if (
        !chartAreaSet.has(key) ||
        chartDataUnitCategoryMap.current.get(key) !== unitCategory
      )
        continue;

      // Create highest value Map of only chartAreas dataKeys
      chartAreasValueMap.set(key, value);
    }

    // Sort dataKeys with highest values first
    const sortedDataKeys = Array.from(chartAreasValueMap.entries())
      .sort(([, valueA], [, valueB]) => valueB - valueA)
      .map(([key]) => key);

    setPrimaryDataKey(sortedDataKeys[0]);
    setShownChartDataAreas(sortedDataKeys);
  };

  const loadChartAreas = (dataKeys: ChartDataCategory[]) => {
    if (dataKeys.length === 0) return;

    if (primaryDataKey === undefined) {
      // If no Chart Areas exist
      setChartDataAreas(dataKeys);

      updateLeftYAxis(dataKeys);
    }

    if (
      primaryDataKey !== undefined &&
      chartDataUnitCategoryMap.current.get(dataKeys[0]) !==
        chartDataUnitCategoryMap.current.get(primaryDataKey)
    ) {
      // Replace existing Chart Areas if existing Chart Areas does not share Unit Category
      setChartDataAreas(dataKeys);

      setChartDataLines([...chartDataLines, ...chartDataAreas]);
      setChartLineUnitCategorySet(
        new Set([
          ...chartLineUnitCategorySet,
          chartDataUnitCategoryMap.current.get(primaryDataKey),
        ])
      );

      const updatedShownChartDataLines = [
        ...shownChartDataLines,
        ...shownChartDataAreas,
      ];

      setShownChartDataLines(updatedShownChartDataLines);

      updateLeftYAxis(dataKeys);

      updateRightYAxis(updatedShownChartDataLines, secondaryDataKey);
    }

    if (
      primaryDataKey !== undefined &&
      chartDataUnitCategoryMap.current.get(dataKeys[0]) ===
        chartDataUnitCategoryMap.current.get(primaryDataKey)
    ) {
      // Append new Chart Area if existing Chart Area(s) share Unit Category
      setChartDataAreas([...chartDataAreas, ...dataKeys]);

      updateLeftYAxis(dataKeys);
    }
  };

  const loadChartLines = (
    dataKeys: ChartDataCategory[],
    unitCategories: ChartDataUnitCategory[],
    rightYAxisDataKey: ChartDataCategory
  ) => {
    setChartDataLines([...chartDataLines, ...dataKeys]);
    setChartLineUnitCategorySet(
      new Set([...chartLineUnitCategorySet, ...unitCategories])
    );

    const updatedShownChartDataLines = [...shownChartDataLines, ...dataKeys];

    setShownChartDataLines(updatedShownChartDataLines);

    updateRightYAxis(updatedShownChartDataLines, rightYAxisDataKey);
  };

  const addChartComment = (
    chartCommentMap: Map<string, ChartComment[]>,
    date: string,
    dataKeys: Set<ChartDataCategory>,
    label: string,
    comment: string
  ) => {
    const chartComment: ChartComment = {
      dataKeys,
      label,
      comment,
    };

    if (chartCommentMap.has(date)) {
      const updatedChartCommentList = chartCommentMap.get(date)!;
      updatedChartCommentList.push(chartComment);
    } else {
      chartCommentMap.set(date, [chartComment]);
    }
  };

  const handleLoadMeasurementClick = async (loadPrimary: boolean) => {
    await handleOpenListModal("measurement-list");

    setLoadChartAsArea(loadPrimary);
  };

  const loadMeasurement = async (measurement: Measurement) => {
    const measurementIdString:
      | LoadedChartType
      | ChartDataCategory = `measurement_${measurement.id}`;

    if (
      loadedCharts.current.has(measurementIdString) ||
      userSettings === undefined
    )
      return;

    const measurementType = measurement.measurement_type;

    if (measurementType !== "Caliper" && measurementType !== "Circumference")
      return;

    const userMeasurements = await GetUserMeasurementsWithMeasurementId(
      measurement.id
    );

    if (userMeasurements.length === 0) return;

    const loadedChartData: ChartDataItem[] = [];

    let highestValue = 0;

    const dateSet = new Set<string>();

    const updatedChartCommentMap = new Map(chartCommentMap);
    const commentDataKeys: Set<ChartDataCategory> = new Set([
      measurementIdString,
    ]);
    const commentLabel = "Body Measurement Comment";

    for (const userMeasurement of userMeasurements) {
      const date = FormatDateToShortString(
        new Date(userMeasurement.date),
        userSettings.locale
      );

      // Only load first entry per day
      if (dateSet.has(date)) continue;

      dateSet.add(date);

      const userMeasurementValues: UserMeasurementValues = JSON.parse(
        userMeasurement.measurement_values
      );

      const measurementValues = userMeasurementValues[`${measurement.id}`];

      // Check if measurement_type and unit combo is valid
      if (
        measurementValues.measurement_type !== measurementType ||
        (measurementValues.measurement_type !== "Caliper" &&
          measurementValues.measurement_type !== "Circumference") ||
        (measurementValues.measurement_type === "Caliper" &&
          measurementValues.unit !== "mm") ||
        (measurementValues.measurement_type === "Circumference" &&
          !validCircumferenceUnits.has(measurementValues.unit))
      )
        continue;

      const chartDataItem: ChartDataItem = {
        date,
      };

      const areCommentsAlreadyLoaded = Object.keys(userMeasurementValues).some(
        (item) =>
          loadedCharts.current.has(`measurement_${item}` as LoadedChartType)
      );

      if (!areCommentsAlreadyLoaded && userMeasurement.comment !== null) {
        addChartComment(
          updatedChartCommentMap,
          date,
          commentDataKeys,
          commentLabel,
          userMeasurement.comment
        );
      }

      const value =
        measurementValues.measurement_type === "Circumference"
          ? ConvertNumberToTwoDecimals(
              ConvertMeasurementValue(
                measurementValues.value,
                measurementValues.unit,
                circumferenceUnit
              )
            )
          : ConvertNumberToTwoDecimals(measurementValues.value);

      chartDataItem[measurementIdString] = value;

      if (value > highestValue) {
        highestValue = value;
      }

      loadedChartData.push(chartDataItem);
    }

    setChartCommentMap(updatedChartCommentMap);

    const filledInChartData = fillInMissingDates(
      loadedChartData,
      userSettings.locale
    );

    const mergedChartData = mergeChartData(
      filledInChartData,
      chartData,
      userSettings.locale
    );

    setChartData(mergedChartData);

    if (measurementType === "Caliper") {
      highestCategoryValues.current.set(measurementIdString, highestValue);

      chartDataUnitCategoryMap.current.set(measurementIdString, "Caliper");

      const chartLabel = `${measurement.name} [Caliper]`;

      chartDataCategoryLabelMap.current.set(measurementIdString, chartLabel);

      chartConfig.current[measurementIdString] = {
        label: chartLabel,
      };

      chartDataUnitMap.current.set(measurementIdString, " mm");

      if (loadChartAsArea) {
        loadChartAreas([measurementIdString]);
      } else {
        loadChartLines([measurementIdString], ["Caliper"], measurementIdString);
      }
    } else {
      highestCategoryValues.current.set(measurementIdString, highestValue);

      chartDataUnitCategoryMap.current.set(
        measurementIdString,
        "Circumference"
      );

      const chartLabel = `${measurement.name} [Circumference]`;

      chartDataCategoryLabelMap.current.set(measurementIdString, chartLabel);

      chartConfig.current[measurementIdString] = {
        label: chartLabel,
      };

      chartDataUnitMap.current.set(
        measurementIdString,
        ` ${circumferenceUnit}`
      );

      if (loadChartAsArea) {
        loadChartAreas([measurementIdString]);
      } else {
        loadChartLines(
          [measurementIdString],
          ["Circumference"],
          measurementIdString
        );
      }
    }

    const updatedLoadedMeasurements = new Map(loadedMeasurements);
    updatedLoadedMeasurements.set(measurement.id, measurement);

    setLoadedMeasurements(updatedLoadedMeasurements);
    loadedCharts.current.add(measurementIdString);
    if (!isChartDataLoaded.current) isChartDataLoaded.current = true;
    listModal.onClose();
  };

  const handleClickExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    listModal.onClose();
    loadExerciseChartModal.onOpen();
  };

  const loadExerciseStats = async () => {
    if (selectedExercise === undefined || userSettings === undefined) return;

    const exerciseId = selectedExercise.id;

    const fullSetList = await GetCompletedSetsWithExerciseId(exerciseId, true);

    if (fullSetList.length === 0) return;

    const loadedChartData: ChartDataItem[] = [];

    const dateMap = new Map<string, WorkoutSet[]>();

    const highestValueMap = new Map<ChartDataExerciseCategory, number>();

    for (const option of loadExerciseOptions) {
      highestValueMap.set(`${option}_${exerciseId}`, -1);
    }

    // TODO: ADD comments

    for (const set of fullSetList) {
      const date = FormatDateToShortString(
        new Date(set.time_completed!),
        userSettings.locale
      );

      if (dateMap.has(date)) {
        dateMap.get(date)!.push(set);
      } else {
        dateMap.set(date, [set]);
      }
    }

    for (const [date, setList] of dateMap) {
      const analyticsValuesMap = GetAnalyticsValuesForSetList(
        setList,
        loadExerciseOptions,
        weightUnit,
        distanceUnit
      );

      const chartDataItem: ChartDataItem = {
        date,
      };

      for (const [key, value] of analyticsValuesMap) {
        const chartName: ChartDataCategory = `${key}_${exerciseId}`;
        chartDataItem[chartName] = value;

        if (value > highestValueMap.get(chartName)!) {
          highestValueMap.set(chartName, value);
        }
      }

      loadedChartData.push(chartDataItem);
    }

    // Filter out categories with no values
    const updatedHighestValueMap = new Map(
      Array.from(highestValueMap).filter(([, value]) => value > -1)
    );

    if (updatedHighestValueMap.size === 0) {
      for (const chart of highestValueMap.keys()) {
        loadedCharts.current.add(chart);
      }

      setSelectedExercise(undefined);
      toast.error("No Values Found For Selected Stats");
      loadExerciseChartModal.onClose();
      return;
    }

    const filledInChartData = fillInMissingDates(
      loadedChartData,
      userSettings.locale
    );

    const mergedChartData = mergeChartData(
      filledInChartData,
      chartData,
      userSettings.locale
    );

    setChartData(mergedChartData);

    highestCategoryValues.current = new Map([
      ...highestCategoryValues.current,
      ...updatedHighestValueMap,
    ]);

    const primaryDataKeys: ChartDataCategory[] = [];
    const secondaryDataKeys: ChartDataCategory[] = [];

    const chartLineUnitCategories = new Set<ChartDataUnitCategory>();

    for (const option of loadExerciseOptions) {
      const chartName: ChartDataCategory = `${option}_${exerciseId}`;

      if (
        !updatedHighestValueMap.has(chartName) ||
        loadedCharts.current.has(chartName)
      )
        continue;

      const optionCategory = chartDataUnitCategoryMap.current.get(option);

      loadedCharts.current.add(chartName);
      chartDataUnitCategoryMap.current.set(chartName, optionCategory);

      const chartLabel = `${loadExerciseOptionsMap.get(option)} [${
        selectedExercise.name
      }]`;

      chartDataCategoryLabelMap.current.set(chartName, chartLabel);

      chartConfig.current[chartName] = {
        label: chartLabel,
      };

      updateExerciseStatUnit(chartName, optionCategory);

      if (loadExerciseOptionsUnitCategory === optionCategory) {
        primaryDataKeys.push(chartName);
      } else {
        secondaryDataKeys.push(chartName);
        chartLineUnitCategories.add(optionCategory);
      }
    }

    if (primaryDataKeys.length > 0) {
      loadChartAreas(primaryDataKeys);
    }

    if (secondaryDataKeys.length > 0) {
      loadChartLines(
        secondaryDataKeys,
        Array.from(chartLineUnitCategories),
        secondaryDataKeys[0]
      );
    }

    await updateDefaultLoadExerciseOptions();
    setSelectedExercise(undefined);
    loadExerciseChartModal.onClose();
    if (!isChartDataLoaded.current) isChartDataLoaded.current = true;
  };

  const updateDefaultLoadExerciseOptions = async () => {
    if (userSettings === undefined) return;

    const loadExerciseOptionsString = Array.from(loadExerciseOptions).join(",");

    const updatedUserSettings: UserSettings = {
      ...userSettings,
      default_load_exercise_options: loadExerciseOptionsString,
    };

    await UpdateDefaultLoadExerciseOptions(
      loadExerciseOptionsString,
      userSettings.id
    );

    setUserSettings(updatedUserSettings);
  };

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
        // TODO: ADD HRS+MIN?
        unit = " min";
        break;
      case "Pace":
        // TODO: ADD OTHER UNITS?
        unit = distanceUnit === "km" || distanceUnit === "m" ? " km/h" : " mph";
        break;
      // TODO: REMOVE ALL?
      // case "Number Of Sets":
      //   unit = " sets";
      //   break;
      // case "Number Of Reps":
      //   unit = " reps";
      //   break;
      // case "RIR":
      //   unit = " RIR";
      //   break;
      // case "RPE":
      //   unit = " RPE";
      //   break;
      // case "Resistance Level":
      //   unit = " level";
      //   break;
      default:
        break;
    }

    chartDataUnitMap.current.set(chartName, unit);
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Modal isOpen={listModal.isOpen} onOpenChange={listModal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {listModalPage === "exercise-list"
                  ? "Select Exercise"
                  : listModalPage === "measurement-list"
                  ? "Select Measurement"
                  : "Select Time Period"}
              </ModalHeader>
              <ModalBody>
                {listModalPage === "exercise-list" ? (
                  <ExerciseModalList
                    handleClickExercise={handleClickExercise}
                    useExerciseList={exerciseList}
                    useFilterExerciseList={filterExerciseList}
                    userSettingsId={userSettings.id}
                    customHeightString="h-[440px]"
                    isInAnalyticsPage
                  />
                ) : listModalPage === "measurement-list" ? (
                  <MeasurementModalList
                    useMeasurementList={measurementList}
                    handleMeasurementClick={loadMeasurement}
                    customHeightString="h-[440px]"
                    hiddenMeasurements={loadedMeasurements}
                  />
                ) : (
                  <TimePeriodModalList
                    useTimePeriodList={timePeriodList}
                    handleTimePeriodClick={handleClickTimePeriod}
                    userSettings={userSettings}
                    setUserSettings={setUserSettings}
                    customHeightString="h-[440px]"
                    hiddenTimePeriods={timePeriodIdSet}
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <LoadExerciseChartModal
        loadExerciseChartModal={loadExerciseChartModal}
        selectedExercise={selectedExercise}
        loadExerciseOptions={loadExerciseOptions}
        setLoadExerciseOptions={setLoadExerciseOptions}
        disabledLoadExerciseOptions={disabledLoadExerciseOptions}
        loadExerciseOptionsUnitCategory={loadExerciseOptionsUnitCategory}
        setLoadExerciseOptionsUnitCategory={setLoadExerciseOptionsUnitCategory}
        loadExerciseOptionsUnitCategories={loadExerciseOptionsUnitCategories}
        setLoadExerciseOptionsUnitCategories={
          setLoadExerciseOptionsUnitCategories
        }
        chartDataAreas={chartDataAreas}
        chartDataUnitCategoryMap={chartDataUnitCategoryMap.current}
        loadExerciseOptionsMap={loadExerciseOptionsMap}
        loadExerciseStats={loadExerciseStats}
      />
      <FilterMinAndMaxDatesModal
        filterMinAndMaxDatesModal={filterMinAndMaxDatesModal}
        locale={userSettings.locale}
        validStartDate={chartStartDate}
        validEndDate={chartEndDate}
        doneButtonAction={setCustomMinAndMaxDatesFilter}
      />
      <FilterExerciseGroupsModal
        useExerciseList={exerciseList}
        useFilterExerciseList={filterExerciseList}
      />
      <div className="flex flex-col items-center gap-2">
        {isChartDataLoaded.current && (
          <div className="flex gap-1.5 relative">
            <ChartContainer
              config={chartConfig.current}
              className="w-[870px] bg-default-50 pt-4 pb-1.5 rounded-xl"
            >
              <ComposedChart
                data={filteredChartData}
                margin={{ top: 15, right: 5, left: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => formatXAxisDate(date)}
                />
                <YAxis
                  yAxisId={primaryDataKey}
                  unit={chartDataUnitMap.current.get(primaryDataKey)}
                />
                <YAxis
                  dataKey={secondaryDataKey}
                  unit={chartDataUnitMap.current.get(secondaryDataKey)}
                  orientation="right"
                />
                <ChartTooltip
                  isAnimationActive={false}
                  content={
                    <ChartTooltipContent
                      chartDataUnitMap={chartDataUnitMap.current}
                      chartCommentMap={chartCommentMap}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                {shownChartDataAreas.map((item, index) => (
                  <Area
                    key={item}
                    isAnimationActive={false}
                    yAxisId={primaryDataKey}
                    dataKey={item ?? ""}
                    stroke={
                      chartAreaColorList[index % chartAreaColorList.length]
                    }
                    fill={chartAreaColorList[index % chartAreaColorList.length]}
                    activeDot={{ r: 6 }}
                    connectNulls
                    dot
                  />
                ))}
                {shownReferenceAreas.map((area, index) => (
                  <ReferenceArea
                    key={area.timePeriodId}
                    x1={area.x1}
                    x2={area.x2}
                    label={{ position: "top", value: area.label }}
                    opacity={0.2}
                    fill={
                      referenceAreaColorList[
                        index % referenceAreaColorList.length
                      ]
                    }
                    stroke={
                      referenceAreaColorList[
                        index % referenceAreaColorList.length
                      ]
                    }
                  />
                ))}
                {shownChartDataLines.map((item, index) => (
                  <Line
                    key={item}
                    isAnimationActive={false}
                    dataKey={item}
                    stroke={
                      chartLineColorList[index % chartLineColorList.length]
                    }
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                ))}
              </ComposedChart>
            </ChartContainer>
            <div className="absolute left-full pl-[5px]">
              {isChartDataLoaded.current && (
                <div className="flex flex-col gap-1 w-[12.25rem]">
                  <Select
                    label="Shown Areas"
                    size="sm"
                    variant="faded"
                    selectionMode="multiple"
                    selectedKeys={shownChartDataAreas as string[]}
                    isDisabled={chartDataAreas.length < 2}
                    onSelectionChange={(value) =>
                      updateLeftYAxis(Array.from(value) as ChartDataCategory[])
                    }
                    disallowEmptySelection
                  >
                    {chartDataAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {chartDataCategoryLabelMap.current.get(area)}
                      </SelectItem>
                    ))}
                  </Select>
                  {chartDataLines.length > 0 && (
                    <Select
                      label="Shown Lines"
                      size="sm"
                      variant="faded"
                      selectionMode="multiple"
                      selectedKeys={shownChartDataLines as string[]}
                      onSelectionChange={(value) =>
                        updateShownChartLines(
                          Array.from(value) as ChartDataCategory[]
                        )
                      }
                    >
                      {chartDataLines.map((line) => (
                        <SelectItem key={line} value={line}>
                          {chartDataCategoryLabelMap.current.get(line)}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                  {secondaryDataUnitCategory !== undefined && (
                    <Select
                      label="Right Y-Axis Value"
                      size="sm"
                      variant="faded"
                      selectedKeys={
                        secondaryDataUnitCategory !== undefined
                          ? [secondaryDataUnitCategory]
                          : []
                      }
                      onChange={(e) =>
                        changeSecondaryDataUnitCategory(e.target.value)
                      }
                      disallowEmptySelection
                      isDisabled={chartLineUnitCategorySet.size < 2}
                    >
                      {Array.from(chartLineUnitCategorySet).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                  {chartDataAreas.length > 1 && (
                    <Dropdown>
                      <DropdownTrigger>
                        <Button className="font-medium" variant="flat">
                          Convert Area To Line
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Chart data areas"
                        variant="flat"
                      >
                        {chartDataAreas.map((area) => (
                          <DropdownItem
                            key={area as string}
                            onPress={() => changeChartDataAreaToLine(area)}
                          >
                            {chartDataCategoryLabelMap.current.get(area)}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  )}
                  {chartDataLines.length > 0 && (
                    <Dropdown>
                      <DropdownTrigger>
                        <Button className="font-medium" variant="flat">
                          Convert Line To Area
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Chart data lines"
                        variant="flat"
                      >
                        {chartDataLines.map((line) => (
                          <DropdownItem
                            key={line as string}
                            onPress={() => changeChartDataLineToArea(line)}
                          >
                            {chartDataCategoryLabelMap.current.get(line)}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  )}
                  {chartLineUnitCategorySet.size > 0 && (
                    <Dropdown>
                      <DropdownTrigger>
                        <Button className="font-medium" variant="flat">
                          Change Area Category
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Chart data line unit categories"
                        variant="flat"
                      >
                        {Array.from(chartLineUnitCategorySet).map(
                          (category) => (
                            <DropdownItem
                              key={category as string}
                              onPress={() =>
                                changeChartDataLineCategoryToArea(category)
                              }
                            >
                              {category}
                            </DropdownItem>
                          )
                        )}
                      </DropdownMenu>
                    </Dropdown>
                  )}
                  {referenceAreas.length > 0 && (
                    <Select
                      label="Shown Time Periods"
                      size="sm"
                      variant="faded"
                      selectionMode="multiple"
                      selectedKeys={shownTimePeriodIdSet}
                      onSelectionChange={(keys) =>
                        updateShownReferenceAreas(new Set(keys) as Set<string>)
                      }
                    >
                      {referenceAreas.map((area) => (
                        <SelectItem
                          key={area.timePeriodId.toString()}
                          value={area.timePeriodId.toString()}
                        >
                          {area.label}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        className="font-medium"
                        variant="flat"
                        color={
                          filterMinDate || filterMaxDate
                            ? "secondary"
                            : "default"
                        }
                      >
                        Filter Dates
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Filter dates option menu"
                      variant="flat"
                    >
                      <>
                        {/* Only show the options that can meaningfully filter the Chart */}
                        {Array.from(dateMap).map(
                          ([label, date]) =>
                            date > chartStartDate! &&
                            date < chartEndDate! && (
                              <DropdownItem
                                key={label}
                                onPress={() => setFilterMinDate(date)}
                              >
                                {label}
                              </DropdownItem>
                            )
                        )}
                        <DropdownItem
                          key="Custom"
                          onPress={() => filterMinAndMaxDatesModal.onOpen()}
                        >
                          Custom
                        </DropdownItem>
                      </>
                    </DropdownMenu>
                  </Dropdown>
                  {filterMinDate !== null && (
                    <Chip
                      classNames={{ content: "w-[10.625rem]" }}
                      radius="sm"
                      color="secondary"
                      variant="flat"
                      onClose={() => setFilterMinDate(null)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="font-semibold">Min Date: </span>
                      {FormatDateToShortString(
                        filterMinDate,
                        userSettings.locale
                      )}
                    </Chip>
                  )}
                  {filterMaxDate !== null && (
                    <Chip
                      classNames={{ content: "w-[10.625rem]" }}
                      radius="sm"
                      color="secondary"
                      variant="flat"
                      onClose={() => setFilterMaxDate(null)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="font-semibold">Max Date: </span>
                      {FormatDateToShortString(
                        filterMaxDate,
                        userSettings.locale
                      )}
                    </Chip>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center w-[960px]">
            <Button
              className="font-medium"
              variant="flat"
              color="secondary"
              onPress={() => handleOpenListModal("exercise-list")}
            >
              Select Exercise
            </Button>
            <Dropdown>
              <DropdownTrigger>
                <Button className="font-medium" variant="flat">
                  Load Area
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Load category as area options"
                variant="flat"
                disabledKeys={loadedCharts.current}
              >
                <DropdownItem
                  key="measurement"
                  onPress={() => handleLoadMeasurementClick(true)}
                >
                  Measurement
                </DropdownItem>
                <DropdownItem
                  key="user-weights-weight"
                  onPress={() =>
                    loadUserWeightListWeights(
                      userSettings.locale,
                      weightUnit,
                      true
                    )
                  }
                >
                  Body Weights
                </DropdownItem>
                <DropdownItem
                  key="user-weights-body-fat"
                  onPress={() =>
                    loadUserWeightListBodyFat(userSettings.locale, true)
                  }
                >
                  Body Fat Percentages
                </DropdownItem>
                <DropdownItem
                  key="diet-logs-calories"
                  onPress={() =>
                    loadDietLogListCalories(userSettings.locale, true)
                  }
                >
                  Calories
                </DropdownItem>
                <DropdownItem
                  key="diet-logs-macros"
                  onPress={() =>
                    loadDietLogListMacros(userSettings.locale, true)
                  }
                >
                  Macros
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button className="font-medium" variant="flat">
                  Load Line
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Load category as line options"
                variant="flat"
                disabledKeys={loadedCharts.current}
              >
                <DropdownItem
                  key="measurement"
                  onPress={() => handleLoadMeasurementClick(false)}
                >
                  Measurement
                </DropdownItem>
                <DropdownItem
                  key="user-weights-weight"
                  onPress={() =>
                    loadUserWeightListWeights(
                      userSettings.locale,
                      weightUnit,
                      false
                    )
                  }
                >
                  Body Weights
                </DropdownItem>
                <DropdownItem
                  key="user-weights-body-fat"
                  onPress={() =>
                    loadUserWeightListBodyFat(userSettings.locale, false)
                  }
                >
                  Body Fat Percentages
                </DropdownItem>
                <DropdownItem
                  key="diet-logs-calories"
                  onPress={() =>
                    loadDietLogListCalories(userSettings.locale, false)
                  }
                >
                  Calories
                </DropdownItem>
                <DropdownItem
                  key="diet-logs-macros"
                  onPress={() =>
                    loadDietLogListMacros(userSettings.locale, false)
                  }
                >
                  Macros
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            {filteredChartData.length > 0 && (
              <Button
                className="font-medium"
                variant="flat"
                onPress={() => handleOpenListModal("time-period-list")}
              >
                Select Time Period
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 w-[960px]">
          <div></div>
          <Button
            className="font-medium"
            variant="flat"
            color="danger"
            onPress={() => setShowTestButtons(!showTestButtons)}
          >
            Toggle Test Buttons
          </Button>
        </div>
        <div className="flex items-center">
          {showTestButtons && (
            <div className="flex items-center gap-2">
              <Button
                className="font-medium"
                variant="flat"
                onPress={addTestArea}
              >
                Add Test Area
              </Button>
              <Button
                className="font-medium"
                variant="flat"
                onPress={removeTestArea}
              >
                Remove Test Area
              </Button>
              <Button
                className="font-medium"
                variant="flat"
                onPress={addTestLine}
              >
                Add Test Line
              </Button>
              <Button
                className="font-medium"
                variant="flat"
                onPress={removeTestLine}
              >
                Remove Test Line
              </Button>
              <Button
                className="font-medium"
                variant="flat"
                onPress={toggleTestTimePeriod}
              >
                Toggle Test Time Period
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
