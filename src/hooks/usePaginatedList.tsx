import { useMemo, useRef, useState } from "react";

export const usePaginatedList = <T,>(list: T[]) => {
  const [paginationPage, setPaginationPage] = useState<number>(1);

  const itemsPerPaginationPage = useRef<number>(50);

  const paginatedList = useMemo(() => {
    const start = (paginationPage - 1) * itemsPerPaginationPage.current;
    return list.slice(start, start + itemsPerPaginationPage.current);
  }, [list, paginationPage]);

  const totalPaginationPages = Math.ceil(
    list.length / itemsPerPaginationPage.current
  );

  return {
    paginationPage,
    setPaginationPage,
    itemsPerPaginationPage,
    paginatedList,
    totalPaginationPages,
  };
};
