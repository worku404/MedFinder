import { StampMark } from "../../../components/StampMark";

export function PharmacyStatusBanner({ status, rejectionReason, onEditResubmit }) {
  if (status === "verified") {
    return (
      <div className="pharmacy-status pharmacy-status--verified">
        <StampMark state="settled" size={28} />
        <span>Verified</span>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="pharmacy-status pharmacy-status--rejected" role="alert">
        <div className="pharmacy-status__body">
          <strong>Registration rejected</strong>
          <p>{rejectionReason || "No reason was provided."}</p>
        </div>
        {onEditResubmit && (
          <button
            className="btn btn--primary pharmacy-status__action"
            type="button"
            onClick={onEditResubmit}
          >
            Edit & resubmit
          </button>
        )}
      </div>
    );
  }

  // pending is the default status a new pharmacy is created with
  return (
    <div className="pharmacy-status pharmacy-status--pending">
      <StampMark state="pending" size={28} />
      <span>Under review by admin</span>
    </div>
  );
}
