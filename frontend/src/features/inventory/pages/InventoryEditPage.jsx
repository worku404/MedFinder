import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { InventoryForm } from "../components/InventoryForm";
import { StatusBanner } from "../../../components/StatusBanner";
import { inventoryApi } from "../api";

export function InventoryEditPage() {
  const { pharmacyId, id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading", entry: null, error: null });

  useEffect(() => {
    let cancelled = false;
    inventoryApi
      .retrieve(id)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", entry: data, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", entry: null, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (payload) => {
    await inventoryApi.partialUpdate(id, payload);
    navigate(`/pharmacies/mine/${pharmacyId}/inventory`, { replace: true });
  };

  if (state.status === "loading") return <p className="auth-fineprint">Loading stock entry…</p>;
  if (state.status === "error") {
    return (
      <div className="settings-page">
        <StatusBanner tone="error">{state.error}</StatusBanner>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <p className="settings-header__eyebrow">Pharmacist</p>
          <h1 className="settings-header__title">Edit stock</h1>
        </div>
      </header>
      <section className="settings-card">
        <InventoryForm
          initialValues={{
            medicine: state.entry.medicine,
            quantity_available: state.entry.quantity_available,
            price: state.entry.price,
          }}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
        />
      </section>
    </div>
  );
}
