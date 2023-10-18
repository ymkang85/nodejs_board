const express = require('express');
const router = express.Router();

//mysql 연결
const mysqlConnObj = require('../config/mysql');
const conn = mysqlConnObj.init();
mysqlConnObj.open(conn);  //연결 출력

//기본 주소 설정
router.get('/', (req, res) => {
  let page = 1;
  if (req.query.page) {
    page = parseInt(req.query.page);
  }
  const maxlist = 10;
  const perPage = 5;
  let offset = (page - 1) * maxlist;
  let sql = "select count(*) as maxcount from ndboard";
  conn.query(sql, (err, row) => {
    if (err) {
      console.error(err)
    } else {
      const maxcount = row[0].maxcount;
      //전체 페이지 수 
      const totalPage = Math.ceil(maxcount / perPage);

      let limit = `limit ${offset} , ${maxlist}`;

      sql = "select * from ndboard order by num asc, grnum desc " + limit;
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
          res.render('index', { title: "게시판 목록", row: row });
        }
      })
    }
  });
});

router.get("/write", (req, res) => {
  res.render("write", { title: "게시판 글쓰기" });
});

router.post("/write", (req, res) => {
  const rs = req.body;
  let sql = "insert into ndboard (orNum, grNum, writer, userid, userpass, title, content) values (?,?,?,?,?,?,?)";
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

router.get("/view/:num", (req, res) => {
  const { num } = req.params;
  const sql = "select * from ndboard where num = ?";
  conn.query(sql, [num], (err, row, fields) => {
    if (err) {
      console.log(err);
    } else {
      let odate;
      for (let rs of row) {
        odate = new Date(rs.wdate);
        rs.wdate = `${odate.getFullYear()}-${odate.getMonth() + 1}-${odate.getDate()}`;
      }
      res.render("view", { title: "게시판 내용보기", row });
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
        console.log('수정 성공');
      }
    });
  res.redirect('/view/' + num);
});

router.post("/del", (req, res) => {
  const { delpass, delnum } = req.body;
  let sql = "select count(*) as ct from ndboard where num = ? and userpass = ?";
  conn.query(sql, [delnum, delpass], (err, row, fields) => {
    if (err) {
      console.log(err);
      res.send('0');
    } else {
      if (row[0].ct > 0) {
        sql = "delete from ndboard where num = ?";
        conn.query(sql, delnum, (err, fields) => {
          if (err) {
            console.log(err);
            res.send('0');
          } else {
            console.log('삭제성공');
            res.send('1');
          }
        });
      } else {
        console.log('비밀번호 틀림' + row[0].ct);
        res.send('0');
      }
    }
  })
})

////////////////////////////////////////////////////////////////////////////////

router.get("/rewrite/:num", (req, res) => {
  const { num } = req.params;
  const sql = "select num, orNum, grNum, grLayer from ndboard where num = ?";
  conn.query(sql, num, (err, row, fields) => {
    if (err) {
      console.log(err);
    } else {
      const rs = row[0];
      res.render('rewrite', { title: '답변글 등록', rs });
    }
  })
})
  .post("/rewrite", (req, res) => {
    const { ornum, grnum, grlayer, writer, pass, title, content } = req.body;
    const userid = "guest";  //나중에 회원제 만들면서 수정예정
    //목록의 grNum 이 받은 grNum 보다 클 경우 하나씩 업데이트
    let sql = "update ndboard set grNum = grNum + 1 where orNum = ? and grNum > ?";
    conn.query(sql, [ornum, grnum]);

    //인서트
    sql = "insert into ndboard " +
      "(orNum, grNum, grLayer, writer, userid, userpass, title, content)" +
      "values (?,?,?,?,?,?,?,?)";
    conn.query(sql, [
      parseInt(ornum),
      parseInt(grnum) + 1,
      parseInt(grlayer) + 1,
      writer,
      userid,
      pass,
      title,
      content
    ], (err, row, fields) => {
      if (err) {
        console.log(err);
      } else {
        console.log(row.indertId);
      };
      res.redirect("/");
    });
  });

module.exports = router;