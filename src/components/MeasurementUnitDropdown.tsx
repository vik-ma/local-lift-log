import { Select, SelectItem } from "@nextui-org/react";
import { ValidMeasurementsUnits } from "../helpers";
import { MeasurementDropdownProps } from "../typings";

export const MeasurementUnitDropdown = ({
  value,
  isDisabled,
  setMeasurements,
}: MeasurementDropdownProps) => {
  const measurementUnits: string[] = ValidMeasurementsUnits();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {};

  return (
    <Select
      label="Unit"
      size="sm"
      className="max-w-20"
      variant="faded"
      selectedKeys={[value]}
      onChange={(e) => handleChange(e)}
      isDisabled={isDisabled}
    >
      {measurementUnits.map((unit) => (
        <SelectItem key={unit} value={unit}>
          {unit}
        </SelectItem>
      ))}
    </Select>
  );
};

export default MeasurementUnitDropdown;
