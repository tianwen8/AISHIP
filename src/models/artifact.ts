/**
 * Artifact Model - CRUD operations for artifacts table
 * Pure data access layer, no business logic
 */

import { db } from '@/db'
import { artifacts } from '@/db/schema.index'
import { eq } from 'drizzle-orm'

export enum ArtifactType {
  Video = 'video',
  Image = 'image',
  Audio = 'audio',
  Text = 'text',
}

export interface Artifact {
  id: number
  uuid: string
  user_uuid: string
  run_uuid: string
  job_uuid: string
  artifact_type: string
  file_url: string
  file_size: number | null
  mime_type: string | null
  duration: number | null
  width: number | null
  height: number | null
  metadata: any // JSONB
  created_at: Date | null
  expires_at: Date | null
}

/**
 * Create new artifact
 */
export async function createArtifact(data: {
  uuid: string
  user_uuid: string
  run_uuid: string
  job_uuid: string
  artifact_type: ArtifactType
  file_url: string
  file_size?: number | null
  mime_type?: string | null
  duration?: number | null
  width?: number | null
  height?: number | null
  metadata?: any
  expires_at?: Date | null
}): Promise<Artifact> {
  const [artifact] = await db()
    .insert(artifacts)
    .values({
      uuid: data.uuid,
      user_uuid: data.user_uuid,
      run_uuid: data.run_uuid,
      job_uuid: data.job_uuid,
      artifact_type: data.artifact_type,
      file_url: data.file_url,
      file_size: data.file_size || null,
      mime_type: data.mime_type || null,
      duration: data.duration || null,
      width: data.width || null,
      height: data.height || null,
      metadata: data.metadata || null,
      expires_at: data.expires_at || null,
      created_at: new Date(),
    })
    .returning()

  return artifact
}

/**
 * Find artifact by UUID
 */
export async function findArtifactByUuid(uuid: string): Promise<Artifact | null> {
  const [artifact] = await db()
    .select()
    .from(artifacts)
    .where(eq(artifacts.uuid, uuid))
    .limit(1)

  return artifact || null
}

/**
 * Find artifacts by run UUID
 */
export async function findArtifactsByRunUuid(runUuid: string): Promise<Artifact[]> {
  return await db()
    .select()
    .from(artifacts)
    .where(eq(artifacts.run_uuid, runUuid))
    .orderBy(artifacts.created_at)
}

/**
 * Find artifacts by job UUID
 */
export async function findArtifactsByJobUuid(jobUuid: string): Promise<Artifact[]> {
  return await db()
    .select()
    .from(artifacts)
    .where(eq(artifacts.job_uuid, jobUuid))
    .orderBy(artifacts.created_at)
}

/**
 * Find artifacts by user UUID
 */
export async function findArtifactsByUserUuid(
  userUuid: string,
  limit: number = 100
): Promise<Artifact[]> {
  return await db()
    .select()
    .from(artifacts)
    .where(eq(artifacts.user_uuid, userUuid))
    .orderBy(artifacts.created_at)
    .limit(limit)
}

/**
 * Delete artifact
 */
export async function deleteArtifact(uuid: string): Promise<void> {
  await db()
    .delete(artifacts)
    .where(eq(artifacts.uuid, uuid))
}
