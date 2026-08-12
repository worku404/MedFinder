export function MedicineTag({ requiresPrescription }) {
  return (
    <span className={`med-tag${requiresPrescription ? " med-tag--rx" : ""}`}>
      {requiresPrescription ? "℞ Prescription required" : "OTC"}
    </span>
  );
}
