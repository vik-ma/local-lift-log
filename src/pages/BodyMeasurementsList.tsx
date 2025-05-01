import { useEffect, useMemo, useRef, useState } from "react";
import {
  BodyMeasurements,
  BodyMeasurementsOperationType,
  UserSettings,
} from "../typings";
import {
  BodyMeasurementsAccordions,
  BodyMeasurementsModal,
  ListFilters,
  ListPageSearchInput,
  LoadingSpinner,
} from "../components";
import {
  useBodyMeasurementsInput,
  useFilterMinAndMaxValueInputs,
  useListFilters,
  useMeasurementList,
} from "../hooks";
import {
  CreateActiveMeasurementInputs,
  DefaultNewBodyMeasurements,
  GetAllBodyMeasurements,
  GetUserSettings,
  GetValidatedUserSettingsUnits,
  IsDateInWeekdaySet,
  IsDateWithinLimit,
  IsMeasurementInBodyMeasurementsValues,
  IsNumberWithinLimit,
  IsWeightWithinLimit,
} from "../helpers";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
} from "@heroui/react";

type SortCategory = "date-asc" | "date-desc";

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

  const bodyMeasurementsModal = useDisclosure();

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
    if (!isMeasurementListLoaded) return;

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

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <BodyMeasurementsModal
        bodyMeasurementsModal={bodyMeasurementsModal}
        useBodyMeasurementInputs={bodyMeasurementsInput}
        useMeasurementList={measurementList}
        doneButtonAction={
          () => {}
          // TODO: FIX
          // operationType === "edit"
          //   ? updateBodyMeasurements
          //   : addBodyMeasurements
        }
        isEditing={operationType === "edit"}
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
            // TODO: ADD
            () => {}
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
