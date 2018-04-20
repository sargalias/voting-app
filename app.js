const express = require('express');
const path = require('path');
const ejs = require('ejs');


const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
app.get('/test', (req, res) => {
    res.render('polls/index');
});

app.get('/test2', (req, res) => {
    res.render('polls/show');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
});