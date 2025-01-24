import { Button, Select, SelectItem } from "@heroui/react";
import { PlateCollection } from "../typings";

type PlateCollectionHandleConfigProps = {
  plateCollection: PlateCollection;
  setPlateCollection: React.Dispatch<React.SetStateAction<PlateCollection>>;
  handleSetHandleButton: () => void;
};

export const PlateCollectionHandleConfig = ({
  plateCollection,
  setPlateCollection,
  handleSetHandleButton,
}: PlateCollectionHandleConfigProps) => {
  const handleHandlesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedOperatingPlateCollection: PlateCollection = {
      ...plateCollection,
      num_handles: Number(e.target.value),
    };

    setPlateCollection(updatedOperatingPlateCollection);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-end pl-0.5">
        <h3 className="text-lg font-medium">Handle</h3>
        <div className="flex gap-1.5 items-center pr-1">
          <span className="text-sm text-stone-500">Number Of Handles</span>
          <Select
            aria-label="Select Number Of Handles"
            className="w-[4rem]"
            size="sm"
            variant="faded"
            selectedKeys={[plateCollection.num_handles.toString()]}
            onChange={(e) => handleHandlesChange(e)}
            disallowEmptySelection
          >
            <SelectItem key="1" value="1">
              1
            </SelectItem>
            <SelectItem key="2" value="2">
              2
            </SelectItem>
          </Select>
        </div>
      </div>
      {plateCollection.handle !== undefined ? (
        <div className="flex gap-1 items-center">
          <div className="flex w-[20.5rem] justify-between gap-1 bg-default-50 px-1.5 py-0.5 border-2 rounded-lg">
            <span className="w-[16rem] truncate">
              {plateCollection.handle.name}
            </span>
            <div className="flex gap-1 text-secondary">
              <span className="w-[3.5rem] truncate text-right">
                {plateCollection.handle.weight}
              </span>
              <span>{plateCollection.handle.weight_unit}</span>
            </div>
          </div>
          <Button
            aria-label="Change Plates Handle"
            className="w-[4rem]"
            size="sm"
            variant="flat"
            onPress={handleSetHandleButton}
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between pr-1">
          <span className="px-0.5 text-stone-400">No Handle Set</span>
          <Button
            aria-label="Set Plate Collection Handle"
            size="sm"
            variant="flat"
            color="secondary"
            onPress={handleSetHandleButton}
          >
            Set Handle
          </Button>
        </div>
      )}
    </div>
  );
};
