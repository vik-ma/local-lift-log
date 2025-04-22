import { Button } from "@heroui/react";
import { PlateCollection, UserSettings } from "../typings";
import { WeightPlatesIcon } from "../assets";
import { UpdateUserSetting } from "../helpers";

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
      plateCollection.id === userSettings.default_plate_collection_id ||
      plateCollection.id === 0
    )
      return;

    await UpdateUserSetting(
      "default_plate_collection_id",
      plateCollection.id,
      userSettings,
      setUserSettings
    );
  };

  return (
    <Button
      aria-label="Set Plate Collection As Default"
      isIconOnly
      className="z-1 w-[3.5rem]"
      color={
        userSettings.default_plate_collection_id === plateCollection.id
          ? "success"
          : "default"
      }
      variant="light"
      onPress={() => handleSetDefaultPlateCollectionButton(plateCollection)}
    >
      <WeightPlatesIcon
        isChecked={
          userSettings.default_plate_collection_id === plateCollection.id
        }
        size={31}
      />
    </Button>
  );
};
