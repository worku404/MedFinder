import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PharmacyForm } from "../components/PharmacyForm";
import { PharmacyStatusBanner } from "../components/PharmacyStatusBanner";
import { StatusBanner } from "../../../components/StatusBanner";
import { pharmaciesApi } from "../api";

export function PharmacyEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading", pharmacy: null, error: null });

  useEffect(() => {
    let cancelled = false;
    pharmaciesApi
      .mineRetrieve(id)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", pharmacy: data, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", pharmacy: null, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (form) => {
    await pharmaciesApi.minePartialUpdate(id, form);
    navigate("/pharmacies/mine", { replace: true });
  };

  if (state.status === "loading") return <p className="auth-fineprint">Loading pharmacy…</p>;
  if (state.status === "error") {
    return (
      <div className="settings-page">
        <StatusBanner tone="error">{state.error}</StatusBanner>
      </div>
    );
  }

  const { pharmacy } = state;

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <p className="settings-header__eyebrow">
            {pharmacy.is_owner ? "Store Owner" : "Staff Pharmacist"}
          </p>
          <h1 className="settings-header__title">{pharmacy.name}</h1>
        </div>
      </header>

      <section className="settings-card">
        <PharmacyStatusBanner status={pharmacy.status} rejectionReason={pharmacy.rejection_reason} />

        {pharmacy.is_owner ? (
          <PharmacyForm
            initialValues={{
              name: pharmacy.name,
              address: pharmacy.address,
              license_reference: pharmacy.license_reference,
              phone_number: pharmacy.phone_number,
              latitude: pharmacy.latitude,
              longitude: pharmacy.longitude,
            }}
            submitLabel={pharmacy.status === "rejected" ? "Resubmit for review" : "Save changes"}
            onSubmit={handleSubmit}
          />
        ) : (
          <div style={{ marginTop: "1.5rem" }}>
            <p className="auth-fineprint">
              You are assigned to this pharmacy as a staff pharmacist. Physical store details and
              licenses can only be updated by the store owner.
            </p>
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => navigate(`/pharmacies/mine/${pharmacy.id}/inventory`)}
              >
                Go to Stock Management
              </button>
              <button
                type="button"
                className="btn btn--google"
                onClick={() => navigate("/pharmacies/mine")}
              >
                Back to pharmacies
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
