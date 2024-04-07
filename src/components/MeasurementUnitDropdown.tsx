import { Select, SelectItem } from "@nextui-org/react";
import { ValidMeasurementsUnits } from "../helpers";
import { MeasurementDropdownProps } from "../typings";

export const MeasurementUnitDropdown = ({
  value,
  setMeasurements,
}: MeasurementDropdownProps) => {
  const measurementUnits: string[] = ValidMeasurementsUnits();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {};

  return (
    <Select
      label="Unit"
      className="max-w-[4.5rem]"
      variant="faded"
      selectedKeys={[value]}
      onChange={(e) => handleChange(e)}
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
