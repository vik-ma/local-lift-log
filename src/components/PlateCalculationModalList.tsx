import { useNavigate } from "react-router-dom";
import {
  PlateCalculation,
  UsePresetsListReturnType,
  UserSettings,
} from "../typings";
import { Button, ScrollShadow } from "@nextui-org/react";
import {
  EmptyListLabel,
  LoadingSpinner,
  PlateCalculationButton,
  SearchInput,
} from ".";
import { GoToArrowIcon } from "../assets";

type PlateCalculationModalListProps = {
  presetsList: UsePresetsListReturnType;
  handlePlateCalculationClick: (plateCalculation: PlateCalculation) => void;
  userSettings?: UserSettings;
  setUserSettings?: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  defaultPlateCalculationId?: number;
};

export const PlateCalculationModalList = ({
  presetsList,
  handlePlateCalculationClick,
  userSettings,
  setUserSettings,
  defaultPlateCalculationId,
}: PlateCalculationModalListProps) => {
  const {
    plateCalculations,
    filteredPlateCalculations,
    filterQueryPlateCalculation,
    setFilterQueryPlateCalculation,
    isLoadingEquipment,
  } = presetsList;

  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-1.5 h-[400px]">
      <SearchInput
        filterQuery={filterQueryPlateCalculation}
        setFilterQuery={setFilterQueryPlateCalculation}
        filteredListLength={filteredPlateCalculations.length}
        totalListLength={plateCalculations.length}
      />
      <div className="flex justify-between">
        <Button
          variant="flat"
          size="sm"
          color="secondary"
          onPress={() => navigate("/presets?tab=plate")}
          endContent={<GoToArrowIcon />}
        >
          Modify Plate Calculation
        </Button>
      </div>
      <ScrollShadow className="flex flex-col gap-1 w-full">
        {isLoadingEquipment ? (
          <LoadingSpinner />
        ) : (
          <>
            {filteredPlateCalculations.map((plate) => (
              <div
                className={
                  plate.id === defaultPlateCalculationId
                    ? "flex justify-between items-center gap-1 cursor-pointer bg-amber-100 border-2 border-amber-300 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                    : "flex justify-between items-center gap-1 cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                }
                key={`plate-calculation-${plate.id}`}
                onClick={() => handlePlateCalculationClick(plate)}
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
                      <span className="text-red-700"> (Invalid Handle)</span>
                    )}
                  </span>
                </div>
                {userSettings !== undefined &&
                  setUserSettings !== undefined && (
                    <div className="flex items-center pr-1">
                      <PlateCalculationButton
                        userSettings={userSettings}
                        setUserSettings={setUserSettings}
                        plateCalculation={plate}
                      />
                    </div>
                  )}
              </div>
            ))}
            {filteredPlateCalculations.length === 0 && (
              <EmptyListLabel itemName="Plate Calculations" />
            )}
          </>
        )}
      </ScrollShadow>
    </div>
  );
};
