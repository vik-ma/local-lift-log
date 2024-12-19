type CaloricIntakeTypeSpanProps = {
  value: string | null;
};

export const CaloricIntakeTypeSpan = ({
  value,
}: CaloricIntakeTypeSpanProps) => {
  if (value === "Bulk") return <span className="text-xs text-lime-500">Bulk</span>;

  if (value === "Cut") return <span className="text-xs text-red-500">Cut</span>;

  if (value === "Maintenance")
    return <span className="text-xs text-indigo-700">Maintenance</span>;

  return <></>;
};
