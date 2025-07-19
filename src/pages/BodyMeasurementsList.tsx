import { useEffect, useMemo, useRef, useState } from "react";
import {
  BodyMeasurements,
  BodyMeasurementsOperationType,
  BodyMeasurementSortCategory,
  UserSettings,
} from "../typings";
import {
  BodyFatCalculationModal,
  BodyMeasurementsAccordions,
  BodyMeasurementsModal,
  DeleteModal,
  FilterBodyMeasurementsListModal,
  ListFilters,
  ListPageSearchInput,
  LoadingSpinner,
  NameInputModal,
  TimeInputModal,
} from "../components";
import {
  useBodyMeasurementsSettings,
  useFilterMinAndMaxValueInputs,
  useListFilters,
  useMeasurementList,
  useReassignMeasurement,
} from "../hooks";
import {
  ConvertWeightToKg,
  CreateActiveMeasurementInputs,
  DefaultNewBodyMeasurements,
  DeleteBodyMeasurementsWithId,
  DeleteItemFromList,
  GetAllBodyMeasurements,
  GetUserSettings,
  GetValidatedUnit,
  InsertBodyMeasurementsIntoDatabase,
  IsDateInWeekdaySet,
  IsDateWithinLimit,
  IsMeasurementInBodyMeasurementsValues,
  IsNumberWithinLimit,
  IsWeightWithinLimit,
  LoadStore,
  UpdateBodyMeasurements,
  UpdateBodyMeasurementsTimestamp,
  UpdateItemInList,
} from "../helpers";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
} from "@heroui/react";
import toast from "react-hot-toast";
import { VerticalMenuIcon } from "../assets";
import { Store } from "@tauri-apps/plugin-store";

export default function BodyMeasurementsList() {
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurements[]>(
    []
  );
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] =
    useState<BodyMeasurementsOperationType>("add");
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [sortCategory, setSortCategory] =
    useState<BodyMeasurementSortCategory>("date-desc");

  const store = useRef<Store>(null);

  const defaultBodyMeasurements = DefaultNewBodyMeasurements();

  const [operatingBodyMeasurements, setOperatingBodyMeasurements] =
    useState<BodyMeasurements>(defaultBodyMeasurements);

  const defaultWeightUnit = useRef<string>("kg");

  const measurementList = useMeasurementList(store);

  const { getMeasurements, measurementMap, isMeasurementListLoaded } =
    measurementList;

  const activeMeasurements = useBodyMeasurementsSettings(
    userSettings,
    setUserSettings
  );

  const deleteModal = useDisclosure();
  const bodyMeasurementsModal = useDisclosure();
  const timeInputModal = useDisclosure();
  const filterBodyMeasurementsListModal = useDisclosure();

  const {
    setActiveMeasurements,
    setWeightUnit,
    getActiveMeasurements,
    updateActiveTrackingMeasurementOrder,
    loadBodyFatCalculationSettingsString,
    bodyFatCalculationModal,
  } = activeMeasurements;

  const filterMinAndMaxValueInputsBodyFat = useFilterMinAndMaxValueInputs({
    maxValue: 100,
  });

  const [include0InMaxValuesWeight, setInclude0InMaxValuesWeight] =
    useState<boolean>(false);
  const [includeNullInMaxValuesBodyFat, setIncludeNullInMaxValuesBodyFat] =
    useState<boolean>(false);

  const listFilters = useListFilters({
    measurementMap: measurementMap.current,
    filterMinAndMaxValueInputsSecondary: filterMinAndMaxValueInputsBodyFat,
  });

  const { nameInputModal, handleReassignMeasurement, reassignMeasurement } =
    useReassignMeasurement(measurementList);

  const {
    filterMap,
    filterMinDate,
    filterMaxDate,
    filterWeekdays,
    filterMeasurements,
    removeFilter,
    prefixMap,
    filterWeightRangeUnit,
    setFilterWeightRangeUnit,
    filterMinWeight,
    filterMaxWeight,
    filterMinBodyFatPercentage,
    filterMaxBodyFatPercentage,
  } = listFilters;

  const filteredBodyMeasurements = useMemo(() => {
    if (filterQuery !== "" || filterMap.size > 0) {
      return bodyMeasurements.filter(
        (item) =>
          ((item.weight > 0 &&
            item.weight
              .toString()
              .toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase())) ||
            item.formattedDate
              ?.toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase()) ||
            (item.bodyMeasurementsValues !== undefined &&
              Object.keys(item.bodyMeasurementsValues).some((key) =>
                measurementMap.current
                  .get(key)
                  ?.name.toLocaleLowerCase()
                  .includes(filterQuery.toLocaleLowerCase())
              )) ||
            item.comment
              ?.toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase()) ||
            item.measurementsText
              ?.toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase())) &&
          (!filterMap.has("min-date") ||
            IsDateWithinLimit(item.date, filterMinDate, false)) &&
          (!filterMap.has("max-date") ||
            IsDateWithinLimit(item.date, filterMaxDate, true)) &&
          (!filterMap.has("weekdays") ||
            IsDateInWeekdaySet(item.date, filterWeekdays)) &&
          (!filterMap.has("measurements") ||
            IsMeasurementInBodyMeasurementsValues(
              item.bodyMeasurementsValues,
              filterMeasurements
            )) &&
          (!filterMap.has("min-weight") ||
            IsWeightWithinLimit(
              item.weight,
              filterMinWeight,
              item.weight_unit,
              filterWeightRangeUnit,
              false
            )) &&
          (!filterMap.has("max-weight") ||
            IsWeightWithinLimit(
              item.weight,
              filterMaxWeight,
              item.weight_unit,
              filterWeightRangeUnit,
              true,
              include0InMaxValuesWeight
            )) &&
          (!filterMap.has("min-bf") ||
            IsNumberWithinLimit(
              item.body_fat_percentage,
              filterMinBodyFatPercentage,
              false
            )) &&
          (!filterMap.has("max-bf") ||
            IsNumberWithinLimit(
              item.body_fat_percentage,
              filterMaxBodyFatPercentage,
              true,
              includeNullInMaxValuesBodyFat
            ))
      );
    }
    return bodyMeasurements;
  }, [
    bodyMeasurements,
    filterQuery,
    measurementMap,
    filterMap,
    filterMinDate,
    filterMaxDate,
    filterWeekdays,
    filterMeasurements,
    filterWeightRangeUnit,
    filterMinWeight,
    filterMaxWeight,
    filterMinBodyFatPercentage,
    filterMaxBodyFatPercentage,
    include0InMaxValuesWeight,
    includeNullInMaxValuesBodyFat,
  ]);

  const getBodyMeasurements = async (clockStyle: string) => {
    if (!isMeasurementListLoaded.current) return;

    const detailedBodyMeasurements = await GetAllBodyMeasurements(
      clockStyle,
      measurementMap.current
    );

    sortBodyMeasurementsByDate(detailedBodyMeasurements, false);
  };

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      const weightUnit = GetValidatedUnit(
        userSettings.default_unit_weight,
        "weight"
      );

      setWeightUnit(weightUnit);
      setFilterWeightRangeUnit(weightUnit);

      defaultWeightUnit.current = weightUnit;

      loadBodyFatCalculationSettingsString(
        userSettings.body_fat_calculation_settings,
        measurementMap.current
      );

      await LoadStore(store);

      await Promise.all([
        getMeasurements("favorite"),
        getActiveMeasurements(userSettings.active_tracking_measurements),
        getBodyMeasurements(userSettings.clock_style),
      ]);

      setUserSettings(userSettings);
    };

    loadUserSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortBodyMeasurementsByDate = (
    bodyMeasurementsList: BodyMeasurements[],
    isAscending: boolean
  ) => {
    if (isAscending) {
      bodyMeasurementsList.sort((a, b) => a.date.localeCompare(b.date));
    } else {
      bodyMeasurementsList.sort((a, b) => b.date.localeCompare(a.date));
    }

    setBodyMeasurements(bodyMeasurementsList);
  };

  const sortBodyMeasurementsByWeight = (
    bodyMeasurementsList: BodyMeasurements[],
    isAscending: boolean
  ) => {
    bodyMeasurementsList.sort((a, b) => {
      const weightAInKg = ConvertWeightToKg(a.weight, a.weight_unit);
      const weightBInKg = ConvertWeightToKg(b.weight, b.weight_unit);

      const isAZero = weightAInKg === 0;
      const isBZero = weightBInKg === 0;

      // Always place 0 weight values last
      if (isAZero && !isBZero) return 1;
      if (!isAZero && isBZero) return -1;
      if (isAZero && isBZero) {
        // Show latest date first if both 0
        return b.date.localeCompare(a.date);
      }

      // Normal sorting for nonzero weights
      if (weightAInKg !== weightBInKg) {
        return isAscending
          ? weightAInKg - weightBInKg
          : weightBInKg - weightAInKg;
      } else {
        // Show latest date first if same weight
        return b.date.localeCompare(a.date);
      }
    });

    setBodyMeasurements(bodyMeasurementsList);
  };

  const sortBodyMeasurementsByBodyFatPercentage = (
    bodyMeasurementsList: BodyMeasurements[],
    isAscending: boolean
  ) => {
    bodyMeasurementsList.sort((a, b) => {
      // Always place null body_fat_percentages last in list
      if (a.body_fat_percentage === null && b.body_fat_percentage === null) {
        // Sort by date if both body_fat_percentages are null
        return b.date.localeCompare(a.date);
      } else if (a.body_fat_percentage === null) {
        return 1;
      } else if (b.body_fat_percentage === null) {
        return -1;
      }

      // Sort by body_fat_percentage
      if (a.body_fat_percentage !== b.body_fat_percentage) {
        return isAscending
          ? a.body_fat_percentage - b.body_fat_percentage
          : b.body_fat_percentage - a.body_fat_percentage;
      }

      // Sort by latest date if same body_fat_percentage
      return b.date.localeCompare(a.date);
    });

    setBodyMeasurements(bodyMeasurementsList);
  };

  const sortBodyMeasurementsByActiveCategory = async (
    bodyMeasurementsList: BodyMeasurements[],
    newCategory?: BodyMeasurementSortCategory
  ) => {
    if (store.current === null) return;

    if (newCategory !== undefined) {
      setSortCategory(newCategory);
    }

    const activeCategory = newCategory ?? sortCategory;

    switch (activeCategory) {
      case "date-desc":
        sortBodyMeasurementsByDate([...bodyMeasurementsList], false);
        break;
      case "date-asc":
        sortBodyMeasurementsByDate([...bodyMeasurementsList], true);
        break;
      case "weight-desc":
        sortBodyMeasurementsByWeight([...bodyMeasurementsList], false);
        break;
      case "weight-asc":
        sortBodyMeasurementsByWeight([...bodyMeasurementsList], true);
        break;
      case "bf-desc":
        sortBodyMeasurementsByBodyFatPercentage(
          [...bodyMeasurementsList],
          false
        );
        break;
      case "bf-asc":
        sortBodyMeasurementsByBodyFatPercentage(
          [...bodyMeasurementsList],
          true
        );
        break;
      default:
        // Overwrite invalid categories
        setSortCategory("date-desc");
        await store.current.set("sort-category-body-measurements", {
          value: "date-desc",
        });
        sortBodyMeasurementsByDate([...bodyMeasurementsList], false);
        break;
    }
  };

  const handleSortOptionSelection = async (key: string) => {
    if (store.current === null) return;

    await store.current.set("sort-category-body-measurements", { value: key });

    await sortBodyMeasurementsByActiveCategory(
      [...bodyMeasurements],
      key as BodyMeasurementSortCategory
    );
  };

  const handleBodyMeasurementAccordionClick = (
    bodyMeasurement: BodyMeasurements,
    index: number
  ) => {
    const updatedBodyMeasurement: BodyMeasurements = {
      ...bodyMeasurement,
      isExpanded: !bodyMeasurement.isExpanded,
    };

    const updatedBodyMeasurements = [...bodyMeasurements];
    updatedBodyMeasurements[index] = updatedBodyMeasurement;

    setBodyMeasurements(updatedBodyMeasurements);
  };

  const handleNewBodyMeasurementsButton = async () => {
    if (userSettings === undefined) return;

    if (operationType !== "add") {
      setOperationType("add");
      setOperatingBodyMeasurements({ ...defaultBodyMeasurements });
    }

    const activeMeasurements = await CreateActiveMeasurementInputs(
      userSettings.active_tracking_measurements
    );

    setActiveMeasurements(activeMeasurements);

    bodyMeasurementsModal.onOpen();
  };

  const handleBodyMeasurementsOptionSelection = (
    key: string,
    bodyMeasurements: BodyMeasurements
  ) => {
    if (userSettings === undefined) return;

    if (key === "edit") {
      setOperatingBodyMeasurements(bodyMeasurements);
      setOperationType("edit");
      bodyMeasurementsModal.onOpen();
    } else if (key === "delete" && !!userSettings.never_show_delete_modal) {
      deleteBodyMeasurements(bodyMeasurements);
    } else if (key === "delete") {
      setOperatingBodyMeasurements(bodyMeasurements);
      setOperationType("delete");
      deleteModal.onOpen();
    } else if (key === "edit-timestamp") {
      setOperatingBodyMeasurements(bodyMeasurements);
      setOperationType("edit-timestamp");
      timeInputModal.onOpen();
    }
  };

  const addBodyMeasurements = async (bodyMeasurement: BodyMeasurements) => {
    if (userSettings === undefined) return;

    const newBodyMeasurements = await InsertBodyMeasurementsIntoDatabase(
      bodyMeasurement,
      userSettings.clock_style,
      measurementMap.current
    );

    if (newBodyMeasurements === undefined) return;

    const updatedBodyMeasurements = [...bodyMeasurements, newBodyMeasurements];

    sortBodyMeasurementsByActiveCategory(updatedBodyMeasurements);

    if (userSettings.automatically_update_active_measurements === 1) {
      updateActiveTrackingMeasurementOrder();
    }

    bodyMeasurementsModal.onClose();
    toast.success("Body Measurements Added");
  };

  const updateBodyMeasurements = async (bodyMeasurement: BodyMeasurements) => {
    if (userSettings === undefined || bodyMeasurement.id === 0) return;

    const updatedBodyMeasurements = await UpdateBodyMeasurements(
      bodyMeasurement,
      userSettings.clock_style,
      measurementMap.current
    );

    if (updatedBodyMeasurements === undefined) return;

    const updatedBodyMeasurementsList = UpdateItemInList(
      bodyMeasurements,
      updatedBodyMeasurements
    );

    sortBodyMeasurementsByActiveCategory(updatedBodyMeasurementsList);

    bodyMeasurementsModal.onClose();
    toast.success("Body Measurements Updated");
  };

  const deleteBodyMeasurements = async (
    bodyMeasurementToDelete?: BodyMeasurements
  ) => {
    const bodyMeasurement =
      bodyMeasurementToDelete ?? operatingBodyMeasurements;

    if (bodyMeasurement.id === 0) return;

    const success = await DeleteBodyMeasurementsWithId(bodyMeasurement.id);

    if (!success) return;

    const updatedBodyMeasurements = DeleteItemFromList(
      bodyMeasurements,
      bodyMeasurement.id
    );

    sortBodyMeasurementsByActiveCategory(updatedBodyMeasurements);

    toast.success("Body Measurements Deleted");
    deleteModal.onClose();
  };

  const updateBodyMeasurementsTimeStamp = async (dateString: string) => {
    if (
      operatingBodyMeasurements.id === 0 ||
      operationType !== "edit-timestamp" ||
      userSettings === undefined
    )
      return;

    const updatedBodyMeasurements = await UpdateBodyMeasurementsTimestamp(
      operatingBodyMeasurements,
      dateString,
      userSettings.clock_style
    );

    if (updatedBodyMeasurements === undefined) return;

    const updatedBodyMeasurementsList = UpdateItemInList(
      bodyMeasurements,
      updatedBodyMeasurements
    );

    sortBodyMeasurementsByActiveCategory(updatedBodyMeasurementsList);

    toast.success("Timestamp Updated");
    timeInputModal.onClose();
  };

  const reassignBodyMeasurements = async (name: string) => {
    if (userSettings === undefined) return;

    const success = await reassignMeasurement(bodyMeasurements, name);

    if (!success) return;

    await getBodyMeasurements(userSettings.clock_style);

    nameInputModal.onClose();
    toast.success("Measurement Reassigned");
  };

  const handleOptionMenuSelection = (key: string) => {
    if (key === "body-fat-calculation-settings") {
      bodyFatCalculationModal.onOpen();
    }
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Body Measurements Entry"
        body={
          <p>
            Are you sure you want to permanently delete Body Measurements entry
            on{" "}
            <span className="text-secondary">
              {operatingBodyMeasurements.formattedDate}
            </span>
            ?
          </p>
        }
        deleteButtonAction={deleteBodyMeasurements}
      />
      <BodyMeasurementsModal
        bodyMeasurementsModal={bodyMeasurementsModal}
        operatingBodyMeasurements={operatingBodyMeasurements}
        measurementMap={measurementMap.current}
        useBodyMeasurementsSettings={activeMeasurements}
        useMeasurementList={measurementList}
        doneButtonAction={
          operationType === "edit"
            ? updateBodyMeasurements
            : addBodyMeasurements
        }
        isEditing={operationType === "edit"}
        resetInputsAfterSaving
      />
      <TimeInputModal
        timeInputModal={timeInputModal}
        header="Edit Timestamp"
        clockStyle={userSettings.clock_style}
        locale={userSettings.locale}
        value={operatingBodyMeasurements.date}
        saveButtonAction={updateBodyMeasurementsTimeStamp}
      />
      <NameInputModal
        nameInputModal={nameInputModal}
        header="Enter Measurement Name"
        buttonAction={reassignBodyMeasurements}
      />
      <FilterBodyMeasurementsListModal
        filterBodyMeasurementsListModal={filterBodyMeasurementsListModal}
        useListFilters={listFilters}
        locale={userSettings.locale}
        useMeasurementList={measurementList}
        include0InMaxValuesWeight={include0InMaxValuesWeight}
        setInclude0InMaxValuesWeight={setInclude0InMaxValuesWeight}
        filterMinAndMaxValueInputsBodyFat={filterMinAndMaxValueInputsBodyFat}
        includeNullInMaxValuesBodyFat={includeNullInMaxValuesBodyFat}
        setIncludeNullInMaxValuesBodyFat={setIncludeNullInMaxValuesBodyFat}
      />
      <BodyFatCalculationModal
        useBodyMeasurementsSettings={activeMeasurements}
        useMeasurementList={measurementList}
      />
      <div className="flex flex-col items-center gap-1.5">
        <ListPageSearchInput
          header="Body Measurements"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredBodyMeasurements.length}
          totalListLength={bodyMeasurements.length}
          isListFiltered={filterMap.size > 0}
          bottomContent={
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <Button
                  color="secondary"
                  variant="flat"
                  onPress={handleNewBodyMeasurementsButton}
                  size="sm"
                >
                  New Body Measurements
                </Button>
                <div className="flex gap-1 pr-0.5">
                  <Button
                    className="z-1"
                    variant="flat"
                    color={filterMap.size > 0 ? "secondary" : "default"}
                    size="sm"
                    onPress={() => filterBodyMeasurementsListModal.onOpen()}
                  >
                    Filter
                  </Button>
                  <Dropdown shouldBlockScroll={false}>
                    <DropdownTrigger>
                      <Button className="z-1" variant="flat" size="sm">
                        Sort By
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Sort Body Measurements Dropdown Menu"
                      selectionMode="single"
                      selectedKeys={[sortCategory]}
                      onAction={(key) =>
                        handleSortOptionSelection(key as string)
                      }
                    >
                      <DropdownItem key="date-desc">
                        Date (Latest First)
                      </DropdownItem>
                      <DropdownItem key="date-asc">
                        Date (Oldest First)
                      </DropdownItem>
                      <DropdownItem key="weight-desc">
                        Weight (Highest First)
                      </DropdownItem>
                      <DropdownItem key="weight-asc">
                        Weight (Lowest First)
                      </DropdownItem>
                      <DropdownItem key="bf-desc">
                        Body Fat % (Highest First)
                      </DropdownItem>
                      <DropdownItem key="bf-asc">
                        Body Fat % (Lowest First)
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  <Dropdown shouldBlockScroll={false}>
                    <DropdownTrigger>
                      <Button
                        aria-label="Toggle Body Measurements List Options Menu"
                        isIconOnly
                        className="z-1"
                        size="sm"
                        variant="light"
                      >
                        <VerticalMenuIcon size={19} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Body Measurements List Options Menu"
                      onAction={(key) =>
                        handleOptionMenuSelection(key as string)
                      }
                    >
                      <DropdownItem key="body-fat-calculation-settings">
                        Body Fat % Calculation Settings
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
              {filterMap.size > 0 && (
                <ListFilters
                  filterMap={filterMap}
                  removeFilter={removeFilter}
                  prefixMap={prefixMap}
                />
              )}
            </div>
          }
        />
        <BodyMeasurementsAccordions
          bodyMeasurements={filteredBodyMeasurements}
          handleBodyMeasurementsAccordionClick={
            handleBodyMeasurementAccordionClick
          }
          measurementMap={measurementMap.current}
          handleBodyMeasurementsOptionSelection={
            handleBodyMeasurementsOptionSelection
          }
          handleReassignMeasurement={handleReassignMeasurement}
        />
      </div>
    </>
  );
}
