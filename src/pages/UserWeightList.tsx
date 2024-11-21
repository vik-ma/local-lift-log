import Database from "tauri-plugin-sql-api";
import { useState, useEffect, useCallback, useMemo } from "react";
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
} from "../components";
import {
  ConvertEmptyStringToNull,
  ConvertNumberToTwoDecimals,
  ConvertWeightToKg,
  DeleteItemFromList,
  DeleteUserWeightWithId,
  FormatDateTimeString,
  GetCurrentDateTimeISOString,
  GetUserSettings,
  InsertUserWeightIntoDatabase,
  IsDateInWeekdaySet,
  IsDateWithinRange,
  UpdateItemInList,
  UpdateUserWeight,
} from "../helpers";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import {
  useDefaultUserWeight,
  useIsStringValidNumber,
  useListFilters,
} from "../hooks";

type OperationType = "add" | "edit" | "delete";

type UserWeightSortCategory =
  | "date-asc"
  | "date-desc"
  | "weight-asc"
  | "weight-desc";

export default function UserWeightList() {
  const [userWeights, setUserWeights] = useState<UserWeight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [userWeightInput, setUserWeightInput] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<string>("");
  const [commentInput, setCommentInput] = useState<string>("");
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [sortCategory, setSortCategory] =
    useState<UserWeightSortCategory>("date-desc");

  const listFilters = useListFilters();

  const {
    filterMap,
    filterDateRange,
    setFilterDateRange,
    filterWeekdays,
    setFilterWeekdays,
    weekdayMap,
    handleFilterSaveButton,
    removeFilter,
    prefixMap,
  } = listFilters;

  const filterUserWeightListModal = useDisclosure();

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
          (!filterMap.has("dates") ||
            IsDateWithinRange(item.date, filterDateRange)) &&
          (!filterMap.has("weekdays") ||
            IsDateInWeekdaySet(item.date, filterWeekdays))
      );
    }
    return userWeights;
  }, [userWeights, filterQuery, filterMap, filterDateRange, filterWeekdays]);

  const defaultUserWeight = useDefaultUserWeight();

  const [operatingUserWeight, setOperatingUserWeight] =
    useState<UserWeight>(defaultUserWeight);

  const deleteModal = useDisclosure();
  const userWeightModal = useDisclosure();

  const getUserWeights = useCallback(async (clockStyle: string) => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<UserWeight[]>(
        "SELECT * FROM user_weights ORDER BY id DESC"
      );

      const userWeights: UserWeight[] = result.map((row) => {
        const formattedDate: string = FormatDateTimeString(
          row.date,
          clockStyle === "24h"
        );
        return {
          id: row.id,
          weight: row.weight,
          weight_unit: row.weight_unit,
          date: row.date,
          formattedDate: formattedDate,
          comment: row.comment,
        };
      });

      sortUserWeightsByDate(userWeights, false);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings !== undefined) {
        setUserSettings(userSettings);
        getUserWeights(userSettings.clock_style);
        setWeightUnit(userSettings.default_unit_weight);
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, [getUserWeights]);

  const handleCreateNewUserWeightButton = () => {
    resetUserWeight();
    userWeightModal.onOpen();
  };

  const addUserWeight = async () => {
    if (
      !isWeightInputValid ||
      operationType !== "add" ||
      userSettings === undefined
    )
      return;

    const newWeight = ConvertNumberToTwoDecimals(Number(userWeightInput));

    const commentToInsert = ConvertEmptyStringToNull(commentInput);

    const currentDateString = GetCurrentDateTimeISOString();

    const userWeightId = await InsertUserWeightIntoDatabase(
      newWeight,
      weightUnit,
      currentDateString,
      commentToInsert
    );

    if (userWeightId === 0) return;

    const formattedDate = FormatDateTimeString(
      currentDateString,
      userSettings.clock_style === "24h"
    );

    const newUserWeight = {
      id: userWeightId,
      weight: newWeight,
      weight_unit: weightUnit,
      date: currentDateString,
      formattedDate: formattedDate,
      comment: commentToInsert,
    };

    sortUserWeightsByActiveCategory([...userWeights, newUserWeight]);

    resetUserWeight();
    toast.success("User Weight Added");
    userWeightModal.onClose();
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

  const isWeightInputValid = useIsStringValidNumber(userWeightInput);

  const updateUserWeight = async () => {
    if (
      operatingUserWeight.id === 0 ||
      operationType !== "edit" ||
      !isWeightInputValid
    )
      return;

    const newWeight = ConvertNumberToTwoDecimals(Number(userWeightInput));

    const commentToInsert = ConvertEmptyStringToNull(commentInput);

    const updatedUserWeight: UserWeight = {
      ...operatingUserWeight,
      weight: newWeight,
      weight_unit: weightUnit,
      comment: commentToInsert,
    };

    const success = await UpdateUserWeight(updatedUserWeight);

    if (!success) return;

    const updatedUserWeights = UpdateItemInList(userWeights, updatedUserWeight);

    sortUserWeightsByActiveCategory(updatedUserWeights);

    resetUserWeight();

    toast.success("Body Weight Entry Updated");
    userWeightModal.onClose();
  };

  const handleUserWeightOptionSelection = (
    key: string,
    userWeight: UserWeight
  ) => {
    if (key === "edit") {
      setOperatingUserWeight(userWeight);
      setUserWeightInput(userWeight.weight.toString());
      setWeightUnit(userWeight.weight_unit);
      setCommentInput(userWeight.comment ?? "");
      setOperationType("edit");
      userWeightModal.onOpen();
    } else if (key === "delete") {
      setOperatingUserWeight(userWeight);
      setOperationType("delete");
      deleteModal.onOpen();
    }
  };

  const resetUserWeight = () => {
    if (userSettings === undefined) return;

    setOperatingUserWeight(defaultUserWeight);
    setOperationType("add");
    setUserWeightInput("");
    setWeightUnit(userSettings.default_unit_weight);
    setCommentInput("");
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
        // Show newest date first if same weight
        return b.date.localeCompare(a.date);
      }
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
      default:
        break;
    }
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
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
        userWeightInput={userWeightInput}
        setUserWeightInput={setUserWeightInput}
        isWeightInputValid={isWeightInputValid}
        weightUnit={weightUnit}
        setWeightUnit={setWeightUnit}
        commentInput={commentInput}
        setCommentInput={setCommentInput}
        buttonAction={
          operationType === "edit" ? updateUserWeight : addUserWeight
        }
        isEditing={operationType === "edit"}
      />
      <FilterUserWeightListModal
        filterUserWeightListModal={filterUserWeightListModal}
        dateRange={filterDateRange}
        setDateRange={setFilterDateRange}
        filterWeekdays={filterWeekdays}
        setFilterWeekdays={setFilterWeekdays}
        weekdayMap={weekdayMap}
        locale={userSettings.locale}
        buttonAction={handleFilterSaveButton}
      />
      <div className="flex flex-col items-center gap-1">
        <ListPageSearchInput
          header="User Weight List"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredWeights.length}
          totalListLength={userWeights.length}
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
                        Date (Newest First)
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
