const express = require('express');
// Loome marsruutimise mini-äpi
const router = express.Router();
const pool = require('../src/dbPool').pool;
const timeInfo = require('../src/datetime_et');

// Kuna siin on kasutusel miniäpp "router", siis kõik marsruudid on router'il, mitte app'il
// Kuna kõik siinsed marsruudid algavad osaga "/news", siis seda pole vaja kirjutada. 
router.get('/', (req,res)=> {
	res.render('news');
});


router.get('/add', (req,res)=> {
	res.render('addnews');
});

router.post('/add', (req,res)=> {
	let notice = '';
	let newsAddSql  = 'INSERT INTO vp_news (title, content, expire, userid) VALUES (?, ?, ?, 1)';
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
        }
        else{
            conn.query(newsAddSql, [req.body.titleInput, req.body.contentInput, req.body.expireInput], (err, result)=>{
                if(err) {
                    notice = 'Andmete salvestamine ebaõnnestus' + err;
                    res.render('addnews', {notice: notice});
                    conn.release();
                    throw err;
                }
                else {
                    notice = 'Uudise ' + req.body.titleInput + ' salvestamine õnnestus';
                    res.render('addnews', {notice: notice});
                    conn.release();
                }
            });
        }
    });
});


router.get('/read', (req, res)=> {
	//let allNews = 'SELECT * FROM "vpnews" WHERE expire > ? AND deleted IS NULL ORDER BY id DESC';
	let timeSQL = timeInfo.dateSQLformated();
	let readNewsSql = 'SELECT * FROM vp_news WHERE expire > \'' + timeSQL + '\' AND deleted IS NULL ORDER BY id DESC';
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
        }
        else{
            conn.query(readNewsSql, [timeSQL], (err, result)=>{
            //conn.query(allNews,  (err, result)=>{
                if (err){
                    throw err;
                    conn.release();
                }
                else {
                    let newsList = result;
                    res.render('readnews', {newsList: newsList});
                    conn.release();
                }
            });
        }
    });
});

router.get('/read/:id', (req, res) => { 
    // Spetsiifilise ID-ga SQL päring
    let newsSQL = 'SELECT * FROM vp_news WHERE id = ? AND deleted IS NULL';
    // Võta ID päringust
    let newsID = req.params.id;
    pool.getConnection((err, conn)=>{
        if(err){
            throw err;
        }
        else{
    // Vii päring läbi
            conn.query(newsSQL, [newsID], (err, result) => {
                if (err) {
                    throw err;
                    conn.release();
                } else {
                    if (result.length > 0) {
                        const newsItem = result[0];
                        res.render('newssingle', {news: newsItem});
                        conn.release()
                    }else {
                        throw err;
                        conn.release()
                    }
                }
            });
        }
    });
});

module.exports = router;