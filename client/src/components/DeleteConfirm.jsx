function DeleteConfirm({ item, onCancel, onDelete }) {
  if (!item) return null;

  return (
    <section className="delete-box">
      <p>
        Delete <strong>{item.name}</strong>?
      </p>
      <button type="button" onClick={onDelete}>
        Yes, delete
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </section>
  );
}

export default DeleteConfirm;
