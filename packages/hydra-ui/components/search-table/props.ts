type ExpressionType<T = null> = T extends null ? `{{${string}}}` : (T | `{{${string}}}`);

export interface SearchProTableProps {
  filterProps?: Record<string, any>
  filters: {
    type: string
    label: string
    prop: string
    props?: Record<string, any>
    default?: any
    field?: boolean
  }[]
  filterButtons?: {
    text: string
    click: string
  }[]
  /** 中间的按钮 */
  buttons?: {
    text: string
    click: string
    style?: string
  }[]
  /** 获取表格数据的方法，参数有两个，分页信息和查询表单的值，返回值必须为Promise，包含data和total */
  fetchTable: ExpressionType<
    (page: { pageNo: number; pageSize: number }, searchParams: any) => Promise<{ data: any; total: number }>
  >
  columns: (
    | {
        label: string
        prop: string
        format?: ExpressionType
        config?: Record<string, any>
      }
    | {
        label: string
        buttons: {
          text: string
          click: string
          disabled?: string
          confirm?: string
          link?: string
          visible?: any
        }[]
      }
  )[]
}
