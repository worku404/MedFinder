import { useState } from "react";
import { FormField } from "../../../components/FormField";
import { StatusBanner } from "../../../components/StatusBanner";
import { PharmacyMap } from "./PharmacyMap";

const emptyForm = {
  name: "",
  address: "",
  license_reference: "",
  phone_number: "",
  latitude: null,
  longitude: null,
};

export function PharmacyForm({ initialValues, submitLabel, onSubmit }) {
  const [form, setForm] = useState({ ...emptyForm, ...initialValues });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    if (form.latitude == null || form.longitude == null) {
      setError("Drop a pin on the map to set your pharmacy's location.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      if (err?.data && typeof err.data === "object") setFieldErrors(err.data);
      setError(err?.message || "Couldn't save this pharmacy. Check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="pharmacy-form" onSubmit={handleSubmit} noValidate>
      {error && <StatusBanner tone="error">{error}</StatusBanner>}

      <FormField
        id="name"
        label="Pharmacy name"
        required
        value={form.name}
        onChange={update("name")}
        error={fieldErrors.name?.[0]}
      />
      <FormField
        id="address"
        label="Address"
        value={form.address}
        onChange={update("address")}
        error={fieldErrors.address?.[0]}
      />
      <FormField
        id="license_reference"
        label="License reference"
        required
        hint="The reference number on your pharmacy operating license."
        value={form.license_reference}
        onChange={update("license_reference")}
        error={fieldErrors.license_reference?.[0]}
      />
      <FormField
        id="phone_number"
        label="Phone number"
        value={form.phone_number}
        onChange={update("phone_number")}
        error={fieldErrors.phone_number?.[0]}
      />

      <div className="form-field">
        <p className="form-field__label">Location</p>
        <PharmacyMap
          latitude={form.latitude}
          longitude={form.longitude}
          onChange={({ latitude, longitude }) => setForm({ ...form, latitude, longitude })}
        />
        {(fieldErrors.latitude?.[0] || fieldErrors.longitude?.[0]) && (
          <p className="form-field__error" role="alert">
            {fieldErrors.latitude?.[0] || fieldErrors.longitude?.[0]}
          </p>
        )}
      </div>

      <button className="btn btn--primary" type="submit" disabled={submitting}>
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
