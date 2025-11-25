// ============================================================
// MÓDULO DE CONEXIÓN A MONGODB - LEARNHUB
// ============================================================

const { MongoClient } = require('mongodb');
const readline = require('readline');

// Configuración
const MONGO_USER = 'juansaavedra2406_db_user';
const MONGO_CLUSTER = 'learnhub-mongodb-practi.ooamqa8.mongodb.net';
const DB_NAME = 'LearnHubDB';

// Crear interfaz para leer input del usuario
function crearInterfaz() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// Función para pedir contraseña
function pedirPassword(rl) {
  return new Promise((resolve) => {
    rl.question('🔐 Ingresa tu contraseña de MongoDB: ', (password) => {
      resolve(password);
    });
  });
}

// Función para conectar a MongoDB
async function conectarMongoDB(password = null) {
  let rl = null;
  
  try {
    // Si no se proporciona contraseña, pedirla
    if (!password) {
      rl = crearInterfaz();
      password = await pedirPassword(rl);
    }
    
    console.log('\n🔄 Conectando a MongoDB...\n');
    
    // Construir URL de conexión
    const uri = `mongodb+srv://${MONGO_USER}:${password}@${MONGO_CLUSTER}/${DB_NAME}?retryWrites=true&w=majority`;
    
    // Conectar
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Conectado exitosamente a MongoDB Atlas!\n');
    
    const db = client.db(DB_NAME);
    
    // Cerrar interfaz si se creó
    if (rl) {
      rl.close();
    }
    
    return { client, db };
    
  } catch (error) {
    if (rl) {
      rl.close();
    }
    throw error;
  }
}

// Función para cerrar conexión
async function cerrarConexion(client) {
  try {
    await client.close();
    console.log('\n✅ Conexión cerrada correctamente\n');
  } catch (error) {
    console.error('❌ Error al cerrar conexión:', error.message);
  }
}

module.exports = {
  conectarMongoDB,
  cerrarConexion,
  MONGO_USER,
  MONGO_CLUSTER,
  DB_NAME
};

