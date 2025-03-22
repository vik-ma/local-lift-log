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
  RadioGroup,
  Radio,
} from "@heroui/react";
import {
  useChartColorLists,
  useChartDateMap,
  useChartTimePeriodIdSets,
  useDefaultChartMapsAndConfig,
  useExerciseList,
  useFilterExerciseList,
  useLoadExerciseOptionsMap,
  useMeasurementList,
  useTimePeriodList,
} from "../hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DeleteModal,
  DistanceUnitDropdown,
  ExerciseGroupCheckboxes,
  ExerciseModalList,
  FilterExerciseGroupsModal,
  FilterMinAndMaxDatesModal,
  LoadExerciseChartModal,
  LoadingSpinner,
  MeasurementModalList,
  MeasurementUnitDropdown,
  PaceUnitDropdown,
  TimePeriodModalList,
  WeightUnitDropdown,
} from "../components";
import {
  ChartComment,
  ChartDataCategory,
  ChartDataExerciseCategory,
  ChartDataExerciseCategoryBase,
  ChartDataUnitCategory,
  ChartReferenceAreaItem,
  Exercise,
  Measurement,
  TimePeriod,
  UserMeasurementValues,
  UserSettings,
  WorkoutSet,
} from "../typings";
import {
  ConvertDateToYmdString,
  ConvertDistanceValue,
  ConvertISODateStringToYmdDateString,
  ConvertMeasurementValue,
  ConvertNumberToTwoDecimals,
  ConvertPaceValue,
  ConvertWeightValue,
  CreateLoadExerciseOptionsList,
  CreateShownPropertiesSet,
  FormatDateToShortString,
  GetAllDietLogs,
  GetAllUserWeights,
  GetAnalyticsValuesForSetList,
  GetCompletedSetsWithExerciseId,
  GetCurrentYmdDateString,
  GetTimeCompletedForSetsWithExerciseId,
  GetUserMeasurementsWithMeasurementId,
  GetUserSettings,
  GetValidatedUserSettingsUnits,
  UpdateChartCommentMapForExercise,
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

type ListModalPage =
  | "exercise-list"
  | "measurement-list"
  | "time-period-list"
  | "exercise-groups";

type ChartDataItem = {
  date: string;
} & {
  [key in Exclude<ChartDataCategory, undefined>]?: number;
};

// WHEN ADDING NEW STATS:
// UPDATE useDefaultChartMapsAndConfig
// IF STAT HAS ID (EXERCISE STAT OR EXERCISE GROUP STAT)
// UPDATE getChartDataCategoryTypeAndId

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
  const [referenceAreas, setReferenceAreas] = useState<
    ChartReferenceAreaItem[]
  >([]);
  const [shownReferenceAreas, setShownReferenceAreas] = useState<
    ChartReferenceAreaItem[]
  >([]);
  const [weightUnit, setWeightUnit] = useState<string>("kg");
  const [distanceUnit, setDistanceUnit] = useState<string>("km");
  const [circumferenceUnit, setCircumferenceUnit] = useState<string>("cm");
  const [paceUnit, setPaceUnit] = useState<string>("km/h");
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
  const [filteredChartData, setFilteredChartData] = useState<ChartDataItem[]>(
    []
  );
  const [selectedExerciseGroups, setSelectedExerciseGroups] = useState<
    string[]
  >([]);
  const [
    countSecondaryExerciseGroupsAsOne,
    setCountSecondaryExerciseGroupsAsOne,
  ] = useState<boolean>(false);

  const [showTestButtons, setShowTestButtons] = useState<boolean>(false);

  const highestCategoryValues = useRef<Map<ChartDataCategory, number>>(
    new Map()
  );
  const filteredHighestCategoryValues = useRef<Map<ChartDataCategory, number>>(
    new Map()
  );

  const dateMap = useChartDateMap();

  const validCircumferenceUnits = new Set(ValidMeasurementUnits());

  const { timePeriodIdSet, shownTimePeriodIdSet } = useChartTimePeriodIdSets(
    referenceAreas,
    shownReferenceAreas
  );

  const loadedCharts = useRef<Set<Exclude<ChartDataCategory, undefined>>>(
    new Set()
  );

  // Don't replace with size of loadedCharts
  const isChartDataLoaded = useRef<boolean>(false);
  const areAllTestLinesAndAreasRendered = useRef<boolean>(false);

  const allChartDataCategories = useMemo(
    () => new Set([...chartDataAreas, ...chartDataLines]),
    [chartDataAreas, chartDataLines]
  );

  const listModal = useDisclosure();
  const loadExerciseChartModal = useDisclosure();
  const filterMinAndMaxDatesModal = useDisclosure();
  const deleteModal = useDisclosure();

  const exerciseList = useExerciseList(false, true, true);

  const {
    isExerciseListLoaded,
    getExercises,
    exerciseGroupDictionary,
    includeSecondaryGroups,
    setIncludeSecondaryGroups,
    exercises,
  } = exerciseList;

  const filterExerciseList = useFilterExerciseList(exerciseList);

  const measurementList = useMeasurementList(false, true, true);

  const { isMeasurementListLoaded, getMeasurements } = measurementList;

  const timePeriodList = useTimePeriodList();

  const {
    getTimePeriods,
    isTimePeriodListLoaded,
    setSelectedTimePeriodProperties,
  } = timePeriodList;

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

  const { chartLineColorList, chartAreaColorList, referenceAreaColorList } =
    useChartColorLists();

  const loadExerciseOptionsMap = useLoadExerciseOptionsMap();

  const includesMultisetMap = useRef<Map<string, Set<ChartDataCategory>>>(
    new Map()
  );

  const disabledExerciseGroups = useRef<string[]>([]);

  const { weightCharts, distanceCharts, paceCharts, circumferenceCharts } =
    useMemo(() => {
      const weightCharts = new Set<Exclude<ChartDataCategory, undefined>>();
      const distanceCharts = new Set<Exclude<ChartDataCategory, undefined>>();
      const paceCharts = new Set<Exclude<ChartDataCategory, undefined>>();
      const circumferenceCharts = new Set<
        Exclude<ChartDataCategory, undefined>
      >();

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

      return { weightCharts, distanceCharts, paceCharts, circumferenceCharts };
    }, [allChartDataCategories]);

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

    const chartAreaUnitCategory = chartDataUnitCategoryMap.current.get(
      chartDataAreas[0]
    );

    const unitCategoriesPrimary: ChartDataUnitCategory[] = [];

    if (chartAreaUnitCategory !== undefined) {
      unitCategoriesPrimary.push(chartAreaUnitCategory);
    }

    unitCategoriesPrimary.push(
      ...loadExerciseOptionsList.map((option) =>
        chartDataUnitCategoryMap.current.get(option)
      )
    );

    const unitCategorySetPrimary = new Set(unitCategoriesPrimary);

    unitCategorySetPrimary.delete(undefined);

    const unitCategoriesSecondary: ChartDataUnitCategory[] = [];

    if (secondaryDataUnitCategory !== undefined) {
      unitCategoriesSecondary.push(secondaryDataUnitCategory);
    }

    unitCategoriesSecondary.push(
      ...Array.from(unitCategorySetPrimary).filter(
        (value) => value !== unitCategoriesPrimary[0]
      )
    );

    setLoadExerciseOptionsUnitCategoriesPrimary(unitCategorySetPrimary);
    setLoadExerciseOptionsUnitCategoriesSecondary(unitCategoriesSecondary);
    setLoadExerciseOptionsUnitCategoryPrimary(unitCategoriesPrimary[0]);
    setLoadExerciseOptionsUnitCategorySecondary(
      secondaryDataUnitCategory !== undefined
        ? secondaryDataUnitCategory
        : Array.from(unitCategorySetPrimary)[1]
    );
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

        const validUnits = GetValidatedUserSettingsUnits(userSettings);

        setWeightUnit(validUnits.weightUnit);
        setDistanceUnit(validUnits.distanceUnit);
        setCircumferenceUnit(validUnits.measurementUnit);
        setPaceUnit(
          validUnits.distanceUnit === "km" || validUnits.distanceUnit === "m"
            ? "km/h"
            : "mph"
        );

        chartDataUnitMap.current.set(
          "body_weight",
          ` ${validUnits.weightUnit}`
        );

        updateLoadExerciseOptions(userSettings.default_load_exercise_options);
      };

      loadUserSettings();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleOpenListModal = async (modalListType: ListModalPage) => {
    if (userSettings === undefined) return;

    setListModalPage(modalListType);

    if (
      (modalListType === "exercise-list" ||
        modalListType === "exercise-groups") &&
      !isExerciseListLoaded.current
    ) {
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

  const loadDietLogListCalories = async (loadPrimary: boolean) => {
    if (loadedCharts.current.has("calories") || userSettings === undefined)
      return;

    const dietLogs = await GetAllDietLogs(true);

    if (dietLogs.length === 0) {
      loadedCharts.current.add("calories");
      loadedCharts.current.add("fat");
      loadedCharts.current.add("carbs");
      loadedCharts.current.add("protein");
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

    const areCommentsAlreadyLoaded = areAnyDietLogsLoaded();

    for (const dietLog of dietLogs) {
      const date = FormatDateToShortString(
        new Date(dietLog.date),
        userSettings.locale
      );

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

    const filledInChartData = fillInMissingDates(
      loadedChartData,
      userSettings.locale
    );

    const mergedChartData = mergeChartData(
      filledInChartData,
      chartData,
      userSettings.locale
    );

    highestCategoryValues.current.set("calories", highestValue);

    updateChartDataAndFilteredHighestCategoryValues(
      mergedChartData,
      filterMinDate,
      filterMaxDate
    );

    if (loadPrimary) {
      loadChartAreas(["calories"]);
    } else {
      loadChartLines(["calories"], ["Calories"], "Calories");
    }

    loadedCharts.current.add("calories");
    isChartDataLoaded.current = true;
  };

  const loadDietLogListMacros = async (
    loadPrimary: boolean,
    macroType: "fat" | "carbs" | "protein"
  ) => {
    if (loadedCharts.current.has(macroType) || userSettings === undefined)
      return;

    const dietLogs = await GetAllDietLogs(true);

    if (dietLogs.length === 0) {
      loadedCharts.current.add("calories");
      loadedCharts.current.add("fat");
      loadedCharts.current.add("carbs");
      loadedCharts.current.add("protein");
      toast.error("No Diet Logs Entries Recorded");
      return;
    }

    const loadedChartData: ChartDataItem[] = [];

    let highestValue = -1;

    const updatedChartCommentMap = new Map(chartCommentMap);
    const commentDataKeys: Set<ChartDataCategory> = new Set([
      "calories",
      "fat",
      "carbs",
      "protein",
    ]);
    const commentLabel = "Diet Log Comment";

    const areCommentsAlreadyLoaded = areAnyDietLogsLoaded();

    for (const dietLog of dietLogs) {
      const date = FormatDateToShortString(
        new Date(dietLog.date),
        userSettings.locale
      );

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

      if (macroType === "fat" && dietLog.fat !== null) {
        chartDataItem.fat = dietLog.fat;

        if (dietLog.fat > highestValue) {
          highestValue = dietLog.fat;
        }
      }

      if (macroType === "carbs" && dietLog.carbs !== null) {
        chartDataItem.carbs = dietLog.carbs;

        if (dietLog.carbs > highestValue) {
          highestValue = dietLog.carbs;
        }
      }

      if (macroType === "protein" && dietLog.protein !== null) {
        chartDataItem.protein = dietLog.protein;

        if (dietLog.protein > highestValue) {
          highestValue = dietLog.protein;
        }
      }

      loadedChartData.push(chartDataItem);
    }

    if (highestValue === -1) {
      loadedCharts.current.add(macroType);
      toast.error(
        `No Values For ${chartConfig.current[macroType].label} Have Been Recorded`
      );
      return;
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

    highestCategoryValues.current.set(macroType, highestValue);

    updateChartDataAndFilteredHighestCategoryValues(
      mergedChartData,
      filterMinDate,
      filterMaxDate
    );

    if (loadPrimary) {
      loadChartAreas([macroType]);
    } else {
      // All macro dataKeys will work, even if they have no values loaded
      loadChartLines([macroType], ["Macros"], "Macros");
    }

    loadedCharts.current.add(macroType);
    isChartDataLoaded.current = true;
  };

  const areAnyDietLogsLoaded = () => {
    return (
      allChartDataCategories.has("calories") ||
      allChartDataCategories.has("fat") ||
      allChartDataCategories.has("carbs") ||
      allChartDataCategories.has("protein")
    );
  };

  const updateShownChartLines = (chartLines: ChartDataCategory[]) => {
    const chartLineUnitCategorySet = new Set<ChartDataUnitCategory>();

    for (const line of chartLines) {
      chartLineUnitCategorySet.add(chartDataUnitCategoryMap.current.get(line));
    }

    setShownChartDataLines(chartLines);
    setChartLineUnitCategorySet(chartLineUnitCategorySet);

    const activeUnitCategory =
      chartDataUnitCategoryMap.current.get(secondaryDataKey);

    updateRightYAxis(chartLines, activeUnitCategory);
  };

  const formatXAxisDate = (date: string) => {
    const cutoff =
      userSettings === undefined || userSettings.locale === "en-US" ? 6 : 5;

    return date.substring(0, date.length - cutoff);
  };

  const addTestArea = () => {
    if (!isChartDataLoaded.current || loadedCharts.current.has("weight_min_0"))
      return;

    const updatedChartData: ChartDataItem[] = [...chartData];

    let maxNum = 0;

    for (let i = 0; i < chartData.length; i++) {
      const testNum = Math.floor(Math.random() * 1000);

      if (testNum > maxNum) {
        maxNum = testNum;
      }

      updatedChartData[i].weight_min_0 = testNum;
    }

    highestCategoryValues.current.set("weight_min_0", maxNum);
    chartConfig.current["weight_min_0"] = { label: "Test" };
    chartDataUnitMap.current.set("weight_min_0", ` ${weightUnit}`);
    chartDataUnitCategoryMap.current.set("weight_min_0", "Weight");

    updateChartDataAndFilteredHighestCategoryValues(
      updatedChartData,
      filterMinDate,
      filterMaxDate
    );
    setChartDataAreas([...chartDataAreas, "weight_min_0"]);

    const updatedShownChartDataAreas: ChartDataCategory[] = [
      ...shownChartDataAreas,
      "weight_min_0",
    ];

    updateLeftYAxis(updatedShownChartDataAreas);

    loadedCharts.current.add("weight_min_0");
    isChartDataLoaded.current = true;
  };

  const addTestLine = () => {
    if (!isChartDataLoaded.current || loadedCharts.current.has("weight_min_0"))
      return;

    const updatedChartData: ChartDataItem[] = [...chartData];

    let maxNum = 0;

    for (let i = 0; i < chartData.length; i++) {
      const testNum = Math.floor(Math.random() * 1000);

      if (testNum > maxNum) {
        maxNum = testNum;
      }

      updatedChartData[i].weight_min_0 = testNum;
    }

    highestCategoryValues.current.set("weight_min_0", maxNum);
    chartConfig.current["weight_min_0"] = { label: "Test" };
    chartDataUnitMap.current.set("weight_min_0", ` ${weightUnit}`);
    chartDataUnitCategoryMap.current.set("weight_min_0", "Weight");

    updateChartDataAndFilteredHighestCategoryValues(
      updatedChartData,
      filterMinDate,
      filterMaxDate
    );
    setChartDataLines([...chartDataLines, "weight_min_0"]);

    const updatedShownChartDataLines: ChartDataCategory[] = [
      ...shownChartDataLines,
      "weight_min_0",
    ];

    setShownChartDataLines(updatedShownChartDataLines);

    const updatedChartLineUnitCategorySet = new Set(
      updatedShownChartDataLines.map((item) =>
        chartDataUnitCategoryMap.current.get(item)
      )
    );

    setChartLineUnitCategorySet(updatedChartLineUnitCategorySet);

    const activeUnitCategory =
      chartDataUnitCategoryMap.current.get(secondaryDataKey);

    updateRightYAxis(updatedShownChartDataLines, activeUnitCategory);

    loadedCharts.current.add("weight_min_0");
    isChartDataLoaded.current = true;
  };

  const toggleTestTimePeriod = () => {
    if (userSettings === undefined) return;

    const testPeriodIndex = referenceAreas.findIndex(
      (obj) => obj.timePeriodId === 0
    );

    if (testPeriodIndex === -1) {
      const newReferenceArea: ChartReferenceAreaItem = {
        timePeriodId: 0,
        x1: FormatDateToShortString(
          new Date("2025-01-03"),
          userSettings.locale
        ),
        x2: FormatDateToShortString(
          new Date("2025-01-07"),
          userSettings.locale
        ),
        label: "Test Period",
        startDate: "2025-01-03",
        endDate: "2025-01-07",
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

    const referenceArea: ChartReferenceAreaItem = {
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
    weightUnit: string,
    loadPrimary: boolean
  ) => {
    if (loadedCharts.current.has("body_weight") || userSettings === undefined)
      return;

    const userWeights = await GetAllUserWeights(true);

    if (userWeights.length === 0) {
      loadedCharts.current.add("body_weight");
      loadedCharts.current.add("body_fat_percentage");
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

    const areCommentsAlreadyLoaded = allChartDataCategories.has(
      "body_fat_percentage"
    );

    for (const userWeight of userWeights) {
      const date = FormatDateToShortString(
        new Date(userWeight.date),
        userSettings.locale
      );

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

    const filledInChartData = fillInMissingDates(
      loadedChartData,
      userSettings.locale
    );

    const mergedChartData = mergeChartData(
      filledInChartData,
      chartData,
      userSettings.locale
    );

    highestCategoryValues.current.set("body_weight", highestValue);

    updateChartDataAndFilteredHighestCategoryValues(
      mergedChartData,
      filterMinDate,
      filterMaxDate
    );

    if (loadPrimary) {
      loadChartAreas(["body_weight"]);
    } else {
      loadChartLines(["body_weight"], ["Weight"], "Weight");
    }

    loadedCharts.current.add("body_weight");
    isChartDataLoaded.current = true;
  };

  const loadUserWeightListBodyFat = async (loadPrimary: boolean) => {
    if (
      loadedCharts.current.has("body_fat_percentage") ||
      userSettings === undefined
    )
      return;

    const userWeights = await GetAllUserWeights(true);

    if (userWeights.length === 0) {
      loadedCharts.current.add("body_weight");
      loadedCharts.current.add("body_fat_percentage");
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

    const areCommentsAlreadyLoaded = allChartDataCategories.has("body_weight");

    for (const userWeight of userWeights) {
      const date = FormatDateToShortString(
        new Date(userWeight.date),
        userSettings.locale
      );

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
      loadedCharts.current.add("body_fat_percentage");
      toast.error("No Body Fat Percentages Recorded");
      return;
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

    highestCategoryValues.current.set("body_fat_percentage", highestValue);

    updateChartDataAndFilteredHighestCategoryValues(
      mergedChartData,
      filterMinDate,
      filterMaxDate
    );

    if (loadPrimary) {
      loadChartAreas(["body_fat_percentage"]);
    } else {
      loadChartLines(["body_fat_percentage"], ["Body Fat %"], "Body Fat %");
    }

    loadedCharts.current.add("body_fat_percentage");
    isChartDataLoaded.current = true;
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

    const activeUnitCategory =
      chartDataUnitCategoryMap.current.get(secondaryDataKey);

    updateRightYAxis(updatedShownChartDataLines, activeUnitCategory);
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

    const activeUnitCategory =
      chartDataUnitCategoryMap.current.get(secondaryDataKey);

    updateRightYAxis(updatedShownChartDataLines, activeUnitCategory);
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

    const activeUnitCategory =
      chartDataUnitCategoryMap.current.get(secondaryDataKey);

    updateRightYAxis(updatedShownChartDataLines, activeUnitCategory);
  };

  const updateCustomMinAndMaxDatesFilter = (
    minDate: Date | null,
    maxDate: Date | null
  ) => {
    setFilterMinDate(minDate);
    setFilterMaxDate(maxDate);

    updateChartDataAndFilteredHighestCategoryValues(
      chartData,
      minDate,
      maxDate
    );

    updateLeftYAxis(shownChartDataAreas);
    updateRightYAxis(
      shownChartDataLines,
      chartDataUnitCategoryMap.current.get(secondaryDataKey)
    );

    filterMinAndMaxDatesModal.onClose();
  };

  const updateMinDateFilter = (minDate: Date | null) => {
    updateChartDataAndFilteredHighestCategoryValues(
      chartData,
      minDate,
      filterMaxDate
    );

    updateLeftYAxis(shownChartDataAreas);
    updateRightYAxis(
      shownChartDataLines,
      chartDataUnitCategoryMap.current.get(secondaryDataKey)
    );

    setFilterMinDate(minDate);
  };

  const updateMaxDateFilter = (maxDate: Date | null) => {
    updateChartDataAndFilteredHighestCategoryValues(
      chartData,
      filterMinDate,
      maxDate
    );

    updateLeftYAxis(shownChartDataAreas);
    updateRightYAxis(
      shownChartDataLines,
      chartDataUnitCategoryMap.current.get(secondaryDataKey)
    );

    setFilterMaxDate(maxDate);
  };

  const updateRightYAxis = (
    chartLines: ChartDataCategory[],
    activeUnitCategory: ChartDataUnitCategory
  ) => {
    if (chartLines.length === 0) {
      setSecondaryDataKey(undefined);
      setSecondaryDataUnitCategory(undefined);
      return;
    }

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

    for (const [key, value] of filteredHighestCategoryValues.current) {
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

    for (const [key, value] of filteredHighestCategoryValues.current) {
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

      const activeUnitCategory =
        chartDataUnitCategoryMap.current.get(secondaryDataKey);

      updateRightYAxis(updatedShownChartDataLines, activeUnitCategory);
    }

    if (
      primaryDataKey !== undefined &&
      chartDataUnitCategoryMap.current.get(dataKeys[0]) ===
        chartDataUnitCategoryMap.current.get(primaryDataKey)
    ) {
      // Append new Chart Area if existing Chart Area(s) share Unit Category
      setChartDataAreas([...chartDataAreas, ...dataKeys]);

      updateLeftYAxis([...shownChartDataAreas, ...dataKeys]);
    }
  };

  const loadChartLines = (
    dataKeys: ChartDataCategory[],
    unitCategories: ChartDataUnitCategory[],
    activeUnitCategory: ChartDataUnitCategory
  ) => {
    setChartDataLines([...chartDataLines, ...dataKeys]);
    setChartLineUnitCategorySet(
      new Set([...chartLineUnitCategorySet, ...unitCategories])
    );

    const updatedShownChartDataLines = [...shownChartDataLines, ...dataKeys];

    setShownChartDataLines(updatedShownChartDataLines);

    updateRightYAxis(updatedShownChartDataLines, activeUnitCategory);
  };

  const addChartComment = (
    chartCommentMap: Map<string, ChartComment[]>,
    date: string,
    dataKeys: Set<ChartDataCategory>,
    label: string,
    comment: string,
    areCommentsAlreadyLoaded?: boolean
  ) => {
    const chartComment: ChartComment = {
      dataKeys,
      label,
      comment,
    };

    if (chartCommentMap.has(date)) {
      const updatedChartCommentList = chartCommentMap.get(date)!;

      let shouldAddChartComment = true;

      if (areCommentsAlreadyLoaded) {
        for (const chartComment of updatedChartCommentList) {
          if (
            chartComment.label === label &&
            chartComment.comment === comment
          ) {
            shouldAddChartComment = false;
          }
        }
      }

      if (shouldAddChartComment) {
        updatedChartCommentList.push(chartComment);
      }
    } else {
      chartCommentMap.set(date, [chartComment]);
    }
  };

  const handleLoadMeasurementClick = async (loadPrimary: boolean) => {
    await handleOpenListModal("measurement-list");

    setLoadChartAsArea(loadPrimary);
  };

  const loadMeasurement = async (measurement: Measurement) => {
    const measurementIdString: ChartDataCategory = `measurement_${measurement.id}`;

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
          allChartDataCategories.has(
            `measurement_${item}` as Exclude<ChartDataCategory, undefined>
          )
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

    highestCategoryValues.current.set(measurementIdString, highestValue);

    updateChartDataAndFilteredHighestCategoryValues(
      mergedChartData,
      filterMinDate,
      filterMaxDate
    );

    if (measurementType === "Caliper") {
      chartDataUnitCategoryMap.current.set(measurementIdString, "Caliper");

      const chartLabel = `${measurement.name} [Caliper]`;

      chartConfig.current[measurementIdString] = {
        label: chartLabel,
      };

      chartDataUnitMap.current.set(measurementIdString, " mm");

      if (loadChartAsArea) {
        loadChartAreas([measurementIdString]);
      } else {
        loadChartLines([measurementIdString], ["Caliper"], "Caliper");
      }
    } else {
      chartDataUnitCategoryMap.current.set(
        measurementIdString,
        "Circumference"
      );

      const chartLabel = `${measurement.name} [Circumference]`;

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
          "Circumference"
        );
      }
    }

    const updatedLoadedMeasurements = new Map(loadedMeasurements);
    updatedLoadedMeasurements.set(measurement.id, measurement);

    setLoadedMeasurements(updatedLoadedMeasurements);
    loadedCharts.current.add(measurementIdString);
    isChartDataLoaded.current = true;
    listModal.onClose();
  };

  const handleClickExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    listModal.onClose();
    loadExerciseChartModal.onOpen();
  };

  const loadExerciseStats = async (
    ignoreWarmups: boolean,
    ignoreMultisets: boolean
  ) => {
    if (selectedExercise === undefined || userSettings === undefined) return;

    const exerciseId = selectedExercise.id;

    const fullSetList = await GetCompletedSetsWithExerciseId(exerciseId);

    if (fullSetList.length === 0) return;

    const loadedChartData: ChartDataItem[] = [];

    const dateMap = new Map<string, WorkoutSet[]>();

    const highestValueMap = new Map<ChartDataExerciseCategory, number>();

    const { areCommentsAlreadyLoaded, updatedChartCommentMap } =
      UpdateChartCommentMapForExercise(
        loadExerciseOptions,
        exerciseId,
        allChartDataCategories,
        chartCommentMap,
        loadExerciseOptionsMap
      );

    const chartDataKeys: Set<ChartDataCategory> = new Set();

    for (const option of loadExerciseOptions) {
      const chartName: ChartDataExerciseCategory = `${option}_${exerciseId}`;
      highestValueMap.set(chartName, -1);
      chartDataKeys.add(chartName);
    }

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
      const { analyticsValuesMap, commentMap, includesMultiset } =
        GetAnalyticsValuesForSetList(
          setList,
          loadExerciseOptions,
          weightUnit,
          distanceUnit,
          paceUnit,
          ignoreWarmups,
          ignoreMultisets
        );

      const chartDataItem: ChartDataItem = {
        date,
      };

      let shouldAddChartDataItem = false;

      for (const [key, value] of analyticsValuesMap) {
        const chartName: ChartDataCategory = `${key}_${exerciseId}`;

        if (value > highestValueMap.get(chartName)!) {
          highestValueMap.set(chartName, value);
        }

        if (value !== -1) {
          shouldAddChartDataItem = true;
          chartDataItem[chartName] = value;
        }
      }

      if (shouldAddChartDataItem) {
        loadedChartData.push(chartDataItem);
      } else {
        continue;
      }

      for (const [setNum, comment] of commentMap) {
        const commentLabel = `${selectedExercise.name} Set ${setNum} Comment`;

        addChartComment(
          updatedChartCommentMap,
          date,
          chartDataKeys,
          commentLabel,
          comment,
          areCommentsAlreadyLoaded
        );
      }

      if (includesMultiset) {
        includesMultisetMap.current.set(date, new Set(chartDataKeys));
      }
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

    setChartCommentMap(updatedChartCommentMap);

    // Sort by date, since Sets from GetCompletedSetsWithExerciseId are sorted by id
    const sortedLoadedChartData = loadedChartData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const filledInChartData = fillInMissingDates(
      sortedLoadedChartData,
      userSettings.locale
    );

    const mergedChartData = mergeChartData(
      filledInChartData,
      chartData,
      userSettings.locale
    );

    highestCategoryValues.current = new Map([
      ...highestCategoryValues.current,
      ...updatedHighestValueMap,
    ]);

    updateChartDataAndFilteredHighestCategoryValues(
      mergedChartData,
      filterMinDate,
      filterMaxDate
    );

    const primaryDataKeys: ChartDataCategory[] = [];
    const secondaryDataKeys: ChartDataCategory[] = [];

    const chartLineUnitCategories = new Set<ChartDataUnitCategory>();

    for (const option of loadExerciseOptions) {
      const chartName: ChartDataCategory = `${option}_${exerciseId}`;

      if (loadedCharts.current.has(chartName)) continue;

      loadedCharts.current.add(chartName);

      if (!updatedHighestValueMap.has(chartName)) continue;

      const optionCategory = chartDataUnitCategoryMap.current.get(option);

      chartDataUnitCategoryMap.current.set(chartName, optionCategory);

      const chartLabel = `${loadExerciseOptionsMap.get(option)} [${
        selectedExercise.name
      }]`;

      chartConfig.current[chartName] = {
        label: chartLabel,
      };

      updateExerciseStatUnit(chartName, optionCategory);

      if (loadExerciseOptionsUnitCategoryPrimary === optionCategory) {
        primaryDataKeys.push(chartName);
      } else {
        secondaryDataKeys.push(chartName);
        chartLineUnitCategories.add(optionCategory);
      }
    }

    const currentChartAreaCategory =
      chartDataUnitCategoryMap.current.get(primaryDataKey);

    if (
      loadExerciseOptionsUnitCategoryPrimary !== undefined &&
      chartDataAreas.length > 0 &&
      currentChartAreaCategory !== loadExerciseOptionsUnitCategoryPrimary
    ) {
      // Move current Chart Areas to Chart Lines if different categories
      // (Needed because loadChartLines will update Chart Lines after loadChartAreas)
      secondaryDataKeys.unshift(...chartDataAreas);
      chartLineUnitCategories.add(currentChartAreaCategory);
    }

    if (
      loadExerciseOptionsUnitCategoryPrimary !== undefined &&
      primaryDataKeys.length > 0
    ) {
      loadChartAreas(primaryDataKeys);
    }

    if (secondaryDataKeys.length > 0) {
      loadChartLines(
        secondaryDataKeys,
        Array.from(chartLineUnitCategories),
        loadExerciseOptionsUnitCategorySecondary
      );
    }

    await updateDefaultLoadExerciseOptions();
    setSelectedExercise(undefined);
    isChartDataLoaded.current = true;
    loadExerciseChartModal.onClose();
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
        unit = " min";
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

  const showAllLinesAndAreas = () => {
    if (areAllTestLinesAndAreasRendered.current || userSettings === undefined)
      return;

    const updatedChartData: ChartDataItem[] = [...chartData];

    const highestValueMap = new Map<ChartDataExerciseCategory, number>();

    const areaKeys: ChartDataExerciseCategory[] = [
      "weight_min_111111",
      "weight_min_222222",
      "weight_min_333333",
      "weight_min_444444",
      "weight_min_555555",
      "weight_min_666666",
      "weight_min_777777",
    ];

    const lineKeys: ChartDataExerciseCategory[] = [
      "weight_max_111111",
      "weight_max_222222",
      "weight_max_333333",
      "weight_max_444444",
      "weight_max_555555",
      "weight_max_666666",
      "weight_max_777777",
    ];

    const keys = [...areaKeys, ...lineKeys];

    keys.map((key) => highestValueMap.set(key, 0));

    const currentDate = new Date("2025-01-01");
    const endDate = new Date("2025-01-10");

    while (currentDate <= endDate) {
      const newValues: Record<string, number> = {
        weight_min_111111: Math.floor(Math.random() * 201) + 1200,
        weight_min_222222: Math.floor(Math.random() * 201) + 1000,
        weight_min_333333: Math.floor(Math.random() * 201) + 800,
        weight_min_444444: Math.floor(Math.random() * 201) + 600,
        weight_min_555555: Math.floor(Math.random() * 201) + 400,
        weight_min_666666: Math.floor(Math.random() * 201) + 200,
        weight_min_777777: Math.floor(Math.random() * 200),
        weight_max_111111: Math.floor(Math.random() * 5),
        weight_max_222222: Math.floor(Math.random() * 5),
        weight_max_333333: Math.floor(Math.random() * 5),
        weight_max_444444: Math.floor(Math.random() * 5),
        weight_max_555555: Math.floor(Math.random() * 5),
        weight_max_666666: Math.floor(Math.random() * 5),
        weight_max_777777: Math.floor(Math.random() * 5),
      };

      const dateString = FormatDateToShortString(
        currentDate,
        userSettings.locale
      );

      const chartDataItem: ChartDataItem = {
        date: dateString,
      };

      for (const key in newValues) {
        chartDataItem[key as ChartDataExerciseCategory] = newValues[key];
        highestValueMap.set(
          key as ChartDataExerciseCategory,
          Math.max(
            highestValueMap.get(key as ChartDataExerciseCategory)!,
            newValues[key]
          )
        );
      }

      updatedChartData.push(chartDataItem);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const [key, value] of highestValueMap) {
      highestCategoryValues.current.set(key, value);
      chartConfig.current[key] = { label: "Test" };
      chartDataUnitMap.current.set(key, ` ${weightUnit}`);
      chartDataUnitCategoryMap.current.set(key, "Weight");
      loadedCharts.current.add(key);
    }

    updateChartDataAndFilteredHighestCategoryValues(
      updatedChartData,
      filterMinDate,
      filterMaxDate
    );

    loadChartAreas(areaKeys);
    loadChartLines(lineKeys, ["Weight"], "Weight");
    areAllTestLinesAndAreasRendered.current = true;
    isChartDataLoaded.current = true;
  };

  const toggleAllTimePeriods = () => {
    if (userSettings === undefined) return;

    const isAlreadyLoaded = referenceAreas.some(
      (obj) => obj.timePeriodId === 111111
    );

    const updatedReferenceAreas: ChartReferenceAreaItem[] = [];
    const updatedShownReferenceAreas: ChartReferenceAreaItem[] = [];

    if (!isAlreadyLoaded) {
      const referenceArea1: ChartReferenceAreaItem = {
        timePeriodId: 111111,
        x1: FormatDateToShortString(
          new Date("2025-01-01"),
          userSettings.locale
        ),
        x2: FormatDateToShortString(
          new Date("2025-01-06"),
          userSettings.locale
        ),
        label: "Test Period 1",
        startDate: "2025-01-01",
        endDate: "2025-01-06",
      };

      const referenceArea2: ChartReferenceAreaItem = {
        timePeriodId: 222222,
        x1: FormatDateToShortString(
          new Date("2025-01-02"),
          userSettings.locale
        ),
        x2: FormatDateToShortString(
          new Date("2025-01-07"),
          userSettings.locale
        ),
        label: "Test Period 2",
        startDate: "2025-01-02",
        endDate: "2025-01-07",
      };

      const referenceArea3: ChartReferenceAreaItem = {
        timePeriodId: 333333,
        x1: FormatDateToShortString(
          new Date("2025-01-03"),
          userSettings.locale
        ),
        x2: FormatDateToShortString(
          new Date("2025-01-08"),
          userSettings.locale
        ),
        label: "Test Period 3",
        startDate: "2025-01-03",
        endDate: "2025-01-08",
      };

      const referenceArea4: ChartReferenceAreaItem = {
        timePeriodId: 444444,
        x1: FormatDateToShortString(
          new Date("2025-01-04"),
          userSettings.locale
        ),
        x2: FormatDateToShortString(
          new Date("2025-01-09"),
          userSettings.locale
        ),
        label: "Test Period 4",
        startDate: "2025-01-04",
        endDate: "2025-01-09",
      };

      const referenceArea5: ChartReferenceAreaItem = {
        timePeriodId: 555555,
        x1: FormatDateToShortString(
          new Date("2025-01-05"),
          userSettings.locale
        ),
        x2: FormatDateToShortString(
          new Date("2025-01-10"),
          userSettings.locale
        ),
        label: "Test Period 5",
        startDate: "2025-01-05",
        endDate: "2025-01-10",
      };

      const referenceAreas = [
        referenceArea1,
        referenceArea2,
        referenceArea3,
        referenceArea4,
        referenceArea5,
      ];

      updatedReferenceAreas.push(...referenceAreas);
      updatedShownReferenceAreas.push(...referenceAreas);
    }

    setReferenceAreas(updatedReferenceAreas);
    setShownReferenceAreas(updatedShownReferenceAreas);
  };

  const resetChart = () => {
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
    setLoadedMeasurements(new Map());
    setDisabledLoadExerciseOptions(new Set());
    setSelectedExercise(undefined);

    chartConfig.current = { ...defaultChartConfig };
    loadedCharts.current = new Set();
    chartDataUnitMap.current = new Map(defaultChartDataUnitMap);
    chartDataUnitCategoryMap.current = new Map(defaultChartDataUnitCategoryMap);
    highestCategoryValues.current = new Map();
    filteredHighestCategoryValues.current = new Map();
    includesMultisetMap.current = new Map();
    disabledExerciseGroups.current = [];

    deleteModal.onClose();
  };

  const removeChartStat = (dataKey: ChartDataCategory) => {
    if (allChartDataCategories.size < 2 || dataKey === undefined) return;

    const updatedChartData: ChartDataItem[] = chartData.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ [dataKey]: _, ...rest }) => rest
    );

    const trimmedChartData = trimEmptyChartDataValues(updatedChartData);

    updateChartDataAndFilteredHighestCategoryValues(
      trimmedChartData,
      filterMinDate,
      filterMaxDate
    );

    const { categoryType, dataId } = getChartDataCategoryTypeAndId(dataKey);

    if (categoryType !== "no-id") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [dataKey]: _, ...updatedChartConfig } = chartConfig.current;
      chartConfig.current = updatedChartConfig;
      chartDataUnitMap.current.delete(dataKey);
      chartDataUnitCategoryMap.current.delete(dataKey);
    }

    loadedCharts.current.delete(dataKey);
    highestCategoryValues.current.delete(dataKey);
    filteredHighestCategoryValues.current.delete(dataKey);
    includesMultisetMap.current.delete(dataKey);

    if (categoryType === "measurement") {
      const updatedLoadedMeasurements = new Map(loadedMeasurements);
      updatedLoadedMeasurements.delete(dataId as number);
      setLoadedMeasurements(updatedLoadedMeasurements);
    }

    if (categoryType === "exercise-group") {
      const updatedDisabledExerciseGroups =
        disabledExerciseGroups.current.filter((item) => item !== dataId);
      disabledExerciseGroups.current = updatedDisabledExerciseGroups;
    }

    const updatedChartCommentMap = new Map<string, ChartComment[]>();

    for (const [date, chartComments] of chartCommentMap) {
      const updatedCommentList: ChartComment[] = [];

      for (const comment of chartComments) {
        const updatedComment: ChartComment = { ...comment };

        updatedComment.dataKeys.delete(dataKey);

        updatedCommentList.push(updatedComment);
      }

      if (updatedCommentList.length !== 0) {
        updatedChartCommentMap.set(date, updatedCommentList);
      }
    }

    setChartCommentMap(updatedChartCommentMap);

    const updatedChartAreas: ChartDataCategory[] = [];

    for (const area of chartDataAreas) {
      if (area !== dataKey) updatedChartAreas.push(area);
    }

    if (updatedChartAreas.length !== chartDataAreas.length) {
      // If dataKey was Chart Area

      const updatedShownChartDataAreas = shownChartDataAreas.filter(
        (item) => item !== dataKey
      );

      if (updatedChartAreas.length !== 0) {
        // If more Chart Areas exist

        if (updatedShownChartDataAreas.length === 0) {
          // If dataKey was only the shown Chart Area
          updatedShownChartDataAreas.push(updatedChartAreas[0]);
        }

        setPrimaryDataKey(updatedChartAreas[0]);
      } else {
        // If dataKey was last Chart Area

        const newChartArea = chartDataLines[0];

        updatedChartAreas.push(newChartArea);
        updatedShownChartDataAreas.push(newChartArea);

        const updatedChartDataLines = chartDataLines.filter(
          (item) => item !== newChartArea
        );
        const updatedShownChartDataLines = shownChartDataLines.filter(
          (item) => item !== newChartArea
        );

        setChartDataLines(updatedChartDataLines);
        setShownChartDataLines(updatedShownChartDataLines);

        const updatedChartLineUnitCategorySet = new Set(
          updatedShownChartDataLines.map((item) =>
            chartDataUnitCategoryMap.current.get(item)
          )
        );

        setChartLineUnitCategorySet(updatedChartLineUnitCategorySet);

        const activeUnitCategory =
          chartDataUnitCategoryMap.current.get(secondaryDataKey);

        updateRightYAxis(updatedShownChartDataLines, activeUnitCategory);
      }

      setChartDataAreas(updatedChartAreas);
      setShownChartDataAreas(updatedShownChartDataAreas);

      updateLeftYAxis(updatedShownChartDataAreas);
    } else {
      // If dataKey was Chart Line

      const updatedChartDataLines = chartDataLines.filter(
        (item) => item !== dataKey
      );
      const updatedShownChartDataLines = shownChartDataLines.filter(
        (item) => item !== dataKey
      );

      setChartDataLines(updatedChartDataLines);
      setShownChartDataLines(updatedShownChartDataLines);

      const updatedChartLineUnitCategorySet = new Set(
        updatedShownChartDataLines.map((item) =>
          chartDataUnitCategoryMap.current.get(item)
        )
      );

      setChartLineUnitCategorySet(updatedChartLineUnitCategorySet);

      const activeUnitCategory =
        chartDataUnitCategoryMap.current.get(secondaryDataKey);

      updateRightYAxis(updatedShownChartDataLines, activeUnitCategory);
    }
  };

  const getChartDataCategoryTypeAndId = (
    dataKey: ChartDataCategory
  ): { categoryType: string; dataId: number | string } => {
    // Categories with no number ids at the end
    if (
      dataKey === undefined ||
      dataKey === "calories" ||
      dataKey === "fat" ||
      dataKey === "carbs" ||
      dataKey === "protein" ||
      dataKey === "body_weight" ||
      dataKey === "body_fat_percentage"
    )
      return { categoryType: "no-id", dataId: 0 };

    const splitDataKey = dataKey.split("_");

    const dataIdIndex = splitDataKey.length - 1;

    if (splitDataKey[0] === "measurement")
      return {
        categoryType: "measurement",
        dataId: Number(splitDataKey[dataIdIndex]),
      };

    if (splitDataKey[0] === "exercise")
      // Only exercise_group categories starts with "exercise"
      return {
        categoryType: "exercise-group",
        dataId: splitDataKey[dataIdIndex],
      };

    return {
      categoryType: "exercise",
      dataId: Number(splitDataKey[dataIdIndex]),
    };
  };

  const trimEmptyChartDataValues = (chartData: ChartDataItem[]) => {
    if (chartData.length === 0) return chartData;

    const hasEmptyStart = Object.keys(chartData[0]).length === 1;
    const hasEmptyEnd =
      Object.keys(chartData[chartData.length - 1]).length === 1;

    if (!hasEmptyStart && !hasEmptyEnd) return chartData;

    const trimmedChartData = [...chartData];

    if (hasEmptyStart) {
      let trimIndex = 0;

      for (let i = 0; i < trimmedChartData.length; i++) {
        if (Object.keys(trimmedChartData[i]).length > 1) {
          trimIndex = i;
          break;
        }
      }

      trimmedChartData.splice(0, trimIndex);
    }

    if (hasEmptyEnd) {
      let trimIndex = 0;

      for (let i = trimmedChartData.length - 1; i > 0; i--) {
        if (Object.keys(trimmedChartData[i]).length > 1) {
          trimIndex = i;
          break;
        }
      }

      trimmedChartData.splice(
        trimIndex + 1,
        trimmedChartData.length - trimIndex
      );
    }

    return trimmedChartData;
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
            const category = key as Exclude<ChartDataCategory, undefined>;
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

  const handleChangeUnit = (
    newUnit: string,
    unitCategory: "Weight" | "Distance" | "Pace" | "Circumference"
  ) => {
    if (unitCategory === "Weight") {
      if (newUnit === weightUnit) return;

      changeUnitInChartData(
        newUnit,
        weightUnit,
        weightCharts,
        ConvertWeightValue
      );

      setWeightUnit(newUnit);
    }

    if (unitCategory === "Distance") {
      if (newUnit === distanceUnit) return;

      changeUnitInChartData(
        newUnit,
        distanceUnit,
        distanceCharts,
        ConvertDistanceValue
      );

      setDistanceUnit(newUnit);
    }

    if (unitCategory === "Pace") {
      if (newUnit === paceUnit) return;

      changeUnitInChartData(newUnit, paceUnit, paceCharts, ConvertPaceValue);

      setPaceUnit(newUnit);
    }

    if (unitCategory === "Circumference") {
      if (newUnit === circumferenceUnit) return;

      changeUnitInChartData(
        newUnit,
        circumferenceUnit,
        circumferenceCharts,
        ConvertMeasurementValue
      );

      setCircumferenceUnit(newUnit);
    }
  };

  const changeUnitInChartData = (
    newUnit: string,
    oldUnit: string,
    categoryChart: Set<Exclude<ChartDataCategory, undefined>>,
    conversionFunction: (
      value: number,
      currentUnit: string,
      newUnit: string
    ) => number
  ) => {
    const updatedChartData: ChartDataItem[] = [];

    for (const chartDataItem of chartData) {
      const chartNames: ChartDataCategory[] = Object.keys(chartDataItem).filter(
        (key) => key !== "date"
      ) as ChartDataCategory[];

      const newChartDataItem: ChartDataItem = { ...chartDataItem };

      for (const chart of chartNames) {
        if (chart === undefined) continue;

        if (categoryChart.has(chart)) {
          const oldValue = newChartDataItem[chart] ?? 0;

          const updatedValue = conversionFunction(oldValue, oldUnit, newUnit);

          newChartDataItem[chart] = ConvertNumberToTwoDecimals(updatedValue);
        }
      }

      updatedChartData.push(newChartDataItem);
    }

    for (const chart of categoryChart) {
      chartDataUnitMap.current.set(chart, ` ${newUnit}`);
    }

    updateChartDataAndFilteredHighestCategoryValues(
      updatedChartData,
      filterMinDate,
      filterMaxDate
    );
  };

  const handleLoadNumExerciseGroupSetsClick = async (loadPrimary: boolean) => {
    await handleOpenListModal("exercise-groups");

    setLoadChartAsArea(loadPrimary);
  };

  const loadNumExerciseGroupSets = async () => {
    if (selectedExerciseGroups.length === 0 || userSettings === undefined)
      return;

    const exerciseMultiplierMap = getExerciseMultiplierMap();

    if (exerciseMultiplierMap.size === 0) {
      for (const group of selectedExerciseGroups) {
        loadedCharts.current.add(`exercise_group_${group}`);
        disabledExerciseGroups.current.push(group);
      }

      setSelectedExerciseGroups([]);
      toast.error(
        "No Exercises With Selected Exercise Group(s) Have Been Completed"
      );
      listModal.onClose();
      return;
    }

    const loadedChartData: ChartDataItem[] = [];

    const dateMap = new Map<string, Map<string, number>>();

    const highestValueMap = new Map<ChartDataCategory, number>();

    const chartDataKeys: Set<ChartDataCategory> = new Set();

    for (const group of selectedExerciseGroups) {
      const chartName: ChartDataCategory = `exercise_group_${group}`;
      highestValueMap.set(chartName, 0);
      chartDataKeys.add(chartName);
    }

    for (const [id, multiplierMap] of exerciseMultiplierMap) {
      const setList = await GetTimeCompletedForSetsWithExerciseId(id);

      for (const set of setList) {
        const date = FormatDateToShortString(
          new Date(set.time_completed!),
          userSettings.locale
        );

        if (dateMap.has(date)) {
          const existingMultiplierMap = dateMap.get(date)!;

          for (const [group, multiplier] of multiplierMap) {
            if (existingMultiplierMap.has(group)) {
              // Update existing value (Number of Sets with multiplier)
              // for specific Exercise Group
              const currentNum = existingMultiplierMap.get(group)!;
              const newNum = ConvertNumberToTwoDecimals(
                currentNum + multiplier
              );
              existingMultiplierMap.set(group, newNum);
            } else {
              // Add the value (Number of Sets with multiplier) if
              // Exercise Group has no values for this date
              existingMultiplierMap.set(group, multiplier);
            }
          }
        } else {
          dateMap.set(date, new Map(multiplierMap));
        }
      }
    }

    for (const [date, setCountMap] of dateMap) {
      const chartDataItem: ChartDataItem = {
        date,
      };

      for (const [group, setCount] of setCountMap) {
        const chartName: ChartDataCategory = `exercise_group_${group}`;

        if (setCount > highestValueMap.get(chartName)!) {
          highestValueMap.set(chartName, setCount);
        }

        chartDataItem[chartName] = setCount;
      }

      loadedChartData.push(chartDataItem);
    }

    // Filter out categories with no values
    const updatedHighestValueMap = new Map(
      Array.from(highestValueMap).filter(([, value]) => value > 0)
    );

    // Sort by date, since Sets from GetTimeCompletedForSetsWithExerciseId are not sorted
    const sortedLoadedChartData = loadedChartData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const filledInChartData = fillInMissingDates(
      sortedLoadedChartData,
      userSettings.locale
    );

    const mergedChartData = mergeChartData(
      filledInChartData,
      chartData,
      userSettings.locale
    );

    highestCategoryValues.current = new Map([
      ...highestCategoryValues.current,
      ...updatedHighestValueMap,
    ]);

    updateChartDataAndFilteredHighestCategoryValues(
      mergedChartData,
      filterMinDate,
      filterMaxDate
    );

    const primaryDataKeys: ChartDataCategory[] = [];
    const secondaryDataKeys: ChartDataCategory[] = [];

    const unitCategory = "Number Of Reps";

    for (const group of selectedExerciseGroups) {
      const chartName: ChartDataCategory = `exercise_group_${group}`;

      if (loadedCharts.current.has(chartName)) continue;

      loadedCharts.current.add(chartName);

      if (!updatedHighestValueMap.has(chartName)) continue;

      chartDataUnitCategoryMap.current.set(chartName, unitCategory);

      const exerciseGroupName = exerciseGroupDictionary.get(group)!;

      chartConfig.current[chartName] = {
        label: `Number Of ${exerciseGroupName} Sets`,
      };

      chartDataUnitMap.current.set(chartName, " reps");

      if (loadChartAsArea) {
        primaryDataKeys.push(chartName);
      } else {
        secondaryDataKeys.push(chartName);
      }
    }

    if (loadChartAsArea) {
      loadChartAreas(primaryDataKeys);
    } else {
      loadChartLines(secondaryDataKeys, [unitCategory], unitCategory);
    }

    setSelectedExerciseGroups([]);
    disabledExerciseGroups.current.push(...selectedExerciseGroups);
    isChartDataLoaded.current = true;
    listModal.onClose();
  };

  const getExerciseMultiplierMap = () => {
    const exerciseMultiplierMap = new Map<number, Map<string, number>>();

    for (const exercise of exercises) {
      for (const group of selectedExerciseGroups) {
        const multiplierMap = new Map<string, number>();

        if (exercise.exerciseGroupStringSetPrimary!.has(group)) {
          multiplierMap.set(group, 1);
        }

        if (
          includeSecondaryGroups &&
          exercise.exerciseGroupStringMapSecondary &&
          exercise.exerciseGroupStringMapSecondary.has(group)
        ) {
          const value = countSecondaryExerciseGroupsAsOne
            ? 1
            : Number(exercise.exerciseGroupStringMapSecondary!.get(group));

          multiplierMap.set(group, value);
        }

        if (multiplierMap.size > 0) {
          exerciseMultiplierMap.set(exercise.id, multiplierMap);
        }
      }
    }

    return exerciseMultiplierMap;
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
                  : listModalPage === "time-period-list"
                  ? "Select Time Period"
                  : "Select Exercise Groups"}
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
                    isInAnalyticsPage
                  />
                ) : listModalPage === "time-period-list" ? (
                  <TimePeriodModalList
                    useTimePeriodList={timePeriodList}
                    handleTimePeriodClick={handleClickTimePeriod}
                    userSettings={userSettings}
                    setUserSettings={setUserSettings}
                    customHeightString="h-[440px]"
                    hiddenTimePeriods={timePeriodIdSet}
                  />
                ) : (
                  <div className="h-[360px] flex flex-col gap-4">
                    <ExerciseGroupCheckboxes
                      isValid={true}
                      value={selectedExerciseGroups}
                      handleChange={setSelectedExerciseGroups}
                      exerciseGroupDictionary={exerciseGroupDictionary}
                      includeSecondaryGroups={includeSecondaryGroups}
                      setIncludeSecondaryGroups={setIncludeSecondaryGroups}
                      disabledKeys={disabledExerciseGroups.current}
                    />
                    {includeSecondaryGroups && (
                      <RadioGroup
                        label="Handle Secondary Exercise Groups"
                        classNames={{ base: "gap-1", wrapper: "gap-1" }}
                        value={
                          countSecondaryExerciseGroupsAsOne
                            ? "one"
                            : "accumulate"
                        }
                        onValueChange={(value) =>
                          setCountSecondaryExerciseGroupsAsOne(value === "one")
                        }
                      >
                        <Radio value="accumulate">
                          Accumulate Secondary Fractional Values
                        </Radio>
                        <Radio value="one">
                          Count Secondary As One Full Set
                        </Radio>
                      </RadioGroup>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                {listModalPage === "exercise-groups" && (
                  <Button
                    color="primary"
                    isDisabled={selectedExerciseGroups.length === 0}
                    onPress={loadNumExerciseGroupSets}
                  >
                    Load
                  </Button>
                )}
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
        loadExerciseOptionsUnitCategoryPrimary={
          loadExerciseOptionsUnitCategoryPrimary
        }
        setLoadExerciseOptionsUnitCategoryPrimary={
          setLoadExerciseOptionsUnitCategoryPrimary
        }
        loadExerciseOptionsUnitCategorySecondary={
          loadExerciseOptionsUnitCategorySecondary
        }
        setLoadExerciseOptionsUnitCategorySecondary={
          setLoadExerciseOptionsUnitCategorySecondary
        }
        loadExerciseOptionsUnitCategoriesPrimary={
          loadExerciseOptionsUnitCategoriesPrimary
        }
        setLoadExerciseOptionsUnitCategoriesPrimary={
          setLoadExerciseOptionsUnitCategoriesPrimary
        }
        loadExerciseOptionsUnitCategoriesSecondary={
          loadExerciseOptionsUnitCategoriesSecondary
        }
        setLoadExerciseOptionsUnitCategoriesSecondary={
          setLoadExerciseOptionsUnitCategoriesSecondary
        }
        chartDataAreas={chartDataAreas}
        chartDataUnitCategoryMap={chartDataUnitCategoryMap.current}
        loadExerciseOptionsMap={loadExerciseOptionsMap}
        secondaryDataUnitCategory={secondaryDataUnitCategory}
        loadExerciseStats={loadExerciseStats}
      />
      <FilterMinAndMaxDatesModal
        filterMinAndMaxDatesModal={filterMinAndMaxDatesModal}
        locale={userSettings.locale}
        validStartDate={chartStartDate}
        validEndDate={chartEndDate}
        doneButtonAction={updateCustomMinAndMaxDatesFilter}
      />
      <FilterExerciseGroupsModal
        useExerciseList={exerciseList}
        useFilterExerciseList={filterExerciseList}
      />
      <DeleteModal
        deleteModal={deleteModal}
        header="Reset Chart"
        body={
          <p>
            Are you sure you want to completely remove all values from chart?
          </p>
        }
        deleteButtonAction={() => resetChart()}
        deleteButtonText="Reset"
      />
      <div className="absolute left-0 w-screen gap-2">
        {isChartDataLoaded.current && (
          <div className="flex gap-1.5 mx-1">
            <div className="flex flex-col gap-1 w-[12.25rem]"></div>
            <ChartContainer
              config={chartConfig.current}
              className="grow bg-default-50 pt-4 pb-1.5 rounded-xl"
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
                      chartIncludesMultisetMap={includesMultisetMap.current}
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
                    {chartConfig.current[area ?? "default"].label}
                  </SelectItem>
                ))}
              </Select>
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
                isDisabled={chartDataLines.length === 0}
              >
                {chartDataLines.map((line) => (
                  <SelectItem key={line} value={line}>
                    {chartConfig.current[line ?? "default"].label}
                  </SelectItem>
                ))}
              </Select>
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
                  updateRightYAxis(
                    shownChartDataLines,
                    e.target.value as ChartDataUnitCategory
                  )
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
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    className="font-medium"
                    variant="flat"
                    isDisabled={chartDataAreas.length === 0}
                  >
                    Convert Area To Line
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Chart data areas" variant="flat">
                  {chartDataAreas.map((area) => (
                    <DropdownItem
                      key={area as string}
                      onPress={() => changeChartDataAreaToLine(area)}
                    >
                      {chartConfig.current[area ?? "default"].label}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    className="font-medium"
                    variant="flat"
                    isDisabled={chartDataLines.length === 0}
                  >
                    Convert Line To Area
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Chart data lines" variant="flat">
                  {chartDataLines.map((line) => (
                    <DropdownItem
                      key={line as string}
                      onPress={() => changeChartDataLineToArea(line)}
                    >
                      {chartConfig.current[line ?? "default"].label}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    className="font-medium"
                    variant="flat"
                    isDisabled={chartLineUnitCategorySet.size === 0}
                  >
                    Change Area Category
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Chart data line unit categories"
                  variant="flat"
                >
                  {Array.from(chartLineUnitCategorySet).map((category) => (
                    <DropdownItem
                      key={category as string}
                      onPress={() =>
                        changeChartDataLineCategoryToArea(category)
                      }
                    >
                      {category}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Select
                label="Shown Time Periods"
                size="sm"
                variant="faded"
                selectionMode="multiple"
                selectedKeys={shownTimePeriodIdSet}
                onSelectionChange={(keys) =>
                  updateShownReferenceAreas(new Set(keys) as Set<string>)
                }
                isDisabled={referenceAreas.length === 0}
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
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    className="font-medium"
                    variant="flat"
                    color={
                      filterMinDate || filterMaxDate ? "secondary" : "default"
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
                            onPress={() => updateMinDateFilter(date)}
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
                  onClose={() => updateMinDateFilter(null)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="font-semibold">Min Date: </span>
                  {FormatDateToShortString(filterMinDate, userSettings.locale)}
                </Chip>
              )}
              {filterMaxDate !== null && (
                <Chip
                  classNames={{ content: "w-[10.625rem]" }}
                  radius="sm"
                  color="secondary"
                  variant="flat"
                  onClose={() => updateMaxDateFilter(null)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="font-semibold">Max Date: </span>
                  {FormatDateToShortString(filterMaxDate, userSettings.locale)}
                </Chip>
              )}
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    className="font-medium"
                    variant="flat"
                    color="danger"
                    isDisabled={allChartDataCategories.size < 2}
                  >
                    Remove Chart Stat
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Chart data lines" variant="flat">
                  {Array.from(allChartDataCategories).map((dataKey) => (
                    <DropdownItem
                      key={dataKey as string}
                      onPress={() => removeChartStat(dataKey)}
                    >
                      {chartConfig.current[dataKey ?? "default"].label}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-2 w-[960px]">
            <Button
              className="font-medium"
              variant="flat"
              color="secondary"
              onPress={() => handleOpenListModal("exercise-list")}
            >
              Load Exercise Stat
            </Button>
            <Dropdown>
              <DropdownTrigger>
                <Button className="font-medium" variant="flat">
                  Load Other Stat As Area
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
                  onPress={() => loadUserWeightListWeights(weightUnit, true)}
                >
                  Body Weights
                </DropdownItem>
                <DropdownItem
                  key="user-weights-body-fat"
                  onPress={() => loadUserWeightListBodyFat(true)}
                >
                  Body Fat Percentages
                </DropdownItem>
                <DropdownItem
                  key="diet-logs-calories"
                  onPress={() => loadDietLogListCalories(true)}
                >
                  Calories
                </DropdownItem>
                <DropdownItem
                  key="fat"
                  onPress={() => loadDietLogListMacros(false, "fat")}
                >
                  Fat
                </DropdownItem>
                <DropdownItem
                  key="carbs"
                  onPress={() => loadDietLogListMacros(false, "carbs")}
                >
                  Carbs
                </DropdownItem>
                <DropdownItem
                  key="protein"
                  onPress={() => loadDietLogListMacros(false, "protein")}
                >
                  Protein
                </DropdownItem>
                <DropdownItem
                  key="exercise-group"
                  onPress={() => handleLoadNumExerciseGroupSetsClick(true)}
                >
                  Sets Per Exercise Group
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="font-medium"
                  variant="flat"
                  isDisabled={chartDataAreas.length === 0}
                >
                  Load Other Stat As Line
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
                  onPress={() => loadUserWeightListWeights(weightUnit, false)}
                >
                  Body Weights
                </DropdownItem>
                <DropdownItem
                  key="user-weights-body-fat"
                  onPress={() => loadUserWeightListBodyFat(false)}
                >
                  Body Fat Percentages
                </DropdownItem>
                <DropdownItem
                  key="diet-logs-calories"
                  onPress={() => loadDietLogListCalories(false)}
                >
                  Calories
                </DropdownItem>
                <DropdownItem
                  key="fat"
                  onPress={() => loadDietLogListMacros(false, "fat")}
                >
                  Fat
                </DropdownItem>
                <DropdownItem
                  key="carbs"
                  onPress={() => loadDietLogListMacros(false, "carbs")}
                >
                  Carbs
                </DropdownItem>
                <DropdownItem
                  key="protein"
                  onPress={() => loadDietLogListMacros(false, "protein")}
                >
                  Protein
                </DropdownItem>
                <DropdownItem
                  key="exercise-group"
                  onPress={() => handleLoadNumExerciseGroupSetsClick(false)}
                >
                  Sets Per Exercise Group
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            {isChartDataLoaded.current && (
              <>
                <Button
                  className="font-medium"
                  variant="flat"
                  onPress={() => handleOpenListModal("time-period-list")}
                >
                  Load Time Period
                </Button>
                <Button
                  className="font-medium"
                  variant="flat"
                  color="danger"
                  onPress={() => deleteModal.onOpen()}
                >
                  Reset Chart
                </Button>
              </>
            )}
            {weightCharts.size > 0 && (
              <div className="pb-px">
                <WeightUnitDropdown
                  value={weightUnit}
                  targetType="chart"
                  changeUnitInChart={handleChangeUnit}
                  customLabel="Weight Unit"
                  customWidthString="w-[5rem]"
                  isSmall
                />
              </div>
            )}
            {distanceCharts.size > 0 && (
              <div className="pb-px">
                <DistanceUnitDropdown
                  value={distanceUnit}
                  targetType="chart"
                  changeUnitInChart={handleChangeUnit}
                  customLabel="Distance Unit"
                  customWidthString="w-[5.5rem]"
                  isSmall
                />
              </div>
            )}
            {paceCharts.size > 0 && (
              <div className="pb-px">
                <PaceUnitDropdown
                  value={paceUnit}
                  targetType="chart"
                  changeUnitInChart={handleChangeUnit}
                />
              </div>
            )}
            {circumferenceCharts.size > 0 && (
              <div className="pb-px">
                <MeasurementUnitDropdown
                  value={circumferenceUnit}
                  targetType="chart"
                  changeUnitInChart={handleChangeUnit}
                  customWidthString="w-[7.5rem]"
                  customLabel="Circumference Unit"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2 relative">
            <Button
              className="font-medium"
              variant="flat"
              onPress={() => setShowTestButtons(!showTestButtons)}
            >
              Toggle Test Buttons
            </Button>
            {showTestButtons && (
              <div className="absolute left-[10.875rem] flex items-center gap-2">
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
                  onPress={addTestLine}
                >
                  Add Test Line
                </Button>
                <Button
                  className="font-medium"
                  variant="flat"
                  onPress={toggleTestTimePeriod}
                >
                  Toggle Test Time Period
                </Button>
                <Button
                  className="font-medium"
                  variant="flat"
                  onPress={showAllLinesAndAreas}
                >
                  Show All Lines And Areas
                </Button>
                <Button
                  className="font-medium"
                  variant="flat"
                  onPress={toggleAllTimePeriods}
                >
                  Toggle All Time Periods
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
