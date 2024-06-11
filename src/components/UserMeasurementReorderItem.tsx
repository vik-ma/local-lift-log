import { Reorder, useDragControls } from "framer-motion";
import { Measurement } from "../typings";
import { Input } from "@nextui-org/react";
import MeasurementUnitDropdown from "./Dropdowns/MeasurementUnitDropdown";
import { ReorderIcon } from "../assets";

type UserMeasurementReorderItemProps = {
  measurement: Measurement;
  index: number;
  activeMeasurements: Measurement[];
  setActiveMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>;
  invalidMeasurementInputs: Set<number>;
  handleActiveMeasurementInputChange: (value: string, index: number) => void;
  isEditing: boolean;
  updateActiveTrackingMeasurementOrder?: () => void;
};

export const UserMeasurementReorderItem = ({
  measurement,
  index,
  activeMeasurements,
  setActiveMeasurements,
  invalidMeasurementInputs,
  handleActiveMeasurementInputChange,
  isEditing,
  updateActiveTrackingMeasurementOrder = () => {},
}: UserMeasurementReorderItemProps) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={measurement}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={() => updateActiveTrackingMeasurementOrder()}
    >
      <div className="flex gap-2.5 items-center">
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
        {!isEditing && <ReorderIcon dragControls={dragControls} />}
      </div>
    </Reorder.Item>
  );
};
