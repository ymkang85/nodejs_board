const express = require('express');
const router = express.Router();

// mysql 연결
const mysqlConnObj = require('../config/mysql.js');
const conn = mysqlConnObj.init();
mysqlConnObj.open(conn); //연결 출력

//기본 주소 설정
router.get('/', (req, res) => {
    const sql = "select * from ndboard order by num desc";
    conn.query(sql, (err, row, fields) => {
        if (err)
            console.log(err);
        else {
            res.render('index', { title: "게시판 목록", row });
        }
    })
});

router.get("/write", (req, res) => {
    res.render("write", { title: "게시판 글쓰기" });
});

router.get("/view", (req, res) => {
    res.render("view", { title: "게시판 내용보기" });
});

module.exports = router;