import { useEffect, useMemo, useRef, useState } from "react";
import {
  BodyMeasurements,
  BodyMeasurementsOperationType,
  UserSettings,
} from "../typings";
import {
  BodyMeasurementsAccordions,
  BodyMeasurementsModal,
  DeleteModal,
  ListFilters,
  ListPageSearchInput,
  LoadingSpinner,
  TimeInputModal,
} from "../components";
import {
  useBodyMeasurementsInput,
  useFilterMinAndMaxValueInputs,
  useListFilters,
  useMeasurementList,
} from "../hooks";
import {
  ConvertWeightToKg,
  CreateActiveMeasurementInputs,
  DefaultNewBodyMeasurements,
  DeleteBodyMeasurementsWithId,
  DeleteItemFromList,
  GetAllBodyMeasurements,
  GetUserSettings,
  GetValidatedUserSettingsUnits,
  InsertBodyMeasurementsIntoDatabase,
  IsDateInWeekdaySet,
  IsDateWithinLimit,
  IsMeasurementInBodyMeasurementsValues,
  IsNumberWithinLimit,
  IsWeightWithinLimit,
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

type SortCategory =
  | "date-asc"
  | "date-desc"
  | "weight-asc"
  | "weight-desc"
  | "bf-asc"
  | "bf-desc";

export default function BodyMeasurementsList() {
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurements[]>(
    []
  );
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] =
    useState<BodyMeasurementsOperationType>("add");
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [sortCategory, setSortCategory] = useState<SortCategory>("date-desc");

  const defaultBodyMeasurements = DefaultNewBodyMeasurements();

  const [operatingBodyMeasurements, setOperatingBodyMeasurements] =
    useState<BodyMeasurements>(defaultBodyMeasurements);

  const defaultWeightUnit = useRef<string>("kg");

  const measurementList = useMeasurementList(true);

  const { measurementMap, isMeasurementListLoaded } = measurementList;

  const bodyMeasurementsInput = useBodyMeasurementsInput();

  const deleteModal = useDisclosure();
  const bodyMeasurementsModal = useDisclosure();
  const timeInputModal = useDisclosure();

  const {
    setActiveMeasurements,
    setWeightUnit,
    resetBodyMeasurementsInput,
    loadBodyMeasurementsInputs,
    getActiveMeasurements,
  } = bodyMeasurementsInput;

  const filterMinAndMaxValueInputsSecondary = useFilterMinAndMaxValueInputs({
    maxValue: 100,
  });

  const [includeNullInMaxValuesSecondary, setIncludeNullInMaxValuesSecondary] =
    useState<boolean>(false);

  const listFilters = useListFilters({
    measurementMap: measurementMap.current,
    filterMinAndMaxValueInputsSecondary: filterMinAndMaxValueInputsSecondary,
  });

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
              true
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
              includeNullInMaxValuesSecondary
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
    includeNullInMaxValuesSecondary,
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

      const validUnits = GetValidatedUserSettingsUnits(userSettings);

      setWeightUnit(validUnits.weightUnit);
      setFilterWeightRangeUnit(validUnits.weightUnit);

      defaultWeightUnit.current = validUnits.weightUnit;

      await Promise.all([
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

  const sortBodyMeasurementsByActiveCategory = (
    bodyMeasurementsList: BodyMeasurements[]
  ) => {
    switch (sortCategory) {
      case "date-desc":
        sortBodyMeasurementsByDate([...bodyMeasurementsList], false);
        break;
      case "date-asc":
        sortBodyMeasurementsByDate([...bodyMeasurementsList], true);
        break;
      case "weight-desc":
        sortBodyMeasurementsByWeight([...bodyMeasurements], false);
        break;
      case "weight-asc":
        sortBodyMeasurementsByWeight([...bodyMeasurements], true);
        break;
      case "bf-desc":
        sortBodyMeasurementsByBodyFatPercentage([...bodyMeasurements], false);
        break;
      case "bf-asc":
        sortBodyMeasurementsByBodyFatPercentage([...bodyMeasurements], true);
        break;
      default:
        break;
    }
  };

  const handleSortOptionSelection = (key: string) => {
    if (key === "date-desc") {
      setSortCategory(key);
      sortBodyMeasurementsByDate([...bodyMeasurements], false);
    } else if (key === "date-asc") {
      setSortCategory(key);
      sortBodyMeasurementsByDate([...bodyMeasurements], true);
    } else if (key === "weight-desc") {
      setSortCategory(key);
      sortBodyMeasurementsByWeight([...bodyMeasurements], false);
    } else if (key === "weight-asc") {
      setSortCategory(key);
      sortBodyMeasurementsByWeight([...bodyMeasurements], true);
    } else if (key === "bf-desc") {
      setSortCategory(key);
      sortBodyMeasurementsByBodyFatPercentage([...bodyMeasurements], false);
    } else if (key === "bf-asc") {
      setSortCategory(key);
      sortBodyMeasurementsByBodyFatPercentage([...bodyMeasurements], true);
    }
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

  const resetBodyMeasurements = () => {
    resetBodyMeasurementsInput();
    setOperatingBodyMeasurements(defaultBodyMeasurements);
    setOperationType("add");
  };

  const handleNewBodyMeasurementsButton = async () => {
    if (userSettings === undefined) return;

    if (operationType !== "add") {
      resetBodyMeasurements();
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
      loadBodyMeasurementsInputs(bodyMeasurements, measurementMap.current);
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

  const addBodyMeasurements = async () => {
    if (userSettings === undefined) return;

    const newBodyMeasurements = await InsertBodyMeasurementsIntoDatabase(
      bodyMeasurementsInput,
      userSettings.clock_style,
      measurementMap.current
    );

    if (newBodyMeasurements === undefined) return;

    const updatedBodyMeasurements = [...bodyMeasurements, newBodyMeasurements];

    sortBodyMeasurementsByActiveCategory(updatedBodyMeasurements);

    resetBodyMeasurements();
    bodyMeasurementsModal.onClose();
    toast.success("Body Measurements Added");
  };

  const updateBodyMeasurements = async () => {
    if (userSettings === undefined || operatingBodyMeasurements.id === 0)
      return;

    const updatedBodyMeasurements = await UpdateBodyMeasurements(
      operatingBodyMeasurements,
      bodyMeasurementsInput,
      userSettings.clock_style,
      measurementMap.current
    );

    if (updatedBodyMeasurements === undefined) return;

    const updatedBodyMeasurementsList = UpdateItemInList(
      bodyMeasurements,
      updatedBodyMeasurements
    );

    sortBodyMeasurementsByActiveCategory(updatedBodyMeasurementsList);

    resetBodyMeasurements();
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

    resetBodyMeasurements();
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

    resetBodyMeasurements();
    toast.success("Timestamp Updated");
    timeInputModal.onClose();
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
        useBodyMeasurementInputs={bodyMeasurementsInput}
        useMeasurementList={measurementList}
        doneButtonAction={
          operationType === "edit"
            ? updateBodyMeasurements
            : addBodyMeasurements
        }
        isEditing={operationType === "edit"}
      />
      <TimeInputModal
        timeInputModal={timeInputModal}
        header="Edit Timestamp"
        clockStyle={userSettings.clock_style}
        locale={userSettings.locale}
        value={operatingBodyMeasurements.date}
        saveButtonAction={updateBodyMeasurementsTimeStamp}
      />
      <div className="flex flex-col items-center gap-1.5">
        <ListPageSearchInput
          header="Body Measurement List"
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
                <div className="flex gap-1">
                  <Button
                    className="z-1"
                    variant="flat"
                    color={filterMap.size > 0 ? "secondary" : "default"}
                    size="sm"
                    onPress={
                      // TODO: ADD
                      () => {}
                    }
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
          handleReassignMeasurement={
            // TODO: ADD
            () => {}
          }
        />
      </div>
    </>
  );
}
