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

const testPoll = {
    title: 'Who is your favorite superhero',
    results: [
        {option: 'Batman', votes: 20},
        {option: 'Superman', votes: 10},
        {option: 'Wonder Woman', votes: 5},
        {option: 'The Flash', votes: 23},
    ]
};

app.get('/test2', (req, res) => {
    res.render('polls/show', {
        data: [20, 10, 5, 23],
        colors: ["#000", "#333", "#555", "#999"],
        labels: ["Superman", "Batman", "Wonder Woman", "The Flash"]
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
});

// const PollSchema = new mongoose.Schema({
//     title: {type: String, required: true},
//     results: [{
//         option: {type: String, required: true},
//         votes: {type: Number, required: true}
//     }]
// });