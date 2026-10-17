import { Estyle } from 'elk-style-rule'

export const guideStyles = new Estyle().defineRules({
  guide: { display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '860px' },
  section: { padding: '22px', border: '1px solid #252825', borderRadius: '12px', backgroundColor: '#101210' },
  sectionTitle: { margin: '0 0 12px', color: '#e5e7e0', fontSize: '14px', fontWeight: 650 },
  paragraph: { margin: '0 0 12px', color: '#8e938b', fontSize: '12px', lineHeight: 1.7 },
  list: { margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#8e938b', fontSize: '12px', lineHeight: 1.6 },
  terms: { display: 'flex', flexDirection: 'column', gap: '14px' },
  term: { display: 'flex', flexDirection: 'column', gap: '5px', padding: '14px', border: '1px solid #242724', borderRadius: '10px', backgroundColor: '#0f110f' },
  termName: { margin: 0, color: '#c9f56b', fontSize: '12px', fontWeight: 650 },
  termText: { margin: 0, color: '#8e938b', fontSize: '12px', lineHeight: 1.65 },
  code: { padding: '1px 6px', borderRadius: '5px', backgroundColor: '#1a1c1a', color: '#cdd3c6', fontSize: '11px' },
}).mount('guide')
