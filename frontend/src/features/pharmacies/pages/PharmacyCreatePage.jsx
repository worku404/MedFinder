import { useNavigate } from "react-router-dom";
import { PharmacyForm } from "../components/PharmacyForm";
import { pharmaciesApi } from "../api";

export function PharmacyCreatePage() {
  const navigate = useNavigate();

  const handleSubmit = async (form) => {
    await pharmaciesApi.mineCreate(form);
    navigate("/pharmacies/mine", { replace: true });
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <p className="settings-header__eyebrow">Pharmacist</p>
          <h1 className="settings-header__title">Register a pharmacy</h1>
        </div>
      </header>
      <section className="settings-card">
        <p className="auth-fineprint pharmacy-form__intro">
          An administrator reviews every new pharmacy before it's searchable. You'll see the review
          status here as soon as it changes.
        </p>
        <PharmacyForm submitLabel="Submit for review" onSubmit={handleSubmit} />
      </section>
    </div>
  );
}
