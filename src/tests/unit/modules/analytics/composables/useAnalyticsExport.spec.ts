import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAnalyticsExport } from '@/modules/analytics/composables/useAnalyticsExport'

const {
  downloadBlobMock,
  aoaToSheetMock,
  bookNewMock,
  bookAppendSheetMock,
  writeMock,
} = vi.hoisted(() => ({
  downloadBlobMock: vi.fn(),
  aoaToSheetMock: vi.fn(() => ({})),
  bookNewMock: vi.fn(() => ({})),
  bookAppendSheetMock: vi.fn(),
  writeMock: vi.fn(() => new Uint8Array([1, 2, 3]).buffer),
}))

vi.mock('@/composables/useDownload', () => ({
  useDownload: () => ({
    downloadBlob: downloadBlobMock,
  }),
}))

vi.mock('xlsx', () => ({
  default: {},
  utils: {
    aoa_to_sheet: aoaToSheetMock,
    book_new: bookNewMock,
    book_append_sheet: bookAppendSheetMock,
  },
  write: writeMock,
}))

describe('useAnalyticsExport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exportToExcel creates workbook and downloads .xlsx file', () => {
    const { exportToExcel } = useAnalyticsExport()
    exportToExcel(['Name'], [['Alex']], 'students', 'Лист:*?/[]')

    expect(aoaToSheetMock).toHaveBeenCalledWith([['Name'], ['Alex']])
    expect(bookAppendSheetMock).toHaveBeenCalledTimes(1)
    expect(writeMock).toHaveBeenCalledWith(expect.any(Object), {
      bookType: 'xlsx',
      type: 'array',
    })
    expect(downloadBlobMock).toHaveBeenCalledWith(expect.any(Blob), 'students.xlsx')
  })

  it('exportChartToPng does nothing for null element', async () => {
    const { exportChartToPng } = useAnalyticsExport()
    await exportChartToPng(null, 'chart')

    expect(downloadBlobMock).not.toHaveBeenCalled()
  })
})
