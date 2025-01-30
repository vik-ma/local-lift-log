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
import { DietLog, UserSettings } from "../typings";
import { GetAllDietLogs, GetUserSettings } from "../helpers";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { ChartConfig, ChartContainer } from "../components/ui/chart";

type ModalListType = "exercise" | "measurement";

export default function AnalyticsIndex() {
  const [modalListType, setModalListType] = useState<ModalListType>("exercise");
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [chartData, setChartData] = useState<DietLog[]>([]);

  const listModal = useDisclosure();

  const exerciseList = useExerciseList(true, true, true);

  const { isExerciseListLoaded } = exerciseList;

  const filterExerciseList = useFilterExerciseList(exerciseList);

  const measurementList = useMeasurementList(false);

  const { isMeasurementListLoaded, getMeasurements } = measurementList;

  const chartConfig: ChartConfig = {};

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);
    };

    loadUserSettings();
  }, []);

  const handleOpenListModal = async (modalListType: ModalListType) => {
    setModalListType(modalListType);

    if (modalListType === "measurement" && !isMeasurementListLoaded.current) {
      await getMeasurements();
    }

    listModal.onOpen();
  };

  const getDietLogList = async () => {
    const dietLogs = await GetAllDietLogs(true);

    setChartData(dietLogs);
  };

  if (userSettings === undefined || !isExerciseListLoaded.current)
    return <LoadingSpinner />;

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
          <ChartContainer config={chartConfig} className="min-h-[450px]">
            <AreaChart width={0} height={0} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="calories" />
              <YAxis yAxisId="fat" orientation="right" />
              <Tooltip />
              <Legend />
              <Area
                yAxisId="calories"
                type="monotone"
                dataKey="calories"
                stroke="#8884d8"
                activeDot={{ r: 6 }}
              />
              <Area
                yAxisId="fat"
                type="monotone"
                dataKey="fat"
                stroke="#82ca9d"
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
        <div className="flex flex-col gap-1.5">
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
