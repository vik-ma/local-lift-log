import { Reorder, useDragControls } from "framer-motion";
import { Measurement } from "../typings";
import { Input } from "@nextui-org/react";
import MeasurementUnitDropdown from "./Dropdowns/MeasurementUnitDropdown";

type UserMeasurementReorderItemProps = {
  measurement: Measurement;
  index: number;
  activeMeasurements: Measurement[];
  setActiveMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>;
  invalidMeasurementInputs: Set<number>;
  handleActiveMeasurementInputChange: (value: string, index: number) => void;
  updateActiveTrackingMeasurementOrder: () => void;
};

export const UserMeasurementReorderItem = ({
  measurement,
  index,
  activeMeasurements,
  setActiveMeasurements,
  invalidMeasurementInputs,
  handleActiveMeasurementInputChange,
  updateActiveTrackingMeasurementOrder,
}: UserMeasurementReorderItemProps) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={measurement}
      dragListener={false}
      dragControls={controls}
      onDragEnd={() => updateActiveTrackingMeasurementOrder()}
    >
      <div className="flex justify-between gap-2 items-center">
        <Input
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
        />
        <div
          className="bg-red-500 w-5 h-5"
          onPointerDown={(e) => controls.start(e)}
        />
      </div>
    </Reorder.Item>
  );
};
