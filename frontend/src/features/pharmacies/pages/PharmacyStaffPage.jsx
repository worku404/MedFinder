import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusBanner } from "../../../components/StatusBanner";
import { pharmaciesApi } from "../api";

export function PharmacyStaffPage() {
  const { pharmacyId } = useParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [invites, setInvites] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null, actionMsg: null });
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const loadData = async () => {
    try {
      const [pharmacyData, staffData, invitesData] = await Promise.all([
        pharmaciesApi.mineRetrieve(pharmacyId),
        pharmaciesApi.listStaff(pharmacyId),
        pharmaciesApi.listInvites(pharmacyId),
      ]);
      setPharmacy(pharmacyData);
      setStaffList(staffData);
      setInvites(invitesData);
      setStatus({ loading: false, error: null, actionMsg: null });
    } catch (err) {
      setStatus({ loading: false, error: err.message, actionMsg: null });
    }
  };

  useEffect(() => {
    loadData();
  }, [pharmacyId]);

  const handleApprove = async (staffId) => {
    try {
      await pharmaciesApi.approveStaff(pharmacyId, staffId);
      setStatus((s) => ({ ...s, actionMsg: "Staff member approved successfully." }));
      loadData();
    } catch (err) {
      setStatus((s) => ({ ...s, error: err.message }));
    }
  };

  const handleReject = async (staffId) => {
    try {
      await pharmaciesApi.rejectStaff(pharmacyId, staffId);
      setStatus((s) => ({ ...s, actionMsg: "Staff member rejected." }));
      loadData();
    } catch (err) {
      setStatus((s) => ({ ...s, error: err.message }));
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [generatedInvite, setGeneratedInvite] = useState(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalCopied, setModalCopied] = useState(false);

  const openInviteModal = () => {
    setRecipientEmail("");
    setGeneratedInvite(null);
    setModalError(null);
    setModalCopied(false);
    setIsModalOpen(true);
  };

  const closeInviteModal = () => {
    setIsModalOpen(false);
    setGeneratedInvite(null);
    setModalError(null);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    setModalError(null);
    try {
      const payload = recipientEmail.trim() ? { recipient_email: recipientEmail.trim() } : {};
      const newInvite = await pharmaciesApi.createInvite(pharmacyId, payload);
      setGeneratedInvite(newInvite);
      loadData();
    } catch (err) {
      setModalError(err.message || "Failed to generate invite.");
    } finally {
      setModalSubmitting(false);
    }
  };

  const copyModalLink = (code) => {
    const shareUrl = `${window.location.origin}/pharmacies/join?code=${code}`;
    navigator.clipboard.writeText(shareUrl);
    setModalCopied(true);
    setTimeout(() => setModalCopied(false), 2500);
  };

  const copyToClipboard = (code) => {
    const shareUrl = `${window.location.origin}/pharmacies/join?code=${code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <p className="settings-header__eyebrow">
            <Link to="/pharmacies/mine" style={{ color: "inherit", textDecoration: "underline" }}>
              ← Your pharmacies
            </Link>
          </p>
          <h1 className="settings-header__title">
            Staff & Invitations — {pharmacy?.name || "Loading…"}
          </h1>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={openInviteModal}
          disabled={status.loading}
        >
          + Generate Invite Link
        </button>
      </header>

      {status.loading && <p className="auth-fineprint">Loading staff and invitations…</p>}
      {status.error && <StatusBanner tone="error">{status.error}</StatusBanner>}
      {status.actionMsg && <StatusBanner tone="success">{status.actionMsg}</StatusBanner>}

      {/* Active Invites Section */}
      <section className="settings-card" style={{ marginBottom: "2rem" }}>
        <h2 className="settings-card__title">Store Invite Links</h2>
        <p className="auth-fineprint pharmacy-form__intro">
          Share these invite links with your staff pharmacists. Once they submit a join request,
          they will appear below for your approval.
        </p>

        {invites.length === 0 ? (
          <p className="auth-fineprint">No active invite codes. Click "Generate Invite Link" above to create one.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {invites.map((invite) => (
              <div
                key={invite.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  background: "var(--color-bg-subtle, rgba(255,255,255,0.04))",
                  borderRadius: "var(--radius-sm, 6px)",
                  border: "1px solid var(--color-line, rgba(255,255,255,0.1))",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <strong style={{ fontFamily: "monospace", fontSize: "1.1rem" }}>{invite.code}</strong>
                  <span style={{ marginLeft: "1rem", fontSize: "0.85rem", color: "var(--color-ink-soft)" }}>
                    Uses: {invite.use_count} / {invite.max_uses} •{" "}
                    {invite.is_valid ? "Active" : "Expired / Revoked"}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn--google"
                  style={{ width: "auto", fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
                  onClick={() => copyToClipboard(invite.code)}
                >
                  {copiedCode === invite.code ? "✓ Link Copied!" : "Copy Join Link"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Staff Applications Section */}
      <section className="settings-card">
        <h2 className="settings-card__title">Staff Members & Applications</h2>

        {staffList.length === 0 ? (
          <p className="auth-fineprint">No staff members have joined this pharmacy yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            {staffList.map((staff) => (
              <div
                key={staff.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem",
                  background: "var(--color-bg-subtle, rgba(255,255,255,0.04))",
                  borderRadius: "var(--radius-sm, 6px)",
                  border: "1px solid var(--color-line, rgba(255,255,255,0.1))",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <strong>{staff.pharmacist_email || staff.pharmacist_username || "Staff Pharmacist"}</strong>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-ink-soft)", marginTop: "0.25rem" }}>
                    Status:{" "}
                    <span
                      style={{
                        fontWeight: 600,
                        color:
                          staff.status === "approved"
                            ? "var(--color-verified, #4ade80)"
                            : staff.status === "rejected"
                            ? "var(--color-caution, #f87171)"
                            : "var(--color-accent, #fbbf24)",
                      }}
                    >
                      {staff.status === "approved"
                        ? "Approved"
                        : staff.status === "rejected"
                        ? "Rejected"
                        : "Pending Approval"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {staff.status === "pending" && (
                    <>
                      <button
                        type="button"
                        className="btn btn--primary"
                        style={{ width: "auto", fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
                        onClick={() => handleApprove(staff.id)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn btn--caution"
                        style={{ width: "auto", fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
                        onClick={() => handleReject(staff.id)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {staff.status === "approved" && (
                    <button
                      type="button"
                      className="btn btn--caution"
                      style={{ width: "auto", fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
                      onClick={() => handleReject(staff.id)}
                    >
                      Revoke Access
                    </button>
                  )}
                  {staff.status === "rejected" && (
                    <button
                      type="button"
                      className="btn btn--google"
                      style={{ width: "auto", fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
                      onClick={() => handleApprove(staff.id)}
                    >
                      Re-approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Generate Invite Modal Dialog */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={closeInviteModal}
        >
          <div
            style={{
              background: "var(--color-bg-panel, #161e2e)",
              border: "1px solid var(--color-line, rgba(255, 255, 255, 0.12))",
              borderRadius: "var(--radius-md, 12px)",
              maxWidth: "500px",
              width: "100%",
              padding: "1.75rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 600 }}>
                {generatedInvite ? "Invitation Created" : "Invite Staff Pharmacist"}
              </h2>
              <button
                type="button"
                className="btn btn--ghost"
                style={{ padding: "0.2rem 0.5rem", fontSize: "1.2rem", lineHeight: 1 }}
                onClick={closeInviteModal}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div style={{ marginBottom: "1rem" }}>
                <StatusBanner tone="error">{modalError}</StatusBanner>
              </div>
            )}

            {!generatedInvite ? (
              <form onSubmit={handleModalSubmit}>
                <p className="auth-fineprint" style={{ marginBottom: "1.25rem", lineHeight: 1.5 }}>
                  Enter the pharmacist's email address to automatically dispatch an email invitation,
                  or leave blank to simply generate a sharable join link.
                </p>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label
                    htmlFor="recipient-email-input"
                    style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}
                  >
                    Recipient Email <span style={{ color: "var(--color-ink-soft)" }}>(Optional)</span>
                  </label>
                  <input
                    id="recipient-email-input"
                    type="email"
                    className="input"
                    placeholder="e.g. pharmacist@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "var(--radius-sm, 6px)",
                      border: "1px solid var(--color-line, rgba(255, 255, 255, 0.15))",
                      background: "var(--color-bg-subtle, rgba(255, 255, 255, 0.05))",
                      color: "inherit",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={closeInviteModal}
                    disabled={modalSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={modalSubmitting}
                  >
                    {modalSubmitting
                      ? "Generating…"
                      : recipientEmail.trim()
                      ? "Generate & Send Email"
                      : "Generate Join Link"}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-sm, 6px)",
                    background: "rgba(74, 222, 128, 0.1)",
                    border: "1px solid rgba(74, 222, 128, 0.3)",
                    color: "var(--color-verified, #4ade80)",
                    fontSize: "0.9rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  {recipientEmail.trim()
                    ? `✓ Invitation created! Email sent to ${recipientEmail.trim()}`
                    : "✓ Invitation link generated successfully!"}
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--color-ink-soft)", marginBottom: "0.4rem" }}>
                    Invite Code & Link
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      background: "var(--color-bg-subtle, rgba(255, 255, 255, 0.04))",
                      border: "1px solid var(--color-line, rgba(255, 255, 255, 0.1))",
                      borderRadius: "var(--radius-sm, 6px)",
                    }}
                  >
                    <code style={{ fontSize: "0.9rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {`${window.location.origin}/pharmacies/join?code=${generatedInvite.code}`}
                    </code>
                    <button
                      type="button"
                      className="btn btn--google"
                      style={{ width: "auto", fontSize: "0.85rem", padding: "0.35rem 0.75rem", whiteSpace: "nowrap" }}
                      onClick={() => copyModalLink(generatedInvite.code)}
                    >
                      {modalCopied ? "✓ Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={closeInviteModal}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
