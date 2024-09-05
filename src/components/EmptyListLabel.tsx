import { ReactNode } from "react";

type EmptyListLabelProps = {
  itemName: string;
  extraContent?: ReactNode;
};

export const EmptyListLabel = ({
  itemName,
  extraContent,
}: EmptyListLabelProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-stone-500 py-2">
      <h2>No {itemName} Found</h2>
      {extraContent !== undefined && extraContent}
    </div>
  );
};
