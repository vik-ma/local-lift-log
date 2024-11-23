import { useState, useEffect } from "react";
import {
  LoadingSpinner,
  UserMeasurementAccordion,
  DeleteModal,
  UserMeasurementModal,
  NameInputModal,
  ListPageSearchInput,
  FilterUserMeasurementListModal,
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
} from "../helpers";
import {
  useDefaultUserMeasurements,
  useUserMeasurementList,
  useMeasurementsInputs,
  useReassignMeasurement,
  useListFilters,
} from "../hooks";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
} from "@nextui-org/react";
import { toast, Toaster } from "react-hot-toast";

type OperationType = "edit" | "delete";

export default function UserMeasurementList() {
  const [operationType, setOperationType] = useState<OperationType>("edit");
  const [activeMeasurements, setActiveMeasurements] = useState<Measurement[]>(
    []
  );
  const [measurementsCommentInput, setMeasurementsCommentInput] =
    useState<string>("");
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const defaultUserMeasurements = useDefaultUserMeasurements();

  const [operatingUserMeasurements, setOperatingUserMeasurements] =
    useState<UserMeasurement>(defaultUserMeasurements);

  const {
    invalidMeasurementInputs,
    areActiveMeasurementsValid,
    handleActiveMeasurementInputChange,
  } = useMeasurementsInputs(activeMeasurements, setActiveMeasurements);

  const deleteModal = useDisclosure();
  const userMeasurementModal = useDisclosure();

  const listFilters = useListFilters();

  const {
    filterMap,
    filterDateRange,
    filterWeekdays,
    handleFilterSaveButton,
    removeFilter,
    prefixMap,
  } = listFilters;

  const filterUserMeasurementListModal = useDisclosure();

  const {
    measurementMap,
    setMeasurementMap,
    userMeasurements,
    getUserMeasurements,
    setUserMeasurements,
    filterQuery,
    setFilterQuery,
    filteredUserMeasurements,
    sortCategory,
    handleSortOptionSelection,
    sortUserMeasurementsByActiveCategory,
  } = useUserMeasurementList();

  const {
    newMeasurementName,
    setNewMeasurementName,
    isNewMeasurementNameValid,
    nameInputModal,
    handleReassignMeasurement,
    reassignMeasurement,
  } = useReassignMeasurement();

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

  const updateUserMeasurements = async () => {
    if (
      operatingUserMeasurements.id === 0 ||
      !areActiveMeasurementsValid ||
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
      measurementMap,
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
    setOperationType("edit");
    setActiveMeasurements([]);
    setMeasurementsCommentInput("");
  };

  const handleEditUserMeasurements = (userMeasurements: UserMeasurement) => {
    if (userMeasurements.userMeasurementValues === undefined) return;

    const activeMeasurements = ConvertUserMeasurementValuesToMeasurementInputs(
      userMeasurements.userMeasurementValues,
      measurementMap
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

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
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
        invalidMeasurementInputs={invalidMeasurementInputs}
        handleActiveMeasurementInputChange={handleActiveMeasurementInputChange}
        areActiveMeasurementsValid={areActiveMeasurementsValid}
        measurementMap={measurementMap}
        setMeasurementMap={setMeasurementMap}
        buttonAction={updateUserMeasurements}
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
        buttonAction={handleFilterSaveButton}
      />
      <div className="flex flex-col items-center gap-1">
        <ListPageSearchInput
          header="User Measurement List"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredUserMeasurements.length}
          totalListLength={userMeasurements.length}
          bottomContent={
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <Button
                  color="secondary"
                  variant="flat"
                  onPress={() => {}}
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
                        Date (Newest First)
                      </DropdownItem>
                      <DropdownItem key="date-asc">
                        Date (Oldest First)
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </div>
          }
        />
        <UserMeasurementAccordion
          userMeasurementEntries={filteredUserMeasurements}
          handleMeasurementAccordionClick={handleMeasurementAccordionClick}
          measurementMap={measurementMap}
          handleUserMeasurementsOptionSelection={
            handleUserMeasurementsOptionSelection
          }
          handleReassignMeasurement={handleReassignMeasurement}
        />
      </div>
    </>
  );
}
