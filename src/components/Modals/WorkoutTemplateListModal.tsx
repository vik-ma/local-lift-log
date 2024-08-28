import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Listbox,
  ListboxItem,
} from "@nextui-org/react";
import { UseDisclosureReturnType, WorkoutTemplate } from "../../typings";
import { ReactNode } from "react";

type WorkoutTemplateListModalProps = {
  workoutTemplateListModal: UseDisclosureReturnType;
  workoutTemplates: WorkoutTemplate[];
  listboxOnActionFunction: (workoutTemplateId: number) => void;
  header: ReactNode;
};

export const WorkoutTemplateListModal = ({
  workoutTemplateListModal,
  workoutTemplates,
  listboxOnActionFunction,
  header,
}: WorkoutTemplateListModalProps) => {
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
              <div className="h-[270px] pr-1 overflow-auto scroll-gradient">
                <Listbox
                  aria-label="Workout Template List"
                  color="secondary"
                  emptyContent="No Workout Templates Created"
                  onAction={(key) => listboxOnActionFunction(Number(key))}
                >
                  {workoutTemplates.map((template) => (
                    <ListboxItem key={template.id} variant="faded">
                      {template.name}
                    </ListboxItem>
                  ))}
                </Listbox>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
