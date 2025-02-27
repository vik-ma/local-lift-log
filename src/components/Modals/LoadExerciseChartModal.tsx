import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Checkbox,
  ScrollShadow,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  ChartDataCategory,
  ChartDataUnitCategory,
  Exercise,
  UseDisclosureReturnType,
} from "../../typings";
import { useMemo } from "react";

type LoadExerciseChartModalProps = {
  loadExerciseChartModal: UseDisclosureReturnType;
  selectedExercise: Exercise | undefined;
  loadExerciseOptions: Set<ChartDataCategory>;
  setLoadExerciseOptions: React.Dispatch<
    React.SetStateAction<Set<ChartDataCategory>>
  >;
  disabledLoadExerciseOptions: Set<ChartDataUnitCategory>;
  loadExerciseOptionsUnitCategory: ChartDataUnitCategory;
  setLoadExerciseOptionsUnitCategory: React.Dispatch<
    React.SetStateAction<ChartDataUnitCategory>
  >;
  loadExerciseOptionsUnitCategories: Set<ChartDataUnitCategory>;
  chartDataAreas: ChartDataCategory[];
  chartDataUnitCategoryMap: Map<ChartDataCategory, ChartDataUnitCategory>;
  loadExerciseStats: () => void;
};

export const LoadExerciseChartModal = ({
  loadExerciseChartModal,
  selectedExercise,
  loadExerciseOptions,
  setLoadExerciseOptions,
  disabledLoadExerciseOptions,
  loadExerciseOptionsUnitCategory,
  setLoadExerciseOptionsUnitCategory,
  loadExerciseOptionsUnitCategories,
  chartDataAreas,
  chartDataUnitCategoryMap,
  loadExerciseStats,
}: LoadExerciseChartModalProps) => {
  const handleLoadExerciseOptionsChange = (key: ChartDataCategory) => {
    const updatedLoadExerciseOptions = new Set(loadExerciseOptions);

    // Set key as loadExerciseOptionsUnitCategory if loadExerciseOptions was empty
    if (updatedLoadExerciseOptions.size === 0) {
      setLoadExerciseOptionsUnitCategory(chartDataUnitCategoryMap.get(key));
    }

    if (updatedLoadExerciseOptions.has(key)) {
      updatedLoadExerciseOptions.delete(key);
    } else {
      updatedLoadExerciseOptions.add(key);
    }

    if (updatedLoadExerciseOptions.size > 0) {
      let shouldChangeCategory = true;

      for (const option of updatedLoadExerciseOptions) {
        if (
          chartDataUnitCategoryMap.get(option) ===
          loadExerciseOptionsUnitCategory
        ) {
          shouldChangeCategory = false;
          break;
        }
      }

      // Change loadExerciseOptionsUnitCategory if last option with that category was deleted
      if (shouldChangeCategory) {
        const newValue = chartDataUnitCategoryMap.get(
          updatedLoadExerciseOptions.values().next().value
        );

        setLoadExerciseOptionsUnitCategory(newValue);
      }
    }

    if (updatedLoadExerciseOptions.size === 0) {
      setLoadExerciseOptionsUnitCategory(undefined);
    }

    setLoadExerciseOptions(updatedLoadExerciseOptions);
  };

  const loadExerciseOptionsMap = useMemo(() => {
    const optionsMap = new Map<string, string>();

    optionsMap.set("weight_min", "Min Weight");
    optionsMap.set("weight_max", "Max Weight");
    optionsMap.set("weight_average", "Average Weight");
    optionsMap.set("weight_total", "Total Weight");
    optionsMap.set("volume", "Volume");
    optionsMap.set("num_sets", "Number Of Sets");
    optionsMap.set("num_reps_min", "Min Reps");
    optionsMap.set("num_reps_max", "Max Reps");
    optionsMap.set("num_reps_average", "Average Reps");
    optionsMap.set("num_reps_total", "Total Reps");
    optionsMap.set("num_reps_and_partial_reps_min", "Min Reps + Partial Reps");
    optionsMap.set("num_reps_and_partial_reps_max", "Max Reps + Partial Reps");
    optionsMap.set(
      "num_reps_and_partial_reps_average",
      "Average Reps + Partial Reps"
    );
    optionsMap.set(
      "num_reps_and_partial_reps_total",
      "Total Reps + Partial Reps"
    );
    optionsMap.set("num_partial_reps_min", "Min Partial Reps");
    optionsMap.set("num_partial_reps_max", "Max Partial Reps");
    optionsMap.set("num_partial_reps_average", "Average Partial Reps");
    optionsMap.set("num_partial_reps_total", "Total Partial Reps");
    optionsMap.set("set_body_weight", "Body Weight");
    optionsMap.set("rir_min", "Min RIR");
    optionsMap.set("rir_max", "Max RIR");
    optionsMap.set("rir_average", "Average RIR");
    optionsMap.set("rpe_min", "Min RPE");
    optionsMap.set("rpe_max", "Max RPE");
    optionsMap.set("rpe_average", "Average RPE");
    optionsMap.set("distance_min", "Min Distance");
    optionsMap.set("distance_max", "Max Distance");
    optionsMap.set("distance_average", "Average Distance");
    optionsMap.set("distance_total", "Total Distance");
    optionsMap.set("time_min", "Min Time");
    optionsMap.set("time_max", "Max Time");
    optionsMap.set("time_average", "Average Time");
    optionsMap.set("time_total", "Total Time");
    optionsMap.set("distance_per_time_min", "Min Pace");
    optionsMap.set("distance_per_time_max", "Max Pace");
    optionsMap.set("distance_per_time_average", "Average Pace");
    optionsMap.set("resistance_level_min", "Min Resistance Level");
    optionsMap.set("resistance_level_max", "Max Resistance Level");
    optionsMap.set("resistance_level_average", "Average Resistance Level");

    return optionsMap;
  }, []);

  return (
    <Modal
      isOpen={loadExerciseChartModal.isOpen}
      onOpenChange={loadExerciseChartModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <span className="w-[24rem] truncate">
                Stats To Load For{" "}
                {selectedExercise !== undefined && (
                  <span className="text-secondary">
                    {selectedExercise.name}
                  </span>
                )}
              </span>
            </ModalHeader>
            <ModalBody>
              <ScrollShadow className="h-[432px] flex flex-col gap-2">
                <div className="columns-2">
                  {Array.from(loadExerciseOptionsMap).map(([key, value]) => (
                    <Checkbox
                      key={key}
                      className="hover:underline w-full min-w-full -mb-1"
                      color="primary"
                      isSelected={loadExerciseOptions.has(
                        key as ChartDataCategory
                      )}
                      onValueChange={() =>
                        handleLoadExerciseOptionsChange(
                          key as ChartDataCategory
                        )
                      }
                      isDisabled={disabledLoadExerciseOptions.has(
                        key as ChartDataUnitCategory
                      )}
                    >
                      {value}
                    </Checkbox>
                  ))}
                </div>
              </ScrollShadow>
            </ModalBody>
            <ModalFooter
              className={"h-[80px] flex justify-between items-center"}
            >
              <div className="w-[11.75rem]">
                <Select
                  label="Chart Area Category"
                  classNames={{
                    trigger: "bg-amber-50 border-amber-200",
                  }}
                  size="sm"
                  variant="faded"
                  selectedKeys={
                    loadExerciseOptionsUnitCategory !== undefined
                      ? ([loadExerciseOptionsUnitCategory] as string[])
                      : []
                  }
                  onChange={(e) =>
                    setLoadExerciseOptionsUnitCategory(
                      e.target.value as ChartDataUnitCategory
                    )
                  }
                  disallowEmptySelection={chartDataAreas.length === 0}
                >
                  {Array.from(loadExerciseOptionsUnitCategories).map(
                    (category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    )
                  )}
                </Select>
              </div>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  isDisabled={
                    loadExerciseOptions.size === 0 ||
                    loadExerciseOptionsUnitCategory === undefined
                  }
                  onPress={loadExerciseStats}
                >
                  Load
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
