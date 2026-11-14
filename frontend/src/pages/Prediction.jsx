
import { useState, useMemo } from 'react'
import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import { StateBlock } from '../components/StateBlock'
import { RiskBadge } from '../components/RiskBadge'

const NUMERIC_FIELDS = {
  age: { label: 'Age (years)', min: 0, max: 120 },
  bmi: { label: 'BMI', min: 10, max: 80, step: 0.1 },
}

const MODEL_A_NUMERIC_FIELDS = {
  days_hospitalized: { label: 'Days hospitalized', min: 0, max: 365 },
  treatment_cost_inr: { label: 'Treatment cost (INR)', min: 1 },
}

const FIELD_GROUPS = [
  {
    title: 'Demographics',
    description: 'Basic patient information and location details.',
    fields: ['gender', 'state', 'region', 'urban_rural'],
  },
  {
    title: 'Clinical profile',
    description: 'Patient health conditions and medical background.',
    fields: [
      'disease_name',
      'severity',
      'comorbidity',
      'smoking_status',
      'alcohol_use',
      'blood_group',
    ],
  },
  {
    title: 'Access and care setting',
    description: 'Healthcare access and patient coverage information.',
    fields: ['income_level', 'insurance_status', 'hospital_type'],
  },
]

const MODEL_A_CATEGORICAL_GROUP = {
  title: 'Treatment course',
  description: 'Additional treatment information used by Model A.',
  fields: ['treatment_type'],
}

const FIELD_LABELS = {
  gender: 'Gender',
  state: 'State',
  region: 'Region',
  urban_rural: 'Urban / rural',
  disease_name: 'Diagnosed disease',
  severity: 'Severity',
  comorbidity: 'Comorbidity',
  smoking_status: 'Smoking status',
  alcohol_use: 'Alcohol use',
  blood_group: 'Blood group',
  income_level: 'Income level',
  insurance_status: 'Insurance status',
  hospital_type: 'Hospital type',
  treatment_type: 'Treatment type',
}

function emptyFormState(withModelA) {
  const state = { age: '', bmi: '' }

  for (const group of FIELD_GROUPS) {
    for (const field of group.fields) state[field] = ''
  }

  if (withModelA) {
    state.days_hospitalized = ''
    state.treatment_cost_inr = ''
    state.treatment_type = ''
  }

  return state
}

export default function Prediction() {
  const [modelKey, setModelKey] = useState('model_b')
  const isModelA = modelKey === 'model_a'

  const categories = useApi(api.getValidCategories, [])
  const symptomsList = useApi(api.getTrackedSymptoms, [])

  const [form, setForm] = useState(() => emptyFormState(false))
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [clientErrors, setClientErrors] = useState([])
  const [result, setResult] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const requiredFields = useMemo(() => {
    const fields = ['age', 'bmi', ...FIELD_GROUPS.flatMap((g) => g.fields)]

    if (isModelA) {
      fields.push('days_hospitalized', 'treatment_cost_inr', 'treatment_type')
    }

    return fields
  }, [isModelA])

  function switchModel(nextKey) {
    setModelKey(nextKey)
    setForm(emptyFormState(nextKey === 'model_a'))
    setSelectedSymptoms([])
    setResult(null)
    setSubmitError(null)
    setClientErrors([])
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleSymptom(symptom) {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    )
  }

  function validateClientSide() {
    const errors = []

    for (const field of requiredFields) {
      if (
        form[field] === '' ||
        form[field] === null ||
        form[field] === undefined
      ) {
        errors.push(`${FIELD_LABELS[field] || NUMERIC_FIELDS[field]?.label || MODEL_A_NUMERIC_FIELDS[field]?.label || field} is required.`)
      }
    }

    const age = Number(form.age)
    if (form.age !== '' && (age < 0 || age > 120)) {
      errors.push('Age must be between 0 and 120.')
    }

    const bmi = Number(form.bmi)
    if (form.bmi !== '' && (bmi < 10 || bmi > 80)) {
      errors.push('BMI must be between 10 and 80.')
    }

    if (isModelA) {
      const cost = Number(form.treatment_cost_inr)
      if (form.treatment_cost_inr !== '' && cost <= 0) {
        errors.push('Treatment cost must be positive.')
      }
    }

    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setResult(null)
    setSubmitError(null)

    const errors = validateClientSide()
    setClientErrors(errors)

    if (errors.length > 0) return

    const payload = {
      ...form,
      age: Number(form.age),
      bmi: Number(form.bmi),
      symptoms: selectedSymptoms.join(', '),
    }

    if (isModelA) {
      payload.days_hospitalized = Number(form.days_hospitalized)
      payload.treatment_cost_inr = Number(form.treatment_cost_inr)
    }

    setSubmitting(true)

    try {
      const response = isModelA
        ? await api.predictModelA(payload)
        : await api.predictModelB(payload)

      setResult(response)
    } catch (err) {
      setSubmitError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">

      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 p-7 md:p-9 text-white shadow-lg">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[30px] border-white/5" />
        <div className="absolute -right-5 -bottom-32 h-72 w-72 rounded-full border-[30px] border-white/5" />

        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
            Healthcare Analytics
          </p>

          <h2 className="mt-3 text-2xl font-bold md:text-3xl">
            Patient Risk Prediction
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100 md:text-base">
            Enter patient information and use machine learning models
            to generate a statistical mortality risk estimate.
          </p>

          <div className="mt-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-blue-100">
            Patient Assessment • Machine Learning • Risk Analysis
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-ink">Select prediction model</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Choose the model according to the patient information available.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ModelOption
            active={modelKey === 'model_b'}
            title="Model B"
            subtitle="Early-risk prediction"
            description="Uses information available at or near diagnosis. Suitable for an early risk estimate."
            tag="Admission-time data"
            onClick={() => switchModel('model_b')}
          />

          <ModelOption
            active={modelKey === 'model_a'}
            title="Model A"
            subtitle="Full clinical-course prediction"
            description="Uses additional treatment-course information, including hospital stay and treatment cost."
            tag="Full clinical-course data"
            onClick={() => switchModel('model_a')}
          />
        </div>
      </section>

      {/* Prediction Form */}
      <StateBlock
        loading={categories.loading || symptomsList.loading}
        error={categories.error || symptomsList.error}
        onRetry={() => {
          categories.reload()
          symptomsList.reload()
        }}
      >
        {categories.data && symptomsList.data && (
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

              {/* Form Fields */}
              <div className="space-y-6 xl:col-span-2">

                <div className="rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
                  <SectionHeading
                    number="01"
                    title="Basic measurements"
                    description="Enter the patient's age and body measurements."
                  />

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <NumberInput
                      field="age"
                      config={NUMERIC_FIELDS.age}
                      value={form.age}
                      onChange={updateField}
                    />

                    <NumberInput
                      field="bmi"
                      config={NUMERIC_FIELDS.bmi}
                      value={form.bmi}
                      onChange={updateField}
                    />
                  </div>
                </div>

                {FIELD_GROUPS.map((group, index) => (
                  <div
                    key={group.title}
                    className="rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6"
                  >
                    <SectionHeading
                      number={String(index + 2).padStart(2, '0')}
                      title={group.title}
                      description={group.description}
                    />

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {group.fields.map((field) => (
                        <SelectInput
                          key={field}
                          field={field}
                          options={categories.data[field] || []}
                          value={form[field]}
                          onChange={updateField}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {isModelA && (
                  <>
                    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
                      <SectionHeading
                        number="05"
                        title="Admission and treatment cost"
                        description="Additional clinical-course information required by Model A."
                      />

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <NumberInput
                          field="days_hospitalized"
                          config={MODEL_A_NUMERIC_FIELDS.days_hospitalized}
                          value={form.days_hospitalized}
                          onChange={updateField}
                        />

                        <NumberInput
                          field="treatment_cost_inr"
                          config={MODEL_A_NUMERIC_FIELDS.treatment_cost_inr}
                          value={form.treatment_cost_inr}
                          onChange={updateField}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
                      <SectionHeading
                        number="06"
                        title={MODEL_A_CATEGORICAL_GROUP.title}
                        description={MODEL_A_CATEGORICAL_GROUP.description}
                      />

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        {MODEL_A_CATEGORICAL_GROUP.fields.map((field) => (
                          <SelectInput
                            key={field}
                            field={field}
                            options={categories.data[field] || []}
                            value={form[field]}
                            onChange={updateField}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Symptoms */}
                <div className="rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
                  <SectionHeading
                    number={isModelA ? '07' : '05'}
                    title="Patient symptoms"
                    description="Select all symptoms reported by the patient. This section is optional."
                  />

                  <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {symptomsList.data.symptoms.map((symptom) => {
                      const checked = selectedSymptoms.includes(symptom)

                      return (
                        <label
                          key={symptom}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 text-sm transition-all ${
                            checked
                              ? 'border-blue-500 bg-blue-50 text-blue-800'
                              : 'border-line bg-white text-ink-soft hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSymptom(symptom)}
                            className="h-4 w-4 accent-blue-600"
                          />
                          <span>{symptom}</span>
                        </label>
                      )
                    })}
                  </div>

                  <p className="mt-4 text-xs text-ink-soft">
                    {selectedSymptoms.length} symptom(s) selected
                  </p>
                </div>

                {/* Validation Errors */}
                {clientErrors.length > 0 && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-800">
                      Please check the following fields:
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                      {clientErrors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Submit */}
                <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-ink">Ready to analyze?</p>
                      <p className="mt-1 text-xs text-ink-soft">
                        Review the entered information before generating a prediction.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-7 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? 'Calculating...' : 'Calculate risk'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Result Panel */}
              <div className="xl:col-span-1">
                <ResultPanel
                  result={result}
                  error={submitError}
                  submitting={submitting}
                />
              </div>
            </div>
          </form>
        )}
      </StateBlock>

      {/* Disclaimer */}
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
    </div>
  )
}

function ModelOption({
  active,
  title,
  subtitle,
  description,
  tag,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border p-5 text-left transition-all ${
        active
          ? 'border-blue-600 bg-blue-50 shadow-md ring-1 ring-blue-500'
          : 'border-line bg-white shadow-sm hover:border-blue-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-lg font-bold ${active ? 'text-blue-800' : 'text-ink'}`}>
            {title}
          </p>
          <p className="mt-1 text-sm font-medium text-ink-soft">{subtitle}</p>
        </div>

        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
            active
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-slate-300 text-transparent'
          }`}
        >
          ✓
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        {description}
      </p>

      <span
        className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
          active
            ? 'bg-blue-100 text-blue-800'
            : 'bg-slate-100 text-slate-600'
        }`}
      >
        {tag}
      </span>
    </button>
  )
}

function SectionHeading({ number, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">
        {number}
      </span>

      <div>
        <h3 className="font-bold text-ink">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-soft">
          {description}
        </p>
      </div>
    </div>
  )
}

function NumberInput({ field, config, value, onChange }) {
  return (
    <label className="block text-sm font-medium text-ink">
      {config.label}
      <input
        type="number"
        min={config.min}
        max={config.max}
        step={config.step || 1}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={`Enter ${config.label.toLowerCase()}`}
        className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-ink outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  )
}

function SelectInput({ field, options, value, onChange }) {
  return (
    <label className="block text-sm font-medium text-ink">
      {FIELD_LABELS[field] || field}
      <select
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-ink outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">Select an option...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function ResultPanel({ result, error, submitting }) {
  if (submitting) {
    return (
      <div className="sticky top-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
        <p className="mt-4 font-semibold text-blue-900">Analyzing patient data</p>
        <p className="mt-1 text-xs text-blue-700">
          Please wait while the model generates its prediction.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="sticky top-6 rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="font-semibold text-red-800">Prediction failed</p>
        <p className="mt-2 text-sm leading-relaxed text-red-700">
          {error.message || 'Something went wrong. Please try again.'}
        </p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="sticky top-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-700">
          +
        </div>

        <h3 className="mt-4 font-bold text-ink">Prediction results</h3>

        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Complete the patient information and calculate risk. Your prediction
          results will appear here.
        </p>

        <div className="mt-6 space-y-3 text-left">
          {['Mortality probability', 'Risk classification', 'Contributing factors'].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-lg border border-line bg-white px-3 py-3"
            >
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-xs text-ink-soft">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const probability = Math.min(
    100,
    Math.max(0, Number(result.probability_of_death) * 100)
  )

  return (
    <div className="sticky top-6 overflow-hidden rounded-2xl border border-line bg-white shadow-md">
      <div className="bg-gradient-to-r from-slate-950 to-blue-800 p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
          Prediction complete
        </p>
        <h3 className="mt-2 text-xl font-bold">Risk assessment</h3>
        <p className="mt-1 text-xs text-blue-100">
          Statistical model output
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <p className="text-sm font-medium text-ink-soft">
            Predicted mortality probability
          </p>

          <p className="mt-2 text-4xl font-bold tracking-tight text-ink">
            {probability.toFixed(1)}%
          </p>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-700"
              style={{ width: `${probability}%` }}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-ink-soft">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-slate-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Risk classification
          </p>
          <RiskBadge category={result.risk_category} />
        </div>

        <div className="space-y-3">
          <ResultDetail
            label="Prediction"
            value={result.predicted_label}
          />
          <ResultDetail
            label="Decision threshold"
            value={result.threshold}
          />
          <ResultDetail
            label="Algorithm"
            value={result.algorithm.replaceAll('_', ' ')}
          />
        </div>

        {result.top_contributing_factors?.length > 0 && (
          <div className="border-t border-line pt-4">
            <h4 className="text-sm font-bold text-ink">
              Top contributing factors
            </h4>

            <div className="mt-3 space-y-3">
              {result.top_contributing_factors.map((factor) => (
                <div
                  key={factor.feature}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm capitalize text-ink-soft">
                    {factor.feature.replaceAll('_', ' ')}
                  </span>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      factor.direction === 'increases risk'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {factor.direction === 'increases risk'
                      ? '↑ Increases'
                      : '↓ Decreases'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.input_warnings?.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-900">
              Input warnings
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-800">
              {result.input_warnings.join(' ')}
            </p>
          </div>
        )}

        <div className="border-t border-line pt-4">
          <p className="text-xs leading-relaxed text-ink-soft">
            {result.disclaimer}
          </p>
        </div>
      </div>
    </div>
  )
}

function ResultDetail({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className="text-right font-semibold capitalize text-ink">
        {String(value)}
      </span>
    </div>
  )
}
