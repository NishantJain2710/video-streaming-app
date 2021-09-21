import {
    UPLOAD_VIDEO_FAIL,
    UPLOAD_VIDEO_REQUEST,
    UPLOAD_VIDEO_SUCCESS
}from '../constants/videoConstants'

export const videoUploadReducer = (state = {}, action)=>{
    switch(action.type){
        case UPLOAD_VIDEO_REQUEST:
            return{loading:true}
        case UPLOAD_VIDEO_SUCCESS:
            return {loading:false, video:action.payload}
        case UPLOAD_VIDEO_FAIL:
            return {loading:false, error: action.payload}
        default:
            return state
    }
}