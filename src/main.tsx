import ReactDOM from 'react-dom/client';
import { AppRouter } from './ui/navigation/Router.tsx';
import './styles/globals.css';

try {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('App root element was not found');
  }

  ReactDOM.createRoot(root).render(<AppRouter />);
} catch (error) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f6f6f6;padding:24px;">
        <div style="width:100%;max-width:720px;background:white;border:1px solid #fecaca;border-radius:10px;padding:24px;font-family:Inter, Arial, sans-serif;">
          <h1 style="margin:0 0 8px 0;font-size:20px;line-height:28px;color:#101828;">App failed to start</h1>
          <p style="margin:0 0 16px 0;font-size:14px;line-height:20px;color:#4a5565;">A fatal error occurred before React mounted.</p>
          <pre style="margin:0;overflow:auto;background:#f9fafb;border-radius:4px;padding:16px;font-size:12px;line-height:20px;color:#b42318;">${
            error instanceof Error ? error.message : 'Unknown startup error'
          }</pre>
        </div>
      </div>
    `;
  }

  console.error('App bootstrap failed', error);
}
