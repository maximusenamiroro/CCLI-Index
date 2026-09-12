import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './Admin.css'

// Friendly descriptions shown in the type picker and in each question's
// summary, so a non-technical admin understands what each type does.
const TYPE_INFO = {
  text: { label: 'Short text', hint: 'A single-line box for a short typed answer (e.g. a name).' },
  number: { label: 'Number', hint: 'A box that only accepts numbers.' },
  radio: { label: 'Multiple choice (pick one)', hint: 'A list of buttons; the student picks exactly one.' },
  checkbox: { label: 'Multiple choice (pick many)', hint: 'A list of checkboxes; the student can pick several.' },
  scale: { label: 'Scale (Yes/No or rating)', hint: 'A pick-one question using a shared, reusable answer set (like Yes/No, or a 1-5 rating).' },
  textarea: { label: 'Long text', hint: 'A bigger box for a paragraph-style answer.' },
  select: { label: 'Dropdown', hint: 'A standard dropdown menu the student picks one item from.' },
  combobox: { label: 'Searchable dropdown', hint: 'A search box with live suggestions -- best for very long lists (e.g. university names).' },
}

const FIELD_TYPES = Object.keys(TYPE_INFO)
const NEEDS_OPTIONS = ['radio', 'checkbox', 'select']

function emptyQuestion(pageIndex, pageTitle, orderIndex) {
  return {
    page_index: pageIndex,
    page_title: pageTitle,
    order_index: orderIndex,
    name: '',
    label: '',
    type: 'text',
    options: null,
    grouped_options: null,
    scale_type: null,
    placeholder: null,
    helper_text: null,
    prefix: null,
    remote_growth: false,
  }
}

// Converts a { "Group A": ["x","y"], "Group B": ["z"] } object into the
// editable list-of-groups shape the editor UI works with, and back again.
function groupedOptionsToList(grouped) {
  if (!grouped) return []
  return Object.entries(grouped).map(([group, opts]) => ({
    group,
    optionsText: opts.join('\n'),
  }))
}

function listToGroupedOptions(list) {
  const result = {}
  for (const g of list) {
    const groupName = g.group.trim()
    const opts = g.optionsText.split('\n').map(s => s.trim()).filter(Boolean)
    if (groupName && opts.length > 0) {
      result[groupName] = opts
    }
  }
  return Object.keys(result).length > 0 ? result : null
}

function AdminQuestions() {
  const [questions, setQuestions] = useState([])
  const [scaleOptionsMap, setScaleOptionsMap] = useState({}) // key -> options array, for showing real values
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null) // null = none, 'new' = creating, or a question id
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    const [qRes, sRes] = await Promise.all([
      supabase.from('survey_questions').select('*').order('page_index').order('order_index'),
      supabase.from('scale_options').select('*'),
    ])
    setLoading(false)
    if (qRes.error) {
      setError(qRes.error.message)
      return
    }
    setQuestions(qRes.data || [])
    const map = {}
    for (const row of sRes.data || []) map[row.key] = row.options
    setScaleOptionsMap(map)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const pageGroups = []
  const seenPages = new Map()
  for (const q of questions) {
    if (!seenPages.has(q.page_index)) {
      seenPages.set(q.page_index, { page_index: q.page_index, page_title: q.page_title, items: [] })
      pageGroups.push(seenPages.get(q.page_index))
    }
    seenPages.get(q.page_index).items.push(q)
  }

  function startEdit(question) {
    setDraft({
      ...question,
      optionsText: (question.options || []).join('\n'),
      groupedList: groupedOptionsToList(question.grouped_options),
    })
    setEditingId(question.id)
  }

  function startNew() {
    const lastPage = pageGroups[pageGroups.length - 1]
    const pageIndex = lastPage ? lastPage.page_index : 0
    const pageTitle = lastPage ? lastPage.page_title : 'New page'
    const orderIndex = lastPage ? lastPage.items.length : 0
    setDraft({ ...emptyQuestion(pageIndex, pageTitle, orderIndex), optionsText: '', groupedList: [] })
    setEditingId('new')
  }

  function cancelEdit() {
    setEditingId(null)
    setDraft(null)
  }

  function updateDraft(field, value) {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  function addGroup() {
    setDraft(prev => ({ ...prev, groupedList: [...prev.groupedList, { group: '', optionsText: '' }] }))
  }

  function updateGroup(index, field, value) {
    setDraft(prev => {
      const next = [...prev.groupedList]
      next[index] = { ...next[index], [field]: value }
      return { ...prev, groupedList: next }
    })
  }

  function removeGroup(index) {
    setDraft(prev => ({ ...prev, groupedList: prev.groupedList.filter((_, i) => i !== index) }))
  }

  async function saveDraft() {
    if (!draft.name.trim() || !draft.label.trim()) {
      alert('Every question needs a field name and a question label.')
      return
    }

    setSaving(true)

    const usesGroupedOptions = draft.type === 'select' || draft.type === 'combobox'

    const payload = {
      page_index: Number(draft.page_index),
      page_title: draft.page_title,
      order_index: Number(draft.order_index),
      name: draft.name.trim(),
      label: draft.label.trim(),
      type: draft.type,
      options: NEEDS_OPTIONS.includes(draft.type)
        ? draft.optionsText.split('\n').map(s => s.trim()).filter(Boolean)
        : null,
      grouped_options: usesGroupedOptions ? listToGroupedOptions(draft.groupedList) : null,
      scale_type: draft.type === 'scale' ? draft.scale_type : null,
      placeholder: draft.placeholder || null,
      helper_text: draft.helper_text || null,
      prefix: draft.prefix || null,
      remote_growth: draft.type === 'combobox' ? !!draft.remote_growth : false,
    }

    let saveError
    if (editingId === 'new') {
      const { error } = await supabase.from('survey_questions').insert([payload])
      saveError = error
    } else {
      const { error } = await supabase.from('survey_questions').update(payload).eq('id', editingId)
      saveError = error
    }

    setSaving(false)
    if (saveError) {
      alert('Could not save: ' + saveError.message)
      return
    }

    setEditingId(null)
    setDraft(null)
    loadAll()
  }

  async function deleteQuestion(id, label) {
    if (!confirm(`Delete "${label}"? This can't be undone, and it will stop appearing on the live survey immediately.`)) return
    const { error } = await supabase.from('survey_questions').delete().eq('id', id)
    if (error) {
      alert('Could not delete: ' + error.message)
      return
    }
    loadAll()
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">CCLI Admin</p>
          <h1>Survey questions</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/admin" className="admin-btn-secondary">View responses</Link>
          <button className="admin-btn-secondary" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <p className="admin-intro">
        This page controls every question on the live survey. Click <strong>Edit</strong> on any
        question to change its wording, answer choices, or type. Click <strong>+ New question</strong> to
        add one. Every change here takes effect immediately on the public survey — no code changes
        or redeploy needed.
      </p>

      <div className="admin-toolbar">
        <button className="admin-btn-primary" onClick={startNew}>+ New question</button>
      </div>

      {loading && <p className="admin-status">Loading…</p>}
      {error && <p className="admin-status admin-error">Error: {error}</p>}

      {editingId === 'new' && draft && (
        <QuestionEditor
          draft={draft}
          scaleOptionsMap={scaleOptionsMap}
          onChange={updateDraft}
          onAddGroup={addGroup}
          onUpdateGroup={updateGroup}
          onRemoveGroup={removeGroup}
          onSave={saveDraft}
          onCancel={cancelEdit}
          saving={saving}
          isNew
        />
      )}

      {!loading && !error && pageGroups.map(group => (
        <div key={group.page_index} className="admin-question-group">
          <h2 className="admin-page-title">{group.page_title}</h2>
          {group.items.map(q => (
            <div key={q.id}>
              {editingId === q.id ? (
                <QuestionEditor
                  draft={draft}
                  scaleOptionsMap={scaleOptionsMap}
                  onChange={updateDraft}
                  onAddGroup={addGroup}
                  onUpdateGroup={updateGroup}
                  onRemoveGroup={removeGroup}
                  onSave={saveDraft}
                  onCancel={cancelEdit}
                  saving={saving}
                />
              ) : (
                <QuestionSummary
                  question={q}
                  scaleOptionsMap={scaleOptionsMap}
                  onEdit={() => startEdit(q)}
                  onDelete={() => deleteQuestion(q.id, q.label)}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function QuestionSummary({ question: q, scaleOptionsMap, onEdit, onDelete }) {
  const typeInfo = TYPE_INFO[q.type] || { label: q.type, hint: '' }

  return (
    <div className="admin-question-row">
      <div className="admin-question-main">
        <p className="admin-question-label">{q.label}</p>
        <p className="admin-question-meta">
          <code>{q.name}</code> · {typeInfo.label}
        </p>

        {q.options && q.options.length > 0 && (
          <div className="admin-chip-list">
            {q.options.map(opt => <span key={opt} className="admin-chip">{opt}</span>)}
          </div>
        )}

        {q.scale_type && scaleOptionsMap[q.scale_type] && (
          <div className="admin-chip-list">
            {scaleOptionsMap[q.scale_type].map(opt => <span key={opt} className="admin-chip">{opt}</span>)}
          </div>
        )}

        {q.grouped_options && (
          <p className="admin-question-meta">
            {Object.entries(q.grouped_options).map(([group, opts]) => (
              <span key={group} style={{ marginRight: 12 }}>
                <strong>{group}:</strong> {opts.length} option{opts.length === 1 ? '' : 's'}
              </span>
            ))}
          </p>
        )}

        {q.helper_text && <p className="admin-question-helper">Helper text: "{q.helper_text}"</p>}
      </div>
      <div className="admin-question-actions">
        <button className="admin-btn-secondary" onClick={onEdit}>Edit</button>
        <button className="admin-btn-secondary admin-btn-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}

function QuestionEditor({
  draft, scaleOptionsMap, onChange, onAddGroup, onUpdateGroup, onRemoveGroup, onSave, onCancel, saving, isNew,
}) {
  const usesGroupedOptions = draft.type === 'select' || draft.type === 'combobox'

  return (
    <div className="admin-editor-card">
      <p className="admin-editor-title">{isNew ? 'New question' : 'Edit question'}</p>

      <div className="admin-editor-grid">
        <label className="admin-field">
          <span>Page title</span>
          <p className="admin-field-hint">The section heading this question appears under on the survey.</p>
          <input value={draft.page_title} onChange={e => onChange('page_title', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Page number</span>
          <p className="admin-field-hint">Which page of the survey (0 = first page).</p>
          <input type="number" value={draft.page_index} onChange={e => onChange('page_index', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Order on page</span>
          <p className="admin-field-hint">Position within the page (0 = shown first).</p>
          <input type="number" value={draft.order_index} onChange={e => onChange('order_index', e.target.value)} />
        </label>
      </div>

      <label className="admin-field">
        <span>Field name</span>
        <p className="admin-field-hint">
          The internal name used to store this answer. Respondents never see this. Use only letters,
          numbers, and underscores. {!isNew && 'Cannot be changed after creation, to avoid breaking existing responses.'}
        </p>
        <input
          value={draft.name}
          onChange={e => onChange('name', e.target.value.replace(/[^a-z0-9_]/gi, '_'))}
          disabled={!isNew}
        />
      </label>

      <label className="admin-field">
        <span>Question label</span>
        <p className="admin-field-hint">The actual question text the student will read.</p>
        <textarea value={draft.label} onChange={e => onChange('label', e.target.value)} rows={2} />
      </label>

      <label className="admin-field">
        <span>Question type</span>
        <p className="admin-field-hint">{TYPE_INFO[draft.type]?.hint}</p>
        <select value={draft.type} onChange={e => onChange('type', e.target.value)}>
          {FIELD_TYPES.map(t => <option key={t} value={t}>{TYPE_INFO[t].label}</option>)}
        </select>
      </label>

      {NEEDS_OPTIONS.includes(draft.type) && (
        <label className="admin-field">
          <span>Answer choices</span>
          <p className="admin-field-hint">Type one choice per line. These become the buttons the student picks from.</p>
          <textarea
            value={draft.optionsText}
            onChange={e => onChange('optionsText', e.target.value)}
            rows={5}
            placeholder={'Yes\nNo\nMaybe'}
          />
        </label>
      )}

      {draft.type === 'scale' && (
        <label className="admin-field">
          <span>Answer scale</span>
          <p className="admin-field-hint">
            Pick a shared answer set already used elsewhere in the survey (keeps wording consistent
            across similar questions).
          </p>
          <select value={draft.scale_type || ''} onChange={e => onChange('scale_type', e.target.value)}>
            <option value="" disabled>Choose a scale…</option>
            {Object.keys(scaleOptionsMap).map(k => (
              <option key={k} value={k}>{k} ({scaleOptionsMap[k].join(' / ')})</option>
            ))}
          </select>
        </label>
      )}

      {usesGroupedOptions && (
        <div className="admin-field">
          <span>Grouped answer choices</span>
          <p className="admin-field-hint">
            Organize a long list into labeled sections (e.g. group universities into Federal / State /
            Private). Each group needs a name and its own list of choices, one per line.
          </p>

          {draft.groupedList.map((g, i) => (
            <div key={i} className="admin-group-editor">
              <div className="admin-group-editor-header">
                <input
                  className="admin-group-name"
                  placeholder="Group name (e.g. Federal Universities)"
                  value={g.group}
                  onChange={e => onUpdateGroup(i, 'group', e.target.value)}
                />
                <button className="admin-btn-secondary admin-btn-danger" onClick={() => onRemoveGroup(i)}>
                  Remove group
                </button>
              </div>
              <textarea
                rows={4}
                placeholder={'One option per line'}
                value={g.optionsText}
                onChange={e => onUpdateGroup(i, 'optionsText', e.target.value)}
              />
            </div>
          ))}

          <button className="admin-btn-secondary" onClick={onAddGroup} style={{ marginTop: 8 }}>
            + Add group
          </button>
        </div>
      )}

      {draft.type === 'combobox' && (
        <label className="admin-field admin-field-inline">
          <input
            type="checkbox"
            checked={!!draft.remote_growth}
            onChange={e => onChange('remote_growth', e.target.checked)}
          />
          <span>
            If a student types something not on the list, save it so it shows up for future students too
          </span>
        </label>
      )}

      <label className="admin-field">
        <span>Placeholder text (optional)</span>
        <p className="admin-field-hint">Faint example text shown inside the empty input box.</p>
        <input value={draft.placeholder || ''} onChange={e => onChange('placeholder', e.target.value)} />
      </label>

      <label className="admin-field">
        <span>Helper text (optional)</span>
        <p className="admin-field-hint">A short line of guidance shown under the question, above the input.</p>
        <input value={draft.helper_text || ''} onChange={e => onChange('helper_text', e.target.value)} />
      </label>

      {draft.type === 'number' && (
        <label className="admin-field">
          <span>Prefix (optional)</span>
          <p className="admin-field-hint">Shown before the number, e.g. "₦".</p>
          <input value={draft.prefix || ''} onChange={e => onChange('prefix', e.target.value)} />
        </label>
      )}

      <div className="admin-editor-actions">
        <button className="admin-btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
        <button className="admin-btn-primary" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save question'}
        </button>
      </div>
    </div>
  )
}

export default AdminQuestions