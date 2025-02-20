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
  useMeasurementList,
  useTimePeriodList,
} from "../hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ExerciseModalList,
  FilterExerciseGroupsModal,
  FilterMinAndMaxDatesModal,
  LoadingSpinner,
  MeasurementModalList,
  TimePeriodModalList,
} from "../components";
import { TimePeriod, UserSettings } from "../typings";
import {
  ConvertDateToYmdString,
  ConvertISODateStringToYmdDateString,
  ConvertWeightValue,
  CreateShownPropertiesSet,
  FormatDateToShortString,
  GetAllDietLogs,
  GetAllUserWeights,
  GetCurrentYmdDateString,
  GetUserSettings,
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

type ModalListType = "exercise" | "measurement" | "time-period";

type ChartDataItem = {
  date: string;
  calories?: number;
  fat?: number | null;
  carbs?: number | null;
  protein?: number | null;
  body_weight?: number | null;
  body_fat_percentage?: number | null;
  test?: number;
};

// TODO: MOVE TO typings.ts LATER
export type ChartDataCategory =
  | undefined
  | "calories"
  | "fat"
  | "carbs"
  | "protein"
  | "body_weight"
  | "body_fat_percentage"
  | "test";

type ChartDataUnitCategory =
  | undefined
  | "Calories"
  | "Macros"
  | "Weight"
  | "Body Fat %";

type ReferenceAreaItem = {
  timePeriodId: number;
  x1: string;
  x2: string;
  label: string;
  startDate: string;
  endDate: string | null;
};

type LoadedListType =
  | "diet-logs-calories"
  | "diet-logs-macros"
  | "user-weights-weight"
  | "user-weights-body-fat";

// TODO: MOVE TO typings.ts LATER
export type ChartComment = {
  dataKeys: Set<ChartDataCategory>;
  label: string;
  comment: string;
};

export default function AnalyticsIndex() {
  const [modalListType, setModalListType] = useState<ModalListType>("exercise");
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
  // const [distanceUnit, setDistanceUnit] = useState<string>("km");
  const [chartCommentMap, setChartCommentMap] = useState<
    Map<string, ChartComment[]>
  >(new Map());
  const [chartStartDate, setChartStartDate] = useState<Date | null>(null);
  const [chartEndDate, setChartEndDate] = useState<Date | null>(null);
  const [filterMinDate, setFilterMinDate] = useState<Date | null>(null);
  const [filterMaxDate, setFilterMaxDate] = useState<Date | null>(null);

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

  // const chartDataCategorySet: Set<ChartDataCategory> = useMemo(() => {
  //   if (chartData.length === 0) return new Set<ChartDataCategory>();

  //   return new Set(
  //     Object.getOwnPropertyNames(chartData[0]).filter((item) => item !== "date")
  //   ) as Set<ChartDataCategory>;
  // }, [chartData]);

  // TODO: REMOVE?
  // const chartDataAreaSet = useMemo(
  //   () => new Set<ChartDataCategory>(chartDataAreas),
  //   [chartDataAreas]
  // );

  // const chartDataLineSet = useMemo(
  //   () => new Set<ChartDataCategory>(chartDataLines),
  //   [chartDataLines]
  // );

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

  const loadedLists = useRef<Set<LoadedListType>>(new Set());

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
  const filterMinAndMaxDatesModal = useDisclosure();

  const exerciseList = useExerciseList(false, true, true);

  const { isExerciseListLoaded, getExercises } = exerciseList;

  const filterExerciseList = useFilterExerciseList(exerciseList);

  const measurementList = useMeasurementList(false);

  const { isMeasurementListLoaded, getMeasurements } = measurementList;

  const timePeriodList = useTimePeriodList();

  const {
    getTimePeriods,
    isTimePeriodListLoaded,
    setSelectedTimePeriodProperties,
  } = timePeriodList;

  const chartDataCategoryLabelMap = useMemo(() => {
    const categoryMap = new Map<ChartDataCategory, string>();

    categoryMap.set("calories", "Calories");
    categoryMap.set("fat", "Fat");
    categoryMap.set("carbs", "Carbs");
    categoryMap.set("protein", "Protein");
    categoryMap.set("body_weight", "Body Weight");
    categoryMap.set("body_fat_percentage", "Body Fat %");
    categoryMap.set("test", "Test");

    return categoryMap;
  }, []);

  const chartDataUnitMap = useMemo(() => {
    const unitMap = new Map<ChartDataCategory, string>();

    unitMap.set("calories", " kcal");
    unitMap.set("fat", " g");
    unitMap.set("carbs", " g");
    unitMap.set("protein", " g");
    unitMap.set("body_weight", ` ${weightUnit}`);
    unitMap.set("body_fat_percentage", " %");
    unitMap.set("test", ` ${weightUnit}`);

    return unitMap;
  }, [weightUnit]);

  const chartDataUnitCategoryMap = useMemo(() => {
    const unitCategoryMap = new Map<ChartDataCategory, ChartDataUnitCategory>();

    unitCategoryMap.set("calories", "Calories");
    unitCategoryMap.set("fat", "Macros");
    unitCategoryMap.set("carbs", "Macros");
    unitCategoryMap.set("protein", "Macros");
    unitCategoryMap.set("body_weight", "Weight");
    unitCategoryMap.set("body_fat_percentage", "Body Fat %");
    unitCategoryMap.set("test", "Weight");

    return unitCategoryMap;
  }, []);

  const chartConfig: ChartConfig = useMemo(() => {
    return {
      calories: {
        label: chartDataCategoryLabelMap.get("calories"),
      },
      fat: { label: chartDataCategoryLabelMap.get("fat") },
      carbs: { label: chartDataCategoryLabelMap.get("carbs") },
      protein: { label: chartDataCategoryLabelMap.get("protein") },
      body_weight: { label: chartDataCategoryLabelMap.get("body_weight") },
      body_fat_percentage: {
        label: chartDataCategoryLabelMap.get("body_fat_percentage"),
      },
      test: { label: chartDataCategoryLabelMap.get("test") },
    };
  }, [chartDataCategoryLabelMap]);

  const chartLineColorList = useMemo(() => {
    return ["#6b80ed", "#e6475a", "#56db67", "#cf820e", "#8739cf", "#525252"];
  }, []);

  const chartAreaColorList = useMemo(() => {
    return [
      "#edc345",
      "#a8a29e",
      "#7d8db6",
      "#c5bcb5",
      "#b8a9c9",
      "#a5b4ac",
      "#d4a5a5",
      "#b1a89f",
    ];
  }, []);

  const referenceAreaColorList = useMemo(() => {
    return ["#2862cc", "#26be21", "#ff3ba7", "#c93814", "#1ab2f8"];
  }, []);

  useEffect(
    () => {
      const loadUserSettings = async () => {
        const userSettings = await GetUserSettings();

        if (userSettings === undefined) return;

        setUserSettings(userSettings);
        setWeightUnit(userSettings.default_unit_weight);
        // setDistanceUnit(userSettings.default_unit_distance);

        getDietLogList(userSettings.locale, true, true);
        // getUserWeightListWeights(
        //   userSettings.locale,
        //   userSettings.default_unit_weight,
        //   true
        // );
      };

      loadUserSettings();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleOpenListModal = async (modalListType: ModalListType) => {
    if (userSettings === undefined) return;

    setModalListType(modalListType);

    if (modalListType === "exercise" && !isExerciseListLoaded.current) {
      await getExercises();
    }

    if (modalListType === "measurement" && !isMeasurementListLoaded.current) {
      await getMeasurements();
    }

    if (modalListType === "time-period" && !isTimePeriodListLoaded.current) {
      await getTimePeriods(userSettings.locale);

      const timePeriodPropertySet = CreateShownPropertiesSet(
        userSettings.shown_time_period_properties,
        "time-period"
      );

      setSelectedTimePeriodProperties(timePeriodPropertySet);
    }

    listModal.onOpen();
  };

  const getDietLogList = async (
    locale: string,
    loadCaloriesPrimary: boolean,
    loadOnlyCalories: boolean
  ) => {
    const areCaloriesAlreadyLoaded =
      loadedLists.current.has("diet-logs-calories");

    if (
      areCaloriesAlreadyLoaded &&
      (loadOnlyCalories || loadedLists.current.has("diet-logs-macros"))
    )
      return;

    const dietLogs = await GetAllDietLogs(true);

    if (dietLogs.length === 0) {
      toast.error("No Diet Logs Entries Recorded");
      return;
    }

    const loadedChartData: ChartDataItem[] = [];

    const highestValueMap = new Map<ChartDataCategory, number>();
    highestValueMap.set("calories", 0);
    highestValueMap.set("fat", -1);
    highestValueMap.set("carbs", -1);
    highestValueMap.set("protein", -1);

    const updatedChartCommentMap = new Map(chartCommentMap);

    for (const dietLog of dietLogs) {
      const date = FormatDateToShortString(new Date(dietLog.date), locale);

      const chartDataItem: ChartDataItem = {
        date,
      };

      if (dietLog.comment !== null && !areCaloriesAlreadyLoaded) {
        const chartComment: ChartComment = {
          dataKeys: new Set(["calories", "fat", "carbs", "protein"]),
          label: "Diet Log Comment",
          comment: dietLog.comment,
        };

        if (updatedChartCommentMap.has(date)) {
          const updatedChartCommentList = updatedChartCommentMap.get(date)!;
          updatedChartCommentList.push(chartComment);
        } else {
          updatedChartCommentMap.set(date, [chartComment]);
        }
      }

      if (!areCaloriesAlreadyLoaded) {
        chartDataItem.calories = dietLog.calories;

        if (dietLog.calories > highestValueMap.get("calories")!) {
          highestValueMap.set("calories", dietLog.calories);
        }
      }

      if (!loadOnlyCalories) {
        chartDataItem.fat = dietLog.fat;
        chartDataItem.carbs = dietLog.carbs;
        chartDataItem.protein = dietLog.protein;

        if (dietLog.fat !== null && dietLog.fat > highestValueMap.get("fat")!) {
          highestValueMap.set("fat", dietLog.fat);
        }

        if (
          dietLog.carbs !== null &&
          dietLog.carbs > highestValueMap.get("carbs")!
        ) {
          highestValueMap.set("carbs", dietLog.carbs);
        }

        if (
          dietLog.protein !== null &&
          dietLog.protein > highestValueMap.get("protein")!
        ) {
          highestValueMap.set("protein", dietLog.protein);
        }
      }

      loadedChartData.push(chartDataItem);
    }

    setChartCommentMap(updatedChartCommentMap);

    const filledInChartData = fillInMissingDates(loadedChartData, locale);

    const mergedChartData = mergeChartData(filledInChartData, chartData);

    setChartData(mergedChartData);

    // Filter out categories with no values
    const updatedHighestValueMap = new Map(
      Array.from(highestValueMap).filter(([, value]) => value > -1)
    );

    highestCategoryValues.current = new Map([
      ...highestCategoryValues.current,
      ...updatedHighestValueMap,
    ]);

    const updatedChartDataLines = [...chartDataLines];
    const updatedShownChartDataLines = [...shownChartDataLines];
    const updatedChartLineUnitCategorySet = new Set(chartLineUnitCategorySet);

    if (loadCaloriesPrimary) {
      if (
        primaryDataKey !== undefined &&
        chartDataUnitCategoryMap.get("calories") !==
          chartDataUnitCategoryMap.get(primaryDataKey)
      ) {
        // Convert existing Chart Areas to Chart Lines
        updatedChartDataLines.push(...chartDataAreas);
        updatedShownChartDataLines.push(...shownChartDataAreas);
        updatedChartLineUnitCategorySet.add(
          chartDataUnitCategoryMap.get(primaryDataKey)
        );
      }

      setPrimaryDataKey("calories");
      setChartDataAreas(["calories"]);
      setShownChartDataAreas(["calories"]);

      if (areCaloriesAlreadyLoaded && primaryDataKey !== "calories") {
        // Replace calories chartLine with chartArea
        const chartDataLineIndex = updatedChartDataLines.findIndex(
          (item) => item === "calories"
        );
        const shownChartDataLineIndex = updatedShownChartDataLines.findIndex(
          (item) => item === "calories"
        );

        updatedChartDataLines.splice(chartDataLineIndex, 1);
        updatedShownChartDataLines.splice(shownChartDataLineIndex, 1);

        updatedChartLineUnitCategorySet.delete(
          chartDataUnitCategoryMap.get("calories")
        );
      }
    }

    if (!loadCaloriesPrimary && !areCaloriesAlreadyLoaded) {
      updatedChartDataLines.push("calories");
      updatedShownChartDataLines.push("calories");
      updatedChartLineUnitCategorySet.add("Calories");
    }

    if (!loadOnlyCalories && updatedHighestValueMap.size > 1) {
      updatedChartLineUnitCategorySet.add("Macros");

      if (highestValueMap.get("fat")! > -1) {
        updatedChartDataLines.push("fat");
        updatedShownChartDataLines.push("fat");
      }

      if (highestValueMap.get("carbs")! > -1) {
        updatedChartDataLines.push("carbs");
        updatedShownChartDataLines.push("carbs");
      }

      if (highestValueMap.get("protein")! > -1) {
        updatedChartDataLines.push("protein");
        updatedShownChartDataLines.push("protein");
      }

      loadedLists.current.add("diet-logs-macros");
    }

    if (!loadCaloriesPrimary) {
      updateRightYAxis(updatedShownChartDataLines, "calories");
    }

    if (loadCaloriesPrimary && updatedHighestValueMap.size > 1) {
      // The category "fat" will still set the highest macro value as right Y-axis,
      // even if no "fat" value was loaded
      updateRightYAxis(updatedShownChartDataLines, "fat");
    }

    setChartDataLines([...updatedChartDataLines]);
    setShownChartDataLines([...updatedShownChartDataLines]);
    setChartLineUnitCategorySet(updatedChartLineUnitCategorySet);

    loadedLists.current.add("diet-logs-calories");
    if (!isChartDataLoaded.current) isChartDataLoaded.current = true;
  };

  const updateShownChartLines = (chartLines: ChartDataCategory[]) => {
    const chartLineUnitCategorySet = new Set<ChartDataUnitCategory>();

    for (const line of chartLines) {
      chartLineUnitCategorySet.add(chartDataUnitCategoryMap.get(line));
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

    setShownChartDataAreas(updatedShownChartDataAreas);

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
    setShownChartDataAreas(updatedShownChartDataAreas);

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

    const updatedSecondaryDataUnitCategory = chartDataUnitCategoryMap.get(
      updatedShownChartDataLines[0]
    );

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

    // Get all props for the ChartDataItem objects except "date"
    const chartDataProps = Object.getOwnPropertyNames(
      loadedChartData[0]
    ).filter((item) => item !== "date");

    // Create ChartDataItem with all null values for those props
    const emptyChartDataItem = chartDataProps.reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {} as Record<string, null>);

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
        // Fill in null values for missing dates
        filledInChartData.push({ ...emptyChartDataItem, date: dateString });
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

  const getUserWeightListWeights = async (
    locale: string,
    weightUnit: string,
    loadPrimary: boolean
  ) => {
    if (loadedLists.current.has("user-weights-weight")) return;

    const userWeights = await GetAllUserWeights(true);

    if (userWeights.length === 0) {
      toast.error("No Body Weight Entries Recorded");
      return;
    }

    const loadedChartData: ChartDataItem[] = [];

    let highestValue = 0;

    const dateSet = new Set<string>();

    const updatedChartCommentMap = new Map(chartCommentMap);

    const areCommentsAlreadyLoaded = loadedLists.current.has(
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
        const chartComment: ChartComment = {
          dataKeys: new Set(["body_weight", "body_fat_percentage"]),
          label: "Body Weight Comment",
          comment: userWeight.comment,
        };

        if (updatedChartCommentMap.has(date)) {
          const updatedChartCommentList = updatedChartCommentMap.get(date)!;
          updatedChartCommentList.push(chartComment);
        } else {
          updatedChartCommentMap.set(date, [chartComment]);
        }
      }

      chartDataItem.body_weight = ConvertWeightValue(
        userWeight.weight,
        userWeight.weight_unit,
        weightUnit
      );

      if (userWeight.weight > highestValue) {
        highestValue = userWeight.weight;
      }

      loadedChartData.push(chartDataItem);
    }

    setChartCommentMap(updatedChartCommentMap);

    const filledInChartData = fillInMissingDates(loadedChartData, locale);

    const mergedChartData = mergeChartData(filledInChartData, chartData);

    setChartData(mergedChartData);

    highestCategoryValues.current.set("body_weight", highestValue);

    const updatedChartDataLines = [...chartDataLines];
    const updatedShownChartDataLines = [...shownChartDataLines];
    const updatedChartLineUnitCategorySet = new Set(chartLineUnitCategorySet);

    // TODO: COMBINE NEXT FOUR IF CASES AND MOVE TO SEPARATE FUNCTION
    if (loadPrimary && primaryDataKey === undefined) {
      // If no Chart Areas exist
      setPrimaryDataKey("body_weight");
      setChartDataAreas(["body_weight"]);
      setShownChartDataAreas(["body_weight"]);
    }

    if (
      loadPrimary &&
      primaryDataKey !== undefined &&
      chartDataUnitCategoryMap.get("body_weight") !==
        chartDataUnitCategoryMap.get(primaryDataKey)
    ) {
      // Replace existing Chart Areas if existing Chart Areas does not share Unit Category
      updatedChartDataLines.push(...chartDataAreas);
      updatedShownChartDataLines.push(...shownChartDataAreas);
      updatedChartLineUnitCategorySet.add(
        chartDataUnitCategoryMap.get(primaryDataKey)
      );

      setPrimaryDataKey("body_weight");
      setChartDataAreas(["body_weight"]);
      setShownChartDataAreas(["body_weight"]);
    }

    if (
      loadPrimary &&
      primaryDataKey !== undefined &&
      chartDataUnitCategoryMap.get("body_weight") ===
        chartDataUnitCategoryMap.get(primaryDataKey)
    ) {
      // Append new Chart Area if existing Chart Area(s) share Unit Category
      setChartDataAreas([...chartDataAreas, "body_weight"]);
      setShownChartDataAreas([...shownChartDataAreas, "body_weight"]);
    }

    if (loadPrimary && primaryDataKey !== "body_weight") {
      // Replace body_weight chartLines with chartAreas
      const chartDataLineIndex = updatedChartDataLines.findIndex(
        (item) => item === "body_weight"
      );
      const shownChartDataLineIndex = updatedShownChartDataLines.findIndex(
        (item) => item === "body_weight"
      );

      updatedChartDataLines.splice(chartDataLineIndex, 1);
      updatedShownChartDataLines.splice(shownChartDataLineIndex, 1);

      let isOnlyCategory = true;

      for (const line of updatedShownChartDataLines) {
        if (
          chartDataUnitCategoryMap.get("body_weight") ===
          chartDataUnitCategoryMap.get(line)
        ) {
          isOnlyCategory = false;
          break;
        }
      }

      if (isOnlyCategory) {
        // Remove ChartLineUnitCategory if no other shownChartLines share the unit
        updatedChartLineUnitCategorySet.delete(
          chartDataUnitCategoryMap.get("body_weight")
        );
      }

      setPrimaryDataKey("body_weight");
      setChartDataAreas(["body_weight"]);
      setShownChartDataAreas(["body_weight"]);
    }

    if (!loadPrimary) {
      updatedChartDataLines.push("body_weight");
      updatedShownChartDataLines.push("body_weight");
      updatedChartLineUnitCategorySet.add("Weight");

      updateRightYAxis(updatedShownChartDataLines, "body_weight");
    }

    setChartDataLines(updatedChartDataLines);
    setShownChartDataLines(updatedChartDataLines);
    setChartLineUnitCategorySet(updatedChartLineUnitCategorySet);

    loadedLists.current.add("user-weights-weight");
    if (!isChartDataLoaded.current) isChartDataLoaded.current = true;
  };

  const getUserWeightListBodyFat = async (
    locale: string,
    loadPrimary: boolean
  ) => {
    if (loadedLists.current.has("user-weights-body-fat")) return;

    const userWeights = await GetAllUserWeights(true);

    if (userWeights.length === 0) {
      toast.error("No Body Weight Entries Recorded");
      return;
    }

    const loadedChartData: ChartDataItem[] = [];

    let highestValue = 0;

    const dateSet = new Set<string>();

    const updatedChartCommentMap = new Map(chartCommentMap);

    const areCommentsAlreadyLoaded = loadedLists.current.has(
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
        const chartComment: ChartComment = {
          dataKeys: new Set(["body_weight", "body_fat_percentage"]),
          label: "Body Weight Comment",
          comment: userWeight.comment,
        };

        if (updatedChartCommentMap.has(date)) {
          const updatedChartCommentList = updatedChartCommentMap.get(date)!;
          updatedChartCommentList.push(chartComment);
        } else {
          updatedChartCommentMap.set(date, [chartComment]);
        }
      }

      chartDataItem.body_fat_percentage = userWeight.body_fat_percentage;

      if (
        userWeight.body_fat_percentage !== null &&
        userWeight.body_fat_percentage > highestValue
      ) {
        highestValue = userWeight.body_fat_percentage;
      }

      loadedChartData.push(chartDataItem);
    }

    if (highestValue === 0) {
      toast.error("No Body Fat Percentages Recorded");
      return;
    }

    setChartCommentMap(updatedChartCommentMap);

    const filledInChartData = fillInMissingDates(loadedChartData, locale);

    const mergedChartData = mergeChartData(filledInChartData, chartData);

    setChartData(mergedChartData);

    highestCategoryValues.current.set("body_fat_percentage", highestValue);

    const updatedChartDataLines = [...chartDataLines];
    const updatedShownChartDataLines = [...shownChartDataLines];
    const updatedChartLineUnitCategorySet = new Set(chartLineUnitCategorySet);

    // TODO: SET BF% PRIMARY

    if (!loadPrimary) {
      updatedChartDataLines.push("body_fat_percentage");
      updatedShownChartDataLines.push("body_fat_percentage");
      updatedChartLineUnitCategorySet.add("Body Fat %");

      updateRightYAxis(updatedShownChartDataLines, "body_fat_percentage");
    }

    setChartDataLines(updatedChartDataLines);
    setShownChartDataLines(updatedChartDataLines);
    setChartLineUnitCategorySet(updatedChartLineUnitCategorySet);

    loadedLists.current.add("user-weights-body-fat");
    if (!isChartDataLoaded.current) isChartDataLoaded.current = true;
  };

  const mergeChartData = (list1: ChartDataItem[], list2: ChartDataItem[]) => {
    const chartDataDateMap = new Map<string, ChartDataItem>();

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
      chartDataUnitMap.get(chartDataLine) ===
      chartDataUnitMap.get(shownChartDataAreas[0])
    ) {
      // Add new Chart Area if same unit as current Chart Area
      setChartDataAreas([...chartDataAreas, chartDataLine]);

      const updatedShownChartDataAreas = [
        ...shownChartDataAreas,
        chartDataLine,
      ];

      setShownChartDataAreas(updatedShownChartDataAreas);

      updateLeftYAxis(updatedShownChartDataAreas);
    } else {
      // Create new Chart Area and change all existing Chart Areas to Chart Lines
      const currentAreas = [...chartDataAreas];
      const currentShownAreas = [...shownChartDataAreas];

      setChartDataAreas([chartDataLine]);
      setShownChartDataAreas([chartDataLine]);
      setPrimaryDataKey(chartDataLine);

      updatedChartDataLines.push(...currentAreas);
      updatedShownChartDataLines.push(...currentShownAreas);
    }

    setChartDataLines(updatedChartDataLines);
    setShownChartDataLines(updatedShownChartDataLines);

    const updatedChartLineUnitCategorySet = new Set(
      updatedShownChartDataLines.map((item) =>
        chartDataUnitCategoryMap.get(item)
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
    setShownChartDataAreas(updatedShownChartDataAreas);
    setChartDataLines([...chartDataLines, chartDataArea]);

    const updatedShownChartDataLines = [...shownChartDataLines, chartDataArea];

    const updatedChartLineUnitCategorySet = new Set(
      updatedShownChartDataLines.map((item) =>
        chartDataUnitCategoryMap.get(item)
      )
    );

    setShownChartDataLines(updatedShownChartDataLines);

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

    const activeUnitCategory = chartDataUnitCategoryMap.get(
      activeSecondaryDataKey
    );

    let shouldChangeCategory = true;

    for (const line of chartLines) {
      if (chartDataUnitCategoryMap.get(line) === activeUnitCategory) {
        shouldChangeCategory = false;
        break;
      }
    }

    const unitCategory = shouldChangeCategory
      ? chartDataUnitCategoryMap.get(chartLines[0])
      : activeUnitCategory;

    const chartLineSet = new Set(chartLines);

    let highestCategory: ChartDataCategory = undefined;
    let highestValue = 0;

    for (const [key, value] of highestCategoryValues.current) {
      if (
        !chartLineSet.has(key) ||
        chartDataUnitCategoryMap.get(key) !== unitCategory
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

    const unitCategory = chartDataUnitCategoryMap.get(chartAreas[0]);

    const chartAreaSet = new Set(chartAreas);

    let highestCategory: ChartDataCategory = undefined;
    let highestValue = 0;

    for (const [key, value] of highestCategoryValues.current) {
      if (
        !chartAreaSet.has(key) ||
        chartDataUnitCategoryMap.get(key) !== unitCategory
      )
        continue;

      if (value > highestValue) {
        highestCategory = key;
        highestValue = value;
      }
    }

    setPrimaryDataKey(highestCategory);
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Modal isOpen={listModal.isOpen} onOpenChange={listModal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {modalListType === "exercise" ? "Select Exercise" : ""}
              </ModalHeader>
              <ModalBody>
                {modalListType === "exercise" ? (
                  <ExerciseModalList
                    handleClickExercise={() => {}}
                    useExerciseList={exerciseList}
                    useFilterExerciseList={filterExerciseList}
                    userSettingsId={userSettings.id}
                    customHeightString="h-[440px]"
                    isInAnalyticsPage
                  />
                ) : modalListType === "measurement" ? (
                  <MeasurementModalList
                    useMeasurementList={measurementList}
                    handleMeasurementClick={() => {}}
                    customHeightString="h-[440px]"
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
              config={chartConfig}
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
                  unit={chartDataUnitMap.get(primaryDataKey)}
                />
                <YAxis
                  dataKey={secondaryDataKey}
                  unit={chartDataUnitMap.get(secondaryDataKey)}
                  orientation="right"
                />
                <ChartTooltip
                  isAnimationActive={false}
                  content={
                    <ChartTooltipContent
                      chartDataUnitMap={chartDataUnitMap}
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
                      setShownChartDataAreas(
                        Array.from(value) as ChartDataCategory[]
                      )
                    }
                    disallowEmptySelection
                  >
                    {chartDataAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {chartDataCategoryLabelMap.get(area)}
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
                          {chartDataCategoryLabelMap.get(line)}
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
                      {Array.from(chartLineUnitCategorySet).map((dataKey) => (
                        <SelectItem key={dataKey} value={dataKey}>
                          {dataKey}
                        </SelectItem>
                      ))}
                    </Select>
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
                            {chartDataCategoryLabelMap.get(line)}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
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
                            {chartDataCategoryLabelMap.get(area)}
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
              onPress={() => handleOpenListModal("exercise")}
            >
              Select Exercise
            </Button>
            <Button
              className="font-medium"
              variant="flat"
              color="secondary"
              onPress={() => handleOpenListModal("measurement")}
            >
              Select Measurement
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
                disabledKeys={loadedLists.current}
              >
                <DropdownItem
                  key="user-weights-weight"
                  onPress={() =>
                    getUserWeightListWeights(
                      userSettings.locale,
                      weightUnit,
                      true
                    )
                  }
                >
                  User Weights
                </DropdownItem>
                <DropdownItem
                  key="user-weights-body-fat"
                  onPress={() =>
                    getUserWeightListBodyFat(userSettings.locale, false)
                  }
                >
                  User Body Fat %
                </DropdownItem>
                <DropdownItem
                  key="diet-logs-calories"
                  onPress={() =>
                    getDietLogList(userSettings.locale, true, true)
                  }
                >
                  Diet Logs (Only Calories)
                </DropdownItem>
                <DropdownItem
                  key="diet-logs-macros"
                  onPress={() =>
                    getDietLogList(userSettings.locale, true, false)
                  }
                >
                  Diet Logs (With Macros)
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
                disabledKeys={loadedLists.current}
              >
                <DropdownItem
                  key="user-weights-weight"
                  onPress={() =>
                    getUserWeightListWeights(
                      userSettings.locale,
                      weightUnit,
                      false
                    )
                  }
                >
                  User Weights
                </DropdownItem>
                <DropdownItem
                  key="user-weights-body-fat"
                  onPress={() =>
                    getUserWeightListBodyFat(userSettings.locale, false)
                  }
                >
                  User Body Fat %
                </DropdownItem>
                <DropdownItem
                  key="diet-logs-calories"
                  onPress={() =>
                    getDietLogList(userSettings.locale, false, true)
                  }
                >
                  Diet Logs (Only Calories)
                </DropdownItem>
                <DropdownItem
                  key="diet-logs-macros"
                  onPress={() =>
                    getDietLogList(userSettings.locale, false, false)
                  }
                >
                  Diet Logs (With Macros)
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            {filteredChartData.length > 0 && (
              <Button
                className="font-medium"
                variant="flat"
                onPress={() => handleOpenListModal("time-period")}
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
