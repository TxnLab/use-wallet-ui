// Default IPFS gateway to use as fallback
const IPFS_GATEWAY_URL = 'https://ipfs.algonode.dev'

/**
 * Extract the resource path after `ipfs://` or after `/ipfs/` in an HTTP(S) gateway URL.
 * Used so HTTPS gateway links get the same NFD and HEAD checks as `ipfs://` URLs.
 */
export function extractIpfsResourcePath(url: string): string | null {
  const trimmed = url.trim()
  if (trimmed.startsWith('ipfs://')) {
    const rest = trimmed.slice('ipfs://'.length)
    return rest.length > 0 ? rest : null
  }
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    const mark = '/ipfs/'
    const idx = parsed.pathname.indexOf(mark)
    if (idx === -1) {
      return null
    }
    const after = parsed.pathname.slice(idx + mark.length)
    return after.length > 0 ? after : null
  } catch {
    return null
  }
}

/**
 * Check availability of an IPFS resource and return appropriate URL
 * Tries images.nf.domains first, falls back to IPFS gateway
 * Only returns URLs for image content types
 *
 * @param url - `ipfs://` URL or HTTPS URL whose path contains `/ipfs/...`
 * @returns URL to use (either images.nf.domains or fallback gateway)
 */
export const checkIpfsAvailability = async (url: string): Promise<string> => {
  const resourcePath = extractIpfsResourcePath(url)
  if (!resourcePath) {
    return url
  }

  const nfdUrl = `https://images.nf.domains/ipfs/${resourcePath}`
  const gatewayUrl = `${IPFS_GATEWAY_URL}/ipfs/${resourcePath}`

  // Helper to check if content type is an image
  const isImageContentType = (contentType: string): boolean => {
    return contentType.startsWith('image/')
  }

  // Try images.nf.domains first
  try {
    const response = await fetch(nfdUrl, { method: 'HEAD' })
    if (response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && isImageContentType(contentType)) {
        return nfdUrl
      }
    }
  } catch {
    console.info(
      `CID ${resourcePath} is not cached on images.nf.domains, trying IPFS gateway...`,
    )
  }

  // Try IPFS gateway
  try {
    const response = await fetch(gatewayUrl, { method: 'HEAD' })
    if (response.ok) {
      const contentType = response.headers.get('content-type')

      // If it's an image, return the gateway URL
      if (contentType && isImageContentType(contentType)) {
        return gatewayUrl
      }

      // If it's JSON, try to get image URL from metadata
      if (contentType === 'application/json') {
        try {
          const jsonResponse = await fetch(gatewayUrl)
          const metadata = await jsonResponse.json()

          const imageUrl = metadata.image
          if (typeof imageUrl === 'string' && imageUrl.length > 0) {
            if (extractIpfsResourcePath(imageUrl)) {
              return await checkIpfsAvailability(imageUrl)
            }
            if (imageUrl.startsWith('http')) {
              try {
                const imageResponse = await fetch(imageUrl, { method: 'HEAD' })
                if (imageResponse.ok) {
                  const imageContentType =
                    imageResponse.headers.get('content-type')
                  if (
                    imageContentType &&
                    isImageContentType(imageContentType)
                  ) {
                    return imageUrl
                  }
                }
              } catch {
                console.error('Error checking HTTP image URL')
              }
            }
          }
        } catch {
          console.error('Error processing JSON metadata')
        }
      }
    }
  } catch {
    console.error(`Error checking gateway for CID ${resourcePath}`)
  }

  // Fallback to IPFS gateway without guarantee it's an image
  return gatewayUrl
}
