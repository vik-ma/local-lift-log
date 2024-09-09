import { ReactNode } from "react";

type EmptyListLabelProps = {
  itemName: string;
  customLabel?: string;
  extraContent?: ReactNode;
  className?: string;
};

export const EmptyListLabel = ({
  itemName,
  customLabel,
  extraContent,
  className,
}: EmptyListLabelProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-stone-500 py-2">
      <h2 className={className !== undefined ? className : ""}>
        {customLabel !== undefined ? customLabel : `No ${itemName} Found`}
      </h2>
      {extraContent !== undefined && extraContent}
    </div>
  );
};
