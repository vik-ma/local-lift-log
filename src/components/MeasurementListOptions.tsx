import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { MeasurementSortCategory, UseListFiltersReturnType } from "../typings";
import { useMeasurementTypes } from "../hooks";

type MeasurementListOptionsProps = {
  sortCategory: MeasurementSortCategory;
  handleSortOptionSelection: (key: string) => void;
  useListFilters: UseListFiltersReturnType;
};

export const MeasurementListOptions = ({
  sortCategory,
  handleSortOptionSelection,
  useListFilters,
}: MeasurementListOptionsProps) => {
  const { filterMeasurementTypes, handleFilterMeasurementTypes } = useListFilters;

  const measurementTypes = useMeasurementTypes();

  return (
    <div className="flex gap-1">
      <Dropdown>
        <DropdownTrigger>
          <Button
            className="z-1"
            variant="flat"
            color={
              filterMeasurementTypes.length === 2 ? "default" : "secondary"
            }
            size="sm"
          >
            Filter
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Filter Measurement Types Dropdown Menu"
          selectedKeys={filterMeasurementTypes}
          selectionMode="multiple"
          onAction={(key) => handleFilterMeasurementTypes(key as string)}
          disallowEmptySelection
        >
          {measurementTypes.map((measurementType) => (
            <DropdownItem key={measurementType}>{measurementType}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      <Dropdown>
        <DropdownTrigger>
          <Button className="z-1" variant="flat" size="sm">
            Sort By
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Sort Measurements Dropdown Menu"
          selectionMode="single"
          selectedKeys={[sortCategory]}
          onAction={(key) => handleSortOptionSelection(key as string)}
        >
          <DropdownItem key="active">Active First</DropdownItem>
          <DropdownItem key="favorite">Favorites First</DropdownItem>
          <DropdownItem key="name">Name (A-Z)</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
