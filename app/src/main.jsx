import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd'; // DndProvider'ı içe aktarın
import store from './store.js';
import './index.css'
ReactDOM.createRoot(document.getElementById('root')).render(
    // Provider ile Redux store'u uygulamaya sağlayın
    <Provider store={store}>
        <DndProvider backend={HTML5Backend}>
            <App />
        </DndProvider>
    </Provider>
);
