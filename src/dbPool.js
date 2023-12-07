const mysql = require('mysql2');
const dataBase = 'if23_ander_aa';
const dbConfig = require('../../../vp23config');

const pool = mysql.createPool({
    host: dbConfig.configData.host,
    user: dbConfig.configData.user,
    password: dbConfig.configData.password,
    database: dataBase,
    connectionLimit: 5 
});

exports.pool = pool;
