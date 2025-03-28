import { useState, useEffect, useMemo, useRef } from "react";
import { UserWeight, UserSettings } from "../typings";
import {
  LoadingSpinner,
  DeleteModal,
  UserWeightModal,
  EmptyListLabel,
  UserWeightListItem,
  ListPageSearchInput,
  FilterUserWeightListModal,
  ListFilters,
  TimeInputModal,
} from "../components";
import {
  ConvertEmptyStringToNull,
  ConvertInputStringToNumberWithTwoDecimalsOrNull,
  ConvertNumberToTwoDecimals,
  ConvertWeightToKg,
  DeleteItemFromList,
  DeleteUserWeightWithId,
  FormatDateTimeString,
  GetAllUserWeights,
  GetCurrentDateTimeISOString,
  GetUserSettings,
  GetValidatedUserSettingsUnits,
  InsertUserWeightIntoDatabase,
  IsDateInWeekdaySet,
  IsDateWithinLimit,
  IsNumberWithinLimit,
  IsWeightWithinLimit,
  UpdateItemInList,
  UpdateUserWeight,
  ValidateISODateString,
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
import {
  useDefaultUserWeight,
  useFilterMinAndMaxValueInputs,
  useListFilters,
  useUserWeightInputs,
} from "../hooks";

type OperationType = "add" | "edit" | "delete" | "edit-timestamp";

type UserWeightSortCategory =
  | "date-asc"
  | "date-desc"
  | "weight-asc"
  | "weight-desc"
  | "bf-asc"
  | "bf-desc";

export default function UserWeightList() {
  const [userWeights, setUserWeights] = useState<UserWeight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [sortCategory, setSortCategory] =
    useState<UserWeightSortCategory>("date-desc");

  const userWeightInputs = useUserWeightInputs();

  const {
    userWeightInput,
    weightUnit,
    setWeightUnit,
    commentInput,
    bodyFatPercentageInput,
    isUserWeightValid,
    resetUserWeightInput,
    loadUserWeightInputs,
  } = userWeightInputs;

  const filterMinAndMaxValueInputsSecondary = useFilterMinAndMaxValueInputs({
    maxValue: 100,
  });

  const [includeNullInMaxValuesSecondary, setIncludeNullInMaxValuesSecondary] =
    useState<boolean>(false);

  const listFilters = useListFilters({
    filterMinAndMaxValueInputsSecondary: filterMinAndMaxValueInputsSecondary,
  });

  const {
    filterMap,
    filterMinDate,
    filterMaxDate,
    filterWeekdays,
    removeFilter,
    prefixMap,
    filterWeightRangeUnit,
    setFilterWeightRangeUnit,
    filterMinWeight,
    filterMaxWeight,
    filterMinBodyFatPercentage,
    filterMaxBodyFatPercentage,
  } = listFilters;

  const filteredWeights = useMemo(() => {
    if (filterQuery !== "" || filterMap.size > 0) {
      return userWeights.filter(
        (item) =>
          (item.weight
            .toString()
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
            item.formattedDate
              .toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase()) ||
            item.comment
              ?.toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase())) &&
          (!filterMap.has("min-date") ||
            IsDateWithinLimit(item.date, filterMinDate, false)) &&
          (!filterMap.has("max-date") ||
            IsDateWithinLimit(item.date, filterMaxDate, true)) &&
          (!filterMap.has("weekdays") ||
            IsDateInWeekdaySet(item.date, filterWeekdays)) &&
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
    return userWeights;
  }, [
    userWeights,
    filterQuery,
    filterMap,
    filterMinDate,
    filterMaxDate,
    filterWeekdays,
    filterWeightRangeUnit,
    filterMinWeight,
    filterMaxWeight,
    filterMinBodyFatPercentage,
    filterMaxBodyFatPercentage,
    includeNullInMaxValuesSecondary,
  ]);

  const defaultUserWeight = useDefaultUserWeight();

  const [operatingUserWeight, setOperatingUserWeight] =
    useState<UserWeight>(defaultUserWeight);

  const deleteModal = useDisclosure();
  const userWeightModal = useDisclosure();
  const timeInputModal = useDisclosure();
  const filterUserWeightListModal = useDisclosure();

  const defaultWeightUnit = useRef<string>("kg");

  const getUserWeights = async (clockStyle: string) => {
    const result = await GetAllUserWeights(false);

    const userWeights: UserWeight[] = [];

    for (const row of result) {
      const formattedDate: string = FormatDateTimeString(
        row.date,
        clockStyle === "24h"
      );

      const userWeight: UserWeight = {
        id: row.id,
        weight: row.weight,
        weight_unit: row.weight_unit,
        date: row.date,
        formattedDate: formattedDate,
        comment: row.comment,
        body_fat_percentage: row.body_fat_percentage,
      };

      userWeights.push(userWeight);
    }

    setUserWeights(userWeights);
  };

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      getUserWeights(userSettings.clock_style);

      setUserSettings(userSettings);

      const validUnits = GetValidatedUserSettingsUnits(userSettings);

      setWeightUnit(validUnits.weightUnit);
      setFilterWeightRangeUnit(validUnits.weightUnit);

      defaultWeightUnit.current = validUnits.weightUnit;

      setIsLoading(false);
    };

    loadUserSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateNewUserWeightButton = () => {
    if (operationType !== "add") {
      resetUserWeight();
    }
    userWeightModal.onOpen();
  };

  const addUserWeight = async () => {
    if (
      !isUserWeightValid ||
      operationType !== "add" ||
      userSettings === undefined
    )
      return;

    const newWeight = ConvertNumberToTwoDecimals(Number(userWeightInput));

    const commentToInsert = ConvertEmptyStringToNull(commentInput);

    const currentDateString = GetCurrentDateTimeISOString();

    const bodyFatPercentage = ConvertInputStringToNumberWithTwoDecimalsOrNull(
      bodyFatPercentageInput
    );

    const userWeightId = await InsertUserWeightIntoDatabase(
      newWeight,
      weightUnit,
      currentDateString,
      commentToInsert,
      bodyFatPercentage
    );

    if (userWeightId === 0) return;

    const formattedDate = FormatDateTimeString(
      currentDateString,
      userSettings.clock_style === "24h"
    );

    const newUserWeight: UserWeight = {
      id: userWeightId,
      weight: newWeight,
      weight_unit: weightUnit,
      date: currentDateString,
      formattedDate: formattedDate,
      comment: commentToInsert,
      body_fat_percentage: bodyFatPercentage,
    };

    sortUserWeightsByActiveCategory([...userWeights, newUserWeight]);

    resetUserWeight();
    toast.success("User Weight Added");
    userWeightModal.onClose();
  };

  const updateUserWeight = async () => {
    if (
      operatingUserWeight.id === 0 ||
      operationType !== "edit" ||
      !isUserWeightValid
    )
      return;

    const newWeight = ConvertNumberToTwoDecimals(Number(userWeightInput));

    const commentToInsert = ConvertEmptyStringToNull(commentInput);

    const bodyFatPercentage = ConvertInputStringToNumberWithTwoDecimalsOrNull(
      bodyFatPercentageInput
    );

    const updatedUserWeight: UserWeight = {
      ...operatingUserWeight,
      weight: newWeight,
      weight_unit: weightUnit,
      comment: commentToInsert,
      body_fat_percentage: bodyFatPercentage,
    };

    const success = await UpdateUserWeight(updatedUserWeight);

    if (!success) return;

    const updatedUserWeights = UpdateItemInList(userWeights, updatedUserWeight);

    sortUserWeightsByActiveCategory(updatedUserWeights);

    resetUserWeight();

    toast.success("Body Weight Entry Updated");
    userWeightModal.onClose();
  };

  const updateUserWeightTimestamp = async (dateString: string) => {
    if (
      operatingUserWeight.id === 0 ||
      operationType !== "edit-timestamp" ||
      userSettings === undefined ||
      !ValidateISODateString(dateString)
    )
      return;

    const formattedDate = FormatDateTimeString(
      dateString,
      userSettings.clock_style === "24h"
    );

    const updatedUserWeight: UserWeight = {
      ...operatingUserWeight,
      date: dateString,
      formattedDate,
    };

    const success = await UpdateUserWeight(updatedUserWeight);

    if (!success) return;

    const updatedUserWeights = UpdateItemInList(userWeights, updatedUserWeight);

    sortUserWeightsByActiveCategory(updatedUserWeights);

    resetUserWeight();

    toast.success("Timestamp Updated");
    timeInputModal.onClose();
  };

  const deleteUserWeight = async () => {
    if (operatingUserWeight.id === 0 || operationType !== "delete") return;

    const success = await DeleteUserWeightWithId(operatingUserWeight.id);

    if (!success) return;

    const updatedUserWeights = DeleteItemFromList(
      userWeights,
      operatingUserWeight.id
    );

    sortUserWeightsByActiveCategory(updatedUserWeights);

    resetUserWeight();

    toast.success("Body Weight Entry Deleted");
    deleteModal.onClose();
  };

  const handleUserWeightOptionSelection = (
    key: string,
    userWeight: UserWeight
  ) => {
    if (key === "edit") {
      loadUserWeightInputs(userWeight);
      setOperatingUserWeight(userWeight);
      setOperationType("edit");
      userWeightModal.onOpen();
    } else if (key === "delete") {
      setOperatingUserWeight(userWeight);
      setOperationType("delete");
      deleteModal.onOpen();
    } else if (key === "edit-timestamp") {
      setOperatingUserWeight(userWeight);
      setOperationType("edit-timestamp");
      timeInputModal.onOpen();
    }
  };

  const resetUserWeight = () => {
    if (userSettings === undefined) return;

    setOperatingUserWeight(defaultUserWeight);
    setOperationType("add");
    resetUserWeightInput();
    setWeightUnit(defaultWeightUnit.current);
  };

  const sortUserWeightsByDate = (
    userWeightList: UserWeight[],
    isAscending: boolean
  ) => {
    if (isAscending) {
      userWeightList.sort((a, b) => a.date.localeCompare(b.date));
    } else {
      userWeightList.sort((a, b) => b.date.localeCompare(a.date));
    }

    setUserWeights(userWeightList);
  };

  const sortUserWeightsByWeight = (
    userWeightList: UserWeight[],
    isAscending: boolean
  ) => {
    userWeightList.sort((a, b) => {
      const weightAInKg = ConvertWeightToKg(a.weight, a.weight_unit);
      const weightBInKg = ConvertWeightToKg(b.weight, b.weight_unit);

      if (weightAInKg !== weightBInKg) {
        if (isAscending) {
          return weightAInKg - weightBInKg;
        } else {
          return weightBInKg - weightAInKg;
        }
      } else {
        // Show latest date first if same weight
        return b.date.localeCompare(a.date);
      }
    });

    setUserWeights(userWeightList);
  };

  const sortUserWeightsByBodyFatPercentage = (
    userWeightList: UserWeight[],
    isAscending: boolean
  ) => {
    userWeightList.sort((a, b) => {
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

    setUserWeights(userWeightList);
  };

  const handleSortOptionSelection = (key: string) => {
    if (key === "date-desc") {
      setSortCategory(key);
      sortUserWeightsByDate([...userWeights], false);
    } else if (key === "date-asc") {
      setSortCategory(key);
      sortUserWeightsByDate([...userWeights], true);
    } else if (key === "weight-desc") {
      setSortCategory(key);
      sortUserWeightsByWeight([...userWeights], false);
    } else if (key === "weight-asc") {
      setSortCategory(key);
      sortUserWeightsByWeight([...userWeights], true);
    } else if (key === "bf-desc") {
      setSortCategory(key);
      sortUserWeightsByBodyFatPercentage([...userWeights], false);
    } else if (key === "bf-asc") {
      setSortCategory(key);
      sortUserWeightsByBodyFatPercentage([...userWeights], true);
    }
  };

  const sortUserWeightsByActiveCategory = (userWeightList: UserWeight[]) => {
    switch (sortCategory) {
      case "date-desc":
        sortUserWeightsByDate([...userWeightList], false);
        break;
      case "date-asc":
        sortUserWeightsByDate([...userWeightList], true);
        break;
      case "weight-desc":
        sortUserWeightsByWeight([...userWeightList], false);
        break;
      case "weight-asc":
        sortUserWeightsByWeight([...userWeightList], true);
        break;
      case "bf-desc":
        sortUserWeightsByBodyFatPercentage([...userWeightList], false);
        break;
      case "bf-asc":
        sortUserWeightsByBodyFatPercentage([...userWeightList], true);
        break;
      default:
        break;
    }
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Body Weight Entry"
        body={
          <p className="break-words">
            Are you sure you want to permanently delete the Body Weight entry on{" "}
            <span className="text-secondary">
              {operatingUserWeight.formattedDate}
            </span>
            ?
          </p>
        }
        deleteButtonAction={deleteUserWeight}
      />
      <UserWeightModal
        userWeightModal={userWeightModal}
        userWeightInputs={userWeightInputs}
        buttonAction={
          operationType === "edit" ? updateUserWeight : addUserWeight
        }
        isEditing={operationType === "edit"}
      />
      <FilterUserWeightListModal
        filterUserWeightListModal={filterUserWeightListModal}
        useListFilters={listFilters}
        filterMinAndMaxValueInputsSecondary={
          filterMinAndMaxValueInputsSecondary
        }
        includeNullInMaxValuesSecondary={includeNullInMaxValuesSecondary}
        setIncludeNullInMaxValuesSecondary={setIncludeNullInMaxValuesSecondary}
        locale={userSettings.locale}
      />
      <TimeInputModal
        timeInputModal={timeInputModal}
        header="Edit Timestamp"
        clockStyle={userSettings.clock_style}
        locale={userSettings.locale}
        value={operatingUserWeight.date}
        saveButtonAction={updateUserWeightTimestamp}
      />
      <div className="flex flex-col items-center gap-1">
        <ListPageSearchInput
          header="User Weight List"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredWeights.length}
          totalListLength={userWeights.length}
          isListFiltered={filterMap.size > 0}
          bottomContent={
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <Button
                  color="secondary"
                  variant="flat"
                  onPress={handleCreateNewUserWeightButton}
                  size="sm"
                >
                  New Weight
                </Button>
                <div className="flex gap-1">
                  <Button
                    className="z-1"
                    variant="flat"
                    color={filterMap.size > 0 ? "secondary" : "default"}
                    size="sm"
                    onPress={() => filterUserWeightListModal.onOpen()}
                  >
                    Filter
                  </Button>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button className="z-1" variant="flat" size="sm">
                        Sort By
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Sort User Weights Dropdown Menu"
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
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col gap-1 w-full">
              {filteredWeights.map((userWeight) => (
                <UserWeightListItem
                  key={userWeight.id}
                  userWeight={userWeight}
                  handleUserWeightOptionSelection={
                    handleUserWeightOptionSelection
                  }
                />
              ))}
              {filteredWeights.length === 0 && (
                <EmptyListLabel itemName="User Weight Entries" />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
