import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { EquipmentWeightSortCategory } from "../typings";

type PresetsSortByMenuProps = {
  sortCategoryEquipment: EquipmentWeightSortCategory;
  handleSortOptionSelectionEquipment: (key: string) => void;
};

export const PresetsSortByMenu = ({
  sortCategoryEquipment,
  handleSortOptionSelectionEquipment,
}: PresetsSortByMenuProps) => {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button className="z-1" variant="flat" size="sm">
          Sort By
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        selectionMode="single"
        selectedKeys={[sortCategoryEquipment]}
        onAction={(key) => handleSortOptionSelectionEquipment(key as string)}
      >
        <DropdownItem key="favorite">Favorites First</DropdownItem>
        <DropdownItem key="name">Name (A-Z)</DropdownItem>
        <DropdownItem key="weight-desc">Weight (High-Low)</DropdownItem>
        <DropdownItem key="weight-asc">Weight (Low-High)</DropdownItem>
        <DropdownItem key="plate-calc">
          Plate Calculator Items First
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
