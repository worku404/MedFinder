export function CategoryChips({ categories = [], selectedCategory = "all", onSelectCategory }) {
  return (
    <div className="category-scroller" role="tablist" aria-label="Medicine categories">
      <button
        type="button"
        role="tab"
        aria-selected={selectedCategory === "all"}
        className={`chip ${selectedCategory === "all" ? "chip--active" : ""}`}
        onClick={() => onSelectCategory("all")}
      >
        All categories
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.slug;
        return (
          <button
            key={cat.id || cat.slug}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={`chip ${isSelected ? "chip--active" : ""}`}
            onClick={() => onSelectCategory(cat.slug)}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
