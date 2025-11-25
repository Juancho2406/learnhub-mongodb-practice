// ============================================================
// CONSULTAS BÁSICAS: INSERT, SELECT, UPDATE, DELETE (CRUD)
// LEARNHUB - MongoDB
// Ejecutar: node consultas/01_operaciones_crud_basicas.js
// ============================================================

const { conectarMongoDB, cerrarConexion } = require('../config/connection');

// ============================================================
// FUNCIONES DE CONSULTA
// ============================================================

async function operacionesCRUD() {
  let client = null;
  
  try {
    // Conectar a MongoDB
    const { client: mongoClient, db } = await conectarMongoDB();
    client = mongoClient;
    
    console.log('📝 EJECUTANDO OPERACIONES CRUD BÁSICAS\n');
    console.log('='.repeat(60));
    
    // ============================================================
    // 1. INSERT (CREAR) - Insertar nuevos documentos
    // ============================================================
    console.log('\n1️⃣  OPERACIÓN: INSERT (Crear Documentos)');
    console.log('-'.repeat(60));
    
    // INSERT ONE - Insertar un nuevo curso
    console.log('\nINSERT ONE: Insertar un nuevo curso');
    const nuevoCurso = {
      curso_id: "CUR201",
      titulo: "Curso de MongoDB Avanzado para Big Data",
      descripcion: "Curso completo sobre MongoDB para análisis de Big Data",
      instructor: "Instructor Especial",
      categoria: "Base de Datos",
      nivel: "Avanzado",
      duracion_horas: 60,
      precio: 300,
      fecha_creacion: new Date(),
      estado: "Activo",
      calificacion_promedio: "4.5",
      numero_inscripciones: 0,
      etiquetas: ["MongoDB", "NoSQL", "Big Data", "Agregaciones"],
      requisitos: ["Conocimientos de bases de datos"]
    };
    
    const resultadoInsertOne = await db.collection('cursos').insertOne(nuevoCurso);
    console.log(`Curso insertado con ID: ${resultadoInsertOne.insertedId}`);
    
    // INSERT MANY - Insertar múltiples estudiantes
    console.log('\n INSERT MANY: Insertar múltiples estudiantes');
    const nuevosEstudiantes = [
      {
        estudiante_id: "EST201",
        nombre: "Ana",
        apellido: "Martínez",
        email: "ana.martinez@example.com",
        fecha_nacimiento: new Date(1995, 5, 15),
        pais: "Colombia",
        ciudad: "Bogotá",
        genero: "F",
        fecha_registro: new Date(),
        estado_cuenta: "Activa",
        nivel_educacion: "Universitario",
        intereses: ["Big Data", "MongoDB"]
      },
      {
        estudiante_id: "EST202",
        nombre: "Carlos",
        apellido: "Rodríguez",
        email: "carlos.rodriguez@example.com",
        fecha_nacimiento: new Date(1998, 3, 20),
        pais: "México",
        ciudad: "Ciudad de México",
        genero: "M",
        fecha_registro: new Date(),
        estado_cuenta: "Activa",
        nivel_educacion: "Técnico",
        intereses: ["Ciencia de Datos"]
      }
    ];
    
    const resultadoInsertMany = await db.collection('estudiantes').insertMany(nuevosEstudiantes);
    console.log(` ${resultadoInsertMany.insertedIds.length} estudiantes insertados`);
    console.log(`   IDs: ${Object.values(resultadoInsertMany.insertedIds).join(', ')}`);
    
    // ============================================================
    // 2. SELECT (LEER) - Consultar documentos
    // ============================================================
    console.log('\n\n2️⃣  OPERACIÓN: SELECT (Leer Documentos)');
    console.log('-'.repeat(60));
    
    // FIND - Buscar todos los cursos activos
    console.log('\nFIND: Buscar todos los cursos activos (limitado a 3)');
    const cursosActivos = await db.collection('cursos')
      .find({ estado: "Activo" })
      .limit(3)
      .toArray();
    
    console.log(` Encontrados ${cursosActivos.length} cursos activos:`);
    cursosActivos.forEach((curso, index) => {
      console.log(`   ${index + 1}. ${curso.titulo} - Precio: $${curso.precio}`);
    });
    
    // FIND ONE - Buscar un estudiante específico
    console.log('\nFIND ONE: Buscar estudiante por ID');
    const estudiante = await db.collection('estudiantes')
      .findOne({ estudiante_id: "EST001" });
    
    if (estudiante) {
      console.log(' Estudiante encontrado:');
      console.log(`   ID: ${estudiante.estudiante_id}`);
      console.log(`   Nombre: ${estudiante.nombre} ${estudiante.apellido}`);
      console.log(`   Email: ${estudiante.email}`);
      console.log(`   País: ${estudiante.pais}`);
    } else {
      console.log('⚠️  Estudiante EST001 no encontrado');
    }
    
    // FIND con proyección - Solo campos específicos
    console.log('\nFIND con PROYECCIÓN: Cursos con solo título y precio');
    const cursosSimples = await db.collection('cursos')
      .find({ estado: "Activo" }, { projection: { titulo: 1, precio: 1, categoria: 1, _id: 0 } })
      .limit(3)
      .toArray();
    
    console.log(` Cursos encontrados:`);
    cursosSimples.forEach((curso, index) => {
      console.log(`   ${index + 1}. ${curso.titulo} - $${curso.precio} - ${curso.categoria}`);
    });
    
    // COUNT - Contar documentos
    console.log('\nCOUNT: Contar documentos en colecciones');
    const totalCursos = await db.collection('cursos').countDocuments();
    const totalEstudiantes = await db.collection('estudiantes').countDocuments();
    console.log(` Total de cursos: ${totalCursos}`);
    console.log(` Total de estudiantes: ${totalEstudiantes}`);
    
    // ============================================================
    // 3. UPDATE (ACTUALIZAR) - Modificar documentos
    // ============================================================
    console.log('\n\n3️⃣  OPERACIÓN: UPDATE (Actualizar Documentos)');
    console.log('-'.repeat(60));
    
    // UPDATE ONE con $set
    console.log('\nUPDATE ONE con $set: Actualizar precio y estado de un curso');
    const resultadoUpdateOne = await db.collection('cursos').updateOne(
      { curso_id: "CUR001" },
      { 
        $set: { 
          precio: 175,
          estado: "Activo"
        } 
      }
    );
    
    console.log(` Cursos modificados: ${resultadoUpdateOne.modifiedCount}`);
    
    // Verificar el cambio
    const cursoActualizado = await db.collection('cursos')
      .findOne({ curso_id: "CUR001" });
    
    if (cursoActualizado) {
      console.log(`   Precio actualizado a: $${cursoActualizado.precio}`);
      console.log(`   Estado: ${cursoActualizado.estado}`);
    }
    
    // UPDATE MANY con $inc
    console.log('\nUPDATE MANY con $inc: Incrementar inscripciones');
    const resultadoUpdateMany = await db.collection('cursos').updateMany(
      { categoria: "Ciencia de Datos" },
      { $inc: { numero_inscripciones: 10 } }
    );
    
    console.log(` Cursos de Ciencia de Datos actualizados: ${resultadoUpdateMany.modifiedCount}`);
    
    // UPDATE ONE con $push
    console.log('\nUPDATE ONE con $push: Agregar etiqueta a un curso');
    const resultadoPush = await db.collection('cursos').updateOne(
      { curso_id: "CUR002" },
      { $push: { etiquetas: "Nuevo" } }
    );
    
    console.log(` Etiqueta agregada: ${resultadoPush.modifiedCount} curso modificado`);
    
    // UPDATE ONE con múltiples operadores
    console.log('\nUPDATE ONE múltiple: Actualizar progreso');
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
    
    console.log(` Progreso actualizado: ${resultadoMultiple.modifiedCount} registro modificado`);
    
    // ============================================================
    // 4. DELETE (ELIMINAR) - Eliminar documentos
    // ============================================================
    console.log('\n\n4️⃣  OPERACIÓN: DELETE (Eliminar Documentos)');
    console.log('-'.repeat(60));
    
    // DELETE ONE
    console.log('\nDELETE ONE: Eliminar un comentario específico');
    
    // Primero verificar que existe
    const comentarioAEliminar = await db.collection('comentarios')
      .findOne({ comentario_id: "COM100" });
    
    if (comentarioAEliminar) {
      console.log(`   Comentario a eliminar encontrado: ${comentarioAEliminar.comentario_id}`);
      
      const resultadoDeleteOne = await db.collection('comentarios').deleteOne(
        { comentario_id: "COM100" }
      );
      
      console.log(` Comentarios eliminados: ${resultadoDeleteOne.deletedCount}`);
      
      // Verificar eliminación
      const verificarEliminacion = await db.collection('comentarios')
        .findOne({ comentario_id: "COM100" });
      
      if (!verificarEliminacion) {
        console.log('    Comentario eliminado exitosamente');
      }
    } else {
      console.log('   ⚠️  Comentario COM100 no encontrado (puede haber sido eliminado previamente)');
    }
    
    // DELETE MANY
    console.log('\nDELETE MANY: Eliminar comentarios reportados no moderados');
    const resultadoDeleteMany = await db.collection('comentarios').deleteMany({
      $and: [
        { reportado: true },
        { moderado: false }
      ]
    });
    
    console.log(` Comentarios eliminados: ${resultadoDeleteMany.deletedCount}`);
    
    // ============================================================
    // RESUMEN FINAL
    // ============================================================
    console.log('\n\n' + '='.repeat(60));
    console.log(' OPERACIONES CRUD COMPLETADAS EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log('\n📊 Resumen de operaciones realizadas:');
    console.log('   • INSERT: 1 curso + 2 estudiantes');
    console.log('   • SELECT: Múltiples consultas ejecutadas');
    console.log('   • UPDATE: Varias actualizaciones realizadas');
    console.log('   • DELETE: Eliminaciones verificadas');
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
  console.log('🚀 OPERACIONES CRUD BÁSICAS - LEARNHUB\n');
  operacionesCRUD();
}

module.exports = { operacionesCRUD };

