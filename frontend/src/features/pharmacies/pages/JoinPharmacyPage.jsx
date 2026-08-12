import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FormField } from "../../../components/FormField";
import { StatusBanner } from "../../../components/StatusBanner";
import { pharmaciesApi } from "../api";

export function JoinPharmacyPage() {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState({ state: "idle", message: null, error: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setStatus({ state: "error", message: null, error: "Please enter a valid invite code." });
      return;
    }

    setStatus({ state: "submitting", message: null, error: null });
    try {
      const response = await pharmaciesApi.join(code.trim());
      setStatus({
        state: "success",
        message: `Application submitted for ${response.pharmacy_name || "the pharmacy"}! Your status is currently pending owner approval.`,
        error: null,
      });
      setCode("");
    } catch (err) {
      setStatus({
        state: "error",
        message: null,
        error: err.message || "Failed to join pharmacy. Please check your invite code.",
      });
    }
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <p className="settings-header__eyebrow">Pharmacist Staff</p>
          <h1 className="settings-header__title">Join a pharmacy</h1>
        </div>
      </header>

      <section className="settings-card">
        <p className="auth-fineprint pharmacy-form__intro">
          Enter the invitation code provided by your pharmacy owner. Once submitted, your membership
          will be reviewed and approved by the owner before you can manage stock.
        </p>

        {status.state === "success" && (
          <div style={{ marginBottom: "1.5rem" }}>
            <StatusBanner tone="success">{status.message}</StatusBanner>
            <div style={{ marginTop: "1rem" }}>
              <Link className="btn btn--primary" to="/pharmacies/mine">
                Go to your pharmacies list
              </Link>
            </div>
          </div>
        )}

        {status.state === "error" && (
          <div style={{ marginBottom: "1.5rem" }}>
            <StatusBanner tone="error">{status.error}</StatusBanner>
          </div>
        )}

        {status.state !== "success" && (
          <form className="form" onSubmit={handleSubmit}>
            <FormField
              id="invite-code"
              label="Store Invite Code"
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={status.state === "submitting"}
              hint="Ask your pharmacy manager for the invite code or link."
            />

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn--primary"
                disabled={status.state === "submitting"}
              >
                {status.state === "submitting" ? "Joining…" : "Submit membership request"}
              </button>
              <Link className="btn btn--google" to="/pharmacies/mine">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
