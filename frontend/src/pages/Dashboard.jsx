
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import { Section } from '../components/Section'
import { StatCard } from '../components/StatCard'
import { StateBlock } from '../components/StateBlock'

const TARGET_COLORS = ['#2563eb', '#ef4444']

export default function Dashboard() {
  const overview = useApi(api.getDatasetOverview, [])
  const summary = useApi(api.getModelSummary, [])

  const targetData = overview.data
    ? [
        {
          name: 'Survived / ongoing care',
          value: overview.data.target_distribution['0'],
        },
        {
          name: 'Deceased',
          value: overview.data.target_distribution['1'],
        },
      ]
    : []

  return (
    <div className="space-y-8">

      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-blue-800 p-7 md:p-9 text-white shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
            Healthcare Analytics
          </p>

          <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">
            Patient Health Risk Predictions Using ML
          </h2>

          <p className="mt-3 text-sm md:text-base leading-relaxed text-blue-100">
            Explore patient data, analyze mortality patterns and compare
            machine learning models through an interactive dashboard.
          </p>

          <div className="mt-5 inline-flex items-center rounded-full border border-blue-300/30 bg-white/10 px-4 py-2 text-xs text-blue-100">
            Statistical analysis • Machine learning • Prediction
          </div>
        </div>

        <div className="absolute -right-12 -bottom-24 h-64 w-64 rounded-full border-[35px] border-white/5" />
        <div className="absolute right-20 -top-20 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />
      </div>

      {/* Dataset Overview */}
      <Section
        title="Dataset Overview"
        description="A quick overview of the patient records used in this project."
      >
        <StateBlock
          loading={overview.loading}
          error={overview.error}
          onRetry={overview.reload}
        >
          {overview.data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                label="Total patient records"
                value={overview.data.total_records.toLocaleString()}
                accent="brand"
              />

              <StatCard
                label="Columns retained"
                value={overview.data.total_columns}
              />

              <StatCard
                label="Deceased in dataset"
                value={`${overview.data.target_distribution_pct['1']}%`}
                sublabel={`${overview.data.target_distribution['1'].toLocaleString()} records`}
                accent="risk"
              />

              <StatCard
                label="Missing values"
                value={overview.data.missing_values_total}
                sublabel="After data cleaning"
                accent="safe"
              />
            </div>
          )}
        </StateBlock>
      </Section>

      {/* Patient Distribution */}
      <Section
        title="Patient Outcome Distribution"
        description="Distribution of the target variable death_flag across the dataset."
      >
        <StateBlock
          loading={overview.loading}
          error={overview.error}
          onRetry={overview.reload}
        >
          {overview.data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              <div className="rounded-xl border border-line bg-white p-5">
                <h3 className="text-sm font-semibold text-ink">
                  Outcome Breakdown
                </h3>

                <p className="mt-1 text-xs text-ink-soft">
                  Patient records by recorded outcome
                </p>

                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={targetData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {targetData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={TARGET_COLORS[index]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => value.toLocaleString()}
                    />

                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl border border-line bg-white p-5">
                <h3 className="text-sm font-semibold text-ink">
                  Outcome Statistics
                </h3>

                <p className="mt-1 text-xs text-ink-soft">
                  Actual distribution in the dataset
                </p>

                <div className="mt-7 space-y-7">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-ink">
                        Survived / ongoing care
                      </span>
                      <span className="font-semibold text-blue-600">
                        {overview.data.target_distribution_pct['0']}%
                      </span>
                    </div>

                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${overview.data.target_distribution_pct['0']}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-ink-soft">
                      {overview.data.target_distribution['0'].toLocaleString()} records
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-ink">
                        Deceased
                      </span>
                      <span className="font-semibold text-red-500">
                        {overview.data.target_distribution_pct['1']}%
                      </span>
                    </div>

                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{
                          width: `${overview.data.target_distribution_pct['1']}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-ink-soft">
                      {overview.data.target_distribution['1'].toLocaleString()} records
                    </p>
                  </div>
                </div>

                <div className="mt-7 rounded-lg bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-900">
                    Dataset observation
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-blue-800">
                    The target classes are imbalanced. Therefore, recall
                    and PR-AUC are important evaluation metrics alongside
                    accuracy.
                  </p>
                </div>
              </div>
            </div>
          )}
        </StateBlock>
      </Section>

      {/* Model Comparison */}
      <Section
        title="Machine Learning Model Comparison"
        description="Performance comparison of the two final Logistic Regression models."
      >
        <StateBlock
          loading={summary.loading}
          error={summary.error}
          onRetry={summary.reload}
        >
          {summary.data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ModelSummaryCard
                modelKey="A"
                data={summary.data.model_a}
              />

              <ModelSummaryCard
                modelKey="B"
                data={summary.data.model_b}
              />
            </div>
          )}
        </StateBlock>
      </Section>

      {/* Key Insights */}
      <Section
        title="Key Insights"
        description="Important observations from the model analysis."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <InsightCard
            number="01"
            title="Important predictors"
            description="Age and severity are among the strongest and most consistent predictors of mortality risk across both models."
          />

          <InsightCard
            number="02"
            title="Two prediction approaches"
            description="Model A uses full clinical-course information, while Model B focuses on information available at or near diagnosis."
          />

          <InsightCard
            number="03"
            title="Model interpretability"
            description="Logistic Regression provides coefficient-level interpretability, helping explain how input features influence predictions."
          />

        </div>
      </Section>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">
          Important Disclaimer
        </p>
        <p className="mt-1 text-xs leading-relaxed text-amber-800">
          This project is developed for educational and statistical analysis
          purposes. Model predictions are estimates and must not be used as
          medical diagnoses or for real clinical decisions.
        </p>
      </div>

      <div className="border-t border-line pt-5 text-center">
        <p className="text-xs text-ink-soft">
          Patient Health Risk Predictions Using ML
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          Developed by Arun Kumar Yadav
        </p>
      </div>

    </div>
  )
}

function ModelSummaryCard({ modelKey, data }) {
  const metrics = data.metrics
  const recall = metrics.recall_sensitivity * 100
  const auc = metrics.roc_auc * 100

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-ink">
          Model {modelKey}
        </h3>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Logistic Regression
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        {data.description}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Metric label="Recall" value={`${recall.toFixed(1)}%`} />
        <Metric label="ROC-AUC" value={`${auc.toFixed(1)}%`} />
        <Metric label="Threshold" value={data.threshold} />
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-xs">
          <span className="text-ink-soft">Recall performance</span>
          <span className="font-semibold text-ink">
            {recall.toFixed(1)}%
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${Math.min(recall, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-1 text-lg font-bold text-ink">{value}</p>
    </div>
  )
}

function InsightCard({ number, title, description }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <p className="text-xs font-bold tracking-widest text-blue-600">
        {number}
      </p>

      <h3 className="mt-3 text-sm font-semibold text-ink">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        {description}
      </p>
    </div>
  )
}
