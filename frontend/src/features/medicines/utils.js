// get_thumbnail() on the backend resolves the source image as
// `obj.image or obj.image_url` (image first) — this mirrors that order
// so the detail page's full-size image agrees with whatever the
// thumbnail was actually generated from. thumbnail itself is preferred
// for grid cards, since it's a real 300x300 crop, not just a smaller
// display of the same file, and smaller assets matter given the SRS's
// low-bandwidth mobile priority (NFR-USE-1).
export function medicineImageSrc(medicine, { preferThumbnail = false } = {}) {
  if (!medicine) return null;
  if (preferThumbnail && medicine.thumbnail) return medicine.thumbnail;
  return medicine.image || medicine.image_url || medicine.thumbnail || null;
}
