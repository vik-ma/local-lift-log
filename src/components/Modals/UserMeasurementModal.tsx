import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  ScrollShadow,
} from "@nextui-org/react";
import {
  EmptyListLabel,
  FavoriteButton,
  SearchInput,
  UserMeasurementReorderItem,
} from "..";
import { Reorder } from "framer-motion";
import {
  Measurement,
  MeasurementMap,
  UseDisclosureReturnType,
} from "../../typings";
import { useMemo, useState } from "react";
import { SortMeasurementMap, UpdateIsFavorite } from "../../helpers";

type UserMeasurementModalProps = {
  userMeasurementModal: UseDisclosureReturnType;
  activeMeasurements: Measurement[];
  setActiveMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>;
  measurementsCommentInput: string;
  setMeasurementsCommentInput: React.Dispatch<React.SetStateAction<string>>;
  invalidMeasurementInputs: Set<number>;
  handleActiveMeasurementInputChange: (value: string, index: number) => void;
  areActiveMeasurementsValid: boolean;
  measurementMap: MeasurementMap;
  buttonAction: () => void;
  isEditing: boolean;
  updateActiveTrackingMeasurementOrder?: (
    newActiveMeasurements?: Measurement[]
  ) => void;
};

type ModalPage = "base" | "measurement-list";

export const UserMeasurementModal = ({
  userMeasurementModal,
  activeMeasurements,
  setActiveMeasurements,
  measurementsCommentInput,
  setMeasurementsCommentInput,
  invalidMeasurementInputs,
  handleActiveMeasurementInputChange,
  areActiveMeasurementsValid,
  measurementMap,
  buttonAction,
  isEditing,
  updateActiveTrackingMeasurementOrder = () => {},
}: UserMeasurementModalProps) => {
  const [measurements, setMeasurements] = useState<MeasurementMap>(
    new Map<string, Measurement>(measurementMap)
  );
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [modalPage, setModalPage] = useState<ModalPage>("base");

  const filteredMeasurements = useMemo(() => {
    if (filterQuery !== "") {
      return new Map(
        Array.from(measurements).filter(
          ([, value]) =>
            value.name
              .toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase()) ||
            value.measurement_type
              .toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase())
        )
      );
    }
    return measurements;
  }, [measurements, filterQuery]);

  const handleAddMeasurementButton = () => {
    const updatedMeasurements: MeasurementMap = new Map<string, Measurement>(
      measurementMap
    );

    activeMeasurements.forEach((measurement) => {
      updatedMeasurements.delete(measurement.id.toString());
    });

    setMeasurements(updatedMeasurements);

    setModalPage("measurement-list");
  };

  const handleMeasurementClick = (key: string) => {
    const measurement = measurementMap.get(key);

    if (measurement === undefined) return;

    const newMeasurements = [
      ...activeMeasurements,
      { ...measurement, input: "" },
    ];

    setActiveMeasurements(newMeasurements);

    if (!isEditing) {
      // Update active_tracking_measurements string only if adding new Measurements
      updateActiveTrackingMeasurementOrder(newMeasurements);
    }

    setModalPage("base");
  };

  const toggleFavorite = async (measurement: Measurement, key: string) => {
    const newFavoriteValue = measurement.is_favorite === 1 ? 0 : 1;

    const success = await UpdateIsFavorite(
      measurement.id,
      "measurement",
      newFavoriteValue
    );

    if (!success) return;

    const updatedMeasurement: Measurement = {
      ...measurement,
      is_favorite: newFavoriteValue,
    };

    const updatedMeasurementMap = new Map<string, Measurement>(measurementMap);

    updatedMeasurementMap.set(key, updatedMeasurement);

    const sortedUpdatedMeasurementMap = SortMeasurementMap(
      updatedMeasurementMap
    );

    // TODO: FIX
    // setMeasurementMap(sortedUpdatedMeasurementMap);

    if (measurements.has(key)) {
      const updatedMeasurements = new Map<string, Measurement>(measurements);

      updatedMeasurements.set(key, updatedMeasurement);

      const sortedUpdatedMeasurements = SortMeasurementMap(updatedMeasurements);

      setMeasurements(sortedUpdatedMeasurements);
    }
  };

  const header = useMemo(() => {
    if (modalPage === "base") {
      if (isEditing) return "Edit User Measurements Entry";
      else return "Add User Measurements Entry";
    } else {
      return "Add Measurement";
    }
  }, [modalPage, isEditing]);

  return (
    <Modal
      isOpen={userMeasurementModal.isOpen}
      onOpenChange={userMeasurementModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{header}</ModalHeader>
            <ModalBody>
              {modalPage === "measurement-list" ? (
                <div className="h-[400px] flex flex-col gap-2">
                  <SearchInput
                    filterQuery={filterQuery}
                    setFilterQuery={setFilterQuery}
                    filteredListLength={filteredMeasurements.size}
                    totalListLength={measurements.size}
                  />
                  <ScrollShadow className="flex flex-col gap-1">
                    {Array.from(filteredMeasurements).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex cursor-pointer gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                        onClick={() => handleMeasurementClick(key)}
                      >
                        <div className="flex justify-between items-center w-full">
                          <div className="flex flex-col justify-start items-start">
                            <span className="w-[20rem] truncate text-left">
                              {value.name}
                            </span>
                            <span className="text-xs text-stone-400 text-left">
                              {value.measurement_type}
                            </span>
                          </div>
                          <div className="flex items-center pr-1">
                            <FavoriteButton
                              name={value.name}
                              isFavorite={!!value.is_favorite}
                              item={value}
                              toggleFavorite={() => toggleFavorite(value, key)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredMeasurements.size === 0 && (
                      <EmptyListLabel itemName="Measurements" />
                    )}
                  </ScrollShadow>
                </div>
              ) : (
                <div className="h-[400px]">
                  <ScrollShadow className="flex flex-col gap-1.5 pr-2.5 h-full">
                    <Reorder.Group
                      className="flex flex-col gap-1.5 w-full"
                      values={activeMeasurements}
                      onReorder={setActiveMeasurements}
                    >
                      {activeMeasurements.map((measurement, index) => (
                        <UserMeasurementReorderItem
                          key={measurement.id}
                          measurement={measurement}
                          index={index}
                          activeMeasurements={activeMeasurements}
                          setActiveMeasurements={setActiveMeasurements}
                          invalidMeasurementInputs={invalidMeasurementInputs}
                          handleActiveMeasurementInputChange={
                            handleActiveMeasurementInputChange
                          }
                          isEditing={isEditing}
                          updateActiveTrackingMeasurementOrder={
                            updateActiveTrackingMeasurementOrder
                          }
                        />
                      ))}
                    </Reorder.Group>
                    <Input
                      value={measurementsCommentInput}
                      label="Comment"
                      size="sm"
                      variant="faded"
                      onValueChange={(value) =>
                        setMeasurementsCommentInput(value)
                      }
                      isClearable
                    />
                    {activeMeasurements.length === 0 && (
                      <EmptyListLabel
                        itemName="Active Measurements"
                        customLabel="Add a Body Measurement to log"
                      />
                    )}
                  </ScrollShadow>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <Button
                className="w-40"
                variant="flat"
                onPress={
                  modalPage === "measurement-list"
                    ? () => setModalPage("base")
                    : handleAddMeasurementButton
                }
              >
                {modalPage === "measurement-list"
                  ? "Cancel"
                  : "Add Measurement"}
              </Button>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={buttonAction}
                  isDisabled={
                    !areActiveMeasurementsValid ||
                    modalPage === "measurement-list"
                  }
                >
                  {isEditing ? "Update" : "Save"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
