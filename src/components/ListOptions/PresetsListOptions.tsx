import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { UsePresetsListReturnType } from "../../typings";

type PresetsListOptionsProps = {
  usePresetsList: UsePresetsListReturnType;
  isSelectingForPlateCollection?: boolean;
};

export const PresetsListOptions = ({
  usePresetsList,
  isSelectingForPlateCollection,
}: PresetsListOptionsProps) => {
  const {
    sortCategoryEquipment,
    handleSortOptionSelectionEquipment,
    listFilters,
    handleOpenFilterButton,
  } = usePresetsList;

  const { filterMap } = listFilters;

  return (
    <div className="flex gap-1 pr-0.5">
      <Button
        className="z-1"
        variant="flat"
        color={filterMap.size > 0 ? "secondary" : "default"}
        size="sm"
        onPress={handleOpenFilterButton}
      >
        Filter
      </Button>
      <Dropdown>
        <DropdownTrigger>
          <Button className="z-1" variant="flat" size="sm">
            Sort By
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Sort Equipment Weights Dropdown Menu"
          selectionMode="single"
          selectedKeys={[sortCategoryEquipment]}
          onAction={(key) => handleSortOptionSelectionEquipment(key as string)}
        >
          <DropdownItem key="favorite">Favorites First</DropdownItem>
          <DropdownItem key="name">Name (A-Z)</DropdownItem>
          <DropdownItem key="weight-desc">Weight (High-Low)</DropdownItem>
          <DropdownItem key="weight-asc">Weight (Low-High)</DropdownItem>
          <DropdownItem
            className={isSelectingForPlateCollection ? "" : "hidden"}
            key="plate-col"
          >
            Plate Collection Items First
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
