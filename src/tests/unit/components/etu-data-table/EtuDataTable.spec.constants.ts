import type { TableColumn } from '@/components/global/etu-data-table/types'

export type EtuDataTableRow = { id: number; title: string; status: string }

export const columns: TableColumn<EtuDataTableRow>[] = [
  { key: 'title', header: 'Название', sortable: true },
  { key: 'status', header: 'Статус' },
]
