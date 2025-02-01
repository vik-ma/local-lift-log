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
}[];

type ChartDataCategory = undefined | "calories" | "fat" | "carbs" | "protein";

type ChartDataUnitMap = Map<ChartDataCategory, string>;

export default function AnalyticsIndex() {
  const [modalListType, setModalListType] = useState<ModalListType>("exercise");
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [chartData, setChartData] = useState<ChartData>([]);
  const [chartDataLines, setChartDataLines] = useState<ChartDataCategory[]>([]);
  const [primaryDataKey, setPrimaryDataKey] = useState<ChartDataCategory>();
  const [secondaryDataKey, setSecondaryDataKey] = useState<ChartDataCategory>();

  const highestCategoryValues = useRef<Map<ChartDataCategory, number>>(
    new Map()
  );

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
    };
  }, []);

  const chartLineColorList = useMemo(() => {
    return ["#6b80ed", "#e6475a", "#56db67"];
  }, []);

  const chartDataUnitMap = useMemo(() => {
    const unitMap: ChartDataUnitMap = new Map<ChartDataCategory, string>();

    unitMap.set("calories", " kcal");
    unitMap.set("fat", " g");
    unitMap.set("carbs", " g");
    unitMap.set("protein", " g");

    return unitMap;
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
    setChartDataLines(["fat", "carbs", "protein"]);
    setPrimaryDataKey("calories");

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
  };

  const formatXAxisDate = (date: string) => {
    const cutoff =
      userSettings === undefined || userSettings.locale === "en-US" ? 6 : 5;

    return date.substring(0, date.length - cutoff);
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
        <div className="bg-default-50 pt-5 pb-1.5 rounded-xl">
          <ChartContainer config={chartConfig} className="w-[900px]">
            <ComposedChart data={chartData}>
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
                dataKey={secondaryDataKey ?? ""}
                unit={chartDataUnitMap.get(secondaryDataKey)}
                orientation="right"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                isAnimationActive={false}
                yAxisId={primaryDataKey}
                dataKey={primaryDataKey ?? ""}
                stroke="#edc345"
                fill="#edc345"
                activeDot={{ r: 6 }}
              />
              {chartDataLines.map((item, index) => (
                <Line
                  key={item}
                  isAnimationActive={false}
                  dataKey={item}
                  stroke={chartLineColorList[index % chartLineColorList.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              ))}
            </ComposedChart>
          </ChartContainer>
        </div>
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
        </div>
      </div>
    </>
  );
}
