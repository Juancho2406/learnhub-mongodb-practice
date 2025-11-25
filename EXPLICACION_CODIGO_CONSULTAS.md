# 📚 Explicación del Código de Consultas MongoDB - LearnHub

Este documento proporciona una explicación detallada y académica del código de consultas implementado para el proyecto LearnHub, una plataforma de cursos en línea desarrollada con MongoDB para Big Data.

---

## 📋 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Archivo 01: Operaciones CRUD Básicas](#archivo-01-operaciones-crud-básicas)
3. [Archivo 02: Consultas con Filtros y Operadores](#archivo-02-consultas-con-filtros-y-operadores)
4. [Archivo 03: Agregaciones y Estadísticas](#archivo-03-agregaciones-y-estadísticas)
5. [Módulo de Conexión](#módulo-de-conexión)
6. [Conclusiones](#conclusiones)

---

## 🏗️ Arquitectura General

### Estructura del Proyecto

Los scripts de consultas están organizados en tres archivos principales, cada uno enfocado en un aspecto específico de las operaciones MongoDB:

```
consultas/
├── 01_operaciones_crud_basicas.js      # Operaciones fundamentales
├── 02_consultas_filtros_operadores.js  # Consultas avanzadas con filtros
└── 03_agregaciones_estadisticas.js     # Análisis estadístico
```

### Módulo de Conexión Compartido

Todos los scripts utilizan un módulo común de conexión (`config/connection.js`) que:
- Gestiona la autenticación con MongoDB Atlas
- Solicita la contraseña de forma segura mediante `readline`
- Establece la conexión con la base de datos `LearnHubDB`
- Proporciona funciones para cerrar la conexión correctamente

---

## 📝 Archivo 01: Operaciones CRUD Básicas

**Archivo:** `consultas/01_operaciones_crud_basicas.js`

### Propósito

Este script demuestra las operaciones fundamentales de MongoDB: **Create, Read, Update, Delete (CRUD)**, que constituyen la base de cualquier sistema de gestión de bases de datos.

### Estructura del Código

#### 1. Función Principal: `operacionesCRUD()`

La función principal encapsula todas las operaciones CRUD y maneja:
- Conexión a la base de datos
- Ejecución de operaciones
- Manejo de errores
- Cierre de conexión

```javascript
async function operacionesCRUD() {
  // Conexión, operaciones, y manejo de errores
}
```

### Operaciones Implementadas

#### 1.1. INSERT (Crear Documentos)

**INSERT ONE:**
```javascript
const nuevoCurso = {
  curso_id: "CUR201",
  titulo: "Curso de MongoDB Avanzado para Big Data",
  // ... más campos
};

const resultadoInsertOne = await db.collection('cursos').insertOne(nuevoCurso);
```

**Explicación:**
- `insertOne()` inserta un único documento en la colección `cursos`
- Retorna un objeto con `insertedId` que identifica el documento creado
- El documento se crea con todos los campos especificados en el objeto

**INSERT MANY:**
```javascript
const nuevosEstudiantes = [
  { estudiante_id: "EST201", nombre: "Ana", ... },
  { estudiante_id: "EST202", nombre: "Carlos", ... }
];

const resultadoInsertMany = await db.collection('estudiantes').insertMany(nuevosEstudiantes);
```

**Explicación:**
- `insertMany()` permite insertar múltiples documentos en una sola operación
- Recibe un array de objetos
- Retorna `insertedIds` con los IDs de todos los documentos insertados
- Es más eficiente que múltiples llamadas a `insertOne()`

#### 1.2. SELECT (Leer Documentos)

**FIND:**
```javascript
const cursosActivos = await db.collection('cursos')
  .find({ estado: "Activo" })
  .limit(3)
  .toArray();
```

**Explicación:**
- `find()` busca documentos que coincidan con el filtro especificado
- Retorna un cursor que se convierte en array con `toArray()`
- `limit()` restringe el número de resultados
- El filtro `{ estado: "Activo" }` selecciona solo cursos activos

**FIND ONE:**
```javascript
const estudiante = await db.collection('estudiantes')
  .findOne({ estudiante_id: "EST001" });
```

**Explicación:**
- `findOne()` retorna un único documento o `null` si no encuentra coincidencias
- Útil para búsquedas por identificadores únicos
- Más eficiente que `find().limit(1)` cuando se busca un documento específico

**FIND con Proyección:**
```javascript
const cursosSimples = await db.collection('cursos')
  .find({ estado: "Activo" }, { 
    projection: { titulo: 1, precio: 1, categoria: 1, _id: 0 } 
  })
  .limit(3)
  .toArray();
```

**Explicación:**
- La proyección permite seleccionar solo campos específicos
- `1` incluye el campo, `0` lo excluye
- Reduce el tamaño de los datos transferidos, mejorando el rendimiento
- `_id: 0` excluye el campo `_id` del resultado

**COUNT:**
```javascript
const totalCursos = await db.collection('cursos').countDocuments();
```

**Explicación:**
- `countDocuments()` cuenta el número de documentos que coinciden con un filtro
- Más eficiente que `find().toArray().length` para contar documentos
- Puede recibir un filtro opcional: `countDocuments({ estado: "Activo" })`

#### 1.3. UPDATE (Actualizar Documentos)

**UPDATE ONE con $set:**
```javascript
const resultadoUpdateOne = await db.collection('cursos').updateOne(
  { curso_id: "CUR001" },
  { 
    $set: { 
      precio: 175,
      estado: "Activo"
    } 
  }
);
```

**Explicación:**
- `updateOne()` actualiza el primer documento que coincide con el filtro
- `$set` reemplaza o establece valores de campos específicos
- Retorna información sobre cuántos documentos fueron modificados (`modifiedCount`)
- No afecta otros campos del documento

**UPDATE MANY con $inc:**
```javascript
const resultadoUpdateMany = await db.collection('cursos').updateMany(
  { categoria: "Ciencia de Datos" },
  { $inc: { numero_inscripciones: 10 } }
);
```

**Explicación:**
- `updateMany()` actualiza todos los documentos que coinciden con el filtro
- `$inc` incrementa (o decrementa) un valor numérico
- Útil para actualizaciones masivas basadas en condiciones
- En este caso, incrementa las inscripciones en 10 para todos los cursos de "Ciencia de Datos"

**UPDATE ONE con $push:**
```javascript
const resultadoPush = await db.collection('cursos').updateOne(
  { curso_id: "CUR002" },
  { $push: { etiquetas: "Nuevo" } }
);
```

**Explicación:**
- `$push` agrega un elemento a un array
- Si el campo no existe, lo crea como array
- Útil para agregar elementos a listas sin sobrescribir el contenido existente

**UPDATE con Múltiples Operadores:**
```javascript
const resultadoMultiple = await db.collection('progreso').updateOne(
  { progreso_id: "PRO001" },
  {
    $set: { ultima_actividad: new Date() },
    $inc: { 
      porcentaje_completado: 5,
      tiempo_estudiado_horas: 2
    }
  }
);
```

**Explicación:**
- Se pueden combinar múltiples operadores en una sola actualización
- `$set` actualiza un campo con un nuevo valor
- `$inc` incrementa valores numéricos
- Todas las operaciones se ejecutan atómicamente en el mismo documento

#### 1.4. DELETE (Eliminar Documentos)

**DELETE ONE:**
```javascript
const resultadoDeleteOne = await db.collection('comentarios').deleteOne(
  { comentario_id: "COM100" }
);
```

**Explicación:**
- `deleteOne()` elimina el primer documento que coincide con el filtro
- Retorna información sobre cuántos documentos fueron eliminados (`deletedCount`)
- Es importante verificar la existencia antes de eliminar para evitar errores

**DELETE MANY:**
```javascript
const resultadoDeleteMany = await db.collection('comentarios').deleteMany({
  $and: [
    { reportado: true },
    { moderado: false }
  ]
});
```

**Explicación:**
- `deleteMany()` elimina todos los documentos que coinciden con el filtro
- Útil para limpieza masiva de datos
- En este caso, elimina comentarios reportados que no han sido moderados
- Requiere cuidado para evitar eliminaciones accidentales

---

## 🔍 Archivo 02: Consultas con Filtros y Operadores

**Archivo:** `consultas/02_consultas_filtros_operadores.js`

### Propósito

Este script demuestra el uso de operadores de MongoDB para realizar consultas avanzadas y filtrar documentos de manera precisa y eficiente.

### Operadores Implementados

#### 2.1. Operadores de Comparación

**$gt (Greater Than - Mayor que):**
```javascript
const cursosCaros = await db.collection('cursos')
  .find({ precio: { $gt: 150 } })
  .limit(5)
  .toArray();
```

**Explicación:**
- `$gt` selecciona documentos donde el campo es mayor que el valor especificado
- Útil para rangos numéricos y fechas
- En este caso, encuentra cursos con precio superior a $150

**$lt (Less Than - Menor que):**
```javascript
const cursosCortos = await db.collection('cursos')
  .find({ duracion_horas: { $lt: 30 } })
  .limit(5)
  .toArray();
```

**Explicación:**
- `$lt` selecciona documentos donde el campo es menor que el valor especificado
- Complementa `$gt` para definir rangos

**$gte y $lte (Mayor o igual / Menor o igual):**
```javascript
const cursosRangoPrecio = await db.collection('cursos')
  .find({
    precio: { $gte: 100, $lte: 200 }
  })
  .limit(5)
  .toArray();
```

**Explicación:**
- `$gte` (greater than or equal) y `$lte` (less than or equal) permiten rangos inclusivos
- Combinados, definen un rango completo de valores
- Útil para filtros de precios, fechas, edades, etc.

**$ne (Not Equal - No igual):**
```javascript
const cursosNoInactivos = await db.collection('cursos')
  .find({ estado: { $ne: "Inactivo" } })
  .limit(5)
  .toArray();
```

**Explicación:**
- `$ne` selecciona documentos donde el campo no es igual al valor especificado
- Útil para excluir valores específicos
- En este caso, encuentra cursos que NO están inactivos

#### 2.2. Operadores de Array

**$in (In - En lista):**
```javascript
const categoriasEspecificas = ["Ciencia de Datos", "Inteligencia Artificial"];
const cursosCategorias = await db.collection('cursos')
  .find({
    categoria: { $in: categoriasEspecificas }
  })
  .limit(5)
  .toArray();
```

**Explicación:**
- `$in` selecciona documentos donde el campo coincide con cualquier valor en el array
- Equivalente a múltiples condiciones `$or` pero más eficiente
- Útil para filtrar por múltiples valores posibles

**$nin (Not In - No en lista):**
```javascript
const paisesExcluidos = ["España", "Venezuela"];
const estudiantesFiltrados = await db.collection('estudiantes')
  .find({
    pais: { $nin: paisesExcluidos }
  })
  .limit(5)
  .toArray();
```

**Explicación:**
- `$nin` selecciona documentos donde el campo NO coincide con ningún valor en el array
- Útil para excluir múltiples valores
- Complementa `$in` para filtros de exclusión

#### 2.3. Operadores Lógicos

**$and (Y lógico):**
```javascript
const cursosAnd = await db.collection('cursos')
  .find({
    $and: [
      { precio: { $lt: 100 } },
      { duracion_horas: { $gt: 20 } },
      { estado: "Activo" }
    ]
  })
  .limit(5)
  .toArray();
```

**Explicación:**
- `$and` requiere que TODAS las condiciones se cumplan
- Útil para consultas complejas con múltiples requisitos
- Todas las condiciones deben ser verdaderas para que el documento coincida

**$or (O lógico):**
```javascript
const cursosOr = await db.collection('cursos')
  .find({
    $or: [
      { nivel: "Avanzado" },
      { calificacion_promedio: { $gt: "4.5" } }
    ]
  })
  .limit(5)
  .toArray();
```

**Explicación:**
- `$or` requiere que AL MENOS UNA condición se cumpla
- Útil para consultas con alternativas
- El documento coincide si cualquiera de las condiciones es verdadera

**Combinación de $and y $or:**
```javascript
const consultaCompleja = await db.collection('cursos')
  .find({
    $and: [
      { estado: "Activo" },
      {
        $or: [
          { categoria: "Ciencia de Datos" },
          { categoria: "Inteligencia Artificial" }
        ]
      }
    ]
  })
  .limit(5)
  .toArray();
```

**Explicación:**
- Los operadores lógicos pueden anidarse para crear consultas complejas
- En este caso: cursos activos Y (Ciencia de Datos O Inteligencia Artificial)
- Permite modelar lógica booleana compleja

#### 2.4. Operadores de Expresión Regular

**$regex (Búsqueda de texto):**
```javascript
const estudiantesEmail = await db.collection('estudiantes')
  .find({
    email: { $regex: /estudiante[1-5]@/ }
  })
  .limit(5)
  .toArray();
```

**Explicación:**
- `$regex` permite búsquedas de texto usando expresiones regulares
- Útil para búsquedas parciales y patrones complejos
- En este caso, busca emails que contengan "estudiante1" a "estudiante5"

**$regex case-insensitive:**
```javascript
const cursosTitulo = await db.collection('cursos')
  .find({
    titulo: { $regex: /programación/i }
  })
  .limit(5)
  .toArray();
```

**Explicación:**
- La bandera `i` hace la búsqueda insensible a mayúsculas/minúsculas
- Útil para búsquedas de texto amigables al usuario
- Encuentra "Programación", "programación", "PROGRAMACIÓN", etc.

**$regex con inicio de cadena:**
```javascript
const cursosInicio = await db.collection('cursos')
  .find({
    titulo: { $regex: /^Curso de Desarrollo/ }
  })
  .limit(5)
  .toArray();
```

**Explicación:**
- El símbolo `^` indica inicio de cadena
- Útil para búsquedas que deben comenzar con un texto específico
- En este caso, encuentra títulos que empiezan con "Curso de Desarrollo"

#### 2.5. Operador de Existencia

**$exists:**
```javascript
const comentariosConUtil = await db.collection('comentarios')
  .find({
    util: { $exists: true, $gt: 0 }
  })
  .limit(5)
  .toArray();
```

**Explicación:**
- `$exists: true` verifica que el campo exista en el documento
- Puede combinarse con otros operadores
- Útil para documentos con esquemas flexibles
- En este caso, encuentra comentarios que tienen el campo `util` y su valor es mayor que 0

#### 2.6. Consultas Combinadas Complejas

**Múltiples operadores combinados:**
```javascript
const cursosPopulares = await db.collection('cursos')
  .find({
    $and: [
      { precio: { $gte: 100, $lte: 200 } },
      { numero_inscripciones: { $gt: 200 } },
      { calificacion_promedio: { $gte: "4.0" } },
      { estado: { $in: ["Activo", "En revisión"] } }
    ]
  })
  .sort({ numero_inscripciones: -1 })
  .limit(5)
  .toArray();
```

**Explicación:**
- Combina múltiples operadores para consultas muy específicas
- `sort()` ordena los resultados (1 = ascendente, -1 = descendente)
- Define criterios complejos de búsqueda
- En este caso: cursos populares con precio entre $100-$200, más de 200 inscripciones, calificación >= 4.0, y estado activo o en revisión

**Rango de fechas:**
```javascript
const cursosRecientes = await db.collection('cursos')
  .find({
    fecha_creacion: {
      $gte: new Date(2024, 0, 1),
      $lt: new Date(2025, 0, 1)
    }
  })
  .limit(5)
  .toArray();
```

**Explicación:**
- Los operadores de comparación funcionan con fechas
- `new Date()` crea objetos de fecha para comparación
- Útil para filtrar por períodos temporales
- En este caso, encuentra cursos creados durante el año 2024

---

## 📊 Archivo 03: Agregaciones y Estadísticas

**Archivo:** `consultas/03_agregaciones_estadisticas.js`

### Propósito

Este script demuestra el uso del **Framework de Agregación de MongoDB** para realizar análisis estadísticos complejos, calcular métricas y generar reportes sobre los datos.

### Conceptos Fundamentales

El Framework de Agregación procesa documentos a través de una **pipeline** (tubería) de etapas, donde cada etapa transforma los documentos y pasa el resultado a la siguiente etapa.

### Operaciones Estadísticas Implementadas

#### 3.1. COUNT - Contar Documentos

**Conteo Simple:**
```javascript
const totalCursos = await db.collection('cursos').countDocuments();
```

**Explicación:**
- `countDocuments()` cuenta documentos que coinciden con un filtro
- Método directo y eficiente para conteos simples

**Conteo con Agregación:**
```javascript
const conteoPorEstado = await db.collection('cursos').aggregate([
  {
    $group: {
      _id: "$estado",
      total: { $sum: 1 }
    }
  },
  {
    $sort: { total: -1 }
  }
]).toArray();
```

**Explicación:**
- `$group` agrupa documentos por un campo (`_id`)
- `$sum: 1` cuenta un documento por cada grupo
- `$sort` ordena los resultados
- Retorna el conteo agrupado por estado

#### 3.2. SUM - Sumar Valores

**Suma por Categoría:**
```javascript
const tiempoTotalPorCategoria = await db.collection('cursos').aggregate([
  {
    $group: {
      _id: "$categoria",
      total_horas: { $sum: "$duracion_horas" },
      total_cursos: { $sum: 1 }
    }
  },
  {
    $sort: { total_horas: -1 }
  },
  {
    $limit: 5
  }
]).toArray();
```

**Explicación:**
- `$sum: "$duracion_horas"` suma los valores del campo `duracion_horas` por grupo
- `$sum: 1` cuenta el número de documentos en cada grupo
- `$limit` restringe el número de resultados
- Calcula el tiempo total de contenido por categoría

**Suma de Montos:**
```javascript
const montoTotalInscripciones = await db.collection('inscripciones').aggregate([
  {
    $group: {
      _id: "$estado",
      monto_total: { $sum: "$monto_pagado" },
      total_inscripciones: { $sum: 1 }
    }
  },
  {
    $sort: { monto_total: -1 }
  }
]).toArray();
```

**Explicación:**
- Agrupa inscripciones por estado
- Suma los montos pagados en cada grupo
- Calcula ingresos totales por estado de inscripción

#### 3.3. AVG - Promediar Valores

**Promedio de Precios:**
```javascript
const precioPromedioPorCategoria = await db.collection('cursos').aggregate([
  {
    $group: {
      _id: "$categoria",
      precio_promedio: { $avg: "$precio" },
      precio_minimo: { $min: "$precio" },
      precio_maximo: { $max: "$precio" }
    }
  },
  {
    $sort: { precio_promedio: -1 }
  }
]).toArray();
```

**Explicación:**
- `$avg` calcula el promedio de valores numéricos
- `$min` y `$max` encuentran valores extremos
- Combina múltiples operaciones estadísticas en una sola agregación
- Proporciona análisis completo de precios por categoría

**Promedio de Calificaciones:**
```javascript
const promedioCalificaciones = await db.collection('comentarios').aggregate([
  {
    $match: { curso_id: "CUR001" }
  },
  {
    $group: {
      _id: "$curso_id",
      promedio_calificacion: { $avg: "$calificacion" },
      total_comentarios: { $sum: 1 },
      calificacion_maxima: { $max: "$calificacion" },
      calificacion_minima: { $min: "$calificacion" }
    }
  }
]).toArray();
```

**Explicación:**
- `$match` filtra documentos antes de agrupar (equivalente a `find()`)
- Filtra comentarios de un curso específico
- Calcula estadísticas de calificaciones para ese curso
- Útil para análisis de satisfacción estudiantil

**Promedio de Progreso:**
```javascript
const progresoPromedioEstudiantes = await db.collection('progreso').aggregate([
  {
    $group: {
      _id: "$estudiante_id",
      progreso_promedio: { $avg: "$porcentaje_completado" },
      total_cursos: { $sum: 1 },
      horas_totales: { $sum: "$tiempo_estudiado_horas" }
    }
  },
  {
    $sort: { progreso_promedio: -1 }
  },
  {
    $limit: 5
  }
]).toArray();
```

**Explicación:**
- Agrupa por estudiante para calcular métricas individuales
- Promedio de progreso en todos los cursos del estudiante
- Suma total de horas estudiadas
- Identifica estudiantes con mejor rendimiento

#### 3.4. MIN y MAX - Valores Extremos

**Precios Extremos:**
```javascript
const preciosExtremos = await db.collection('cursos').aggregate([
  {
    $group: {
      _id: null,
      precio_minimo: { $min: "$precio" },
      precio_maximo: { $max: "$precio" }
    }
  }
]).toArray();

const cursoBarato = await db.collection('cursos').findOne({ precio: extremos.precio_minimo });
const cursoCaro = await db.collection('cursos').findOne({ precio: extremos.precio_maximo });
```

**Explicación:**
- `_id: null` agrupa todos los documentos en un solo grupo
- Encuentra valores mínimos y máximos globales
- Luego busca los documentos específicos con esos valores
- Útil para identificar casos extremos

**Curso Más Popular:**
```javascript
const cursoPopular = await db.collection('cursos').aggregate([
  {
    $sort: { numero_inscripciones: -1 }
  },
  {
    $limit: 1
  },
  {
    $project: {
      titulo: 1,
      categoria: 1,
      numero_inscripciones: 1,
      calificacion_promedio: 1,
      precio: 1
    }
  }
]).toArray();
```

**Explicación:**
- `$sort` ordena documentos antes de limitar
- `$limit: 1` toma solo el primer documento (el más popular)
- `$project` selecciona campos específicos del resultado
- Encuentra el curso con más inscripciones

#### 3.5. Agregaciones Complejas

**Estadísticas Completas por Categoría:**
```javascript
const estadisticasCategoria = await db.collection('cursos').aggregate([
  {
    $group: {
      _id: "$categoria",
      total_cursos: { $sum: 1 },
      precio_promedio: { $avg: "$precio" },
      precio_minimo: { $min: "$precio" },
      precio_maximo: { $max: "$precio" },
      duracion_promedio: { $avg: "$duracion_horas" },
      total_inscripciones: { $sum: "$numero_inscripciones" },
      inscripciones_promedio: { $avg: "$numero_inscripciones" }
    }
  },
  {
    $sort: { total_cursos: -1 }
  }
]).toArray();
```

**Explicación:**
- Combina múltiples operaciones estadísticas en una sola agregación
- Calcula métricas completas por categoría
- Proporciona análisis exhaustivo de cada categoría
- Útil para reportes ejecutivos y dashboards

**Tasa de Finalización:**
```javascript
const tasaFinalizacion = await db.collection('progreso').aggregate([
  {
    $group: {
      _id: "$curso_id",
      total_estudiantes: { $sum: 1 },
      completados: {
        $sum: {
          $cond: [{ $eq: ["$porcentaje_completado", 100] }, 1, 0]
        }
      },
      progreso_promedio: { $avg: "$porcentaje_completado" }
    }
  },
  {
    $project: {
      curso_id: "$_id",
      total_estudiantes: 1,
      completados: 1,
      tasa_finalizacion: {
        $multiply: [
          { $divide: ["$completados", "$total_estudiantes"] },
          100
        ]
      },
      progreso_promedio: 1
    }
  },
  {
    $sort: { tasa_finalizacion: -1 }
  },
  {
    $limit: 5
  }
]).toArray();
```

**Explicación:**
- `$cond` es un operador condicional (if-then-else)
- `$eq` compara valores (equality)
- `$divide` divide dos valores
- `$multiply` multiplica valores
- `$project` calcula nuevos campos derivados
- Calcula la tasa de finalización como porcentaje
- Identifica cursos con mejor tasa de completitud

**Estadísticas de Inscripciones:**
```javascript
const statsInscripciones = await db.collection('inscripciones').aggregate([
  {
    $group: {
      _id: "$estado",
      total: { $sum: 1 },
      monto_promedio: { $avg: "$monto_pagado" },
      monto_total: { $sum: "$monto_pagado" },
      certificados_obtenidos: {
        $sum: {
          $cond: ["$certificado_obtenido", 1, 0]
        }
      }
    }
  },
  {
    $project: {
      estado: "$_id",
      total: 1,
      monto_promedio: { $round: ["$monto_promedio", 2] },
      monto_total: { $round: ["$monto_total", 2] },
      certificados_obtenidos: 1,
      tasa_certificacion: {
        $multiply: [
          { $divide: ["$certificados_obtenidos", "$total"] },
          100
        ]
      }
    }
  },
  {
    $sort: { total: -1 }
  }
]).toArray();
```

**Explicación:**
- `$round` redondea valores a un número específico de decimales
- Calcula múltiples métricas financieras y de certificación
- Proporciona análisis completo del estado de las inscripciones
- Útil para análisis de ingresos y tasas de certificación

---

## 🔌 Módulo de Conexión

**Archivo:** `config/connection.js`

### Funcionalidad

El módulo de conexión centraliza la lógica de conexión a MongoDB Atlas y proporciona:

1. **Autenticación Segura:**
   - Solicita la contraseña mediante `readline` (no se muestra en pantalla)
   - Construye la URI de conexión de forma segura

2. **Gestión de Conexión:**
   - Establece conexión con MongoDB Atlas
   - Retorna el cliente y la base de datos
   - Proporciona función para cerrar la conexión

3. **Manejo de Errores:**
   - Captura errores de autenticación
   - Cierra recursos correctamente en caso de error

### Uso en los Scripts

Todos los scripts de consultas siguen el mismo patrón:

```javascript
const { conectarMongoDB, cerrarConexion } = require('../config/connection');

async function miFuncion() {
  let client = null;
  try {
    const { client: mongoClient, db } = await conectarMongoDB();
    client = mongoClient;
    
    // Operaciones con la base de datos
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await cerrarConexion(client);
    }
  }
}
```

---

## 🎯 Conclusiones

### Resumen de Operaciones

Los tres archivos de consultas cubren:

1. **Operaciones CRUD Básicas:**
   - Creación, lectura, actualización y eliminación de documentos
   - Fundamentos de cualquier aplicación MongoDB

2. **Consultas Avanzadas:**
   - Filtros complejos con múltiples operadores
   - Búsquedas de texto y rangos
   - Lógica booleana compleja

3. **Análisis Estadístico:**
   - Agregaciones para calcular métricas
   - Análisis de datos para Big Data
   - Generación de reportes y dashboards

### Aplicación en Big Data

Estas consultas son fundamentales para:

- **Análisis de Datos:** Procesar grandes volúmenes de información
- **Business Intelligence:** Generar métricas y KPIs
- **Reportes Ejecutivos:** Dashboards y visualizaciones
- **Toma de Decisiones:** Datos para estrategias de negocio

### Buenas Prácticas Implementadas

1. **Código Modular:** Separación de responsabilidades
2. **Manejo de Errores:** Try-catch y finally para limpieza
3. **Documentación:** Comentarios claros y explicativos
4. **Eficiencia:** Uso de índices implícitos y proyecciones
5. **Seguridad:** Autenticación segura y gestión de conexiones

---

## 📖 Referencias

- [MongoDB Documentation - CRUD Operations](https://docs.mongodb.com/manual/crud/)
- [MongoDB Documentation - Query Operators](https://docs.mongodb.com/manual/reference/operator/query/)
- [MongoDB Documentation - Aggregation Framework](https://docs.mongodb.com/manual/aggregation/)
- [Node.js MongoDB Driver](https://mongodb.github.io/node-mongodb-native/)

---

**Documento generado para:** Proyecto LearnHub - Práctica MongoDB Big Data  
**Fecha:** 2024  
**Autor:** Sistema de Documentación Automática

