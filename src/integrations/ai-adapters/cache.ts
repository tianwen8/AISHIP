/**
 * AI API Cache System
 * Record-Replay pattern for development testing
 * Saves expensive API calls by caching responses
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const CACHE_DIR = path.join(process.cwd(), '.ai-cache')
const CACHE_VERSION = 'v1'

// Cache is enabled only in development and when explicitly set
const USE_CACHE =
  process.env.USE_AI_CACHE === 'true' &&
  process.env.NODE_ENV !== 'production'

/**
 * Generate cache key from request parameters
 */
export function generateCacheKey(params: {
  model: string
  prompt?: string
  duration?: number
  text?: string
  [key: string]: any
}): string {
  // Extract model name (e.g., "fal-ai/sora-2/text-to-video" → "sora-2")
  const modelName = params.model.split('/').filter(p => p !== 'fal-ai').join('-')

  // Hash all parameters for uniqueness
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(params))
    .digest('hex')
    .substring(0, 8)

  // Format: v1-sora-2-8s-abc12345.json
  const duration = params.duration ? `${params.duration}s` : ''
  return `${CACHE_VERSION}-${modelName}${duration ? `-${duration}` : ''}-${hash}`
}

/**
 * Cached API call wrapper
 * First call: Real API + save to cache
 * Subsequent calls: Read from cache
 */
export async function cachedAPICall<T>(
  cacheKey: string,
  apiCall: () => Promise<T>,
  options?: {
    description?: string  // Human-readable description for logging
  }
): Promise<T> {
  // Production mode: always call real API
  if (!USE_CACHE) {
    if (process.env.NODE_ENV === 'production') {
      console.log(`[Cache] Production mode - calling real API`)
    }
    return apiCall()
  }

  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`)
  const description = options?.description || cacheKey

  // Check if cache exists
  if (fs.existsSync(cacheFile)) {
    console.log(`[Cache HIT] ${description}`)
    console.log(`[Cache] Reading from: ${cacheFile}`)

    try {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))

      // Validate cache structure
      if (!cached.timestamp || !cached.data) {
        console.warn(`[Cache] Invalid cache format, calling real API`)
        fs.unlinkSync(cacheFile)
        return callAndCache()
      }

      const age = Date.now() - cached.timestamp
      const ageMinutes = Math.floor(age / 1000 / 60)
      console.log(`[Cache] Age: ${ageMinutes} minutes`)

      return cached.data as T
    } catch (error) {
      console.error(`[Cache] Failed to read cache:`, error)
      fs.unlinkSync(cacheFile)
      return callAndCache()
    }
  }

  // Cache miss: call real API and save
  return callAndCache()

  async function callAndCache(): Promise<T> {
    console.log(`[Cache MISS] ${description}`)
    console.log(`[Cache] Calling real API (this will incur costs)`)

    const response = await apiCall()

    // Save to cache
    try {
      fs.mkdirSync(CACHE_DIR, { recursive: true })

      const cacheData = {
        version: CACHE_VERSION,
        timestamp: Date.now(),
        cacheKey,
        description,
        data: response
      }

      fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2), 'utf-8')
      console.log(`[Cache] Saved to: ${cacheFile}`)
    } catch (error) {
      console.error(`[Cache] Failed to save cache:`, error)
    }

    return response
  }
}

/**
 * Clear cache for specific model
 */
export function clearCache(pattern?: string) {
  if (!fs.existsSync(CACHE_DIR)) {
    console.log('[Cache] No cache directory found')
    return
  }

  const files = fs.readdirSync(CACHE_DIR)

  if (!pattern) {
    // Clear all cache
    files.forEach(file => {
      fs.unlinkSync(path.join(CACHE_DIR, file))
    })
    console.log(`[Cache] Cleared all cache (${files.length} files)`)
  } else {
    // Clear matching pattern
    const matching = files.filter(f => f.includes(pattern))
    matching.forEach(file => {
      fs.unlinkSync(path.join(CACHE_DIR, file))
    })
    console.log(`[Cache] Cleared ${matching.length} files matching "${pattern}"`)
  }
}

/**
 * List cache files
 */
export function listCache() {
  if (!fs.existsSync(CACHE_DIR)) {
    console.log('[Cache] No cache directory found')
    return []
  }

  const files = fs.readdirSync(CACHE_DIR)

  return files.map(file => {
    const fullPath = path.join(CACHE_DIR, file)
    const stats = fs.statSync(fullPath)
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))

    return {
      file,
      size: `${(stats.size / 1024).toFixed(2)} KB`,
      age: `${Math.floor((Date.now() - data.timestamp) / 1000 / 60)} min ago`,
      description: data.description
    }
  })
}

/**
 * Get cache status
 */
export function getCacheStatus() {
  return {
    enabled: USE_CACHE,
    directory: CACHE_DIR,
    version: CACHE_VERSION,
    environment: process.env.NODE_ENV || 'development',
    explicitSetting: process.env.USE_AI_CACHE
  }
}
