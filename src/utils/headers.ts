export interface HeaderRow { key: string; value: string }

// headerRowsToRecord drops blank names so an empty editor row is never sent.
export function headerRowsToRecord(rows: HeaderRow[]): Record<string, string> {
  const record: Record<string, string> = {}
  for (const row of rows) {
    const name = row.key.trim()
    if (name) record[name] = row.value.trim()
  }
  return record
}

export function recordToHeaderRows(record: Record<string, string> | undefined): HeaderRow[] {
  if (!record) return []
  return Object.entries(record).map(([key, value]) => ({ key, value }))
}
