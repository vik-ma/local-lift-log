import { Button, ScrollShadow } from "@nextui-org/react";
import {
  AvailablePlatesDropdown,
  EmptyListLabel,
  FavoriteButton,
  ListFilters,
  LoadingSpinner,
  PresetsListOptions,
  SearchInput,
} from "..";
import { GoToArrowIcon } from "../../assets";
import {
  Distance,
  EquipmentWeight,
  UsePresetsListReturnType,
} from "../../typings";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

type PresetsModalListProps = {
  presetsList: UsePresetsListReturnType;
  handlePresetClick: (equipment?: EquipmentWeight, distance?: Distance) => void;
  heightString: string;
  showModifyButton?: boolean;
  showSortButton?: boolean;
  validWeightUnit?: string;
  isSelectingForPlateCollection?: boolean;
};

export const PresetsModalList = ({
  presetsList,
  handlePresetClick,
  heightString,
  showModifyButton,
  showSortButton,
  validWeightUnit,
  isSelectingForPlateCollection,
}: PresetsModalListProps) => {
  const {
    presetsType,
    equipmentWeights,
    distances,
    filterQueryEquipment,
    filterQueryDistance,
    setFilterQueryEquipment,
    setFilterQueryDistance,
    filteredEquipmentWeights,
    filteredDistances,
    isEquipmentWeightListLoaded,
    isDistanceListLoaded,
    toggleFavoriteEquipmentWeight,
    toggleFavoriteDistance,
    operatingPlateCollection,
    setOperatingPlateCollection,
    presetsTypeString,
    listFilters,
  } = presetsList;

  const { filterMap, removeFilter, prefixMap } = listFilters;

  const [hideInvalidUnitItems, setHideInvalidUnitItems] =
    useState<boolean>(true);

  const navigate = useNavigate();

  return (
    <div className={`flex flex-col gap-1.5 ${heightString}`}>
      <div className="flex flex-col gap-1.5">
        <SearchInput
          filterQuery={
            presetsType === "equipment"
              ? filterQueryEquipment
              : filterQueryDistance
          }
          setFilterQuery={
            presetsType === "equipment"
              ? setFilterQueryEquipment
              : setFilterQueryDistance
          }
          filteredListLength={
            presetsType === "equipment"
              ? filteredEquipmentWeights.length
              : filteredDistances.length
          }
          totalListLength={
            presetsType === "equipment"
              ? equipmentWeights.length
              : distances.length
          }
          isListFiltered={filterMap.size > 0}
        />
        <div className="flex justify-between">
          <div>
            {showModifyButton && (
              <Button
                variant="flat"
                size="sm"
                color="secondary"
                onPress={() => navigate(`/presets?tab=${presetsType}`)}
                endContent={<GoToArrowIcon />}
              >
                Modify {presetsTypeString}
              </Button>
            )}
          </div>
          <div className="flex gap-1">
            {validWeightUnit !== undefined && (
              <Button
                className="w-[8rem]"
                variant="flat"
                size="sm"
                onPress={() => setHideInvalidUnitItems(!hideInvalidUnitItems)}
              >
                {hideInvalidUnitItems ? "Show" : "Hide"} Invalid Units
              </Button>
            )}
            {showSortButton && (
              <PresetsListOptions
                usePresetsList={presetsList}
                isSelectingForPlateCollection={isSelectingForPlateCollection}
              />
            )}
          </div>
        </div>
        {filterMap.size > 0 && (
          <ListFilters
            filterMap={filterMap}
            removeFilter={removeFilter}
            prefixMap={prefixMap}
            isInModal
          />
        )}
      </div>
      <ScrollShadow className="flex flex-col gap-1 w-full">
        {presetsType === "equipment" ? (
          !isEquipmentWeightListLoaded.current ? (
            <LoadingSpinner />
          ) : (
            <>
              {filteredEquipmentWeights.map((equipment) => {
                const isInPlateCollection =
                  operatingPlateCollection?.availablePlatesMap?.has(
                    equipment
                  ) ?? false;

                const numAvailable =
                  operatingPlateCollection?.availablePlatesMap?.get(
                    equipment
                  ) ?? 0;

                return (
                  <div
                    className={
                      validWeightUnit !== undefined &&
                      equipment.weight_unit !== validWeightUnit &&
                      hideInvalidUnitItems
                        ? "hidden"
                        : validWeightUnit !== undefined &&
                          equipment.weight_unit !== validWeightUnit
                        ? "flex justify-between items-center gap-1 opacity-40 cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                        : isInPlateCollection
                        ? "flex justify-between items-center gap-1 cursor-pointer bg-amber-100 border-2 border-amber-300 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                        : "flex justify-between items-center gap-1 cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                    }
                    key={`equipment-${equipment.id}`}
                    onClick={() => handlePresetClick(equipment, undefined)}
                  >
                    <div className="flex flex-col justify-start items-start pl-2 py-1">
                      <span
                        className={
                          isInPlateCollection
                            ? "w-[11.5rem] truncate text-left"
                            : "w-[16.25rem] truncate text-left"
                        }
                      >
                        {equipment.name}
                      </span>
                      <span className="text-xs text-secondary text-left">
                        {equipment.weight} {equipment.weight_unit}
                      </span>
                    </div>
                    <div className="flex gap-1 items-center pr-2">
                      {numAvailable !== 0 && (
                        <AvailablePlatesDropdown
                          value={numAvailable}
                          equipmentWeight={equipment}
                          operatingPlateCollection={operatingPlateCollection}
                          setOperatingPlateCollection={
                            setOperatingPlateCollection
                          }
                        />
                      )}
                      <FavoriteButton
                        name={equipment.name}
                        isFavorite={!!equipment.is_favorite}
                        item={equipment}
                        toggleFavorite={toggleFavoriteEquipmentWeight}
                      />
                    </div>
                  </div>
                );
              })}
              {filteredEquipmentWeights.length === 0 && (
                <EmptyListLabel itemName="Equipment Weights" />
              )}
            </>
          )
        ) : !isDistanceListLoaded.current ? (
          <LoadingSpinner />
        ) : (
          <>
            {filteredDistances.map((distance) => (
              <div
                className="flex justify-between items-center gap-1 cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                key={`distance-${distance.id}`}
                onClick={() => handlePresetClick(undefined, distance)}
              >
                <div className="flex flex-col justify-start items-start pl-2 py-1">
                  <span className="w-[20rem] truncate text-left">
                    {distance.name}
                  </span>
                  <span className="text-xs text-secondary text-left">
                    {distance.distance} {distance.distance_unit}
                  </span>
                </div>
                <div className="flex items-center pr-2">
                  <FavoriteButton
                    name={distance.name}
                    isFavorite={!!distance.is_favorite}
                    item={distance}
                    toggleFavorite={toggleFavoriteDistance}
                  />
                </div>
              </div>
            ))}
            {filteredDistances.length === 0 && (
              <EmptyListLabel itemName="Distances" />
            )}
          </>
        )}
      </ScrollShadow>
    </div>
  );
};
