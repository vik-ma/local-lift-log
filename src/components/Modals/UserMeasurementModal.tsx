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
  UseDisclosureReturnType,
  UseMeasurementListReturnType,
  UseMeasurementsInputsReturnType,
} from "../../typings";
import { useMemo, useState } from "react";
import { DeleteItemFromList } from "../../helpers";
import { CheckmarkIcon } from "../../assets";

type UserMeasurementModalProps = {
  userMeasurementModal: UseDisclosureReturnType;
  activeMeasurements: Measurement[];
  setActiveMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>;
  measurementsCommentInput: string;
  setMeasurementsCommentInput: React.Dispatch<React.SetStateAction<string>>;
  useMeasurementsInputs: UseMeasurementsInputsReturnType;
  useMeasurementList: UseMeasurementListReturnType;
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
  useMeasurementsInputs,
  useMeasurementList,
  buttonAction,
  isEditing,
  updateActiveTrackingMeasurementOrder = () => {},
}: UserMeasurementModalProps) => {
  const [modalPage, setModalPage] = useState<ModalPage>("base");

  const {
    filterQuery,
    setFilterQuery,
    measurements,
    filteredMeasurements,
    toggleFavorite,
  } = useMeasurementList;

  const {
    invalidMeasurementInputs,
    areActiveMeasurementsValid,
    handleActiveMeasurementInputChange,
  } = useMeasurementsInputs;

  const handleMeasurementClick = (measurement: Measurement) => {
    if (activeMeasurementSet.has(measurement.id)) {
      const updatedMeasurements = DeleteItemFromList(
        activeMeasurements,
        measurement.id
      );
      setActiveMeasurements(updatedMeasurements);
    } else {
      const updatedMeasurements = [
        ...activeMeasurements,
        { ...measurement, input: "" },
      ];
      setActiveMeasurements(updatedMeasurements);
    }
  };

  const handleClearAllButton = () => {
    const updatedMeasurements: Measurement[] = [];

    setActiveMeasurements(updatedMeasurements);
  };

  const header = useMemo(() => {
    if (modalPage === "base") {
      if (isEditing) return "Edit User Measurements Entry";
      else return "Add User Measurements Entry";
    } else {
      return "Select Body Measurements To Log";
    }
  }, [modalPage, isEditing]);

  const activeMeasurementSet = useMemo(() => {
    return new Set<number>(activeMeasurements.map((obj) => obj.id));
  }, [activeMeasurements]);

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
                    filteredListLength={filteredMeasurements.length}
                    totalListLength={measurements.length}
                  />
                  <ScrollShadow className="flex flex-col gap-1">
                    {filteredMeasurements.map((measurement) => (
                      <div
                        key={measurement.id}
                        className={
                          activeMeasurementSet.has(measurement.id)
                            ? "flex cursor-pointer bg-yellow-100 border-2 border-yellow-300 rounded-xl transition-colors duration-100 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                            : "flex cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl transition-colors duration-100 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                        }
                        onClick={() => handleMeasurementClick(measurement)}
                      >
                        <div className="flex justify-between items-center py-1 pl-2 w-full">
                          <div className="flex gap-2.5 items-center">
                            <CheckmarkIcon
                              isChecked={activeMeasurementSet.has(
                                measurement.id
                              )}
                              size={29}
                            />
                            <div className="flex flex-col justify-start items-start">
                              <span className="w-[17.5rem] truncate text-left">
                                {measurement.name}
                              </span>
                              <span className="text-xs text-stone-400 text-left">
                                {measurement.measurement_type}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center pr-2">
                            <FavoriteButton
                              name={measurement.name}
                              isFavorite={!!measurement.is_favorite}
                              item={measurement}
                              toggleFavorite={() => toggleFavorite(measurement)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredMeasurements.length === 0 && (
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
              <div>
                {modalPage === "measurement-list" ? (
                  <>
                    {activeMeasurements.length > 0 && (
                      <Button variant="flat" onPress={handleClearAllButton}>
                        Clear All
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="flat"
                    onPress={() => setModalPage("measurement-list")}
                  >
                    Select Measurements
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  color="primary"
                  variant="light"
                  onPress={
                    modalPage === "base" ? onClose : () => setModalPage("base")
                  }
                >
                  {modalPage === "base" ? "Close" : "Back"}
                </Button>
                <Button
                  color="primary"
                  onPress={
                    modalPage === "measurement-list"
                      ? () => setModalPage("base")
                      : buttonAction
                  }
                  isDisabled={
                    !areActiveMeasurementsValid && modalPage === "base"
                  }
                >
                  {modalPage === "measurement-list"
                    ? "Done"
                    : isEditing
                    ? "Update"
                    : "Save"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
