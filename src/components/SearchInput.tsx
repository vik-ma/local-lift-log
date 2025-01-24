import { Input } from "@heroui/react";
import { SearchIcon } from "../assets";

type SearchInputProps = {
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredListLength: number;
  totalListLength: number;
  isListFiltered: boolean;
  isSmall?: boolean;
};

export const SearchInput = ({
  filterQuery,
  setFilterQuery,
  filteredListLength,
  totalListLength,
  isListFiltered,
  isSmall,
}: SearchInputProps) => {
  return (
    <Input
      label={
        filteredListLength !== totalListLength ||
        filterQuery !== "" ||
        isListFiltered ? (
          <>
            Search{" "}
            <span className="text-secondary">
              (Showing {filteredListLength} out of {totalListLength} items)
            </span>
          </>
        ) : (
          "Search"
        )
      }
      autoFocus={true}
      variant="faded"
      placeholder="Type to search..."
      isClearable
      value={filterQuery}
      onValueChange={setFilterQuery}
      startContent={isSmall ? <SearchIcon size={18} /> : <SearchIcon />}
    />
  );
};
