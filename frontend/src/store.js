import { createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { videoUploadReducer } from './reducers/videoReducer';

const reducer = combineReducers({
    videoUpload:videoUploadReducer
})

const middleware = [thunk];

const store = createStore(reducer, composeWithDevTools(applyMiddleware(...middleware)))

export default store;