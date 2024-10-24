import { Button } from "@nextui-org/react";
import { PlateCalculation, UserSettings } from "../typings";
import { UpdateDefaultPlateCalculationId } from "../helpers";
import { WeightPlatesIcon } from "../assets";

type PlateCalculationButtonProps = {
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  plateCalculation: PlateCalculation;
};

export const PlateCalculationButton = ({
  userSettings,
  setUserSettings,
  plateCalculation,
}: PlateCalculationButtonProps) => {
  const handleSetDefaultPlateCalculationButton = async (
    plateCalculation: PlateCalculation
  ) => {
    if (
      plateCalculation.id === userSettings.default_plate_calculation_id ||
      plateCalculation.id === 0
    )
      return;

    const success = UpdateDefaultPlateCalculationId(
      plateCalculation.id,
      userSettings.id
    );

    if (!success) return;

    const updatedSettings: UserSettings = {
      ...userSettings,
      default_plate_calculation_id: plateCalculation.id,
    };

    setUserSettings(updatedSettings);
  };

  return (
    <Button
      aria-label="Set Plate Calculation As Default"
      isIconOnly
      className="z-1 w-[3.5rem]"
      color={
        userSettings.default_plate_calculation_id === plateCalculation.id
          ? "success"
          : "default"
      }
      variant="light"
      onPress={() => handleSetDefaultPlateCalculationButton(plateCalculation)}
    >
      <WeightPlatesIcon
        isChecked={
          userSettings.default_plate_calculation_id === plateCalculation.id
        }
        size={31}
      />
    </Button>
  );
};
