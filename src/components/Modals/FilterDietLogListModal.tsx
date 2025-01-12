import { UseDietLogListReturnType } from "../../typings";
import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@nextui-org/react";

type FilterDietLogListModal = {
  useDietLogList: UseDietLogListReturnType;
};

export const FilterDietLogListModal = ({
  useDietLogList,
}: FilterDietLogListModal) => {
  const { filterDietLogListModal, dietLogListFilters } = useDietLogList;

  const { showResetFilterButton, handleFilterSaveButton, resetFilter } =
    dietLogListFilters;

  return (
    <Modal
      isOpen={filterDietLogListModal.isOpen}
      onOpenChange={filterDietLogListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Filter Diet Log Entries</ModalHeader>
            <ModalBody></ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                {showResetFilterButton && (
                  <Button variant="flat" onPress={resetFilter}>
                    Reset All Filters
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleFilterSaveButton(filterDietLogListModal)}
                  // TODO: FIX
                  // isDisabled={isFilterButtonDisabled}
                >
                  Filter
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
