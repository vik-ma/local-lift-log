import { useState, useEffect, useRef } from "react";
import {
  LoadingSpinner,
  DeleteModal,
  MeasurementModal,
  ListPageSearchInput,
  EmptyListLabel,
  FavoriteButton,
  ListFilters,
  MeasurementListOptions,
} from "../components";
import { Measurement, UserSettings } from "../typings";
import Database from "@tauri-apps/plugin-sql";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownTrigger,
} from "@heroui/react";
import toast from "react-hot-toast";
import {
  CreateDefaultMeasurements,
  GetUserSettings,
  GenerateActiveMeasurementString,
  UpdateItemInList,
  DeleteItemFromList,
  FormatNumBodyMeasurementsEntriesString,
  UpdateUserSetting,
  LoadStore,
  ValidateAndModifyUserSettings,
} from "../helpers";
import { CheckmarkIcon, VerticalMenuIcon } from "../assets";
import { useMeasurementList } from "../hooks";
import { Store } from "@tauri-apps/plugin-store";
import { DEFAULT_MEASUREMENT } from "../constants";

type OperationType = "add" | "edit" | "delete";

export default function MeasurementList() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] = useState<OperationType>("add");

  const defaultMeasurement = DEFAULT_MEASUREMENT;

  const [operatingMeasurement, setOperatingMeasurement] =
    useState<Measurement>(defaultMeasurement);

  const deleteModal = useDisclosure();
  const measurementModal = useDisclosure();
  const setUnitsModal = useDisclosure();

  const store = useRef<Store>(null);

  const measurementList = useMeasurementList({
    store: store,
    showNumberOfBodyMeasurementsEntries: true,
  });

  const {
    measurements,
    setMeasurements,
    isMeasurementListLoaded,
    filterQuery,
    setFilterQuery,
    filteredMeasurements,
    toggleFavorite,
    sortMeasurementsByActiveCategory,
    activeMeasurementSet,
    setActiveMeasurementSet,
    createMeasurement,
    measurementListFilters,
    loadMeasurementList,
  } = measurementList;

  const { filterMap, removeFilter, prefixMap } = measurementListFilters;

  useEffect(() => {
    const loadPage = async () => {
      try {
        const userSettings = await GetUserSettings();

        if (userSettings === undefined) return;

        setUserSettings(userSettings);

        ValidateAndModifyUserSettings(
          userSettings,
          new Set(["default_unit_measurement", "locale"])
        );

        setOperatingMeasurement((prev) => ({
          ...prev,
          default_unit: userSettings.default_unit_measurement,
        }));

        await LoadStore(store);

        await loadMeasurementList(userSettings);
      } catch (error) {
        console.log(error);
      }
    };

    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addMeasurement = async (measurement: Measurement) => {
    if (operationType !== "add") return;

    const newMeasurementId = await createMeasurement(measurement);

    if (newMeasurementId === 0) return;

    resetOperatingMeasurement();

    measurementModal.onClose();
    toast.success("Measurement Added");
  };

  const updateMeasurement = async (measurement: Measurement) => {
    if (measurement.id === 0 || operationType !== "edit") return;

    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      `UPDATE measurements 
       SET name = $1, default_unit = $2, measurement_type = $3 
       WHERE id = $4`,
      [
        measurement.name,
        measurement.default_unit,
        measurement.measurement_type,
        measurement.id,
      ]
    );

    const updatedMeasurements = UpdateItemInList(measurements, measurement);

    sortMeasurementsByActiveCategory(updatedMeasurements);

    resetOperatingMeasurement();

    measurementModal.onClose();
    toast.success("Measurement Updated");
  };

  const deleteMeasurement = async (measurementToDelete?: Measurement) => {
    const measurement = measurementToDelete ?? operatingMeasurement;

    if (measurement.id === 0) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from measurements WHERE id = $1", [measurement.id]);

      const updatedMeasurements = DeleteItemFromList(
        measurements,
        measurement.id
      );

      setMeasurements(updatedMeasurements);

      if (activeMeasurementSet.has(measurement.id)) {
        // Modify active_tracking_measurements string in user_settings
        // if measurementToDelete id is currently included
        const updatedMeasurementSet = new Set(activeMeasurementSet);
        updatedMeasurementSet.delete(measurement.id);

        setActiveMeasurementSet(updatedMeasurementSet);
        updateActiveMeasurementString([...updatedMeasurementSet]);
      }

      toast.success("Measurement Deleted");
    } catch (error) {
      console.log(error);
    }

    resetOperatingMeasurement();
    deleteModal.onClose();
  };

  const handleDeleteButton = (measurement: Measurement) => {
    setOperatingMeasurement(measurement);
    setOperationType("delete");
    deleteModal.onOpen();
  };

  const handleSaveButton = async (measurement: Measurement) => {
    if (operationType === "edit") {
      await updateMeasurement(measurement);
    } else if (operationType === "add") {
      await addMeasurement(measurement);
    }
  };

  const handleCreateNewMeasurementButton = () => {
    if (operationType !== "add") {
      resetOperatingMeasurement();
    }

    measurementModal.onOpen();
  };

  const handleEditButton = (measurement: Measurement) => {
    setOperatingMeasurement(measurement);
    setOperationType("edit");
    measurementModal.onOpen();
  };

  const resetOperatingMeasurement = () => {
    setOperationType("add");
    setOperatingMeasurement({
      ...defaultMeasurement,
      default_unit: userSettings!.default_unit_measurement!,
    });
  };

  const restoreDefaultMeasurements = async (useMetricUnits: boolean) => {
    const newMeasurements = await CreateDefaultMeasurements(useMetricUnits);

    sortMeasurementsByActiveCategory(newMeasurements);

    setUnitsModal.onClose();
    toast.success("Default Measurements Restored");
  };

  const trackMeasurement = async (measurementId: number) => {
    if (activeMeasurementSet === undefined) return;

    const updatedMeasurementSet = new Set(activeMeasurementSet);
    updatedMeasurementSet.add(measurementId);

    setActiveMeasurementSet(updatedMeasurementSet);
    updateActiveMeasurementString([...updatedMeasurementSet]);

    toast.success("Measurement Tracked");
  };

  const untrackMeasurement = async (measurementId: number) => {
    if (activeMeasurementSet === undefined) return;

    const updatedMeasurementSet = new Set(activeMeasurementSet);
    updatedMeasurementSet.delete(measurementId);

    setActiveMeasurementSet(updatedMeasurementSet);
    updateActiveMeasurementString([...updatedMeasurementSet]);

    toast.success("Measurement Untracked");
  };

  const updateActiveMeasurementString = async (numberList: number[]) => {
    if (userSettings === undefined) return;

    const activeMeasurementTrackingString =
      GenerateActiveMeasurementString(numberList);

    await UpdateUserSetting(
      "active_tracking_measurements",
      activeMeasurementTrackingString,
      userSettings,
      setUserSettings
    );
  };

  const handleOptionSelection = (key: string, measurement: Measurement) => {
    if (userSettings === undefined) return;

    switch (key) {
      case "edit": {
        handleEditButton(measurement);
        break;
      }
      case "delete": {
        if (userSettings.never_show_delete_modal) {
          handleDeleteButton(measurement);
        } else {
          deleteMeasurement(measurement);
        }
        break;
      }
      case "track": {
        trackMeasurement(measurement.id);
        break;
      }
      case "untrack": {
        untrackMeasurement(measurement.id);
        break;
      }
      case "toggle-favorite": {
        toggleFavorite(measurement);
        break;
      }
    }
  };

  const handleMeasurementClick = (measurementId: number) => {
    if (activeMeasurementSet.has(measurementId)) {
      untrackMeasurement(measurementId);
    } else {
      trackMeasurement(measurementId);
    }
  };

  if (userSettings === undefined || !isMeasurementListLoaded.current)
    return <LoadingSpinner />;

  return (
    <>
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Measurement"
        body={
          <p>
            Are you sure you want to permanently delete{" "}
            <span className="text-secondary truncate max-w-[23rem] inline-block align-top">
              {operatingMeasurement.name}
            </span>
            ?
          </p>
        }
        deleteButtonAction={deleteMeasurement}
      />
      <MeasurementModal
        measurementModal={measurementModal}
        measurement={operatingMeasurement}
        setMeasurement={setOperatingMeasurement}
        buttonAction={handleSaveButton}
      />
      <Modal
        isOpen={setUnitsModal.isOpen}
        onOpenChange={setUnitsModal.onOpenChange}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Choose Unit Type</ModalHeader>
              <ModalBody>
                <p>Use Metric or Imperial units?</p>
              </ModalBody>
              <ModalFooter className="flex justify-center gap-5">
                <Button
                  className="text-lg font-medium"
                  size="lg"
                  color="primary"
                  onPress={() => {
                    const useMetricUnits = true;
                    restoreDefaultMeasurements(useMetricUnits);
                  }}
                >
                  Metric
                </Button>
                <Button
                  className="text-lg font-medium"
                  size="lg"
                  color="primary"
                  onPress={() => {
                    const useMetricUnits = false;
                    restoreDefaultMeasurements(useMetricUnits);
                  }}
                >
                  Imperial
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col items-center gap-1.5">
        <ListPageSearchInput
          header="Measurement List"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredMeasurements.length}
          totalListLength={measurements.length}
          isListFiltered={filterMap.size > 0}
          bottomContent={
            <div className="flex flex-col gap-1">
              <div className="flex justify-between gap-1 w-full items-center">
                <Button
                  color="secondary"
                  variant="flat"
                  onPress={handleCreateNewMeasurementButton}
                  size="sm"
                >
                  New Measurement
                </Button>
                <MeasurementListOptions useMeasurementList={measurementList} />
              </div>
              <span className="px-1 text-xs text-stone-500 font-normal">
                Click on a Measurement to add to Active Measurements
              </span>
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
        <div className="flex flex-col gap-1 w-full">
          {filteredMeasurements.map((measurement) => (
            <div
              key={measurement.id}
              className={
                activeMeasurementSet.has(measurement.id)
                  ? "flex cursor-pointer bg-amber-100 border-2 border-amber-300 rounded-xl transition-colors duration-100 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                  : "flex cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl transition-colors duration-100 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
              }
              onClick={() => handleMeasurementClick(measurement.id)}
            >
              <div className="flex justify-between items-center py-1 pl-2 w-full">
                <div className="flex gap-2.5 items-center">
                  <CheckmarkIcon
                    isChecked={activeMeasurementSet.has(measurement.id)}
                    size={29}
                  />
                  <div className="flex flex-col justify-start items-start">
                    <span className="w-[13.5rem] truncate text-left">
                      {measurement.name}
                    </span>
                    <span className="text-xs text-stone-400 text-left">
                      {measurement.measurement_type}
                    </span>
                    {measurement.numBodyMeasurementsEntries! > 0 && (
                      <span className="w-[13.5rem] truncate text-xs text-secondary text-left">
                        {FormatNumBodyMeasurementsEntriesString(
                          measurement.numBodyMeasurementsEntries
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pr-1">
                  <div className="flex items-center pr-1">
                    <FavoriteButton
                      name={measurement.name}
                      isFavorite={!!measurement.is_favorite}
                      item={measurement}
                      toggleFavorite={toggleFavorite}
                    />
                  </div>
                  <div className="flex flex-col items-center text-sm text-stone-500">
                    <span>Unit</span>
                    <span className="font-semibold">
                      {measurement.default_unit}
                    </span>
                  </div>
                  <Dropdown shouldBlockScroll={false}>
                    <DropdownTrigger>
                      <Button
                        aria-label={`Toggle ${measurement.name} Options Menu`}
                        isIconOnly
                        className="z-1"
                        radius="lg"
                        variant="light"
                      >
                        <VerticalMenuIcon size={19} color="#888" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label={`Options Menu For ${measurement.name} Measurement`}
                      onAction={(key) =>
                        handleOptionSelection(key as string, measurement)
                      }
                    >
                      <DropdownItem key="edit" className="text-slate-400">
                        Edit
                      </DropdownItem>
                      {activeMeasurementSet.has(measurement.id) ? (
                        <DropdownItem key="untrack" className="text-success">
                          Untrack
                        </DropdownItem>
                      ) : (
                        <DropdownItem key="track" className="text-success">
                          Track
                        </DropdownItem>
                      )}
                      <DropdownItem
                        key="toggle-favorite"
                        className="text-secondary"
                      >
                        {measurement.is_favorite
                          ? "Remove Favorite"
                          : "Set Favorite"}
                      </DropdownItem>
                      <DropdownItem key="delete" className="text-danger">
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </div>
          ))}
          {filteredMeasurements.length === 0 && (
            <EmptyListLabel itemName="Measurements" />
          )}
        </div>
        <Button variant="flat" onPress={() => setUnitsModal.onOpen()}>
          Restore Default Measurements
        </Button>
      </div>
    </>
  );
}
