import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { baseStyles } from './styles/baseStyles.ts'
import "./index.css"
// Applying the generated class keeps global page styling inside elk-style-rule.
document.body.className = baseStyles.classes.body

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
