import { Select, SelectItem } from "@nextui-org/react";
import { useMemo } from "react";
import { EquipmentWeight, PlateCollection } from "../../typings";
import { UpdateAvailablePlatesInPlateCollection } from "../../helpers";

type AvailablePlatesDropdownProps = {
  value: number;
  equipmentWeight: EquipmentWeight;
  operatingPlateCollection: PlateCollection;
  setOperatingPlateCollection: React.Dispatch<
    React.SetStateAction<PlateCollection>
  >;
  isSmall?: boolean;
};

export const AvailablePlatesDropdown = ({
  value,
  equipmentWeight,
  operatingPlateCollection,
  setOperatingPlateCollection,
  isSmall,
}: AvailablePlatesDropdownProps) => {
  const availableNumbers = useMemo(() => {
    return ["2", "4", "6", "8", "10", "12", "16", "18", "20"];
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (
      operatingPlateCollection.availablePlatesMap === undefined ||
      !operatingPlateCollection.availablePlatesMap.has(equipmentWeight)
    )
      return;

    const value = e.target.value;

    if (!availableNumbers.includes(value)) return;

    const numValue = Number(value);

    const updatedAvailablePlatesMap = new Map(
      operatingPlateCollection.availablePlatesMap
    );

    updatedAvailablePlatesMap.set(equipmentWeight, numValue);

    const updatedPlateCollection = UpdateAvailablePlatesInPlateCollection(
      operatingPlateCollection,
      updatedAvailablePlatesMap
    );

    setOperatingPlateCollection(updatedPlateCollection);
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
