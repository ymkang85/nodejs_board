const fs = require('fs');

//파일이 있는지 확인하고 있으면 파일 삭제
function rmfile(filePath, callback) {
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log("파일이 존재하지 않음");
            } else {
                console.error("파일 접근 오류 발생", err);
            }
        } else {
            //삭제로직
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error("파일 삭제중 오류 발생", err);
                } else {
                    console.log("파일 삭제 완료");
                }
            })
        }
    });
}
module.exports = rmfile;