import { describe, it, expect, vi } from 'vitest'
import { useDownload } from '@/composables/useDownload'

describe('useDownload', () => {
  it('downloadBlob creates link, clicks and revokes url', () => {
    const { downloadBlob } = useDownload()
    const blob = new Blob(['hello'], { type: 'text/plain' })
    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:test-url')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    const clickMock = vi.fn()
    const removeMock = vi.fn()
    const appendChild = vi.spyOn(document.body, 'appendChild')

    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName !== 'a') return originalCreateElement(tagName)
      const el = originalCreateElement('a') as HTMLAnchorElement
      el.click = clickMock
      el.remove = removeMock
      return el
    })

    downloadBlob(blob, 'test.txt')

    expect(createObjectURL).toHaveBeenCalledWith(blob)
    expect(appendChild).toHaveBeenCalledTimes(1)
    expect(clickMock).toHaveBeenCalledTimes(1)
    expect(removeMock).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test-url')
  })

  it('downloadAnnotatedFile opens pdf in new tab', () => {
    const { downloadAnnotatedFile } = useDownload()
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:pdf-url')
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    downloadAnnotatedFile(btoa('pdf-content'), 'report.pdf')

    expect(openSpy).toHaveBeenCalledWith('blob:pdf-url', '_blank', 'noopener')
  })

  it('downloadAnnotatedFile skips when base64 is empty', () => {
    const { downloadAnnotatedFile } = useDownload()
    const createObjectURL = vi.spyOn(URL, 'createObjectURL')
    const openSpy = vi.spyOn(window, 'open')

    downloadAnnotatedFile('', 'empty.pdf')

    expect(createObjectURL).not.toHaveBeenCalled()
    expect(openSpy).not.toHaveBeenCalled()
  })
})
