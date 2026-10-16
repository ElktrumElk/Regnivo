import { Estyle } from 'elk-style-rule'

export const formStyles = new Estyle().defineRules({
  card: { maxWidth: '780px', padding: '22px', border: '1px solid #252825', borderRadius: '12px', backgroundColor: '#101210' },
  form: { display: 'flex', flexDirection: 'column', gap: '19px' },
  row: { display: 'flex', gap: '15px' },
  field: { display: 'flex', flex: 1, flexDirection: 'column', gap: '7px', minWidth: 0 },
  label: { color: '#a8aca4', fontSize: '10px', fontWeight: 620 },
  hint: { margin: 0, color: '#5f645d', fontSize: '9px', lineHeight: 1.5 },
  input: { boxSizing: 'border-box', width: '100%', minHeight: '39px', padding: '0 11px', border: '1px solid #30332f', borderRadius: '7px', outline: 0, color: '#e4e6df', backgroundColor: '#151715', font: 'inherit', fontSize: '11px', '&:focus': { borderColor: '#899f5d', boxShadow: '0 0 0 2px rgba(201,245,107,.1)' } },
  textarea: { boxSizing: 'border-box', width: '100%', minHeight: '92px', padding: '10px 11px', border: '1px solid #30332f', borderRadius: '7px', outline: 0, resize: 'vertical', color: '#e4e6df', backgroundColor: '#151715', font: 'inherit', fontSize: '11px', '&:focus': { borderColor: '#899f5d' } },
  checkboxRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', padding: '13px', border: '1px solid #292c28', borderRadius: '8px' },
  checkbox: { width: '17px', height: '17px', accentColor: '#c9f56b' },
  actions: { display: 'flex', alignItems: 'center', gap: '9px', paddingTop: '4px' },
  message: { margin: 0, color: '#a7ca82', fontSize: '10px' },
  danger: { margin: 0, color: '#e58c8c', fontSize: '10px' },
  projects: { display: 'flex', flexWrap: 'wrap', gap: '14px' },
  projectCard: { boxSizing: 'border-box', flex: '1 1 310px', minWidth: 0, padding: '18px', border: '1px solid #272a26', borderRadius: '11px', backgroundColor: '#111311' },
  projectTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' },
  projectName: { margin: 0, color: '#e5e7e0', fontSize: '13px', fontWeight: 650 },
  projectDescription: { minHeight: '34px', margin: '7px 0 18px', color: '#6f746d', fontSize: '10px', lineHeight: 1.6 },
  projectMeta: { display: 'flex', justifyContent: 'space-between', paddingTop: '13px', borderTop: '1px solid #252825', color: '#656a63', fontSize: '9px' },
}).defineMedia({ '(max-width: 600px)': { row: { flexDirection: 'column' }, card: { padding: '17px' } } }).mount('form')
