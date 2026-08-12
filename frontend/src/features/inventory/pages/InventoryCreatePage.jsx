import { useNavigate, useParams } from "react-router-dom";
import { InventoryForm } from "../components/InventoryForm";
import { inventoryApi } from "../api";

export function InventoryCreatePage() {
  const { pharmacyId } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    // `pharmacy` is injected here rather than being a field in the form
    // itself — the pharmacist never types a pharmacy id, it's always
    // exactly the one this route is scoped to. The backend still
    // independently enforces ownership (InventorySerializer.validate_pharmacy),
    // this is just what keeps that from ever being reachable via the UI.
    await inventoryApi.create({ ...payload, pharmacy: pharmacyId });
    navigate(`/pharmacies/mine/${pharmacyId}/inventory`, { replace: true });
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <p className="settings-header__eyebrow">Pharmacist</p>
          <h1 className="settings-header__title">Add a drug</h1>
        </div>
      </header>
      <section className="settings-card">
        <InventoryForm submitLabel="Add to stock" onSubmit={handleSubmit} />
      </section>
    </div>
  );
}
