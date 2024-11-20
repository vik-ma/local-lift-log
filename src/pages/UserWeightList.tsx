import Database from "tauri-plugin-sql-api";
import { useState, useEffect, useCallback, useMemo } from "react";
import { UserWeight, UserSettings, ListFilterMapKey } from "../typings";
import {
  LoadingSpinner,
  DeleteModal,
  UserWeightModal,
  EmptyListLabel,
  UserWeightListItem,
  ListPageSearchInput,
  DateRangeModal,
} from "../components";
import {
  ConvertEmptyStringToNull,
  ConvertNumberToTwoDecimals,
  DeleteItemFromList,
  DeleteUserWeightWithId,
  FormatDateTimeString,
  GetCurrentDateTimeISOString,
  GetUserSettings,
  InsertUserWeightIntoDatabase,
  UpdateItemInList,
  UpdateUserWeight,
} from "../helpers";
import {
  Button,
  CalendarDate,
  RangeValue,
  useDisclosure,
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import {
  useDefaultUserWeight,
  useIsStringValidNumber,
  useWeekdayMap,
} from "../hooks";

type OperationType = "add" | "edit" | "delete";

export default function UserWeightList() {
  const [userWeights, setUserWeights] = useState<UserWeight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [userWeightInput, setUserWeightInput] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<string>("");
  const [commentInput, setCommentInput] = useState<string>("");
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const weekdayMap = useWeekdayMap();

  const [filterDateRange, setFilterDateRange] =
    useState<RangeValue<CalendarDate> | null>(null);
  const [filterMap, setFilterMap] = useState<Map<ListFilterMapKey, string>>(
    new Map()
  );
  const [filterWeekdays, setFilterWeekdays] = useState<Set<string>>(
    new Set(weekdayMap.keys())
  );

  const dateRangeModal = useDisclosure();

  const filteredWeights = useMemo(() => {
    if (filterQuery !== "") {
      return userWeights.filter(
        (item) =>
          item.weight
            .toString()
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
          item.formattedDate
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
          item.comment
            ?.toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase())
      );
    }
    return userWeights;
  }, [userWeights, filterQuery]);

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

      setUserWeights(userWeights);
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

    // TODO: UPDATE AFTER ADDING SORT
    setUserWeights([newUserWeight, ...userWeights]);

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

    setUserWeights(updatedUserWeights);

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

    setUserWeights(updatedUserWeights);

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
      <DateRangeModal
        dateRangeModal={dateRangeModal}
        dateRange={filterDateRange}
        setDateRange={setFilterDateRange}
        header="Select Date Range"
        locale={userSettings.locale}
        buttonAction={() => {}}
        filterWeekdays={filterWeekdays}
        setFilterWeekdays={setFilterWeekdays}
        weekdayMap={weekdayMap}
      />
      <div className="flex flex-col items-center gap-1">
        <ListPageSearchInput
          header="User Weight List"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredWeights.length}
          totalListLength={userWeights.length}
          bottomContent={
            <div className="flex justify-between">
              <Button
                color="secondary"
                variant="flat"
                onPress={handleCreateNewUserWeightButton}
                size="sm"
              >
                Add New Weight
              </Button>
              <Button
                className="z-1"
                variant="flat"
                color={filterMap.size > 0 ? "secondary" : "default"}
                size="sm"
                onPress={() => dateRangeModal.onOpen()}
              >
                Filter
              </Button>
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
