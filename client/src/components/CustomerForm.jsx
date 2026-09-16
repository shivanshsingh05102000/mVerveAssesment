function CustomerForm({
  form,
  editId,
  errors,
  saving,
  updateForm,
  saveCustomer,
  clearForm,
}) {
  return (
    <form onSubmit={saveCustomer} className="form">
      <label>
        Name
        <input name="name" value={form.name} onChange={updateForm} />
        {errors.name && <small>{errors.name}</small>}
      </label>

      <label>
        Email
        <input name="email" value={form.email} onChange={updateForm} />
        {errors.email && <small>{errors.email}</small>}
      </label>

      <label>
        Phone Number
        <input name="phone" value={form.phone} onChange={updateForm} />
        {errors.phone && <small>{errors.phone}</small>}
      </label>

      <label>
        Company
        <input name="company" value={form.company} onChange={updateForm} />
        {errors.company && <small>{errors.company}</small>}
      </label>

      <label>
        Status
        <select name="status" value={form.status} onChange={updateForm}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </label>

      <button disabled={saving}>{saving ? "Saving..." : editId ? "Update" : "Add"}</button>
      {editId && (
        <button type="button" onClick={clearForm} disabled={saving}>
          Cancel
        </button>
      )}
    </form>
  );
}

export default CustomerForm;
