import { Estyle } from 'elk-style-rule'

export const baseStyles = new Estyle().defineRules({
  body: {
    margin: 0,
    minWidth: '320px',
    minHeight: '100vh',
    backgroundColor: '#0b0c0b',
    color: '#f3f4ef',
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSynthesis: 'none',
    textRendering: 'optimizeLegibility',
  },
  srOnly: { position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 },
}).mount('base')
