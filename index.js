const express = require('express');
const app = express();
const fs = require("fs");
const mysql = require('mysql2');
const bodyparser = require('body-parser');
const dateInfo = require('./datetime_both');
const dbConfig = require('../../vp23config');
const dataBase = 'if23_ander_aa';
const timeInfo = require('./datetime_et');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:false}));

//loon andmebaasiühenduse
const conn = mysql.createConnection({
    host: dbConfig.configData.host,
    user: dbConfig.configData.user,
    password: dbConfig.configData.password,
    database: dataBase
});


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

app.get('/eestifilm', (req, res)=>{
    res.render('eestifilmindex');
});

app.get('/eestifilm/filmiloend', (req, res)=>{
    let sql = 'SELECT title, production_year FROM movie';
    let sqlresult = [];
    conn.query(sql, (err, result)=>{
		if (err) {
			throw err;
			res.render('eestifilmlist', {filmlist: sqlresult});
		}
		else {
			//console.log(result);
			//console.log(result[4].title);
			sqlresult = result;
			//console.log(sqlresult);
			res.render('eestifilmlist', {filmlist: sqlresult});
		}
	});
	//res.render('eestifilmlist', {filmlist: sqlresult});
});

app.get('/eestifilm/lisapersoon', (req, res)=>{
    res.render('eestifilmaddperson')
});

app.post ('/eestifilm/lisapersoon', (req,res)=>{
    console.log(req.body);
    let notice = '';
    let sql = 'INSERT INTO person (first_name, last_name, birth_date) VALUES (?,?,?)';
    conn.query(sql, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput], (err, result)=>{
        if(err) {
            throw err;
            notice = 'Andmete salvestamine ebaõnnestus!' + err;
            res.render('eestifilmidaddperson', {notice: notice});
        }
        else{
            notice = 'Filmitegelase ' + req.body.firstNameInput + ' ' + req.body.lastNameInput + 'salvestamine õnnestus!';
            res.render('eestifilmaddperson', {notice: notice});
        }
    });
});

app.get('/namelog', (req, res) =>{
    fs.readFile("public/txtfiles/log.txt", "utf8", (err, data)=>{	
        if(err){
            console.log(err);
        }
        else{
            data = data.trim();
            const lines = data.split(';');
            const formattedEntries = [];
            
            lines.forEach(line=> {
                const values = line.split(',');
                //Allolev if kontroll ei arvesta viimast log.txt väärtust, mis on alati tühi, kuna väärtuste rida lõpeb ";"-ga ja programm peab seda ka väärtuseks.
                if (values.length >=3){
                const formattedEntry = {
                    firstName: values[0],
                    lastName: values[1],
                    date: dateInfo.convertDate(values[2], "ET")
                };
                formattedEntries.push(formattedEntry);
                }
            });
        res.render('namelist', {h1: 'Nimekirjed', entries: formattedEntries});

        };
    });
});

app.get('/news', (req,res)=> {
	res.render('news');
});


app.get('/news/add', (req,res)=> {
	res.render('addnews');
});

app.post('/news/add', (req,res)=> {
	let notice = '';
	let newsAddSql  = 'INSERT INTO vp_news (title, content, expire, userid) VALUES (?, ?, ?, 1)';
	conn.query(newsAddSql, [req.body.titleInput, req.body.contentInput, req.body.expireInput], (err, result)=>{
		if(err) {
			notice = 'Andmete salvestamine ebaõnnestus' + err;
			res.render('addnews', {notice: notice});
            throw err;
		}
		else {
			notice = 'Uudise ' + req.body.titleInput + ' salvestamine õnnestus';
			res.render('addnews', {notice: notice});
		}
	});
});


app.get('/news/read', (req, res)=> {
	//let allNews = 'SELECT * FROM "vpnews" WHERE expire > ? AND deleted IS NULL ORDER BY id DESC';
	let timeSQL = timeInfo.dateSQLformated();
	let readNewsSql = 'SELECT * FROM vp_news WHERE expire > \'' + timeSQL + '\' AND deleted IS NULL ORDER BY id DESC';
	conn.query(readNewsSql, [timeSQL], (err, result)=>{
	//conn.query(allNews,  (err, result)=>{
		if (err){
            throw err;
		}
		else {
            let newsList = result;
			res.render('readnews', {newsList: newsList});
		}
	});
});

app.get('/news/read/:id', (req, res) => { 
    // Spetsiifilise ID-ga SQL päring
    let newsSQL = 'SELECT * FROM vp_news WHERE id = ? AND deleted IS NULL';
    // Võta ID päringust
    let newsID = req.params.id;

    // Vii päring läbi
    conn.query(newsSQL, [newsID], (err, result) => {
        if (err) {
            throw err;
        } else {
            if (result.length > 0) {
                const newsItem = result[0];
                res.render('newssingle', { news: newsItem });
            }else {
                throw err;
            }
        }
    });
});

app.listen(5210);


// app.get('/namelog', (req, res) =>{
//     let name = [];
//     fs.readFile("public/txtfiles/log.txt", "utf8", (err, data)=>{	
//         if(err){
//             console.log(err);
//         }
//         else{
//             name = data.split(";");
//             res.render('namelist', {h1: 'Nimekirjed', names: name});   
//         }
//     });
// });