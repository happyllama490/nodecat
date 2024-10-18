const express = require('express'); // Express 모듈을 가져옴
const morgan = require("morgan"); // HTTP 요청 로깅ㅇ을 위한 morgan 모듈을 가져옴
const cookieParser = require('cookie-parser'); // 쿠키 파싱을 위한 cookie-parser 모듈을 가져옴
const session = require('express-session'); // 세션 관리를 위한 express-session 모듈을 가져옴
const nunjucks = require('nunjucks'); // 템플릿 엔진 Nunjucks 모듈을 가져옴
const dotenv = require('dotenv'); // 환경 변수 관리를 위한 dotenv 모듈을 가져옴

dotenv.config(); // .env 파일에 정의된 환경 변수를 로드함
const indexRouter = require('./routes'); // 라우터 파일을 가져옴 (router/index.js에서 정의된 라우터 사용)

const app = express(); // Express 애플리케이션 생성
app.set('port', process.env.PORT || 4000); // 포트를 환경 변수로 설정하고, 없으면 기본값으로 4000을 사용함
app.set('view engine', 'html'); // 템플릿 엔진을 HTML로 설정함

nunjucks.configure('views', { // Nunjucks 템플릿 엔진 설정
    express: app, // Express 애플리케이션과 연결함
    watch: true, // 템플릿 파일이 변경되면 자동으로 다시 로드하도록 설절함  
});

app.use(morgan('dev')); // 개발 모드에서의 HTTP 요청 로그를 출력함
app.use(cookieParser(process.env.COOKIE_SECRET)); // 쿠키를 파싱하고, 환경 변수를 설정된 비밀키를 사용함
app.use(session({ // 세션 미들웨어 설정
    resave: false, // 세션 데이터가 변경되지 않으면 저장하지 않음
    saveUninitialized: false, // 초기화되지 않은 세션을 저장하지 않음
    secret: process.env.COOKIE_SECRET, // 환경 변수에서 가져온 비밀키를 세션 암호화에 사용함
    cookie: { // 쿠키 설정
        httpOnly: true, // 클라이언트 측에서 쿠키에 접근하지 못하도록 설정함
        secure: false, // HTTPS가 아닌 HTTP에서도 쿠키가 전송될 수 있도록 설정함 (개발 환경용)    
    },
}));

app.use('/', indexRouter); // 기본 경로('/')로 들어오는 요청에 대해 indexRouter를 사용함

app.use((req, res, next) => { // 존재하지 않는 라우터에 대한 404 처리 미들웨어
    const error = new Error(`${req.method}${req.url} 라우터가 없습니다.`); // 에러 메시지를 생성함
    error.status = 404; // HTTP 상태 코드를 404로 설정함
    next(error); // 다음 미들웨어로 에러를 전달함    
});

app.use((err, req, res, next) => { // 에러 처리 미들웨어
    res.locals.message = err.message; // 에러 메시지를 로컬 변수에 저장하여 뷰에서 사용할 수 있도록 함
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}; // 프로덕션 환경이 아닌 경우에만 에러 상세 정보를 보여줌
    res.status(err.status || 500); // 에러 상태 코드를 설정함. 없으면 500(서버 에러)로 설정함
    res.render('error'); // 에러 페이지를 렌더링함   
});

app.listen(app.get('port'), () => { // 지정된 포트에서 서버를 시작함
    console.log(app.get('port'), '번 포트에서 대기 중'); // 서버가 시작되면 포트 번호와 함께 메시지를 콘솔에 출력함   
})