// ============================================================
// CONSULTAS DE AGREGACIÓN PARA CALCULAR ESTADÍSTICAS
// LEARNHUB - MongoDB
// Ejecutar: node consultas/03_agregaciones_estadisticas.js
// ============================================================

const { conectarMongoDB, cerrarConexion } = require('../config/connection');

// ============================================================
// FUNCIONES DE AGREGACIÓN Y ESTADÍSTICAS
// ============================================================

async function agregacionesEstadisticas() {
  let client = null;
  
  try {
    // Conectar a MongoDB
    const { client: mongoClient, db } = await conectarMongoDB();
    client = mongoClient;
    
    console.log(' EJECUTANDO AGREGACIONES Y ESTADÍSTICAS\n');
    console.log('='.repeat(60));
    
    // ============================================================
    // 1. COUNT - CONTAR DOCUMENTOS
    // ============================================================
    console.log('\n1️⃣  COUNT - Contar Documentos');
    console.log('-'.repeat(60));
    
    // Contar total de documentos por colección
    console.log('\n Contar total de documentos por colección:');
    const conteos = {
      cursos: await db.collection('cursos').countDocuments(),
      estudiantes: await db.collection('estudiantes').countDocuments(),
      inscripciones: await db.collection('inscripciones').countDocuments(),
      progreso: await db.collection('progreso').countDocuments(),
      comentarios: await db.collection('comentarios').countDocuments()
    };
    
    for (const [coleccion, cantidad] of Object.entries(conteos)) {
      console.log(`   • ${coleccion}: ${cantidad} documentos`);
    }
    
    console.log(`\n    TOTAL: ${Object.values(conteos).reduce((a, b) => a + b, 0)} documentos`);
    
    // Contar con condiciones
    console.log('\n Contar cursos activos:');
    const cursosActivos = await db.collection('cursos').countDocuments({ estado: "Activo" });
    console.log(`    Cursos activos: ${cursosActivos}`);
    
    // Contar con agregación
    console.log('\n Contar por estado usando agregación:');
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
    
    conteoPorEstado.forEach(estado => {
      console.log(`   • ${estado._id}: ${estado.total} cursos`);
    });
    
    // ============================================================
    // 2. SUM - SUMAR VALORES
    // ============================================================
    console.log('\n\n2️⃣  SUM - Sumar Valores');
    console.log('-'.repeat(60));
    
    // Sumar total de horas de cursos
    console.log('\n Sumar tiempo total de cursos por categoría:');
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
    
    tiempoTotalPorCategoria.forEach(cat => {
      console.log(`   • ${cat._id}: ${cat.total_horas}h (${cat.total_cursos} cursos)`);
    });
    
    // Sumar monto total de inscripciones
    console.log('\n Sumar monto total de inscripciones por estado:');
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
    
    montoTotalInscripciones.forEach(estado => {
      console.log(`   • ${estado._id}: $${estado.monto_total.toFixed(2)} (${estado.total_inscripciones} inscripciones)`);
    });
    
    // ============================================================
    // 3. AVG - PROMEDIAR VALORES
    // ============================================================
    console.log('\n\n3️⃣  AVG - Promediar Valores');
    console.log('-'.repeat(60));
    
    // Promedio de precios por categoría
    console.log('\n Promedio de precios por categoría:');
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
    
    precioPromedioPorCategoria.forEach(cat => {
      console.log(`   • ${cat._id}:`);
      console.log(`     Promedio: $${cat.precio_promedio.toFixed(2)}`);
      console.log(`     Mínimo: $${cat.precio_minimo}, Máximo: $${cat.precio_maximo}`);
    });
    
    // Promedio de calificaciones por curso
    console.log('\n Promedio de calificaciones del curso CUR001:');
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
    
    if (promedioCalificaciones.length > 0) {
      const resultado = promedioCalificaciones[0];
      console.log(`   • Curso: ${resultado._id}`);
      console.log(`     Promedio: ${resultado.promedio_calificacion.toFixed(2)}`);
      console.log(`     Total comentarios: ${resultado.total_comentarios}`);
      console.log(`     Rango: ${resultado.calificacion_minima} - ${resultado.calificacion_maxima}`);
    } else {
      console.log('   ⚠️  No se encontraron comentarios para CUR001');
    }
    
    // Promedio de progreso por estudiante
    console.log('\n Top 5 estudiantes con mayor progreso promedio:');
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
    
    progresoPromedioEstudiantes.forEach((est, index) => {
      console.log(`   ${index + 1}. ${est._id}:`);
      console.log(`      Progreso promedio: ${est.progreso_promedio.toFixed(2)}%`);
      console.log(`      Total cursos: ${est.total_cursos}`);
      console.log(`      Horas estudiadas: ${est.horas_totales}h`);
    });
    
    // ============================================================
    // 4. MIN y MAX - VALORES MÍNIMOS Y MÁXIMOS
    // ============================================================
    console.log('\n\n4️⃣  MIN y MAX - Valores Mínimos y Máximos');
    console.log('-'.repeat(60));
    
    // Curso más caro y más barato
    console.log('\n Curso más caro y más barato:');
    
    // Obtener precios extremos
    const preciosExtremos = await db.collection('cursos').aggregate([
      {
        $group: {
          _id: null,
          precio_minimo: { $min: "$precio" },
          precio_maximo: { $max: "$precio" }
        }
      }
    ]).toArray();
    
    if (preciosExtremos.length > 0) {
      const extremos = preciosExtremos[0];
      const cursoBarato = await db.collection('cursos').findOne({ precio: extremos.precio_minimo });
      const cursoCaro = await db.collection('cursos').findOne({ precio: extremos.precio_maximo });
      
      if (cursoBarato) {
        console.log(`   • Más barato: ${cursoBarato.titulo} - $${cursoBarato.precio}`);
      }
      if (cursoCaro) {
        console.log(`   • Más caro: ${cursoCaro.titulo} - $${cursoCaro.precio}`);
      }
    }
    
    // Curso con más inscripciones
    console.log('\n Curso más popular (mayor número de inscripciones):');
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
    
    if (cursoPopular.length > 0) {
      const curso = cursoPopular[0];
      console.log(`   • Curso: ${curso.titulo}`);
      console.log(`     Inscripciones: ${curso.numero_inscripciones}`);
      console.log(`     Categoría: ${curso.categoria}`);
      console.log(`     Calificación: ${curso.calificacion_promedio}`);
      console.log(`     Precio: $${curso.precio}`);
    }
    
    // ============================================================
    // 5. AGREGACIONES COMPLEJAS CON MÚLTIPLES OPERACIONES
    // ============================================================
    console.log('\n\n5️⃣  AGREGACIONES COMPLEJAS');
    console.log('-'.repeat(60));
    
    // Estadísticas completas por categoría
    console.log('\n Estadísticas completas por categoría:');
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
    
    estadisticasCategoria.forEach(cat => {
      console.log(`\n   📚 ${cat._id}:`);
      console.log(`      Total cursos: ${cat.total_cursos}`);
      console.log(`      Precio: $${cat.precio_promedio.toFixed(2)} ($${cat.precio_minimo}-$${cat.precio_maximo})`);
      console.log(`      Duración promedio: ${cat.duracion_promedio.toFixed(2)}h`);
      console.log(`      Total inscripciones: ${cat.total_inscripciones} (promedio: ${cat.inscripciones_promedio.toFixed(2)})`);
    });
    
    // Tasa de finalización por curso
    console.log('\n Tasa de finalización por curso (top 5):');
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
    
    tasaFinalizacion.forEach((curso, index) => {
      console.log(`   ${index + 1}. ${curso.curso_id}:`);
      console.log(`      Tasa finalización: ${curso.tasa_finalizacion.toFixed(2)}%`);
      console.log(`      Progreso promedio: ${curso.progreso_promedio.toFixed(2)}%`);
      console.log(`      Estudiantes: ${curso.total_estudiantes} (${curso.completados} completados)`);
    });
    
    // Estadísticas de inscripciones por estado
    console.log('\n Estadísticas de inscripciones por estado:');
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
    
    statsInscripciones.forEach(stat => {
      console.log(`\n   📋 ${stat.estado}:`);
      console.log(`      Total inscripciones: ${stat.total}`);
      console.log(`      Monto promedio: $${stat.monto_promedio}`);
      console.log(`      Monto total: $${stat.monto_total}`);
      console.log(`      Certificados: ${stat.certificados_obtenidos} (${stat.tasa_certificacion.toFixed(2)}%)`);
    });
    
    // ============================================================
    // RESUMEN FINAL
    // ============================================================
    console.log('\n\n' + '='.repeat(60));
    console.log(' AGREGACIONES Y ESTADÍSTICAS COMPLETADAS');
    console.log('='.repeat(60));
    console.log('\n Operaciones estadísticas demostradas:');
    console.log('   • COUNT: Contar documentos');
    console.log('   • SUM: Sumar valores');
    console.log('   • AVG: Calcular promedios');
    console.log('   • MIN/MAX: Valores extremos');
    console.log('   • Agregaciones complejas con múltiples operaciones');
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('authentication')) {
      console.error('   Verifica tu contraseña e intenta nuevamente.\n');
    }
    process.exit(1);
  } finally {
    if (client) {
      await cerrarConexion(client);
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  console.log('🚀 AGREGACIONES Y ESTADÍSTICAS - LEARNHUB\n');
  agregacionesEstadisticas();
}

module.exports = { agregacionesEstadisticas };

