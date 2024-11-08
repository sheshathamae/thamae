// server.jsx
const bodyParser = require('body-parser');
const express = require('express');
const mysql = require('mysql2');
const cors=require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());
const PORT = 5000;

// Database connection
const connection = mysql.createConnection({
  host: 'localhost',  // Change from 'localhost' to '127.0.0.1'
  port: 3306,          // Ensure this is the correct MAMP MySQL port
  user: 'root',
  password: 'root',
  database: 'stock_inventory',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MAMP MySQL database:', err);
  } else {
    console.log('Connected to MAMP MySQL database.');
  }
});

// Test route
app.get('/', (req, res) => {
  res.send('Server is running and connected to the database!');
});

// Close the database connection when the server stops
process.on('SIGINT', () => {
  connection.end((err) => {
    console.log('Database connection closed.');
    process.exit(err ? 1 : 0);
  });
});

// Sign-up endpoint
app.post('/signup', (req, res) => {
  const { name, password } = req.body;

  // Check if the user already exists
  const checkUserSql = 'SELECT * FROM Users WHERE name = ?';
  connection.query(checkUserSql, [name], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length > 0) {
      // User already exists
      return res.status(409).json({ message: 'User already exists' });
    }

    // Insert new user
    const insertUserSql = 'INSERT INTO Users (name, password) VALUES (?, ?)';
    connection.query(insertUserSql, [name, password], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Server error' });
      }
      res.status(201).json({ message: 'Sign up successful!' });
    });
  });
});


// Login endpoint
app.post('/login', (req, res) => {
  const { name, password } = req.body;

  const sql = 'SELECT * FROM Users WHERE name = ? AND password = ?';
  connection.query(sql, [name, password], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Server error' });
    } else if (results.length > 0) {
      const user = results[0];
      res.status(200).json({ message: 'Login successful!', user });
    } else {
      res.status(401).json({ message: 'Invalid name or password' });
    }
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { name, password } = req.body;

  // Check if the user exists
  const sql = 'SELECT * FROM Users WHERE name = ?';
  connection.query(sql, [name], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      // User not found
      return res.status(401).json({ message: 'Invalid name or password' });
    }

    const user = results[0];

    // Compare the provided password with the hashed password in the database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Server error' });
      }

      if (!isMatch) {
        // Password does not match
        return res.status(401).json({ message: 'Invalid name or password' });
      }

      // Successful login
      res.status(200).json({ message: 'Login successful!', user: { id: user.id, name: user.name } });
    });
  });
});

// Get all users
app.get('/users', (req, res) => {
  const sql = 'SELECT id, name FROM Users'; // Select only necessary fields
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json(results);
  });
});

// Add a new user
app.post('/users', (req, res) => {
  const { name, password } = req.body;

  // Hash the password before saving
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: 'Error hashing password' });

    const sql = 'INSERT INTO Users (name, password) VALUES (?, ?)';
    connection.query(sql, [name, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error' });

      res.status(201).json({ id: result.insertId, name });
    });
  });
});

// Update a user
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, password } = req.body;

  // Hash the new password before updating
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: 'Error hashing password' });

    const sql = 'UPDATE Users SET name = ?, password = ? WHERE id = ?';
    connection.query(sql, [name, hashedPassword, id], (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error' });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ id: parseInt(id), name });
    });
  });
});

// Delete a user
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM Users WHERE id = ?';
  connection.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(204).end();
  });
});

// POST /products - Add a new product
app.post('/products', (req, res) => {
  const { name, description, category, price, quantity } = req.body;

  // Check for missing fields
  if (!name || !price || !quantity) {
    return res.status(400).json({ message: 'Name, price, and quantity are required' });
  }

  // Prepare the SQL query to insert the new product
  const sql = 'INSERT INTO Products (name, description, category, price, quantity) VALUES (?, ?, ?, ?, ?)';

  // Execute the query
  connection.query(sql, [name, description, category, price, quantity], (err, result) => {
    if (err) {
      console.error('Error inserting product: ', err);
      return res.status(500).json({ message: 'Error adding product to database' });
    }

    // Send back the created product as response
    const newProduct = { id: result.insertId, name, description, category, price, quantity };
    res.status(201).json(newProduct); // Return the created product
  });
});

// Get all products
app.get('/products', (req, res) => {
  const sql = 'SELECT * FROM Products';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching products: ', err);
      return res.status(500).json({ message: 'Error fetching products from database' });
    }
    res.json(results);
  });
});

// Get a single product by ID
app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM Products WHERE id = ?';
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error fetching product: ', err);
      return res.status(500).json({ message: 'Error fetching product from database' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(results[0]);
  });
});

// Create a new product
app.post('/products', (req, res) => {
  const { name, description, category, price, quantity } = req.body;

  // Check for missing fields
  if (!name || !price || !quantity) {
    return res.status(400).json({ message: 'Name, price, and quantity are required' });
  }

  const sql = 'INSERT INTO Products (name, description, category, price, quantity) VALUES (?, ?, ?, ?, ?)';
  connection.query(sql, [name, description, category, price, quantity], (err, result) => {
    if (err) {
      console.error('Error adding product: ', err);
      return res.status(500).json({ message: 'Error adding product to database' });
    }
    const newProduct = { id: result.insertId, name, description, category, price, quantity };
    res.status(201).json(newProduct);
  });
});

// Update an existing product
app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, quantity } = req.body;

  // Prepare SQL to update product
  const sql = 'UPDATE Products SET name = ?, description = ?, category = ?, price = ?, quantity = ? WHERE id = ?';
  connection.query(sql, [name, description, category, price, quantity, id], (err, result) => {
    if (err) {
      console.error('Error updating product: ', err);
      return res.status(500).json({ message: 'Error updating product in database' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ id, name, description, category, price, quantity });
  });
});

// Delete a product
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM Products WHERE id = ?';
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting product: ', err);
      return res.status(500).json({ message: 'Error deleting product from database' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(204).end(); // No content to return
  });
});

// Add stock for a product
app.post('/products/:id/stock/add', (req, res) => {
  const productId = parseInt(req.params.id);
  const { quantity } = req.body;

  // Ensure quantity is a positive number
  if (!quantity || quantity <= 0) return res.status(400).send('Invalid quantity.');

  // Check if the product exists in the database
  const sql = 'SELECT * FROM Products WHERE id = ?';
  connection.query(sql, [productId], (err, results) => {
    if (err) {
      console.error('Error checking product: ', err);
      return res.status(500).send('Server error');
    }
    if (results.length === 0) {
      return res.status(404).send('Product not found.');
    }

    const product = results[0];
    
    // Update the stock quantity for the product
    const updatedQuantity = product.quantity + quantity;
    const updateSql = 'UPDATE Products SET quantity = ? WHERE id = ?';
    connection.query(updateSql, [updatedQuantity, productId], (err, result) => {
      if (err) {
        console.error('Error updating stock: ', err);
        return res.status(500).send('Server error');
      }

      // Return the updated product data without transaction information
      res.json({ product: { ...product, quantity: updatedQuantity } });
    });
  });
});

// Deduct stock for a product
app.post('/products/:id/stock/deduct', (req, res) => {
  const productId = parseInt(req.params.id);
  const { quantity } = req.body;

  // Ensure quantity is a positive number and product has enough stock
  if (!quantity || quantity <= 0) return res.status(400).send('Invalid quantity.');

  const sql = 'SELECT * FROM Products WHERE id = ?';
  connection.query(sql, [productId], (err, results) => {
    if (err) {
      console.error('Error checking product: ', err);
      return res.status(500).send('Server error');
    }
    if (results.length === 0) {
      return res.status(404).send('Product not found.');
    }

    const product = results[0];

    // Check if there's enough stock to deduct
    if (product.quantity < quantity) return res.status(400).send('Stock cannot be negative.');

    // Deduct the stock quantity
    const updatedQuantity = product.quantity - quantity;
    const updateSql = 'UPDATE Products SET quantity = ? WHERE id = ?';
    connection.query(updateSql, [updatedQuantity, productId], (err, result) => {
      if (err) {
        console.error('Error updating stock: ', err);
        return res.status(500).send('Server error');
      }

      // Return the updated product data without transaction information
      res.json({ product: { ...product, quantity: updatedQuantity } });
    });
  });
});

// Get a specific product by ID
app.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);

  const sql = 'SELECT * FROM Products WHERE id = ?';
  connection.query(sql, [productId], (err, results) => {
    if (err) {
      console.error('Error fetching product: ', err);
      return res.status(500).send('Server error');
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(results[0]);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
