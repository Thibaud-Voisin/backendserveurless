const express = require('express');
const app = express();
const multer = require('multer');
const { Pool } = require('pg');
app.use(express.json());
const port = process.env.PORT || 80
const cors = require('cors')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // In a production environment, you should use a valid certificate.
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });``

app.use(cors())

app.get('/test', (req, res) => {
  console.log('test');
  res.send('ok');
});

app.get('/init-database', async (req, res) => {
  try {
    const client = await pool.connect();

    try {
      // Check and initialize cart table
      await initializeTable(client, 'cart', `
        CREATE TABLE cart (
          id SERIAL PRIMARY KEY,
          string_value VARCHAR(2555555) NOT NULL
        )
      `);

      // Check and initialize status table
      await initializeTable(client, 'status', `
        CREATE TABLE status (
          id SERIAL PRIMARY KEY,
          int_value VARCHAR(2555555) NOT NULL
        )
      `);

      res.send('Databases initialized successfully');
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Error initializing databases:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function initializeTable(client, tableName, createTableQuery) {
  // Check if the table exists
  const checkTableQuery = `SELECT to_regclass('${tableName}') as table_exists`;
  const result = await client.query(checkTableQuery);
  const tableExists = result.rows[0].table_exists;

  if (tableExists) {
    // Table exists, drop it
    const dropTableQuery = `DROP TABLE ${tableName}`;
    await client.query(dropTableQuery);
  }

  // Create the table
  await client.query(createTableQuery);
}


app.get('/get_cart', async (req, res) => {
  const ress = await pool.query('SELECT * FROM cart ORDER BY id DESC LIMIT 1');
  if (ress.rows.length == 0) {
    res.sendStatus(400);
  }
  res.send(JSON.parse(ress.rows[0].string_value));
});

app.get('/info_avance', async (req, res) => {
  const ress = await pool.query('SELECT * FROM status ORDER BY id DESC LIMIT 1');
  if (ress.rows.length == 0) {
    res.send(0);
  }
  else {
    res.send('' + ress.rows[0].int_value);
  }
});

app.post('/send_cart', async (req, res) => {
  
  const result = await pool.query('INSERT INTO cart (string_value) VALUES ($1)', [JSON.stringify(req.body)]);
    console.log(req);
    console.log(req.body);
    res.send('Good');
});

app.post('/send_status', async (req, res) => {
  const result = await pool.query('INSERT INTO status (int_value) VALUES ($1)', [1]);
    console.log(req);
    console.log(req.body);
    res.send('Good');
});

app.post('/update_status', async (req, res) => {
  let intt = (JSON.parse(JSON.stringify(req.body)).valuee);
  const result = await pool.query('UPDATE status SET int_value = ($1) WHERE id = (SELECT MAX(id) FROM status)', [intt]);
  console.log(req);
    console.log(req.body);
    res.send('Good');
});

    



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});