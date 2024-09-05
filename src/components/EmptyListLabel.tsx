import { ReactNode } from "react";

type EmptyListLabelProps = {
  itemName: string;
  customLabel?: string;
  extraContent?: ReactNode;
};

export const EmptyListLabel = ({
  itemName,
  customLabel,
  extraContent,
}: EmptyListLabelProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-stone-500 py-2">
      <h2>
        {customLabel !== undefined ? `No ${itemName} Found` : customLabel}
      </h2>
      {extraContent !== undefined && extraContent}
    </div>
  );
};
