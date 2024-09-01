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
import { SearchInput, UserMeasurementReorderItem } from "..";
import { Reorder } from "framer-motion";
import {
  Measurement,
  MeasurementMap,
  UseDisclosureReturnType,
} from "../../typings";
import { useEffect, useMemo, useState } from "react";

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
  const [isAddingMeasurement, setIsAddingMeasurement] =
    useState<boolean>(false);
  const [measurements, setMeasurements] = useState<MeasurementMap>(
    new Map<string, Measurement>()
  );
  const [filterQuery, setFilterQuery] = useState<string>("");

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

  useEffect(() => {
    setMeasurements(measurementMap);
  }, [measurementMap]);

  const showMeasurementList =
    isAddingMeasurement || activeMeasurements.length === 0;

  const handleAddMeasurement = () => {
    if (isAddingMeasurement) {
      setIsAddingMeasurement(false);
      return;
    }

    const updatedMeasurements: MeasurementMap = new Map<string, Measurement>(
      measurementMap
    );

    activeMeasurements.forEach((measurement) => {
      updatedMeasurements.delete(measurement.id.toString());
    });

    setMeasurements(updatedMeasurements);

    setIsAddingMeasurement(true);
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

    setIsAddingMeasurement(false);
  };

  return (
    <Modal
      isOpen={userMeasurementModal.isOpen}
      onOpenChange={userMeasurementModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {showMeasurementList
                ? "Add Measurement"
                : "Edit Body Measurements Entry"}
            </ModalHeader>
            <ModalBody>
              <div className="h-[400px] flex flex-col gap-2">
                {showMeasurementList ? (
                  <>
                    <SearchInput
                      filterQuery={filterQuery}
                      setFilterQuery={setFilterQuery}
                    />
                    <ScrollShadow className="flex flex-col gap-1">
                      {Array.from(filteredMeasurements).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex flex-row cursor-pointer gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                          onClick={() => handleMeasurementClick(key)}
                        >
                          <div className="flex justify-between items-center w-full">
                            <div className="flex flex-col justify-start items-start">
                              <span className="w-[15.5rem] truncate text-left">
                                {value.name}
                              </span>
                              <span className="text-xs text-stone-400 text-left">
                                {value.measurement_type}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </ScrollShadow>
                  </>
                ) : (
                  <ScrollShadow className="flex flex-col gap-1.5 pr-2.5">
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
                  </ScrollShadow>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                {activeMeasurements.length > 0 && (
                  <Button
                    className="w-40"
                    variant="flat"
                    onPress={handleAddMeasurement}
                  >
                    {isAddingMeasurement ? "Cancel" : "Add Measurement"}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={buttonAction}
                  isDisabled={
                    !areActiveMeasurementsValid || isAddingMeasurement
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
