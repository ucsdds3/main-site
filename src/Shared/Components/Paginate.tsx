import { newArray } from "src/Utils/functions";

interface PaginateProps {
  numPages: number;
  page: number;
  setPage: (page: number) => void;
}

const Paginate = ({ numPages, page, setPage }: PaginateProps) => {
  return (
    numPages > 1 && (
      <div className="flex justify-center w-full pt-8">
        <div className="join">
          {newArray(numPages).map((_, index) => (
            <button
              key={index}
              className="join-item btn data-[active=true]:btn-active btn-lg text-xl"
              onClick={() => setPage(index + 1)}
              data-active={page == index + 1}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    )
  );
};

export default Paginate;
