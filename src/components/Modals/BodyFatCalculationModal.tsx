import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  Measurement,
  UseBodyFatCalculationSettingsReturnType,
  UseMeasurementListReturnType,
} from "../../typings";
import { useState } from "react";
import { MeasurementModalList } from "../ModalLists/MeasurementModalList";

type BodyFatCalculationModalProps = {
  useBodyFatCalculationSettings: UseBodyFatCalculationSettingsReturnType;
  useMeasurementList: UseMeasurementListReturnType;
};

type ModalPage = "base" | "measurements-list";

export const BodyFatCalculationModal = ({
  useBodyFatCalculationSettings,
  useMeasurementList,
}: BodyFatCalculationModalProps) => {
  const [modalPage, setModalPage] = useState<ModalPage>("base");
  const [operatingCaliperMeasurement, setOperatingCaliperMeasurement] =
    useState<string>("Biceps");
  const [operatingMeasurementIndex, setOperatingMeasurementIndex] =
    useState<number>(0);

  const {
    isMale,
    setIsMale,
    ageGroup,
    setAgeGroup,
    measurementList,
    setMeasurementList,
    bodyFatCalculationModal,
    hiddenMeasurements,
    isMeasurementListInvalid,
  } = useBodyFatCalculationSettings;

  const caliperMeasurements = [
    "Biceps",
    "Triceps",
    "Subscapular",
    "Suprailiac",
  ];

  const handleChangeButton = (measurement: string, index: number) => {
    setOperatingCaliperMeasurement(measurement);
    setOperatingMeasurementIndex(index);
    setModalPage("measurements-list");
  };

  const handleMeasurementClick = (measurement: Measurement) => {
    if (hiddenMeasurements.has(measurement.id)) return;

    const updatedMeasurementList = [...measurementList];

    updatedMeasurementList[operatingMeasurementIndex] = measurement;

    setMeasurementList(updatedMeasurementList);
    setModalPage("base");
  };

  return (
    <Modal
      isOpen={bodyFatCalculationModal.isOpen}
      onOpenChange={bodyFatCalculationModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {modalPage === "measurements-list"
                ? `Select Measurement For ${operatingCaliperMeasurement}`
                : "Body Fat Percentage Calculation Settings"}
            </ModalHeader>
            <ModalBody>
              {modalPage === "base" ? (
                <div className="flex flex-col gap-2 h-[400px]">
                  <div className="flex gap-[2.75rem]">
                    <div className="flex flex-col gap-1.5">
                      <Select
                        label="Age"
                        labelPlacement="outside"
                        className="w-[6.25rem]"
                        classNames={{
                          label:
                            "!text-stone-500 text-base font-medium mx-px mt-1.5",
                          trigger: "mt-0.5",
                          base: "justify-start",
                        }}
                        variant="faded"
                        size="sm"
                        selectedKeys={[ageGroup]}
                        onChange={(e) => setAgeGroup(e.target.value)}
                        disallowEmptySelection
                      >
                        <SelectItem key="17-19">17-19</SelectItem>
                        <SelectItem key="20-29">20-29</SelectItem>
                        <SelectItem key="30-39">30-39</SelectItem>
                        <SelectItem key="40-49">40-49</SelectItem>
                        <SelectItem key="50+">50+</SelectItem>
                      </Select>
                      <Select
                        label="Gender"
                        labelPlacement="outside"
                        className="w-[6.25rem]"
                        classNames={{
                          label:
                            "!text-stone-500 text-base font-medium mx-px mt-1.5",
                          trigger: "mt-0.5",
                          base: "justify-start",
                        }}
                        variant="faded"
                        size="sm"
                        selectedKeys={isMale ? ["male"] : ["female"]}
                        onChange={(e) => setIsMale(e.target.value === "male")}
                        disallowEmptySelection
                      >
                        <SelectItem key="male">Male</SelectItem>
                        <SelectItem key="female">Female</SelectItem>
                      </Select>
                    </div>
                    <div className="text-xs text-stone-500 pt-0.5 w-[15rem]">
                      Body fat percentage is calculated using the Durnin &
                      Womersley method.
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-lg font-medium">
                      Caliper Measurements
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      {caliperMeasurements.map((measurement, index) => (
                        <div key={measurement} className="flex items-end gap-1">
                          <div className="flex flex-col gap-px">
                            <span className="font-medium text-stone-500 px-px">
                              {measurement}
                            </span>
                            <div className="w-[12.375rem] bg-default-100 border-2 border-default-200 px-2 py-1 text-sm rounded-lg truncate">
                              {measurementList[index] !== undefined ? (
                                <span>{measurementList[index].name}</span>
                              ) : (
                                <span className="text-red-500">
                                  No Measurement Selected
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            aria-label={`Change ${measurement} caliper measurement`}
                            variant="flat"
                            size="sm"
                            onPress={() =>
                              handleChangeButton(measurement, index)
                            }
                          >
                            Change
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <MeasurementModalList
                  useMeasurementList={useMeasurementList}
                  handleMeasurementClick={handleMeasurementClick}
                  hiddenMeasurements={hiddenMeasurements}
                />
              )}
            </ModalBody>
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
                    // TODO: FIX
                    () => {}
                  }
                  isDisabled={modalPage !== "base" || isMeasurementListInvalid}
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
