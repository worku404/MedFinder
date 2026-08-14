import { Link, useLocation } from "react-router-dom";

export function PharmacistPortalHeader({ storeCount }) {
  const location = useLocation();

  const isStoresActive = location.pathname === "/pharmacies/mine";
  const isInboxActive = location.pathname === "/pharmacies/mine/inbox";

  return (
    <div className="portal-subnav">
      <div className="portal-subnav__tabs">
        <Link
          to="/pharmacies/mine"
          className={`portal-subnav__tab${isStoresActive ? " portal-subnav__tab--active" : ""}`}
        >
          My Stores
          {storeCount != null && <span className="portal-subnav__badge">{storeCount}</span>}
        </Link>
        <Link
          to="/pharmacies/mine/inbox"
          className={`portal-subnav__tab${isInboxActive ? " portal-subnav__tab--active" : ""}`}
        >
          Patient Inquiries
        </Link>
        <Link
          to="/pharmacies/join"
          className="portal-subnav__tab"
        >
          Join with Code
        </Link>
      </div>

      <Link to="/pharmacies/mine/new" className="btn btn--primary portal-subnav__cta">
        + Register Pharmacy
      </Link>
    </div>
  );
}
