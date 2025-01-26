import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { useExerciseList, useFilterExerciseList } from "../hooks";
import { useEffect, useState } from "react";
import {
  ExerciseModalList,
  FilterExerciseGroupsModal,
  LoadingSpinner,
} from "../components";
import { UserSettings } from "../typings";
import { GetUserSettings } from "../helpers";

type ListType = "exercise";

export default function AnalyticsIndex() {
  const [listType, setListType] = useState<ListType>("exercise");
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const listModal = useDisclosure();

  const exerciseList = useExerciseList(false, true, true);

  const { isExerciseListLoaded } = exerciseList;

  const filterExerciseList = useFilterExerciseList(exerciseList);

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);
    };

    loadUserSettings();
  }, []);

  if (userSettings === undefined || !isExerciseListLoaded)
    return <LoadingSpinner />;

  return (
    <>
      <Modal isOpen={listModal.isOpen} onOpenChange={listModal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {listType === "exercise" ? "Select Exercise" : ""}
              </ModalHeader>
              <ModalBody>
                {listType === "exercise" ? (
                  <ExerciseModalList
                    handleClickExercise={() => {}}
                    useExerciseList={exerciseList}
                    useFilterExerciseList={filterExerciseList}
                    userSettingsId={userSettings.id}
                    customHeightString="h-[440px]"
                    isInAnalyticsPage
                  />
                ) : (
                  <></>
                )}
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
      <FilterExerciseGroupsModal
        useExerciseList={exerciseList}
        useFilterExerciseList={filterExerciseList}
      />
      <div className="flex flex-col items-center gap-3">
        <Button
          variant="flat"
          color="secondary"
          onPress={() => listModal.onOpen()}
        >
          Select Exercise
        </Button>
      </div>
    </>
  );
}
