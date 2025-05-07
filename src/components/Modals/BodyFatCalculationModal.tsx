import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  RadioGroup,
  Radio,
  Select,
  SelectItem,
} from "@heroui/react";
import { UseBodyFatCalculationSettingsReturnType } from "../../typings";
import { useState } from "react";

type BodyFatCalculationModalProps = {
  useBodyFatCalculationSettings: UseBodyFatCalculationSettingsReturnType;
};

type ModalPage = "base" | "measurements-list";

export const BodyFatCalculationModal = ({
  useBodyFatCalculationSettings,
}: BodyFatCalculationModalProps) => {
  const [modalPage, setModalPage] = useState<ModalPage>("base");

  const {
    isMale,
    setIsMale,
    ageGroup,
    setAgeGroup,
    measurementList,
    bodyFatCalculationModal,
  } = useBodyFatCalculationSettings;

  const caliperMeasurements = [
    "Biceps",
    "Triceps",
    "Subscapular",
    "Suprailiac",
  ];

  return (
    <Modal
      isOpen={bodyFatCalculationModal.isOpen}
      onOpenChange={bodyFatCalculationModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Body Fat Percentage Calculation Settings</ModalHeader>
            <ModalBody>
              <div className="flex flex-col h-[400px]">
                <div className="flex justify-center gap-16 items-start">
                  <Select
                    label="Age"
                    labelPlacement="outside"
                    className="w-[6.25rem]"
                    classNames={{
                      label: "!text-default-500 ml-1 mt-1",
                      trigger: "mt-0.5",
                      base: "justify-start",
                    }}
                    variant="faded"
                    size="lg"
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
                  <RadioGroup
                    className="gap-0.5"
                    classNames={{ wrapper: "gap-0.5" }}
                    value={isMale ? "male" : "female"}
                    onValueChange={(value) => setIsMale(value === "male")}
                    label="Gender"
                  >
                    <Radio value="male">Male</Radio>
                    <Radio value="female">Female</Radio>
                  </RadioGroup>
                </div>
                <h3 className="text-lg font-medium pt-4 pb-0.5">
                  Caliper Measurements
                </h3>
                <div className="flex flex-col gap-1.5">
                  {caliperMeasurements.map((measurement, index) => (
                    <div className="flex items-end gap-1.5">
                      <div className="flex flex-col gap-px">
                        <span className="font-medium text-stone-500 px-px">
                          {measurement}
                        </span>
                        <div className="w-[12.5rem] font-medium bg-default-100 border-2 border-default-200 px-2 py-1 text-sm rounded-lg truncate">
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
                      >
                        Change
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
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
