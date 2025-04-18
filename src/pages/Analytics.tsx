import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  RadioGroup,
  Radio,
  useDisclosure,
} from "@heroui/react";
import {
  useChartAnalytics,
  useExerciseList,
  useFilterExerciseList,
  useMeasurementList,
} from "../hooks";
import { useEffect, useRef, useState } from "react";
import {
  AnalyticsChart,
  DeleteModal,
  ExerciseGroupCheckboxes,
  ExerciseModalList,
  FilterExerciseGroupsModal,
  FilterMinAndMaxDatesModal,
  LoadExerciseOptionsModal,
  LoadingSpinner,
  MeasurementModalList,
  TimePeriodListModal,
} from "../components";
import {
  AnalyticsChartListModalPage,
  ChartDataCategory,
  ChartDataCategoryNoUndefined,
  ChartDataExerciseCategory,
  ChartDataExerciseCategoryBase,
  ChartDataItem,
  ChartDataUnitCategory,
  ChartReferenceAreaItem,
  Exercise,
  Measurement,
  UserMeasurementValues,
  WorkoutSet,
} from "../typings";
import {
  ConvertMeasurementValue,
  ConvertNumberToTwoDecimals,
  ConvertWeightValue,
  FormatDateToShortString,
  GetAllDietLogs,
  GetAllUserWeights,
  GetAnalyticsValuesForSetList,
  GetCompletedSetsWithExerciseId,
  GetTimeCompletedForSetsWithExerciseId,
  GetUserMeasurementsWithMeasurementId,
  GetUserSettings,
  UpdateLoadExerciseOptions,
  ValidMeasurementUnits,
  UpdateItemInList,
} from "../helpers";
import toast from "react-hot-toast";

// WHEN ADDING NEW STATS:
// UPDATE useDefaultChartMapsAndConfig
// IF STAT HAS ID (EXERCISE STAT OR EXERCISE GROUP STAT)
// UPDATE getChartDataCategoryTypeAndId

export default function Analytics() {
  const [listModalPage, setAnalyticsChartListModalPage] =
    useState<AnalyticsChartListModalPage>("exercise-list");
  const [loadChartAsArea, setLoadChartAsArea] = useState<boolean>(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise>();

  const [selectedExerciseGroups, setSelectedExerciseGroups] = useState<
    string[]
  >([]);
  const [
    countSecondaryExerciseGroupsAsOne,
    setCountSecondaryExerciseGroupsAsOne,
  ] = useState<boolean>(false);

  const chartAnalytics = useChartAnalytics();

  const {
    userSettings,
    setUserSettings,
    weightUnit,
    distanceUnit,
    speedUnit,
    paceUnit,
    circumferenceUnit,
    chartData,
    chartDataAreas,
    setChartDataAreas,
    chartDataLines,
    setChartDataLines,
    primaryDataKey,
    secondaryDataKey,
    setChartLineUnitCategorySet,
    shownChartDataAreas,
    shownChartDataLines,
    setShownChartDataLines,
    referenceAreas,
    setReferenceAreas,
    shownReferenceAreas,
    setShownReferenceAreas,
    chartCommentMap,
    setChartCommentMap,
    chartStartDate,
    chartEndDate,
    filterMinDate,
    filterMaxDate,
    loadedMeasurements,
    setLoadedMeasurements,
    loadExerciseOptions,
    loadExerciseOptionsUnitCategoryPrimary,
    loadExerciseOptionsUnitCategorySecondary,
    allChartDataCategories,
    chartDataUnitMap,
    chartDataUnitCategoryMap,
    chartConfig,
    loadedCharts,
    isChartDataLoaded,
    highestCategoryValues,
    loadExerciseOptionsMap,
    timePeriodListModal,
    filterMinAndMaxDatesModal,
    loadExerciseOptionsModal,
    deleteModal,
    includesMultisetMap,
    disabledExerciseGroups,
    updateExerciseStatUnit,
    resetChart,
    assignDefaultUnits,
    updateChartDataAndFilteredHighestCategoryValues,
    fillInLoadExerciseOptions,
    updateChartCommentMapForExercise,
    fillInMissingChartDates,
    mergeChartData,
    updateCustomMinAndMaxDatesFilter,
    updateLeftYAxis,
    updateRightYAxis,
    loadChartAreas,
    addChartComment,
    loadChartLines,
    handleClickTimePeriod,
    timePeriodIdSet,
    timePeriodList,
  } = chartAnalytics;

  const [showTestButtons, setShowTestButtons] = useState<boolean>(false);

  const validCircumferenceUnits = new Set(ValidMeasurementUnits());

  const areAllTestLinesAndAreasRendered = useRef<boolean>(false);

  const exerciseList = useExerciseList(false, true, true);

  const {
    isExerciseListLoaded,
    getExercises,
    exerciseGroupDictionary,
    includeSecondaryGroups,
    setIncludeSecondaryGroups,
    exercises,
    setExercises,
  } = exerciseList;

  const filterExerciseList = useFilterExerciseList(exerciseList);

  const measurementList = useMeasurementList(false, true, true);

  const { isMeasurementListLoaded, getMeasurements } = measurementList;

  const listModal = useDisclosure();

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);

      assignDefaultUnits(userSettings);
    };

    loadUserSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedExercise === undefined) return;

    fillInLoadExerciseOptions(
      selectedExercise.chart_load_exercise_options,
      selectedExercise.chart_load_exercise_options_categories,
      selectedExercise,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExercise]);

  const handleOpenListModal = async (
    modalListType: AnalyticsChartListModalPage
  ) => {
    if (userSettings === undefined) return;

    setAnalyticsChartListModalPage(modalListType);

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

    const filledInChartData = fillInMissingChartDates(
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

    const filledInChartData = fillInMissingChartDates(
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

    const filledInChartData = fillInMissingChartDates(
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

    const filledInChartData = fillInMissingChartDates(
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
            `measurement_${item}` as ChartDataCategoryNoUndefined
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

    const filledInChartData = fillInMissingChartDates(
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
    loadExerciseOptionsModal.onOpen();
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
      updateChartCommentMapForExercise(exerciseId);

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
      const {
        analyticsValuesMap,
        commentMap,
        includesMultiset,
        workoutCommentMap,
      } = GetAnalyticsValuesForSetList(
        setList,
        loadExerciseOptions,
        weightUnit,
        distanceUnit,
        speedUnit,
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

      for (const [, comment] of workoutCommentMap) {
        const commentLabel = "Workout Comment";

        addChartComment(
          updatedChartCommentMap,
          date,
          chartDataKeys,
          commentLabel,
          comment,
          areCommentsAlreadyLoaded
        );
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
      loadExerciseOptionsModal.onClose();
      return;
    }

    setChartCommentMap(updatedChartCommentMap);

    // Sort by date, since Sets from GetCompletedSetsWithExerciseId are sorted by id
    const sortedLoadedChartData = loadedChartData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const filledInChartData = fillInMissingChartDates(
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
    loadExerciseOptionsModal.onClose();
  };

  const updateDefaultLoadExerciseOptions = async () => {
    if (selectedExercise === undefined) return;

    const allLoadedOptions = getAllLoadedOptionsForExercise(
      selectedExercise.id
    );

    const {
      success,
      loadExerciseOptionsString,
      loadExerciseOptionsCategoriesString,
    } = await UpdateLoadExerciseOptions(
      allLoadedOptions,
      loadExerciseOptionsUnitCategoryPrimary,
      loadExerciseOptionsUnitCategorySecondary,
      selectedExercise.id
    );

    if (!success) return;

    const updatedExercise: Exercise = {
      ...selectedExercise,
      chart_load_exercise_options: loadExerciseOptionsString,
      chart_load_exercise_options_categories:
        loadExerciseOptionsCategoriesString,
    };

    const updatedExercises = UpdateItemInList(exercises, updatedExercise);

    setExercises(updatedExercises);
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

    const filledInChartData = fillInMissingChartDates(
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

  const getAllLoadedOptionsForExercise = (exerciseId: number) => {
    const loadedOptions = new Set<ChartDataExerciseCategoryBase>();

    for (const chart of loadedCharts.current) {
      const lastIndex = chart.lastIndexOf("_");

      if (lastIndex === -1) continue;

      const chartName = chart.substring(0, lastIndex);
      const chartId = chart.substring(lastIndex + 1);

      if (chartId === exerciseId.toString() && chartName !== "measurement") {
        loadedOptions.add(chartName as ChartDataExerciseCategoryBase);
      }
    }

    return loadedOptions;
  };

  const resetChartData = () => {
    setLoadedMeasurements(new Map());
    setSelectedExercise(undefined);
    disabledExerciseGroups.current = [];

    resetChart();
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
      <TimePeriodListModal
        timePeriodListModal={timePeriodListModal}
        useTimePeriodList={timePeriodList}
        handleTimePeriodClick={handleClickTimePeriod}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
        customHeightString="h-[440px]"
        hiddenTimePeriods={timePeriodIdSet}
      />
      <LoadExerciseOptionsModal
        useChartAnalytics={chartAnalytics}
        selectedExercise={selectedExercise}
        chartDataUnitCategoryMap={chartDataUnitCategoryMap.current}
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
        deleteButtonAction={() => resetChartData()}
        deleteButtonText="Reset"
      />
      <div className="absolute left-0 w-screen">
        <div className="flex flex-col gap-3">
          {isChartDataLoaded.current && (
            <AnalyticsChart useChartAnalytics={chartAnalytics} />
          )}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
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
              <Button
                className="font-medium"
                variant="flat"
                onPress={() => setShowTestButtons(!showTestButtons)}
              >
                Toggle Test Buttons
              </Button>
            </div>
            {showTestButtons && (
              <div className="flex gap-2 relative">
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
