
import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import { Section } from '../components/Section'
import { StateBlock } from '../components/StateBlock'
import { FigureCard } from '../components/FigureCard'

const EDA_GROUPS = [
  {
    title: 'Distributions',
    description:
      'How individual numerical and categorical variables are distributed across the dataset.',
    match: (f) => /^0[12]_/.test(f),
  },
  {
    title: 'Target and mortality patterns',
    description:
      'How the death_flag target is distributed, and how mortality rate varies across patient groups.',
    match: (f) => /^0[3-6]_/.test(f),
  },
  {
    title: 'Interactions and correlation',
    description:
      'How severity and disease category compound, and how numerical features correlate with each other.',
    match: (f) => /^0[78]_/.test(f),
  },
  {
    title: 'Symptoms and time',
    description:
      'Which symptoms carry the most mortality signal, and whether mortality varies by year or season.',
    match: (f) => /^(09|10)_/.test(f),
  },
]

export default function DataAnalysis() {
  const overview = useApi(api.getDatasetOverview, [])
  const columns = useApi(api.getDatasetColumns, [])
  const figures = useApi(api.getEdaFigures, [])

  const edaFigures = (figures.data?.figures || []).filter((f) =>
    /^\d{2}_/.test(f)
  )

  const groupedFigureCount = EDA_GROUPS.reduce(
    (total, group) =>
      total + edaFigures.filter(group.match).length,
    0
  )

  return (
    <div className="space-y-8">

      {/* Page Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-blue-800 p-7 md:p-8 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
          Exploratory Data Analysis
        </p>

        <h2 className="mt-3 text-2xl md:text-3xl font-bold">
          Understand the Patient Dataset
        </h2>

        <p className="mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-blue-100">
          Explore patient characteristics, mortality patterns, feature
          relationships and trends through visual data analysis.
        </p>

        <div className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-white/10 px-4 py-2 text-xs text-blue-100">
          Dataset Statistics • {groupedFigureCount} EDA Figures • Data Insights
        </div>
      </div>

      {/* Dataset Statistics */}
      <Section
        title="Dataset Statistics"
        description="Overview of the dataset after cleaning and feature engineering."
      >
        <StateBlock
          loading={overview.loading || columns.loading}
          error={overview.error || columns.error}
          onRetry={() => {
            overview.reload()
            columns.reload()
          }}
        >
          {overview.data && columns.data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatBox
                label="Total Records"
                value={overview.data.total_records.toLocaleString()}
                sublabel="Patient records"
                accent="blue"
              />

              <StatBox
                label="Total Columns"
                value={columns.data.length}
                sublabel="Available features"
                accent="purple"
              />

              <StatBox
                label="Earliest Diagnosis"
                value={overview.data.date_range.earliest}
                sublabel="Dataset start"
                accent="green"
              />

              <StatBox
                label="Latest Diagnosis"
                value={overview.data.date_range.latest}
                sublabel="Dataset end"
                accent="orange"
              />
            </div>
          )}
        </StateBlock>
      </Section>

      {/* EDA Figures */}
      <Section
        title="Exploratory Data Visualizations"
        description="Visual analysis of different aspects of patient data."
      >
        <StateBlock
          loading={figures.loading}
          error={figures.error}
          onRetry={figures.reload}
        >
          {figures.data && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-ink">
                  Analysis Overview
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  Visualizations are organized into four analytical categories.
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 px-4 py-2">
                <p className="text-lg font-bold text-blue-700">
                  {groupedFigureCount}
                </p>
                <p className="text-xs text-blue-600">
                  EDA Figures
                </p>
              </div>
            </div>
          )}
        </StateBlock>
      </Section>

      {/* Grouped EDA Visualizations */}
      {EDA_GROUPS.map((group, index) => {
        const groupFigures = edaFigures.filter(group.match)

        if (groupFigures.length === 0) return null

        return (
          <Section
            key={group.title}
            title={group.title}
            description={group.description}
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">
                0{index + 1}
              </span>

              <span className="text-xs font-medium text-ink-soft">
                {groupFigures.length} visualization(s)
              </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {groupFigures.map((filename) => (
                <div
                  key={filename}
                  className="overflow-hidden rounded-xl border border-line bg-white p-2 shadow-sm transition-shadow hover:shadow-md"
                >
                  <FigureCard filename={filename} />
                </div>
              ))}
            </div>
          </Section>
        )
      })}

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">
          Data Analysis Note
        </p>

        <p className="mt-1 text-xs leading-relaxed text-amber-800">
          These visualizations represent patterns and relationships found
          in the available dataset. Observed associations do not necessarily
          indicate causation.
        </p>
      </div>

    </div>
  )
}

function StatBox({ label, value, sublabel, accent }) {
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
      } bg-white p-5 shadow-sm`}
    >
      <p className="text-sm text-ink-soft">{label}</p>

      <p className="mt-2 break-words text-xl font-bold text-ink">
        {value}
      </p>

      <p className="mt-1 text-xs text-ink-soft">
        {sublabel}
      </p>
    </div>
  )
}
