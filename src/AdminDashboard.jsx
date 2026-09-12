import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './Admin.css'

function AdminDashboard() {
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadResponses()
  }, [])

  async function loadResponses() {
    setLoading(true)
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .order('submitted_at', { ascending: false })

    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setResponses(data || [])
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const columns = useMemo(() => {
    if (responses.length === 0) return []
    return Object.keys(responses[0])
  }, [responses])

  const filtered = useMemo(() => {
    if (!search.trim()) return responses
    const q = search.trim().toLowerCase()
    return responses.filter(row =>
      columns.some(col => {
        const val = row[col]
        if (val === null || val === undefined) return false
        return String(val).toLowerCase().includes(q)
      })
    )
  }, [responses, search, columns])

  function downloadCsv() {
    if (filtered.length === 0) return

    const escapeCell = value => {
      if (value === null || value === undefined) return ''
      const str = Array.isArray(value) ? value.join('; ') : String(value)
      // Quote any cell containing a comma, quote, or newline; escape inner quotes.
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const header = columns.join(',')
    const rows = filtered.map(row => columns.map(col => escapeCell(row[col])).join(','))
    const csv = [header, ...rows].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ccli-responses-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">CCLI Admin</p>
          <h1>Responses</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/admin/questions" className="admin-btn-secondary">Edit questions</Link>
          <button className="admin-btn-secondary" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <div className="admin-toolbar">
        <input
          type="text"
          className="admin-search"
          placeholder="Search all fields…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="admin-count">
          {filtered.length} of {responses.length} response{responses.length === 1 ? '' : 's'}
        </span>
        <button className="admin-btn-primary" onClick={downloadCsv} disabled={filtered.length === 0}>
          Export CSV
        </button>
      </div>

      {loading && <p className="admin-status">Loading…</p>}
      {error && <p className="admin-status admin-error">Error: {error}</p>}

      {!loading && !error && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id}>
                  {columns.map(col => (
                    <td key={col}>
                      {Array.isArray(row[col]) ? row[col].join(', ') : String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="admin-status">No responses match your search.</p>}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard