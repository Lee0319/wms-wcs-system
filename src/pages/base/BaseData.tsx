import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CrudTable, type Column, type FormField } from '@/components/shared/CrudTable'
import { getGroupLabel, findMenuItem } from '@/config/menu'

interface Config {
  columns: Column[]
  fields: FormField[]
  search: string[]
  note?: string
}

const str = (key: string, title: string, width?: string): Column => ({ key, title, width })
const mono = (key: string, title: string): Column => ({ key, title, render: (r) => <span className="font-mono text-sm">{r[key] ?? '—'}</span> })
const status = (key = 'status'): Column => ({ key, title: '状态', render: (r) => <StatusBadge value={r[key]} /> })

export const BASE_CONFIGS: Record<string, { title: string; desc: string; config: Config }> = {
  p15: {
    title: '物料管理', desc: '物料主数据 / 货位绑定物料依据',
    config: {
      note: '物料库区（必选）；单个体积默认 0 表示不限制库容；不需要批次管理时收货统一批次「无」。',
      search: ['code', 'name', 'spec'],
      columns: [
        mono('code', '物料编码'), str('name', '物料名称'), str('spec', '规格'), str('unit', '单位'),
        { key: 'volume', title: '单个体积', render: (r) => r.volume },
        mono('zone', '物料库区'),
        { key: 'abc', title: 'ABC', render: (r) => <StatusBadge value={r.abc} /> },
        str('batchMgmt', '批次管理'), { key: 'shelfLife', title: '效期(天)', render: (r) => r.shelfLife || '—' },
        { key: 'safetyStock', title: '安全库存', render: (r) => <span className="tabular-nums">{r.safetyStock}</span> },
        status(),
      ],
      fields: [
        { key: 'code', label: '物料编码', required: true, placeholder: '如 SKU-1001' },
        { key: 'name', label: '物料名称', required: true, placeholder: '如 冷轧钢卷' },
        { key: 'spec', label: '规格', placeholder: '如 SPCC 1.0×1250' },
        { key: 'unit', label: '单位', options: ['件', '卷', '张', '根', '台', '千克'] },
        { key: 'volume', label: '单个体积', type: 'number' },
        { key: 'zone', label: '物料库区', required: true, options: ['ZK01', 'ZK02', 'ZK03', 'ZK04'] },
        { key: 'abc', label: 'ABC 分类', options: ['A', 'B', 'C'] },
        { key: 'batchMgmt', label: '批次管理', options: ['是', '否'] },
        { key: 'shelfLife', label: '效期(天)', type: 'number' },
        { key: 'safetyStock', label: '安全库存', type: 'number' },
        { key: 'status', label: '状态', options: ['启用', '停用'] },
      ],
    },
  },
  p16: {
    title: '业务伙伴', desc: '供应商 / 客户 / 承运商档案',
    config: {
      note: '业务伙伴用于收货单供应商、出库单客户与承运商的下拉来源；停用后不再出现在新单据候选列表。',
      search: ['code', 'name', 'contact'],
      columns: [
        mono('code', '伙伴编码'), str('name', '伙伴名称'),
        { key: 'type', title: '类型', render: (r) => <StatusBadge value={r.type} /> },
        str('contact', '联系人'), str('phone', '电话'), str('address', '地址'), str('remark', '备注'),
      ],
      fields: [
        { key: 'code', label: '伙伴编码', required: true, placeholder: '如 BP007' },
        { key: 'name', label: '伙伴名称', required: true },
        { key: 'type', label: '伙伴类型', options: ['供应商', '客户', '承运商'] },
        { key: 'contact', label: '联系人' }, { key: 'phone', label: '电话' },
        { key: 'address', label: '地址' }, { key: 'remark', label: '备注', type: 'textarea' },
      ],
    },
  },
  p28: {
    title: '库区管理', desc: '仓库分区 / 巷道归属分组',
    config: {
      note: '库区是巷道的上级分组；库区下还有巷道时不能删除，需先删除或迁移巷道。',
      search: ['code', 'name'],
      columns: [mono('code', '库区编码'), str('name', '库区名称'), mono('warehouse', '仓库编码'),
        { key: 'aisleCount', title: '巷道数', render: (r) => <span className="tabular-nums">{r.aisleCount}</span> }, str('strategy', '策略选择')],
      fields: [
        { key: 'code', label: '库区编码', required: true, placeholder: '如 ZK01' },
        { key: 'name', label: '库区名称', required: true, placeholder: '如 型材区' },
        { key: 'warehouse', label: '仓库编码', placeholder: '如 WH01' },
        { key: 'aisleCount', label: '巷道数', type: 'number' },
        { key: 'strategy', label: '策略选择', options: ['标准策略', '单物料专巷'] },
      ],
    },
  },
  p24: {
    title: '巷道管理', desc: '巷道编码 / 库区 / 绑定物料 / 自动生成货位',
    config: {
      note: '绑定物料（快捷）；可不选作业方向；堆垛机编号可留空（AGV / 无堆垛机巷道）。',
      search: ['code', 'name', 'material'],
      columns: [mono('code', '巷道编码'), str('name', '巷道名称'), mono('zone', '所属库区'),
        mono('material', '绑定物料'), str('direction', '作业方向'), str('stacker', '堆垛机'),
        { key: 'binCount', title: '货位数', render: (r) => <span className="tabular-nums">{r.binCount}</span> }],
      fields: [
        { key: 'code', label: '巷道编码', required: true, placeholder: '如 A07' },
        { key: 'name', label: '巷道名称' },
        { key: 'zone', label: '所属库区', options: ['ZK01', 'ZK02', 'ZK03', 'ZK04'] },
        { key: 'material', label: '绑定物料编码' },
        { key: 'direction', label: '作业方向', options: ['不指定', '左进右出', '右进左出'] },
        { key: 'stacker', label: '堆垛机编号' },
        { key: 'binCount', label: '货位数', type: 'number' },
      ],
    },
  },
  p17: {
    title: '货位管理', desc: '巷道 / 库面 / 列 / 体积容量',
    config: {
      note: '货位绑定物料留空表示混放；体积容量 0 = 不限制。',
      search: ['code', 'aisle', 'material'],
      columns: [mono('code', '货位编码'), mono('aisle', '巷道'), mono('zone', '库区'),
        { key: 'face', title: '库面', render: (r) => <StatusBadge value={r.face} /> },
        { key: 'column', title: '列号', render: (r) => <span className="tabular-nums">{r.column}</span> },
        mono('material', '货位绑定物料'),
        { key: 'volume', title: '体积容量', render: (r) => r.volume },
        status()],
      fields: [
        { key: 'code', label: '货位编码', required: true },
        { key: 'aisle', label: '巷道' }, { key: 'zone', label: '库区', options: ['ZK01', 'ZK02', 'ZK03', 'ZK04'] },
        { key: 'face', label: '库面', options: ['A', 'B'] },
        { key: 'column', label: '列号', type: 'number' },
        { key: 'material', label: '绑定物料' },
        { key: 'volume', label: '体积容量', type: 'number' },
        { key: 'status', label: '状态', options: ['空货位', '在库', '锁定', '停用', '拣选中', '返库中'] },
      ],
    },
  },
  p23: {
    title: '库位联动组', desc: '同一列连续货位绑定为一个存取单元',
    config: {
      note: '先小后大（升序）/ 先大后小（降序）决定存入方向。',
      search: ['code', 'name', 'material'],
      columns: [mono('code', '组编码'), str('name', '组名称'), mono('aisle', '所在巷道'),
        { key: 'startCol', title: '起始列', render: (r) => r.startCol },
        { key: 'endCol', title: '结束列', render: (r) => r.endCol },
        str('direction', '存入顺序'), mono('material', '绑定物料'), str('lockedBatch', '锁定批次')],
      fields: [
        { key: 'code', label: '组编码', required: true, placeholder: '如 G-A04-A1' },
        { key: 'name', label: '组名称' },
        { key: 'aisle', label: '巷道', options: ['A01', 'A02', 'A03', 'A04'] },
        { key: 'startCol', label: '起始列号', type: 'number' },
        { key: 'endCol', label: '结束列号', type: 'number' },
        { key: 'direction', label: '存入方向', options: ['先小后大', '先大后小'] },
        { key: 'material', label: '绑定物料' }, { key: 'lockedBatch', label: '锁定批次' },
      ],
    },
  },
  p29: {
    title: '托盘区域设置', desc: '区域编码 / 容量 / 预警水位',
    config: {
      note: '达到预警百分比标黄预警；托盘所在区域与水位联动。',
      search: ['code', 'name'],
      columns: [mono('code', '区域编码'), str('name', '区域名称'),
        { key: 'capacity', title: '容量', render: (r) => <span className="tabular-nums">{r.capacity}</span> },
        { key: 'warning', title: '预警水位(%)', render: (r) => `${r.warning}%` },
        { key: 'pallets', title: '现有托盘', render: (r) => <span className="tabular-nums">{r.pallets}</span> }],
      fields: [
        { key: 'code', label: '区域编码', required: true, placeholder: '如 SHIP2' },
        { key: 'name', label: '区域名称' },
        { key: 'capacity', label: '容量（可放托盘数）', type: 'number' },
        { key: 'warning', label: '预警水位(%)', type: 'number' },
        { key: 'pallets', label: '现有托盘', type: 'number' },
      ],
    },
  },
  p18: {
    title: '出口配置', desc: '入库口 / 出库口 / 混用口 / 接驳口',
    config: {
      note: '作业口与货位必须同仓库。',
      search: ['code', 'name'],
      columns: [mono('code', '出入口编码'), str('name', '名称'), mono('area', '所属托盘区域'),
        mono('aisle', '绑定巷道'),
        { key: 'type', title: '类型', render: (r) => <StatusBadge value={r.type} /> }, status()],
      fields: [
        { key: 'code', label: '出入口编码', required: true, placeholder: '如 IN-A07' },
        { key: 'name', label: '名称' },
        { key: 'area', label: '所属托盘区域', options: ['SHIP1', 'SHIP2', 'EMPTY1', 'PICK1'] },
        { key: 'aisle', label: '绑定巷道', options: ['A01', 'A02', 'A07', ''] },
        { key: 'type', label: '类型', options: ['入库口', '出库口', '混用口', '接驳口'] },
        { key: 'status', label: '状态', options: ['启用', '停用'] },
      ],
    },
  },
  p19: {
    title: '托盘管理', desc: '托盘类型 / 区域 / 状态',
    config: {
      note: '新增时请确认目标区域未超过容量上限；空托盘可留空物料。',
      search: ['code', 'material', 'area'],
      columns: [mono('code', '托盘号'), str('type', '托盘类型'), mono('area', '所在区域'),
        mono('material', '物料'), mono('batch', '批次'),
        { key: 'qty', title: '数量', render: (r) => <span className="tabular-nums">{r.qty}</span> }, status()],
      fields: [
        { key: 'code', label: '托盘号', required: true, placeholder: '如 PT-2611-015' },
        { key: 'type', label: '托盘类型', options: ['木质', '塑料', '金属'] },
        { key: 'area', label: '所在区域', options: ['SHIP1', 'SHIP2', 'EMPTY1', 'PICK1'] },
        { key: 'material', label: '物料' }, { key: 'batch', label: '批次' },
        { key: 'qty', label: '数量', type: 'number' },
        { key: 'status', label: '状态', options: ['可用', '空托盘', '占用', '锁定'] },
      ],
    },
  },
}

// table 名映射
const TABLE_MAP: Record<string, string> = {
  p15: 'materials', p16: 'partners', p28: 'zones', p24: 'aisles', p17: 'bins',
  p23: 'binGroups', p29: 'trayAreas', p18: 'ports', p19: 'pallets',
}

export function BaseDataPage({ id }: { id: string }) {
  const entry = BASE_CONFIGS[id]
  if (!entry) return null
  const item = findMenuItem(id)
  return (
    <div className="space-y-4">
      <PageHeader title={entry.title} description={entry.desc} group={getGroupLabel(id)} perm={item?.perm} />
      {entry.config.note && (
        <div className="rounded-lg border bg-info/10 px-4 py-2.5 text-sm text-info">
          {entry.config.note}
        </div>
      )}
      <CrudTable
        table={TABLE_MAP[id]}
        columns={entry.config.columns}
        searchFields={entry.config.search}
        formFields={entry.config.fields}
        exportName={entry.title}
      />
    </div>
  )
}
