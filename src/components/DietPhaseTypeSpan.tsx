type DietPhaseTypeSpanProps = {
  value: string | null;
};

export const DietPhaseTypeSpan = ({ value }: DietPhaseTypeSpanProps) => {
  if (value === "Bulk")
    return <span className="text-xs text-violet-600">Bulk</span>;

  if (value === "Cut")
    return <span className="text-xs text-indigo-400">Cut</span>;

  if (value === "Maintenance")
    return <span className="text-xs text-slate-500">Maintenance</span>;

  return <></>;
};
