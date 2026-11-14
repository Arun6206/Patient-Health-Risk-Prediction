
import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import { Section } from '../components/Section'
import { StateBlock } from '../components/StateBlock'
import { FigureCard } from '../components/FigureCard'

export default function Explainability() {
  const explain = useApi(api.getExplainability, [])
  const figures = useApi(api.getEdaFigures, [])

  const shapFigures = (figures.data?.figures || []).filter((f) =>
    /^2[2-7]_/.test(f)
  )

  return (
    <div className="space-y-8">

      {/* Page Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-blue-800 p-7 md:p-8 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
          Model Explainability
        </p>

        <h2 className="mt-3 text-2xl md:text-3xl font-bold">
          Understanding Model Predictions
        </h2>

        <p className="mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-blue-100">
          Discover which patient features influence mortality risk
          predictions using SHAP values and Logistic Regression coefficients.
        </p>

        <div className="mt-5 inline-flex rounded-full border border-blue-300/30 bg-white/10 px-4 py-2 text-xs text-blue-100">
          SHAP Analysis • Feature Importance • Model Interpretation
        </div>
      </div>

      {/* Model Findings */}
      <Section
        title="What Drives Each Prediction?"
        description="Feature importance analysis for both prediction models using SHAP values and Logistic Regression coefficients."
      >
        <StateBlock
          loading={explain.loading}
          error={explain.error}
          onRetry={explain.reload}
        >
          {explain.data && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {['model_a', 'model_b'].map((key) => (
                <FindingsCard
                  key={key}
                  label={key === 'model_a' ? 'Model A' : 'Model B'}
                  data={explain.data[key]}
                />
              ))}
            </div>
          )}
        </StateBlock>
      </Section>

      {/* Understanding Explainability */}
      <Section
        title="How to Interpret the Results"
        description="A simple guide to understanding the feature importance analysis."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <ExplanationCard
            number="01"
            title="SHAP Summary Plots"
            description="SHAP values explain how individual features contribute to a model prediction. Features with larger absolute SHAP values have a greater influence on the prediction."
          />

          <ExplanationCard
            number="02"
            title="Logistic Regression Coefficients"
            description="Positive coefficients increase the predicted log-odds of the positive class, while negative coefficients decrease them, with other features held constant."
          />

          <ExplanationCard
            number="03"
            title="Risk-Increasing Features"
            description="These are features associated with an increase in the model's predicted mortality risk, according to the Logistic Regression coefficients."
          />

          <ExplanationCard
            number="04"
            title="Risk-Decreasing Features"
            description="These are features associated with a decrease in the model's predicted mortality risk, according to the Logistic Regression coefficients."
          />

        </div>
      </Section>

      {/* Feature Interpretation Legend */}
      <Section
        title="Feature Interpretation Guide"
        description="Understand the meaning of the feature categories used in the analysis."
      >
        <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">

            <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
              <span className="text-xs font-medium text-slate-700">
                SHAP important features
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="text-xs font-medium text-red-700">
                Positive coefficients
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-700">
                Negative coefficients
              </span>
            </div>

          </div>

          <p className="mt-4 text-xs leading-relaxed text-ink-soft">
            These categories describe model behavior and statistical
            associations. They do not establish that a feature directly
            causes a patient's health outcome.
          </p>
        </div>
      </Section>

      {/* Explainability Charts */}
      <Section
        title="SHAP and Coefficient Visualizations"
        description="Visual analysis of feature importance and model coefficients for Model A and Model B."
      >
        <StateBlock
          loading={figures.loading}
          error={figures.error}
          onRetry={figures.reload}
        >
          {figures.data && (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-4">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Explainability Charts
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    Visual interpretation of model features.
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 px-4 py-2 text-center">
                  <p className="text-lg font-bold text-blue-700">
                    {shapFigures.length}
                  </p>
                  <p className="text-xs text-blue-600">
                    Charts
                  </p>
                </div>
              </div>

              {shapFigures.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {shapFigures.map((filename) => (
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
                    No explainability charts are currently available.
                  </p>
                </div>
              )}
            </>
          )}
        </StateBlock>
      </Section>

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">
          Interpretation Note
        </p>

        <p className="mt-1 text-xs leading-relaxed text-amber-800">
          Feature importance and model coefficients describe how the
          machine learning models use available data. They do not prove
          causation and should not be interpreted as medical advice.
        </p>
      </div>

    </div>
  )
}

function FindingsCard({ label, data }) {
  const isModelB = label === 'Model B'

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">

      <div className="border-b border-line bg-slate-50 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-ink">
            {label}
          </h3>

          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            isModelB
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-blue-50 text-blue-700'
          }`}>
            {isModelB ? 'Early-risk model' : 'Full clinical-course'}
          </span>
        </div>

        <p className="mt-1 text-xs text-ink-soft">
          Feature importance and coefficient analysis
        </p>
      </div>

      <div className="space-y-5 p-5">

        <FeatureGroup
          title="Top Features (XGBoost, SHAP)"
          items={data.top10_xgboost_shap}
          tone="neutral"
        />

        <FeatureGroup
          title="Increases Risk (Logistic Regression)"
          items={data.top10_lr_positive}
          tone="risk"
        />

        <FeatureGroup
          title="Decreases Risk (Logistic Regression)"
          items={data.top10_lr_negative}
          tone="safe"
        />

        {data.early_availability_flagged?.length > 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Feature Availability Warning
            </p>

            <p className="mt-1 text-xs leading-relaxed text-amber-800">
              Post-admission features found among top importances:
              {' '}
              {data.early_availability_flagged.join(', ')}
            </p>
          </div>
        ) : (
          isModelB && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-800">
                No Flagged Post-admission Features
              </p>

              <p className="mt-1 text-xs leading-relaxed text-emerald-700">
                No post-admission features were flagged in the
                supplied top-feature analysis.
              </p>
            </div>
          )
        )}

      </div>
    </div>
  )
}

function FeatureGroup({ title, items, tone }) {
  const tagStyles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    risk: 'bg-red-50 text-red-700 border-red-100',
    safe: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  }

  const dotStyles = {
    neutral: 'bg-slate-500',
    risk: 'bg-red-500',
    safe: 'bg-emerald-500',
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dotStyles[tone]}`} />
        <h4 className="text-sm font-semibold text-ink">
          {title}
        </h4>
      </div>

      {!items || items.length === 0 ? (
        <p className="text-xs text-ink-soft">
          No features available.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.slice(0, 10).map((item) => (
            <span
              key={item}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${tagStyles[tone]}`}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function ExplanationCard({ number, title, description }) {
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
