const express = require('express');
const router = express.Router();
const upload = require("../upload");
const rmfile = require("../lib/removefile");
const fs = require("fs-extra");

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
  const maxlist = 10;  //한 화면에 보여줄 목록 수

  let offset = (page - 1) * maxlist;  //limit 에 첫번째로 출력할 번호
  let sql = "select count(*) as maxcount from ndboard";
  conn.query(sql, (err, row, fields) => {
    if (err) {
      console.error(err)
    } else {

      const maxcount = row[0].maxcount; //전체 게시글 수   
      let limit = ` limit ${offset} , ${maxlist}`;

      sql = "select * from ndboard order by orNum desc, grNum asc" + limit;
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
          //console.log(row);
          res.render('index', { title: "게시판 목록", totalCount: maxcount, maxList: maxlist, page: page, row: row });
        }
      }); //list
    } //if else 
  });  //maxcount
});

router.get('/search', (req, res) => {
  let page = 1;
  const columned = req.query.column;
  const column = decodeURIComponent(columned);
  const select = req.query.search;
  if (req.query.page) {
    page = parseInt(req.query.page);
  }
  const maxlist = 10;  //한 화면에 보여줄 목록 수

  let offset = (page - 1) * maxlist;  //limit 에 첫번째로 출력할 번호
  let sql = "select count(*) as maxcount from ndboard where " + select + " = " + column ;
  conn.query(sql, (err, row, fields) => {
    if (err) {
      console.error(err)
    } else {

      const maxcount = row[0].maxcount; //전체 게시글 수   
      let limit = ` limit ${offset} , ${maxlist}`;
      sql = "select * from ndboard  where " + column + " = " + select + " order by orNum desc, grNum asc " + limit;
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
          //console.log(row);
          res.render('index', { title: "게시판 목록", totalCount: maxcount, maxList: maxlist, page: page, row: row, column: column, select: select });
        }
      });
    }
  });
});

router.get("/write", (req, res) => {
  res.render("write", { title: "게시판 글쓰기" });
});

router.post("/write", (req, res) => {
  const rs = req.body;
  let sql = "insert into ndboard (orNum, grNum, writer, userid, userpass, title, contents, imnum) values (?,?,?,?,?,?,?,?)";
  conn.query(sql, [
    0, 1, rs.writer, 'guest',
    rs.pass,
    rs.title,
    rs.content,
    rs.imnum
  ], (err, res, fields) => {
    if (err) {
      console.log(err);
    } else {
      console.log(res.insertId);
      sql = "update ndboard set ? where num =" + res.insertId;
      const sql2 = "update ndfile set bbs_num=" + res.insertId;
      conn.query(sql, { orNum: res.insertId },
        (err, res, fields) => {
          if (err)
            console.log(err);
          else {
            console.log('업데이트 성공');
          }
        });
      conn.query(sql2);
    }
  });
  res.redirect('/');
});

router.post("/write/imginsert", upload.single("img"), async (req, res, next) => {
  try {
    let imnum, sql;
    console.log(req.file);

    if (req.file !== undefined) {
      if (req.body.imnum) {
        imnum = req.body.imnum;
      } else {
        imnum = new Date().getTime();
      }
      sql = "insert into ndfile (filename, orfilename, mimetype, filesize, imnum) values (?,?,?,?,?)";
      conn.query(sql, [
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        imnum
      ], (err, rs, fields) => {
        if (err) {
          console.log(err);
        } else {
          console.log(rs.insertId);
          const data = {
            imnum,
            imgurl: req.file.filename
          };
          res.json(data);
        }
      });

    }
  } catch (err) {
    console.error(err);
  }
});

router.get("/view/:num", (req, res) => {
  const { num } = req.params;
  const sql1 = "select * from ndboard where num = ?";
  const sql2 = "select * from ndboard_comment where ndboard_num = ?"
  conn.query(sql1, [num], (err, row, fields) => {
    if (err) {
      console.log(err);
    } else {
      conn.query(sql2, num, (err, rs, fields) => {
        // let contents;
        // for( res in rs ){
        //    res.contests
        // }
        if (err) {
          console.error(err);
        } else {
          res.render("view", { title: "게시판 내용보기", row, rs })
        }
      });
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
  conn.query(sql, [num, pass], (err, row, fields) => {
    if (err) {
      console.log(err);
    } else {
      if (row.length > 0) {
        sql = "update ndboard set ? where num = ?";
        conn.query(sql, [{
          title: title,
          contents: content
        }, num],
          (err, fields) => {
            if (err) {
              res.send('0');
              console.log(err);
            } else {
              res.send('1');
              console.log("수정성공");
            }
          });
      } else {
        res.send('0');
      }
    }
  });
});

/**
 1. 게시물 번호와 비밀번호 확인
 2. 성공 1, 실패 0
 */
router.post("/del", (req, res) => {
  const { delpass, delnum } = req.body;
  let sql = "select count(*) as ct from ndboard where num=? and userpass=?";
  conn.query(sql, [delnum, delpass], (err, row, fields) => {
    if (err) {
      console.log(err);
      res.send('0');
    } else {
      if (row[0].ct > 0) {
        //삭제쿼리 작성
        //파일을 읽어서 코멘트 있는지 확인, 첨부파일 확인
        const sql1 = "select * from ndboard where num = ?";
        conn.query(sql1, delnum, (err, row, fields) => {
          if (err) {
            console.log(err);
          } else {
            if (row[0].memocount > 0) {
              conn.query("delete from ndboard_comment where bbs_num = " + row[0].num);
            }
            //파일이 있는지 읽어 옴
            const sql2 = "select * from ndfile where bbs_num = " + row[0].num;
            conn.query(sql2, (err, rs, fields) => {
              if (rs.length > 0) {
                const deldir = './data/images';
                for (let r of rs) {
                  //파일 삭제 로직이 들어갈 부분
                  let filePath = deldir + "/" + r.filename;
                  console.lor(r.filename);
                  rmfile(filePath, () => {
                    console.log("파일삭제완료");
                  });
                }
                conn.query("delete from ndfile where bbs_num = " + row[0].num);
              }
            })
          }
        })
        //1. 코멘트 삭제
        //2. 파일삭제
        //3. 본문삭제
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
        console.log("비밀번호 틀림" + row[0].ct)
        res.send('0');
      }
    }
  })
});

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
      "(orNum, grNum, grLayer, writer, userid, userpass, title, contents)" +
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

// 코멘트
router.route("/comment_write")
  .post(async (req, res) => {
    const sql1 = "insert into ndboard_comment " +
      "(ndboard_num, username, userpass, userid, comment)" +
      "values (?,?,?,?,?)";
    const sql2 = "update ndboard set memocount = memocount + 1 where num = ?";

    conn.query(sql1, [
      req.body.ndboard_num,
      req.body.username,
      req.body.userpass,
      req.body.username,
      req.body.content
    ], (err, fields) => {
      if (err) {
        console.error(err);
        res.send('0');
      }
      else {
        conn.query(sql2, req.body.ndboard_num);
        console.log('인서트 성공');
        res.send('1');
      }
    })
  });


module.exports = router;