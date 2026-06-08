// Default IPFS gateway to use as fallback
const IPFS_GATEWAY_URL = 'https://ipfs.algonode.dev'

/**
 * Check availability of an IPFS resource and return appropriate URL
 * Tries images.nf.domains first, falls back to IPFS gateway
 * Only returns URLs for image content types
 */
export const checkIpfsAvailability = async (url: string): Promise<string> => {
  if (!url.startsWith('ipfs://')) {
    return url
  }

  const cid = url.replace('ipfs://', '')
  const nfdUrl = `https://images.nf.domains/ipfs/${cid}`
  const gatewayUrl = `${IPFS_GATEWAY_URL}/ipfs/${cid}`

  const isImageContentType = (contentType: string): boolean => {
    return contentType.startsWith('image/')
  }

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
      `CID ${cid} is not cached on images.nf.domains, trying IPFS gateway...`,
    )
  }

  try {
    const response = await fetch(gatewayUrl, { method: 'HEAD' })
    if (response.ok) {
      const contentType = response.headers.get('content-type')

      if (contentType && isImageContentType(contentType)) {
        return gatewayUrl
      }

      if (contentType === 'application/json') {
        try {
          const jsonResponse = await fetch(gatewayUrl)
          const metadata = await jsonResponse.json()
          const imageUrl = metadata.image

          if (imageUrl) {
            if (imageUrl.startsWith('ipfs://')) {
              const imageCid = imageUrl.replace('ipfs://', '')
              const imageGatewayUrl = `${IPFS_GATEWAY_URL}/ipfs/${imageCid}`
              const imageResponse = await fetch(imageGatewayUrl, {
                method: 'HEAD',
              })
              if (imageResponse.ok) {
                const imageContentType =
                  imageResponse.headers.get('content-type')
                if (imageContentType && isImageContentType(imageContentType)) {
                  return imageGatewayUrl
                }
              }
            } else if (imageUrl.startsWith('http')) {
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
    console.error('Error checking IPFS gateway')
  }

  return gatewayUrl
}
