import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { Home, UtensilsCrossed, Landmark, ListChecks, Search } from 'lucide-react'
import './App.css'
import { supabase } from './supabaseClient'
import LandingPage from './LandingPage'

// One icon per survey page, shown next to the section title so the
// visual language started on the landing page carries through.
// TESTING TOGGLE: while false, the app never talks to Supabase --
// no insert, no duplicate-check RPC, no IP/fingerprint lookups. Lets
// the team freely resubmit while reviewing the frontend. Flip to
// true once you're ready to connect the backend for real.
const SUBMISSIONS_ENABLED = false

const pageIcons = [Home, UtensilsCrossed, Landmark, ListChecks]

function Survey() {
  const [started, setStarted] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState({})
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  // Controls the fade/slide direction of the page transition.
  const [direction, setDirection] = useState('forward')

  // The question set now lives in Supabase (survey_questions +
  // scale_options) instead of the static questions.js file, so the
  // admin dashboard can add/edit questions without a code deploy.
  const [pages, setPages] = useState([])
  const [scaleOptions, setScaleOptions] = useState({})
  const [questionsLoading, setQuestionsLoading] = useState(true)
  const [questionsError, setQuestionsError] = useState(null)

  useEffect(() => {
    async function loadQuestions() {
      const [questionsRes, scaleRes] = await Promise.all([
        supabase
          .from('survey_questions')
          .select('*')
          .order('page_index', { ascending: true })
          .order('order_index', { ascending: true }),
        supabase.from('scale_options').select('*'),
      ])

      if (questionsRes.error || scaleRes.error) {
        setQuestionsError(
          questionsRes.error?.message || scaleRes.error?.message || 'Failed to load survey'
        )
        setQuestionsLoading(false)
        return
      }

      // Rebuild the scaleOptions lookup: { yesno: ["Yes","No"], ... }
      const scaleMap = {}
      for (const row of scaleRes.data) {
        scaleMap[row.key] = row.options
      }
      setScaleOptions(scaleMap)

      // Group flat question rows back into { title, fields: [...] } pages,
      // converting snake_case DB columns back to the camelCase shape
      // FieldRenderer expects.
      const pageMap = new Map()
      for (const row of questionsRes.data) {
        if (!pageMap.has(row.page_index)) {
          pageMap.set(row.page_index, { title: row.page_title, fields: [] })
        }
        pageMap.get(row.page_index).fields.push({
          name: row.name,
          label: row.label,
          type: row.type,
          options: row.options || undefined,
          groupedOptions: row.grouped_options || undefined,
          scaleType: row.scale_type || undefined,
          placeholder: row.placeholder || undefined,
          helperText: row.helper_text || undefined,
          prefix: row.prefix || undefined,
          remoteGrowth: row.remote_growth || false,
        })
      }
      const sortedPages = [...pageMap.keys()]
        .sort((a, b) => a - b)
        .map(key => pageMap.get(key))

      setPages(sortedPages)
      setQuestionsLoading(false)
    }

    loadQuestions()
  }, [])

  // Identity signals used to discourage duplicate submissions.
  // Neither is required for the form to work -- if either fetch/generation
  // fails, we still let the person submit rather than block them.
  const [ipAddress, setIpAddress] = useState(null)
  const [deviceId, setDeviceId] = useState(null)
  // Whether this browser/device has already submitted, per localStorage
  // or the server-side check. null = still checking, true/false = known.
  const [alreadySubmitted, setAlreadySubmitted] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!SUBMISSIONS_ENABLED) {
        // Testing mode -- skip all Supabase checks, never block resubmission.
        if (!cancelled) setAlreadySubmitted(false)
        return
      }

      // Admin bypass: if you're signed in (e.g. logged into /admin in this
      // same browser), skip the duplicate-submission check entirely so you
      // can test the survey as many times as you need to.
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session) {
        if (!cancelled) setAlreadySubmitted(false)
        return
      }

      if (localStorage.getItem('ccli_submitted') === 'true') {
        if (!cancelled) setAlreadySubmitted(true)
        return
      }

      const [fingerprintResult, ip] = await Promise.all([
        FingerprintJS.load().then(fp => fp.get()).catch(() => null),
        fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(data => data.ip)
          .catch(() => null),
      ])

      if (cancelled) return

      const currentDeviceId = fingerprintResult?.visitorId ?? null
      setDeviceId(currentDeviceId)
      setIpAddress(ip)

      if (currentDeviceId) {
        const { data: submitted, error } = await supabase
          .rpc('has_device_submitted', { check_device_id: currentDeviceId })

        if (cancelled) return

        if (!error && submitted) {
          localStorage.setItem('ccli_submitted', 'true')
          setAlreadySubmitted(true)
          return
        }
      }

      setAlreadySubmitted(false)
    }

    init()
    return () => { cancelled = true }
  }, [])

  const totalPages = pages.length
  const page = pages[currentPage]
  const PageIcon = pageIcons[currentPage] || Home

  function handleChange(name, value) {
    setAnswers(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: null }))
  }

  // Checkboxes store an array of selected option strings per field.
  // Toggles one option in/out of that array.
  function handleCheckboxToggle(name, option) {
    setAnswers(prev => {
      const current = prev[name] || []
      const next = current.includes(option)
        ? current.filter(item => item !== option)
        : [...current, option]
      return { ...prev, [name]: next }
    })
    setErrors(prev => ({ ...prev, [name]: null }))
  }

  function validatePage() {
    const newErrors = {}
    let valid = true
    page.fields.forEach(field => {
      const value = answers[field.name]
      // Optional fields: free-text notes, and the conditional daily-cost
      // question (only relevant if the person answered "Yes" above).
      const isOptional =
        field.type === 'textarea' || field.name === 'shuttle_keke_bike_daily_cost'
      if (isOptional) return

      if (field.type === 'checkbox') {
        if (!value || value.length === 0) {
          newErrors[field.name] = 'Please select at least one option'
          valid = false
        }
        return
      }

      if (value === undefined || value === '') {
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

    if (!SUBMISSIONS_ENABLED) {
      // Testing mode -- skip the real insert, just show the thank-you screen.
      await new Promise(resolve => setTimeout(resolve, 400))
      setSubmitting(false)
      setDone(true)
      return
    }

    const { error } = await supabase
      .from('responses')
      .insert([{ ...answers, ip_address: ipAddress, device_id: deviceId }])
    setSubmitting(false)
    if (error) {
      alert('Something went wrong submitting your response. Please try again.')
      console.error(error)
      return
    }
    localStorage.setItem('ccli_submitted', 'true')
    setDone(true)
  }

  // Still checking local/server state -- render nothing rather than
  // flashing the landing page and immediately swapping it out.
  if (alreadySubmitted === null) {
    return null
  }

  if (alreadySubmitted && !done) {
    return (
      <div className="survey-container">
        <div className="congrats">
          <h1>You've already responded</h1>
          <p>Thanks for taking part — this survey only accepts one response per person.</p>
        </div>
      </div>
    )
  }

  if (!started) {
    return <LandingPage onStart={() => setStarted(true)} />
  }

  // Questions are fetched from Supabase now -- guard against rendering
  // the form before they've loaded, or if the fetch failed.
  if (questionsLoading) {
    return (
      <div className="survey-container">
        <div className="congrats">
          <p>Loading survey…</p>
        </div>
      </div>
    )
  }

  if (questionsError) {
    return (
      <div className="survey-container">
        <div className="congrats">
          <h1>Something went wrong</h1>
          <p>We couldn't load the survey. Please refresh the page and try again.</p>
        </div>
      </div>
    )
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

      <div className="survey-body" key={currentPage} data-direction={direction}>
        {page.fields.map(field => (
          <FieldRenderer
            key={field.name}
            field={field}
            value={answers[field.name]}
            error={errors[field.name]}
            onChange={handleChange}
            onCheckboxToggle={handleCheckboxToggle}
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

function FieldRenderer({ field, value, error, onChange, onCheckboxToggle }) {
  return (
    <div className="field">
      <label className="question">{field.label}</label>
      {field.helperText && <p className="helper-text">{field.helperText}</p>}

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

      {field.type === 'select' && (
        <select
          className="select-field"
          value={value || ''}
          onChange={e => onChange(field.name, e.target.value)}
        >
          <option value="" disabled>
            {field.placeholder || 'Select an option'}
          </option>
          {field.groupedOptions
            ? Object.entries(field.groupedOptions).map(([group, opts]) => (
                <optgroup key={group} label={group}>
                  {opts.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </optgroup>
              ))
            : field.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
        </select>
      )}

      {field.type === 'combobox' && (
        <SearchableCombobox field={field} value={value} onChange={onChange} />
      )}

      {field.type === 'checkbox' && (
        <div className="option-list">
          {field.groupedOptions
            ? Object.entries(field.groupedOptions).map(([group, opts]) => (
                <div key={group} className="checkbox-group">
                  <p className="checkbox-group-label">{group}</p>
                  {opts.map(opt => {
                    const selected = (value || []).includes(opt)
                    return (
                      <label key={opt} className={`option ${selected ? 'selected' : ''}`}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => onCheckboxToggle(field.name, opt)}
                        />
                        {opt}
                      </label>
                    )
                  })}
                </div>
              ))
            : field.options.map(opt => {
                const selected = (value || []).includes(opt)
                return (
                  <label key={opt} className={`option ${selected ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onCheckboxToggle(field.name, opt)}
                    />
                    {opt}
                  </label>
                )
              })}
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
    </div>
  )
}

function SearchableCombobox({ field, value, onChange }) {
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const [remoteOptions, setRemoteOptions] = useState([])
  const inputRef = useRef(null)

  // Keep the input text in sync if the value changes from outside
  // (e.g. navigating back to this page after already answering it).
  useEffect(() => {
    setQuery(value || '')
  }, [value])

  // For fields marked remoteGrowth (university, course), pull in any
  // values other students have already added manually, so this field's
  // list grows over time instead of resetting for every new respondent.
  useEffect(() => {
    if (!field.remoteGrowth) return
    let cancelled = false

    async function loadRemoteOptions() {
      const { data, error } = await supabase
        .from('custom_options')
        .select('value')
        .eq('field_name', field.name)

      if (!cancelled && !error && data) {
        setRemoteOptions(data.map(row => row.value))
      }
    }

    loadRemoteOptions()
    return () => { cancelled = true }
  }, [field.remoteGrowth, field.name])

  function updateCoords() {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setCoords({ top: rect.bottom + 6, left: rect.left, width: rect.width })
    }
  }

  // Reposition if the page scrolls or resizes while the dropdown is open,
  // since it's now rendered outside the normal document flow (in a portal)
  // and won't move automatically with its "visual" parent.
  useEffect(() => {
    if (!open) return
    function reposition() {
      updateCoords()
    }
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open])

  const flatOptions = useMemo(() => {
    const base = field.groupedOptions
      ? Object.entries(field.groupedOptions).flatMap(([group, opts]) =>
          opts.map(opt => ({ label: opt, group }))
        )
      : (field.options || []).map(opt => ({ label: opt, group: null }))

    // Merge in remotely-added values that aren't already in the static
    // list, so a school/course only shows up once even if it was later
    // added to the static file too.
    const staticLabelsLower = new Set(base.map(o => o.label.toLowerCase()))
    const extra = remoteOptions
      .filter(val => !staticLabelsLower.has(val.toLowerCase()))
      .map(val => ({ label: val, group: 'Recently added by other students' }))

    return [...base, ...extra]
  }, [field.groupedOptions, field.options, remoteOptions])

  const trimmedQuery = query.trim()
  const filtered = trimmedQuery
    ? flatOptions.filter(o => o.label.toLowerCase().includes(trimmedQuery.toLowerCase())).slice(0, 8)
    : flatOptions.slice(0, 8)

  // Only offer "add manually" when the typed text isn't already an
  // exact match for something in the list.
  const exactMatch = flatOptions.some(
    o => o.label.toLowerCase() === trimmedQuery.toLowerCase()
  )

  function selectOption(label) {
    onChange(field.name, label)
    setQuery(label)
    setOpen(false)
  }

  function selectManual() {
    if (!trimmedQuery) return
    onChange(field.name, trimmedQuery)
    setOpen(false)

    // Save this new value so future students see it in the list too.
    // Fire-and-forget: never blocks the person from continuing the
    // survey, and a duplicate (someone already added the same value)
    // is expected and safely ignored via the unique constraint.
    if (field.remoteGrowth && SUBMISSIONS_ENABLED) {
      supabase
        .from('custom_options')
        .insert([{ field_name: field.name, value: trimmedQuery }])
        .then(({ error }) => {
          if (error && error.code !== '23505') {
            // 23505 = unique_violation (already added by someone else) -- fine to ignore.
            console.error('Could not save new option:', error)
          }
        })
    }
  }

  const dropdown = (
    <div
      className="combobox-dropdown combobox-dropdown-portal"
      style={{ top: coords.top, left: coords.left, width: coords.width }}
    >
      {trimmedQuery && !exactMatch && (
        <div className="combobox-option combobox-option-manual" onMouseDown={selectManual}>
          Use "{trimmedQuery}" (add manually)
        </div>
      )}
      {filtered.map(opt => (
        <div
          key={opt.label}
          className="combobox-option"
          onMouseDown={() => selectOption(opt.label)}
        >
          {opt.label}
        </div>
      ))}
      {filtered.length === 0 && !trimmedQuery && (
        <div className="combobox-empty">Start typing to search</div>
      )}
    </div>
  )

  return (
    <div className="combobox">
      <div className="combobox-input-wrap">
        <Search size={16} className="combobox-icon" />
        <input
          ref={inputRef}
          type="text"
          className="combobox-input"
          placeholder={field.placeholder || 'Search...'}
          value={query}
          onFocus={() => {
            updateCoords()
            setOpen(true)
          }}
          onChange={e => {
            setQuery(e.target.value)
            updateCoords()
            setOpen(true)
          }}
          // Delay closing so a click/tap on a dropdown option registers
          // before the input's blur event would otherwise hide the list.
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
      </div>

      {open && createPortal(dropdown, document.body)}
    </div>
  )
}

export default Survey