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
} from "../hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ExerciseModalList,
  FilterExerciseGroupsModal,
  LoadingSpinner,
  MeasurementModalList,
} from "../components";
import { UserSettings } from "../typings";
import {
  FormatDateStringShort,
  GetAllDietLogs,
  GetUserSettings,
  MoveItemToStartOfList,
  MoveListOfItemsToStartOfList,
} from "../helpers";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Area,
  Line,
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

type ModalListType = "exercise" | "measurement";

type ChartData = {
  date: string;
  calories?: number;
  fat?: number | null;
  carbs?: number | null;
  protein?: number | null;
  test?: number;
}[];

type ChartDataCategory =
  | undefined
  | "calories"
  | "fat"
  | "carbs"
  | "protein"
  | "test";

type ChartDataUnitCategory = undefined | "Calories" | "Macros";

export default function AnalyticsIndex() {
  const [modalListType, setModalListType] = useState<ModalListType>("exercise");
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [chartData, setChartData] = useState<ChartData>([]);
  const [chartDataAreas, setChartDataAreas] = useState<ChartDataCategory[]>([]);
  const [chartDataLines, setChartDataLines] = useState<ChartDataCategory[]>([]);
  const [primaryDataKey, setPrimaryDataKey] = useState<ChartDataCategory>();
  const [secondaryDataKey, setSecondaryDataKey] = useState<ChartDataCategory>();
  const [secondaryDataKeyList, setSecondaryDataKeyList] = useState<
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

  const highestCategoryValues = useRef<Map<ChartDataCategory, number>>(
    new Map()
  );

  const isChartDataLoaded = useRef<boolean>(false);

  const filteredChartData: ChartData = useMemo(() => {
    return chartData.map((entry) =>
      Object.fromEntries(
        Object.entries(entry).filter(
          ([key]) =>
            key === "date" ||
            chartDataAreas.includes(key as ChartDataCategory) ||
            chartDataLines.includes(key as ChartDataCategory)
        )
      )
    ) as ChartData;
  }, [chartData]);

  const listModal = useDisclosure();

  const exerciseList = useExerciseList(false, true, true);

  const { isExerciseListLoaded, getExercises } = exerciseList;

  const filterExerciseList = useFilterExerciseList(exerciseList);

  const measurementList = useMeasurementList(false);

  const { isMeasurementListLoaded, getMeasurements } = measurementList;

  const chartDataCategoryLabelMap = useMemo(() => {
    const categoryMap = new Map<ChartDataCategory, string>();

    categoryMap.set("calories", "Calories");
    categoryMap.set("fat", "Fat");
    categoryMap.set("carbs", "Carbs");
    categoryMap.set("protein", "Protein");
    categoryMap.set("test", "Test");

    return categoryMap;
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
    return ["#6b80ed", "#e6475a", "#56db67"];
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

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);

      getDietLogList(userSettings.locale);
    };

    loadUserSettings();
  }, []);

  const handleOpenListModal = async (modalListType: ModalListType) => {
    setModalListType(modalListType);

    if (modalListType === "exercise" && !isExerciseListLoaded.current) {
      await getExercises();
    }

    if (modalListType === "measurement" && !isMeasurementListLoaded.current) {
      await getMeasurements();
    }

    listModal.onOpen();
  };

  const getDietLogList = async (locale: string) => {
    const dietLogs = await GetAllDietLogs(true);

    if (dietLogs.length === 0) {
      toast.error("No Diet Logs Entries Recorded");
      return;
    }

    const chartData: ChartData = [];

    const highestGramValueMap = new Map<ChartDataCategory, number>();
    highestGramValueMap.set("fat", 0);
    highestGramValueMap.set("carbs", 0);
    highestGramValueMap.set("protein", 0);

    for (const dietLog of dietLogs) {
      const chartDataItem = {
        date: FormatDateStringShort(dietLog.date, locale),
        calories: dietLog.calories,
        fat: dietLog.fat,
        carbs: dietLog.carbs,
        protein: dietLog.protein,
      };

      if (
        dietLog.fat !== null &&
        dietLog.fat > highestGramValueMap.get("fat")!
      ) {
        highestGramValueMap.set("fat", dietLog.fat);
      }

      if (
        dietLog.carbs !== null &&
        dietLog.carbs > highestGramValueMap.get("carbs")!
      ) {
        highestGramValueMap.set("carbs", dietLog.carbs);
      }

      if (
        dietLog.protein !== null &&
        dietLog.protein > highestGramValueMap.get("protein")!
      ) {
        highestGramValueMap.set("protein", dietLog.protein);
      }

      chartData.push(chartDataItem);
    }

    setChartData(chartData);

    // TODO: Change based on primary/secondary
    setPrimaryDataKey("calories");
    setChartDataAreas(["calories"]);
    setShownChartDataAreas(["calories"]);

    const { highestGramValueCategory, updatedHighestCategoryValues } =
      getHighestGramValueForMacros(highestGramValueMap);

    highestCategoryValues.current = updatedHighestCategoryValues;

    if (highestGramValueCategory !== "") {
      // Set the category with the highest gram value as second Y-axis
      setSecondaryDataKey(highestGramValueCategory as ChartDataCategory);

      // TODO: Change based on primary/secondary
      setSecondaryDataKeyList([...secondaryDataKeyList, "Macros"]);
      setSecondaryDataUnitCategory("Macros");
    }

    let updatedChartDataLines = [...chartDataLines];

    // Add in reverse order of Fat -> Carbs -> Protein
    if (highestGramValueMap.get("protein")! > 0) {
      updatedChartDataLines = ["protein", ...updatedChartDataLines];
    }

    if (highestGramValueMap.get("carbs")! > 0) {
      updatedChartDataLines = ["carbs", ...updatedChartDataLines];
    }

    if (highestGramValueMap.get("fat")! > 0) {
      updatedChartDataLines = ["fat", ...updatedChartDataLines];
    }

    setChartDataLines(updatedChartDataLines);
    setShownChartDataLines([...updatedChartDataLines]);

    isChartDataLoaded.current = true;
  };

  const getHighestGramValueForMacros = (
    highestGramValueMap: Map<ChartDataCategory, number>
  ) => {
    let highestGramValueCategory = "";
    let highestGramValue = 0;

    const updatedHighestCategoryValues = new Map(highestCategoryValues.current);

    for (const [key, value] of highestGramValueMap) {
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

    const updatedChartDataAreas = [
      ...chartDataAreas,
      "test" as ChartDataCategory,
    ];

    setChartData(updatedChartData);
    setChartDataAreas(updatedChartDataAreas);
  };

  const removeTestArea = () => {
    const updatedChartData = chartData.map(({ test, ...rest }) => rest);

    const updatedChartDataAreas = chartDataAreas.filter(
      (item) => item !== "test"
    );

    setChartData(updatedChartData);
    setChartDataAreas(updatedChartDataAreas);
  };

  const addTestLine = () => {
    if (chartDataAreas.includes("test") || chartDataLines.includes("test"))
      return;

    const updatedChartData = chartData.map((item) => ({
      ...item,
      test: Math.floor(Math.random() * 3000),
    }));

    setChartData(updatedChartData);
    setChartDataLines(["test", ...chartDataLines]);
    setSecondaryDataKeyList([...secondaryDataKeyList, "Calories"]);
    setSecondaryDataKey("test");
    setSecondaryDataUnitCategory("Calories");
  };

  const removeChartLine = (chartDataCategory: ChartDataCategory) => {
    if (chartDataCategory === undefined) return;

    // Remove the chartDataCategory prop from chartData
    const updatedChartData = chartData.map(
      ({ [chartDataCategory]: _, ...rest }) => rest
    );

    const updatedChartDataLines = chartDataLines.filter(
      (item) => item !== chartDataCategory
    );

    setChartData(updatedChartData);
    setChartDataLines(updatedChartDataLines);

    if (updatedChartDataLines.length === 0) {
      setSecondaryDataKey(undefined);
      setSecondaryDataUnitCategory(undefined);
      setSecondaryDataKeyList([]);
      return;
    }

    setSecondaryDataKey(updatedChartDataLines[0]);

    const updatedSecondaryDataUnitCategory = chartDataUnitCategoryMap.get(
      updatedChartDataLines[0]
    );

    setSecondaryDataUnitCategory(updatedSecondaryDataUnitCategory);

    const unitCategory = chartDataUnitCategoryMap.get(chartDataCategory);

    let shouldDeleteSecondaryDataKeyFromList = true;

    for (const line of updatedChartDataLines) {
      if (chartDataUnitCategoryMap.get(line) === unitCategory) {
        shouldDeleteSecondaryDataKeyFromList = false;
        break;
      }
    }

    if (shouldDeleteSecondaryDataKeyFromList) {
      const updatedSecondaryDataKeyList = secondaryDataKeyList.filter(
        (item) => item !== unitCategory
      );
      setSecondaryDataKeyList(updatedSecondaryDataKeyList);
    }
  };

  const changeSecondaryDataUnitCategory = (unitCategory: string) => {
    if (unitCategory === "Macros") {
      const { highestGramValueCategory } = getHighestGramValueForMacros(
        highestCategoryValues.current
      );

      setChartDataLines(
        MoveListOfItemsToStartOfList(chartDataLines as string[], [
          "fat",
          "carbs",
          "protein",
        ]) as ChartDataCategory[]
      );

      setSecondaryDataKey(highestGramValueCategory as ChartDataCategory);
      setSecondaryDataUnitCategory(unitCategory);
    } else if (unitCategory === "Calories") {
      setChartDataLines(
        MoveItemToStartOfList(
          chartDataLines as string[],
          "test"
        ) as ChartDataCategory[]
      );

      setSecondaryDataKey("test");
      setSecondaryDataUnitCategory(unitCategory);
    }
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
                ) : (
                  <MeasurementModalList
                    useMeasurementList={measurementList}
                    handleMeasurementClick={() => {}}
                    customHeightString="h-[440px]"
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
            <ChartContainer config={chartConfig} className="w-[860px]">
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
        <div className="flex flex-col gap-2">
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
              onPress={() => getDietLogList(userSettings.locale)}
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
                    setShownChartDataLines(
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
                  isDisabled={secondaryDataKeyList.length < 2}
                >
                  {secondaryDataKeyList.map((dataKey) => (
                    <SelectItem key={dataKey} value={dataKey}>
                      {dataKey}
                    </SelectItem>
                  ))}
                </Select>
              </>
            )}
          </div>
          <div className="flex gap-2">
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
              onPress={() => removeChartLine("test")}
            >
              Remove Test Line
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
