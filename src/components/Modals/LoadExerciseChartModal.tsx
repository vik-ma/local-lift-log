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
  loadExerciseOptionsUnitCategoryPrimary: ChartDataUnitCategory;
  setLoadExerciseOptionsUnitCategoryPrimary: React.Dispatch<
    React.SetStateAction<ChartDataUnitCategory>
  >;
  loadExerciseOptionsUnitCategorySecondary: ChartDataUnitCategory;
  setLoadExerciseOptionsUnitCategorySecondary: React.Dispatch<
    React.SetStateAction<ChartDataUnitCategory>
  >;
  loadExerciseOptionsUnitCategoriesPrimary: Set<ChartDataUnitCategory>;
  setLoadExerciseOptionsUnitCategoriesPrimary: React.Dispatch<
    React.SetStateAction<Set<ChartDataUnitCategory>>
  >;
  loadExerciseOptionsUnitCategoriesSecondary: ChartDataUnitCategory[];
  setLoadExerciseOptionsUnitCategoriesSecondary: React.Dispatch<
    React.SetStateAction<ChartDataUnitCategory[]>
  >;
  chartDataAreas: ChartDataCategory[];
  chartDataUnitCategoryMap: Map<ChartDataCategory, ChartDataUnitCategory>;
  loadExerciseOptionsMap: Map<ChartDataExerciseCategoryBase, string>;
  secondaryDataUnitCategory: ChartDataUnitCategory;
  loadExerciseStats: () => void;
};

export const LoadExerciseChartModal = ({
  loadExerciseChartModal,
  selectedExercise,
  loadExerciseOptions,
  setLoadExerciseOptions,
  disabledLoadExerciseOptions,
  loadExerciseOptionsUnitCategoryPrimary,
  setLoadExerciseOptionsUnitCategoryPrimary,
  loadExerciseOptionsUnitCategorySecondary,
  setLoadExerciseOptionsUnitCategorySecondary,
  loadExerciseOptionsUnitCategoriesPrimary,
  setLoadExerciseOptionsUnitCategoriesPrimary,
  loadExerciseOptionsUnitCategoriesSecondary,
  setLoadExerciseOptionsUnitCategoriesSecondary,
  chartDataAreas,
  chartDataUnitCategoryMap,
  loadExerciseOptionsMap,
  secondaryDataUnitCategory,
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

    let updatedUnitCategoryPrimary: ChartDataUnitCategory =
      loadExerciseOptionsUnitCategoryPrimary;

    // Set key as loadExerciseOptionsUnitCategoryPrimary if no Chart Areas exist
    // and loadExerciseOptions was previously empty
    if (chartDataAreas.length === 0 && updatedLoadExerciseOptions.size === 0) {
      updatedUnitCategoryPrimary = chartDataUnitCategoryMap.get(key);
    }

    if (updatedLoadExerciseOptions.has(key)) {
      updatedLoadExerciseOptions.delete(key);
    } else {
      updatedLoadExerciseOptions.add(key);
    }

    const updatedUnitCategoriesPrimary = new Set<ChartDataUnitCategory>();

    if (updatedLoadExerciseOptions.size > 0) {
      let shouldChangeCategory = true;

      if (chartDataAreas.length > 0) {
        // Never automatically change category if any Chart Areas exist
        shouldChangeCategory = false;
        updatedUnitCategoriesPrimary.add(
          chartDataUnitCategoryMap.get(chartDataAreas[0])
        );
      }

      for (const option of updatedLoadExerciseOptions) {
        const unitCategory = chartDataUnitCategoryMap.get(option);

        updatedUnitCategoriesPrimary.add(unitCategory);

        if (unitCategory === loadExerciseOptionsUnitCategoryPrimary) {
          shouldChangeCategory = false;
        }
      }

      setLoadExerciseOptionsUnitCategoriesPrimary(updatedUnitCategoriesPrimary);

      // Change loadExerciseOptionsUnitCategoryPrimary if last option with that category was deleted
      if (shouldChangeCategory) {
        updatedUnitCategoryPrimary = chartDataUnitCategoryMap.get(
          updatedLoadExerciseOptions.values().next().value
        );
      }

      // Modify loadExerciseOptionsUnitCategorySecondary if previously undefined
      // or if deleting last option with that category
      if (
        (loadExerciseOptionsUnitCategorySecondary === undefined ||
          !updatedUnitCategoriesPrimary.has(
            loadExerciseOptionsUnitCategorySecondary
          )) &&
        updatedUnitCategoriesPrimary.size > 1
      ) {
        setLoadExerciseOptionsUnitCategorySecondary(
          Array.from(updatedUnitCategoriesPrimary)[1]
        );
      }

      // Set loadExerciseOptionsUnitCategorySecondary to undefined
      // if there is only one category left
      if (
        loadExerciseOptionsUnitCategorySecondary !== undefined &&
        updatedUnitCategoriesPrimary.size < 2 &&
        loadExerciseOptionsUnitCategorySecondary !== secondaryDataUnitCategory
      ) {
        setLoadExerciseOptionsUnitCategorySecondary(undefined);
      }
    }

    if (chartDataAreas.length > 0 && updatedLoadExerciseOptions.size === 0) {
      const chartAreaUnitCategory = chartDataUnitCategoryMap.get(
        chartDataAreas[0]
      );

      setLoadExerciseOptionsUnitCategoriesPrimary(
        new Set([chartAreaUnitCategory])
      );

      updatedUnitCategoryPrimary = chartAreaUnitCategory;
    }

    if (chartDataAreas.length === 0 && updatedLoadExerciseOptions.size === 0) {
      setLoadExerciseOptionsUnitCategoriesPrimary(new Set());
      updatedUnitCategoryPrimary = undefined;
    }

    const updatedUnitCategoriesSecondary: ChartDataUnitCategory[] = [];

    if (secondaryDataUnitCategory !== undefined) {
      updatedUnitCategoriesSecondary.push(secondaryDataUnitCategory);
    }

    updatedUnitCategoriesSecondary.push(
      ...Array.from(updatedUnitCategoriesPrimary).filter(
        (value) => value !== updatedUnitCategoryPrimary
      )
    );

    setLoadExerciseOptions(updatedLoadExerciseOptions);
    setLoadExerciseOptionsUnitCategoryPrimary(updatedUnitCategoryPrimary);
    setLoadExerciseOptionsUnitCategoriesSecondary(
      updatedUnitCategoriesSecondary
    );
  };

  const removeFilter = (key: ChartDataUnitCategory) => {
    const updatedFilterCategories = new Set(filterCategories);
    updatedFilterCategories.delete(key);
    setFilterCategories(updatedFilterCategories);
  };

  const handleClearAllButton = () => {
    setLoadExerciseOptions(new Set());

    let updatedUnitCategoryPrimary: ChartDataUnitCategory = undefined;
    const updatedUnitCategoriesPrimary = new Set<ChartDataUnitCategory>();
    const updatedUnitCategoriesSecondary: ChartDataUnitCategory[] = [];

    if (chartDataAreas.length > 0) {
      updatedUnitCategoryPrimary = chartDataUnitCategoryMap.get(
        chartDataAreas[0]
      );
      updatedUnitCategoriesPrimary.add(updatedUnitCategoryPrimary);
    }

    if (secondaryDataUnitCategory !== undefined) {
      updatedUnitCategoriesSecondary.push(secondaryDataUnitCategory);
    }

    setLoadExerciseOptionsUnitCategoryPrimary(updatedUnitCategoryPrimary);
    setLoadExerciseOptionsUnitCategoriesPrimary(updatedUnitCategoriesPrimary);
    setLoadExerciseOptionsUnitCategorySecondary(secondaryDataUnitCategory);
    setLoadExerciseOptionsUnitCategoriesSecondary(
      updatedUnitCategoriesSecondary
    );
  };

  const handleLoadExerciseOptionsUnitCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value === "" ? undefined : e.target.value;

    if (value === loadExerciseOptionsUnitCategorySecondary) {
      const updatedUnitCategoriesSecondary =
        loadExerciseOptionsUnitCategoriesSecondary.filter(
          (category) => category !== value
        );

      updatedUnitCategoriesSecondary.push(
        loadExerciseOptionsUnitCategoryPrimary
      );

      setLoadExerciseOptionsUnitCategorySecondary(
        loadExerciseOptionsUnitCategoryPrimary
      );
      setLoadExerciseOptionsUnitCategoriesSecondary(
        updatedUnitCategoriesSecondary
      );
    }

    setLoadExerciseOptionsUnitCategoryPrimary(value as ChartDataUnitCategory);
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
            <ModalBody className="py-0">
              <div className="h-[456px] flex flex-col gap-1.5">
                <div className="flex flex-col gap-1">
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
                        onPress={handleClearAllButton}
                      >
                        Clear All
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
                <ScrollShadow className="px-0.5 pb-1">
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
                <div className="flex gap-3">
                  <div className="w-[11.75rem]">
                    <Select
                      label="Chart Area Category"
                      classNames={{
                        trigger: "bg-amber-50 border-amber-200",
                      }}
                      size="sm"
                      variant="faded"
                      selectedKeys={
                        loadExerciseOptionsUnitCategoryPrimary !== undefined
                          ? [loadExerciseOptionsUnitCategoryPrimary]
                          : []
                      }
                      onChange={(e) =>
                        handleLoadExerciseOptionsUnitCategoryChange(e)
                      }
                      isDisabled={
                        loadExerciseOptionsUnitCategoriesPrimary.size < 2
                      }
                      disallowEmptySelection
                    >
                      {Array.from(loadExerciseOptionsUnitCategoriesPrimary).map(
                        (category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        )
                      )}
                    </Select>
                  </div>
                  <div className="w-[11.75rem]">
                    <Select
                      label="Chart Line Category"
                      size="sm"
                      variant="faded"
                      selectedKeys={
                        loadExerciseOptionsUnitCategorySecondary !== undefined
                          ? [loadExerciseOptionsUnitCategorySecondary]
                          : []
                      }
                      onChange={(e) =>
                        setLoadExerciseOptionsUnitCategorySecondary(
                          e.target.value as ChartDataUnitCategory
                        )
                      }
                      isDisabled={
                        loadExerciseOptionsUnitCategoriesSecondary.length < 2
                      }
                      disallowEmptySelection
                    >
                      {loadExerciseOptionsUnitCategoriesSecondary.map(
                        (category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        )
                      )}
                    </Select>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                isDisabled={
                  loadExerciseOptions.size === 0 ||
                  loadExerciseOptionsUnitCategoryPrimary === undefined
                }
                onPress={loadExerciseStats}
              >
                Load
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
