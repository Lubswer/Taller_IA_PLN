import { useState, useCallback } from 'react'
import './App.css'

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
    color: '#1e8449',
    desc:  'Divide el texto en unidades mínimas (tokens): palabras, signos de puntuación y números. Es el primer paso obligatorio del PLN.',
  },
  {
    key:   'normalizar',
    label: 'Normalización',
    cls:   'btn-norm',
    color: '#c0392b',
    desc:  'Convierte a minúsculas y elimina caracteres especiales / signos de puntuación. Estandariza el texto para reducir ambigüedad.',
  },
  {
    key:   'lematizar',
    label: 'Lematización',
    cls:   'btn-lema',
    color: '#616a6b',
    desc:  'Reduce cada palabra a su forma base o "lema" usando diccionarios lingüísticos. Ej: "estudiando", "estudió", "estudia" → "estudiar".',
  },
  {
    key:   'stemming',
    label: 'Stemming',
    cls:   'btn-stem',
    color: '#b7950b',
    desc:  'Recorta sufijos para obtener la raíz morfológica aproximada. Más rápido que lematización pero menos preciso. Ej: "jugando" → "jug".',
  },
]

export default function App() {
  const [texto,      setTexto]      = useState('')
  const [result,     setResult]     = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [status,     setStatus]     = useState('Listo — ingresa un texto y selecciona una operación.')
  const [statusType, setStatusType] = useState('ok')
  const [activeOp,   setActiveOp]   = useState(null)

  const run = useCallback(async (op) => {
    if (!texto.trim()) {
      setError('Por favor ingresa un texto o carga un ejemplo con "Ej."')
      setStatus('Sin texto ingresado.'); setStatusType('error'); return
    }
    setLoading(true); setError(null); setResult(null)
    setActiveOp(op.key); setStatusType('loading')
    setStatus(`Procesando ${op.label.toLowerCase()}...`)
    try {
      const res  = await fetch(`${API}/${op.key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, idioma: 'spanish' }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'Error desconocido')
      setResult({ op, tokens: data.resultado, originales: data.originales, total: data.total })
      setStatus(`${op.label} completada → ${data.total} resultado${data.total !== 1 ? 's' : ''}.`)
      setStatusType('ok')
    } catch (e) {
      const msg = e.message.includes('fetch')
        ? 'No se pudo conectar al backend. ¿Está corriendo python app.py?'
        : e.message
      setError(msg); setStatus(`Error: ${msg}`); setStatusType('error')
    } finally { setLoading(false) }
  }, [texto])

  const cargarEjemplo = (key) => setTexto(EJEMPLOS[key])
  const limpiar = () => {
    setTexto(''); setResult(null); setError(null); setActiveOp(null)
    setStatus('Listo — ingresa un texto y selecciona una operación.'); setStatusType('ok')
  }

  return (
    <div className="app-wrapper">
      <div className="app-card">

        {/* Cabecera */}
        <div className="header">
          <h1 className="header-title">Aplicación <span>Básica</span> PLN</h1>
          <p className="header-sub">Tokenización · Normalización · Lematización · Stemming</p>
        </div>

        <div className="body">


          {/* Entrada */}
          <div className="input-section">
            <span className="section-label">Ingresar Texto</span>
            <div className="textarea-wrap">
              <textarea value={texto} onChange={e => setTexto(e.target.value)}
                placeholder="Escribe el texto aquí, o pulsa 'Ej.' para cargar el ejemplo de clase de cada etapa…"
                spellCheck={false} />
              <span className="char-count">{texto.length} chars</span>
            </div>
          </div>

          <hr className="divider" />

          <div className="main-grid">

            {/* Botones */}
            <div className="btn-panel">
              {OPERACIONES.map(op => (
                <div key={op.key} className="pln-btn-row">
                  <button
                    className={`pln-btn ${op.cls} ${loading && activeOp === op.key ? 'loading' : ''}`}
                    onClick={() => run(op)} disabled={loading} title={op.desc}
                  >
                    {loading && activeOp === op.key &&
                      <span className="spinner" style={{ width:14, height:14, borderWidth:2 }} />}
                    {op.label}
                  </button>
                  <button className="ej-btn" onClick={() => cargarEjemplo(op.key)}
                    title={`Ejemplo de clase: ${EJEMPLOS[op.key]}`}>Ej.</button>
                </div>
              ))}
              <button className="clear-btn" onClick={limpiar}>✕ Limpiar todo</button>
            </div>

            {/* Salida */}
            <div className="output-panel">
              <div className="output-header">
                <span className="section-label">Salida</span>
                <span className={`output-badge ${result ? 'active' : ''}`}
                  style={result ? { background: result.op.color } : {}}>
                  {result ? <span className="badge-dot" /> : null}
                  {result ? result.op.label.toUpperCase() : 'EN ESPERA'}
                </span>
              </div>

              <div className="output-box">
                {loading && (
                  <div className="spinner-wrap">
                    <div className="spinner" /><span>Procesando con Python…</span>
                  </div>
                )}

                {!loading && error && (
                  <div className="error-state">
                    <span style={{ fontSize:'2rem' }}>⚠️</span>
                    <strong>Error</strong><span>{error}</span>
                  </div>
                )}

                {!loading && !error && !result && (
                  <div className="empty-state">
                    <span className="empty-icon">💬</span>
                    <span>Aquí aparecerá el resultado</span>
                    <span style={{ fontSize:'0.75rem', opacity:.6 }}>
                      Presiona un botón o carga un ejemplo con "Ej."
                    </span>
                  </div>
                )}

                {!loading && !error && result && (
                  <ResultView result={result} />
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

/* ── Componente de resultado con comparación ─────────────── */
function ResultView({ result }) {
  const { op, tokens, originales, total } = result

  // Pares original → procesado con flag de cambio
  const pairs = tokens.map((tok, i) => ({
    orig: originales[i] ?? null,
    proc: tok,
    diff: originales[i] != null && originales[i].toLowerCase() !== tok.toLowerCase(),
  }))

  return (
    <>
      {/* Descripción de la operación */}
      <div className="op-desc" style={{ borderLeftColor: op.color }}>
        <strong style={{ color: op.color }}>{op.label}:</strong> {op.desc}
      </div>

      {/* Leyenda comparación */}
      {op.key !== 'tokenizar' && (
        <div className="legend-row">
          <span className="legend-item">
            <span className="leg-dot same" /> Sin cambio
          </span>
          <span className="legend-item">
            <span className="leg-dot diff" /> Modificado
          </span>
        </div>
      )}

      {/* Tabla comparación original → resultado */}
      <div className="compare-header">
        <span />
        <span className="col-orig">Original</span>
        <span className="col-arrow">→</span>
        <span className="col-proc">Resultado</span>
        <span />
      </div>


      <div className="token-table">
        {pairs.map(({ orig, proc, diff }, i) => (
          <div key={i} className={`token-row ${diff ? 'row-diff' : 'row-same'}`}
            style={{ animationDelay: `${i * 0.03}s` }}>
            <span className="col-idx">{i + 1}</span>
            <span className="col-orig-val">{orig ?? '—'}</span>
            <span className="col-arr">→</span>
            <span className="col-proc-val" style={diff ? { color: op.color, fontWeight: 700 } : {}}>
              {proc}
            </span>
            {diff && <span className="changed-badge" style={{ background: op.color }}>✓</span>}
          </div>
        ))}
      </div>

      <div className="result-footer">
        Total: <strong>{total}</strong> tokens
        {op.key !== 'tokenizar' && (
          <span className="diff-count" style={{ color: op.color }}>
            · {pairs.filter(p => p.diff).length} modificados
          </span>
        )}
      </div>
    </>
  )
}
