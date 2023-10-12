const express = require('express');
const app = express();

app.get('/', (req, res) =>{
    res.send('OKKKKKKKKK');
});

app.get('/test', (req, res) =>{
    res.send('ok test.');
});

app.listen(5210);
