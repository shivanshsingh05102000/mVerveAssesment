function niceDate(value) {
  if (!value) return "";

  return new Date(value.replace(" ", "T")).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function CustomerTable({ list, showCustomer, startEdit, setDeleteItem, loading }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Company</th>
          <th>Status</th>
          <th>Created Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {!loading && list.length === 0 && (
          <tr>
            <td colSpan="7" className="empty">
              No customers found.
            </td>
          </tr>
        )}

        {list.map((c) => (
          <tr key={c.id}>
            <td>{c.name}</td>
            <td>{c.email}</td>
            <td>{c.phone}</td>
            <td>{c.company}</td>
            <td>{c.status}</td>
            <td>{niceDate(c.created_date)}</td>
            <td>
              <button type="button" onClick={() => showCustomer(c.id)}>
                View
              </button>
              <button type="button" onClick={() => startEdit(c)}>
                Edit
              </button>
              <button type="button" onClick={() => setDeleteItem(c)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CustomerTable;
