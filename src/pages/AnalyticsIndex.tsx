import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useDisclosure,
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

  const highestCategoryValues = useRef<Map<ChartDataCategory, number>>(
    new Map()
  );

  const isChartDataLoaded = useRef<boolean>(false);

  const listModal = useDisclosure();

  const exerciseList = useExerciseList(false, true, true);

  const { isExerciseListLoaded, getExercises } = exerciseList;

  const filterExerciseList = useFilterExerciseList(exerciseList);

  const measurementList = useMeasurementList(false);

  const { isMeasurementListLoaded, getMeasurements } = measurementList;

  const chartConfig: ChartConfig = useMemo(() => {
    return {
      calories: {
        label: "Calories",
      },
      fat: { label: "Fat" },
      carbs: { label: "Carbs" },
      protein: { label: "Protein" },
      test: { label: "Test" },
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
    setChartDataAreas(["calories"]);
    setChartDataLines(["fat", "carbs", "protein"]);
    setPrimaryDataKey("calories");
    setSecondaryDataKeyList([...secondaryDataKeyList, "Macros"]);

    let highestGramValueCategory = "";
    let highestGramValue = 0;

    const updatedHighestCategoryValues = new Map(highestCategoryValues.current);

    for (const [key, value] of highestGramValueMap) {
      if (value > highestGramValue) {
        highestGramValueCategory = key!;
        highestGramValue = value;
      }

      updatedHighestCategoryValues.set(key, value);
    }

    highestCategoryValues.current = updatedHighestCategoryValues;

    if (highestGramValueCategory !== "") {
      // Set the category with the highest gram value as second Y-axis
      setSecondaryDataKey(highestGramValueCategory as ChartDataCategory);
    }

    isChartDataLoaded.current = true;
  };

  const formatXAxisDate = (date: string) => {
    const cutoff =
      userSettings === undefined || userSettings.locale === "en-US" ? 6 : 5;

    return date.substring(0, date.length - cutoff);
  };

  const addSecondArea = () => {
    if (chartDataAreas.includes("test")) return;

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

  const removeSecondArea = () => {
    const updatedChartData = chartData.map(({ test, ...rest }) => rest);

    const updatedChartDataAreas = chartDataAreas.filter(
      (item) => item !== "test"
    );

    setChartData(updatedChartData);
    setChartDataAreas(updatedChartDataAreas);
  };

  const addTestLine = () => {
    if (chartDataAreas.includes("test")) return;

    const updatedChartData = chartData.map((item) => ({
      ...item,
      test: Math.floor(Math.random() * 3000),
    }));

    setChartData(updatedChartData);
    setChartDataLines(["test", ...chartDataLines]);
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
            <ChartContainer config={chartConfig} className="w-[960px]">
              <ComposedChart
                data={chartData}
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
                  unit={chartDataUnitMap.get(secondaryDataKey)}
                  orientation="right"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {chartDataAreas.map((item, index) => (
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
                {chartDataLines.map((item, index) => (
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
        <div className="flex gap-2">
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
          <Button
            className="font-medium"
            variant="flat"
            onPress={addSecondArea}
          >
            Add Second Area
          </Button>
          <Button
            className="font-medium"
            variant="flat"
            onPress={removeSecondArea}
          >
            Remove Second Area
          </Button>
          <Button className="font-medium" variant="flat" onPress={addTestLine}>
            Add Test Line
          </Button>
        </div>
      </div>
    </>
  );
}
