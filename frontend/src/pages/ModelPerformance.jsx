
import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import { Section } from '../components/Section'
import { StateBlock } from '../components/StateBlock'
import { MetricsTable } from '../components/MetricsTable'
import { FigureCard } from '../components/FigureCard'

const FINAL_METRIC_KEYS = [
  'accuracy',
  'precision',
  'recall_sensitivity',
  'specificity',
  'f1',
  'roc_auc',
  'pr_auc',
  'false_negative',
  'false_positive',
]

const BASELINE_METRIC_KEYS = [
  'accuracy',
  'precision',
  'recall',
  'f1',
  'roc_auc',
  'pr_auc',
]

export default function ModelPerformance() {
  const decision = useApi(api.getDecisionMatrix, [])
  const baseline = useApi(api.getBaselineResults, [])
  const figures = useApi(api.getEdaFigures, [])

  const perfFigures = (figures.data?.figures || []).filter((f) =>
    /^(1[1-9]|2[01])_/.test(f)
  )

  return (
    <div className="space-y-8">

      {/* Page Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-blue-800 p-7 md:p-8 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
          Machine Learning Evaluation
        </p>

        <h2 className="mt-3 text-2xl md:text-3xl font-bold">
          Model Performance Analysis
        </h2>

        <p className="mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-blue-100">
          Evaluate machine learning models using classification metrics,
          compare algorithms and examine their performance through
          evaluation visualizations.
        </p>

        <div className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-white/10 px-4 py-2 text-xs text-blue-100">
          Model Comparison • Evaluation Metrics • Performance Charts
        </div>
      </div>

      {/* Final Model Comparison */}
      <Section
        title="Final Model Comparison"
        description="Comparison of the finalized Logistic Regression models on the untouched test set at a decision threshold of 0.40."
      >
        <StateBlock
          loading={decision.loading}
          error={decision.error}
          onRetry={decision.reload}
        >
          {decision.data && (
            <div className="overflow-hidden rounded-xl border border-line bg-white p-3 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2 pt-2">
                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    Model A vs Model B
                  </h3>
                  <p className="mt-1 text-xs text-ink-soft">
                    Final Logistic Regression results
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                  Threshold: 0.40
                </span>
              </div>

              <div className="overflow-x-auto">
                <MetricsTable
                  metricKeys={FINAL_METRIC_KEYS}
                  columns={[
                    {
                      key: 'a',
                      label: 'Model A (full clinical-course)',
                    },
                    {
                      key: 'b',
                      label: 'Model B (early-risk)',
                    },
                  ]}
                  rowsByColumn={{
                    a: decision.data.model_a.logistic_regression,
                    b: decision.data.model_b.logistic_regression,
                  }}
                />
              </div>
            </div>
          )}
        </StateBlock>
      </Section>

      {/* Algorithm Comparison */}
      <Section
        title="Logistic Regression vs XGBoost"
        description="Comparison of the two candidate algorithms for both prediction approaches."
      >
        <StateBlock
          loading={decision.loading}
          error={decision.error}
          onRetry={decision.reload}
        >
          {decision.data && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

              <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
                <div className="mb-4 border-b border-line pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-ink">
                      Model A
                    </h3>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                      Full clinical-course
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-ink-soft">
                    Uses information from the full clinical course.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <MetricsTable
                    metricKeys={FINAL_METRIC_KEYS}
                    columns={[
                      { key: 'lr', label: 'Logistic Regression' },
                      { key: 'xgb', label: 'XGBoost' },
                    ]}
                    rowsByColumn={{
                      lr: decision.data.model_a.logistic_regression,
                      xgb: decision.data.model_a.xgboost,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
                <div className="mb-4 border-b border-line pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-ink">
                      Model B
                    </h3>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                      Early-risk
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-ink-soft">
                    Uses information available at or near diagnosis.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <MetricsTable
                    metricKeys={FINAL_METRIC_KEYS}
                    columns={[
                      { key: 'lr', label: 'Logistic Regression' },
                      { key: 'xgb', label: 'XGBoost' },
                    ]}
                    rowsByColumn={{
                      lr: decision.data.model_b.logistic_regression,
                      xgb: decision.data.model_b.xgboost,
                    }}
                  />
                </div>
              </div>

            </div>
          )}
        </StateBlock>
      </Section>

      {/* Baseline Results */}
      <Section
        title="Baseline Model Results"
        description="Performance of the four baseline algorithms before hyperparameter tuning and threshold optimization."
      >
        <StateBlock
          loading={baseline.loading}
          error={baseline.error}
          onRetry={baseline.reload}
        >
          {baseline.data && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

              {['model_a', 'model_b'].map((key) => (
                <div
                  key={key}
                  className="rounded-xl border border-line bg-white p-4 shadow-sm"
                >
                  <div className="mb-4 border-b border-line pb-3">
                    <h3 className="text-base font-semibold text-ink">
                      {key === 'model_a' ? 'Model A' : 'Model B'}
                    </h3>

                    <p className="mt-1 text-xs text-ink-soft">
                      Baseline algorithm comparison
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <MetricsTable
                      metricKeys={BASELINE_METRIC_KEYS}
                      columns={Object.keys(baseline.data[key]).map(
                        (algo) => ({
                          key: algo,
                          label: algo.replaceAll('_', ' '),
                        })
                      )}
                      rowsByColumn={baseline.data[key]}
                    />
                  </div>
                </div>
              ))}

            </div>
          )}
        </StateBlock>
      </Section>

      {/* Evaluation Charts */}
      <Section
        title="Model Evaluation Visualizations"
        description="ROC curves, precision-recall curves and confusion matrices from model evaluation and threshold tuning."
      >
        <StateBlock
          loading={figures.loading}
          error={figures.error}
          onRetry={figures.reload}
        >
          {figures.data && (
            <>
              <div className="mb-5 flex items-center justify-between rounded-xl border border-line bg-white p-4">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Evaluation Charts
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    Visual representation of model performance.
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 px-4 py-2 text-center">
                  <p className="text-lg font-bold text-blue-700">
                    {perfFigures.length}
                  </p>
                  <p className="text-xs text-blue-600">
                    Charts
                  </p>
                </div>
              </div>

              {perfFigures.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {perfFigures.map((filename) => (
                    <div
                      key={filename}
                      className="overflow-hidden rounded-xl border border-line bg-white p-2 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <FigureCard filename={filename} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-line bg-white p-6 text-center">
                  <p className="text-sm text-ink-soft">
                    No evaluation charts are currently available.
                  </p>
                </div>
              )}
            </>
          )}
        </StateBlock>
      </Section>

      {/* Evaluation Note */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">
          Evaluation Note
        </p>

        <p className="mt-1 text-xs leading-relaxed text-amber-800">
          Accuracy alone may not adequately describe performance on an
          imbalanced dataset. Recall, precision, F1-score, ROC-AUC and
          PR-AUC should also be considered. These results are based on
          the available test dataset and do not establish clinical validity.
        </p>
      </div>

    </div>
  )
}
