// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Página não encontrada! (404)</h2>
      <p>O caminho digitado não existe.</p>
      <Link to="/">Voltar para a Home</Link>
    </div>
  );
}