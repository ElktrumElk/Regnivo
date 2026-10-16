import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageHeader } from '../components/PageHeader.tsx'

describe('PageHeader', () => {
  it('exposes the page title and supporting context', () => {
    render(<PageHeader eyebrow="Control center" title="Overview" description="Operational context" />)
    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByText('Operational context')).toBeInTheDocument()
  })
})
