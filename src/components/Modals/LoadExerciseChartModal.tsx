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
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  SharedSelection,
} from "@heroui/react";
import {
  ChartDataCategory,
  ChartDataUnitCategory,
  Exercise,
  UseDisclosureReturnType,
} from "../../typings";
import { useMemo, useState } from "react";

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
  loadExerciseOptionsMap: Map<string, string>;
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
  loadExerciseOptionsMap,
  loadExerciseStats,
}: LoadExerciseChartModalProps) => {
  const [filterCategories, setFilterCategories] = useState<
    Set<ChartDataUnitCategory>
  >(new Set());

  const optionCategories = [
    "Weight",
    "Number Of Sets",
    "Number Of Reps",
    "RIR",
    "RPE",
    "Distance",
    "Time",
    "Pace",
    "Resistance Level",
  ];

  const filteredLoadExerciseOptionsMap = useMemo(() => {
    if (filterCategories.size > 0) {
      return new Map(
        [...loadExerciseOptionsMap].filter(([key]) =>
          filterCategories.has(
            chartDataUnitCategoryMap.get(key as ChartDataCategory)
          )
        )
      );
    }
    return loadExerciseOptionsMap;
  }, [filterCategories, loadExerciseOptionsMap, chartDataUnitCategoryMap]);

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

  return (
    <Modal
      isOpen={loadExerciseChartModal.isOpen}
      onOpenChange={loadExerciseChartModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="flex items-center justify-between w-[24rem]">
                <span className="w-[19.5rem] truncate">
                  Stats To Load For{" "}
                  {selectedExercise !== undefined && (
                    <span className="text-secondary">
                      {selectedExercise.name}
                    </span>
                  )}
                </span>
                <div className="pr-1">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        className="z-1"
                        variant="flat"
                        color={
                          filterCategories.size > 0 ? "secondary" : "default"
                        }
                        size="sm"
                      >
                        Filter
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Filter Option Categories Dropdown Menu"
                      selectedKeys={filterCategories as Set<string>}
                      selectionMode="multiple"
                      onSelectionChange={
                        setFilterCategories as React.Dispatch<
                          React.SetStateAction<SharedSelection>
                        >
                      }
                    >
                      {optionCategories.map((category) => (
                        <DropdownItem key={category}>{category}</DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <ScrollShadow className="h-[432px] flex flex-col gap-1.5">
                <div className="flex"></div>
                <div className="columns-2">
                  {Array.from(filteredLoadExerciseOptionsMap).map(
                    ([key, value]) => (
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
                    )
                  )}
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
