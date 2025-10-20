/**
 * Run Model - CRUD operations for runs table
 * Uses Supabase REST API (bypasses PostgreSQL port issues)
 */

import { supabase } from '@/db/supabase'

export enum RunStatus {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

export interface Run {
  id: number
  uuid: string
  user_uuid: string
  graph_uuid: string
  graph_snapshot: any // JSONB
  status: string
  started_at: string | null
  completed_at: string | null
  total_credits_deducted: number
  total_credits_refunded: number
  error_message: string | null
  created_at: string | null
}

/**
 * Create new run
 */
export async function createRun(data: {
  uuid: string
  user_uuid: string
  graph_uuid: string
  graph_snapshot: any
}): Promise<Run> {
  const { data: run, error } = await supabase
    .from('runs')
    .insert({
      uuid: data.uuid,
      user_uuid: data.user_uuid,
      graph_uuid: data.graph_uuid,
      graph_snapshot: data.graph_snapshot,
      status: RunStatus.Pending,
      total_credits_deducted: 0,
      total_credits_refunded: 0,
      started_at: null,
      completed_at: null,
      error_message: null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create run: ${error.message}`)
  }

  return run
}

/**
 * Find run by UUID
 */
export async function findRunByUuid(uuid: string): Promise<Run | null> {
  const { data, error } = await supabase
    .from('runs')
    .select('*')
    .eq('uuid', uuid)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null
    }
    throw new Error(`Failed to find run: ${error.message}`)
  }

  return data
}

/**
 * Update run status
 */
export async function updateRunStatus(
  uuid: string,
  status: RunStatus,
  errorMessage?: string | null
): Promise<void> {
  const updateData: any = { status }

  if (status === RunStatus.Running && !errorMessage) {
    updateData.started_at = new Date().toISOString()
  }

  if (status === RunStatus.Completed || status === RunStatus.Failed) {
    updateData.completed_at = new Date().toISOString()
  }

  if (errorMessage) {
    updateData.error_message = errorMessage
  }

  const { error } = await supabase
    .from('runs')
    .update(updateData)
    .eq('uuid', uuid)

  if (error) {
    throw new Error(`Failed to update run status: ${error.message}`)
  }
}

/**
 * Update run credits
 */
export async function updateRunCredits(
  uuid: string,
  creditsDeducted: number,
  creditsRefunded: number = 0
): Promise<void> {
  const { error } = await supabase
    .from('runs')
    .update({
      total_credits_deducted: creditsDeducted,
      total_credits_refunded: creditsRefunded,
    })
    .eq('uuid', uuid)

  if (error) {
    throw new Error(`Failed to update run credits: ${error.message}`)
  }
}

/**
 * Get user's runs (recent first)
 */
export async function findRunsByUserUuid(
  userUuid: string,
  limit: number = 50
): Promise<Run[]> {
  const { data, error } = await supabase
    .from('runs')
    .select('*')
    .eq('user_uuid', userUuid)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to find runs: ${error.message}`)
  }

  return data || []
}

/**
 * Get runs by graph UUID
 */
export async function findRunsByGraphUuid(graphUuid: string): Promise<Run[]> {
  const { data, error } = await supabase
    .from('runs')
    .select('*')
    .eq('graph_uuid', graphUuid)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to find runs by graph: ${error.message}`)
  }

  return data || []
}
