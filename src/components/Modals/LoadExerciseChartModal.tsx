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
  Chip,
} from "@heroui/react";
import {
  ChartDataCategory,
  ChartDataExerciseCategory,
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
  loadExerciseOptionsMap: Map<ChartDataExerciseCategory, string>;
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
        [...loadExerciseOptionsMap].filter(
          ([key]) =>
            filterCategories.has(
              chartDataUnitCategoryMap.get(key as ChartDataCategory)
            ) || loadExerciseOptions.has(key)
        )
      );
    }
    return loadExerciseOptionsMap;
  }, [
    filterCategories,
    loadExerciseOptionsMap,
    chartDataUnitCategoryMap,
    loadExerciseOptions,
  ]);

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

  const removeFilter = (key: ChartDataUnitCategory) => {
    const updatedFilterCategories = new Set(filterCategories);
    updatedFilterCategories.delete(key);
    setFilterCategories(updatedFilterCategories);
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
              <div className="flex items-end justify-between w-[24rem]">
                <span className="w-[19.5rem] truncate">
                  Stats To Load For{" "}
                  {selectedExercise !== undefined && (
                    <span className="text-secondary">
                      {selectedExercise.name}
                    </span>
                  )}
                </span>
                <div className="pr-0.5">
                  <Dropdown closeOnSelect={false}>
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
            <ModalBody className="pt-0">
              <div className="h-[436px] flex flex-col gap-1.5">
                <div className="flex flex-col">
                  <div className="flex gap-1 items-baseline">
                    <div className="flex items-baseline gap-[5px] font-medium text-lg">
                      <span className="font-semibold text-2xl text-yellow-500">
                        {loadExerciseOptions.size}
                      </span>
                      <span>Stats Selected</span>
                    </div>
                    {filterCategories.size > 0 && (
                      <span className="text-secondary text-xs px-0.5">
                        (Showing {filteredLoadExerciseOptionsMap.size} out of{" "}
                        {loadExerciseOptionsMap.size} options)
                      </span>
                    )}
                  </div>
                  {filterCategories.size > 0 && (
                    <div className="flex items-center gap-1 flex-wrap max-w-[24rem]">
                      {Array.from(filterCategories).map((category) => (
                        <Chip
                          key={category}
                          classNames={{ content: "max-w-[20rem] truncate" }}
                          radius="sm"
                          color="secondary"
                          variant="flat"
                          onClose={() => removeFilter(category)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="font-medium">{category}</span>
                        </Chip>
                      ))}
                    </div>
                  )}
                </div>
                <ScrollShadow className="pb-1">
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
              </div>
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
