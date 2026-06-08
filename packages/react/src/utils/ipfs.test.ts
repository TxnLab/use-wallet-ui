import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { checkIpfsAvailability, extractIpfsResourcePath } from './ipfs'

const IPFS_GATEWAY_URL = 'https://ipfs.algonode.dev'

describe('checkIpfsAvailability', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('returns the URL as-is if it is not an IPFS reference', async () => {
    const url = 'https://example.com/image.png'
    const result = await checkIpfsAvailability(url)
    expect(result).toBe(url)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('treats HTTPS gateway URLs like ipfs:// for resolution', async () => {
    const cid = 'Qm123456789'
    const url = `https://ipfs.io/ipfs/${cid}`
    const nfdUrl = `https://images.nf.domains/ipfs/${cid}`

    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        'content-type': 'image/png',
      }),
    } as Response)

    const result = await checkIpfsAvailability(url)
    expect(result).toBe(nfdUrl)
    expect(fetchMock).toHaveBeenCalledWith(nfdUrl, { method: 'HEAD' })
  })

  it('returns NFD URL when NFD responds with an image content type', async () => {
    const cid = 'Qm123456789'
    const url = `ipfs://${cid}`
    const nfdUrl = `https://images.nf.domains/ipfs/${cid}`

    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        'content-type': 'image/png',
      }),
    } as Response)

    const result = await checkIpfsAvailability(url)
    expect(result).toBe(nfdUrl)
    expect(fetchMock).toHaveBeenCalledWith(nfdUrl, { method: 'HEAD' })
  })

  it('tries gateway URL when NFD request fails', async () => {
    const cid = 'Qm123456789'
    const url = `ipfs://${cid}`
    const nfdUrl = `https://images.nf.domains/ipfs/${cid}`
    const gatewayUrl = `${IPFS_GATEWAY_URL}/ipfs/${cid}`

    // NFD fails
    fetchMock.mockRejectedValueOnce(new Error('Network error'))

    // Gateway succeeds with image
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        'content-type': 'image/jpeg',
      }),
    } as Response)

    const result = await checkIpfsAvailability(url)
    expect(result).toBe(gatewayUrl)
    expect(fetchMock).toHaveBeenCalledWith(nfdUrl, { method: 'HEAD' })
    expect(fetchMock).toHaveBeenCalledWith(gatewayUrl, { method: 'HEAD' })
  })

  it('returns gateway URL if NFD responds but not with an image content type', async () => {
    const cid = 'Qm123456789'
    const url = `ipfs://${cid}`
    const nfdUrl = `https://images.nf.domains/ipfs/${cid}`
    const gatewayUrl = `${IPFS_GATEWAY_URL}/ipfs/${cid}`

    // NFD returns non-image
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        'content-type': 'text/plain',
      }),
    } as Response)

    // Gateway succeeds with image
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        'content-type': 'image/jpeg',
      }),
    } as Response)

    const result = await checkIpfsAvailability(url)
    expect(result).toBe(gatewayUrl)
    expect(fetchMock).toHaveBeenCalledWith(nfdUrl, { method: 'HEAD' })
    expect(fetchMock).toHaveBeenCalledWith(gatewayUrl, { method: 'HEAD' })
  })

  it('handles JSON metadata with IPFS image URL', async () => {
    const cid = 'Qm123456789'
    const imageCid = 'Qmimage12345'
    const url = `ipfs://${cid}`
    const nfdUrl = `https://images.nf.domains/ipfs/${cid}`
    const imageNfdUrl = `https://images.nf.domains/ipfs/${imageCid}`
    const gatewayUrl = `${IPFS_GATEWAY_URL}/ipfs/${cid}`

    // NFD returns non-image
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        'content-type': 'text/plain',
      }),
    } as Response)

    // Gateway returns JSON
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        'content-type': 'application/json',
      }),
    } as Response)

    // JSON fetch response
    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve({ image: `ipfs://${imageCid}` }),
    } as Response)

    // Nested ipfs image: NFD HEAD returns image (same pipeline as top-level ipfs://)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        'content-type': 'image/jpeg',
      }),
    } as Response)

    const result = await checkIpfsAvailability(url)
    expect(result).toBe(imageNfdUrl)
    expect(fetchMock).toHaveBeenCalledWith(nfdUrl, { method: 'HEAD' })
    expect(fetchMock).toHaveBeenCalledWith(gatewayUrl, { method: 'HEAD' })
    expect(fetchMock).toHaveBeenCalledWith(gatewayUrl)
    expect(fetchMock).toHaveBeenCalledWith(imageNfdUrl, { method: 'HEAD' })
  })

  it('handles JSON metadata with HTTP image URL', async () => {
    const cid = 'Qm123456789'
    const httpImageUrl = 'https://example.com/image.jpg'
    const url = `ipfs://${cid}`
    const nfdUrl = `https://images.nf.domains/ipfs/${cid}`
    const gatewayUrl = `${IPFS_GATEWAY_URL}/ipfs/${cid}`

    // NFD returns non-image
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        'content-type': 'text/plain',
      }),
    } as Response)

    // Gateway returns JSON
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        'content-type': 'application/json',
      }),
    } as Response)

    // JSON fetch response
    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve({ image: httpImageUrl }),
    } as Response)

    // HTTP image URL check
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        'content-type': 'image/jpeg',
      }),
    } as Response)

    const result = await checkIpfsAvailability(url)
    expect(result).toBe(httpImageUrl)
    expect(fetchMock).toHaveBeenCalledWith(nfdUrl, { method: 'HEAD' })
    expect(fetchMock).toHaveBeenCalledWith(gatewayUrl, { method: 'HEAD' })
    expect(fetchMock).toHaveBeenCalledWith(gatewayUrl)
    expect(fetchMock).toHaveBeenCalledWith(httpImageUrl, { method: 'HEAD' })
  })

  it('falls back to gateway URL when all verification attempts fail', async () => {
    const cid = 'Qm123456789'
    const url = `ipfs://${cid}`
    const nfdUrl = `https://images.nf.domains/ipfs/${cid}`
    const gatewayUrl = `${IPFS_GATEWAY_URL}/ipfs/${cid}`

    // NFD fails
    fetchMock.mockRejectedValueOnce(new Error('Network error'))

    // Gateway fails
    fetchMock.mockRejectedValueOnce(new Error('Gateway error'))

    const result = await checkIpfsAvailability(url)
    expect(result).toBe(gatewayUrl)
    expect(fetchMock).toHaveBeenCalledWith(nfdUrl, { method: 'HEAD' })
    expect(fetchMock).toHaveBeenCalledWith(gatewayUrl, { method: 'HEAD' })
  })
})

describe('extractIpfsResourcePath', () => {
  it('reads path after ipfs://', () => {
    expect(extractIpfsResourcePath('ipfs://Qmabc')).toBe('Qmabc')
  })

  it('reads path after /ipfs/ in HTTPS URLs', () => {
    expect(extractIpfsResourcePath('https://ipfs.io/ipfs/Qmabc')).toBe('Qmabc')
  })

  it('returns null for unrelated HTTPS URLs', () => {
    expect(extractIpfsResourcePath('https://example.com/image.png')).toBeNull()
  })
})
