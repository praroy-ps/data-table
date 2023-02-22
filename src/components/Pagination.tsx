import styles from "./Pagination.module.scss";

type Props = {
  page: number;
  pages: number;
  pageClick: (page: number) => void;
  prevHandler: () => void;
  nextHandler: () => void;
};

const Pagination = ({
  page,
  pages,
  pageClick,
  prevHandler,
  nextHandler,
}: Props) => {
  return (
    <div className={styles.paginationContainer}>
      <button
        className={styles.prev}
        onClick={prevHandler}
        disabled={page === 1}
      >
        Prev
      </button>
      <ul className={styles.pagesContainer}>
        {[...Array(Math.ceil(pages)).keys()].map((x, i) => {
          return (
            <li
              key={i}
              className={page - 1 === i ? styles.pageItemActive : ""}
              onClick={() => {
                pageClick(x + 1);
              }}
            >
              {x + 1}
            </li>
          );
        })}
      </ul>
      <button
        className={styles.next}
        onClick={nextHandler}
        disabled={page === pages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
