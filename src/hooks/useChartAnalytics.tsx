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
  ChartDataUnitCategoryNoUndefined,
  ChartReferenceAreaItem,
  Exercise,
  UserSettings,
} from "../typings";
import { useDefaultChartMapsAndConfig, useLoadExerciseOptionsMap } from ".";
import {
  CreateLoadExerciseOptionsList,
  FormatDateToShortString,
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

  const fillInLoadExerciseOptions = (
    loadExerciseOptionsString: string,
    loadExerciseOptionsCategoriesString: string,
    selectedExercise: Exercise,
    isInAnalytics: boolean
  ) => {
    const disabledKeys = new Set<ChartDataExerciseCategoryBase>();

    // Disable any options that have already been loaded for Exercise
    if (isInAnalytics) {
      // Check if a ChartDataExerciseCategoryBase value exists for selectedExercise id
      for (const chart of loadedCharts.current) {
        const lastIndex = chart.lastIndexOf("_");

        if (lastIndex === -1) continue;

        const chartName = chart.substring(0, lastIndex);
        const chartId = chart.substring(lastIndex + 1);

        if (
          chartId === selectedExercise.id.toString() &&
          chartName !== "measurement"
        ) {
          disabledKeys.add(chartName as ChartDataExerciseCategoryBase);
        }
      }
    } else {
      for (const chart of loadedCharts.current) {
        disabledKeys.add(chart as ChartDataExerciseCategoryBase);
      }
    }

    setDisabledLoadExerciseOptions(disabledKeys);

    // Create list from default string, without any disabled options
    const loadExerciseOptionsList = CreateLoadExerciseOptionsList(
      loadExerciseOptionsString,
      selectedExercise.exercise_group_set_string_primary
    ).filter((option) => !disabledKeys.has(option));

    setLoadExerciseOptions(new Set(loadExerciseOptionsList));

    const unitCategoriesPrimary: ChartDataUnitCategory[] = [];

    unitCategoriesPrimary.push(
      ...loadExerciseOptionsList.map((option) =>
        chartDataUnitCategoryMap.current.get(option)
      )
    );

    const savedCategories = loadExerciseOptionsCategoriesString.split(
      ","
    ) as ChartDataUnitCategoryNoUndefined[];

    let unitCategoryPrimary: ChartDataUnitCategory = undefined;

    const chartAreaUnitCategory = chartDataUnitCategoryMap.current.get(
      chartDataAreas[0]
    );

    if (chartAreaUnitCategory !== undefined) {
      // Use Chart Area category if Chart is already loaded
      unitCategoryPrimary = chartAreaUnitCategory;
      unitCategoriesPrimary.push(chartAreaUnitCategory);
    } else {
      // Use saved category string if Chart is not loaded
      const isSavedCategoryValid =
        validLoadExerciseOptionsCategories.has(savedCategories[0]) &&
        unitCategoriesPrimary.includes(savedCategories[0]);

      // Use first unit category from saved options string if saved string is invalid
      // (Will be undefined if unitCategoriesPrimary is empty)
      unitCategoryPrimary = isSavedCategoryValid
        ? savedCategories[0]
        : unitCategoriesPrimary[0];
      unitCategoriesPrimary.push(unitCategoryPrimary);
    }

    setLoadExerciseOptionsUnitCategoryPrimary(unitCategoryPrimary);

    const unitCategorySetPrimary = new Set(unitCategoriesPrimary);

    unitCategorySetPrimary.delete(undefined);

    const unitCategoriesSecondary: ChartDataUnitCategory[] = [];

    if (secondaryDataUnitCategory !== undefined) {
      unitCategoriesSecondary.push(secondaryDataUnitCategory);
    }

    unitCategoriesSecondary.push(
      ...Array.from(unitCategorySetPrimary).filter(
        (value) => value !== unitCategoryPrimary
      )
    );

    setLoadExerciseOptionsUnitCategoriesPrimary(unitCategorySetPrimary);
    setLoadExerciseOptionsUnitCategoriesSecondary(unitCategoriesSecondary);

    let unitCategorySecondary: ChartDataUnitCategory = undefined;

    if (secondaryDataUnitCategory === undefined) {
      // Change to saved category string if no Chart Lines are loaded
      const isSavedCategoryValid =
        validLoadExerciseOptionsCategories.has(savedCategories[1]) &&
        unitCategoriesSecondary.includes(savedCategories[1]);

      // Use first unit category from non-primary saved options string
      // if saved string is invalid
      // (Will be undefined if unitCategoriesSecondary is empty)
      unitCategorySecondary = isSavedCategoryValid
        ? savedCategories[1]
        : unitCategoriesSecondary[0];

      setLoadExerciseOptionsUnitCategorySecondary(unitCategorySecondary);
    }
  };

  const updateChartCommentMapForExercise = (exerciseId: number) => {
    let areCommentsAlreadyLoaded = false;
    const updatedChartCommentMap = new Map(chartCommentMap);
    let existingDataKey = "";

    // Check if any Exercise option has been loaded for Exercise ID
    for (const option of loadExerciseOptionsMap.keys()) {
      const chartName: ChartDataExerciseCategory = `${option}_${exerciseId}`;

      if (allChartDataCategories.has(chartName)) {
        areCommentsAlreadyLoaded = true;
        existingDataKey = chartName;
        break;
      }
    }

    if (areCommentsAlreadyLoaded) {
      // Add new options to list of Chart dataKeys which should show comment
      const newDataKeys: Set<ChartDataExerciseCategory> = new Set(
        [...loadExerciseOptions].map(
          (option) => `${option}_${exerciseId}` as ChartDataExerciseCategory
        )
      );

      for (const [, chartCommentList] of updatedChartCommentMap) {
        for (const chartComment of chartCommentList) {
          if (chartComment.dataKeys.has(existingDataKey as ChartDataCategory)) {
            // Replace existing dataKeys with newDataKeys for every ChartComment
            // that has an existing comment relating to Exercise ID

            const updatedDataKeys = new Set([
              ...chartComment.dataKeys,
              ...newDataKeys,
            ]);

            chartComment.dataKeys = updatedDataKeys;
          }
        }
      }
    }

    return { areCommentsAlreadyLoaded, updatedChartCommentMap };
  };

  const fillInMissingChartDates = (
    loadedChartData: ChartDataItem[],
    locale: string
  ) => {
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
    chartEndDate,
    filterMinDate,
    setFilterMinDate,
    filterMaxDate,
    setFilterMaxDate,
    filteredChartData,
    loadExerciseOptions,
    setLoadExerciseOptions,
    disabledLoadExerciseOptions,
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
    fillInLoadExerciseOptions,
    updateChartCommentMapForExercise,
    fillInMissingChartDates,
    mergeChartData,
  };
};
