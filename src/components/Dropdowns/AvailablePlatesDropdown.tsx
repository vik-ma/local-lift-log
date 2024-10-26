import { Select, SelectItem } from "@nextui-org/react";

type AvailablePlatesDropdownProps = {
  value: number;
};

export const AvailablePlatesDropdown = ({
  value,
}: AvailablePlatesDropdownProps) => {
  const availableNumbers = [2, 4, 6, 8, 10, 12, 16, 18, 20];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {};

  return (
    <Select
      aria-label="Available Plates Dropdown List"
      variant="faded"
      selectedKeys={[value]}
      onChange={(e) => handleChange(e)}
      disallowEmptySelection
    >
      {availableNumbers.map((unit) => (
        <SelectItem key={unit} value={unit}>
          {unit}
        </SelectItem>
      ))}
    </Select>
  );
};
