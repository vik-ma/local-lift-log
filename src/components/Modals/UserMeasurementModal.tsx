import {
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react";
import { UserMeasurementReorderItem } from "..";
import { Reorder } from "framer-motion";
import { Measurement } from "../../typings";

type UserMeasurementModalProps = {
  userMeasurementModal: ReturnType<typeof useDisclosure>;
  activeMeasurements: Measurement[];
  setActiveMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>;
  measurementsCommentInput: string;
  setMeasurementsCommentInput: React.Dispatch<React.SetStateAction<string>>;
  invalidMeasurementInputs: Set<number>;
  handleActiveMeasurementInputChange: (value: string, index: number) => void;
  areActiveMeasurementsValid: boolean;
  buttonAction: () => void;
  isEditing: boolean;
  updateActiveTrackingMeasurementOrder?: () => void;
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
  buttonAction,
  isEditing,
  updateActiveTrackingMeasurementOrder = () => {},
}: UserMeasurementModalProps) => {
  return (
    <Modal
      isOpen={userMeasurementModal.isOpen}
      onOpenChange={userMeasurementModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Edit Body Measurements Entry</ModalHeader>
            <ModalBody>
              <div className="h-[270px] flex flex-col gap-1 overflow-auto pr-3">
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
                  onValueChange={(value) => setMeasurementsCommentInput(value)}
                  isClearable
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="success" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="success"
                onPress={buttonAction}
                isDisabled={!areActiveMeasurementsValid}
              >
                {isEditing ? "Update" : "Save"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
