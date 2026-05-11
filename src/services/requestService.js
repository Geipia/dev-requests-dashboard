import { supabase } from './supabaseClient'

export async function fetchRequests(filters = {}) {
  let query = supabase
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.priority) query = query.eq('priority', filters.priority)
  if (filters.type) query = query.eq('type', filters.type)
  if (filters.search) query = query.ilike('title', `%${filters.search}%`)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function fetchRequest(id) {
  const { data, error } = await supabase
    .from('requests')
    .select('*, request_comments(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createRequest(request) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('requests')
    .insert({ ...request, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRequest(id, updates) {
  const { data, error } = await supabase
    .from('requests')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRequest(id) {
  const { error } = await supabase.from('requests').delete().eq('id', id)
  if (error) throw error
}

export async function addComment(requestId, content) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('request_comments')
    .insert({ request_id: requestId, user_id: user.id, content })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchStats() {
  const { data, error } = await supabase.from('requests').select('status, priority, type, budget, actual_cost, created_at, completed_at')
  if (error) throw error
  const requests = data ?? []

  const byStatus = {}
  const byType = {}
  const byPriority = {}
  let totalBudget = 0
  let totalCost = 0

  for (const r of requests) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1
    byType[r.type] = (byType[r.type] ?? 0) + 1
    byPriority[r.priority] = (byPriority[r.priority] ?? 0) + 1
    if (r.budget) totalBudget += parseFloat(r.budget)
    if (r.actual_cost) totalCost += parseFloat(r.actual_cost)
  }

  return { total: requests.length, byStatus, byType, byPriority, totalBudget, totalCost }
}
