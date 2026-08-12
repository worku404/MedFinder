import { useState } from "react";

export function ShareLinkButton({ pharmacyId, status }) {
  const [copied, setCopied] = useState(false);
  const enabled = status === "verified";
  const url = `${window.location.origin}/pharmacies/${pharmacyId}`;

  const copy = async () => {
    if (!enabled) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable in some contexts — the URL is
      // still shown in the hint text below as a fallback.
    }
  };

  return (
    <div className="share-link">
      <button className="btn btn--google share-link__button" type="button" onClick={copy} disabled={!enabled}>
        {copied ? "Link copied" : "Copy public share link"}
      </button>
      <p className="share-link__hint">
        {enabled ? url : "The share link unlocks once an administrator verifies this pharmacy."}
      </p>
    </div>
  );
}
