const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination : (req, file, cb) =>{
        cb(null, "./data/images");
    },
    filename: (req, file, cb) =>{
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + "-img";
        cb(null, "file" + "-" + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });
module.exports = upload;