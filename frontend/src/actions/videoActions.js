import axios from 'axios';
import { 
    UPLOAD_VIDEO_FAIL,
    UPLOAD_VIDEO_SUCCESS,
    UPLOAD_VIDEO_REQUEST
} from '../constants/videoConstants'

export const videoUploads =  (video,uploadPercentage) => async(dispatch)=>{
    try{
        dispatch({
            type:UPLOAD_VIDEO_REQUEST,
        })
        const {data} = await axios.post('/upload',video,{
            headers:{
                'Content-Type':'multipart/form-data'
            },
            onUploadProgress: uploadPercentage
        })
        dispatch({
            type:UPLOAD_VIDEO_SUCCESS,
            payload: data
        })
    }catch(error){
        dispatch({
            type: UPLOAD_VIDEO_FAIL,
            payload: error.response && error.response.data.message ? error.response.data.message :error.message
        })
    }
}