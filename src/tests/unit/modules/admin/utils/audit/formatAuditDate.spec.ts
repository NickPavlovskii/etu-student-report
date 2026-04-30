import { describe, it, expect } from 'vitest'
import { formatAuditDate } from '@/modules/admin/utils/audit/formatAuditDate'

describe('formatAuditDate', () => {
  it('возвращает тире для пустой строки', () => {
    expect(formatAuditDate('')).toBe('—')
  })

  it('форматирует ISO в ДД.ММ.ГГГГ ЧЧ:ММ', () => {
    const s = formatAuditDate('2024-06-15T14:05:00.000Z')
    expect(s).toMatch(/^\d{2}\.\d{2}\.2024 \d{2}:\d{2}$/)
  })
})
