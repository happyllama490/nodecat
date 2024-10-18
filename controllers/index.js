const axios = require('axios');
// HTTP 요청을 쉽게 보내기 위한 axios 모듈을 불러옴

exports.test = async (req, res, next) => {
// 토큰 테스트 라우터
// 토큰 테스트를 위한 비동기 함수 정의, req는 요청 객체, res는 응답 객체, next는 다음 미들웨어로 전달하기 위한 함수임
    try {
        if (!req.session.jwt) { // 세션에 토큰(JWT)이 없으면 토큰 발급 시도
            const tokenResult = await axios.post('https://localhost:8002/v1/token', {
                clientSecret: process.env.CLIENT_SECRET,
                // 환경 변수에서 클라이언트 비밀키를 가져와서 토큰 발급 요청에 포함
            });
            if (tokenResult.data?.code === 200) {
            // 토큰 발급이 성공했는지 확인함, 응답 코드가 200이면 성공임
                req.session.jwt = tokenResult.data.token;
                // 발급받은 토큰을 세션에 저장함
            } else {
            // 토큰 발급에 실패한 경우
                return res.json(tokenResult.data);
                // 실패 사유를 JSON 형식으로 응답함
            }
        }
        // 발급받은 토큰으로 테스트 요청을 수행함
        const result = await axios.getAdapter('https://localhost:8002/v1/test', {
            headers: { authorization: req.session.jwt },
            //요청 헤더에 JWT를 포함하여 인증함
        });
        return res.json(result.data);
        // 요청의 결과를 JSON 형식으로 응답함
    } catch (err) {
        console.error(err);
        // 에러가 발생한 경우, 콘솔에 에러를 출력함
        if (err.response?.status === 419) {
        // 에러 응답의 상태 코드가 419일 경우, 보통 토큰 만료를 의미함
            return res.json(err.response.data);
            // 만료된 토큰의 에러 정보를 JSON 형식으로 응답함
        }
        return next(err);
        // 기타 에러는 다음 미들웨어로 전달함
    }
};