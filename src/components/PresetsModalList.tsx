import { Button, ScrollShadow } from "@nextui-org/react";
import {
  EmptyListLabel,
  FavoriteButton,
  LoadingSpinner,
  PresetsSortByMenu,
  SearchInput,
} from ".";
import { WeightPlatesIcon } from "../assets";
import {
  Distance,
  EquipmentWeight,
  UsePresetsListReturnType,
} from "../typings";
import { useNavigate } from "react-router-dom";

type PresetsModalListProps = {
  presetsList: UsePresetsListReturnType;
  handlePresetClick: (equipment?: EquipmentWeight, distance?: Distance) => void;
  heightString: string;
  showModifyButton?: boolean;
  showSortButton?: boolean;
  validWeightUnit?: string;
};

export const PresetsModalList = ({
  presetsList,
  handlePresetClick,
  heightString,
  showModifyButton,
  showSortButton,
  validWeightUnit,
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
    isLoadingEquipment,
    isLoadingDistance,
    toggleFavoriteEquipmentWeight,
    toggleFavoriteDistance,
    sortCategoryEquipment,
    handleSortOptionSelectionEquipment,
  } = presetsList;

  const navigate = useNavigate();

  return (
    <div className={`flex flex-col gap-1.5 ${heightString}`}>
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
      />
      <div className="flex justify-between">
        <div>
          {showModifyButton && (
            <Button
              variant="flat"
              size="sm"
              color="secondary"
              onPress={() => navigate(`/presets?tab=${presetsType}`)}
            >
              Modify{" "}
              {presetsType === "equipment" ? "Equipment Weights" : "Distances"}
            </Button>
          )}
        </div>
        {showSortButton && (
          <PresetsSortByMenu
            sortCategoryEquipment={sortCategoryEquipment}
            handleSortOptionSelectionEquipment={
              handleSortOptionSelectionEquipment
            }
          />
        )}
      </div>
      <ScrollShadow className="flex flex-col gap-1 w-full">
        {presetsType === "equipment" ? (
          isLoadingEquipment ? (
            <LoadingSpinner />
          ) : (
            <>
              {filteredEquipmentWeights.map((equipment) => (
                <div
                  className={
                    validWeightUnit !== undefined &&
                    equipment.weight_unit !== validWeightUnit
                      ? "flex justify-between items-center gap-1 opacity-40 cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                      : "flex justify-between items-center gap-1 cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                  }
                  key={`equipment-${equipment.id}`}
                  onClick={() => handlePresetClick(equipment, undefined)}
                >
                  <div className="flex flex-col justify-start items-start pl-2 py-1">
                    <span className="w-[16.25rem] truncate text-left">
                      {equipment.name}
                    </span>
                    <span className="text-xs text-secondary text-left">
                      {equipment.weight} {equipment.weight_unit}
                    </span>
                  </div>
                  <div className="flex gap-1 items-center pr-2">
                    {/* TODO: REMOVE AFTER COPYING */}
                    {/* <Button
                      aria-label={
                        equipment.is_in_plate_calculator === 1
                          ? `Remove ${equipment.name} From Plate Calculator`
                          : `Add ${equipment.name} To Plate Calculator`
                      }
                      isIconOnly
                      className="z-1 w-[3.5rem]"
                      color={
                        equipment.is_in_plate_calculator === 1
                          ? "success"
                          : "default"
                      }
                      variant="light"
                      onPress={() => togglePlateCalculator(equipment)}
                    >
                      <WeightPlatesIcon
                        isChecked={equipment.is_in_plate_calculator === 1}
                        size={31}
                      />
                    </Button> */}
                    <FavoriteButton
                      name={equipment.name}
                      isFavorite={!!equipment.is_favorite}
                      item={equipment}
                      toggleFavorite={toggleFavoriteEquipmentWeight}
                    />
                  </div>
                </div>
              ))}
              {filteredEquipmentWeights.length === 0 && (
                <EmptyListLabel itemName="Equipment Weights" />
              )}
            </>
          )
        ) : isLoadingDistance ? (
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
