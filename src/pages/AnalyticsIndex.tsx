import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  useExerciseList,
  useFilterExerciseList,
  useMeasurementList,
} from "../hooks";
import { useEffect, useState } from "react";
import {
  ExerciseModalList,
  FilterExerciseGroupsModal,
  LoadingSpinner,
  MeasurementModalList,
} from "../components";
import { UserSettings } from "../typings";
import { GetUserSettings } from "../helpers";

type ListType = "exercise" | "measurement";

export default function AnalyticsIndex() {
  const [listType, setListType] = useState<ListType>("exercise");
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const listModal = useDisclosure();

  const exerciseList = useExerciseList(true, true, true);

  const { isExerciseListLoaded } = exerciseList;

  const filterExerciseList = useFilterExerciseList(exerciseList);

  const measurementList = useMeasurementList();

  const { isMeasurementListLoaded } = measurementList;

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);
    };

    loadUserSettings();
  }, []);

  const handleOpenListModal = (selectedListType: ListType) => {
    setListType(selectedListType);

    if (selectedListType) {
    }

    listModal.onOpen();
  };

  if (
    userSettings === undefined ||
    !isExerciseListLoaded.current ||
    !isMeasurementListLoaded.current
  )
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
                  <MeasurementModalList
                    useMeasurementList={measurementList}
                    handleMeasurementClick={() => {}}
                    customHeightString="h-[440px]"
                  />
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
        <div className="flex flex-col gap-1.5">
          <Button
            variant="flat"
            color="secondary"
            onPress={() => handleOpenListModal("exercise")}
          >
            Select Exercise
          </Button>
          <Button
            variant="flat"
            color="secondary"
            onPress={() => handleOpenListModal("measurement")}
          >
            Select Measurement
          </Button>
        </div>
      </div>
    </>
  );
}
