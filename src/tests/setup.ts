import { afterEach, vi } from 'vitest'

const URLWithBlob = URL as typeof URL & {
  createObjectURL?: (blob: Blob) => string
  revokeObjectURL?: (url: string) => void
}

if (typeof URLWithBlob.createObjectURL !== 'function') {
  let n = 0
  URLWithBlob.createObjectURL = (blob: Blob) => `blob:mock-${++n}-${blob.size}`
}
if (typeof URLWithBlob.revokeObjectURL !== 'function') {
  URLWithBlob.revokeObjectURL = () => {}
}

afterEach(() => {
  vi.restoreAllMocks()
})
