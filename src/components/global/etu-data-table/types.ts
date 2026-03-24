/**
 * Колонка для {@link EtuDataTable}: заголовок, классы ячеек, сортировка, форматтер.
 */
export type TableColumn<R = Record<string, unknown>> = {
  key: string;
  header: string;
  headerClass?: string | string[];
  cellClass?: string | string[];
  cellStyle?: Record<string, string>;
  width?: string;
  skeletonWidth?: string;
  title?: string;
  ariaLabel?: string;
  sortable?: boolean;
  formatter?: (value: unknown, row: R) => string;
};

/** Обратная совместимость с прежним именем */
export type EtuDataTableColumn = TableColumn;
