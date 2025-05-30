import { useEffect, useState } from "react";

interface PaginateProps {
  minCardsPerPage?: number;
  totalItems: number;
  numRows: number;
}

export const usePaginate = ({ numRows, totalItems, minCardsPerPage = 3 }: PaginateProps) => {
  const [page, setPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(minCardsPerPage);
  const [numPages, setNumPages] = useState(totalItems / cardsPerPage);
  const start = (page - 1) * cardsPerPage;
  const end = page * cardsPerPage;

  useEffect(() => {
    const calculateCardsPerPage = () => {
      const grid = document.querySelector('.grid');
      if (!grid) return;
      
      const computedStyle = window.getComputedStyle(grid);
      const gridTemplateColumns = computedStyle.gridTemplateColumns.split(' ');
      const cardsPerRow = gridTemplateColumns.length;
      const cardsPerPage = Math.max(minCardsPerPage, cardsPerRow * numRows);
      setCardsPerPage(cardsPerPage);
      setNumPages(Math.ceil(totalItems / cardsPerPage));
    };

    setTimeout(calculateCardsPerPage, 0);

    window.addEventListener('resize', calculateCardsPerPage);
    return () => window.removeEventListener('resize', calculateCardsPerPage);
  }, [numRows, totalItems, minCardsPerPage]);

  return { page, setPage, cardsPerPage, numPages, setNumPages, start, end };
}