import { useState } from "react";
import { FormField } from "../../../components/FormField";
import { StatusBanner } from "../../../components/StatusBanner";
import { MedicinePicker } from "./MedicinePicker";

// Shared between "add a drug" (no initialValues) and "edit stock" (has
// initialValues). The medicine itself is only pickable on create —
// InventorySerializer has no path for changing which medicine an
// existing entry points to (the unique_pharmacy_medicine_stock
// constraint means that's effectively a different entry), so editing
// just shows the medicine name as fixed context instead of implying
// it's changeable.
export function InventoryForm({ initialValues, submitLabel, onSubmit }) {
  const isEdit = Boolean(initialValues);
  const [medicine, setMedicine] = useState(initialValues?.medicine ?? null);
  const [quantity, setQuantity] = useState(initialValues?.quantity_available ?? "");
  const [price, setPrice] = useState(initialValues?.price ?? "");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!isEdit && !medicine) {
      setError("Pick a medicine from the list first.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        quantity_available: Number(quantity),
        price: Number(price),
      };
      if (!isEdit) payload.medicine_id = medicine.id;
      await onSubmit(payload);
    } catch (err) {
      if (err?.data && typeof err.data === "object") setFieldErrors(err.data);
      setError(err?.message || "Couldn't save this stock entry. Check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="inventory-form" onSubmit={handleSubmit} noValidate>
      {error && <StatusBanner tone="error">{error}</StatusBanner>}

      {isEdit ? (
        <div className="form-field">
          <p className="form-field__label">Medicine</p>
          <p className="inventory-form__locked-medicine">
            {initialValues.medicine.name}
            {initialValues.medicine.strength ? ` ${initialValues.medicine.strength}` : ""}
          </p>
          <p className="form-field__hint">
            The medicine on a stock entry can't be changed — remove this entry and add a new one instead.
          </p>
        </div>
      ) : (
        <MedicinePicker value={medicine} onChange={setMedicine} error={fieldErrors.medicine_id?.[0]} />
      )}

      <FormField
        id="quantity_available"
        label="Quantity available"
        type="number"
        min="0"
        step="1"
        required
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        error={fieldErrors.quantity_available?.[0]}
        hint="0 means out of stock — the listing still shows, just flagged as unavailable."
      />
      <FormField
        id="price"
        label="Price (ETB)"
        type="number"
        min="0.01"
        step="0.01"
        required
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        error={fieldErrors.price?.[0]}
      />

      <button className="btn btn--primary" type="submit" disabled={submitting}>
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
