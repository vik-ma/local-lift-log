import {
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Listbox,
  ListboxItem,
} from "@nextui-org/react";
import { WorkoutTemplateListItem } from "../../typings";
import { ReactNode } from "react";

type WorkoutTemplateListModalProps = {
  workoutTemplateListModal: ReturnType<typeof useDisclosure>;
  workoutTemplates: WorkoutTemplateListItem[];
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
              <Listbox
                aria-label="Workout Template List"
                onAction={(key) => listboxOnActionFunction(Number(key))}
              >
                {workoutTemplates.map((template) => (
                  <ListboxItem
                    key={`${template.id}`}
                    className="text-success"
                    color="success"
                    variant="faded"
                  >
                    {template.name}
                  </ListboxItem>
                ))}
              </Listbox>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
