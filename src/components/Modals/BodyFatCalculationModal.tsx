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
              <div className="flex flex-col gap-5 h-[400px]">
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
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-medium">Caliper Measurements</h3>
                  {caliperMeasurements.map((measurement, index) => (
                    <div className="flex flex-col">
                      <span className="font-medium text-stone-500">
                        {measurement}
                      </span>
                      <div className="text-sm">
                        {measurementList[index] !== undefined ? (
                          <span>{measurementList[index].name}</span>
                        ) : (
                          <span className="text-red-500">
                            No Measurement Selected
                          </span>
                        )}
                      </div>
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
