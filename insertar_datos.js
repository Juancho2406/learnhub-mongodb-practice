// ============================================================
// SCRIPT DE INSERCIÓN DE DATOS - LEARNHUB
// Ejecutar: node insertar_datos.js
// ============================================================

const { MongoClient } = require('mongodb');
const readline = require('readline');

// Configuración
const MONGO_USER = 'juansaavedra2406_db_user';
const MONGO_CLUSTER = 'learnhub-mongodb-practi.ooamqa8.mongodb.net';
const DB_NAME = 'LearnHubDB';

// Crear interfaz para leer input del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para pedir contraseña
function pedirPassword() {
  return new Promise((resolve) => {
    rl.question('Ingresa tu contraseña de MongoDB: ', (password) => {
      resolve(password);
    });
  });
}

// Función principal
async function insertarDatos() {
  let password;
  
  try {
    // Pedir contraseña
    password = await pedirPassword();
    console.log('\n🔄 Conectando a MongoDB...\n');
    
    // Construir URL de conexión
    const uri = `mongodb+srv://${MONGO_USER}:${password}@${MONGO_CLUSTER}/${DB_NAME}?retryWrites=true&w=majority`;
    
    // Conectar
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Conectado exitosamente!\n');
    
    const db = client.db(DB_NAME);
    
    // Verificar/crear colecciones
    console.log('📦 Creando/verificando colecciones...');
    const colecciones = ['cursos', 'estudiantes', 'inscripciones', 'progreso', 'comentarios'];
    
    for (const coleccion of colecciones) {
      try {
        await db.createCollection(coleccion);
        console.log(`  ✓ Colección '${coleccion}' creada/verificada`);
      } catch (err) {
        // La colección ya existe, está bien
        console.log(`  ✓ Colección '${coleccion}' ya existe`);
      }
    }
    
    console.log('\n📝 Insertando documentos...\n');
    
    // ============================================================
    // 1. INSERTAR CURSOS (100 documentos)
    // ============================================================
    console.log('📚 Insertando 100 cursos...');
    const categorias = ["Desarrollo Web", "Ciencia de Datos", "Inteligencia Artificial", 
                       "Seguridad Informática", "Base de Datos", "Programación", 
                       "DevOps", "Cloud Computing"];
    const niveles = ["Principiante", "Intermedio", "Avanzado"];
    const estados = ["Activo", "Inactivo", "En revisión"];
    
    const cursos = [];
    for (let i = 1; i <= 100; i++) {
      cursos.push({
        curso_id: "CUR" + String(i).padStart(3, "0"),
        titulo: `Curso de ${categorias[i % categorias.length]} Nivel ${niveles[i % niveles.length]}`,
        descripcion: `Descripción detallada del curso número ${i} sobre ${categorias[i % categorias.length]}. Este curso incluye teoría y práctica.`,
        instructor: `Instructor ${Math.ceil(i / 10)}`,
        categoria: categorias[i % categorias.length],
        nivel: niveles[i % niveles.length],
        duracion_horas: Math.floor(Math.random() * 40) + 10,
        precio: Math.floor(Math.random() * 200) + 50,
        fecha_creacion: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        estado: estados[i % estados.length],
        calificacion_promedio: (Math.random() * 2 + 3).toFixed(2),
        numero_inscripciones: Math.floor(Math.random() * 500) + 10,
        etiquetas: categorias[i % categorias.length].split(" "),
        requisitos: ["Conocimientos básicos", "Acceso a internet"]
      });
    }
    
    await db.collection('cursos').insertMany(cursos);
    console.log(`  ✅ ${cursos.length} cursos insertados`);
    
    // ============================================================
    // 2. INSERTAR ESTUDIANTES (100 documentos)
    // ============================================================
    console.log('👥 Insertando 100 estudiantes...');
    const paises = ["Colombia", "México", "Argentina", "Chile", "España", "Perú", "Ecuador", "Venezuela"];
    const generos = ["M", "F", "Otro"];
    
    const estudiantes = [];
    for (let i = 1; i <= 100; i++) {
      estudiantes.push({
        estudiante_id: "EST" + String(i).padStart(3, "0"),
        nombre: `Estudiante ${i}`,
        apellido: `Apellido ${Math.ceil(i / 5)}`,
        email: `estudiante${i}@example.com`,
        fecha_nacimiento: new Date(1990 + (i % 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        pais: paises[i % paises.length],
        ciudad: `Ciudad ${(i % 10) + 1}`,
        genero: generos[i % generos.length],
        fecha_registro: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        estado_cuenta: "Activa",
        nivel_educacion: (i % 2 === 0) ? "Universitario" : "Técnico",
        intereses: ["Tecnología", categorias[i % categorias.length]]
      });
    }
    
    await db.collection('estudiantes').insertMany(estudiantes);
    console.log(`  ✅ ${estudiantes.length} estudiantes insertados`);
    
    // ============================================================
    // 3. INSERTAR INSCRIPCIONES (100 documentos)
    // ============================================================
    console.log('📋 Insertando 100 inscripciones...');
    const inscripciones = [];
    for (let i = 1; i <= 100; i++) {
      const cursoId = "CUR" + String((i % 100) + 1).padStart(3, "0");
      const estudianteId = "EST" + String((i % 100) + 1).padStart(3, "0");
      
      inscripciones.push({
        inscripcion_id: "INS" + String(i).padStart(3, "0"),
        curso_id: cursoId,
        estudiante_id: estudianteId,
        fecha_inscripcion: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        fecha_inicio: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        fecha_fin: null,
        estado: (i % 3 === 0) ? "Completado" : (i % 3 === 1) ? "En progreso" : "Inscrito",
        metodo_pago: (i % 2 === 0) ? "Tarjeta" : "Transferencia",
        monto_pagado: Math.floor(Math.random() * 200) + 50,
        certificado_obtenido: (i % 3 === 0)
      });
    }
    
    await db.collection('inscripciones').insertMany(inscripciones);
    console.log(`  ✅ ${inscripciones.length} inscripciones insertadas`);
    
    // ============================================================
    // 4. INSERTAR PROGRESO (100 documentos)
    // ============================================================
    console.log('📊 Insertando 100 registros de progreso...');
    const progresos = [];
    for (let i = 1; i <= 100; i++) {
      const porcentaje = Math.floor(Math.random() * 100);
      
      progresos.push({
        progreso_id: "PRO" + String(i).padStart(3, "0"),
        inscripcion_id: "INS" + String((i % 100) + 1).padStart(3, "0"),
        curso_id: "CUR" + String((i % 100) + 1).padStart(3, "0"),
        estudiante_id: "EST" + String((i % 100) + 1).padStart(3, "0"),
        porcentaje_completado: porcentaje,
        lecciones_completadas: Math.floor(porcentaje / 10),
        total_lecciones: 10,
        tiempo_estudiado_horas: Math.floor(Math.random() * 50),
        ultima_actividad: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        calificacion_final: (porcentaje >= 80) ? (Math.random() * 1.5 + 3.5).toFixed(2) : null,
        fecha_completado: (porcentaje === 100) ? new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1) : null
      });
    }
    
    await db.collection('progreso').insertMany(progresos);
    console.log(`  ✅ ${progresos.length} registros de progreso insertados`);
    
    // ============================================================
    // 5. INSERTAR COMENTARIOS (100 documentos)
    // ============================================================
    console.log('💬 Insertando 100 comentarios...');
    const comentariosPositivos = [
      "Excelente curso, muy bien explicado",
      "Muy útil para mi desarrollo profesional",
      "Recomendado al 100%",
      "Contenido de calidad",
      "El instructor es muy claro"
    ];
    
    const comentariosNegativos = [
      "Falta más práctica",
      "Necesita actualización de contenido",
      "Difícil de seguir en algunas partes"
    ];
    
    const comentariosNeutros = [
      "Buen curso en general",
      "Cumple con las expectativas",
      "Interesante contenido"
    ];
    
    const comentarios = [];
    for (let i = 1; i <= 100; i++) {
      const tipoComentario = i % 3;
      let textoComentario = "";
      
      if (tipoComentario === 0) {
        textoComentario = comentariosPositivos[i % comentariosPositivos.length];
      } else if (tipoComentario === 1) {
        textoComentario = comentariosNegativos[i % comentariosNegativos.length];
      } else {
        textoComentario = comentariosNeutros[i % comentariosNeutros.length];
      }
      
      comentarios.push({
        comentario_id: "COM" + String(i).padStart(3, "0"),
        curso_id: "CUR" + String((i % 100) + 1).padStart(3, "0"),
        estudiante_id: "EST" + String((i % 100) + 1).padStart(3, "0"),
        texto: `${textoComentario} - Comentario número ${i}`,
        calificacion: Math.floor(Math.random() * 3) + 3,
        fecha_comentario: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        moderado: (i % 5 !== 0),
        util: Math.floor(Math.random() * 100),
        reportado: false
      });
    }
    
    await db.collection('comentarios').insertMany(comentarios);
    console.log(`  ✅ ${comentarios.length} comentarios insertados`);
    
    // ============================================================
    // RESUMEN FINAL
    // ============================================================
    console.log('\n' + '='.repeat(50));
    console.log('✅ INSERCIÓN COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(50));
    
    // Contar documentos insertados
    const conteos = {
      cursos: await db.collection('cursos').countDocuments(),
      estudiantes: await db.collection('estudiantes').countDocuments(),
      inscripciones: await db.collection('inscripciones').countDocuments(),
      progreso: await db.collection('progreso').countDocuments(),
      comentarios: await db.collection('comentarios').countDocuments()
    };
    
    console.log('\n📊 Resumen de documentos:');
    for (const [coleccion, cantidad] of Object.entries(conteos)) {
      console.log(`  • ${coleccion}: ${cantidad} documentos`);
    }
    
    console.log(`\n✨ Total: ${Object.values(conteos).reduce((a, b) => a + b, 0)} documentos insertados\n`);
    
    // Cerrar conexión
    await client.close();
    rl.close();
    
    console.log('🎉 ¡Proceso completado exitosamente!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('authentication')) {
      console.error('   Verifica tu contraseña e intenta nuevamente.\n');
    }
    rl.close();
    process.exit(1);
  }
}

// Ejecutar
console.log('🚀 SCRIPT DE INSERCIÓN DE DATOS - LEARNHUB\n');
console.log(`Usuario: ${MONGO_USER}`);
console.log(`Base de datos: ${DB_NAME}\n`);
insertarDatos();

