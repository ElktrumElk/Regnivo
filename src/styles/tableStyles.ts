import { Estyle } from 'elk-style-rule'

export const tableStyles = new Estyle().defineRules({
  scroll: { width: '100%', overflowX: 'auto' },
  table: { width: '100%', minWidth: '680px', borderCollapse: 'collapse' },
  heading: { padding: '11px 19px', color: '#5e635d', fontSize: '9px', fontWeight: 600, letterSpacing: '.06em', textAlign: 'left', textTransform: 'uppercase' },
  cell: { padding: '13px 19px', borderTop: '1px solid #20231f', color: '#aeb2aa', fontSize: '10px', whiteSpace: 'nowrap' },
  strong: { color: '#e0e3da', fontWeight: 600 },
  endpoint: { display: 'flex', flexDirection: 'column', gap: '3px' },
  url: { maxWidth: '250px', overflow: 'hidden', color: '#646963', fontSize: '9px', textOverflow: 'ellipsis' },
  code: { display: 'inline-flex', minWidth: '27px', justifyContent: 'center', padding: '3px 6px', border: '1px solid #30342e', borderRadius: '5px', color: '#b7d996', backgroundColor: '#171b15', fontFamily: 'ui-monospace, monospace', fontSize: '9px' },
  source: { color: '#7b8079', textTransform: 'capitalize' },
  rowActions: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  actionButton: { display: 'inline-flex', alignItems: 'center', gap: '5px', minHeight: '28px', padding: '0 8px', border: '1px solid #30332f', borderRadius: '6px', color: '#d5d8d0', backgroundColor: '#151715', fontSize: '9px', cursor: 'pointer', '&:hover': { backgroundColor: '#1c1f1b' }, '&:focus-visible': { outline: '2px solid #c9f56b', outlineOffset: '2px' } },
  emptyRow: { padding: '30px 20px', color: '#777c75', fontSize: '11px', textAlign: 'center' },
  rowDelete: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', border: '1px solid #30332f', borderRadius: '6px', color: '#8a8f87', backgroundColor: 'transparent', cursor: 'pointer', '&:hover': { color: '#e58c8c', borderColor: '#553333', backgroundColor: '#1d1515' }, '&:disabled': { opacity: .5, cursor: 'not-allowed' } },
}).mount('table')
