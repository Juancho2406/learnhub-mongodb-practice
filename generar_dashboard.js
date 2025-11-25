// ============================================================
// GENERADOR DE DASHBOARD HTML ESTÁTICO
// Ejecutar: node generar_dashboard.js
// ============================================================

const { conectarMongoDB, cerrarConexion } = require('./config/connection');
const fs = require('fs');
const path = require('path');

async function generarDashboard() {
  let client = null;
  
  try {
    console.log('🔄 Conectando a MongoDB...\n');
    const { client: mongoClient, db } = await conectarMongoDB();
    client = mongoClient;
    console.log('✅ Conectado exitosamente!\n');
    
    console.log('📊 Recopilando datos para el dashboard...\n');
    
    // ============================================================
    // RECOPILAR DATOS PARA EL DASHBOARD
    // ============================================================
    
    // 1. Conteos generales
    const conteos = {
      cursos: await db.collection('cursos').countDocuments(),
      estudiantes: await db.collection('estudiantes').countDocuments(),
      inscripciones: await db.collection('inscripciones').countDocuments(),
      progreso: await db.collection('progreso').countDocuments(),
      comentarios: await db.collection('comentarios').countDocuments()
    };
    
    // 2. Cursos por estado
    const cursosPorEstado = await db.collection('cursos').aggregate([
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
    
    // 3. Cursos por categoría
    const cursosPorCategoria = await db.collection('cursos').aggregate([
      {
        $group: {
          _id: "$categoria",
          total: { $sum: 1 },
          precio_promedio: { $avg: "$precio" },
          inscripciones_total: { $sum: "$numero_inscripciones" }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]).toArray();
    
    // 4. Tiempo total por categoría
    const tiempoPorCategoria = await db.collection('cursos').aggregate([
      {
        $group: {
          _id: "$categoria",
          total_horas: { $sum: "$duracion_horas" },
          duracion_promedio: { $avg: "$duracion_horas" }
        }
      },
      {
        $sort: { total_horas: -1 }
      }
    ]).toArray();
    
    // 5. Precio promedio por categoría
    const precioPorCategoria = await db.collection('cursos').aggregate([
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
    
    // 6. Inscripciones por estado
    const inscripcionesPorEstado = await db.collection('inscripciones').aggregate([
      {
        $group: {
          _id: "$estado",
          total: { $sum: 1 },
          monto_total: { $sum: "$monto_pagado" },
          monto_promedio: { $avg: "$monto_pagado" },
          certificados: {
            $sum: {
              $cond: ["$certificado_obtenido", 1, 0]
            }
          }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]).toArray();
    
    // 7. Top estudiantes por progreso
    const topEstudiantes = await db.collection('progreso').aggregate([
      {
        $group: {
          _id: "$estudiante_id",
          progreso_promedio: { $avg: "$porcentaje_completado" },
          total_cursos: { $sum: 1 },
          horas_totales: { $sum: "$tiempo_estudiado_horas" },
          cursos_completados: {
            $sum: {
              $cond: [{ $eq: ["$porcentaje_completado", 100] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { progreso_promedio: -1 }
      },
      {
        $limit: 10
      }
    ]).toArray();
    
    // 8. Tasa de finalización por curso
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
        $limit: 10
      }
    ]).toArray();
    
    // 9. Calificaciones promedio por curso
    const calificacionesPorCurso = await db.collection('comentarios').aggregate([
      {
        $group: {
          _id: "$curso_id",
          promedio_calificacion: { $avg: "$calificacion" },
          total_comentarios: { $sum: 1 },
          calificacion_maxima: { $max: "$calificacion" },
          calificacion_minima: { $min: "$calificacion" }
        }
      },
      {
        $match: { total_comentarios: { $gte: 1 } }
      },
      {
        $sort: { promedio_calificacion: -1 }
      },
      {
        $limit: 10
      }
    ]).toArray();
    
    // Asegurar que todos los arrays tengan datos
    if (calificacionesPorCurso.length === 0) {
      calificacionesPorCurso.push({
        _id: "N/A",
        promedio_calificacion: 0,
        total_comentarios: 0
      });
    }
    
    // 10. Distribución de calificaciones
    const distribucionCalificaciones = await db.collection('comentarios').aggregate([
      {
        $group: {
          _id: "$calificacion",
          total: { $sum: 1 },
          promedio_util: { $avg: "$util" }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]).toArray();
    
    console.log('✅ Datos recopilados exitosamente\n');
    console.log('📝 Generando dashboard HTML...\n');
    
    // Generar HTML
    const html = generarHTML({
      conteos,
      cursosPorEstado,
      cursosPorCategoria,
      tiempoPorCategoria,
      precioPorCategoria,
      inscripcionesPorEstado,
      topEstudiantes,
      tasaFinalizacion,
      calificacionesPorCurso,
      distribucionCalificaciones
    });
    
    // Guardar archivo
    const outputPath = path.join(__dirname, 'docs', 'index.html');
    const docsDir = path.join(__dirname, 'docs');
    
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, html, 'utf8');
    console.log(`✅ Dashboard generado exitosamente en: ${outputPath}\n`);
    console.log('📊 Para visualizar:');
    console.log('   1. Abre docs/index.html en tu navegador');
    console.log('   2. O despliega en GitHub Pages\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await cerrarConexion(client);
    }
  }
}

function generarHTML(data) {
  const {
    conteos,
    cursosPorEstado,
    cursosPorCategoria,
    tiempoPorCategoria,
    precioPorCategoria,
    inscripcionesPorEstado,
    topEstudiantes,
    tasaFinalizacion,
    calificacionesPorCurso,
    distribucionCalificaciones
  } = data;
  
    // Preparar datos para gráficos con validación
    const estadosLabels = cursosPorEstado.length > 0 ? cursosPorEstado.map(e => e._id) : ['Sin datos'];
    const estadosData = cursosPorEstado.length > 0 ? cursosPorEstado.map(e => e.total) : [0];
    
    const categoriasLabels = cursosPorCategoria.length > 0 ? cursosPorCategoria.map(c => c._id) : ['Sin datos'];
    const categoriasData = cursosPorCategoria.length > 0 ? cursosPorCategoria.map(c => c.total) : [0];
    
    const tiempoData = tiempoPorCategoria.length > 0 ? tiempoPorCategoria.map(c => c.total_horas) : [0];
    
    const precioPromedioData = precioPorCategoria.length > 0 ? precioPorCategoria.map(c => parseFloat(c.precio_promedio.toFixed(2))) : [0];
    
    const inscripcionesLabels = inscripcionesPorEstado.length > 0 ? inscripcionesPorEstado.map(i => i._id) : ['Sin datos'];
    const inscripcionesData = inscripcionesPorEstado.length > 0 ? inscripcionesPorEstado.map(i => i.total) : [0];
    const ingresosData = inscripcionesPorEstado.length > 0 ? inscripcionesPorEstado.map(i => parseFloat(i.monto_total.toFixed(2))) : [0];
    
    const topEstLabels = topEstudiantes.length > 0 ? topEstudiantes.map(e => e._id) : ['Sin datos'];
    const topEstProgreso = topEstudiantes.length > 0 ? topEstudiantes.map(e => parseFloat(e.progreso_promedio.toFixed(2))) : [0];
    
    const tasaFinLabels = tasaFinalizacion.length > 0 ? tasaFinalizacion.map(t => t.curso_id) : ['Sin datos'];
    const tasaFinData = tasaFinalizacion.length > 0 ? tasaFinalizacion.map(t => parseFloat(t.tasa_finalizacion.toFixed(2))) : [0];
    
    const califLabels = calificacionesPorCurso.length > 0 ? calificacionesPorCurso.map(c => c._id) : ['Sin datos'];
    const califData = calificacionesPorCurso.length > 0 ? calificacionesPorCurso.map(c => parseFloat(c.promedio_calificacion.toFixed(2))) : [0];
    
    const distCalifLabels = distribucionCalificaciones.length > 0 ? distribucionCalificaciones.map(d => `Calificación ${d._id}`) : ['Sin datos'];
    const distCalifData = distribucionCalificaciones.length > 0 ? distribucionCalificaciones.map(d => d.total) : [0];
  
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LearnHub - Dashboard de Análisis MongoDB</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        header {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 30px;
            text-align: center;
        }
        
        h1 {
            color: #667eea;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            font-size: 1.1em;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .chart-container {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            position: relative;
            height: 400px;
        }
        
        .chart-container canvas {
            max-height: 340px !important;
            width: 100% !important;
            height: auto !important;
        }
        
        canvas {
            display: block;
            margin: 0 auto;
        }
        
        .chart-title {
            font-size: 1.3em;
            color: #333;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 600;
        }
        
        .analysis-section {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .analysis-section h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 1.8em;
        }
        
        .analysis-item {
            margin-bottom: 25px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        
        .analysis-item h3 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .analysis-item p {
            color: #666;
            line-height: 1.6;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        th {
            background: #667eea;
            color: white;
            font-weight: 600;
        }
        
        tr:hover {
            background: #f8f9fa;
        }
        
        footer {
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            text-align: center;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎓 LearnHub Analytics Dashboard</h1>
            <p class="subtitle">Análisis de Datos MongoDB - Big Data</p>
        </header>
        
        <!-- Estadísticas Generales -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${conteos.cursos}</div>
                <div class="stat-label">Cursos</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${conteos.estudiantes}</div>
                <div class="stat-label">Estudiantes</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${conteos.inscripciones}</div>
                <div class="stat-label">Inscripciones</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${conteos.progreso}</div>
                <div class="stat-label">Registros de Progreso</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${conteos.comentarios}</div>
                <div class="stat-label">Comentarios</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Object.values(conteos).reduce((a, b) => a + b, 0)}</div>
                <div class="stat-label">Total Documentos</div>
            </div>
        </div>
        
        <!-- Gráficos -->
        <div class="charts-grid">
            <div class="chart-container">
                <div class="chart-title">Cursos por Estado</div>
                <canvas id="chartEstados"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Cursos por Categoría</div>
                <canvas id="chartCategorias"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Tiempo Total de Contenido por Categoría (horas)</div>
                <canvas id="chartTiempo"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Precio Promedio por Categoría ($)</div>
                <canvas id="chartPrecio"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Inscripciones por Estado</div>
                <canvas id="chartInscripciones"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Ingresos por Estado de Inscripción ($)</div>
                <canvas id="chartIngresos"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Top 10 Estudiantes por Progreso Promedio (%)</div>
                <canvas id="chartTopEstudiantes"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Top 10 Cursos por Tasa de Finalización (%)</div>
                <canvas id="chartTasaFinalizacion"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Distribución de Calificaciones en Comentarios</div>
                <canvas id="chartDistribucionCalif"></canvas>
            </div>
        </div>
        
        <!-- Análisis de Resultados -->
        <div class="analysis-section">
            <h2>📊 Análisis de Resultados</h2>
            
            <div class="analysis-item">
                <h3>1. Distribución de Cursos por Estado</h3>
                <p>El análisis muestra ${cursosPorEstado.length > 0 ? cursosPorEstado.map(e => `${e._id}: ${e.total} cursos`).join(', ') : 'sin datos disponibles'}. Esta distribución indica ${conteos.cursos > 0 ? 'un catálogo equilibrado con aproximadamente ' + Math.round((cursosPorEstado.find(e => e._id === 'Activo')?.total || 0) / conteos.cursos * 100) + '% de cursos activos disponibles para los estudiantes' : 'que no hay datos disponibles'}. Los cursos "En revisión" representan un proceso activo de actualización de contenido, mientras que los cursos "Inactivos" pueden ser temporales o descontinuados.</p>
            </div>
            
            <div class="analysis-item">
                <h3>2. Análisis por Categoría</h3>
                <p>${cursosPorCategoria.length > 0 ? `La categoría "${cursosPorCategoria[0]._id}" tiene el mayor número de cursos (${cursosPorCategoria[0].total}), seguida por otras categorías. Esta distribución permite identificar áreas de mayor contenido y oportunidades de expansión. ${tiempoPorCategoria.length > 0 ? `La categoría con mayor contenido en horas es "${tiempoPorCategoria[0]._id}" con ${tiempoPorCategoria[0].total_horas} horas totales, lo que representa una inversión significativa en contenido educativo.` : ''}` : 'No hay datos disponibles para analizar por categoría.'}</p>
            </div>
            
            <div class="analysis-item">
                <h3>3. Análisis Financiero</h3>
                <p>${inscripcionesPorEstado.length > 0 ? `El estado "${inscripcionesPorEstado[0]._id}" tiene ${inscripcionesPorEstado[0].total} inscripciones con un monto total de $${inscripcionesPorEstado[0].monto_total.toFixed(2)}. El monto promedio por inscripción es de $${inscripcionesPorEstado[0].monto_promedio.toFixed(2)}. Los estudiantes en progreso representan ingresos potenciales futuros, mientras que los cursos completados indican ingresos confirmados y satisfacción del cliente.` : 'No hay datos de inscripciones disponibles para análisis financiero.'}</p>
            </div>
            
            <div class="analysis-item">
                <h3>4. Progreso Estudiantil</h3>
                <p>${topEstudiantes.length > 0 ? `El estudiante ${topEstudiantes[0]._id} tiene el mayor progreso promedio con ${topEstudiantes[0].progreso_promedio.toFixed(2)}%, completando ${topEstudiantes[0].cursos_completados} cursos de ${topEstudiantes[0].total_cursos} totales. Ha dedicado ${topEstudiantes[0].horas_totales} horas de estudio. Estos estudiantes representan usuarios comprometidos y son candidatos ideales para programas de certificación avanzada o comunidades de práctica.` : 'No hay datos de progreso estudiantil disponibles.'}</p>
            </div>
            
            <div class="analysis-item">
                <h3>5. Tasa de Finalización</h3>
                <p>${tasaFinalizacion.length > 0 ? `El curso ${tasaFinalizacion[0].curso_id} tiene la mayor tasa de finalización con ${tasaFinalizacion[0].tasa_finalizacion.toFixed(2)}%, con ${tasaFinalizacion[0].completados} estudiantes completados de ${tasaFinalizacion[0].total_estudiantes} inscritos. El progreso promedio de ${tasaFinalizacion[0].progreso_promedio.toFixed(2)}% indica un buen engagement. Estas métricas ayudan a identificar factores de éxito en el diseño de cursos.` : 'No hay datos de tasa de finalización disponibles.'}</p>
            </div>
            
            <div class="analysis-item">
                <h3>6. Calificaciones y Satisfacción</h3>
                <p>${distribucionCalificaciones.length > 0 ? `La distribución de calificaciones muestra ${distribucionCalificaciones.map(d => `Calificación ${d._id}: ${d.total} comentarios`).join(', ')}. ${calificacionesPorCurso.length > 0 ? `El curso ${calificacionesPorCurso[0]._id} tiene la mejor calificación promedio con ${calificacionesPorCurso[0].promedio_calificacion.toFixed(2)} de 5.0 basado en ${calificacionesPorCurso[0].total_comentarios} comentarios. Esto indica satisfacción estudiantil y calidad del contenido.` : ''}` : 'No hay datos de calificaciones disponibles.'}</p>
            </div>
        </div>
        
        <!-- Tabla de Top Estudiantes -->
        <div class="analysis-section">
            <h2>🏆 Top 10 Estudiantes por Progreso</h2>
            <table>
                <thead>
                    <tr>
                        <th>Estudiante ID</th>
                        <th>Progreso Promedio (%)</th>
                        <th>Total Cursos</th>
                        <th>Cursos Completados</th>
                        <th>Horas Estudiadas</th>
                    </tr>
                </thead>
                <tbody>
                    ${topEstudiantes.map(e => `
                        <tr>
                            <td>${e._id}</td>
                            <td>${e.progreso_promedio.toFixed(2)}%</td>
                            <td>${e.total_cursos}</td>
                            <td>${e.cursos_completados}</td>
                            <td>${e.horas_totales}h</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <footer>
            <p>LearnHub MongoDB Analytics Dashboard | Generado automáticamente</p>
            <p>Base de Datos: LearnHubDB | ${new Date().toLocaleString('es-ES')}</p>
        </footer>
    </div>
    
    <script>
        // Esperar a que el DOM esté completamente cargado antes de inicializar gráficos
        document.addEventListener('DOMContentLoaded', function() {
        // Configuración de colores
        const colors = {
            primary: 'rgba(102, 126, 234, 0.8)',
            secondary: 'rgba(118, 75, 162, 0.8)',
            success: 'rgba(40, 167, 69, 0.8)',
            warning: 'rgba(255, 193, 7, 0.8)',
            danger: 'rgba(220, 53, 69, 0.8)',
            info: 'rgba(23, 162, 184, 0.8)'
        };
        
        const chartColors = [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(40, 167, 69, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(220, 53, 69, 0.8)',
            'rgba(23, 162, 184, 0.8)',
            'rgba(255, 87, 34, 0.8)',
            'rgba(156, 39, 176, 0.8)'
        ];
        
        // Definir arrays de datos
        const estadosLabels = ${JSON.stringify(estadosLabels)};
        const estadosData = ${JSON.stringify(estadosData)};
        const categoriasLabels = ${JSON.stringify(categoriasLabels)};
        const categoriasData = ${JSON.stringify(categoriasData)};
        const tiempoData = ${JSON.stringify(tiempoData)};
        const precioPromedioData = ${JSON.stringify(precioPromedioData)};
        const inscripcionesLabels = ${JSON.stringify(inscripcionesLabels)};
        const inscripcionesData = ${JSON.stringify(inscripcionesData)};
        const ingresosData = ${JSON.stringify(ingresosData)};
        const topEstLabels = ${JSON.stringify(topEstLabels)};
        const topEstProgreso = ${JSON.stringify(topEstProgreso)};
        const tasaFinLabels = ${JSON.stringify(tasaFinLabels)};
        const tasaFinData = ${JSON.stringify(tasaFinData)};
        const califLabels = ${JSON.stringify(califLabels)};
        const califData = ${JSON.stringify(califData)};
        const distCalifLabels = ${JSON.stringify(distCalifLabels)};
        const distCalifData = ${JSON.stringify(distCalifData)};
        
        // Cursos por Estado
        new Chart(document.getElementById('chartEstados'), {
            type: 'doughnut',
            data: {
                labels: estadosLabels,
                datasets: [{
                    data: estadosData,
                    backgroundColor: chartColors.slice(0, estadosLabels.length)
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Cursos por Categoría
        new Chart(document.getElementById('chartCategorias'), {
            type: 'bar',
            data: {
                labels: categoriasLabels,
                datasets: [{
                    label: 'Número de Cursos',
                    data: categoriasData,
                    backgroundColor: colors.primary
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        // Tiempo por Categoría
        new Chart(document.getElementById('chartTiempo'), {
            type: 'bar',
            data: {
                labels: categoriasLabels,
                datasets: [{
                    label: 'Horas Totales',
                    data: tiempoData,
                    backgroundColor: colors.info
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        // Precio Promedio
        new Chart(document.getElementById('chartPrecio'), {
            type: 'bar',
            data: {
                labels: categoriasLabels,
                datasets: [{
                    label: 'Precio Promedio ($)',
                    data: precioPromedioData,
                    backgroundColor: colors.warning
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        // Inscripciones por Estado
        new Chart(document.getElementById('chartInscripciones'), {
            type: 'pie',
            data: {
                labels: inscripcionesLabels,
                datasets: [{
                    data: inscripcionesData,
                    backgroundColor: chartColors.slice(0, inscripcionesLabels.length)
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Ingresos por Estado
        new Chart(document.getElementById('chartIngresos'), {
            type: 'bar',
            data: {
                labels: inscripcionesLabels,
                datasets: [{
                    label: 'Ingresos Totales ($)',
                    data: ingresosData,
                    backgroundColor: colors.success
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        // Top Estudiantes
        new Chart(document.getElementById('chartTopEstudiantes'), {
            type: 'bar',
            data: {
                labels: topEstLabels,
                datasets: [{
                    label: 'Progreso Promedio (%)',
                    data: topEstProgreso,
                    backgroundColor: colors.success
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        // Tasa de Finalización
        new Chart(document.getElementById('chartTasaFinalizacion'), {
            type: 'bar',
            data: {
                labels: tasaFinLabels,
                datasets: [{
                    label: 'Tasa de Finalización (%)',
                    data: tasaFinData,
                    backgroundColor: colors.primary
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        // Distribución de Calificaciones
        new Chart(document.getElementById('chartDistribucionCalif'), {
            type: 'bar',
            data: {
                labels: distCalifLabels,
                datasets: [{
                    label: 'Número de Comentarios',
                    data: distCalifData,
                    backgroundColor: chartColors.slice(0, distCalifLabels.length)
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        console.log('Dashboard y gráficos inicializados correctamente');
        
        // Verificar que Chart.js esté disponible
        if (typeof Chart === 'undefined') {
            console.error('❌ Chart.js no se cargó correctamente. Verifica la conexión a internet.');
        } else {
            console.log('✅ Chart.js cargado correctamente');
        }
        }); // Fin de DOMContentLoaded
    </script>
</body>
</html>`;
}

// Ejecutar si se llama directamente
if (require.main === module) {
  console.log('🚀 GENERADOR DE DASHBOARD HTML - LEARNHUB\n');
  generarDashboard();
}

module.exports = { generarDashboard };

