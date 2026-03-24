/**
 * Интерфейс представляет SideBarItem
 * @interface
 */
export interface SideBarItem {
  title: string;
  name: string;
  path: string;
  srcIcon?: string;
  /** Material Design Icon (например 'mdi-file-document-outline') */
  mdiIcon?: string;
  children?: SideBarItem[];
  /** Если true, элемент будет отображен как разделитель */
  divider?: boolean;
}
