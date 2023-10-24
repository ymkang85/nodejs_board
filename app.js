const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const nunjucks = require("nunjucks");

const indexRouter = require('./routes');

dotenv.config();
const app = express();
app.set('port', process.env.PORT || 8080);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    autoescape : true, // false 일 경우 html 태그 허용, true 불가
    watch: true
});

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "data")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);

app.use((req, res, next)=>{
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});
app.use((err, req, res, next)=>{
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.get("/", (req, res)=>{
    res.send("Hello Express");
});
app.listen(app.get('port'), ()=>{
    console.log(app.get('port') + "에서 응답을 기다리는 중...");
});