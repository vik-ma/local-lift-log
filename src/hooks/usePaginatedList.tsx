import { useMemo, useRef, useState } from "react";

export const usePaginatedList = <T,>(list: T[]) => {
  const [paginationPage, setPaginationPage] = useState<number>(1);

  const itemsPerPaginationPage = useRef<number>(20);

  const totalPaginationPages = Math.ceil(
    list.length / itemsPerPaginationPage.current
  );

  const validPaginationPage =
    paginationPage > totalPaginationPages
      ? totalPaginationPages
      : paginationPage;

  const paginatedList = useMemo(() => {
    const start = (validPaginationPage - 1) * itemsPerPaginationPage.current;
    return list.slice(start, start + itemsPerPaginationPage.current);
  }, [list, validPaginationPage]);

  return {
    setPaginationPage,
    itemsPerPaginationPage,
    paginatedList,
    totalPaginationPages,
    validPaginationPage,
  };
};
