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
import {
  GenerateActiveMeasurementString,
  UpdateActiveTrackingMeasurements,
} from "../../helpers";
import { UserMeasurementReorderItem } from "..";
import { Reorder } from "framer-motion";
import { Measurement } from "../../typings";

type UserMeasurementModalProps = {
  userMeasurementModal: ReturnType<typeof useDisclosure>;
  activeMeasurements: Measurement[];
  setActiveMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>;
  userSettingsId: number;
  measurementsCommentInput: string;
  setMeasurementsCommentInput: React.Dispatch<React.SetStateAction<string>>;
  invalidMeasurementInputs: Set<number>;
  handleActiveMeasurementInputChange: (value: string, index: number) => void;
  areActiveMeasurementInputsEmpty: boolean;
  buttonAction: () => void;
  isEditing: boolean;
};

export const UserMeasurementModal = ({
  userMeasurementModal,
  activeMeasurements,
  setActiveMeasurements,
  userSettingsId,
  measurementsCommentInput,
  setMeasurementsCommentInput,
  invalidMeasurementInputs,
  handleActiveMeasurementInputChange,
  areActiveMeasurementInputsEmpty,
  buttonAction,
  isEditing,
}: UserMeasurementModalProps) => {
  const updateActiveTrackingMeasurementOrder = async () => {
    const activeTrackingMeasurementIdList: number[] = activeMeasurements.map(
      (obj) => obj.id
    );

    const activeTrackingMeasurementString: string =
      GenerateActiveMeasurementString(activeTrackingMeasurementIdList);

    await UpdateActiveTrackingMeasurements(
      activeTrackingMeasurementString,
      userSettingsId
    );
  };
  return (
    <Modal
      isOpen={userMeasurementModal.isOpen}
      onOpenChange={userMeasurementModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Edit Body Weight Entry</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-1">
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
                isDisabled={
                  areActiveMeasurementInputsEmpty ||
                  invalidMeasurementInputs.size > 0
                }
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
