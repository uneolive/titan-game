import ReactDOM from 'react-dom/client';
import { AppRouter } from './ui/navigation/Router.tsx';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <AppRouter />
);
