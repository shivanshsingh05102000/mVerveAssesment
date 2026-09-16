import { useEffect, useState } from "react";
import CustomerDetails from "./components/CustomerDetails";
import CustomerForm from "./components/CustomerForm";
import CustomerTable from "./components/CustomerTable";
import DeleteConfirm from "./components/DeleteConfirm";
import Filters from "./components/Filters";
import PageButtons from "./components/PageButtons";

const api = import.meta.env.VITE_API_URL || "http://localhost:5000/api/customers";

const blank = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "Active",
};

function App() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_date");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getCustomers();
  }, [search, sortBy, order, page]);

  async function getCustomers() {
    setLoading(true);

    try {
      const q = new URLSearchParams({
        search,
        sortBy,
        order,
        page,
        limit: 5,
      });

      const res = await fetch(`${api}?${q}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setList(data.customers);
      setPages(data.totalPages || 1);
      if (page > (data.totalPages || 1)) setPage(data.totalPages || 1);
    } catch (err) {
      setMsg(err.message || "Something went wrong");
    }

    setLoading(false);
  }

  function updateForm(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  function clearForm() {
    setForm(blank);
    setEditId(null);
    setErrors({});
  }

  function checkForm() {
    const e = {};

    if (form.name.trim().length < 2) e.name = "Enter at least 2 characters.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email.";
    if (form.phone.trim().length < 7) e.phone = "Enter a valid phone number.";
    if (form.company.trim().length < 2) e.company = "Enter company name.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function saveCustomer(e) {
    e.preventDefault();
    setMsg("");
    if (!checkForm()) return;
    setSaving(true);

    try {
      const res = await fetch(editId ? `${api}/${editId}` : api, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.errors ? data.errors.join(" ") : data.message);
      }

      setMsg(editId ? "Customer updated." : "Customer added.");
      setSelected(null);
      clearForm();
      getCustomers();
    } catch (err) {
      setMsg(err.message || "Could not save customer");
    }

    setSaving(false);
  }

  function startEdit(c) {
    setEditId(c.id);
    setSelected(null);
    setErrors({});
    setForm({
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      status: c.status,
    });
  }

  async function showCustomer(id) {
    try {
      const res = await fetch(`${api}/${id}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setSelected(data);
    } catch (err) {
      setMsg(err.message || "Could not load customer");
    }
  }

  async function removeCustomer() {
    if (!deleteItem) return;

    try {
      const res = await fetch(`${api}/${deleteItem.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMsg("Customer deleted.");
      setSelected(null);
      setDeleteItem(null);

      // Note to self: deleting the only row on page 2 should not leave "Page 2 of 1".
      if (list.length === 1 && page > 1) setPage(page - 1);
      else getCustomers();
    } catch (err) {
      setMsg(err.message || "Could not delete customer");
    }
  }

  return (
    <main className="container">
      <h1>Customer Management</h1>

      {msg && <p className="message">{msg}</p>}

      <CustomerForm
        form={form}
        editId={editId}
        errors={errors}
        saving={saving}
        updateForm={updateForm}
        saveCustomer={saveCustomer}
        clearForm={clearForm}
      />

      <Filters
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        order={order}
        setOrder={setOrder}
        setPage={setPage}
      />

      {loading && <p>Loading...</p>}

      <CustomerTable
        list={list}
        showCustomer={showCustomer}
        startEdit={startEdit}
        setDeleteItem={setDeleteItem}
        loading={loading}
      />

      <DeleteConfirm
        item={deleteItem}
        onCancel={() => setDeleteItem(null)}
        onDelete={removeCustomer}
      />

      <PageButtons page={page} pages={pages} setPage={setPage} />

      <CustomerDetails selected={selected} setSelected={setSelected} />
    </main>
  );
}

export default App;
