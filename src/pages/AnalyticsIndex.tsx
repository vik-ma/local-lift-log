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
import { useEffect, useState } from "react";
import {
  ExerciseModalList,
  FilterExerciseGroupsModal,
  LoadingSpinner,
  MeasurementModalList,
} from "../components";
import { UserSettings } from "../typings";
import { GetAllDietLogs, GetUserSettings } from "../helpers";
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

export default function AnalyticsIndex() {
  const [modalListType, setModalListType] = useState<ModalListType>("exercise");
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [chartData, setChartData] = useState<ChartData>([]);

  const listModal = useDisclosure();

  const exerciseList = useExerciseList(false, true, true);

  const { isExerciseListLoaded, getExercises } = exerciseList;

  const filterExerciseList = useFilterExerciseList(exerciseList);

  const measurementList = useMeasurementList(false);

  const { isMeasurementListLoaded, getMeasurements } = measurementList;

  const chartConfig: ChartConfig = {
    calories: {
      label: "Calories",
    },
    fat: { label: "Fat" },
    carbs: { label: "Carbs" },
    protein: { label: "Protein" },
  };

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);
    };

    getDietLogList();
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

  const getDietLogList = async () => {
    const dietLogs = await GetAllDietLogs(true);

    const chartData: ChartData = dietLogs.map(
      ({ date, calories, fat, carbs, protein }) => ({
        date,
        calories,
        fat,
        carbs,
        protein,
      })
    );

    setChartData(chartData);
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
              <XAxis dataKey="date" />
              <YAxis yAxisId="calories" />
              <YAxis dataKey="fat" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                isAnimationActive={false}
                yAxisId="calories"
                dataKey="calories"
                stroke="#edc345"
                fill="#edc345"
                activeDot={{ r: 6 }}
              />
              <Line
                isAnimationActive={false}
                dataKey="fat"
                stroke="#6b80ed"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                isAnimationActive={false}
                dataKey="carbs"
                stroke="#e6475a"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                isAnimationActive={false}
                dataKey="protein"
                stroke="#56db67"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
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
            onPress={getDietLogList}
          >
            Load Diet Logs
          </Button>
        </div>
      </div>
    </>
  );
}
