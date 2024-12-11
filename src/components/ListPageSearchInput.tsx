import { ReactNode, useMemo } from "react";
import { SearchInput } from ".";

type ListPageSearchInputProps = {
  header: string;
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredListLength: number;
  totalListLength: number;
  isListFiltered: boolean;
  bottomContent?: ReactNode;
  className?: string;
  extraTopSpace?: boolean;
};

export const ListPageSearchInput = ({
  header,
  filterQuery,
  setFilterQuery,
  filteredListLength,
  totalListLength,
  isListFiltered,
  bottomContent,
  className,
  extraTopSpace,
}: ListPageSearchInputProps) => {
  const topSpace = useMemo(() => {
    return extraTopSpace ? "top-[6.5rem]" : "top-16";
  }, [extraTopSpace]);

  return (
    <div
      className={
        className !== undefined
          ? `flex flex-col w-full gap-1.5 sticky ${topSpace} z-30 bg-default-100 rounded-xl p-1.5 border-2 border-default-200 transition-opacity ${className}`
          : `flex flex-col w-full gap-1.5 sticky ${topSpace} z-30 bg-default-100 rounded-xl p-1.5 border-2 border-default-200 transition-opacity`
      }
    >
      <h1 className="px-0.5 font-bold from-[#FF705B] to-[#FFB457] text-3xl bg-clip-text text-transparent bg-gradient-to-tl truncate">
        {header}
      </h1>
      <SearchInput
        filterQuery={filterQuery}
        setFilterQuery={setFilterQuery}
        filteredListLength={filteredListLength}
        totalListLength={totalListLength}
        isListFiltered={isListFiltered}
        isSmall
      />
      {bottomContent !== undefined && (
        <div className="pt-0.5">{bottomContent}</div>
      )}
    </div>
  );
};
