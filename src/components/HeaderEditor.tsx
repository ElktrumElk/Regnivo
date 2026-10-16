import type { ChangeEvent } from 'react'
import { formStyles } from '../styles/formStyles.ts'
import type { HeaderRow } from '../utils/headers.ts'

interface HeaderRowItemProps {
  row: HeaderRow
  index: number
  onKeyChange: (index: number, value: string) => void
  onValueChange: (index: number, value: string) => void
  onRemove: (index: number) => void
}

function HeaderRowItem({ row, index, onKeyChange, onValueChange, onRemove }: HeaderRowItemProps) {
  function handleKeyChange(event: ChangeEvent<HTMLInputElement>) { onKeyChange(index, event.target.value) }
  function handleValueChange(event: ChangeEvent<HTMLInputElement>) { onValueChange(index, event.target.value) }
  function handleRemove() { onRemove(index) }
  return (
    <div className={formStyles.classes.headerRow}>
      <input className={formStyles.classes.input} aria-label={`Header name ${index + 1}`} placeholder="Authorization" value={row.key} onChange={handleKeyChange} />
      <input className={formStyles.classes.input} aria-label={`Header value ${index + 1}`} placeholder="Bearer token" value={row.value} onChange={handleValueChange} />
      <button className={formStyles.classes.removeButton} type="button" onClick={handleRemove}>Remove</button>
    </div>
  )
}

interface HeaderEditorProps {
  rows: HeaderRow[]
  onChange: (rows: HeaderRow[]) => void
}

export function HeaderEditor({ rows, onChange }: HeaderEditorProps) {
  function handleAdd() { onChange([...rows, { key: '', value: '' }]) }
  function handleAddAuthorization() { onChange([...rows, { key: 'Authorization', value: '' }]) }
  function handleKeyChange(index: number, value: string) {
    onChange(rows.map((row, i) => (i === index ? { ...row, key: value } : row)))
  }
  function handleValueChange(index: number, value: string) {
    onChange(rows.map((row, i) => (i === index ? { ...row, value } : row)))
  }
  function handleRemove(index: number) {
    onChange(rows.filter((_, i) => i !== index))
  }
  return (
    <div className={formStyles.classes.field}>
      <div className={formStyles.classes.sectionHead}>
        <span className={formStyles.classes.label}>Request headers</span>
        <div className={formStyles.classes.headerButtons}>
          <button className={formStyles.classes.smallButton} type="button" onClick={handleAddAuthorization}>Authorization</button>
          <button className={formStyles.classes.smallButton} type="button" onClick={handleAdd}>Add header</button>
        </div>
      </div>
      {rows.length === 0 ? (
        <p className={formStyles.classes.hint}>No headers configured. Headers are sent with every check, so an Authorization header applies to all requests.</p>
      ) : null}
      {rows.length > 0 ? (
        <div className={formStyles.classes.headerList}>
          {rows.map((row, index) => (
            <HeaderRowItem key={index} row={row} index={index} onKeyChange={handleKeyChange} onValueChange={handleValueChange} onRemove={handleRemove} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
