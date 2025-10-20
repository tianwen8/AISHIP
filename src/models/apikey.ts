/**
 * API Key Model - CRUD operations for apikeys table
 * Pure data access layer, no business logic
 */

import { db } from '@/db'
import { apikeys } from '@/db/schema.index'
import { eq, and } from 'drizzle-orm'

export enum ApiKeyStatus {
  Active = 'active',
  Revoked = 'revoked',
  Expired = 'expired',
}

export interface ApiKey {
  id: number
  api_key: string
  title: string | null
  user_uuid: string
  created_at: Date | null
  status: string | null
}

/**
 * Find API key by key string
 */
export async function findApiKeyByKey(apiKey: string): Promise<ApiKey | null> {
  const [key] = await db()
    .select()
    .from(apikeys)
    .where(eq(apikeys.api_key, apiKey))
    .limit(1)

  return key || null
}

/**
 * Find active API keys by user UUID
 */
export async function findApiKeysByUserUuid(userUuid: string): Promise<ApiKey[]> {
  return await db()
    .select()
    .from(apikeys)
    .where(
      and(
        eq(apikeys.user_uuid, userUuid),
        eq(apikeys.status, ApiKeyStatus.Active)
      )
    )
    .orderBy(apikeys.created_at)
}

/**
 * Create new API key
 */
export async function createApiKey(data: {
  api_key: string
  title: string
  user_uuid: string
}): Promise<ApiKey> {
  const [apiKey] = await db()
    .insert(apikeys)
    .values({
      api_key: data.api_key,
      title: data.title,
      user_uuid: data.user_uuid,
      status: ApiKeyStatus.Active,
      created_at: new Date(),
    })
    .returning()

  return apiKey
}

/**
 * Revoke API key
 */
export async function revokeApiKey(apiKey: string): Promise<void> {
  await db()
    .update(apikeys)
    .set({ status: ApiKeyStatus.Revoked })
    .where(eq(apikeys.api_key, apiKey))
}

/**
 * Delete API key
 */
export async function deleteApiKey(apiKey: string): Promise<void> {
  await db()
    .delete(apikeys)
    .where(eq(apikeys.api_key, apiKey))
}
