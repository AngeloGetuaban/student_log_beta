const express = require('express');
const http = require('http');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const ejs = require('ejs');
const path = require('path');
const serviceAccount = require('./student-attendance-b3429-b444044a2f35.json');

// Initialize Firebase app
const firebaseApp = initializeApp({
  credential: cert(serviceAccount)
});

// Initialize Firestore
const db = getFirestore(firebaseApp);

// Create express app
const app = express();

// Route to display Firebase initialization status and collections
app.get('/', async (req, res) => {
  try {
    // Check if Firebase is initialized
    if (!db) {
      return res.status(500).send('Error initializing Firebase.');
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = now.getDate().toString().padStart(2, '0');

    const currentDate = `${year}-${month}-${day}`;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    console.log(currentTime)
    console.log(currentDate)
    const snapshot = await db.collection('students').get();

    // Extract document IDs
    const documentIds = [];
    snapshot.forEach((doc) => {
      documentIds.push(doc.id);
    });

    // Render the 'index' EJS template with the document IDs
    res.render('index', { documentIds, currentDate });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error fetching collections.');
  }
});

app.get('/getDocumentContent/:documentId', async (req, res) => {
  try {
    const documentId = req.params.documentId;
    const docRef = db.collection('students').doc(documentId);
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      res.json({ success: true, data });
    } else {
      res.json({ success: false, message: 'Document does not exist.' });
    }
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({ success: false, message: 'Error getting document.' });
  }
});

app.get('/record_page/:documentId', async (req, res) => {
  try {
      const documentId = req.params.documentId;

      // Fetch data for the specified documentId (similar to your existing route logic)
      const docRef = db.collection('students').doc(documentId);
      const docSnapshot = await docRef.get();

      if (docSnapshot.exists) {
          const data = docSnapshot.data();
          res.render('record_page', { documentId, data }); // Assuming you have a recordpage.ejs template
      } else {
          res.status(404).send('Document not found.');
      }
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Error fetching document.');
  }
});

app.get('/documentIds', async (req, res) => {
  try {
    // Check if Firebase is initialized
    if (!db) {
      return res.status(500).send('Error initializing Firebase.');
    }

    const snapshot = await db.collection('students').get();

    // Extract document IDs
    const documentIds = [];
    snapshot.forEach((doc) => {
      documentIds.push(doc.id);
    });

    // Render the 'index' EJS template with the document IDs
    res.json({ success: true, documentIds });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error fetching collections.');
  }
});

// Set 'views' as the folder containing EJS files
app.set('views', path.join(__dirname, '/views'));

// Set EJS as the view engine
app.set('view engine', 'ejs');
module.exports = app;
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
