import { Input } from "@nextui-org/react";
import { SearchIcon } from "../assets";

type SearchInputProps = {
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  isSmall?: boolean;
};

export const SearchInput = ({
  filterQuery,
  setFilterQuery,
  isSmall,
}: SearchInputProps) => {
  return (
    <Input
      label="Search"
      variant="faded"
      placeholder="Type to search..."
      isClearable
      value={filterQuery}
      onValueChange={setFilterQuery}
      startContent={isSmall ? <SearchIcon size={18} /> : <SearchIcon />}
    />
  );
};
