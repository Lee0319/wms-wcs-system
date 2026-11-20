// 仓储业务 Mock 数据库 —— 内存态，可 CRUD

let seq = 1000
export const nextId = (prefix: string) => `${prefix}-${++seq}`
export const today = () => new Date().toISOString().slice(0, 10)
export const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}
export const daysAfter = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

// ---- 基础数据 ----
export interface Material {
  id: string
  code: string
  name: string
  spec: string
  unit: string
  volume: number
  zone: string
  abc: string
  batchMgmt: string
  shelfLife: number
  safetyStock: number
  status: string
}

const materialNames = [
  ['冷轧钢卷', 'SPCC 1.0×1250'], ['热轧钢板', 'Q235 3.0×1500'], ['镀锌卷', 'DX51D 0.8×1219'],
  ['铝型材', '6063-T5 6m'], ['不锈钢管', '304 Φ25×2'], ['铜排', 'T2 30×5'],
  ['工程塑料粒', 'PA66'], ['轴承', '6205-2RS'], ['伺服电机', '1.5kW'], ['气缸', 'SC63×100'],
  ['传感器', '接近开关 NPN'], ['电缆', 'YJV 3×95'], ['纸箱', '五层瓦楞 60×40×40'],
  ['托盘', '木质 1200×1000'], ['标签纸', '热敏 100×80'],
]
export const materials: Material[] = materialNames.map(([name, spec], i) => ({
  id: `M${i + 1}`,
  code: `SKU-${1001 + i}`,
  name,
  spec,
  unit: pick(['件', '卷', '张', '根', '台', '千克']),
  volume: pick([0, 0.02, 0.05, 0.12, 0.3, 0.8]),
  zone: pick(['ZK01', 'ZK02', 'ZK03', 'ZK04']),
  abc: pick(['A', 'B', 'C']),
  batchMgmt: pick(['是', '否']),
  shelfLife: pick([0, 0, 30, 90, 180, 365]),
  safetyStock: rnd(10, 200),
  status: '启用',
}))

export interface Partner {
  id: string
  code: string
  name: string
  type: string
  contact: string
  phone: string
  address: string
  remark: string
}
const partnerNames = [
  ['宝钢股份', '供应商'], ['鞍钢集团', '供应商'], ['首钢股份', '供应商'],
  ['华东汽车', '客户'], ['南方机械', '客户'], ['德力西电气', '客户'],
  ['顺丰物流', '承运商'], ['京东物流', '承运商'],
]
export const partners: Partner[] = partnerNames.map(([name, type], i) => ({
  id: `BP${i + 1}`,
  code: `BP${String(i + 1).padStart(3, '0')}`,
  name,
  type,
  contact: pick(['张伟', '李娜', '王强', '刘敏', '陈静']),
  phone: `1${pick([3, 5, 7, 8, 9])}${String(rnd(100000000, 999999999))}`,
  address: pick(['上海市宝山区', '江苏省苏州市', '广东省深圳市', '浙江省宁波市']),
  remark: '',
}))

export interface Zone { id: string; code: string; name: string; warehouse: string; aisleCount: number; strategy: string }
export const zones: Zone[] = [
  { id: 'Z1', code: 'ZK01', name: '型材区', warehouse: 'WH01', aisleCount: 8, strategy: '标准策略' },
  { id: 'Z2', code: 'ZK02', name: '板材区', warehouse: 'WH01', aisleCount: 6, strategy: '标准策略' },
  { id: 'Z3', code: 'ZK03', name: '成品区', warehouse: 'WH02', aisleCount: 10, strategy: '单物料专巷' },
  { id: 'Z4', code: 'ZK04', name: '缓存区', warehouse: 'WH02', aisleCount: 4, strategy: '标准策略' },
]

export interface Aisle { id: string; code: string; name: string; zone: string; material: string; direction: string; stacker: string; binCount: number }
export const aisles: Aisle[] = Array.from({ length: 16 }, (_, i) => ({
  id: `A${i + 1}`,
  code: `A${String(i + 1).padStart(2, '0')}`,
  name: `A${String(i + 1).padStart(2, '0')} 专巷`,
  zone: pick(['ZK01', 'ZK02', 'ZK03']),
  material: pick(materials).code,
  direction: pick(['不指定', '左进右出', '右进左出']),
  stacker: pick(['STK-01', 'STK-02', 'STK-03', '']),
  binCount: rnd(20, 60),
}))

export interface Bin { id: string; code: string; aisle: string; zone: string; face: string; column: number; material: string; volume: number; status: string }
export const bins: Bin[] = Array.from({ length: 120 }, (_, i) => ({
  id: `B${i + 1}`,
  code: `${pick(['A01', 'A02', 'A03', 'A04'])}${pick(['A', 'B'])}${String(rnd(1, 20)).padStart(2, '0')}`,
  aisle: pick(['A01', 'A02', 'A03', 'A04']),
  zone: pick(['ZK01', 'ZK02', 'ZK03']),
  face: pick(['A', 'B']),
  column: rnd(1, 20),
  material: pick([...materials.map((m) => m.code), '']),
  volume: pick([0, 0.5, 1, 2, 5]),
  status: pick(['空货位', '在库', '在库', '在库', '锁定', '拣选中', '返库中', '停用']),
}))

export interface BinGroup { id: string; code: string; name: string; aisle: string; startCol: number; endCol: number; direction: string; material: string; lockedBatch: string }
export const binGroups: BinGroup[] = Array.from({ length: 8 }, (_, i) => ({
  id: `G${i + 1}`,
  code: `G-A${String(rnd(1, 8)).padStart(2, '0')}-A1`,
  name: `A${String(rnd(1, 8)).padStart(2, '0')}-A 面联动组`,
  aisle: pick(['A01', 'A02', 'A03']),
  startCol: rnd(1, 5),
  endCol: rnd(8, 15),
  direction: pick(['先小后大', '先大后小']),
  material: pick(materials).code,
  lockedBatch: pick(['', '', 'B-2026001']),
}))

export interface TrayArea { id: string; code: string; name: string; capacity: number; warning: number; pallets: number }
export const trayAreas: TrayArea[] = [
  { id: 'T1', code: 'SHIP1', name: '发货缓存区', capacity: 100, warning: 80, pallets: 62 },
  { id: 'T2', code: 'SHIP2', name: '发货缓存区2', capacity: 80, warning: 75, pallets: 71 },
  { id: 'T3', code: 'EMPTY1', name: '空托盘区', capacity: 200, warning: 85, pallets: 120 },
  { id: 'T4', code: 'PICK1', name: '拣选补给区', capacity: 60, warning: 70, pallets: 33 },
  { id: 'T5', code: 'INSPECT', name: '待检区', capacity: 40, warning: 80, pallets: 12 },
]

export interface Port { id: string; code: string; name: string; area: string; aisle: string; type: string; status: string }
export const ports: Port[] = Array.from({ length: 12 }, (_, i) => ({
  id: `P${i + 1}`,
  code: `${pick(['IN', 'OUT', 'MIX'])}${pick(['-A07', '-A08', '-B02', '-C01'])}`,
  name: `${pick(['入库口', '出库口', '混用口', '接驳口'])}${i + 1}`,
  area: pick(['SHIP1', 'SHIP2', 'EMPTY1']),
  aisle: pick(['A01', 'A02', 'A07', '']),
  type: pick(['入库口', '出库口', '混用口', '接驳口']),
  status: '启用',
}))

export interface Pallet { id: string; code: string; type: string; area: string; material: string; batch: string; qty: number; status: string; stay: number }
export const pallets: Pallet[] = Array.from({ length: 40 }, (_, i) => ({
  id: `PL${i + 1}`,
  code: `PT-2611-${String(i + 1).padStart(3, '0')}`,
  type: pick(['木质', '塑料', '金属']),
  area: pick(['SHIP1', 'SHIP2', 'EMPTY1', 'PICK1']),
  material: pick([...materials.map((m) => m.code), '']),
  batch: pick(['B-2026001', 'B-2026015', '无', '']),
  qty: rnd(0, 200),
  status: pick(['可用', '空托盘', '占用', '锁定']),
  stay: rnd(0, 15),
}))

// ---- 库存 ----
export interface Inventory {
  id: string; binCode: string; aisle: string; zone: string; face: string; column: number;
  materialCode: string; materialName: string; spec: string; unit: string; batch: string;
  qty: number; reserved: number; palletCode: string; inDate: string; expiry: string; age: number;
  supplier: string; customer: string; quality: string
}
const batches = Array.from({ length: 20 }, (_, i) => `B26${String(1001 + i)}-${String((i % 4) + 1).padStart(2, '0')}`)
const suppliers = partners.filter((p) => p.type === '供应商').map((p) => p.name)
const customers = partners.filter((p) => p.type === '客户').map((p) => p.name)
export const inventory: Inventory[] = Array.from({ length: 90 }, (_, i) => {
  const m = pick(materials)
  const age = rnd(1, 120)
  const aisle = `A0${(i % 5) + 1}`
  const face = i % 2 ? 'B' : 'A'
  const column = Math.floor(i / 10) + 1
  const binCode = `${aisle}-${face}-${String(column).padStart(2, '0')}`
  return {
    id: `IV${i + 1}`,
    binCode,
    aisle,
    zone: pick(['ZK01', 'ZK02', 'ZK03']),
    face,
    column,
    materialCode: m.code,
    materialName: m.name,
    spec: m.spec,
    unit: m.unit,
    batch: pick(batches),
    qty: rnd(10, 60),
    reserved: pick([0, 0, 0, rnd(1, 20)]),
    palletCode: `PT-${binCode}`,
    inDate: daysAgo(age),
    expiry: m.shelfLife ? daysAfter(m.shelfLife - age) : '',
    age,
    supplier: pick(suppliers),
    customer: pick(customers),
    quality: pick(['合格', '合格', '合格', '待检']),
  }
})

// ---- 收货单 ----
export interface InboundOrder {
  id: string; no: string; source: string; supplier: string; arrival: string;
  status: string; lines: number; pending: number; warehouse: string; remark: string
}
export const inboundOrders: InboundOrder[] = Array.from({ length: 14 }, (_, i) => {
  const lines = rnd(1, 8)
  const pending = rnd(0, lines)
  return {
    id: `IN${i + 1}`,
    no: `RK${daysAgo(rnd(0, 20)).replace(/-/g, '')}${String(i + 1).padStart(3, '0')}`,
    source: pick(['供应商送货', '生产完工入库', '退货入库', '调拨入库']),
    supplier: pick(partners.filter((p) => p.type === '供应商')).name,
    arrival: daysAgo(rnd(0, 20)),
    status: pending === 0 ? '已上架' : pending < lines ? '部分上架' : '待上架',
    lines,
    pending,
    warehouse: pick(['WH01', 'WH02']),
    remark: '',
  }
})

// ---- 出库订单 ----
export interface OutboundOrder {
  id: string; no: string; customer: string; type: string; priority: string;
  date: string; status: string; picked: number; lines: number; remark: string
}
export const outboundOrders: OutboundOrder[] = Array.from({ length: 12 }, (_, i) => {
  const lines = rnd(1, 6)
  return {
    id: `OUT${i + 1}`,
    no: `CK${daysAgo(rnd(0, 15)).replace(/-/g, '')}${String(i + 1).padStart(3, '0')}`,
    customer: pick(partners.filter((p) => p.type === '客户')).name,
    type: pick(['销售出库', '生产领料', '调拨出库']),
    priority: pick(['高', '中', '低']),
    date: daysAgo(rnd(0, 15)),
    status: pick(['待分配', '已分配', '待拣选', '已完成']),
    picked: rnd(0, lines),
    lines,
    remark: '',
  }
})

// ---- 设备与任务 ----
export interface Device { id: string; code: string; name: string; type: string; aisle: string; status: string; load: number; heartbeat: string }
export const devices: Device[] = Array.from({ length: 14 }, (_, i) => ({
  id: `DV${i + 1}`,
  code: `${pick(['STK', 'CV', 'ELV', 'AGV'])}-${String(i + 1).padStart(2, '0')}`,
  name: pick(['堆垛机', '输送线', '提升机', 'AGV']),
  type: pick(['堆垛机', '输送线', '提升机', 'AGV']),
  aisle: pick(['A01', 'A02', 'A03', 'A04']),
  status: pick(['运行', '运行', '待机', '充电中', '异常', '停止']),
  load: rnd(0, 100),
  heartbeat: '刚刚',
}))

export interface WcsTask { id: string; no: string; type: string; device: string; aisle: string; bin: string; status: string; progress: number; created: string }
export const wcsTasks: WcsTask[] = Array.from({ length: 20 }, (_, i) => ({
  id: `T${i + 1}`,
  no: `WCS-${String(2026000 + i).padStart(7, '0')}`,
  type: pick(['上架', '下架', '移库', '倒库', '补给']),
  device: pick(devices).code,
  aisle: pick(['A01', 'A02', 'A03', 'A04']),
  bin: `${pick(['A01', 'A02', 'A03', 'A04'])}-${pick(['A', 'B'])}-${String(rnd(1, 20)).padStart(2, '0')}`,
  status: pick(['排队中', '执行中', '运送中', '已完成', '异常']),
  progress: rnd(0, 100),
  created: daysAgo(0),
}))

// ---- 托盘呼叫 ----
export interface Call { id: string; no: string; type: string; source: string; target: string; material: string; status: string; time: string; responseSec: number }
export const calls: Call[] = Array.from({ length: 10 }, (_, i) => ({
  id: `C${i + 1}`,
  no: `CALL-${String(i + 1).padStart(4, '0')}`,
  type: pick(['空托盘补给', '满托盘运出', '拣选托盘需求', '按物料呼叫']),
  source: pick(['A01-A-01', 'A02-B-05', 'EMPTY1']),
  target: pick(['PICK1', 'SHIP1', 'IN-A07']),
  material: pick(materials).code,
  status: pick(['待响应', 'AGV 已接单', '搬运中', '已完成', '已取消']),
  time: daysAgo(0),
  responseSec: rnd(18, 88),
}))

// ---- 拣选波次 ----
export interface PickTask { id: string; no: string; order: string; bin: string; batch: string; material: string; qty: number; picked: number; status: string }
export const pickTasks: PickTask[] = Array.from({ length: 18 }, (_, i) => {
  const qty = rnd(5, 100)
  return {
    id: `PK${i + 1}`,
    no: `WAVE-2026${String(i + 1).padStart(3, '0')}`,
    order: pick(outboundOrders).no,
    bin: `${pick(['A01', 'A02', 'A03'])}${pick(['A', 'B'])}${String(rnd(1, 20)).padStart(2, '0')}`,
    batch: pick(batches),
    material: pick(materials).name,
    qty,
    picked: pick([0, 0, qty, qty]),
    status: pick(['待拣选', '拣选中', '已拣选']),
  }
})

// ---- 用户与角色 ----
export interface Account { id: string; username: string; realName: string; role: string; phone: string; email: string; warehouse: string; enabled: boolean }
export const accounts: Account[] = [
  { id: 'U1', username: 'admin', realName: '系统管理员', role: '管理员', phone: '13800000001', email: 'admin@wms.com', warehouse: '', enabled: true },
  { id: 'U2', username: 'wangqiang', realName: '王强', role: '入库操作员', phone: '13800000002', email: 'wang@wms.com', warehouse: 'WH01', enabled: true },
  { id: 'U3', username: 'lina', realName: '李娜', role: '拣选员', phone: '13800000003', email: 'li@wms.com', warehouse: 'WH01', enabled: true },
  { id: 'U4', username: 'zhangwei', realName: '张伟', role: 'WCS 监控员', phone: '13800000004', email: 'zhang@wms.com', warehouse: '', enabled: true },
  { id: 'U5', username: 'chenjing', realName: '陈静', role: '数据管理员', phone: '13800000005', email: 'chen@wms.com', warehouse: 'WH02', enabled: false },
]

export interface Role { id: string; code: string; name: string; perms: string[]; note: string }
export const roles: Role[] = [
  { id: 'R1', code: 'R01', name: '管理员', perms: ['*'], note: '全部权限' },
  { id: 'R2', code: 'R02', name: '入库操作员', perms: ['wms:view', 'wms:inbound', 'wms:base'], note: '收货上架与基础数据' },
  { id: 'R3', code: 'R03', name: '拣选员', perms: ['wms:view', 'wms:pick'], note: '波次拣选' },
  { id: 'R4', code: 'R04', name: 'WCS 监控员', perms: ['wms:view', 'wcs:monitor'], note: '设备与任务监控' },
  { id: 'R5', code: 'R05', name: '数据管理员', perms: ['wms:view', 'wms:data', 'wms:log'], note: '数据管理与日志' },
]

// ---- 操作日志 ----
export interface LogEntry { id: string; time: string; level: string; module: string; user: string; action: string; detail: string }
const logActions = [
  ['收货单上架', '入库与库存'], ['库存查询导出', '我的工作台'], ['新增物料', '基础数据'],
  ['创建出库订单', '库内作业'], ['波次拣选确认', '库内作业'], ['托盘呼叫下发', '库内作业'],
  ['策略配置修改', 'WCS 与配置'], ['用户登录', '权限管理'], ['库位图保存', '库内作业'],
  ['回收站恢复', '系统查看'],
]
export const logs: LogEntry[] = Array.from({ length: 60 }, (_, i) => {
  const [action, module] = pick(logActions)
  return {
    id: `L${i + 1}`,
    time: `${daysAgo(Math.floor(i / 8))} ${String(rnd(8, 20)).padStart(2, '0')}:${String(rnd(0, 59)).padStart(2, '0')}:${String(rnd(0, 59)).padStart(2, '0')}`,
    level: pick(['信息', '信息', '信息', '成功', '警告', '错误']),
    module,
    user: pick(accounts).realName,
    action,
    detail: `${action} - 操作成功`,
  }
})

// ---- 回收站 ----
export interface RecycleItem { id: string; type: string; name: string; deletedAt: string; operator: string; reason: string }
export const recycleItems: RecycleItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: `RC${i + 1}`,
  type: pick(['收货单', '出库订单', '物料', '库区']),
  name: pick(['RK20261101', 'CK20261105', 'SKU-1008', 'ZK04', 'A07 专巷']),
  deletedAt: daysAgo(rnd(1, 30)),
  operator: pick(accounts).realName,
  reason: pick(['录入错误', '业务取消', '重复单据', '']),
}))

// ---- 数据表结构（设计开发） ----
export interface TableSchema { name: string; cn: string; comment: string; fields: { name: string; type: string; nullable: boolean; comment: string }[] }
const commonFields = (prefix: string): TableSchema['fields'] => [
  { name: 'id', type: 'bigint', nullable: false, comment: '主键' },
  { name: `${prefix}_code`, type: 'varchar(64)', nullable: false, comment: '编码' },
  { name: 'name', type: 'varchar(128)', nullable: false, comment: '名称' },
  { name: 'status', type: 'tinyint', nullable: false, comment: '状态' },
  { name: 'created_at', type: 'datetime', nullable: false, comment: '创建时间' },
  { name: 'updated_at', type: 'datetime', nullable: true, comment: '更新时间' },
]
export const tableSchemas: TableSchema[] = [
  { name: 'inventory', cn: '库存槽位', comment: '库存主表，记录各货位实时库存', fields: [...commonFields('inv'), { name: 'qty', type: 'decimal(12,2)', nullable: false, comment: '数量' }, { name: 'batch', type: 'varchar(64)', nullable: true, comment: '批次' }] },
  { name: 'inbound_order', cn: '收货单主表', comment: '收货单 ASN', fields: [...commonFields('in'), { name: 'supplier', type: 'varchar(128)', nullable: true, comment: '供应商' }, { name: 'arrival_date', type: 'date', nullable: false, comment: '到货日期' }] },
  { name: 'outbound_order', cn: '出库订单主表', comment: '出库订单', fields: [...commonFields('out'), { name: 'customer', type: 'varchar(128)', nullable: true, comment: '客户' }, { name: 'priority', type: 'tinyint', nullable: false, comment: '优先级' }] },
  { name: 'material', cn: '物料主数据', comment: '物料档案', fields: [...commonFields('mat'), { name: 'spec', type: 'varchar(256)', nullable: true, comment: '规格' }, { name: 'unit', type: 'varchar(16)', nullable: false, comment: '单位' }] },
  { name: 'aisle', cn: '巷道表', comment: '巷道档案', fields: [...commonFields('ais'), { name: 'zone_code', type: 'varchar(64)', nullable: false, comment: '所属库区' }, { name: 'stacker', type: 'varchar(32)', nullable: true, comment: '堆垛机' }] },
  { name: 'bin', cn: '货位表', comment: '货位档案', fields: [...commonFields('bin'), { name: 'aisle_code', type: 'varchar(64)', nullable: false, comment: '所属巷道' }, { name: 'face', type: 'varchar(4)', nullable: false, comment: '库面' }, { name: 'column_no', type: 'int', nullable: false, comment: '列号' }] },
  { name: 'pallet', cn: '托盘台账', comment: '托盘档案', fields: [...commonFields('pal'), { name: 'area_code', type: 'varchar(64)', nullable: true, comment: '所在区域' }, { name: 'qty', type: 'decimal(12,2)', nullable: true, comment: '数量' }] },
  { name: 'wcs_task', cn: 'WCS 任务', comment: '设备调度任务', fields: [...commonFields('tsk'), { name: 'device_code', type: 'varchar(32)', nullable: false, comment: '设备' }, { name: 'progress', type: 'int', nullable: false, comment: '进度' }] },
  { name: 'account', cn: '登录账号表', comment: '系统账号', fields: [...commonFields('acc'), { name: 'password_hash', type: 'varchar(128)', nullable: false, comment: '密码哈希' }, { name: 'role_code', type: 'varchar(32)', nullable: false, comment: '角色' }] },
  { name: 'operation_log', cn: '操作日志', comment: '系统日志', fields: [{ name: 'id', type: 'bigint', nullable: false, comment: '主键' }, { name: 'level', type: 'varchar(16)', nullable: false, comment: '级别' }, { name: 'module', type: 'varchar(64)', nullable: false, comment: '模块' }, { name: 'detail', type: 'text', nullable: true, comment: '详情' }, { name: 'created_at', type: 'datetime', nullable: false, comment: '时间' }] },
]

// ---- 策略配置 ----
export interface Rule { id: string; name: string; code: string; enabled: boolean; desc: string }
export const rules: Rule[] = [
  { id: 'R1', name: '先进先出 FIFO', code: 'fifo', enabled: true, desc: '批次按入库日期升序，库龄优先级可视化' },
  { id: 'R2', name: '近效期先出 FEFO', code: 'fefe', enabled: true, desc: '有保质期物料按效期优先，规则可开关' },
  { id: 'R3', name: '左进右出单向流', code: 'oneway', enabled: true, desc: '入库口在左端、出库口在右端，堆垛机单向作业' },
  { id: 'R4', name: '单物料专巷', code: 'singleMat', enabled: false, desc: '一个物料固定一个巷道，绑定关系存于 aisle 表' },
  { id: 'R5', name: '批次锁定与效期预警', code: 'batchLock', enabled: true, desc: '锁定批次不参与分配，临期批次红色标记' },
  { id: 'R6', name: '混批策略', code: 'mixBatch', enabled: false, desc: '允许同一货位存放多个批次' },
  { id: 'R7', name: '就近分配', code: 'nearest', enabled: true, desc: '上架时优先推荐就近空货位' },
  { id: 'R8', name: '同面归并', code: 'merge', enabled: true, desc: '移库时同物料归并到主库面' },
]

// ---- 每日统计（驾驶舱） ----
export const dailyStats = Array.from({ length: 14 }, (_, i) => ({
  date: daysAgo(13 - i).slice(5),
  inbound: rnd(20, 120),
  outbound: rnd(15, 100),
  calls: rnd(5, 40),
}))

export const abcDistribution = [
  { name: 'A 类', value: 45, count: 38 },
  { name: 'B 类', value: 35, count: 52 },
  { name: 'C 类', value: 20, count: 60 },
]

export const zoneUsage = zones.map((z) => ({
  zone: z.code,
  使用率: rnd(45, 95),
  容量: rnd(500, 2000),
}))

// 各巷道库位利用率（驾驶舱 · 横向条形图）
export const aisleUsage = aisles.slice(0, 6).map((a) => ({
  code: a.code,
  usage: rnd(50, 82),
}))
