import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function getPages(current, total) {
  if (total <= 7) {
    return { pages: Array.from({ length: total }, (_, i) => i + 1), start: 0, end: total - 1 };
  }
  let start = current - 3;
  if (start < 0) start = 0;
  let end = start + 6;
  if (end >= total) {
    end = total - 1;
    start = end - 6;
  }
  return { pages: Array.from({ length: end - start + 1 }, (_, i) => start + i + 1), start, end };
}

export default function Pagination({ page, pages: totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const { pages } = getPages(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="px-2.5 py-1.5 rounded-lg bg-theme-tertiary text-theme-secondary hover:text-gold text-sm disabled:opacity-40 transition-colors"
        aria-label="Previous page"
      >
        <FiChevronLeft size={16} />
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-sm transition-colors ${
            p === page ? 'bg-gold text-dark' : 'bg-theme-tertiary text-theme-secondary hover:text-gold'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="px-2.5 py-1.5 rounded-lg bg-theme-tertiary text-theme-secondary hover:text-gold text-sm disabled:opacity-40 transition-colors"
        aria-label="Next page"
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
}