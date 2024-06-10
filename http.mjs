const http = require('http');
const fs = require('fs');
const mysql = require('mysql');

// Configuración de la conexión a la base de datos MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'funval_api'
});

// Conexión a la base de datos MySQL
connection.connect(err => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
    throw err;
  }
  console.log('Conexión a la base de datos MySQL exitosa');
});


const server = http.createServer((req, res) => {
  switch (req.url) {
    case '/':
      fs.readFile('index.html', (err, data) => {
        if (err) {
          console.error('Error al leer el archivo HTML:', err);
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end('Error interno del servidor');
          return;
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
      });
      break;
    case '/api/usuarios':
      getUsersFromDB(res);
      break;
    case '/api/usuarios/export':
      exportUsersToCSV(res);
      break;
    case '/api/usuarios/import':
      importUsersFromCSV(res);
      break;
    default:
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('Ruta no encontrada');
  }
});


function getUsersFromDB(res) {
  const query = "SELECT * FROM usuarios";
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios desde la base de datos:', err);
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('Error interno del servidor');
      return;
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(results));
  });
}


function exportUsersToCSV(res) {
  const query = "SELECT * FROM usuarios";
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al exportar usuarios a CSV:', err);
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('Error interno del servidor');
      return;
    }

    const csvData = results.map(user => `${user.id},${user.nombres},${user.apellidos},${user.direccion},${user.correo},${user.dni},${user.edad},${user.fecha_creacion},${user.telefono}`).join('\n');
    fs.writeFile('usuarios.csv', csvData, err => {
      if (err) {
        console.error('Error al escribir el archivo CSV:', err);
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Error interno del servidor');
        return;
      }

      console.log('Usuarios exportados correctamente a usuarios.csv');
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Usuarios exportados correctamente a usuarios.csv');s
    });
  });
}



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
