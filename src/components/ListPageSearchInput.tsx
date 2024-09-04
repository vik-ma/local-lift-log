import { ReactNode } from "react";
import { SearchInput } from ".";

type ListPageSearchInputProps = {
  header: string;
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredListLength: number;
  totalListLength: number;
  bottomContent?: ReactNode;
};

export const ListPageSearchInput = ({
  header,
  filterQuery,
  setFilterQuery,
  filteredListLength,
  totalListLength,
  bottomContent,
}: ListPageSearchInputProps) => {
  return (
    <div className="flex flex-col w-full gap-1 sticky top-16 z-30 bg-default-100 rounded-xl p-1.5 border-2 border-default-200">
      <h1 className="px-0.5 font-bold from-[#FF705B] to-[#FFB457] text-3xl bg-clip-text text-transparent bg-gradient-to-tl truncate">
        {header}
      </h1>
      <SearchInput
        filterQuery={filterQuery}
        setFilterQuery={setFilterQuery}
        filteredListLength={filteredListLength}
        totalListLength={totalListLength}
        isSmall
      />
      {bottomContent !== undefined && (
        <div className="pt-0.5">{bottomContent}</div>
      )}
    </div>
  );
};