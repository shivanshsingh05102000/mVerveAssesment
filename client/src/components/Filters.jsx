function Filters({ search, setSearch, sortBy, setSortBy, order, setOrder, setPage }) {
  return (
    <div className="filters">
      <input
        placeholder="Search"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      <select
        value={sortBy}
        onChange={(e) => {
          setSortBy(e.target.value);
          setPage(1);
        }}
      >
        <option value="created_date">Created Date</option>
        <option value="name">Name</option>
        <option value="email">Email</option>
        <option value="company">Company</option>
        <option value="status">Status</option>
      </select>
      <select
        value={order}
        onChange={(e) => {
          setOrder(e.target.value);
          setPage(1);
        }}
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>
  );
}

export default Filters;
