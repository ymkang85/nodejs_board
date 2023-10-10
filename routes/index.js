const express = require('express');
const router = express.Router();

//mysql 연결
const mysqlConnObj = require('../config/mysql');
const conn = mysqlConnObj.init();
mysqlConnObj.open(conn);  //연결 출력

//기본 주소 설정
router.get('/', (req, res) => {
  //const sql = "select num, title,writer,memoCount, date_format(wdate, '%Y-%m-%d') as wwdate from ndboard order by num desc";
  const sql = "select * from ndboard order by orNum desc, grNum asc";
  conn.query(sql, (err, row, fields) => {
    if (err)
      console.log(err);
    else {
      let odate;
      for (let rs of row) {
        rs.grLayer *= 30;
        odate = new Date(rs.wdate);
        rs.wdate = `${odate.getFullYear()}-${odate.getMonth() + 1}-${odate.getDate()}`;
      }
      console.log(row);
      res.render('index', { title: "게시판 목록", row: row });
    }
  })

});

router.get("/write", (req, res) => {
  res.render("write", { title: "게시판 글쓰기" });
});

router.post("/write", (req, res) => {
  const rs = req.body;
  let sql = "insert into ndboard (orNum, grNum, writer, userid, userpass, title, contents) values (?,?,?,?,?,?,?)";
  conn.query(sql, [
    0, 1, rs.writer, 'guest',
    rs.pass,
    rs.title,
    rs.content
  ], (err, res, fields) => {
    if (err) {
      console.log(err);
    } else {
      console.log(res.insertId);
      sql = "update ndboard set ? where num =" + res.insertId;
      conn.query(sql, { orNum: res.insertId },
        (err, res, fields) => {
          if (err)
            console.log(err);
          else {
            console.log('업데이트 성공');
          }
        });
    }
  });
  res.redirect('/');
});

router.get("/view/:num", (req, res)=>{
  const { num } = req.params;
  const sql = "select * from ndboard where num = ?";
  conn.query( sql, [num], (err, row, fields)=> {
    if(err) {
       console.log(err);
    }else{
        res.render("view", { title: "게시판 내용보기", row});
    }
  });
});

router.get("/edit/:num", (req, res) => {
  const { num } = req.params;
  const sql = "select * from ndboard where num = ?";
  conn.query(sql, [num], (err, row, fields) => {
    if (err) {
      console.log(err);
    } else {
      res.render("edit", { title: "내용 수정", row });
    }
  });
});

router.post("/edit/:num", (req, res) => {
  const { num } = req.params;
  const rs = req.body;
  const sql = "update ndboard set ? where num = ?";
  conn.query(sql, [{
    title: rs.title,
    contents: rs.content
  }, num],
    (err, res, fields) => {
      if (err)
        console.log(err);
      else {
        console.log('업데이트 성공');
      }
    });
  res.redirect('/view/' + num);
});

router.post("/pwdlogin", (req, res) => {
  const { num, pass, title, content } = req.body;
  let sql = "select * from ndboard where num = ? and userpass = ?";
  conn.query( sql, [num, pass], (err, row, fields)=> {
    if(err) {
       console.log(err);
    }else{
       if(row.length > 0) {
         sql = "update ndboard set ? where num = ?";
         conn.query(sql,[{ 
                title: title,
                contents: content  
         }, num],
         (err, res,fields)=>{
            if(err) 
               console.log(err);
            else{
               return (res.write(1));
            }
         });
          console.log("수정성공");
       }else{
          return(res.write(0));
       }
    }
  });
})

module.exports = router;