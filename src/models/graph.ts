/**
 * Graph Model - CRUD operations for graphs table
 * Uses Supabase REST API (bypasses PostgreSQL port issues)
 */

import { supabase } from '@/db/supabase'

export interface Graph {
  id: number
  uuid: string
  user_uuid: string
  name: string
  description: string | null
  template_uuid: string | null
  graph_definition: any // JSONB - WorkflowPlan
  thumbnail_url: string | null
  last_run_uuid: string | null
  created_at: string | null
  updated_at: string | null
  status: string
}

/**
 * Create new graph
 */
export async function createGraph(data: {
  uuid: string
  user_uuid: string
  name: string
  description?: string
  graph_definition: any
}): Promise<Graph> {
  const { data: graph, error } = await supabase
    .from('graphs')
    .insert({
      uuid: data.uuid,
      user_uuid: data.user_uuid,
      name: data.name,
      description: data.description || null,
      template_uuid: null,
      graph_definition: data.graph_definition,
      thumbnail_url: null,
      last_run_uuid: null,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create graph: ${error.message}`)
  }

  return graph
}

/**
 * Find graph by UUID
 */
export async function findGraphByUuid(uuid: string): Promise<Graph | null> {
  const { data, error } = await supabase
    .from('graphs')
    .select('*')
    .eq('uuid', uuid)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null
    }
    throw new Error(`Failed to find graph: ${error.message}`)
  }

  return data
}

/**
 * Update graph definition
 */
export async function updateGraphDefinition(
  uuid: string,
  graphDefinition: any
): Promise<void> {
  const { error } = await supabase
    .from('graphs')
    .update({
      graph_definition: graphDefinition,
      updated_at: new Date().toISOString(),
    })
    .eq('uuid', uuid)

  if (error) {
    throw new Error(`Failed to update graph: ${error.message}`)
  }
}

/**
 * Update last run UUID
 */
export async function updateGraphLastRun(
  uuid: string,
  runUuid: string
): Promise<void> {
  const { error } = await supabase
    .from('graphs')
    .update({
      last_run_uuid: runUuid,
      updated_at: new Date().toISOString(),
    })
    .eq('uuid', uuid)

  if (error) {
    throw new Error(`Failed to update graph: ${error.message}`)
  }
}

/**
 * Get user's graphs (recent first)
 */
export async function findGraphsByUserUuid(
  userUuid: string,
  limit: number = 50
): Promise<Graph[]> {
  const { data, error } = await supabase
    .from('graphs')
    .select('*')
    .eq('user_uuid', userUuid)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to find graphs: ${error.message}`)
  }

  return data || []
}
