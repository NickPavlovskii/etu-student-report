/**
 * Настройки видов контроля для дисциплин.
 * Виды контроля загружаются из API (controls), настройки — в localStorage.
 */
import type { ControlTypeItem } from '../types';

const STORAGE_KEY = 'discipline_control_types';

export type DisciplineControlTypesConfig = Record<string, ControlTypeItem[]>;

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\wа-яёa-z0-9_]/gi, '')
    .slice(0, 32) || `ct_${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage(): DisciplineControlTypesConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DisciplineControlTypesConfig;
      return parsed;
    }
  } catch {
    // ignore
  }
  return {};
}

function saveToStorage(config: DisciplineControlTypesConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

/** Объединяет виды контроля из API с сохранёнными настройками */
export function mergeControlTypesWithSettings(
  disciplineId: string,
  controlTitlesFromApi: string[],
  defaultTemplateId: string | null
): ControlTypeItem[] {
  const config = loadFromStorage();
  const stored = (config[disciplineId] ?? []) as ControlTypeItem[];
  const storedByTitle = new Map(stored.map((ct) => [ct.title.toLowerCase(), ct]));

  return controlTitlesFromApi.map((title) => {
    const key = title.toLowerCase();
    const existing = storedByTitle.get(key);
    if (existing) {
      return {
        ...existing,
        title,
        showInTable: existing.active,
      };
    }
    return {
      id: slugFromTitle(title),
      title,
      description: '',
      active: true,
      showInTable: true,
      templateId: defaultTemplateId,
      displayedTopics: undefined,
    };
  });
}

/** Сохраняет настройки видов контроля для дисциплины */
export function saveControlTypesForDiscipline(disciplineId: string, controlTypes: ControlTypeItem[]) {
  const config = loadFromStorage();
  config[disciplineId] = controlTypes;
  saveToStorage(config);
}

/**
 * Возвращает список названий видов контроля для отображения в таблице.
 * undefined = нет сохранённых настроек, показывать все.
 * [] = все сняты, не показывать ни один.
 * [titles] = показывать только указанные.
 */
export function getVisibleControlTitles(disciplineId: string): string[] | undefined {
  const config = loadFromStorage();
  if (!config[disciplineId]) {
    return undefined;
  }
  const types = config[disciplineId] as ControlTypeItem[];
  return types.filter((ct) => ct.active).map((ct) => ct.title);
}

/**
 * Возвращает для каждого вида контроля список тем для отображения в таблице.
 * undefined = показывать все темы, [] = не показывать ни одной, [..] = только эти.
 */
export function getDisplayedTopicsByControlType(disciplineId: string): Record<string, string[] | undefined> {
  const config = loadFromStorage();
  if (!config[disciplineId]) {
    return {};
  }
  const types = config[disciplineId] as ControlTypeItem[];
  const out: Record<string, string[] | undefined> = {};
  for (const ct of types) {
    const key = ct.title.trim().toLowerCase();
    if (key) {
      out[ct.title] = ct.displayedTopics !== undefined ? ct.displayedTopics : undefined;
    }
  }
  return out;
}
