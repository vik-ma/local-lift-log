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
  Measurement,
  UnitCategory,
  UseChartAnalyticsReturnType,
  UserSettings,
} from "../typings";
import { useDefaultChartMapsAndConfig, useLoadExerciseOptionsMap } from ".";
import {
  ConvertDateToYmdString,
  ConvertDistanceValue,
  ConvertISODateStringToYmdDateString,
  ConvertMeasurementValue,
  ConvertNumberToTwoDecimals,
  ConvertPaceValue,
  ConvertSpeedValue,
  ConvertWeightValue,
  CreateLoadExerciseOptionsList,
  FormatDateToShortString,
  GetCurrentYmdDateString,
  GetPaceUnitFromDistanceUnit,
  GetSpeedUnitFromDistanceUnit,
  GetValidatedUserSettingsUnits,
  ValidLoadExerciseOptionsCategories,
} from "../helpers";
import { ChartConfig } from "../components/ui/chart";

export const useChartAnalytics = (): UseChartAnalyticsReturnType => {
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
  const [loadedMeasurements, setLoadedMeasurements] = useState<
    Map<number, Measurement>
  >(new Map());

  const filterMinAndMaxDatesModal = useDisclosure();
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

  const disabledExerciseGroups = useRef<string[]>([]);

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

  const updateShownReferenceAreas = (timePeriodIds: Set<string>) => {
    const updatedShownReferenceAreas = referenceAreas.filter((item) =>
      timePeriodIds.has(item.timePeriodId.toString())
    );

    setShownReferenceAreas(updatedShownReferenceAreas);
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

  const handleChangeUnit = (newUnit: string, unitCategory: UnitCategory) => {
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

    if (unitCategory === "Speed") {
      if (newUnit === speedUnit) return;

      changeUnitInChartData(newUnit, speedUnit, speedCharts, ConvertSpeedValue);

      setSpeedUnit(newUnit);
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
    categoryChart: Set<ChartDataCategoryNoUndefined>,
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

  return {
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
    secondaryDataUnitCategory,
    chartLineUnitCategorySet,
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
    filteredChartData,
    loadExerciseOptions,
    setLoadExerciseOptions,
    disabledLoadExerciseOptions,
    loadedMeasurements,
    setLoadedMeasurements,
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
    weightCharts,
    distanceCharts,
    paceCharts,
    speedCharts,
    circumferenceCharts,
    loadExerciseOptionsMap,
    filterMinAndMaxDatesModal,
    deleteModal,
    loadExerciseOptionsModal,
    validLoadExerciseOptionsCategories,
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
    updateShownChartLines,
    formatXAxisDate,
    updateShownReferenceAreas,
    getTimePeriodStartAndEndDates,
    changeChartDataLineToArea,
    changeChartDataAreaToLine,
    changeChartDataLineCategoryToArea,
    updateCustomMinAndMaxDatesFilter,
    updateMinDateFilter,
    updateMaxDateFilter,
    updateLeftYAxis,
    updateRightYAxis,
    loadChartAreas,
    addChartComment,
    loadChartLines,
    removeChartStat,
    handleChangeUnit,
  };
};
