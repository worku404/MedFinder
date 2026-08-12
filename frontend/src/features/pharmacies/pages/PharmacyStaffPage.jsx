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

  const handleCreateInvite = async () => {
    setCreatingInvite(true);
    try {
      await pharmaciesApi.createInvite(pharmacyId, {});
      setStatus((s) => ({ ...s, actionMsg: "New invite link generated!" }));
      loadData();
    } catch (err) {
      setStatus((s) => ({ ...s, error: err.message }));
    } finally {
      setCreatingInvite(false);
    }
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
          onClick={handleCreateInvite}
          disabled={creatingInvite || status.loading}
        >
          {creatingInvite ? "Generating…" : "+ Generate Invite Link"}
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
    </div>
  );
}
