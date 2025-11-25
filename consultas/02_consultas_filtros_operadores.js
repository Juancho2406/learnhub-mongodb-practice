// ============================================================
// CONSULTAS CON FILTROS Y OPERADORES
// LEARNHUB - MongoDB
// Ejecutar: node consultas/02_consultas_filtros_operadores.js
// ============================================================

const { conectarMongoDB, cerrarConexion } = require('../config/connection');

// ============================================================
// FUNCIONES DE CONSULTA CON FILTROS Y OPERADORES
// ============================================================

async function consultasConFiltros() {
  let client = null;
  
  try {
    // Conectar a MongoDB
    const { client: mongoClient, db } = await conectarMongoDB();
    client = mongoClient;
    
    console.log('🔍 EJECUTANDO CONSULTAS CON FILTROS Y OPERADORES\n');
    console.log('='.repeat(60));
    
    // ============================================================
    // OPERADORES DE COMPARACIÓN
    // ============================================================
    console.log('\n1️⃣  OPERADORES DE COMPARACIÓN');
    console.log('-'.repeat(60));
    
    // $gt - Mayor que
    console.log('\n $gt (Greater Than): Cursos con precio mayor a 150');
    const cursosCaros = await db.collection('cursos')
      .find({ precio: { $gt: 150 } })
      .limit(5)
      .toArray();
    
    console.log(`Encontrados ${cursosCaros.length} cursos con precio > $150:`);
    cursosCaros.forEach((curso, index) => {
      console.log(`   ${index + 1}. ${curso.titulo} - Precio: $${curso.precio}`);
    });
    
    // $lt - Menor que
    console.log('\n $lt (Less Than): Cursos con duración menor a 30 horas');
    const cursosCortos = await db.collection('cursos')
      .find({ duracion_horas: { $lt: 30 } })
      .limit(5)
      .toArray();
    
    console.log(`Encontrados ${cursosCortos.length} cursos con duración < 30h:`);
    cursosCortos.forEach((curso, index) => {
      console.log(`   ${index + 1}. ${curso.titulo} - Duración: ${curso.duracion_horas}h`);
    });
    
    // $gte y $lte - Mayor o igual / Menor o igual
    console.log('\n $gte y $lte: Precio entre 100 y 200');
    const cursosRangoPrecio = await db.collection('cursos')
      .find({
        precio: { $gte: 100, $lte: 200 }
      })
      .limit(5)
      .toArray();
    
    console.log(`Encontrados ${cursosRangoPrecio.length} cursos con precio entre $100-$200:`);
    cursosRangoPrecio.forEach((curso, index) => {
      console.log(`   ${index + 1}. ${curso.titulo} - Precio: $${curso.precio}`);
    });
    
    // $ne - No igual
    console.log('\n $ne (Not Equal): Cursos que NO están inactivos');
    const cursosNoInactivos = await db.collection('cursos')
      .find({ estado: { $ne: "Inactivo" } })
      .limit(5)
      .toArray();
    
    console.log(`Encontrados ${cursosNoInactivos.length} cursos activos o en revisión:`);
    cursosNoInactivos.forEach((curso, index) => {
      console.log(`   ${index + 1}. ${curso.titulo} - Estado: ${curso.estado}`);
    });
    
    // ============================================================
    // OPERADORES DE ARRAY
    // ============================================================
    console.log('\n\n2️⃣  OPERADORES DE ARRAY');
    console.log('-'.repeat(60));
    
    // $in - En lista
    console.log('\n $in (In): Cursos de categorías específicas');
    const categoriasEspecificas = ["Ciencia de Datos", "Inteligencia Artificial"];
    const cursosCategorias = await db.collection('cursos')
      .find({
        categoria: { $in: categoriasEspecificas }
      })
      .limit(5)
      .toArray();
    
    console.log(`Encontrados ${cursosCategorias.length} cursos de Ciencia de Datos o IA:`);
    cursosCategorias.forEach((curso, index) => {
      console.log(`   ${index + 1}. ${curso.titulo} - Categoría: ${curso.categoria}`);
    });
    
    // $nin - No en lista
    console.log('\n $nin (Not In): Estudiantes que NO son de ciertos países');
    const paisesExcluidos = ["España", "Venezuela"];
    const estudiantesFiltrados = await db.collection('estudiantes')
      .find({
        pais: { $nin: paisesExcluidos }
      })
      .limit(5)
      .toArray();
    
    console.log(`Encontrados ${estudiantesFiltrados.length} estudiantes de otros países:`);
    estudiantesFiltrados.forEach((est, index) => {
      console.log(`   ${index + 1}. ${est.nombre} ${est.apellido} - País: ${est.pais}`);
    });
    
    // ============================================================
    // OPERADORES LÓGICOS
    // ============================================================
    console.log('\n\n3️⃣  OPERADORES LÓGICOS');
    console.log('-'.repeat(60));
    
    // $and - Múltiples condiciones
    console.log('\n $and: Múltiples condiciones (precio < 100, duración > 20h, activo)');
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
    
    console.log(`Encontrados ${cursosAnd.length} cursos que cumplen todas las condiciones:`);
    cursosAnd.forEach((curso, index) => {
      console.log(`   ${index + 1}. ${curso.titulo}`);
      console.log(`      Precio: $${curso.precio}, Duración: ${curso.duracion_horas}h, Estado: ${curso.estado}`);
    });
    
    // $or - Condiciones alternativas
    console.log('\n $or: Condiciones alternativas (avanzado O calificación > 4.5)');
    const cursosOr = await db.collection('cursos')
      .find({
        $or: [
          { nivel: "Avanzado" },
          { calificacion_promedio: { $gt: "4.5" } }
        ]
      })
      .limit(5)
      .toArray();
    
    console.log(`Encontrados ${cursosOr.length} cursos avanzados o con calificación > 4.5:`);
    cursosOr.forEach((curso, index) => {
      console.log(`   ${index + 1}. ${curso.titulo}`);
      console.log(`      Nivel: ${curso.nivel}, Calificación: ${curso.calificacion_promedio}`);
    });
    
    // Combinación de $and y $or
    console.log('\n Combinación $and y $or: Cursos activos Y (Ciencia de Datos O IA)');
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
    
    console.log(`Encontrados ${consultaCompleja.length} cursos:`);
    consultaCompleja.forEach((curso, index) => {
      console.log(`   ${index + 1}. ${curso.titulo} - ${curso.categoria}`);
    });
    
    // ============================================================
    // OPERADORES DE EXPRESIÓN REGULAR
    // ============================================================
    console.log('\n\n4️⃣  OPERADORES DE EXPRESIÓN REGULAR');
    console.log('-'.repeat(60));
    
    // $regex - Búsqueda de texto
    console.log('\n $regex: Búsqueda de texto en emails');
    const estudiantesEmail = await db.collection('estudiantes')
      .find({
        email: { $regex: /estudiante[1-5]@/ }
      })
      .limit(5)
      .toArray();
    
    console.log(`Encontrados ${estudiantesEmail.length} estudiantes con email que contiene 'estudiante1-5@':`);
    estudiantesEmail.forEach((est, index) => {
      console.log(`   ${index + 1}. ${est.email}`);
    });
    
    // $regex case-insensitive
    console.log('\n $regex case-insensitive: Búsqueda en títulos');
    const cursosTitulo = await db.collection('cursos')
      .find({
        titulo: { $regex: /programación/i }
      })
      .limit(5)
      .toArray();
    
    console.log(`Encontrados ${cursosTitulo.length} cursos con 'programación' en el título:`);
    cursosTitulo.forEach((curso, index) => {
      console.log(`   ${index + 1}. ${curso.titulo}`);
    });
    
    // $regex con inicio de cadena
    console.log('\n $regex con inicio: Títulos que empiezan con "Curso de Desarrollo"');
    const cursosInicio = await db.collection('cursos')
      .find({
        titulo: { $regex: /^Curso de Desarrollo/ }
      })
      .limit(5)
      .toArray();
    
    console.log(`Encontrados ${cursosInicio.length} cursos:`);
    cursosInicio.forEach((curso, index) => {
      console.log(`   ${index + 1}. ${curso.titulo}`);
    });
    
    // ============================================================
    // OPERADOR DE EXISTENCIA
    // ============================================================
    console.log('\n\n5️⃣  OPERADOR DE EXISTENCIA');
    console.log('-'.repeat(60));
    
    // $exists - Verificar existencia de campo
    console.log('\n $exists: Comentarios con campo "util"');
    const comentariosConUtil = await db.collection('comentarios')
      .find({
        util: { $exists: true, $gt: 0 }
      })
      .limit(5)
      .toArray();
    
    console.log(`Encontrados ${comentariosConUtil.length} comentarios con utilidad > 0:`);
    comentariosConUtil.forEach((com, index) => {
      console.log(`   ${index + 1}. Util: ${com.util} - ${com.texto.substring(0, 50)}...`);
    });
    
    // ============================================================
    // CONSULTAS COMBINADAS COMPLEJAS
    // ============================================================
    console.log('\n\n6️⃣  CONSULTAS COMBINADAS COMPLEJAS');
    console.log('-'.repeat(60));
    
    // Múltiples operadores combinados
    console.log('\n Consulta compleja: Cursos populares (precio 100-200, inscripciones > 200, calificación >= 4.0, activos)');
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
    
    console.log(`Encontrados ${cursosPopulares.length} cursos populares:`);
    cursosPopulares.forEach((curso, index) => {
      console.log(`   ${index + 1}. ${curso.titulo}`);
      console.log(`      Precio: $${curso.precio}, Inscripciones: ${curso.numero_inscripciones}, Calificación: ${curso.calificacion_promedio}`);
    });
    
    // Rango de fechas
    console.log('\n Consulta con rangos de fecha: Cursos creados en 2024');
    const cursosRecientes = await db.collection('cursos')
      .find({
        fecha_creacion: {
          $gte: new Date(2024, 0, 1),
          $lt: new Date(2025, 0, 1)
        }
      })
      .limit(5)
      .toArray();
    
    console.log(`Encontrados ${cursosRecientes.length} cursos creados en 2024:`);
    cursosRecientes.forEach((curso, index) => {
      console.log(`   ${index + 1}. ${curso.titulo} - Fecha: ${curso.fecha_creacion.toISOString().split('T')[0]}`);
    });
    
    // ============================================================
    // RESUMEN FINAL
    // ============================================================
    console.log('\n\n' + '='.repeat(60));
    console.log('CONSULTAS CON FILTROS Y OPERADORES COMPLETADAS');
    console.log('='.repeat(60));
    console.log('\n📊 Operadores demostrados:');
    console.log('   • Comparación: $gt, $lt, $gte, $lte, $ne');
    console.log('   • Array: $in, $nin');
    console.log('   • Lógicos: $and, $or');
    console.log('   • Expresión regular: $regex');
    console.log('   • Existencia: $exists');
    console.log('   • Combinaciones complejas');
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
  console.log(' CONSULTAS CON FILTROS Y OPERADORES - LEARNHUB\n');
  consultasConFiltros();
}

module.exports = { consultasConFiltros };

