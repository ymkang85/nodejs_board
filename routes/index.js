const express = require('express');

const router = express.Router();

//기본 주소 설정
router.get('/', (req, res) => {
    res.render('index', { title: "게시판 목록"});
});

router.get("/write", (req, res)=>{
    res.render("write", { title: "게시판 글쓰기"});
});

router.get("/view", (req, res)=>{
    res.render("view", { title: "게시판 내용보기"});
});

module.exports = router;