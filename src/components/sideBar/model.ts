/**
 * Интерфейс представляет SideBarItem
 * @interface
 */
export interface SideBarItem {
  title: string;
  name: string;
  path: string;
  srcIcon?: string;
  mdiIcon?: string;
  children?: SideBarItem[];
  divider?: boolean;
}
