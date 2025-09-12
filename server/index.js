const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres connection using environment variables
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ai-chat',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

// Initialize tables
async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      contact_id INTEGER REFERENCES contacts(id),
      sender TEXT NOT NULL,
      receiver TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT NOW()
    );
  `);
}

init().catch(console.error);

// Config for OpenRouter / model
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "z-ai/glm-4.5-air:free";
const OPENROUTER_API_KEY = process.env.OPENROUTER_KEY || "your-api-key-here";

// Endpoints
app.get('/api/contacts', async (req, res) => {
  const r = await pool.query('SELECT * FROM contacts ORDER BY name');
  res.json(r.rows);
});

app.post('/api/contacts', async (req, res) => {
  const { name, phone } = req.body;
  const r = await pool.query(
    'INSERT INTO contacts (name, phone) VALUES ($1, $2) RETURNING *',
    [name, phone]
  );
  res.json(r.rows[0]);
});

// Update contact endpoint
app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const result = await pool.query(
      'UPDATE contacts SET name = $1 WHERE id = $2 RETURNING *',
      [name.trim(), id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete contact endpoint
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First delete all messages for this contact
    await pool.query('DELETE FROM messages WHERE contact_id = $1', [id]);
    
    // Then delete the contact
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({ message: 'Contact deleted successfully', contact: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/messages/:contactId', async (req, res) => {
  const { contactId } = req.params;
  const r = await pool.query(
    'SELECT * FROM messages WHERE contact_id=$1 ORDER BY id',
    [contactId]
  );
  res.json(r.rows);
});

// Clear chat endpoint - DELETE messages for a contact
app.delete('/api/messages/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    console.log(`Attempting to clear chat for contact ID: ${contactId}`);
    
    const result = await pool.query(
      'DELETE FROM messages WHERE contact_id = $1 RETURNING *',
      [contactId]
    );
    
    console.log(`Successfully deleted ${result.rows.length} messages for contact ${contactId}`);
    res.json({ 
      success: true, 
      message: `Cleared ${result.rows.length} messages`,
      deletedCount: result.rows.length
    });
  } catch (err) {
    console.error('Error clearing chat:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save message and optionally trigger auto-reply
app.post('/api/messages', async (req, res) => {
  try {
    const { contact_id, sender, receiver, content, auto_reply = true } = req.body;

    // Save user message
    const ins = await pool.query(
      `INSERT INTO messages (contact_id, sender, receiver, content) VALUES ($1,$2,$3,$4) RETURNING *`,
      [contact_id, sender, receiver, content]
    );
    const saved = ins.rows[0];

    // If auto_reply requested, generate an AI reply
    if (auto_reply) {
      // Check if this is a forwarded message
      const isForwarded = content.startsWith('Forwarded:');
      const actualContent = isForwarded ? content.replace('Forwarded:', '').trim() : content;
      
      // Enhanced system prompt for better context
      const systemPrompt = isForwarded 
        ? `You are a friendly assistant. The user has forwarded a message to you. Please respond naturally to the forwarded content as if you're seeing it for the first time. Be helpful and engaging.`
        : `You are a friendly assistant. Please respond naturally and helpfully to the user's message.`;

      const payload = {
        model: OPENROUTER_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: actualContent }
        ],
        max_tokens: 200
      };

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "AI WhatsApp Clone",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      const replyText = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a reply.";

      // Save AI reply
      const ins2 = await pool.query(
        `INSERT INTO messages (contact_id, sender, receiver, content) VALUES ($1,$2,$3,$4) RETURNING *`,
        [contact_id, receiver, sender, replyText]
      );
      saved.ai_reply = ins2.rows[0];
    }

    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a single message by ID
app.delete('/api/messages/single/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    
    console.log(`Attempting to delete message with ID: ${messageId}`);
    
    const result = await pool.query(
      'DELETE FROM messages WHERE id = $1 RETURNING *',
      [messageId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    console.log(`Successfully deleted message:`, result.rows[0]);
    res.json({ 
      success: true, 
      message: 'Message deleted successfully',
      deletedMessage: result.rows[0]
    });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: err.message });
  }
});

// Account endpoints
app.post('/api/register', async (req, res) => {
  const { name, phone, password } = req.body;
  try {
    const existingUser = await pool.query('SELECT * FROM accounts WHERE phone = $1', [phone]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this phone number already exists.' });
    }
    const result = await pool.query(
      'INSERT INTO accounts (name, phone, password) VALUES ($1, $2, $3) RETURNING id, name, phone',
      [name, phone, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM accounts WHERE phone = $1', [phone]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    const user = result.rows[0];
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password.' });
    }
    res.json({ id: user.id, name: user.name, phone: user.phone });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log('Server listening on', PORT));
