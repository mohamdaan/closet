function OutfitCollage({ items, caption }) {
  if (!items || items.length === 0) return null;

  const itemsWithImages = items.filter((item) => item.image_url);

  if (itemsWithImages.length === 0) {
    // Fallback: no photos available, just show names
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item.id}
            className="px-2 py-1 bg-violet-100 text-violet-700 rounded-lg text-xs"
          >
            {item.name}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-3 bg-white border-4 border-slate-800 rounded-lg overflow-hidden shadow-md rotate-[-0.5deg]">
      <div
        className={`grid gap-1 bg-slate-800 p-1 ${
          itemsWithImages.length === 1
            ? "grid-cols-1"
            : itemsWithImages.length === 2
            ? "grid-cols-2"
            : "grid-cols-2 grid-rows-2"
        }`}
      >
        {itemsWithImages.map((item, index) => (
          <div
            key={item.id}
            className={`bg-slate-100 overflow-hidden ${
              itemsWithImages.length === 3 && index === 0 ? "row-span-2" : ""
            }`}
          >
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover aspect-square"
            />
          </div>
        ))}
      </div>

      {caption && (
        <p className="px-3 py-2 text-sm text-slate-700 font-medium italic border-t-2 border-slate-800">
          "{caption}"
        </p>
      )}
    </div>
  );
}

export default OutfitCollage;
