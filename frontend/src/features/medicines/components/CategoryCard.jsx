import { Link } from "react-router-dom";

export function CategoryCard({ category }) {
  return (
    <Link className="category-card" to={`/medicines/categories/${category.slug}`}>
      <p className="category-card__name">{category.name}</p>
      {category.description && <p className="category-card__description">{category.description}</p>}
    </Link>
  );
}
