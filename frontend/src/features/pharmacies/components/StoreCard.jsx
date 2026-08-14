import { Link, useNavigate } from "react-router-dom";
import { PharmacyStatusBanner } from "./PharmacyStatusBanner";
import { StoreAdminDropdown } from "./StoreAdminDropdown";

export function StoreCard({ pharmacy }) {
  const navigate = useNavigate();

  return (
    <article className="store-portal-card">
      <div className="store-portal-card__body">
        <div className="store-portal-card__head">
          <div>
            <h2 className="store-portal-card__title">{pharmacy.name}</h2>
            <span
              className={`store-portal-card__role${
                pharmacy.is_owner ? " store-portal-card__role--owner" : " store-portal-card__role--staff"
              }`}
            >
              {pharmacy.is_owner ? "Store Owner" : "Staff Pharmacist"}
            </span>
          </div>

          <PharmacyStatusBanner
            status={pharmacy.status}
            rejectionReason={pharmacy.rejection_reason}
            onEditResubmit={() => navigate(`/pharmacies/mine/${pharmacy.id}/edit`)}
          />
        </div>

        <p className="store-portal-card__address">
          {pharmacy.address || "No physical address provided."}
        </p>

        {pharmacy.license_reference && (
          <p className="store-portal-card__license">
            License Reference: <code>{pharmacy.license_reference}</code>
          </p>
        )}
      </div>

      <div className="store-portal-card__footer">
        {pharmacy.is_owner ? (
          <StoreAdminDropdown pharmacyId={pharmacy.id} status={pharmacy.status} />
        ) : (
          pharmacy.status === "verified" && (
            <Link
              to={`/pharmacies/${pharmacy.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--outline"
            >
              Public View ↗
            </Link>
          )
        )}

        <Link
          className="btn btn--primary store-portal-card__cta"
          to={`/pharmacies/mine/${pharmacy.id}/inventory`}
        >
          Manage Stock ➔
        </Link>
      </div>
    </article>
  );
}
