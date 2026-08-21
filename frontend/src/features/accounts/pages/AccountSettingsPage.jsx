import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormField } from "../../../components/FormField";
import { StatusBanner } from "../../../components/StatusBanner";
import { useAuth } from "../../../context/AuthContext";
import { accountsApi } from "../api";
import { ApiError } from "../../../lib/apiClient";

// administrator is included defensively — RoleEnum in the registration
// schema only offers customer/pharmacist, but an existing admin account
// (created via Django admin) could still land on this page.
const ROLE_LABEL = {
  customer: "Customer",
  pharmacist: "Pharmacist",
  administrator: "Administrator",
};

export function AccountSettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    username: user?.username ?? "",
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
  });
  const [profileStatus, setProfileStatus] = useState("idle");
  const [profileError, setProfileError] = useState(null);

  const [pwForm, setPwForm] = useState({
    new_password1: "",
    new_password2: "",
  });
  const [pwStatus, setPwStatus] = useState("idle");
  const [pwError, setPwError] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  if (!user) return null;

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileStatus("saving");
    setProfileError(null);
    try {
      await updateProfile(profileForm);
      setProfileStatus("saved");
    } catch (err) {
      setProfileStatus("idle");
      setProfileError(
        err instanceof ApiError ? err.message : "Couldn't save changes.",
      );
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwError(null);

    if (pwForm.new_password1 !== pwForm.new_password2) {
      setPwError("Passwords don't match.");
      return;
    }

    setPwStatus("saving");

    try {
      await accountsApi.passwordChange(pwForm);

      setPwStatus("saved");

      setPwForm({
        new_password1: "",
        new_password2: "",
      });

      setShowPasswordForm(false);
    } catch (err) {
      setPwStatus("idle");
      setPwError(
        err instanceof ApiError ? err.message : "Couldn't update password.",
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <p className="settings-header__eyebrow">
            {ROLE_LABEL[user.role] ?? user.role}
          </p>
          <h1 className="settings-header__title">Account settings</h1>
        </div>
        <button className="btn btn--ghost" type="button" onClick={handleLogout}>
          Sign out
        </button>
      </header>

      <section className="settings-card">
        <h2 className="settings-card__title">Profile</h2>
        {profileError && (
          <StatusBanner tone="error">{profileError}</StatusBanner>
        )}
        {profileStatus === "saved" && (
          <StatusBanner tone="info">Profile updated.</StatusBanner>
        )}
        <form onSubmit={saveProfile} noValidate>
          <FormField
            id="username"
            label="Username"
            value={profileForm.username}
            onChange={(e) =>
              setProfileForm({ ...profileForm, username: e.target.value })
            }
          />
          <div className="settings-row">
            <FormField
              id="first_name"
              label="First name"
              value={profileForm.first_name}
              onChange={(e) =>
                setProfileForm({ ...profileForm, first_name: e.target.value })
              }
            />
            <FormField
              id="last_name"
              label="Last name"
              value={profileForm.last_name}
              onChange={(e) =>
                setProfileForm({ ...profileForm, last_name: e.target.value })
              }
            />
          </div>
          {/* email and role are readOnly in AccountsUserDetails — displayed, not editable */}
          <FormField
            id="email"
            label="Email"
            value={user.email}
            disabled
            hint="Contact support to change your email."
          />
          <button
            className="btn btn--primary mt-4"
            type="submit"
            disabled={profileStatus === "saving"}
          >
            {profileStatus === "saving" ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>

      <section className="settings-card">
        <h2 className="settings-card__title">Password</h2>
        {pwError && <StatusBanner tone="error">{pwError}</StatusBanner>}
        {pwStatus === "saved" && (
          <StatusBanner tone="info">Password updated.</StatusBanner>
        )}
        <form onSubmit={changePassword} noValidate>
          <FormField
            id="new_password1"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={pwForm.new_password1}
            onChange={(e) =>
              setPwForm({ ...pwForm, new_password1: e.target.value })
            }
          />
          <FormField
            id="new_password2"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={pwForm.new_password2}
            onChange={(e) =>
              setPwForm({ ...pwForm, new_password2: e.target.value })
            }
          />
          <button
            className="btn btn--primary mt-4"
            type="submit"
            disabled={pwStatus === "saving"}
          >
            {pwStatus === "saving" ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>
    </div>
  );
}
