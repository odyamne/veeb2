const express = require('express');
const app = express();
const fs = require("fs");
//Kui kõik db asjad pool-is, siis mysql moodulit siia ei ole vaja
const bodyparser = require('body-parser');
const dateInfo = require('./src/datetime_both');
const dbConfig = require('../../vp23config');
//Kui kõik db asjad pool-is, siis mysql
const pool = require('./src/dbPool').pool;
const timeInfo = require('./src/datetime_et');
const multer = require('multer');
//Seame multer-i jaoks vahevara, mis määrab üleslaadimise kataloogi
const upload = multer({dest:'./public/gallery/orig/'});
const mime = require('mime');
const sharp = require('sharp');
const async = require('async');
//Krüpteerimiseks
const bcrypt = require('bcrypt');
//Sessiooni jaoks
const session = require('express-session');

app.use(bodyparser.urlencoded({extended:true}));
app.use(session({secret:'superdupermegasalajanevõti', saveUninitialized:true, resave:false}));
let mySession;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Kasutame marsruute
const newsRouter = require('./routes/news');
app.use('/news', newsRouter);

//routes
app.get('/', (req, res) =>{
    //res.send('OKKKKKKKKK');
    res.render('index');
});

app.post('/', (req, res) =>{
    let notice = '';
    if(!req.body.emailInput || !req.body.passwordInput){
        console.log('Paha!');
        res.render('index', {notice: notice});
    }
    else {
        console.log('Hea..');
        let sql = "SELECT id, password FROM vp_users WHERE email=?" ;
        pool.getConnection((err, conn)=>{
            if(err){
                throw err;
                conn.release();
            }
            else{
                conn.execute(sql, [req.body.emailInput], (err, result)=>{ //ANDMEBAASI ALGUS
                    if(err){
                        notice = 'Tehnilise vea tõttu sisse logida ei saa!';
                        console.log('Ei saa andmebaasist loetud');
                        res.render('index', {notice: notice});
                        conn.release();
                    }
                    else {
                        console.log(result);
                        if(result.length == 0){
                            console.log('Tühi!');
                            notice = 'Viga kasutajatunnuses või paroolis!';
                            conn.release();
                        }
                        else{
                            //võrdleme parooli räsi andmebaasis salvestatud räsiga
                            bcrypt.compare(req.body.passwordInput, result[0].password, (err, compresult)=>{
                                if(err){
                                    throw err;

                                }
                                else{
                                    if(compresult){
                                        console.log('Sisse!');
                                        notice = 'Oled sees!';
                                        mySession = req.session;
                                        mySession.userName = req.body.emailInput;
                                        mySession.userId = result[0].id;
                                        res.render('index', {notice: notice});
                                        conn.release();
                                    }
                                    else{
                                        console.log('Uks kinni!');
                                        notice = 'Jäid välja...';
                                        res.render('index', {notice: notice});
                                        conn.release();
                                    }
                                }
                            });
                        }
                    }
                });//ANDMEBAASI LÕPP
            }
        });//POOL-I LÕPP
    }
});

app.get('/logout', (req, res)=>{
    console.log(mySession.userName);
    console.log('Välja!');
    req.session.destroy();
    mySession = null;
    res.redirect('/');
});

app.get('/signup', (req, res) =>{
    res.render('signup');
});

app.post('/signup', (req,res)=> {
    let notice = "Ootel!";
    console.log(req.body);
    // AND => && OR => ||
    if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.birthInput || !req.body.genderInput || !req.body.emailInput || !req.body.passwordInput || req.body.passwordInput.length < 8 || req.body.passwordInput !== req.body.confirmPasswordInput ){
        console.log('andmed puudulikud või sobimatud!');
        notice = 'andmed puudulikud või sobimatud!';
        res.render('signup', {notice: notice});
    }
    else{
        console.log('ok!');
        notice = "Ok!";
        //"soolame" ja krüpteerime parooli
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(req.body.passwordInput, salt, (err, pwdHash)=>{
                let sql = 'INSERT INTO vp_users (firstname, lastname, birthdate, gender, email, password) VALUES(?,?,?,?,?,?)';
                pool.getConnection((err, conn)=>{
                    if(err){
                        throw err;
                        conn.release();
                    }
                    else{
                        conn.execute(sql, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthInput, req.body.genderInput, req.body.emailInput, pwdHash], (err, result)=>{
                            if(err){
                                notice = 'Andmete salvestamine ebaõnnestus!';
                                res.render('signup', {notice: notice});
                                conn.release();
                            }
                            else{
                                notice = 'Kasutaja ' + req.body.emailInput + ' lisamine õnnestus!';
                                res.render('signup', {notice: notice});
                                conn.release();
                            }
                        });
                    }
                });
            });
        });
    }
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

app.get('/eestifilm/singlemovie', (req, res)=>{
    let sqlCount = 'SELECT COUNT(id) FROM movie';
    let movieID = req.params.id;

    conn.execute(sqlCount,[movieID] , (err, countResult)=>{
        if (err){
            res.render('eestifilmsinglemovie', {singlemovie: countResult});
            //conn.end();
            throw err;
        }
        else {
            //console.log(result);
            const movieCount = countResult[0].movieCount;
            res.render('eestifilmindex', {movieCount});
            //conn.end();
        }
    });
});
app.get('/eestifilm/filmiloend', (req, res)=>{
    let sql = 'SELECT title, production_year FROM movie';
    let sqlresult = [];
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
            conn.release();
        }
        else{
            conn.query(sql, (err, result)=>{//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                if (err) {
                    throw err;
                    res.render('eestifilmlist', {filmlist: sqlresult});
                    conn.release();
                }
                else {
                    //console.log(result);
                    //console.log(result[4].title);
                    sqlresult = result;
                    //console.log(sqlresult);
                    res.render('eestifilmlist', {filmlist: sqlresult});
                    conn.release();
                }
            });
        }
    });
	//res.render('eestifilmlist', {filmlist: sqlresult});
});

app.get('/eestifilm/lisaseos', (req, res)=>{
	//res.send('See töötab!');
	//paneme async mooduli abil mitu asja korraga tööle
	//1) loome tegevuste loendi
	const myQueries = [
		function(callback){
			conn.execute('SELECT id,title from movie', (err, result)=>{
				if(err) {
					return callback(err);
				}
				else {
					return callback(null, result);
				}
			});
		},
		function(callback){
			conn.execute('SELECT id,first_name, last_name from person', (err, result)=>{
				if(err) {
					return callback(err);
				}
				else {
					return callback(null, result);
				}
			});
		}
	];
	//paneme need tegevused asünkroonselt paralleelselt tööle
	async.parallel(myQueries, (err, results)=>{
		if (err) {
			throw err;
		}
		else {
			console.log(results);
			//mis kõik teha, ka render osa vajalike tükkidega
		}
	});
	
	
	res.render('eestifilmaddrelation');
});


app.get('/eestifilm/lisapersoon', (req, res)=>{
    res.render('eestifilmaddperson')
});

app.post ('/eestifilm/lisapersoon', (req,res)=>{
    console.log(req.body);
    let notice = '';
    let sql = 'INSERT INTO person (first_name, last_name, birth_date) VALUES (?,?,?)';
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
            conn.release();
        }
        else{
            conn.query(sql, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput], (err, result)=>{
                if(err) {
                    throw err;
                    notice = 'Andmete salvestamine ebaõnnestus!' + err;
                    res.render('eestifilmidaddperson', {notice: notice});
                    conn.release();
                }
                else{
                    notice = 'Filmitegelase ' + req.body.firstNameInput + ' ' + req.body.lastNameInput + 'salvestamine õnnestus!';
                    res.render('eestifilmaddperson', {notice: notice});
                    conn.release();
                }
            });
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


app.get('/photoupload', checkLogin, (req, res)=> {
    res.render('photoupload');
    console.log('Sisseloginud kasutaja: ' + req.session.userId);
});

app.post('/photoupload', upload.single('photoInput'), (req, res)=> {
    
    let notice = '';
    console.log(req.file);
    console.log(req.body);
    const fileName = 'vp_' + Date.now() + '.jpg';
    //fs.rename(req.file.path, './public/gallery/orig/' + req.file.originalname, (err)=> {
    fs.rename(req.file.path, './public/gallery/orig/' + fileName, (err)=> {
        console.log('Viga:' + err);
    });
    const mimeType = mime.getType('./public/gallery/orig/'+ fileName);
    console.log('Tüüp:' + mimeType)
    //Loon pildist väiksema normaliseeritud pildi ja thumbnaili
    sharp('./public/gallery/orig/'+ fileName).resize(800,600).jpeg({quality:90}).toFile('./public/gallery/normal/'+fileName);
    sharp('./public/gallery/orig/'+ fileName).resize(200,150).jpeg({quality:90}).toFile('./public/gallery/thumbs/'+fileName);
    

    let sql = 'INSERT INTO vp_gallery (filename, originalname, alttext, privacy, userid) VALUES (?,?,?,?,?)';
    //const userid = 1;
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
        }
        else{
            conn.query(sql, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, req.session.userId], (err, result)=>{
                if(err) {
                    throw err;
                    notice = 'Foto andmete salvestamine ebaõnnestus!' + err;
                    res.render('photoupload', {notice: notice});
                    conn.release();
                }
                else{
                    notice = 'Pilt ' + req.file.originalname + ' salvestamine õnnestus!';
                    res.render('photoupload', {notice: notice});
                    conn.release();
                }
            });
        }
    });
});

app.get('/photogallery', (req, res)=> {

	let photoList = [];
    let privacy = 3; // 3 = avalik
    if(req.session.userId){
        privacy = 2; // 2 = sisseloginud ainult
    }
	let sql = 'SELECT id,filename,alttext FROM vp_gallery WHERE privacy >= ? AND deleted IS NULL ORDER BY id DESC';
    
    // Teeme db ühenduse pooli kaudu
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
        }
        else{
            conn.execute(sql, [privacy], (err,result)=>{ //Andmebaasi algus
                if (err){
                    throw err;
                    res.render('photogallery', {photoList : photoList});
                    conn.release();
                }
                else {
                    photoList = result;
                    //console.log(result);
                    res.render('photogallery', {photoList : photoList});
                    conn.release();
                }
            }); //Andmebaasi lõpp
        }
    }); //Getconnection lõpp, andmebaasi osa seal sees
});

// Funktsioon, mis kontrollib sisselogimist. Vahevara (middleware)
function checkLogin(req, res, next){
    console.log('Kontrollime sessiooni olemasolu');
    if (mySession != null){
        if(mySession.userName){
            console.log('Ongi sees!');
            next();
        }
        else{
            console.log('Polnud sisseloginud :/');
            res.redirect('/');
        }
    }
    else{
        console.log('Polnud sisseloginud :/');
        res.redirect('/');
    }
}

app.listen(5210);

// https://greeny.cs.tlu.ee/~rinde/vp23/veeb2/!!!!!!!!!!!!!!!!!!!!!!!!!!
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


// Failitüübi tuvastus fotode üleslaadimisel if-lausetega
// Fotode üleslaadimisel portrait/landscape eristamine ja korrektselt skaleerimine!!! Ratio swapped/ Proportsioonide säilitamine - googelda, kuidas SHARP-i kasutada selleks
// Kuva galerii fotode all üleslaadija ees ja perenimi
// SELECT vp_gallery.id, filename, alttext, firstname, lastname FROM vp_gallery JOIN vp_use
// rs ON vp_gallery.userid = vp_users.id WHERE vp_gallery.privacy >= 2 AND deleted IS NULL GROUP BY vp_gallery.id DESC;
// Sammud on ka /~rinde/vp23 all!
