import { useCallback, useEffect, useMemo, useState, ReactNode } from 'react'
import { Search, Plus, RefreshCw, Pencil, Trash2, ChevronLeft, ChevronRight, Download } from '@/lib/icons'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { listTable, createRow, updateRow, deleteRow } from '@/api/adapter'
import * as XLSX from 'xlsx'

export interface Column<T = any> {
  key: string
  title: string
  render?: (row: T) => ReactNode
  width?: string
}

export interface FormField {
  key: string
  label: string
  type?: 'text' | 'number' | 'textarea'
  placeholder?: string
  required?: boolean
  options?: string[]
}

interface Props {
  table: string
  columns: Column[]
  searchFields: string[]
  formFields?: FormField[]
  title?: string
  pageSize?: number
  extraActions?: (row: any, refresh: () => void) => ReactNode
  toolbarExtra?: ReactNode
  canEdit?: boolean
  canDelete?: boolean
  canCreate?: boolean
  exportName?: string
}

export function CrudTable({
  table, columns, searchFields, formFields, pageSize = 8,
  extraActions, toolbarExtra, canEdit = true, canDelete = true, canCreate = true,
  exportName,
}: Props) {
  const [rows, setRows] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listTable(table, { page, pageSize, keyword, fields: searchFields })
      setRows(res.list)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }, [table, page, pageSize, keyword, searchFields])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [keyword])

  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  const fields = formFields || []
  const openCreate = () => {
    setEditing(null)
    const init: Record<string, any> = {}
    fields.forEach((f) => { init[f.key] = f.type === 'number' ? 0 : '' })
    setForm(init)
    setDialogOpen(true)
  }
  const openEdit = (row: any) => {
    setEditing(row)
    const init: Record<string, any> = {}
    fields.forEach((f) => { init[f.key] = row[f.key] ?? '' })
    setForm(init)
    setDialogOpen(true)
  }
  const save = async () => {
    if (fields.some((f) => f.required && !form[f.key])) {
      toast.error('请填写必填项')
      return
    }
    if (editing) {
      await updateRow(table, editing.id, form)
      toast.success('保存成功')
    } else {
      await createRow(table, form)
      toast.success('新增成功')
    }
    setDialogOpen(false)
    load()
  }
  const remove = async (row: any) => {
    if (!confirm(`确认删除「${row.name || row.code || row.no || row.id}」？`)) return
    await deleteRow(table, row.id)
    toast.success('删除成功')
    load()
  }
  const exportCsv = () => {
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, `${exportName || table}_${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast.success(`已导出 ${rows.length} 条`)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索…"
                className="pl-8"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={load} title="刷新">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {toolbarExtra}
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4" /> 导出
            </Button>
            {canCreate && <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> 新增</Button>}
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                {columns.map((c) => <TableHead key={c.key} style={c.width ? { width: c.width } : undefined}>{c.title}</TableHead>)}
                {(canEdit || canDelete || extraActions) && <TableHead className="text-right w-[140px]">操作</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow><TableCell colSpan={columns.length + 1} className="h-32 text-center text-muted-foreground">
                  {loading ? '加载中…' : '暂无数据'}
                </TableCell></TableRow>
              ) : rows.map((row, idx) => (
                <TableRow key={row.id || idx}>
                  {columns.map((c) => (
                    <TableCell key={c.key}>
                      {c.render ? c.render(row) : (row[c.key] ?? '—')}
                    </TableCell>
                  ))}
                  {(canEdit || canDelete || extraActions) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {extraActions?.(row, load)}
                        {canEdit && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)} title="编辑"><Pencil className="h-3.5 w-3.5" /></Button>}
                        {canDelete && <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(row)} title="删除"><Trash2 className="h-3.5 w-3.5" /></Button>}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>共 {total} 条 · 第 {page} / {pageCount} 页</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? '编辑' : '新增'}</DialogTitle>
            <DialogDescription>填写表单信息后点击保存。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {fields.map((f) => (
              <div key={f.key} className="grid gap-2">
                <Label>{f.label}{f.required && <span className="text-destructive ml-0.5">*</span>}</Label>
                {f.type === 'textarea' ? (
                  <Textarea
                    value={form[f.key] ?? ''}
                    placeholder={f.placeholder}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                ) : f.options ? (
                  <Select
                    value={form[f.key] || undefined}
                    onValueChange={(v) => setForm({ ...form, [f.key]: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                    <SelectContent>
                      {f.options.filter((o) => o !== '').map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={f.type === 'number' ? 'number' : 'text'}
                    value={form[f.key] ?? ''}
                    placeholder={f.placeholder}
                    onChange={(e) => setForm({ ...form, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={save}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
