import { describe, it, expect, beforeEach } from 'vitest'
import type { ControlTypeItem } from '@/modules/settings/modal'
import {
  getDisplayedTopicsByControlType,
  getTemplateIdByControlType,
  getVisibleControlTitles,
  mergeControlTypesWithSettings,
  saveControlTypesForDiscipline,
} from '@/modules/settings/composables/useDisciplineControlTypes'

const STORAGE_KEY = 'discipline_control_types'

beforeEach(() => {
  localStorage.removeItem(STORAGE_KEY)
})

describe('useDisciplineControlTypes (настройки видов контроля)', () => {
  it('mergeControlTypesWithSettings без localStorage создаёт элементы по API', () => {
    const merged = mergeControlTypesWithSettings(
      'disc-1',
      ['Контрольная работа', 'Экзамен'],
      'tpl-default'
    )

    expect(merged).toHaveLength(2)
    expect(merged[0]?.title).toBe('Контрольная работа')
    expect(merged[0]?.active).toBe(true)
    expect(merged[0]?.showInTable).toBe(true)
    expect(merged[0]?.templateId).toBe('tpl-default')
    expect(merged[1]?.title).toBe('Экзамен')
  })

  it('подхватывает сохранённые в localStorage поля по совпадению title', () => {
    const stored: ControlTypeItem[] = [
      {
        id: 'custom-id',
        title: 'контрольная работа',
        description: 'описание',
        active: false,
        showInTable: false,
        templateId: 'tpl-x',
        displayedTopics: ['Тема 1'],
      },
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 'disc-2': stored }))

    const merged = mergeControlTypesWithSettings(
      'disc-2',
      ['Контрольная работа'],
      null
    )

    expect(merged).toHaveLength(1)
    expect(merged[0]?.id).toBe('custom-id')
    expect(merged[0]?.title).toBe('Контрольная работа')
    expect(merged[0]?.active).toBe(false)
    expect(merged[0]?.showInTable).toBe(false)
    expect(merged[0]?.templateId).toBe('tpl-x')
    expect(merged[0]?.displayedTopics).toEqual(['Тема 1'])
  })

  it('saveControlTypesForDiscipline и getVisibleControlTitles', () => {
    const list: ControlTypeItem[] = [
      {
        id: 'a',
        title: 'Зачёт',
        description: '',
        active: true,
        showInTable: true,
        templateId: null,
      },
      {
        id: 'b',
        title: 'Экзамен',
        description: '',
        active: false,
        showInTable: false,
        templateId: null,
      },
    ]
    saveControlTypesForDiscipline('disc-3', list)

    expect(getVisibleControlTitles('disc-3')).toEqual(['Зачёт'])
  })

  it('getDisplayedTopicsByControlType возвращает только сохранённые привязки', () => {
    const list: ControlTypeItem[] = [
      {
        id: 'a',
        title: 'Зачёт',
        description: '',
        active: true,
        showInTable: true,
        templateId: null,
        displayedTopics: ['1.1', '1.2'],
      },
      {
        id: 'b',
        title: 'Экзамен',
        description: '',
        active: true,
        showInTable: true,
        templateId: null,
      },
    ]
    saveControlTypesForDiscipline('disc-4', list)

    expect(getDisplayedTopicsByControlType('disc-4')).toEqual({
      Зачёт: ['1.1', '1.2'],
      Экзамен: undefined,
    })
  })

  it('getTemplateIdByControlType исключает пустые templateId', () => {
    const list: ControlTypeItem[] = [
      {
        id: 'a',
        title: 'Зачёт',
        description: '',
        active: true,
        showInTable: true,
        templateId: 'tpl-1',
      },
      {
        id: 'b',
        title: 'Экзамен',
        description: '',
        active: false,
        showInTable: false,
        templateId: null,
      },
    ]
    saveControlTypesForDiscipline('disc-5', list)

    expect(getTemplateIdByControlType('disc-5')).toEqual({
      Зачёт: 'tpl-1',
    })
  })
})
