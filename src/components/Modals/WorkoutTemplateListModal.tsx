import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  UserSettings,
  UseWorkoutTemplateListReturnType,
  WorkoutTemplate,
} from "../../typings";
import { ReactNode } from "react";
import { WorkoutTemplateModalList } from "..";

type WorkoutTemplateListModalProps = {
  useWorkoutTemplateList: UseWorkoutTemplateListReturnType;
  userSettings: UserSettings;
  onClickAction: (workoutTemplate: WorkoutTemplate) => void;
  header: ReactNode;
};

export const WorkoutTemplateListModal = ({
  useWorkoutTemplateList,
  userSettings,
  onClickAction,
  header,
}: WorkoutTemplateListModalProps) => {
  const { workoutTemplateListModal } = useWorkoutTemplateList;

  return (
    <Modal
      isOpen={workoutTemplateListModal.isOpen}
      onOpenChange={workoutTemplateListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{header}</ModalHeader>
            <ModalBody>
              <WorkoutTemplateModalList
                useWorkoutTemplateList={useWorkoutTemplateList}
                userSettings={userSettings}
                onClickAction={onClickAction}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
