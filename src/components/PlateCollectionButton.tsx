import { Button } from "@nextui-org/react";
import { PlateCollection, UserSettings } from "../typings";
import { UpdateDefaultPlateCollectionId } from "../helpers";
import { WeightPlatesIcon } from "../assets";

type PlateCollectionButtonProps = {
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  plateCollection: PlateCollection;
};

export const PlateCollectionButton = ({
  userSettings,
  setUserSettings,
  plateCollection,
}: PlateCollectionButtonProps) => {
  const handleSetDefaultPlateCollectionButton = async (
    plateCollection: PlateCollection
  ) => {
    if (
      plateCollection.id === userSettings.default_plate_calculation_id ||
      plateCollection.id === 0
    )
      return;

    const success = await UpdateDefaultPlateCollectionId(
      plateCollection.id,
      userSettings.id
    );

    if (!success) return;

    const updatedSettings: UserSettings = {
      ...userSettings,
      default_plate_calculation_id: plateCollection.id,
    };

    setUserSettings(updatedSettings);
  };

  return (
    <Button
      aria-label="Set Plate Collection As Default"
      isIconOnly
      className="z-1 w-[3.5rem]"
      color={
        userSettings.default_plate_calculation_id === plateCollection.id
          ? "success"
          : "default"
      }
      variant="light"
      onPress={() => handleSetDefaultPlateCollectionButton(plateCollection)}
    >
      <WeightPlatesIcon
        isChecked={
          userSettings.default_plate_calculation_id === plateCollection.id
        }
        size={31}
      />
    </Button>
  );
};
