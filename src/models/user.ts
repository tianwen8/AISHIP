/**
 * User Model - CRUD operations for users table
 * Pure data access layer, no business logic
 */

import { db } from '@/db'
import { users } from '@/db/schema.index'
import { eq, and } from 'drizzle-orm'

export interface User {
  id: number
  uuid: string
  email: string
  created_at: Date | null
  nickname: string | null
  avatar_url: string | null
  locale: string | null
  signin_type: string | null
  signin_ip: string | null
  signin_provider: string | null
  signin_openid: string | null
  invite_code: string
  updated_at: Date | null
  invited_by: string
  is_affiliate: boolean
}

/**
 * Find user by UUID
 */
export async function findUserByUuid(uuid: string): Promise<User | null> {
  const [user] = await db()
    .select()
    .from(users)
    .where(eq(users.uuid, uuid))
    .limit(1)

  return user || null
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const [user] = await db()
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  return user || null
}

/**
 * Find user by email and provider (for OAuth)
 */
export async function findUserByEmailAndProvider(
  email: string,
  provider: string
): Promise<User | null> {
  const [user] = await db()
    .select()
    .from(users)
    .where(
      and(
        eq(users.email, email),
        eq(users.signin_provider, provider)
      )
    )
    .limit(1)

  return user || null
}

/**
 * Create new user
 */
export async function createUser(data: {
  uuid: string
  email: string
  nickname?: string
  avatar_url?: string
  locale?: string
  signin_type?: string
  signin_ip?: string
  signin_provider?: string
  signin_openid?: string
  invite_code?: string
  invited_by?: string
}): Promise<User> {
  const [user] = await db()
    .insert(users)
    .values({
      uuid: data.uuid,
      email: data.email,
      nickname: data.nickname || null,
      avatar_url: data.avatar_url || null,
      locale: data.locale || 'en',
      signin_type: data.signin_type || null,
      signin_ip: data.signin_ip || null,
      signin_provider: data.signin_provider || null,
      signin_openid: data.signin_openid || null,
      invite_code: data.invite_code || '',
      invited_by: data.invited_by || '',
      is_affiliate: false,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning()

  return user
}

/**
 * Update user information
 */
export async function updateUser(
  uuid: string,
  data: Partial<{
    nickname: string
    avatar_url: string
    locale: string
    invite_code: string
    is_affiliate: boolean
  }>
): Promise<User | null> {
  const [user] = await db()
    .update(users)
    .set({
      ...data,
      updated_at: new Date(),
    })
    .where(eq(users.uuid, uuid))
    .returning()

  return user || null
}
