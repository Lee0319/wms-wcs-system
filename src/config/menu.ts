import {
  LayoutDashboard, Search, Boxes, ArrowLeftRight, PackagePlus, ClipboardList,
  Boxes as BoxesIcon, Warehouse, Route, GitBranch, Truck, RadioTower, SlidersHorizontal,
  BookOpenText, ShieldCheck, Database, MapPin, Grid3X3, Layers3, DoorOpen,
  PackageOpen as Pallet, FolderOpen, ScrollText, Trash2, Wrench, PanelTop, Table2,
  type IconType,
} from '@/lib/icons'

export interface MenuItem {
  id: string
  label: string
  perm: string
  icon?: IconType
  soon?: boolean
}

export interface MenuGroup {
  label: string
  items: MenuItem[]
}

/** 完整菜单树：8 分组 32 功能，权限码来自原系统 */
export const MENU_GROUPS: MenuGroup[] = [
  {
    label: '我的工作台',
    items: [
      { id: 'p0', label: '综合驾驶舱', perm: 'wms:view', icon: LayoutDashboard },
      { id: 'p20', label: '库存查询', perm: 'wms:view', icon: Search },
      { id: 'p21', label: '组盘管理', perm: 'wms:inbound', icon: Boxes },
      { id: 'p22', label: '出入库记录', perm: 'wms:view', icon: ArrowLeftRight },
    ],
  },
  {
    label: '入库与库存',
    items: [
      { id: 'p1', label: '收货与上架', perm: 'wms:inbound', icon: PackagePlus },
      { id: 'p2', label: '库存与批次台账', perm: 'wms:view', icon: ClipboardList },
      { id: 'p30', label: '料箱库上架', perm: 'wms:inbound', icon: BoxesIcon },
    ],
  },
  {
    label: '库内作业',
    items: [
      { id: 'p3', label: '巷道监控（左进右出）', perm: 'wcs:monitor', icon: Warehouse },
      { id: 'p4', label: '出库订单与分配', perm: 'wms:outbound', icon: Route },
      { id: 'p5', label: '波次拣选', perm: 'wms:pick', icon: GitBranch },
      { id: 'p6', label: '托盘呼叫', perm: 'wms:outbound', icon: Truck },
      { id: 'p7', label: '托盘区域管理', perm: 'wms:outbound', icon: RadioTower },
      { id: 'p11', label: '托盘移库（同面归并）', perm: 'wms:outbound', icon: ArrowLeftRight },
      { id: 'p31', label: '库位图布局器', perm: 'wms:base', icon: MapPin },
    ],
  },
  {
    label: 'WCS 与配置',
    items: [
      { id: 'p8', label: '设备与任务监控', perm: 'wcs:monitor', icon: RadioTower },
      { id: 'p9', label: '规则与策略配置', perm: 'wms:base', icon: SlidersHorizontal },
      { id: 'p12', label: '策略说明', perm: 'wms:view', icon: BookOpenText },
    ],
  },
  {
    label: '权限管理',
    items: [
      { id: 'p14', label: '用户管理', perm: 'wms:admin', icon: ShieldCheck },
    ],
  },
  {
    label: '基础数据',
    items: [
      { id: 'p15', label: '物料管理', perm: 'wms:base', icon: Boxes },
      { id: 'p16', label: '业务伙伴', perm: 'wms:base', icon: Truck },
      { id: 'p28', label: '库区管理', perm: 'wms:base', icon: Warehouse },
      { id: 'p24', label: '巷道管理', perm: 'wms:base', icon: Route },
      { id: 'p17', label: '货位管理', perm: 'wms:base', icon: Grid3X3 },
      { id: 'p23', label: '库位联动组', perm: 'wms:base', icon: Layers3 },
      { id: 'p29', label: '托盘区域设置', perm: 'wms:base', icon: RadioTower },
      { id: 'p18', label: '出口配置', perm: 'wms:base', icon: DoorOpen },
      { id: 'p19', label: '托盘管理', perm: 'wms:base', icon: Pallet },
    ],
  },
  {
    label: '系统查看',
    items: [
      { id: 'p13', label: '数据管理', perm: 'wms:data', icon: Database },
      { id: 'p25', label: '日志查看', perm: 'wms:log', icon: ScrollText },
      { id: 'p26', label: '回收站', perm: 'wms:recycle', icon: Trash2 },
    ],
  },
  {
    label: '设计开发',
    items: [
      { id: 'p27', label: '数据库表设计', perm: 'wms:admin', icon: Wrench },
      { id: 'd2', label: '窗体界面设计', perm: 'wms:admin', icon: PanelTop },
      { id: 'd5', label: '数据字典', perm: 'wms:admin', icon: Table2, soon: true },
    ],
  },
]

export const ALL_PERMS = [
  'wms:view', 'wms:inbound', 'wms:outbound', 'wcs:monitor', 'wms:base',
  'wms:admin', 'wms:data', 'wms:log', 'wms:recycle', 'wms:pick',
]

export const PERM_LABELS: Record<string, string> = {
  'wms:view': '查看',
  'wms:inbound': '入库上架',
  'wms:outbound': '出库移库',
  'wcs:monitor': 'WCS 监控',
  'wms:base': '基础数据',
  'wms:admin': '管理员',
  'wms:data': '数据管理',
  'wms:log': '日志查看',
  'wms:recycle': '回收站',
  'wms:pick': '拣选作业',
}

export function findMenuItem(id: string): MenuItem | undefined {
  for (const g of MENU_GROUPS) {
    const found = g.items.find((i) => i.id === id)
    if (found) return found
  }
}

export function getGroupLabel(id: string): string {
  for (const g of MENU_GROUPS) {
    if (g.items.some((i) => i.id === id)) return g.label
  }
  return ''
}
