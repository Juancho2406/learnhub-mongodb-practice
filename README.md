# 🎓 LearnHub - Práctica de MongoDB para Big Data

Este proyecto contiene el caso de uso completo **LearnHub**, una plataforma de cursos en línea implementada con MongoDB para la práctica de Big Data.

## 📋 Tabla de Contenidos

- [Instalación](#-instalación)
- [Conexión a MongoDB](#-conexión-a-mongodb)
- [Inserción de Datos](#-inserción-de-datos)
- [Ejecutar Consultas](#-ejecutar-consultas)
- [Generar Dashboard HTML](#-generar-dashboard-html)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Diagrama de Base de Datos](#-diagrama-de-base-de-datos)
- [Documentación Completa](#-documentación-completa)

---

## 🚀 Instalación

### 1. Instalar MongoDB Shell (mongosh)

**Opción A: macOS con Homebrew**
```bash
brew tap mongodb/brew
brew install mongodb-community-shell
```

**Opción B: Descargar binario**
1. Ve a: https://www.mongodb.com/try/download/shell
2. Descarga la versión para tu sistema operativo
3. Extrae y agrega al PATH

**Verificar instalación:**
```bash
mongosh --version
```

### 2. Instalar Dependencias de Node.js

Este proyecto requiere Node.js para el script de inserción automática.

```bash
# Instalar Node.js si no lo tienes (con nvm)
nvm install 18
nvm use 18

# Instalar dependencias del proyecto
npm install
```

---

## 🔌 Conexión a MongoDB

### Credenciales de Conexión

- **Usuario**: `juansaavedra2406_db_user`
- **Cluster**: `learnhub-mongodb-practi.ooamqa8.mongodb.net`
- **Base de datos**: `LearnHubDB`
- **Contraseña**: (la ingresarás cuando te la pidan)

### Método 1: Conexión Manual con mongosh

```bash
mongosh "mongodb+srv://learnhub-mongodb-practi.ooamqa8.mongodb.net/" --apiVersion 1 --username juansaavedra2406_db_user
```

Cuando te pida la contraseña, ingrésala.

Luego cambia a la base de datos:
```javascript
use LearnHubDB
```

### Método 2: Script de Conexión Rápida

Crea un archivo `conectar.sh` (opcional):

```bash
#!/bin/bash
mongosh "mongodb+srv://learnhub-mongodb-practi.ooamqa8.mongodb.net/" --apiVersion 1 --username juansaavedra2406_db_user
```

Dar permisos y ejecutar:
```bash
chmod +x conectar.sh
./conectar.sh
```

### Método 3: Web Shell de MongoDB Atlas

1. Ve a: https://cloud.mongodb.com/
2. Selecciona tu cluster
3. Click en "Connect" → "MongoDB Shell"
4. Se abrirá un shell en el navegador
5. Ejecuta: `use LearnHubDB`

---

## 📝 Inserción de Datos

### Opción 1: Script Automático con Node.js (Recomendado)

Este script inserta automáticamente 100 documentos en cada colección (500 documentos totales).

```bash
node insertar_datos.js
```

El script:
- ✅ Te pedirá tu contraseña de forma segura
- ✅ Se conectará automáticamente
- ✅ Creará las colecciones necesarias
- ✅ Insertará 100 documentos en cada colección:
  - 100 cursos
  - 100 estudiantes
  - 100 inscripciones
  - 100 registros de progreso
  - 100 comentarios
- ✅ Mostrará un resumen al final

**Ejemplo de salida:**
```
🚀 SCRIPT DE INSERCIÓN DE DATOS - LEARNHUB

Usuario: juansaavedra2406_db_user
Base de datos: LearnHubDB

Ingresa tu contraseña de MongoDB: ********

🔄 Conectando a MongoDB...

✅ Conectado exitosamente!

📦 Creando/verificando colecciones...
  ✓ Colección 'cursos' creada/verificada
  ✓ Colección 'estudiantes' creada/verificada
  ✓ Colección 'inscripciones' creada/verificada
  ✓ Colección 'progreso' creada/verificada
  ✓ Colección 'comentarios' creada/verificada

📝 Insertando documentos...

📚 Insertando 100 cursos...
  ✅ 100 cursos insertados
👥 Insertando 100 estudiantes...
  ✅ 100 estudiantes insertados
📋 Insertando 100 inscripciones...
  ✅ 100 inscripciones insertadas
📊 Insertando 100 registros de progreso...
  ✅ 100 registros de progreso insertados
💬 Insertando 100 comentarios...
  ✅ 100 comentarios insertados

==================================================
✅ INSERCIÓN COMPLETADA EXITOSAMENTE
==================================================

📊 Resumen de documentos:
  • cursos: 100 documentos
  • estudiantes: 100 documentos
  • inscripciones: 100 documentos
  • progreso: 100 documentos
  • comentarios: 100 documentos

✨ Total: 500 documentos insertados

🎉 ¡Proceso completado exitosamente!
```

### Opción 2: Script Completo de MongoDB Shell

Si prefieres usar el script completo de mongosh:

```bash
# Conectarte primero
mongosh "mongodb+srv://learnhub-mongodb-practi.ooamqa8.mongodb.net/" --apiVersion 1 --username juansaavedra2406_db_user

# Dentro de mongosh, cambiar a la base de datos
use LearnHubDB

# Cargar el script completo (ruta completa)
load("/ruta/completa/learnhub-mongodb-practice/codigo_mongodb_learnhub.js")
```

---

## 🔍 Ejecutar Consultas

### Consultas Organizadas por Tipo

Las consultas están organizadas en la carpeta `consultas/` y son **ejecutables directamente con Node.js**:

```
consultas/
├── 01_operaciones_crud_basicas.js        # INSERT, SELECT, UPDATE, DELETE
├── 02_consultas_filtros_operadores.js    # Filtros y operadores ($gt, $lt, $in, $regex, $and, $or, etc.)
└── 03_agregaciones_estadisticas.js       # COUNT, SUM, AVG, MIN, MAX y agregaciones complejas
```

### Ejecutar Consultas con Node.js (Recomendado)

Los scripts **resuelven la autenticación automáticamente** y muestran los resultados:

```bash
# 1. Operaciones CRUD básicas (Insert, Select, Update, Delete)
node consultas/01_operaciones_crud_basicas.js

# 2. Consultas con filtros y operadores
node consultas/02_consultas_filtros_operadores.js

# 3. Agregaciones y estadísticas
node consultas/03_agregaciones_estadisticas.js
```

Cada script:
- ✅ Te pedirá tu contraseña de MongoDB
- ✅ Se conectará automáticamente
- ✅ Ejecutará todas las consultas
- ✅ Mostrará los resultados en consola
- ✅ Cerrará la conexión al finalizar

### Método Alternativo: MongoDB Shell

También puedes usar mongosh directamente:

```bash
# Conectarte a MongoDB
mongosh "mongodb+srv://learnhub-mongodb-practi.ooamqa8.mongodb.net/" --apiVersion 1 --username juansaavedra2406_db_user

# Cambiar a la base de datos
use LearnHubDB

# Ejecutar consultas manualmente
db.cursos.find().limit(5).pretty()
```

### Método 2: Ejecutar Consultas desde MongoDB Shell

Dentro de mongosh, puedes ejecutar consultas directamente:

```javascript
// Ver todas las bases de datos
show dbs

// Usar la base de datos
use LearnHubDB

// Ver colecciones
show collections

// Contar documentos
db.cursos.countDocuments()

// Consulta básica
db.cursos.find({ estado: "Activo" }).limit(5).pretty()

// Consulta con operadores
db.cursos.find({ precio: { $gt: 150 } }).limit(5).pretty()

// Agregación simple
db.cursos.aggregate([
  { $group: { _id: "$categoria", total: { $sum: 1 } } }
])
```

### Método 3: Ejecutar desde Terminal (sin entrar a mongosh)

```bash
mongosh "mongodb+srv://learnhub-mongodb-practi.ooamqa8.mongodb.net/LearnHubDB" --apiVersion 1 --username juansaavedra2406_db_user --eval "db.cursos.countDocuments()"
```

---

## 📁 Estructura del Proyecto

```
learnhub-mongodb-practice/
│
├── README.md                          # Este archivo
├── DOCUMENTACION.md                   # Documentación completa del proyecto
├── package.json                       # Configuración de Node.js
├── insertar_datos.js                  # Script de inserción automática (Node.js)
├── generar_dashboard.js               # Generador de dashboard HTML estático
├── diagrama_bd.drawio                 # Diagrama del esquema de BD (draw.io)
│
├── config/                            # Configuración de conexión
│   └── connection.js                  # Módulo de conexión a MongoDB
│
├── consultas/                         # Carpeta con consultas ejecutables
│   ├── 01_operaciones_crud_basicas.js        # INSERT, SELECT, UPDATE, DELETE
│   ├── 02_consultas_filtros_operadores.js    # Filtros y operadores
│   └── 03_agregaciones_estadisticas.js       # COUNT, SUM, AVG, MIN, MAX
│
└── docs/                              # Dashboard HTML estático (GitHub Pages)
    ├── index.html                     # Dashboard generado (ejecutar generar_dashboard.js)
    └── README.md                      # Instrucciones para GitHub Pages
```

---

## 📊 Colecciones de la Base de Datos

La base de datos `LearnHubDB` contiene 5 colecciones:

1. **cursos** - Catálogo de cursos disponibles
2. **estudiantes** - Información de usuarios registrados
3. **inscripciones** - Relación entre estudiantes y cursos
4. **progreso** - Seguimiento del avance estudiantil
5. **comentarios** - Feedback y calificaciones de estudiantes

---

## 🔧 Solución de Problemas

### Error: "mongosh: command not found"

**Solución**: Instala mongosh (ver sección de instalación)

### Error: "authentication failed"

**Solución**: 
- Verifica que la contraseña sea correcta
- Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas
- Verifica que el usuario tenga permisos correctos

### Error: "connection timeout"

**Solución**:
- Verifica tu conexión a internet
- Asegúrate de que el cluster no esté pausado en Atlas
- Verifica la URL del cluster

### Error: "Cannot find module 'mongodb'"

**Solución**:
```bash
npm install
```

### Error al cargar scripts con `load()`

**Solución**: Usa la ruta completa del archivo:
```javascript
load("/Users/jdsaavedra/.../learnhub-mongodb-practice/consultas/01_consultas_basicas.js")
```

---

## 📚 Ejemplos de Consultas Rápidas

### Ver documentos en una colección

```javascript
db.cursos.find().limit(5).pretty()
```

### Contar documentos

```javascript
db.cursos.countDocuments()
db.estudiantes.countDocuments()
```

### Buscar con filtro

```javascript
db.cursos.find({ estado: "Activo" }).limit(10).pretty()
```

### Buscar con operadores

```javascript
// Precio mayor a 150
db.cursos.find({ precio: { $gt: 150 } }).pretty()

// Categorías específicas
db.cursos.find({ categoria: { $in: ["Ciencia de Datos", "Inteligencia Artificial"] } }).pretty()
```

### Agregación simple

```javascript
// Promedio de precios por categoría
db.cursos.aggregate([
  {
    $group: {
      _id: "$categoria",
      precio_promedio: { $avg: "$precio" },
      total_cursos: { $sum: 1 }
    }
  }
])
```

---

## 🎯 Próximos Pasos

1. ✅ Instalar mongosh y Node.js
2. ✅ Conectarse a MongoDB Atlas
3. ✅ Ejecutar el script de inserción: `node insertar_datos.js`
4. ✅ Explorar las consultas en la carpeta `consultas/`
5. ✅ Ejecutar las agregaciones en `05_agregaciones.js`

---

## 📝 Notas Importantes

- La base de datos se llama **LearnHubDB** (no "learnhub")
- El script de inserción crea 100 documentos por colección (500 totales)
- Todas las consultas están listas para ejecutar en mongosh
- Los scripts están comentados para facilitar el entendimiento

---

## 🤝 Soporte

Si tienes problemas:
1. Verifica la sección de "Solución de Problemas"
2. Revisa que todos los requisitos estén instalados
3. Asegúrate de estar conectado a internet
4. Verifica las credenciales de conexión

---

## 📊 Generar Dashboard HTML

El proyecto incluye un generador de dashboard HTML estático que visualiza todos los resultados de las agregaciones con gráficos interactivos.

### Generar el Dashboard

```bash
npm run dashboard
```

O directamente:

```bash
node generar_dashboard.js
```

### ¿Qué hace?

1. ✅ Se conecta a MongoDB Atlas
2. ✅ Recopila datos de todas las agregaciones
3. ✅ Genera un archivo HTML estático completo en `docs/index.html`
4. ✅ Incluye gráficos interactivos usando Chart.js
5. ✅ Análisis narrativo de todos los resultados

### Características del Dashboard

- 📈 **9 gráficos interactivos** (barras, pastel, dona, líneas)
- 📊 **Estadísticas generales** en tarjetas
- 📋 **Tablas de datos** detalladas
- 📝 **Análisis narrativo** de cada métrica
- 🎨 **Diseño responsive** y moderno
- 🌐 **100% estático** - Perfecto para GitHub Pages

### Desplegar en GitHub Pages

El dashboard generado está listo para GitHub Pages:

1. **Genera el dashboard**:
   ```bash
   npm run dashboard
   ```

2. **Configura GitHub Pages**:
   - Ve a Settings → Pages en tu repositorio
   - Selecciona la carpeta `/docs` como fuente
   - El dashboard estará disponible en: `https://TU_USUARIO.github.io/NOMBRE_REPO/`

3. **Visualizar localmente**:
   - Simplemente abre `docs/index.html` en tu navegador

### Visualizaciones Incluidas

- Cursos por Estado (gráfico de dona)
- Cursos por Categoría (gráfico de barras)
- Tiempo Total por Categoría (horas)
- Precio Promedio por Categoría
- Inscripciones por Estado
- Ingresos por Estado de Inscripción
- Top 10 Estudiantes por Progreso
- Top 10 Cursos por Tasa de Finalización
- Distribución de Calificaciones

---

## 🗺️ Diagrama de Base de Datos

El proyecto incluye un diagrama del esquema de base de datos en formato draw.io.

**Archivo**: `diagrama_bd.drawio`

### Cómo abrirlo

1. Ve a [app.diagrams.net](https://app.diagrams.net/) (anteriormente draw.io)
2. Haz clic en "Abrir archivo existente"
3. Selecciona `diagrama_bd.drawio`
4. O arrastra el archivo directamente a la página

### Contenido del Diagrama

El diagrama muestra:
- ✅ Las 5 colecciones (cursos, estudiantes, inscripciones, progreso, comentarios)
- ✅ Todos los campos de cada colección con sus tipos
- ✅ Claves primarias (PK) y foráneas (FK) marcadas
- ✅ Relaciones entre colecciones
- ✅ Diseño visual con colores diferenciados

Puedes exportarlo como PNG, PDF o SVG para incluir en tu documentación.

---

## 📚 Documentación Completa

Para documentación detallada sobre:

- ✅ **Diseño de la base de datos**: Esquema completo con explicación de cada colección
- ✅ **Explicación del código**: Análisis detallado de todas las consultas
- ✅ **Análisis de resultados**: Interpretación de agregaciones y estadísticas

Consulta el archivo: **[DOCUMENTACION.md](./DOCUMENTACION.md)**

La documentación incluye:
- Diseño del esquema de MongoDB con estructuras JSON
- Explicación línea por línea del código de consultas
- Análisis narrativo de todos los resultados de agregaciones
- Implicaciones para Big Data y aplicaciones prácticas

---

**¡Listo para empezar! 🚀**

