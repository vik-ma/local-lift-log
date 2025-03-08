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
  ChartReferenceAreaItem,
  Exercise,
  LoadedChartType,
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

type ListModalPage = "exercise-list" | "measurement-list" | "time-period-list";

type ChartDataItem = {
  date: string;
} & {
  [key in Exclude<ChartDataCategory, undefined>]?: number;
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
  const [referenceAreas, setReferenceAreas] = useState<
    ChartReferenceAreaItem[]
  >([]);
  const [shownReferenceAreas, setShownReferenceAreas] = useState<
    ChartReferenceAreaItem[]
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

  const [showTestButtons, setShowTestButtons] = useState<boolean>(false);

  const highestCategoryValues = useRef<Map<ChartDataCategory, number>>(
    new Map()
  );

  const dateMap = useChartDateMap();

  const validCircumferenceUnits = new Set(ValidMeasurementUnits());

  const { timePeriodIdSet, shownTimePeriodIdSet } = useChartTimePeriodIdSets(
    referenceAreas,
    shownReferenceAreas
  );

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
  const deleteModal = useDisclosure();

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
        setWeightUnit(userSettings.default_unit_weight);
        setDistanceUnit(userSettings.default_unit_distance);
        setCircumferenceUnit(userSettings.default_unit_measurement);

        chartDataUnitMap.current.set(
          "body_weight",
          ` ${userSettings.default_unit_weight}`
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

  const loadDietLogListCalories = async (loadPrimary: boolean) => {
    if (
      loadedCharts.current.has("diet-logs-calories") ||
      userSettings === undefined
    )
      return;

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

    setChartData(mergedChartData);

    highestCategoryValues.current.set("calories", highestValue);

    if (loadPrimary) {
      loadChartAreas(["calories"]);
    } else {
      loadChartLines(["calories"], ["Calories"], "Calories");
    }

    loadedCharts.current.add("diet-logs-calories");
  };

  const loadDietLogListMacros = async (loadPrimary: boolean) => {
    if (
      loadedCharts.current.has("diet-logs-macros") ||
      userSettings === undefined
    )
      return;

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

    const dataKeys: ChartDataCategory[] = Array.from(
      updatedHighestValueMap.keys()
    );

    if (loadPrimary) {
      loadChartAreas(dataKeys);
    } else {
      // All macro dataKeys will work, even if they have no values loaded
      loadChartLines(dataKeys, ["Macros"], "Macros");
    }

    loadedCharts.current.add("diet-logs-macros");
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
    if (
      chartDataAreas.includes("weight_min_0") ||
      chartDataLines.includes("weight_min_0")
    )
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

    setChartData(updatedChartData);
    setChartDataAreas([...chartDataAreas, "weight_min_0"]);

    const updatedShownChartDataAreas: ChartDataCategory[] = [
      ...shownChartDataAreas,
      "weight_min_0",
    ];

    updateLeftYAxis(updatedShownChartDataAreas);
  };

  const removeTestArea = () => {
    // Remove the test prop from chartData
    const updatedChartData: ChartDataItem[] = chartData.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ weight_min_0, ...rest }) => rest
    );

    const updatedChartDataAreas: ChartDataCategory[] = chartDataAreas.filter(
      (item) => item !== "weight_min_0"
    );

    const updatedShownChartDataAreas: ChartDataCategory[] =
      shownChartDataAreas.filter((item) => item !== "weight_min_0");

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
    if (
      chartDataAreas.includes("weight_min_0") ||
      chartDataLines.includes("weight_min_0")
    )
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

    setChartData(updatedChartData);
    setChartDataLines([...chartDataLines, "weight_min_0"]);

    const updatedShownChartDataLines: ChartDataCategory[] = [
      ...shownChartDataLines,
      "weight_min_0",
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

    const activeUnitCategory =
      chartDataUnitCategoryMap.current.get(secondaryDataKey);

    updateRightYAxis(updatedShownChartDataLines, activeUnitCategory);
  };

  const removeTestLine = () => {
    // Remove the test prop from chartData
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updatedChartData = chartData.map(({ weight_min_0, ...rest }) => rest);

    const updatedChartDataLines = chartDataLines.filter(
      (item) => item !== "weight_min_0"
    );

    setChartData(updatedChartData);
    setChartDataLines(updatedChartDataLines);

    highestCategoryValues.current.delete("weight_min_0");

    if (updatedChartDataLines.length === 0) {
      setSecondaryDataUnitCategory(undefined);
      setChartLineUnitCategorySet(new Set());
    }

    hideChartLine("weight_min_0");
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
    if (
      loadedCharts.current.has("user-weights-weight") ||
      userSettings === undefined
    )
      return;

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

    setChartData(mergedChartData);

    highestCategoryValues.current.set("body_weight", highestValue);

    if (loadPrimary) {
      loadChartAreas(["body_weight"]);
    } else {
      loadChartLines(["body_weight"], ["Weight"], "Weight");
    }

    loadedCharts.current.add("user-weights-weight");
  };

  const loadUserWeightListBodyFat = async (loadPrimary: boolean) => {
    if (
      loadedCharts.current.has("user-weights-body-fat") ||
      userSettings === undefined
    )
      return;

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
      loadedCharts.current.add("user-weights-body-fat");
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

    setChartData(mergedChartData);

    highestCategoryValues.current.set("body_fat_percentage", highestValue);

    if (loadPrimary) {
      loadChartAreas(["body_fat_percentage"]);
    } else {
      loadChartLines(["body_fat_percentage"], ["Body Fat %"], "Body Fat %");
    }

    loadedCharts.current.add("user-weights-body-fat");
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
      highestCategoryValues.current.set(measurementIdString, highestValue);

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

    const fullSetList = await GetCompletedSetsWithExerciseId(exerciseId);

    if (fullSetList.length === 0) return;

    const loadedChartData: ChartDataItem[] = [];

    const dateMap = new Map<string, WorkoutSet[]>();

    const highestValueMap = new Map<ChartDataExerciseCategory, number>();

    const { areCommentsAlreadyLoaded, updatedChartCommentMap } =
      UpdateChartCommentMapForExercise(
        loadExerciseOptions,
        exerciseId,
        loadedCharts.current,
        chartCommentMap,
        loadExerciseOptionsMap
      );

    const commentDataKeys: Set<ChartDataCategory> = new Set();

    for (const option of loadExerciseOptions) {
      const chartName: ChartDataExerciseCategory = `${option}_${exerciseId}`;
      highestValueMap.set(chartName, -1);
      commentDataKeys.add(chartName);
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
      const { analyticsValuesMap, commentMap } = GetAnalyticsValuesForSetList(
        setList,
        loadExerciseOptions,
        weightUnit,
        distanceUnit
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

      if (!areCommentsAlreadyLoaded) {
        for (const [setNum, comment] of commentMap) {
          const commentLabel = `Set ${setNum} Comment`;

          addChartComment(
            updatedChartCommentMap,
            date,
            commentDataKeys,
            commentLabel,
            comment
          );
        }
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

  const showAllLinesAndAreas = () => {
    if (
      chartDataAreas.includes("weight_min_111111") ||
      userSettings === undefined
    )
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

    setChartData(updatedChartData);

    loadChartAreas(areaKeys);
    loadChartLines(lineKeys, ["Weight"], "Weight");
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
    setChartData([]);
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

    highestCategoryValues.current = new Map();
    loadedCharts.current = new Set();
    chartDataUnitMap.current = new Map(defaultChartDataUnitMap);
    chartDataUnitCategoryMap.current = new Map(defaultChartDataUnitCategoryMap);
    chartConfig.current = { ...defaultChartConfig };

    deleteModal.onClose();
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
        doneButtonAction={setCustomMinAndMaxDatesFilter}
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
      <div className="flex flex-col items-center gap-2">
        {loadedCharts.current.size > 0 && (
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
                        {chartConfig.current[line ?? "default"].label}
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
                )}
                {chartDataAreas.length > 1 && (
                  <Dropdown>
                    <DropdownTrigger>
                      <Button className="font-medium" variant="flat">
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
                )}
                {chartDataLines.length > 0 && (
                  <Dropdown>
                    <DropdownTrigger>
                      <Button className="font-medium" variant="flat">
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
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between w-[960px]">
            <div className="flex items-center gap-2">
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
                    key="diet-logs-macros"
                    onPress={() => loadDietLogListMacros(true)}
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
                    key="diet-logs-macros"
                    onPress={() => loadDietLogListMacros(false)}
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
              {loadedCharts.current.size > 0 && (
                <Button
                  className="font-medium"
                  variant="flat"
                  color="danger"
                  onPress={() => deleteModal.onOpen()}
                >
                  Reset Chart
                </Button>
              )}
            </div>
            <Button
              className="font-medium"
              variant="flat"
              color="danger"
              onPress={() => setShowTestButtons(!showTestButtons)}
            >
              Toggle Test Buttons
            </Button>
          </div>
          {showTestButtons && (
            <div className="flex flex-col gap-2">
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
              <div className="flex items-center gap-2">
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
            </div>
          )}
        </div>
      </div>
    </>
  );
}
