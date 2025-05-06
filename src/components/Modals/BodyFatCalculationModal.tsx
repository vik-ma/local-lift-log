import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { UseDisclosureReturnType } from "../../typings";
import { useState } from "react";

type BodyFatCalculationModalProps = {
  bodyFatCalculationModal: UseDisclosureReturnType;
};

type ModalPage = "base" | "measurements-list";

export const BodyFatCalculationModal = ({
  bodyFatCalculationModal,
}: BodyFatCalculationModalProps) => {
  const [modalPage, setModalPage] = useState<ModalPage>("base");

  return (
    <Modal
      isOpen={bodyFatCalculationModal.isOpen}
      onOpenChange={bodyFatCalculationModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>TODO: ADD</ModalHeader>
            <ModalBody></ModalBody>
            <ModalFooter className="flex justify-between">
              <div className="flex gap-2"></div>
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
                    modalPage === "base"
                      ? //   TODO: FIX
                        () => {}
                      : () => setModalPage("base")
                  }
                  //   TODO: FIX
                  //   isDisabled={
                  //     modalPage === "base" &&
                  //   }
                >
                  {modalPage === "base" ? "Done" : "Save"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
