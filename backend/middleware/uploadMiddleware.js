import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination:function(req, file, cb){
        fs.mkdirSync(`backend/uploads/${file.originalname.split('.')[0]}`)
        cb(null,`backend/uploads/${file.originalname.split('.')[0]}`);
    },
    filename:function(req,file,cb){
        cb(null, `${file.originalname}`);
    }
});

function checkFileType(file,cb){
    const filetypes = /mp4/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)
    if(extname&& mimetype){
        return cb(null,true)
    }else{
        cb(new Error('Only Mp4 allowed'), false)
    }
}

const upload = multer({
    storage: storage, 
    limits:{
        fileSize: 1024 * 1024 * 100  //100MB
    },
    fileFilter:function(req,file,cb){
        checkFileType(file,cb)
    }
});



export {upload};