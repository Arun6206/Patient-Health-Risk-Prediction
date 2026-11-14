
import { api } from '../api/client'

function captionFromFilename(filename) {
  return filename
    .replace(/\.png$/i, '')
    .replace(/^\d+b?_/, '')
    .replace(/_model_(a|b)/i, (m, x) => ` — Model ${x.toUpperCase()}`)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function FigureCard({ filename }) {
  const caption = captionFromFilename(filename)

  return (
    <figure className="group overflow-hidden rounded-xl border border-line bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex min-h-48 items-center justify-center bg-slate-50 p-3">
        <img
          src={api.figureUrl(filename)}
          alt={caption}
          loading="lazy"
          className="h-auto w-full object-contain transition-transform duration-200 group-hover:scale-[1.01]"
        />
      </div>

      <figcaption className="border-t border-line px-4 py-3">
        <p className="text-sm font-semibold text-ink">
          {caption}
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          Exploratory data visualization
        </p>
      </figcaption>
    </figure>
  )
}
