type DietPhaseTypeSpanProps = {
  value: string | null;
};

export const DietPhaseTypeSpan = ({ value }: DietPhaseTypeSpanProps) => {
  if (value === "Bulk")
    return <span className="text-xs text-[#B1C11B]">Bulk</span>;

  if (value === "Cut")
    return <span className="text-xs text-[#BAB095]">Cut</span>;

  if (value === "Maintenance")
    return <span className="text-xs text-[#948F4E]">Maintenance</span>;

  return <></>;
};
