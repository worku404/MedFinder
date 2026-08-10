// RoleEnum in openapi.yaml only exposes customer/pharmacist at
// registration — administrator accounts are created separately
// (Django admin), so it's intentionally not an option here.
const ROLES = [
  { value: "customer", label: "Customer", note: "Search medicine, track alerts" },
  { value: "pharmacist", label: "Pharmacist", note: "List your pharmacy's stock" },
];

export function RoleToggle({ value, onChange }) {
  return (
    <div className="role-toggle" role="radiogroup" aria-label="Account type">
      {ROLES.map((role) => (
        <label
          key={role.value}
          className={`role-toggle__option${value === role.value ? " role-toggle__option--active" : ""}`}
        >
          <input
            type="radio"
            name="role"
            value={role.value}
            checked={value === role.value}
            onChange={() => onChange(role.value)}
          />
          <span className="role-toggle__label">{role.label}</span>
          <span className="role-toggle__note">{role.note}</span>
        </label>
      ))}
    </div>
  );
}
