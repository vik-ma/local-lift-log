import { Select, SelectItem } from "@nextui-org/react";
import { useMemo } from "react";
import { EquipmentWeight, PlateCalculation } from "../../typings";
import { UpdateAvailablePlatesInPlateCalculation } from "../../helpers";

type AvailablePlatesDropdownProps = {
  value: number;
  equipmentWeight: EquipmentWeight;
  operatingPlateCalculation: PlateCalculation;
  setOperatingPlateCalculation: React.Dispatch<
    React.SetStateAction<PlateCalculation>
  >;
  isSmall?: boolean;
};

export const AvailablePlatesDropdown = ({
  value,
  equipmentWeight,
  operatingPlateCalculation,
  setOperatingPlateCalculation,
  isSmall,
}: AvailablePlatesDropdownProps) => {
  const availableNumbers = useMemo(() => {
    return ["2", "4", "6", "8", "10", "12", "16", "18", "20"];
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (
      operatingPlateCalculation.availablePlatesMap === undefined ||
      !operatingPlateCalculation.availablePlatesMap.has(equipmentWeight)
    )
      return;

    const value = e.target.value;

    if (!availableNumbers.includes(value)) return;

    const numValue = Number(value);

    const updatedAvailablePlatesMap = new Map(
      operatingPlateCalculation.availablePlatesMap
    );

    updatedAvailablePlatesMap.set(equipmentWeight, numValue);

    const updatedPlateCalculation = UpdateAvailablePlatesInPlateCalculation(
      operatingPlateCalculation,
      updatedAvailablePlatesMap
    );

    setOperatingPlateCalculation(updatedPlateCalculation);
  };

  return (
    <Select
      aria-label="Number Of Available Plates Dropdown List"
      className={isSmall ? "w-[4rem]" : "w-[4.5rem]"}
      size={isSmall ? "sm" : "md"}
      variant="faded"
      selectedKeys={[value.toString()]}
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
