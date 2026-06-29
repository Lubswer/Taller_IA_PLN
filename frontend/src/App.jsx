import { useState, useCallback } from 'react'
import './App.css'

// ── Configuración ─────────────────────────────────────────
const API = 'http://localhost:5000/api'

const EJEMPLOS = {
  tokenizar:  'El perro corre rápido.',
  normalizar: '¡Hola!!! Soy JUAN, Bienvenidos al curso de IA :)',
  lematizar:  'Juan está estudiando, también estudió ayer, él estudia mucho.',
  stemming:   'Los niños estaban jugando en los parques y disfrutaban mucho.',
}

const OPERACIONES = [
  {
    key:   'tokenizar',
    label: 'Tokenizar',
    cls:   'btn-token',
    chip:  'chip-token',
    desc:  'Divide el texto en tokens (palabras + puntuación)',
  },
  {
    key:   'normalizar',
    label: 'Normalización',
    cls:   'btn-norm',
    chip:  'chip-norm',
    desc:  'Minúsculas + elimina caracteres especiales',
  },
  {
    key:   'lematizar',
    label: 'Lematización',
    cls:   'btn-lema',
    chip:  'chip-lema',
    desc:  'Reduce cada palabra a su lema base (simplemma)',
  },
  {
    key:   'stemming',
    label: 'Stemming',
    cls:   'btn-stem',
    chip:  'chip-stem',
    desc:  'Obtiene la raíz morfológica (SnowballStemmer)',
  },
]

// ── Componente principal ──────────────────────────────────
export default function App() {
  const [texto,    setTexto]    = useState('')
  const [idioma,   setIdioma]   = useState('spanish')
  const [result,   setResult]   = useState(null)   // { titulo, tokens, total, chip }
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [status,   setStatus]   = useState('Listo — ingresa un texto y selecciona una operación.')
  const [statusType, setStatusType] = useState('ok')
  const [activeOp, setActiveOp] = useState(null)

  // ── Llamada al backend ──────────────────────────────────
  const run = useCallback(async (op) => {
    if (!texto.trim()) {
      setError('Por favor ingresa un texto o carga un ejemplo con "Ej."')
      setStatus('⚠ Sin texto ingresado.'); setStatusType('error')
      return
    }
    setLoading(true); setError(null); setResult(null)
    setActiveOp(op.key); setStatusType('loading')
    setStatus(`Procesando ${op.label.toLowerCase()}...`)

    try {
      const res  = await fetch(`${API}/${op.key}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ texto, idioma }),
      })
      const data = await res.json()

      if (!data.ok) throw new Error(data.error || 'Error desconocido')

      setResult({ titulo: op.label, tokens: data.resultado, total: data.total, chip: op.chip })
      setStatus(`${op.label} completada → ${data.total} resultado${data.total !== 1 ? 's' : ''}.`)
      setStatusType('ok')
    } catch (e) {
      const msg = e.message.includes('fetch')
        ? 'No se pudo conectar al servidor. ¿Está corriendo el backend? (python app.py)'
        : e.message
      setError(msg)
      setStatus(`Error: ${msg}`); setStatusType('error')
    } finally {
      setLoading(false)
    }
  }, [texto, idioma])

  // ── Cargar ejemplo ──────────────────────────────────────
  const cargarEjemplo = (key) => setTexto(EJEMPLOS[key])

  // ── Limpiar ─────────────────────────────────────────────
  const limpiar = () => {
    setTexto(''); setResult(null); setError(null); setActiveOp(null)
    setStatus('Listo — ingresa un texto y selecciona una operación.'); setStatusType('ok')
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="app-wrapper">
      <div className="app-card">

        {/* Cabecera */}
        <div className="header">
          <h1 className="header-title">
            Aplicación <span>Básica</span> PLN
          </h1>
          <p className="header-sub">
            Tokenización · Normalización · Lematización · Stemming
          </p>
        </div>

        <div className="body">

          {/* Selector de idioma */}
          <div className="lang-row">
            <span className="lang-label">Idioma</span>
            <div className="lang-btns">
              {[['spanish','🇪🇸 Español'], ['english','🇬🇧 Inglés']].map(([v, lbl]) => (
                <button
                  key={v}
                  className={`lang-btn ${idioma === v ? 'active' : ''}`}
                  onClick={() => setIdioma(v)}
                >{lbl}</button>
              ))}
            </div>
          </div>

          {/* Área de entrada */}
          <div className="input-section">
            <span className="section-label">Ingresar Texto</span>
            <div className="textarea-wrap">
              <textarea
                value={texto}
                onChange={e => setTexto(e.target.value)}
                placeholder="Escribe o pega el texto aquí, o usa el botón 'Ej.' para cargar un ejemplo de clase…"
                spellCheck={false}
              />
              <span className="char-count">{texto.length} chars</span>
            </div>
          </div>

          <hr className="divider" />

          {/* Grid principal */}
          <div className="main-grid">

            {/* Panel de botones */}
            <div className="btn-panel">
              {OPERACIONES.map(op => (
                <div key={op.key} className="pln-btn-row">
                  <button
                    className={`pln-btn ${op.cls} ${loading && activeOp === op.key ? 'loading' : ''}`}
                    onClick={() => run(op)}
                    disabled={loading}
                    title={op.desc}
                  >
                    {loading && activeOp === op.key
                      ? <span className="spinner" style={{ width:16, height:16, borderWidth:2 }} />
                      : null
                    }
                    {op.label}
                  </button>
                  <button
                    className="ej-btn"
                    onClick={() => cargarEjemplo(op.key)}
                    title={`Cargar ejemplo de clase: ${EJEMPLOS[op.key]}`}
                  >Ej.</button>
                </div>
              ))}

              <button className="clear-btn" onClick={limpiar}>
                ✕ Limpiar todo
              </button>
            </div>

            {/* Panel de salida */}
            <div className="output-panel">
              <div className="output-header">
                <span className="section-label">Salida</span>
                <span className={`output-badge ${result ? 'active' : ''}`}>
                  {result ? <span className="badge-dot" /> : null}
                  {result ? result.titulo.toUpperCase() : 'EN ESPERA'}
                </span>
              </div>

              <div className="output-box">
                {loading && (
                  <div className="spinner-wrap">
                    <div className="spinner" />
                    <span>Procesando con Python…</span>
                  </div>
                )}

                {!loading && error && (
                  <div className="error-state">
                    <span style={{ fontSize:'2rem' }}>⚠️</span>
                    <strong>Error</strong>
                    <span>{error}</span>
                  </div>
                )}

                {!loading && !error && !result && (
                  <div className="empty-state">
                    <span className="empty-icon">💬</span>
                    <span>Aquí aparecerá el resultado</span>
                    <span style={{ fontSize:'0.75rem', opacity:.6 }}>
                      Ingresa un texto y presiona un botón
                    </span>
                  </div>
                )}

                {!loading && !error && result && (
                  <>
                    <div className="result-meta">
                      <span className="result-title">{result.titulo}</span>
                      <span className="result-count">{result.total} tokens</span>
                    </div>
                    <div className="token-grid">
                      {result.tokens.map((tok, i) => (
                        <span
                          key={i}
                          className={`token-chip ${result.chip}`}
                          style={{ animationDelay: `${i * 0.025}s` }}
                          title={`Token #${i + 1}`}
                        >
                          <span className="chip-idx">{i + 1}</span>
                          {tok}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de estado */}
        <div className="status-bar">
          <div className={`status-dot ${statusType}`} />
          <span>{status}</span>
        </div>

      </div>
    </div>
  )
}
