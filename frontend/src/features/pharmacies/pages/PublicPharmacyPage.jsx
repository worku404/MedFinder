import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { pharmaciesApi } from "../api";
import { PharmacyMap } from "../components/PharmacyMap";
import { StatusBanner } from "../../../components/StatusBanner";

export function PublicPharmacyPage() {
  const { id } = useParams();
  const [state, setState] = useState({ status: "loading", pharmacy: null, error: null });

  useEffect(() => {
    let cancelled = false;
    pharmaciesApi
      .retrieve(id)
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

  if (state.status === "loading") return <p className="auth-fineprint">Loading pharmacy…</p>;
  if (state.status === "error") {
    return (
      <div className="settings-page">
        <StatusBanner tone="error">This pharmacy isn't available.</StatusBanner>
      </div>
    );
  }

  const { pharmacy } = state;

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <p className="settings-header__eyebrow">Pharmacy</p>
          <h1 className="settings-header__title">{pharmacy.name}</h1>
        </div>
      </header>
      <section className="settings-card">
        <p>{pharmacy.address}</p>
        {pharmacy.phone_number && <p className="auth-fineprint">{pharmacy.phone_number}</p>}
        <PharmacyMap latitude={pharmacy.latitude} longitude={pharmacy.longitude} readOnly />
      </section>
    </div>
  );
}
