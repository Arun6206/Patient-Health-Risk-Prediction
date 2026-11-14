
import { useState } from 'react'
import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import { Section } from '../components/Section'
import { StateBlock } from '../components/StateBlock'

const PAGE_SIZE = 15

export default function Dataset() {
  const columns = useApi(api.getDatasetColumns, [])
  const missing = useApi(api.getMissingValues, [])

  const [page, setPage] = useState(0)
  const [searchColumn, setSearchColumn] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)

  const preview = useApi(
    api.getDatasetPreview.bind(null, PAGE_SIZE, page * PAGE_SIZE),
    [page]
  )

  const activeRecords = searchResult
    ? searchResult.records
    : preview.data?.records

  const columnNames = columns.data?.map((c) => c.name) || []
  const missingCount = missing.data?.length ?? 0
  const totalRecords = preview.data?.total_records

  async function handleSearch(e) {
    e.preventDefault()

    if (!searchColumn || !searchValue.trim()) {
      setSearchResult(null)
      return
    }

    setSearchLoading(true)
    setSearchError(null)

    try {
      const result = await api.searchDataset(
        searchColumn,
        searchValue.trim(),
        50
      )
      setSearchResult(result)
    } catch (err) {
      setSearchError(err)
    } finally {
      setSearchLoading(false)
    }
  }

  function clearSearch() {
    setSearchColumn('')
    setSearchValue('')
    setSearchResult(null)
    setSearchError(null)
  }

  return (
    <div className="space-y-8">

      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 p-7 md:p-8 text-white shadow-md">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[30px] border-white/5" />
        <div className="absolute -bottom-32 right-24 h-64 w-64 rounded-full border-[30px] border-white/5" />

        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            Healthcare Data Management
          </p>

          <h2 className="mt-3 text-2xl md:text-3xl font-bold">
            Patient Dataset Explorer
          </h2>

          <p className="mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-blue-100">
            Explore dataset structure, inspect available features, check data
            quality and search patient records.
          </p>

          <div className="mt-5 inline-flex flex-wrap rounded-full border border-blue-300/30 bg-white/10 px-4 py-2 text-xs text-blue-100">
            Dataset Overview • Data Quality • Record Search
          </div>
        </div>
      </div>

      {/* Dataset Overview */}
      <Section
        title="Dataset Overview"
        description="A quick summary of the available patient dataset."
      >
        <StateBlock
          loading={columns.loading || missing.loading || preview.loading}
          error={columns.error || missing.error || preview.error}
          onRetry={() => {
            columns.reload()
            missing.reload()
            preview.reload()
          }}
        >
          {columns.data && missing.data && preview.data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

              <OverviewCard
                label="Total Records"
                value={totalRecords?.toLocaleString() ?? '—'}
                detail="Patient records"
                accent="blue"
              />

              <OverviewCard
                label="Total Columns"
                value={columns.data.length}
                detail="Available features"
                accent="purple"
              />

              <OverviewCard
                label="Missing Values"
                value={missingCount}
                detail={missingCount === 0 ? 'Dataset cleaned' : 'Values requiring attention'}
                accent={missingCount === 0 ? 'green' : 'orange'}
              />

              <OverviewCard
                label="Data Quality"
                value={missingCount === 0 ? 'Complete' : 'Review'}
                detail="Based on missing-value check"
                accent={missingCount === 0 ? 'green' : 'orange'}
              />

            </div>
          )}
        </StateBlock>
      </Section>

      {/* Column Information */}
      <Section
        title="Dataset Columns"
        description="Available features and their data types. Sensitive identifiers and outcome-leakage columns are excluded by the backend."
      >
        <StateBlock
          loading={columns.loading}
          error={columns.error}
          onRetry={columns.reload}
        >
          {columns.data && (
            <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">

              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Feature Information
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    Column names, data types and value details
                  </p>
                </div>

                <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  {columns.data.length} Features
                </span>
              </div>

              <div className="max-h-96 overflow-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-100">
                    <tr className="border-b border-line text-left">
                      <th className="px-4 py-3 font-semibold text-ink-soft">
                        #
                      </th>
                      <th className="px-4 py-3 font-semibold text-ink-soft">
                        Column Name
                      </th>
                      <th className="px-4 py-3 font-semibold text-ink-soft">
                        Data Type
                      </th>
                      <th className="px-4 py-3 font-semibold text-ink-soft">
                        Details
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {columns.data.map((col, i) => (
                      <tr
                        key={col.name}
                        className="border-b border-line last:border-0 transition-colors hover:bg-blue-50/50"
                      >
                        <td className="px-4 py-3 text-ink-soft">
                          {i + 1}
                        </td>

                        <td className="px-4 py-3 font-medium text-ink">
                          {col.name}
                        </td>

                        <td className="px-4 py-3">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            {col.dtype}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-ink-soft">
                          {col.unique_values !== undefined
                            ? `${col.unique_values} unique values`
                            : `Range: ${col.min} – ${col.max}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </StateBlock>
      </Section>

      {/* Missing Values */}
      <Section
        title="Data Quality Check"
        description="Missing-value analysis of the displayed dataset columns."
      >
        <StateBlock
          loading={missing.loading}
          error={missing.error}
          onRetry={missing.reload}
        >
          {missing.data && (
            <div
              className={`rounded-xl border p-5 ${
                missingCount === 0
                  ? 'border-emerald-200 bg-emerald-50/70'
                  : 'border-amber-200 bg-amber-50/70'
              }`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl font-bold ${
                    missingCount === 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {missingCount === 0 ? '✓' : '!'}
                </div>

                <div>
                  <p className="font-semibold text-ink">
                    {missingCount === 0
                      ? 'No Missing Values Found'
                      : 'Missing Values Detected'}
                  </p>

                  <p className="mt-1 text-sm text-ink-soft">
                    {missingCount === 0
                      ? 'All displayed columns passed the missing-value check.'
                      : `${missingCount} column(s) contain missing values.`}
                  </p>
                </div>
              </div>

              {missingCount > 0 && (
                <div className="mt-5 space-y-2">
                  {missing.data.map((m) => (
                    <div
                      key={m.column}
                      className="flex flex-wrap justify-between gap-2 rounded-lg border border-amber-200 bg-white px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-ink">
                        {m.column}
                      </span>

                      <span className="text-amber-700">
                        {m.missing_count} missing ({m.missing_pct}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </StateBlock>
      </Section>

      {/* Search Records */}
      <Section
        title="Search Patient Records"
        description="Find records by selecting a column and entering a value."
      >
        <div className="rounded-xl border border-line bg-white p-5 shadow-sm">

          <div className="mb-4">
            <p className="text-sm font-semibold text-ink">
              Record Search
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              Search returns up to 50 matching records.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <select
              value={searchColumn}
              onChange={(e) => setSearchColumn(e.target.value)}
              className="min-w-0 rounded-lg border border-line bg-white px-3 py-3 text-sm text-ink outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-1/3"
            >
              <option value="">Choose column...</option>

              {columnNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Enter value to search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={searchLoading || !searchColumn || !searchValue.trim()}
              className="rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {searchLoading ? 'Searching...' : 'Search Records'}
            </button>

            {(searchResult || searchError) && (
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-lg border border-line px-5 py-3 text-sm font-medium text-ink-soft transition hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </form>

          {searchError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {searchError.message}
            </p>
          )}

          {searchResult && (
            <p className="mt-4 text-sm text-ink-soft">
              <span className="font-semibold text-blue-700">
                {searchResult.matched_count}
              </span>{' '}
              record(s) matched. Showing up to 50 records.
            </p>
          )}
        </div>
      </Section>

      {/* Dataset Preview / Search Results */}
      <Section
        title={searchResult ? 'Search Results' : 'Dataset Preview'}
        description={
          searchResult
            ? 'Records matching your selected search criteria.'
            : 'A preview of patient records from the available dataset.'
        }
      >
        <StateBlock
          loading={searchResult ? false : preview.loading}
          error={searchResult ? null : preview.error}
          onRetry={preview.reload}
          empty={activeRecords && activeRecords.length === 0}
          emptyMessage="No records found."
        >
          {activeRecords && activeRecords.length > 0 && (
            <>
              <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse whitespace-nowrap text-sm">
                    <thead className="sticky top-0 bg-slate-100">
                      <tr className="border-b border-line text-left">
                        {Object.keys(activeRecords[0]).map((key) => (
                          <th
                            key={key}
                            className="px-4 py-3 font-semibold text-ink-soft"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {activeRecords.map((record, i) => (
                        <tr
                          key={i}
                          className="border-b border-line last:border-0 transition-colors hover:bg-blue-50/50"
                        >
                          {Object.values(record).map((val, j) => (
                            <td
                              key={j}
                              className="px-4 py-3 text-ink-soft"
                            >
                              {val === null ? '—' : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {!searchResult && preview.data && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-4">

                  <p className="text-sm text-ink-soft">
                    Showing{' '}
                    <span className="font-semibold text-ink">
                      {page * PAGE_SIZE + 1}–
                      {Math.min(
                        (page + 1) * PAGE_SIZE,
                        preview.data.total_records
                      )}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-ink">
                      {preview.data.total_records.toLocaleString()}
                    </span>{' '}
                    records
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Previous
                    </button>

                    <button
                      type="button"
                      disabled={
                        (page + 1) * PAGE_SIZE >= preview.data.total_records
                      }
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </StateBlock>
      </Section>

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">
          Dataset Information Note
        </p>

        <p className="mt-1 text-xs leading-relaxed text-amber-800">
          This dataset is used for academic and statistical analysis.
          Patient records and model outputs are intended for educational
          purposes only and must not be used for actual medical decisions.
        </p>
      </div>

    </div>
  )
}

function OverviewCard({ label, value, detail, accent }) {
  const accentColors = {
    blue: 'border-l-blue-600',
    purple: 'border-l-purple-600',
    green: 'border-l-emerald-600',
    orange: 'border-l-orange-500',
  }

  return (
    <div
      className={`rounded-xl border border-line border-l-4 ${
        accentColors[accent] || 'border-l-blue-600'
      } bg-white p-5 shadow-sm transition-shadow hover:shadow-md`}
    >
      <p className="text-sm text-ink-soft">
        {label}
      </p>

      <p className="mt-2 break-words text-xl font-bold text-ink">
        {value}
      </p>

      <p className="mt-1 text-xs text-ink-soft">
        {detail}
      </p>
    </div>
  )
}
