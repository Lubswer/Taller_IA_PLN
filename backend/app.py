"""
============================================================
  TALLER PLN  ·  Backend Flask
  Expone endpoints REST para cada etapa de PLN
============================================================
  Endpoints:
    POST /api/tokenizar     → Tokenización
    POST /api/normalizar    → Normalización
    POST /api/lematizar     → Lematización (simplemma)
    POST /api/stemming      → Stemming (SnowballStemmer)

  Body JSON esperado:
    { "texto": "...", "idioma": "spanish" | "english" }

  Respuesta:
    { "resultado": [...], "total": N, "entrada": "..." }
============================================================
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import string
import threading

# ── NLTK ─────────────────────────────────────────────────
import nltk

def _dl():
    for r in ('punkt', 'punkt_tab', 'stopwords'):
        try:
            nltk.download(r, quiet=True)
        except Exception:
            pass

threading.Thread(target=_dl, daemon=True).start()

from nltk.tokenize import word_tokenize
from nltk.stem import SnowballStemmer

# ── simplemma ────────────────────────────────────────────
import simplemma

# ============================================================
#  FUNCIONES PLN
# ============================================================

def fn_tokenizar(texto: str, idioma: str = "spanish") -> list:
    """
    Divide el texto en tokens (palabras + puntuación).
    Ejemplo: 'El perro corre rápido.' →
             ['El','perro','corre','rápido','.']
    """
    return word_tokenize(texto, language=idioma)


def fn_normalizar(texto: str) -> list:
    """
    1. Convierte a minúsculas
    2. Elimina caracteres especiales / signos de puntuación
    3. Elimina espacios extra
    Ejemplo: '¡Hola!!! Soy JUAN :)' → ['hola','soy','juan']
    """
    texto = texto.lower()
    texto = re.sub(r"[^a-záéíóúüñàèìòùâêîôûäëïöü\s]", " ", texto)
    texto = re.sub(r"\s+", " ", texto).strip()
    return texto.split()


def fn_lematizar(texto: str, lang: str = "es") -> list:
    """
    Reduce cada palabra a su lema base usando simplemma.
    Ejemplo: 'estudiando estudió estudia' →
             ['estudiar','estudiar','estudiar']
    """
    tokens = word_tokenize(texto, language="spanish")
    lemas = []
    for t in tokens:
        if t in string.punctuation or re.match(r"[^\w]", t):
            continue
        try:
            lemas.append(simplemma.lemmatize(t, lang=lang))
        except Exception:
            lemas.append(t)
    return lemas


def fn_stemming(texto: str, idioma: str = "spanish") -> list:
    """
    Recorta sufijos para obtener la raíz morfológica.
    Ejemplo: 'jugando parques disfrutaban' →
             ['jug','parqu','disfrut']
    """
    try:
        stemmer = SnowballStemmer(idioma)
    except ValueError:
        stemmer = SnowballStemmer("english")
    tokens = word_tokenize(texto, language="spanish")
    return [stemmer.stem(t) for t in tokens if t not in string.punctuation]


# ============================================================
#  FLASK APP
# ============================================================

app = Flask(__name__)
CORS(app)   # Permite peticiones desde React (localhost:5173)


def _ok(resultado: list, entrada: str):
    return jsonify({
        "ok":       True,
        "entrada":  entrada,
        "resultado": resultado,
        "total":    len(resultado),
    })


def _error(msg: str):
    return jsonify({"ok": False, "error": msg}), 400


# ── Helpers ──────────────────────────────────────────────

def _body():
    data   = request.get_json(force=True, silent=True) or {}
    texto  = (data.get("texto") or "").strip()
    idioma = data.get("idioma", "spanish")
    lang   = "en" if idioma == "english" else "es"
    return texto, idioma, lang


# ── Endpoints ────────────────────────────────────────────

@app.route("/api/tokenizar", methods=["POST"])
def tokenizar():
    texto, idioma, _ = _body()
    if not texto:
        return _error("El campo 'texto' está vacío.")
    try:
        return _ok(fn_tokenizar(texto, idioma), texto)
    except Exception as e:
        return _error(str(e))


@app.route("/api/normalizar", methods=["POST"])
def normalizar():
    texto, _, _ = _body()
    if not texto:
        return _error("El campo 'texto' está vacío.")
    try:
        return _ok(fn_normalizar(texto), texto)
    except Exception as e:
        return _error(str(e))


@app.route("/api/lematizar", methods=["POST"])
def lematizar():
    texto, _, lang = _body()
    if not texto:
        return _error("El campo 'texto' está vacío.")
    try:
        return _ok(fn_lematizar(texto, lang), texto)
    except Exception as e:
        return _error(str(e))


@app.route("/api/stemming", methods=["POST"])
def stemming():
    texto, idioma, _ = _body()
    if not texto:
        return _error("El campo 'texto' está vacío.")
    try:
        return _ok(fn_stemming(texto, idioma), texto)
    except Exception as e:
        return _error(str(e))


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "PLN API activa"})


# ============================================================

if __name__ == "__main__":
    print("\n  PLN API corriendo en http://localhost:5000\n")
    app.run(debug=True, port=5000)
