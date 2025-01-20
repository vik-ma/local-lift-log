import { useState, useEffect } from "react";
import {
  LoadingSpinner,
  UserMeasurementAccordions,
  DeleteModal,
  UserMeasurementModal,
  NameInputModal,
  ListPageSearchInput,
  FilterUserMeasurementListModal,
  ListFilters,
  TimeInputModal,
} from "../components";
import { Measurement, UserMeasurement, UserSettings } from "../typings";
import {
  ConvertUserMeasurementValuesToMeasurementInputs,
  CreateDetailedUserMeasurementList,
  DeleteUserMeasurementWithId,
  GetUserSettings,
  ConvertEmptyStringToNull,
  CreateUserMeasurementValues,
  UpdateUserMeasurements,
  DeleteItemFromList,
  UpdateItemInList,
  CreateActiveMeasurementInputs,
  InsertUserMeasurementIntoDatabase,
  GenerateActiveMeasurementString,
  UpdateActiveTrackingMeasurements,
  ValidateISODateString,
  FormatDateTimeString,
} from "../helpers";
import {
  useDefaultUserMeasurements,
  useUserMeasurementList,
  useMeasurementsInputs,
  useReassignMeasurement,
  useMeasurementList,
} from "../hooks";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
} from "@nextui-org/react";
import toast from "react-hot-toast";

type OperationType = "add" | "edit" | "delete" | "edit-timestamp";

export default function UserMeasurementList() {
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [activeMeasurements, setActiveMeasurements] = useState<Measurement[]>(
    []
  );
  const [measurementsCommentInput, setMeasurementsCommentInput] =
    useState<string>("");
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const defaultUserMeasurements = useDefaultUserMeasurements();

  const [operatingUserMeasurements, setOperatingUserMeasurements] =
    useState<UserMeasurement>(defaultUserMeasurements);

  const measurementList = useMeasurementList();

  const { measurementMap } = measurementList;

  const {
    userMeasurements,
    setUserMeasurements,
    getUserMeasurements,
    sortCategory,
    handleSortOptionSelection,
    sortUserMeasurementsByActiveCategory,
    filteredUserMeasurements,
    filterQuery,
    setFilterQuery,
    listFilters,
  } = useUserMeasurementList(measurementList);

  const { filterMap, removeFilter, prefixMap } = listFilters;

  const {
    newMeasurementName,
    setNewMeasurementName,
    isNewMeasurementNameValid,
    nameInputModal,
    handleReassignMeasurement,
    reassignMeasurement,
  } = useReassignMeasurement(measurementList);

  const deleteModal = useDisclosure();
  const userMeasurementModal = useDisclosure();
  const timeInputModal = useDisclosure();
  const filterUserMeasurementListModal = useDisclosure();

  const measurementsInputs = useMeasurementsInputs(
    activeMeasurements,
    setActiveMeasurements
  );

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings) {
        setUserSettings(userSettings);
        getUserMeasurements(userSettings.clock_style);
      }
    };

    loadUserSettings();
  }, [getUserMeasurements]);

  const handleMeasurementAccordionClick = (
    measurement: UserMeasurement,
    index: number
  ) => {
    const updatedMeasurement: UserMeasurement = {
      ...measurement,
      isExpanded: !measurement.isExpanded,
    };

    const updatedMeasurementEntries = [...userMeasurements];
    updatedMeasurementEntries[index] = updatedMeasurement;

    setUserMeasurements(updatedMeasurementEntries);
  };

  const addUserMeasurements = async () => {
    if (
      operationType !== "add" ||
      !measurementsInputs.areActiveMeasurementsValid ||
      userSettings === undefined
    )
      return;

    const commentToInsert = ConvertEmptyStringToNull(measurementsCommentInput);

    const userMeasurementValues =
      CreateUserMeasurementValues(activeMeasurements);

    const newUserMeasurements = await InsertUserMeasurementIntoDatabase(
      userMeasurementValues,
      commentToInsert,
      userSettings.clock_style,
      measurementMap.current
    );

    if (newUserMeasurements === undefined) return;

    const updatedUserMeasurementList = [
      ...userMeasurements,
      newUserMeasurements,
    ];

    sortUserMeasurementsByActiveCategory(updatedUserMeasurementList);

    resetUserMeasurements();

    if (userSettings.automatically_update_active_measurements === 1) {
      await updateActiveTrackingMeasurementOrder();
    }

    userMeasurementModal.onClose();
    toast.success("Body Measurements Added");
  };

  const updateUserMeasurements = async () => {
    if (
      operatingUserMeasurements.id === 0 ||
      !measurementsInputs.areActiveMeasurementsValid ||
      userSettings === undefined
    )
      return;

    const commentToInsert = ConvertEmptyStringToNull(measurementsCommentInput);

    const userMeasurementValues =
      CreateUserMeasurementValues(activeMeasurements);

    const updatedUserMeasurements: UserMeasurement = {
      ...operatingUserMeasurements,
      comment: commentToInsert,
      measurement_values: userMeasurementValues,
    };

    const success = await UpdateUserMeasurements(updatedUserMeasurements);

    if (!success) return;

    const detailedUpdatedUserMeasurement = CreateDetailedUserMeasurementList(
      [updatedUserMeasurements],
      measurementMap.current,
      userSettings.clock_style
    );

    const updatedUserMeasurementList = UpdateItemInList(
      userMeasurements,
      detailedUpdatedUserMeasurement[0]
    );

    sortUserMeasurementsByActiveCategory(updatedUserMeasurementList);

    resetUserMeasurements();

    toast.success("Body Measurements Entry Updated");
    userMeasurementModal.onClose();
  };

  const updateUserMeasurementTimestamp = async (dateString: string) => {
    if (
      operatingUserMeasurements.id === 0 ||
      operationType !== "edit-timestamp" ||
      userSettings === undefined ||
      !ValidateISODateString(dateString)
    )
      return;

    const formattedDate = FormatDateTimeString(
      dateString,
      userSettings.clock_style === "24h"
    );

    const updatedUserMeasurements: UserMeasurement = {
      ...operatingUserMeasurements,
      date: dateString,
      formattedDate,
    };

    const success = await UpdateUserMeasurements(updatedUserMeasurements);

    if (!success) return;

    const updatedUserMeasurementList = UpdateItemInList(
      userMeasurements,
      updatedUserMeasurements
    );

    sortUserMeasurementsByActiveCategory(updatedUserMeasurementList);

    resetUserMeasurements();

    toast.success("Timestamp Updated");
    timeInputModal.onClose();
  };

  const deleteUserMeasurements = async () => {
    if (operatingUserMeasurements.id === 0 || operationType !== "delete")
      return;

    const success = await DeleteUserMeasurementWithId(
      operatingUserMeasurements.id
    );

    if (!success) return;

    const updatedUserMeasurements = DeleteItemFromList(
      userMeasurements,
      operatingUserMeasurements.id
    );

    sortUserMeasurementsByActiveCategory(updatedUserMeasurements);

    resetUserMeasurements();

    toast.success("Body Measurements Entry Deleted");
    deleteModal.onClose();
  };

  const resetUserMeasurements = () => {
    setOperatingUserMeasurements(defaultUserMeasurements);
    setOperationType("add");
    setActiveMeasurements([]);
    setMeasurementsCommentInput("");
  };

  const handleAddUserMeasurements = async () => {
    if (userSettings === undefined) return;

    if (operationType !== "add") {
      resetUserMeasurements();
    }

    const activeMeasurements = await CreateActiveMeasurementInputs(
      userSettings.active_tracking_measurements
    );

    setActiveMeasurements(activeMeasurements);

    userMeasurementModal.onOpen();
  };

  const handleEditUserMeasurements = (userMeasurements: UserMeasurement) => {
    if (userMeasurements.userMeasurementValues === undefined) return;

    const activeMeasurements = ConvertUserMeasurementValuesToMeasurementInputs(
      userMeasurements.userMeasurementValues,
      measurementMap.current
    );

    setActiveMeasurements(activeMeasurements);
    setMeasurementsCommentInput(userMeasurements.comment ?? "");

    setOperatingUserMeasurements(userMeasurements);
    setOperationType("edit");
    userMeasurementModal.onOpen();
  };

  const handleUserMeasurementsOptionSelection = (
    key: string,
    userMeasurements: UserMeasurement
  ) => {
    if (key === "edit") {
      handleEditUserMeasurements(userMeasurements);
    } else if (key === "delete") {
      setOperatingUserMeasurements(userMeasurements);
      setOperationType("delete");
      deleteModal.onOpen();
    } else if (key === "edit-timestamp") {
      setOperatingUserMeasurements(userMeasurements);
      setOperationType("edit-timestamp");
      timeInputModal.onOpen();
    }
  };

  const reassignUserMeasurements = async () => {
    if (userSettings === undefined) return;

    const success = await reassignMeasurement(userMeasurements);

    if (!success) return;

    await getUserMeasurements(userSettings.clock_style);

    resetUserMeasurements();

    nameInputModal.onClose();
    toast.success("Measurement Reassigned");
  };

  const updateActiveTrackingMeasurementOrder = async () => {
    if (userSettings === undefined) return;

    const newActiveTrackingMeasurementIdList = activeMeasurements.map(
      (obj) => obj.id
    );

    const newActiveTrackingMeasurementString = GenerateActiveMeasurementString(
      newActiveTrackingMeasurementIdList
    );

    const success = await UpdateActiveTrackingMeasurements(
      newActiveTrackingMeasurementString,
      userSettings.id
    );

    if (!success) return;

    const updatedUserSettings: UserSettings = {
      ...userSettings,
      active_tracking_measurements: newActiveTrackingMeasurementString,
    };

    setUserSettings(updatedUserSettings);
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Body Measurements Entry"
        body={
          <p className="break-words">
            Are you sure you want to permanently delete the Body Measurements
            entry on{" "}
            <span className="text-secondary">
              {operatingUserMeasurements.formattedDate}
            </span>
            ?
          </p>
        }
        deleteButtonAction={deleteUserMeasurements}
      />
      <UserMeasurementModal
        userMeasurementModal={userMeasurementModal}
        activeMeasurements={activeMeasurements}
        setActiveMeasurements={setActiveMeasurements}
        measurementsCommentInput={measurementsCommentInput}
        setMeasurementsCommentInput={setMeasurementsCommentInput}
        useMeasurementList={measurementList}
        useMeasurementsInputs={measurementsInputs}
        buttonAction={
          operationType === "edit"
            ? updateUserMeasurements
            : addUserMeasurements
        }
        isEditing={operationType === "edit"}
      />
      <NameInputModal
        nameInputModal={nameInputModal}
        name={newMeasurementName}
        setName={setNewMeasurementName}
        header="Enter Measurement Name"
        isNameValid={isNewMeasurementNameValid}
        buttonAction={reassignUserMeasurements}
      />
      <FilterUserMeasurementListModal
        filterUserMeasurementListModal={filterUserMeasurementListModal}
        useListFilters={listFilters}
        locale={userSettings.locale}
        useMeasurementList={measurementList}
      />
      <TimeInputModal
        timeInputModal={timeInputModal}
        header="Edit Timestamp"
        clockStyle={userSettings.clock_style}
        locale={userSettings.locale}
        value={operatingUserMeasurements.date}
        saveButtonAction={updateUserMeasurementTimestamp}
      />
      <div className="flex flex-col items-center gap-1">
        <ListPageSearchInput
          header="User Measurement List"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredUserMeasurements.length}
          totalListLength={userMeasurements.length}
          isListFiltered={filterMap.size > 0}
          bottomContent={
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <Button
                  color="secondary"
                  variant="flat"
                  onPress={handleAddUserMeasurements}
                  size="sm"
                >
                  New User Measurements
                </Button>
                <div className="flex gap-1">
                  <Button
                    className="z-1"
                    variant="flat"
                    color={filterMap.size > 0 ? "secondary" : "default"}
                    size="sm"
                    onPress={() => filterUserMeasurementListModal.onOpen()}
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
                      aria-label="Sort User Measurements Dropdown Menu"
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
        <UserMeasurementAccordions
          userMeasurementEntries={filteredUserMeasurements}
          handleMeasurementAccordionClick={handleMeasurementAccordionClick}
          measurementMap={measurementMap.current}
          handleUserMeasurementsOptionSelection={
            handleUserMeasurementsOptionSelection
          }
          handleReassignMeasurement={handleReassignMeasurement}
        />
      </div>
    </>
  );
}
