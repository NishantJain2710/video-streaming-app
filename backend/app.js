import express from 'express';
import fs from 'fs'
import aws from 'aws-sdk';
import path, { resolve } from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import ffmpeg from 'fluent-ffmpeg';
import {upload} from './middleware/uploadMiddleware.js';

ffmpeg.setFfmpegPath("C:/ffmpeg-4.4-essentials_build/bin/ffmpeg.exe");
ffmpeg.setFfprobePath("C:/ffmpeg-4.4-essentials_build/bin");

const app = express();

dotenv.config()


const options = {
    origin: ['*',"http://localhost:3000/"],
    credentials: true,
};

app.use(cors(options));
app.get('/',(req,res)=>{
    res.send('server is running');
})

app.get('/video', (req,res)=>{

    const range = req.headers.range;
    if(!range){
        res.status(400).send("Requires Range header");
        return
    }

    const videoPath = "E:/tutotials/video-stream/backend/video.mp4";
    const videoSize = fs.statSync("E:/tutotials/video-stream/backend/video.mp4").size;

    const CHUNK_SIZE = 10 ** 6; //1MB
    const start = Number(range.replace(/\D/g, ""));

    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type":"video/mp4",
    };

    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, {start , end})
    videoStream.pipe(res);
})


app.post('/upload',upload.single('video'),(req,res)=>{
    try{
        let file = req.file;
        
        ffmpeg(`backend/uploads/${file.originalname.split('.')[0]}/${file.originalname}`, {timeout:432000}).addOptions([
            '-profile:v baseline',
            '-level 3.0',
            '-start_number 0',
            '-hls_time 10',
            '-hls_list_size 0',
            '-f hls'
        ]).output(`backend/uploads/${file.originalname.split('.')[0]}/index.m3u8`)
        .on('error',(err)=>{
            fs.unlink(`backend/uploads/${file.originalname.split('.')[0]}`)
            res.send('Error in conversion to HLS, ' + err.message)
            return;
        })
        .on('end',async()=>{
            fs.unlinkSync(`backend/uploads/${file.originalname.split('.')[0]}/${file.originalname}`)
            const s3 = new aws.S3({
                region: process.env.AWS_BUCKET_REGION,
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SEC_ACCESS_KEY,
                signatureVersion: 'v4',
            });

            const __dirname = path.resolve()
            const folderPath = path.join(__dirname, `backend/uploads/${file.originalname.split('.')[0]}`)

            const uploadToS3 = new Promise((resolve,reject)=>{
                fs.readdir(folderPath,async(err,files)=>{
                    if(!files || files.length === 0 || err){
                        reject('provided folder is empty or does not exist.');
                        return;
                    }
                    for(let i=0; i<files.length; i++){
                        const filePath = path.join(folderPath,files[i]);
                        const fileStream = fs.createReadStream(filePath);

                        s3.upload({
                            Bucket:process.env.AWS_BUCKETNAME_ADMIN,
                            Key:`${file.originalname.split('.')[0]}/${files[i]}`,
                            Body:fileStream
                        }).promise()

                        res.write(`${(((i+1)/files.length)*100).toFixed(2)} % uploaded `)
                        if((i+1)===files.length){
                            resolve('successfully uploaded to s3')
                        }
                    }
                })
            })

            uploadToS3.then((message)=>{
                fs.rmdir(folderPath,{ recursive: true },(error)=>{
                    if(error){
                        res.send(error.message)
                    }else{
                        res.end(message)
                    }
                })
            }).catch((error)=>{
                res.send(error)
            })
        })
        .run()
        
    }catch(error){
        res.send(error.message)
    }
})



const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})