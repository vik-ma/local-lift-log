import { Button } from "@nextui-org/react";
import { CommentIcon, EditIcon } from "../assets";
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
            <h1 className="text-3xl text-secondary font-semibold w-[20rem] truncate text-center">
              {header}
            </h1>
          </div>
          <div className="flex justify-center">
            <span className="text-stone-500 text-center font-semibold w-[20rem] break-words">
              {subHeader}
            </span>
          </div>
        </div>
        <div className="absolute right-0 top-0">
          <div className="flex flex-col gap-0.5">
            <Button
              aria-label="Edit Properties"
              isIconOnly
              className="z-1"
              size="sm"
              variant="light"
              onPress={editButtonAction}
            >
              <EditIcon size={22} color={"#808080"} />
            </Button>
            {note !== null && (
              <Button
                aria-label="Toggle Note"
                isIconOnly
                className="z-1"
                size="sm"
                variant="light"
                onPress={() => setShowNote(!showNote)}
              >
                <CommentIcon size={20} />
              </Button>
            )}
          </div>
        </div>
      </div>
      {showNote && (
        <div className="flex justify-center w-full">
          <span className="break-all font-medium text-stone-500">{note}</span>
        </div>
      )}
    </div>
  );
};
