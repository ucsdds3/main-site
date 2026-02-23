import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight, FaEllipsisH } from "react-icons/fa";
interface PaginateProps {
  numPages: number;
  page: number;
  setPage: (page: number) => void;
}

const SIBLING_COUNT = 1;

/** Returns page numbers and "ellipsis" markers to display */
function getPaginationItems(page: number, numPages: number): (number | "ellipsis")[] {
  if (numPages <= 7) {
    return Array.from({ length: numPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(page - SIBLING_COUNT, 1);
  const rightSibling = Math.min(page + SIBLING_COUNT, numPages);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < numPages - 1;

  const items: (number | "ellipsis")[] = [1];

  if (showLeftEllipsis) {
    items.push("ellipsis");
  } else {
    for (let i = 2; i < leftSibling; i++) items.push(i);
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== numPages) items.push(i);
  }

  if (showRightEllipsis) {
    items.push("ellipsis");
  } else {
    for (let i = rightSibling + 1; i < numPages; i++) items.push(i);
  }

  if (numPages > 1) items.push(numPages);

  return items;
}

const Paginate = ({ numPages, page, setPage }: PaginateProps) => {
  if (numPages <= 1) return null;

  const items = getPaginationItems(page, numPages);
  const showArrows = numPages > 2 * SIBLING_COUNT + 3;

  return (
    <div className="join">
      {showArrows && (
        <>
          <button
            className="join-item btn md:btn-lg text-xl"
            onClick={() => setPage(1)}
            disabled={page === 1}
            aria-label="First page"
          >
            <FaAngleDoubleLeft />
          </button>
          <button
            className="join-item btn md:btn-lg text-xl"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <FaAngleLeft />
          </button>
        </>
      )}
      {/* Mobile: compact page indicator (only when arrows shown) */}
      {showArrows && (
        <span className="join-item btn md:btn-lg text-xl md:hidden min-w-[4rem]">
          {page}/{numPages}
        </span>
      )}
      {/* Page numbers */}
      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="join-item btn md:btn-lg text-xl btn-disabled hidden md:inline-flex"
          >
            <FaEllipsisH />
          </span>
        ) : (
          <button
            key={item}
            className={`join-item btn data-[active=true]:btn-active md:btn-lg text-xl ${showArrows ? "hidden md:inline-flex" : ""}`}
            onClick={() => setPage(item)}
            data-active={page === item}
          >
            {item}
          </button>
        )
      )}
      {showArrows && (
        <>
          <button
            className="join-item btn md:btn-lg text-xl"
            onClick={() => setPage(Math.min(numPages, page + 1))}
            disabled={page === numPages}
            aria-label="Next page"
          >
            <FaAngleRight />
          </button>
          <button
            className="join-item btn md:btn-lg text-xl"
            onClick={() => setPage(numPages)}
            disabled={page === numPages}
            aria-label="Last page"
          >
            <FaAngleDoubleRight />
          </button>
        </>
      )}
    </div>
  );
};

export default Paginate;
