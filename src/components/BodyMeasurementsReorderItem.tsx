import { Reorder, useDragControls } from "framer-motion";
import { Measurement } from "../typings";
import { Input } from "@heroui/react";
import { MeasurementUnitDropdown } from ".";
import { ReorderIcon } from "../assets";

type BodyMeasurementsReorderItemProps = {
  measurement: Measurement;
  index: number;
  activeMeasurements: Measurement[];
  setActiveMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>;
  invalidMeasurementInputs: Set<number>;
  handleActiveMeasurementInputChange: (value: string, index: number) => void;
  isEditing: boolean;
  updateActiveTrackingMeasurementOrder?: () => void;
  isBodyFatCalculationMeasurement?: boolean;
};

export const BodyMeasurementsReorderItem = ({
  measurement,
  index,
  activeMeasurements,
  setActiveMeasurements,
  invalidMeasurementInputs,
  handleActiveMeasurementInputChange,
  isEditing,
  updateActiveTrackingMeasurementOrder = () => {},
  isBodyFatCalculationMeasurement,
}: BodyMeasurementsReorderItemProps) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={measurement}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={() => updateActiveTrackingMeasurementOrder()}
    >
      <div className="flex gap-1.5 items-center relative">
        {isBodyFatCalculationMeasurement && (
          <div className="absolute left-[14rem] top-2.5 px-2 py-1 rounded-md text-sm text-yellow-600 bg-primary/30 z-50">
            BF%
          </div>
        )}
        <Input
          classNames={{
            inputWrapper: isBodyFatCalculationMeasurement
              ? "border-primary/65"
              : "",
          }}
          value={measurement.input}
          label={measurement.name}
          size="sm"
          variant="faded"
          onValueChange={(value) =>
            handleActiveMeasurementInputChange(value, index)
          }
          isInvalid={invalidMeasurementInputs.has(index)}
          isClearable
        />
        <MeasurementUnitDropdown
          value={measurement.default_unit}
          measurements={activeMeasurements}
          setMeasurements={setActiveMeasurements}
          measurement={measurement}
          targetType="active"
          isDisabled={measurement.measurement_type === "Caliper"}
          showLabel
        />
        {!isEditing && (
          <div
            className="flex items-center h-[2.75rem] cursor-grab active:cursor-grabbing select-none"
            onPointerDown={(event) => dragControls.start(event)}
          >
            <ReorderIcon size={18} color="#b6b6b6" showOnlyTwoColumns />
          </div>
        )}
      </div>
    </Reorder.Item>
  );
};
