import { Input } from "@nextui-org/react";
import { SearchIcon } from "../assets";

type SearchInputProps = {
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredListLength: number;
  totalListLength: number;
  isSmall?: boolean;
};

export const SearchInput = ({
  filterQuery,
  setFilterQuery,
  filteredListLength,
  totalListLength,
  isSmall,
}: SearchInputProps) => {
  return (
    <Input
      label={
        filteredListLength !== totalListLength ? (
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
      variant="faded"
      placeholder="Type to search..."
      isClearable
      value={filterQuery}
      onValueChange={setFilterQuery}
      startContent={isSmall ? <SearchIcon size={18} /> : <SearchIcon />}
    />
  );
};
