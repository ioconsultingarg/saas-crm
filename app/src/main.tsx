import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { LimiteDeError } from './componentes/LimiteDeError'
import './estilos.css'

const raiz = document.getElementById('raiz')
if (!raiz) throw new Error('Falta el nodo #raiz en index.html')

createRoot(raiz).render(
  <StrictMode>
    {/* Ultima red: cubre el armazon y el login, que quedan fuera del
        limite interno de App. */}
    <LimiteDeError>
      <App />
    </LimiteDeError>
  </StrictMode>,
)
