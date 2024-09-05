type EmptyListLabelProps = {
  itemName: string;
};

export const EmptyListLabel = ({ itemName }: EmptyListLabelProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-stone-500 py-2">
      <h2>No {itemName} Found</h2>
    </div>
  );
};
