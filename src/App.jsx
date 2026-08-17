import { useState } from 'react'
import { Home, UtensilsCrossed, Landmark } from 'lucide-react'
import './App.css'
import { pages, scaleOptions } from './questions'
import { supabase } from './supabaseClient'
import LandingPage from './LandingPage'

// One icon per survey page, shown next to the section title so the
// visual language started on the landing page carries through.
const pageIcons = [Home, UtensilsCrossed, Landmark, Landmark]

function App() {
  const [started, setStarted] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState({})
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  // Controls the fade/slide direction of the page transition.
  const [direction, setDirection] = useState('forward')

  const totalPages = pages.length
  const page = pages[currentPage]
  const PageIcon = pageIcons[currentPage] || Home

  function handleChange(name, value) {
    setAnswers(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: null }))
  }

  function validatePage() {
    const newErrors = {}
    let valid = true
    page.fields.forEach(field => {
      const value = answers[field.name]
      const isRequired = field.type !== 'textarea'
      if (isRequired && (value === undefined || value === '')) {
        newErrors[field.name] = 'This field is required'
        valid = false
      }
    })
    setErrors(newErrors)
    return valid
  }

  function goNext() {
    if (!validatePage()) return
    if (currentPage < totalPages - 1) {
      setDirection('forward')
      setCurrentPage(currentPage + 1)
      window.scrollTo(0, 0)
    } else {
      handleSubmit()
    }
  }

  function goBack() {
    if (currentPage > 0) {
      setDirection('back')
      setCurrentPage(currentPage - 1)
      window.scrollTo(0, 0)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    const { error } = await supabase.from('responses').insert([answers])
    setSubmitting(false)
    if (error) {
      alert('Something went wrong submitting your response. Please try again.')
      console.error(error)
      return
    }
    setDone(true)
  }

  if (!started) {
    return <LandingPage onStart={() => setStarted(true)} />
  }

  if (done) {
    return (
      <div className="survey-container">
        <div className="congrats">
          <h1>Thank you!</h1>
          <p>Your response has been recorded. We appreciate you taking the time to complete this survey.</p>
        </div>
      </div>
    )
  }

  const progressPercent = Math.round(((currentPage + 1) / totalPages) * 100)

  return (
    <div className="survey-container">
      <div className="survey-header">
        <p className="eyebrow">Campus Cost of Living Index</p>
        <div className="header-title-row">
          <PageIcon size={18} strokeWidth={1.75} color="#FFFFFF" />
          <h1>{page.title}</h1>
        </div>
      </div>

      <div className="progress-wrap">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="progress-label">Page {currentPage + 1} of {totalPages}</p>
      </div>

      {/* key={currentPage} forces React to remount this div on every
          page change, which re-triggers the CSS animation below --
          that's what produces the slide/fade transition. */}
      <div className="survey-body" key={currentPage} data-direction={direction}>
        {page.fields.map(field => (
          <FieldRenderer
            key={field.name}
            field={field}
            value={answers[field.name]}
            error={errors[field.name]}
            onChange={handleChange}
          />
        ))}
      </div>

      <div className="nav-buttons nav-buttons-sticky">
        {currentPage > 0 ? (
          <button className="btn-back" onClick={goBack}>Back</button>
        ) : <span />}
        <button className="btn-next" onClick={goNext} disabled={submitting}>
          {submitting ? 'Submitting...' : currentPage === totalPages - 1 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  )
}

function FieldRenderer({ field, value, error, onChange }) {
  return (
    <div className="field">
      <label className="question">{field.label}</label>

      {field.type === 'text' && (
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(field.name, e.target.value)}
        />
      )}

      {field.type === 'number' && (
        <input
          type="number"
          inputMode="numeric"
          value={value || ''}
          onChange={e => onChange(field.name, e.target.value)}
          placeholder={field.prefix ? `${field.prefix}0` : ''}
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          value={value || ''}
          onChange={e => onChange(field.name, e.target.value)}
        />
      )}

      {field.type === 'radio' && (
        <div className="option-list">
          {field.options.map(opt => (
            <label key={opt} className={`option ${value === opt ? 'selected' : ''}`}>
              <input
                type="radio"
                name={field.name}
                checked={value === opt}
                onChange={() => onChange(field.name, opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      )}

      {field.type === 'scale' && (
        <div className="option-list">
          {scaleOptions[field.scaleType].map(opt => (
            <label key={opt} className={`option ${value === opt ? 'selected' : ''}`}>
              <input
                type="radio"
                name={field.name}
                checked={value === opt}
                onChange={() => onChange(field.name, opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
    </div>
  )
}

export default App