function PageButtons({ page, pages, setPage }) {
  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>
        Previous
      </button>
      <span>
        Page {page} of {pages}
      </span>
      <button disabled={page === pages} onClick={() => setPage(page + 1)}>
        Next
      </button>
    </div>
  );
}

export default PageButtons;
