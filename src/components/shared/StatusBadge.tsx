import { Badge } from '@/components/ui/badge'

const map: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'outline'> = {
  // 成功类
  '启用': 'success', '合格': 'success', '已完成': 'success', '已上架': 'success',
  '在库': 'success', '可用': 'success', '正常': 'success', '运行': 'success',
  '成功': 'success', '信息': 'info', '已拣选': 'success', '已归并': 'success',
  '已接单': 'success', 'AGV 已接单': 'success', '运行成功': 'success', '恢复': 'success',
  // 警告类
  '待上架': 'warning', '待分配': 'warning', '待拣选': 'warning', '待响应': 'warning',
  '待检': 'warning', '待收货': 'warning', '待入库': 'warning', '待发货': 'warning',
  '拣选中': 'info', '返库中': 'info', '执行中': 'info', '运送中': 'info', '搬运中': 'info',
  '部分上架': 'warning', '待机': 'secondary', '充电中': 'info', '警告': 'warning',
  '停用': 'secondary', '锁定': 'warning', '空货位': 'outline', '排队中': 'warning',
  // 危险类
  '异常': 'destructive', '故障': 'destructive', '错误': 'destructive', '停止': 'destructive',
  '不可用': 'destructive', '已取消': 'secondary', '缺量': 'destructive',
  '高': 'destructive', '中': 'warning', '低': 'secondary',
  'A': 'destructive', 'B': 'warning', 'C': 'secondary',
}

export function StatusBadge({ value }: { value: string }) {
  const variant = map[value] ?? 'secondary'
  return <Badge variant={variant}>{value || '—'}</Badge>
}
