const express = require('express');
const app = express();
const fs = require("fs");
const dateInfo = require('./datetime_ET');



app.set('view engine', 'ejs');
app.use(express.static('public'));

//routes
app.get('/', (req, res) =>{
    //res.send('OKKKKKKKKK');
    res.render('index');
});

app.get('/timenow', (req, res) =>{
    const dateNow = dateInfo.dateNowET();
    const timeNow = dateInfo.timeNowET();
    res.render('timenow', {dateN: dateNow, timeN: timeNow});
});

app.get('/proverb', (req, res) =>{
    let proverb = [];
    fs.readFile("public/txtfiles/vanasonad.txt", "utf8", (err, data)=>{	
        if(err){
            console.log(err);
        }
        else{
            proverb = data.split(";");
            res.render('justlist', {h1: 'Vanasõnad', proverbs: proverb});   
        }
    });
});

app.listen(5210);
