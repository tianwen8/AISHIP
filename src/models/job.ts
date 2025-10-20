/**
 * Job Model - CRUD operations for jobs table
 * Pure data access layer, no business logic
 */

import { db } from '@/db'
import { jobs } from '@/db/schema.index'
import { eq } from 'drizzle-orm'

export enum JobStatus {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Cached = 'cached',
}

export interface Job {
  id: number
  uuid: string
  run_uuid: string
  node_id: string
  node_type: string
  adapter: string
  input_params: any // JSONB
  output_artifact_uuid: string | null
  status: string
  credits_used: number
  started_at: Date | null
  completed_at: Date | null
  error_message: string | null
  cache_hit: boolean
  provider_metadata: any // JSONB
  created_at: Date | null
}

/**
 * Create new job
 */
export async function createJob(data: {
  uuid: string
  run_uuid: string
  node_id: string
  node_type: string
  adapter: string
  input_params: any
}): Promise<Job> {
  const [job] = await db()
    .insert(jobs)
    .values({
      uuid: data.uuid,
      run_uuid: data.run_uuid,
      node_id: data.node_id,
      node_type: data.node_type,
      adapter: data.adapter,
      input_params: data.input_params,
      status: JobStatus.Pending,
      credits_used: 0,
      cache_hit: false,
      output_artifact_uuid: null,
      started_at: null,
      completed_at: null,
      error_message: null,
      provider_metadata: null,
      created_at: new Date(),
    })
    .returning()

  return job
}

/**
 * Find job by UUID
 */
export async function findJobByUuid(uuid: string): Promise<Job | null> {
  const [job] = await db()
    .select()
    .from(jobs)
    .where(eq(jobs.uuid, uuid))
    .limit(1)

  return job || null
}

/**
 * Update job status
 */
export async function updateJobStatus(
  uuid: string,
  status: JobStatus,
  errorMessage?: string | null
): Promise<void> {
  const updateData: any = { status }

  if (status === JobStatus.Running) {
    updateData.started_at = new Date()
  }

  if (status === JobStatus.Completed || status === JobStatus.Failed) {
    updateData.completed_at = new Date()
  }

  if (errorMessage) {
    updateData.error_message = errorMessage
  }

  await db()
    .update(jobs)
    .set(updateData)
    .where(eq(jobs.uuid, uuid))
}

/**
 * Update job with completion data
 */
export async function updateJobCompletion(
  uuid: string,
  data: {
    status: JobStatus
    output_artifact_uuid?: string | null
    credits_used: number
    cache_hit?: boolean
    provider_metadata?: any
    error_message?: string | null
  }
): Promise<void> {
  await db()
    .update(jobs)
    .set({
      status: data.status,
      output_artifact_uuid: data.output_artifact_uuid || null,
      credits_used: data.credits_used,
      cache_hit: data.cache_hit || false,
      provider_metadata: data.provider_metadata || null,
      error_message: data.error_message || null,
      completed_at: new Date(),
    })
    .where(eq(jobs.uuid, uuid))
}

/**
 * Get all jobs for a run
 */
export async function findJobsByRunUuid(runUuid: string): Promise<Job[]> {
  return await db()
    .select()
    .from(jobs)
    .where(eq(jobs.run_uuid, runUuid))
    .orderBy(jobs.created_at)
}

/**
 * Update job credits used
 */
export async function updateJobCredits(
  uuid: string,
  creditsUsed: number
): Promise<void> {
  await db()
    .update(jobs)
    .set({ credits_used: creditsUsed })
    .where(eq(jobs.uuid, uuid))
}
