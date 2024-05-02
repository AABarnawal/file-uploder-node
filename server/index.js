const express = require('express');
const app = express();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

app.use(cors({
    origin: 'http://localhost:3000',
    methods: [
        'GET',
        'POST',
      ],
    
      allowedHeaders: [
        'Content-Type',
      ],
}));

const videoStorage = multer.diskStorage({
    destination: 'uploads', // Destination to store video 
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
    }
});

const videoUpload = multer({
    storage: videoStorage,
    limits: {
        fileSize: 10000000 // 10000000 Bytes = 10 MB
    },
    fileFilter(req, file, cb) {
        // upload only mp4 and mkv format
        if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
            return cb(new Error('Please upload a video'))
        }
        cb(null, true)
    }
})

app.post('/uploadVideo', videoUpload.single('video'), async (req, res) => {
    try {
        const filePath = path.resolve(__dirname, './uploads', req.file.filename);
        const fileData = fs.readFileSync(filePath);

        const formData = new FormData();
        formData.append('file', fileData, req.file.originalname);
        console.log(req.file.filename)
        const axiosRes = await axios.post('https://video-cheker.onrender.com/check_video/', formData, {
            headers: {
                ...formData.getHeaders(), // Include the necessary headers for FormData
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('Response:', axiosRes.data.is_video);
        
        console.log('Video uploaded successfully');

        res.status(200).send(axiosRes.data.is_video);
    } catch (error) {
        console.error('Error uploading video:', error.message);
        res.status(500).send('Error uploading video');
    }
});

app.listen(8081, () => {
    console.log("app is running on http://localhost:8081");
});
