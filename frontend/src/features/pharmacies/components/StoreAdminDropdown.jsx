import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export function StoreAdminDropdown({ pharmacyId, status }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyLink = async (e) => {
    e.preventDefault();
    const url = `${window.location.origin}/pharmacies/${pharmacyId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is unavailable
    }
  };

  return (
    <div className="store-admin-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="btn btn--outline store-admin-dropdown__trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        Store Admin ▾
      </button>

      {isOpen && (
        <div className="store-admin-dropdown__menu">
          <Link
            to={`/pharmacies/mine/${pharmacyId}/edit`}
            className="store-admin-dropdown__item"
            onClick={() => setIsOpen(false)}
          >
            Edit Details & License
          </Link>
          <Link
            to={`/pharmacies/mine/${pharmacyId}/staff`}
            className="store-admin-dropdown__item"
            onClick={() => setIsOpen(false)}
          >
            Manage Staff & Invites
          </Link>
          <button
            type="button"
            className="store-admin-dropdown__item store-admin-dropdown__button"
            onClick={handleCopyLink}
          >
            {copied ? "Copied Public Link!" : "Copy Public Store Link"}
          </button>
          {status === "verified" && (
            <Link
              to={`/pharmacies/${pharmacyId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="store-admin-dropdown__item"
              onClick={() => setIsOpen(false)}
            >
              View Public Page ↗
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
