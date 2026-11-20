import * as DB from '@/mock/data'

/**
 * 统一数据适配层。
 * - USE_MOCK=true：使用内存 Mock 数据库（可 CRUD）
 * - USE_MOCK=false：通过 HTTP 调用真实后端 /api/*
 * 业务代码只依赖本模块导出的方法，切换数据源不需要改动页面。
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const API_BASE = import.meta.env.VITE_API_BASE || ''

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms))

export interface Paginated<T> {
  list: T[]
  total: number
}

// Mock 表注册表：表名 -> 数据集
const tables: Record<string, any[]> = {
  materials: DB.materials,
  partners: DB.partners,
  zones: DB.zones,
  aisles: DB.aisles,
  bins: DB.bins,
  binGroups: DB.binGroups,
  trayAreas: DB.trayAreas,
  ports: DB.ports,
  pallets: DB.pallets,
  inventory: DB.inventory,
  inboundOrders: DB.inboundOrders,
  outboundOrders: DB.outboundOrders,
  devices: DB.devices,
  wcsTasks: DB.wcsTasks,
  calls: DB.calls,
  pickTasks: DB.pickTasks,
  accounts: DB.accounts,
  roles: DB.roles,
  logs: DB.logs,
  recycleItems: DB.recycleItems,
  tableSchemas: DB.tableSchemas,
  rules: DB.rules,
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('wms_token')
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.ok === false) {
    if (res.status === 401) {
      localStorage.removeItem('wms_token')
      throw new Error('登录已过期，请重新登录')
    }
    throw new Error(json.error || `请求失败：${res.status}`)
  }
  return json as T
}

/** 通用列表查询（Mock 支持关键词模糊搜索 + 分页） */
export async function listTable<T = any>(
  table: string,
  params?: { page?: number; pageSize?: number; keyword?: string; fields?: string[] }
): Promise<Paginated<T>> {
  if (!USE_MOCK) {
    return http<Paginated<T>>(`/api/${table}`, { method: 'GET' })
  }
  await delay()
  const rows = [...(tables[table] || [])]
  let filtered = rows
  if (params?.keyword && params?.fields?.length) {
    const kw = params.keyword.toLowerCase()
    filtered = rows.filter((row) =>
      params.fields!.some((f) => String(row[f] ?? '').toLowerCase().includes(kw))
    )
  }
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const start = (page - 1) * pageSize
  return {
    list: filtered.slice(start, start + pageSize) as T[],
    total: filtered.length,
  }
}

/** 全量取数（不分页，用于图表统计） */
export async function allTable<T = any>(table: string): Promise<T[]> {
  if (!USE_MOCK) return http<T[]>(`/api/${table}`)
  await delay(60)
  return [...(tables[table] || [])] as T[]
}

export async function createRow<T = any>(table: string, row: Partial<T>): Promise<T> {
  if (!USE_MOCK) {
    return http<T>(`/api/${table}`, { method: 'POST', body: JSON.stringify(row) })
  }
  await delay()
  const newRow = { id: DB.nextId('N'), ...row } as any
  if (!tables[table]) tables[table] = []
  tables[table].unshift(newRow)
  return newRow
}

export async function updateRow<T = any>(table: string, id: string, patch: Partial<T>): Promise<T> {
  if (!USE_MOCK) {
    return http<T>(`/api/${table}/${id}`, { method: 'PUT', body: JSON.stringify(patch) })
  }
  await delay()
  const row = tables[table]?.find((r) => r.id === id)
  if (row) Object.assign(row, patch)
  return row as T
}

export async function deleteRow(table: string, id: string): Promise<void> {
  if (!USE_MOCK) {
    await http(`/api/${table}/${id}`, { method: 'DELETE' })
    return
  }
  await delay()
  if (tables[table]) {
    const idx = tables[table].findIndex((r) => r.id === id)
    if (idx >= 0) tables[table].splice(idx, 1)
  }
}

// ---- 认证 ----
export interface LoginResult {
  ok: boolean
  token?: string
  username?: string
  role?: string
  perms?: string[]
  error?: string
}

export async function login(username: string, password: string): Promise<LoginResult> {
  if (!USE_MOCK) {
    return http<LoginResult>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }
  await delay(400)
  const account = DB.accounts.find((a) => a.username === username)
  if (!account || !password) {
    return { ok: false, error: '账号或密码错误' }
  }
  const role = DB.roles.find((r) => r.name === account.role)
  const perms = role?.perms.includes('*')
    ? ['wms:view', 'wms:inbound', 'wms:outbound', 'wcs:monitor', 'wms:base', 'wms:admin', 'wms:data', 'wms:log', 'wms:recycle', 'wms:pick']
    : role?.perms || []
  const token = `mock-token-${username}-${Date.now()}`
  localStorage.setItem('wms_token', token)
  return { ok: true, token, username: account.realName, role: account.role, perms }
}

export async function logout(): Promise<void> {
  localStorage.removeItem('wms_token')
  if (!USE_MOCK) await http('/api/logout', { method: 'POST' }).catch(() => {})
}

export async function getSession(): Promise<LoginResult | null> {
  const token = localStorage.getItem('wms_token')
  if (!token) return null
  if (!USE_MOCK) return http<LoginResult>('/api/session').catch(() => null)
  // Mock：从 token 解析用户名
  const m = token.match(/mock-token-([^-]+)-/)
  const username = m?.[1] || 'admin'
  const account = DB.accounts.find((a) => a.username === username) || DB.accounts[0]
  const role = DB.roles.find((r) => r.name === account.role)
  const perms = role?.perms.includes('*')
    ? ['wms:view', 'wms:inbound', 'wms:outbound', 'wcs:monitor', 'wms:base', 'wms:admin', 'wms:data', 'wms:log', 'wms:recycle', 'wms:pick']
    : role?.perms || []
  return { ok: true, username: account.realName, role: account.role, perms }
}

// ---- 业务动作（示意，Mock 下推进状态） ----
export async function doAction(action: string, payload?: any): Promise<{ ok: boolean; message: string }> {
  if (!USE_MOCK) return http(`/api/${action}`, { method: 'POST', body: JSON.stringify(payload || {}) })
  await delay(300)
  const messages: Record<string, string> = {
    putaway: '上架成功，已写库存并下发 WCS 任务',
    allocate: '分配成功，已按 FIFO 预占库存',
    pick: '拣选确认成功，已扣减库存并下发任务',
    call: '呼叫成功，AGV 已接单',
    move: '移库成功，已更新货位占用',
    saveMap: '库位图已保存',
    merge: '组盘成功，已同步库存',
    regroup: '重新组托上架成功',
  }
  return { ok: true, message: messages[action] || '操作成功' }
}

export { DB }
