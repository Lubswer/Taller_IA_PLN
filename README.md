# Taller PLN — Procesamiento de Lenguaje Natural

Aplicación que implementa las cuatro etapas fundamentales del PLN sobre texto libre ingresado por el usuario.

---

## Tecnologías usadas

| Capa | Tecnología | Rol |
|------|-----------|-----|
| Lógica PLN | Python + NLTK + simplemma | Procesamiento del texto |
| API | Flask + flask-cors | Expone los procesos como endpoints REST |
| Interfaz | React (Vite) | Visualización e interacción |

---

## Guía de ejecución

### Requisitos previos

- Python 3.10 o superior
- Node.js 18 o superior
- Las siguientes librerías Python instaladas:

```bash
pip install flask flask-cors nltk simplemma
```

### Pasos

**1. Clonar o descargar el proyecto** y abrir dos terminales en la carpeta `TallerIA/`.

**2. Terminal 1 — Iniciar el backend (Python/Flask):**

```bash
cd backend
python app.py
```

Debe aparecer:
```
 PLN API corriendo en http://localhost:5000
 * Running on http://127.0.0.1:5000
```

> ⚠️ Dejar esta terminal abierta mientras se usa la aplicación.

**3. Terminal 2 — Iniciar el frontend (React/Vite):**

```bash
cd frontend
npm run dev
```

Debe aparecer:
```
  VITE v8.x.x  ready in ... ms
  ➜  Local:   http://localhost:5173/
```

**4. Abrir el navegador** en `http://localhost:5173`

### Uso de la aplicación

1. Seleccionar el **idioma** (Español / Inglés)
2. Escribir un texto en el campo de entrada **o** presionar **`Ej.`** para cargar el ejemplo de clase de cada etapa
3. Presionar el botón de la etapa deseada: **Tokenizar**, **Normalización**, **Lematización** o **Stemming**
4. El resultado aparece en el panel derecho como lista de tokens

---

## Etapas PLN implementadas

### 1. Tokenización

Divide el texto en unidades mínimas llamadas **tokens** (palabras, signos de puntuación, números).

**Librería:** `nltk.tokenize.word_tokenize`

**Función:**
```python
def fn_tokenizar(texto: str, idioma: str = "spanish") -> list:
    return word_tokenize(texto, language=idioma)
```

**Ejemplo:**
```
Entrada : El perro corre rápido.
Salida  : ["El", "perro", "corre", "rápido", "."]
```

---

### 2. Normalización

Lleva el texto a una forma estándar para reducir ambigüedad y unificar variaciones.

**Acciones aplicadas:**
1. Convertir todo a **minúsculas**
2. Eliminar **caracteres especiales** y signos de puntuación
3. Colapsar **espacios múltiples**

> No elimina stopwords — la clase solo pide normalización de forma, no de contenido.

**Función:**
```python
def fn_normalizar(texto: str) -> list:
    texto = texto.lower()
    texto = re.sub(r"[^a-záéíóúüñ...\s]", " ", texto)
    texto = re.sub(r"\s+", " ", texto).strip()
    return texto.split()
```

**Ejemplo:**
```
Entrada : ¡Hola!!! Soy JUAN, Bienvenidos al curso de IA :)
Salida  : ["hola", "soy", "juan", "bienvenidos", "al", "curso", "de", "ia"]
```

---

### 3. Lematización

Reduce cada palabra a su **forma base o lema**, preservando el significado semántico. Usa diccionarios y reglas lingüísticas.

**Librería:** `simplemma` — soporta español (`es`) e inglés (`en`).

> Se eligió `simplemma` sobre `WordNetLemmatizer` (NLTK) porque este último solo funciona correctamente en inglés. `simplemma` produce lemas válidos en español sin necesidad de modelos pesados.

**Función:**
```python
def fn_lematizar(texto: str, lang: str = "es") -> list:
    tokens = word_tokenize(texto, language="spanish")
    return [simplemma.lemmatize(t, lang=lang) for t in tokens
            if t not in string.punctuation]
```

**Ejemplo:**
```
Entrada : Juan está estudiando, también estudió ayer, él estudia mucho.
Salida  : ["Juan", "estar", "estudiar", "también", "estudiar",
           "ayer", "él", "estudiar", "mucho"]
```

---

### 4. Stemming (Puesta en raíz)

Recorta sufijos para obtener una **raíz morfológica aproximada**. Es más rápido que la lematización pero menos preciso — no siempre produce palabras reales del idioma.

**Librería:** `nltk.stem.SnowballStemmer` — soporta español e inglés.

**Función:**
```python
def fn_stemming(texto: str, idioma: str = "spanish") -> list:
    stemmer = SnowballStemmer(idioma)
    tokens = word_tokenize(texto, language="spanish")
    return [stemmer.stem(t) for t in tokens
            if t not in string.punctuation]
```

**Ejemplo:**
```
Entrada : Los niños estaban jugando en los parques y disfrutaban mucho.
Salida  : ["los", "niñ", "estab", "jug", "en", "los",
           "parqu", "y", "disfrut", "much"]
```

---

## Comparativa: Lematización vs Stemming

| Criterio | Lematización | Stemming |
|----------|-------------|---------|
| Resultado | Palabra real del idioma | Raíz aproximada (puede no ser palabra) |
| Precisión | Alta | Baja–Media |
| Velocidad | Más lento | Más rápido |
| Base | Diccionario + reglas lingüísticas | Reglas de recorte de sufijos |
| Ejemplo | "corriendo" → `correr` | "corriendo" → `corr` |
| Uso recomendado | Análisis semántico, chatbots, NER | Motores de búsqueda, índices rápidos |

---

## API REST — Endpoints

Todos los endpoints reciben `POST` con cuerpo JSON:

```json
{ "texto": "El texto a procesar", "idioma": "spanish" }
```

| Endpoint | Descripción |
|----------|-------------|
| `POST /api/tokenizar` | Tokenización del texto |
| `POST /api/normalizar` | Normalización (minúsculas + sin especiales) |
| `POST /api/lematizar` | Lematización con simplemma |
| `POST /api/stemming` | Stemming con SnowballStemmer |
| `GET  /api/health` | Verificar que el servidor está activo |

**Respuesta estándar:**
```json
{
  "ok": true,
  "entrada": "texto original",
  "resultado": ["token1", "token2", "..."],
  "total": 5
}
```

---

## Dependencias Python

```txt
flask
flask-cors
nltk          # tokenización, stemming
simplemma     # lematización multilingüe
```

Recursos NLTK descargados automáticamente al iniciar:
- `punkt` / `punkt_tab` — tokenizador
- `stopwords` — lista de palabras vacías (disponible para uso futuro)

---

## Conclusiones

1. **El preprocesamiento es la base del PLN.** Las etapas de tokenización y normalización son indispensables antes de cualquier análisis: sin ellas, el texto en crudo contiene ruido (signos, mayúsculas, caracteres especiales) que distorsiona los resultados de los algoritmos posteriores.

2. **Lematización y Stemming resuelven el mismo problema de formas distintas.** La lematización es más precisa porque devuelve palabras reales del idioma usando reglas lingüísticas, mientras que el Stemming es más rápido pero puede producir raíces que no son palabras válidas. La elección entre uno u otro depende del balance entre velocidad y precisión que requiera el proyecto.

3. **El idioma importa en cada etapa.** Librerías como `WordNetLemmatizer` (NLTK) están optimizadas para inglés y producen resultados incorrectos en español; por eso se optó por `simplemma`, que soporta múltiples idiomas de forma ligera. Esto refleja un desafío real del PLN: no todas las herramientas funcionan igual para todos los idiomas.
