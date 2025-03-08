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
  ChartDataExerciseCategoryBase,
  ChartDataUnitCategory,
  Exercise,
  UseDisclosureReturnType,
} from "../../typings";
import { useMemo, useState } from "react";

type LoadExerciseChartModalProps = {
  loadExerciseChartModal: UseDisclosureReturnType;
  selectedExercise: Exercise | undefined;
  loadExerciseOptions: Set<ChartDataExerciseCategoryBase>;
  setLoadExerciseOptions: React.Dispatch<
    React.SetStateAction<Set<ChartDataExerciseCategoryBase>>
  >;
  disabledLoadExerciseOptions: Set<ChartDataExerciseCategoryBase>;
  loadExerciseOptionsUnitCategory: ChartDataUnitCategory;
  setLoadExerciseOptionsUnitCategory: React.Dispatch<
    React.SetStateAction<ChartDataUnitCategory>
  >;
  loadExerciseOptionsUnitCategories: Set<ChartDataUnitCategory>;
  setLoadExerciseOptionsUnitCategories: React.Dispatch<
    React.SetStateAction<Set<ChartDataUnitCategory>>
  >;
  chartDataAreas: ChartDataCategory[];
  chartDataUnitCategoryMap: Map<ChartDataCategory, ChartDataUnitCategory>;
  loadExerciseOptionsMap: Map<ChartDataExerciseCategoryBase, string>;
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
  setLoadExerciseOptionsUnitCategories,
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

  const handleLoadExerciseOptionsChange = (
    key: ChartDataExerciseCategoryBase
  ) => {
    const updatedLoadExerciseOptions = new Set(loadExerciseOptions);

    // Set key as loadExerciseOptionsUnitCategory if no Chart Areas exist
    // and loadExerciseOptions was previously empty
    if (chartDataAreas.length === 0 && updatedLoadExerciseOptions.size === 0) {
      setLoadExerciseOptionsUnitCategory(chartDataUnitCategoryMap.get(key));
    }

    if (updatedLoadExerciseOptions.has(key)) {
      updatedLoadExerciseOptions.delete(key);
    } else {
      updatedLoadExerciseOptions.add(key);
    }

    if (updatedLoadExerciseOptions.size > 0) {
      const updatedUnitCategories = new Set<ChartDataUnitCategory>();

      let shouldChangeCategory = true;

      if (chartDataAreas.length > 0) {
        // Never automatically change category if any Chart Areas exist
        shouldChangeCategory = false;
        updatedUnitCategories.add(
          chartDataUnitCategoryMap.get(chartDataAreas[0])
        );
      }

      for (const option of updatedLoadExerciseOptions) {
        const unitCategory = chartDataUnitCategoryMap.get(option);

        updatedUnitCategories.add(unitCategory);

        if (unitCategory === loadExerciseOptionsUnitCategory) {
          shouldChangeCategory = false;
        }
      }

      setLoadExerciseOptionsUnitCategories(updatedUnitCategories);

      // Change loadExerciseOptionsUnitCategory if last option with that category was deleted
      if (shouldChangeCategory) {
        const newValue = chartDataUnitCategoryMap.get(
          updatedLoadExerciseOptions.values().next().value
        );

        setLoadExerciseOptionsUnitCategory(newValue);
      }
    }

    if (chartDataAreas.length > 0 && updatedLoadExerciseOptions.size === 0) {
      const chartAreaUnitCategory = chartDataUnitCategoryMap.get(
        chartDataAreas[0]
      );

      setLoadExerciseOptionsUnitCategories(new Set([chartAreaUnitCategory]));
      setLoadExerciseOptionsUnitCategory(chartAreaUnitCategory);
    }

    if (chartDataAreas.length === 0 && updatedLoadExerciseOptions.size === 0) {
      setLoadExerciseOptionsUnitCategories(new Set());
      setLoadExerciseOptionsUnitCategory(undefined);
    }

    setLoadExerciseOptions(updatedLoadExerciseOptions);
  };

  const removeFilter = (key: ChartDataUnitCategory) => {
    const updatedFilterCategories = new Set(filterCategories);
    updatedFilterCategories.delete(key);
    setFilterCategories(updatedFilterCategories);
  };

  const handleClearAllStatsButton = () => {
    setLoadExerciseOptions(new Set());
    setLoadExerciseOptionsUnitCategories(new Set());
    setLoadExerciseOptionsUnitCategory(undefined);
  };

  const handleLoadExerciseOptionsUnitCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value === "" ? undefined : e.target.value;

    setLoadExerciseOptionsUnitCategory(value as ChartDataUnitCategory);
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
              <span className="w-[24rem] truncate">
                Stats To Load For{" "}
                {selectedExercise !== undefined && (
                  <span className="text-secondary">
                    {selectedExercise.name}
                  </span>
                )}
              </span>
            </ModalHeader>
            <ModalBody className="pt-0">
              <div className="h-[448px] flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
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
                          handleLoadExerciseOptionsUnitCategoryChange(e)
                        }
                        isDisabled={loadExerciseOptionsUnitCategories.size < 2}
                        disallowEmptySelection
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
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <Dropdown closeOnSelect={false}>
                        <DropdownTrigger>
                          <Button
                            className="z-1"
                            variant="flat"
                            color={
                              filterCategories.size > 0
                                ? "secondary"
                                : "default"
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
                            <DropdownItem key={category}>
                              {category}
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>
                      {filterCategories.size > 0 && (
                        <span className="text-secondary text-sm px-0.5">
                          (Showing {filteredLoadExerciseOptionsMap.size} out of{" "}
                          {loadExerciseOptionsMap.size} options)
                        </span>
                      )}
                    </div>
                    {loadExerciseOptions.size > 0 && (
                      <Button
                        className="z-1"
                        variant="flat"
                        color="danger"
                        size="sm"
                        onPress={handleClearAllStatsButton}
                      >
                        Clear All Stats
                      </Button>
                    )}
                  </div>
                  {filterCategories.size > 0 && (
                    <div className="flex items-center gap-1 flex-wrap max-w-[25rem]">
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
                            key as ChartDataExerciseCategoryBase
                          )}
                          onValueChange={() =>
                            handleLoadExerciseOptionsChange(
                              key as ChartDataExerciseCategoryBase
                            )
                          }
                          isDisabled={disabledLoadExerciseOptions.has(
                            key as ChartDataExerciseCategoryBase
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
            <ModalFooter className="flex justify-between items-center">
              <div></div>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  isDisabled={
                    loadExerciseOptions.size === 0 ||
                    (loadExerciseOptionsUnitCategory === undefined &&
                      chartDataAreas.length === 0)
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
