function CustomerDetails({ selected, setSelected }) {
  if (!selected) return null;

  const created = new Date(selected.created_date.replace(" ", "T")).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <section className="details">
      <h2>Customer Details</h2>
      <p>Name: {selected.name}</p>
      <p>Email: {selected.email}</p>
      <p>Phone: {selected.phone}</p>
      <p>Company: {selected.company}</p>
      <p>Status: {selected.status}</p>
      <p>Created: {created}</p>
      <button type="button" onClick={() => setSelected(null)}>
        Hide Details
      </button>
    </section>
  );
}

export default CustomerDetails;
