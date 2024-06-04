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

type WorkoutTemplateListModalProps = {
  workoutTemplateListModal: ReturnType<typeof useDisclosure>;
  workoutTemplates: WorkoutTemplateListItem[];
  listboxOnActionFunction: (workoutTemplateId: number) => void;
};

export const WorkoutTemplateListModal = ({
  workoutTemplateListModal,
  workoutTemplates,
  listboxOnActionFunction,
}: WorkoutTemplateListModalProps) => {
  return (
    <Modal
      isOpen={workoutTemplateListModal.isOpen}
      onOpenChange={workoutTemplateListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex gap-1.5">
              Load Workout Template
            </ModalHeader>
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
