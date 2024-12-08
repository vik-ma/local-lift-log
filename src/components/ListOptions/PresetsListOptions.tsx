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
    sortCategoryDistance,
    handleSortOptionSelectionEquipment,
    handleSortOptionSelectionDistance,
    listFilters,
    handleOpenFilterButton,
    presetsType,
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
        {presetsType === "equipment" ? (
          <DropdownMenu
            aria-label="Sort Equipment Weights Dropdown Menu"
            selectionMode="single"
            selectedKeys={[sortCategoryEquipment]}
            onAction={(key) =>
              handleSortOptionSelectionEquipment(key as string)
            }
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
        ) : (
          <DropdownMenu
            aria-label="Sort Distances Dropdown Menu"
            selectionMode="single"
            selectedKeys={[sortCategoryDistance]}
            onAction={(key) => handleSortOptionSelectionDistance(key as string)}
          >
            <DropdownItem key="favorite">Favorites First</DropdownItem>
            <DropdownItem key="name">Name (A-Z)</DropdownItem>
            <DropdownItem key="distance-desc">Distance (High-Low)</DropdownItem>
            <DropdownItem key="distance-asc">Distance (Low-High)</DropdownItem>
          </DropdownMenu>
        )}
      </Dropdown>
    </div>
  );
};
