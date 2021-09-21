import Hls from 'hls.js';
import { useEffect,useState } from 'react'
import { videoUploads } from './actions/videoActions'
import { useDispatch, useSelector } from 'react-redux'
import ProgressBar from './component/ProgressBar'

function App() {
    const [videoSrc, setVideoSrc] = useState('');
    const [video, setVideo] = useState('');
    const [file, setFile] = useState('');
    const [fileName , setFileName] = useState('Choose File');
    const [uploadedPercentage, setUploadedPercentage] = useState(0)

    const dispatch = useDispatch()
    const videoUpload = useSelector(state => state.videoUpload)
    const {loading, error, video:videoStatus} = videoUpload;

    useEffect(()=>{
        setVideo(document.getElementById('video'))
        setVideoSrc("https://YOUR_BUCKET_NAME.s3.ap-south-1.amazonaws.com/video2/index.m3u8")
        if (Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(videoSrc);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoSrc;
        }
    },[video,videoSrc])

    const submitHandler= async(e) =>{
      e.preventDefault()
      const formData = new FormData();
      formData.append('file',file)
      dispatch(videoUploads(formData,progressEvent=>{
        setUploadedPercentage(parseInt(Math.round((progressEvent.loaded * 100)/ progressEvent.total)-95))
      }))
    }

    const onChange = e =>{
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }

  return (
    <>
      <div>
        <video 
          preload="none" 
          id='video' 
          width="720px" 
          height='400px'  
          controls 
          className="videoCanvas"  
          autoPlay={false}
        />
      </div>
      
      <div>

        <form onSubmit={submitHandler} encType="multipart/form-data">
            <div >
                <input id='customFile' type="file" name="video" onChange={onChange} />
                <label htmlFor='customFile' >
                  {fileName}
                </label>
            </div>
            <br/>
            {loading && <><ProgressBar percentage={uploadedPercentage}/> <p>Please wait, do not reload your browser</p> </>}
            {error && <p>{error}</p>}
            {videoStatus && <p>{videoStatus}</p>}
            <br />
            <div >
                <button type='submit' >upload</button>
            </div>
        </form>
      </div>
    </>
  );
}

export default App;
