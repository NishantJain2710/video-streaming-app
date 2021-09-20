import Hls from 'hls.js';
import { useEffect,useState } from 'react'

function App() {
    const [videoSrc, setVideoSrc] = useState('');
    const [video, setVideo] = useState('');

    useEffect(()=>{
        setVideo(document.getElementById('video'))
        setVideoSrc("videoSrc")
        if (Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(videoSrc);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoSrc;
        }
    },[video,videoSrc])

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

        <form action="/upload" method="post" encType="multipart/form-data">
            <div >
                <input type="file" name="video"/>
                </div>
            <br />
            <div >
                <button>upload</button>
            </div>
        </form>
      </div>
    </>
  );
}

export default App;
