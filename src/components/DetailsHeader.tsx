import { Button } from "@nextui-org/react";
import { GearIcon, CommentIcon } from "../assets";
import { useState } from "react";

type DetailsHeaderProps = {
  header: string;
  subHeader: string;
  note: string | null;
  editButtonAction: () => void;
};

export const DetailsHeader = ({
  header,
  subHeader,
  note,
  editButtonAction,
}: DetailsHeaderProps) => {
  const [showNote, setShowNote] = useState<boolean>(false);
  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="relative w-full flex">
        <div className="flex flex-col gap-0.5 w-full">
          <div className="flex justify-center">
            <h1 className="text-3xl text-yellow-600 font-semibold w-[20rem] truncate text-center">
              {header}
            </h1>
          </div>
          <div className="flex justify-center w-full">
            <span className="flex justify-center text-stone-500 font-semibold">
              {subHeader}
            </span>
          </div>
        </div>
        <div className="absolute right-0 top-0">
          <div className="flex flex-col gap-0.5">
            <Button
              isIconOnly
              className="z-1"
              size="sm"
              variant="flat"
              onPress={editButtonAction}
            >
              <GearIcon size={18} color={"#808080"} />
            </Button>
            {note !== null && (
              <Button
                isIconOnly
                className="z-1"
                size="sm"
                variant="flat"
                onPress={() => setShowNote(!showNote)}
              >
                <CommentIcon size={20} />
              </Button>
            )}
          </div>
        </div>
      </div>
      {showNote && (
        <div className="w-full">
          <h3 className="break-all font-medium text-stone-500">{note}</h3>
        </div>
      )}
    </div>
  );
};
