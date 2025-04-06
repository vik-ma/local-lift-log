import { useNavigate } from "react-router-dom";
import {
  PlateCollection,
  UsePresetsListReturnType,
  UserSettings,
} from "../../typings";
import { Button, ScrollShadow } from "@heroui/react";
import {
  EmptyListLabel,
  LoadingSpinner,
  PlateCollectionButton,
  SearchInput,
} from "..";
import { GoToArrowIcon } from "../../assets";

type PlateCollectionModalListProps = {
  presetsList: UsePresetsListReturnType;
  handlePlateCollectionClick: (plateCollection: PlateCollection) => void;
  userSettings?: UserSettings;
  setUserSettings?: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  defaultPlateCollectionId?: number;
};

export const PlateCollectionModalList = ({
  presetsList,
  handlePlateCollectionClick,
  userSettings,
  setUserSettings,
  defaultPlateCollectionId,
}: PlateCollectionModalListProps) => {
  const {
    plateCollections,
    filteredPlateCollections,
    filterQueryPlateCollection,
    setFilterQueryPlateCollection,
    isEquipmentWeightListLoaded,
    listFilters,
  } = presetsList;

  const { filterMap } = listFilters;

  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-1.5 h-[400px]">
      <SearchInput
        filterQuery={filterQueryPlateCollection}
        setFilterQuery={setFilterQueryPlateCollection}
        filteredListLength={filteredPlateCollections.length}
        totalListLength={plateCollections.length}
        isListFiltered={filterMap.size > 0}
      />
      <div className="flex justify-between">
        <Button
          variant="flat"
          size="sm"
          color="secondary"
          onPress={() => navigate("/presets?tab=plate")}
          endContent={<GoToArrowIcon />}
        >
          Edit Plate Collections
        </Button>
      </div>
      <ScrollShadow className="flex flex-col gap-1 w-full">
        {!isEquipmentWeightListLoaded.current ? (
          <LoadingSpinner />
        ) : (
          <>
            {filteredPlateCollections.map((plate) => {
              if (
                plate.handle === undefined ||
                plate.formattedAvailablePlatesString === ""
              )
                return null;

              return (
                <div
                  className={
                    plate.id === defaultPlateCollectionId
                      ? "flex justify-between items-center gap-1 cursor-pointer bg-amber-100 border-2 border-amber-300 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                      : "flex justify-between items-center gap-1 cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                  }
                  key={`plate-calculation-${plate.id}`}
                  onClick={() => handlePlateCollectionClick(plate)}
                >
                  <div className="flex flex-col justify-start items-start pl-2 py-1">
                    <span className="w-[19rem] truncate">{plate.name}</span>
                    <span className="w-[19rem] truncate text-xs text-secondary">
                      {plate.formattedAvailablePlatesString} {plate.weight_unit}
                    </span>
                    <span className="text-xs text-stone-400">
                      {plate.num_handles === 1 ? "1 Handle" : "2 Handles"}
                      {plate.handle !== undefined ? (
                        ` (${plate.handle.name}: ${plate.handle.weight} ${plate.handle.weight_unit})`
                      ) : (
                        <span className="text-red-700"> (Unknown Handle)</span>
                      )}
                    </span>
                  </div>
                  {userSettings !== undefined &&
                    setUserSettings !== undefined && (
                      <div className="flex items-center pr-1">
                        <PlateCollectionButton
                          userSettings={userSettings}
                          setUserSettings={setUserSettings}
                          plateCollection={plate}
                        />
                      </div>
                    )}
                </div>
              );
            })}
            {filteredPlateCollections.length === 0 && (
              <EmptyListLabel itemName="Plate Collections" />
            )}
          </>
        )}
      </ScrollShadow>
    </div>
  );
};
