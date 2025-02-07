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
  LoadingSpinner,
  MeasurementModalList,
  TimePeriodModalList,
} from "../components";
import { TimePeriod, UserSettings } from "../typings";
import {
  ConvertISODateStringToYmdDateString,
  CreateShownPropertiesSet,
  FormatDateStringShort,
  GetAllDietLogs,
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
  test?: number;
};

type ChartDataCategory =
  | undefined
  | "calories"
  | "fat"
  | "carbs"
  | "protein"
  | "test";

type ChartDataUnitCategory = undefined | "Calories" | "Macros";

type ReferenceAreaItem = {
  timePeriodId: number;
  x1: string;
  x2: string;
  label: string;
  startDate: string;
  endDate: string;
};

export default function AnalyticsIndex() {
  const [modalListType, setModalListType] = useState<ModalListType>("exercise");
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [chartDataAreas, setChartDataAreas] = useState<ChartDataCategory[]>([]);
  const [chartDataLines, setChartDataLines] = useState<ChartDataCategory[]>([]);
  const [primaryDataKey, setPrimaryDataKey] = useState<ChartDataCategory>();
  const [secondaryDataKey, setSecondaryDataKey] = useState<ChartDataCategory>();
  const [chartLineUnitCategoryList, setChartLineUnitCategoryList] = useState<
    ChartDataUnitCategory[]
  >([]);
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

  const [showTestButtons, setShowTestButtons] = useState<boolean>(false);

  const highestCategoryValues = useRef<Map<ChartDataCategory, number>>(
    new Map()
  );

  const chartDataAreaSet = useMemo(
    () => new Set<ChartDataCategory>(chartDataAreas),
    [chartDataAreas]
  );

  const chartDataLineSet = useMemo(
    () => new Set<ChartDataCategory>(chartDataLines),
    [chartDataLines]
  );

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

  const filteredChartData: ChartDataItem[] = useMemo(() => {
    return chartData.map((entry) =>
      Object.fromEntries(
        Object.entries(entry).filter(
          ([key]) =>
            key === "date" ||
            chartDataAreas.includes(key as ChartDataCategory) ||
            chartDataLines.includes(key as ChartDataCategory)
        )
      )
    ) as ChartDataItem[];
  }, [chartData]);

  const listModal = useDisclosure();

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
    categoryMap.set("test", "Test");

    return categoryMap;
  }, []);

  const chartDataUnitMap = useMemo(() => {
    const unitMap = new Map<ChartDataCategory, string>();

    unitMap.set("calories", " kcal");
    unitMap.set("fat", " g");
    unitMap.set("carbs", " g");
    unitMap.set("protein", " g");
    unitMap.set("test", " kcal");

    return unitMap;
  }, []);

  const chartDataUnitCategoryMap = useMemo(() => {
    const unitCategoryMap = new Map<ChartDataCategory, ChartDataUnitCategory>();

    unitCategoryMap.set("calories", "Calories");
    unitCategoryMap.set("fat", "Macros");
    unitCategoryMap.set("carbs", "Macros");
    unitCategoryMap.set("protein", "Macros");
    unitCategoryMap.set("test", "Calories");

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
      test: { label: chartDataCategoryLabelMap.get("test") },
    };
  }, []);

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

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);

      getDietLogList(userSettings.locale, true);
    };

    loadUserSettings();
  }, []);

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
    loadCaloriesPrimary: boolean
  ) => {
    if (chartDataAreaSet.has("calories") || chartDataLineSet.has("calories"))
      return;

    const dietLogs = await GetAllDietLogs(true);

    if (dietLogs.length === 0) {
      toast.error("No Diet Logs Entries Recorded");
      return;
    }

    const chartData: ChartDataItem[] = [];

    const highestValueMap = new Map<ChartDataCategory, number>();
    highestValueMap.set("calories", 0);
    highestValueMap.set("fat", 0);
    highestValueMap.set("carbs", 0);
    highestValueMap.set("protein", 0);

    for (const dietLog of dietLogs) {
      const chartDataItem = {
        date: FormatDateStringShort(dietLog.date, locale),
        calories: dietLog.calories,
        fat: dietLog.fat,
        carbs: dietLog.carbs,
        protein: dietLog.protein,
      };

      if (dietLog.calories > highestValueMap.get("calories")!) {
        highestValueMap.set("calories", dietLog.calories);
      }

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

      chartData.push(chartDataItem);
    }

    setChartData(chartData);

    const updatedChartDataLines = [...chartDataLines];
    const updatedShownChartDataLines = [...shownChartDataLines];
    const updatedChartLineUnitCategoryList = [...chartLineUnitCategoryList];

    if (loadCaloriesPrimary) {
      setPrimaryDataKey("calories");
      setChartDataAreas(["calories"]);
      setShownChartDataAreas(["calories"]);
    } else {
      if (secondaryDataKey === undefined) {
        setSecondaryDataKey("calories");
      }

      if (secondaryDataUnitCategory === undefined) {
        setSecondaryDataUnitCategory("Calories");
      }

      updatedChartDataLines.push("calories");
      updatedShownChartDataLines.push("calories");
      updatedChartLineUnitCategoryList.push("Calories");
    }

    const { highestGramValueCategory, updatedHighestCategoryValues } =
      getHighestGramValueForMacros(highestValueMap);

    highestCategoryValues.current = updatedHighestCategoryValues;

    if (highestGramValueCategory !== "") {
      if (loadCaloriesPrimary) {
        // Set the category with the highest gram value as second Y-axis
        setSecondaryDataKey(highestGramValueCategory as ChartDataCategory);
        setSecondaryDataUnitCategory("Macros");
      }

      updatedChartLineUnitCategoryList.push("Macros");
    }

    const macroLines: ChartDataCategory[] = [];

    // Add in reverse order of Fat -> Carbs -> Protein
    if (highestValueMap.get("protein")! > 0) {
      macroLines.unshift("protein");
    }

    if (highestValueMap.get("carbs")! > 0) {
      macroLines.unshift("carbs");
    }

    if (highestValueMap.get("fat")! > 0) {
      macroLines.unshift("fat");
    }

    setChartDataLines([...updatedChartDataLines, ...macroLines]);
    setShownChartDataLines([...updatedShownChartDataLines, ...macroLines]);
    setChartLineUnitCategoryList(updatedChartLineUnitCategoryList);

    isChartDataLoaded.current = true;
  };

  const updateShownChartLines = (chartLines: ChartDataCategory[]) => {
    if (chartLines.length > 0) {
      const chartLineSet = new Set(chartLines);

      const unitCategory = chartDataUnitCategoryMap.get(chartLines[0]);

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

      if (secondaryDataUnitCategory !== unitCategory) {
        setSecondaryDataUnitCategory(unitCategory);
      }

      // Set secondaryDataKey as the category with the highest value of the unitCategory
      setSecondaryDataKey(highestCategory);
    } else {
      setSecondaryDataKey(undefined);
      setSecondaryDataUnitCategory(undefined);
    }

    const chartLineUnitCategorySet = new Set<ChartDataUnitCategory>();

    for (const line of chartLines) {
      chartLineUnitCategorySet.add(chartDataUnitCategoryMap.get(line));
    }

    setShownChartDataLines(chartLines);
    setChartLineUnitCategoryList(Array.from(chartLineUnitCategorySet));
  };

  const getHighestGramValueForMacros = (
    highestValueMap: Map<ChartDataCategory, number>
  ) => {
    let highestGramValueCategory = "";
    let highestGramValue = 0;

    const updatedHighestCategoryValues = new Map(highestValueMap);

    for (const [key, value] of highestValueMap) {
      if (key !== "fat" && key !== "carbs" && key !== "protein") continue;

      if (value > highestGramValue) {
        highestGramValueCategory = key!;
        highestGramValue = value;
      }

      updatedHighestCategoryValues.set(key, value);
    }

    return { highestGramValueCategory, updatedHighestCategoryValues };
  };

  const formatXAxisDate = (date: string) => {
    const cutoff =
      userSettings === undefined || userSettings.locale === "en-US" ? 6 : 5;

    return date.substring(0, date.length - cutoff);
  };

  const addTestArea = () => {
    if (chartDataAreas.includes("test") || chartDataLines.includes("test"))
      return;

    const updatedChartData = chartData.map((item) => ({
      ...item,
      test: Math.floor(Math.random() * 3000),
    }));

    setChartData(updatedChartData);
    setChartDataAreas([...chartDataAreas, "test"]);
    setShownChartDataAreas([...shownChartDataAreas, "test"]);
  };

  const removeTestArea = () => {
    const updatedChartData: ChartDataItem[] = chartData.map(
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
  };

  const addTestLine = () => {
    if (chartDataAreas.includes("test") || chartDataLines.includes("test"))
      return;

    const updatedChartData: ChartDataItem[] = [...chartData];

    let maxNum = 0;

    for (let i = 0; i < chartData.length; i++) {
      const testNum = Math.floor(Math.random() * 3000);

      if (testNum > maxNum) {
        maxNum = testNum;
      }

      updatedChartData[i].test = testNum;
    }

    highestCategoryValues.current.set("test", maxNum);

    setChartData(updatedChartData);
    setChartDataLines([...chartDataLines, "test"]);
    setShownChartDataLines([...shownChartDataLines, "test"]);

    if (!chartLineUnitCategoryList.includes("Calories")) {
      setChartLineUnitCategoryList([...chartLineUnitCategoryList, "Calories"]);
    }

    if (secondaryDataUnitCategory === undefined) {
      setSecondaryDataUnitCategory("Calories");
    }
  };

  const removeTestLine = () => {
    // Remove the test prop from chartData
    const updatedChartData = chartData.map(({ test, ...rest }) => rest);

    const updatedChartDataLines = chartDataLines.filter(
      (item) => item !== "test"
    );

    setChartData(updatedChartData);
    setChartDataLines(updatedChartDataLines);

    highestCategoryValues.current.delete("test");

    if (updatedChartDataLines.length === 0) {
      setSecondaryDataUnitCategory(undefined);
      setChartLineUnitCategoryList([]);
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

    const unitCategory = chartDataUnitCategoryMap.get(chartDataCategory);

    let shouldDeleteSecondaryDataKeyFromList = true;

    for (const line of updatedShownChartDataLines) {
      if (chartDataUnitCategoryMap.get(line) === unitCategory) {
        shouldDeleteSecondaryDataKeyFromList = false;
        break;
      }
    }

    if (shouldDeleteSecondaryDataKeyFromList) {
      const updatedSecondaryDataKeyList = chartLineUnitCategoryList.filter(
        (item) => item !== unitCategory
      );

      setChartLineUnitCategoryList(updatedSecondaryDataKeyList);

      updateShownChartLines(updatedShownChartDataLines);
    }
  };

  const changeSecondaryDataUnitCategory = (unitCategory: string) => {
    if (unitCategory === "Macros") {
      const { highestGramValueCategory } = getHighestGramValueForMacros(
        highestCategoryValues.current
      );

      setSecondaryDataKey(highestGramValueCategory as ChartDataCategory);
      setSecondaryDataUnitCategory(unitCategory);
    } else if (unitCategory === "Calories") {
      setSecondaryDataKey("calories");
      setSecondaryDataUnitCategory(unitCategory);
    }
  };

  const toggleTestTimePeriod = () => {
    if (userSettings === undefined) return;

    if (referenceAreas.length === 0) {
      setReferenceAreas([
        {
          timePeriodId: 0,
          x1: FormatDateStringShort("2025-01-22", userSettings.locale),
          x2: FormatDateStringShort("2025-01-25", userSettings.locale),
          label: "Test Period",
          startDate: "2025-01-22",
          endDate: "2025-01-25",
        },
      ]);
    } else {
      setReferenceAreas([]);
    }
  };

  const handleClickTimePeriod = (timePeriod: TimePeriod) => {
    if (
      timePeriodIdSet.has(timePeriod.id.toString()) ||
      timePeriod.start_date === null ||
      userSettings === undefined
    )
      return;

    const startDate = ConvertISODateStringToYmdDateString(
      timePeriod.start_date
    );
    const endDate =
      timePeriod.end_date === null
        ? GetCurrentYmdDateString()
        : ConvertISODateStringToYmdDateString(timePeriod.end_date);

    const referenceArea: ReferenceAreaItem = {
      timePeriodId: timePeriod.id,
      x1: FormatDateStringShort(startDate, userSettings.locale),
      x2: FormatDateStringShort(endDate, userSettings.locale),
      label: timePeriod.name,
      startDate,
      endDate,
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
      <FilterExerciseGroupsModal
        useExerciseList={exerciseList}
        useFilterExerciseList={filterExerciseList}
      />
      <div className="flex flex-col items-center gap-3">
        {isChartDataLoaded.current && (
          <div className="bg-default-50 pt-4 pb-1.5 rounded-xl">
            <ChartContainer config={chartConfig} className="w-[850px]">
              <ComposedChart
                data={filteredChartData}
                margin={{ top: 15, right: 15, left: 15 }}
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
                <ChartTooltip content={<ChartTooltipContent />} />
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
                  />
                ))}
                {shownReferenceAreas.map((area, index) => (
                  <ReferenceArea
                    key={area.timePeriodId}
                    x1={area.x1}
                    x2={area.x2}
                    label={area.label}
                    opacity={0.3}
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
                  />
                ))}
              </ComposedChart>
            </ChartContainer>
          </div>
        )}
        <div className="flex flex-col gap-2 w-[960px]">
          <div className="flex gap-2 items-center">
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
            <Button
              className="font-medium"
              variant="flat"
              onPress={() => getDietLogList(userSettings.locale, true)}
              isDisabled={
                chartDataAreaSet.has("calories") ||
                chartDataLineSet.has("calories")
              }
            >
              Load Diet Logs
            </Button>
            {isChartDataLoaded.current && (
              <>
                <Select
                  className="w-[10rem]"
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
                <Select
                  className="w-[10rem]"
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
                {secondaryDataUnitCategory !== undefined && (
                  <Select
                    className="w-[10rem]"
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
                    isDisabled={chartLineUnitCategoryList.length < 2}
                  >
                    {chartLineUnitCategoryList.map((dataKey) => (
                      <SelectItem key={dataKey} value={dataKey}>
                        {dataKey}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              </>
            )}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex justify-between items-center gap-2">
              <Button
                className="font-medium"
                variant="flat"
                color="secondary"
                onPress={() => handleOpenListModal("time-period")}
              >
                Select Time Period
              </Button>
              {referenceAreas.length > 0 && (
                <Select
                  className="w-[11.75rem]"
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
