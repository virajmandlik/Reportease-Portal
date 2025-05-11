const express = require('express');
const app = express();
const pdfRoutes = require('./routes/pdfRoutes');

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', 'views'); // Set the views directory

app.use('/generate-pdf', pdfRoutes);

app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});