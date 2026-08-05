import { afterEach, describe, expect, it } from 'vitest'
import {
  isPastReminderTime,
  localDateKey,
  msUntil,
  nextReminderAt,
  parseReminderTime,
  shouldNotifyNow,
  wasNotifiedOn,
  setLastNotifiedDate,
  getLastNotifiedDate,
} from './dailyBrowserReminder'
import { isValidReminderTime } from '@/data/notificationPrefs'

describe('parseReminderTime / isValidReminderTime', () => {
  it('accepts valid HH:mm', () => {
    expect(isValidReminderTime('00:00')).toBe(true)
    expect(isValidReminderTime('09:30')).toBe(true)
    expect(isValidReminderTime('20:00')).toBe(true)
    expect(isValidReminderTime('23:59')).toBe(true)
    expect(parseReminderTime('20:00')).toEqual({ hours: 20, minutes: 0 })
  })

  it('rejects invalid times', () => {
    expect(isValidReminderTime('24:00')).toBe(false)
    expect(isValidReminderTime('9:30')).toBe(false)
    expect(isValidReminderTime('20:60')).toBe(false)
    expect(isValidReminderTime('')).toBe(false)
    expect(parseReminderTime('nope')).toBeNull()
  })
})

describe('nextReminderAt', () => {
  it('returns today when the slot is still ahead', () => {
    const now = new Date(2026, 7, 5, 10, 0, 0)
    const next = nextReminderAt('20:00', now)
    expect(next).not.toBeNull()
    expect(next!.getFullYear()).toBe(2026)
    expect(next!.getMonth()).toBe(7)
    expect(next!.getDate()).toBe(5)
    expect(next!.getHours()).toBe(20)
    expect(next!.getMinutes()).toBe(0)
  })

  it('returns tomorrow when today\'s slot already passed', () => {
    const now = new Date(2026, 7, 5, 21, 0, 0)
    const next = nextReminderAt('20:00', now)
    expect(next).not.toBeNull()
    expect(next!.getDate()).toBe(6)
    expect(next!.getHours()).toBe(20)
  })

  it('returns tomorrow when now equals the slot', () => {
    const now = new Date(2026, 7, 5, 20, 0, 0)
    const next = nextReminderAt('20:00', now)
    expect(next).not.toBeNull()
    expect(next!.getDate()).toBe(6)
  })
})

describe('isPastReminderTime', () => {
  it('is false before the slot and true on/after', () => {
    const before = new Date(2026, 7, 5, 19, 59, 0)
    const exact = new Date(2026, 7, 5, 20, 0, 0)
    const after = new Date(2026, 7, 5, 20, 1, 0)
    expect(isPastReminderTime('20:00', before)).toBe(false)
    expect(isPastReminderTime('20:00', exact)).toBe(true)
    expect(isPastReminderTime('20:00', after)).toBe(true)
  })
})

describe('localDateKey', () => {
  it('formats local YYYY-MM-DD', () => {
    expect(localDateKey(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
    expect(localDateKey(new Date(2026, 11, 31, 0, 0))).toBe('2026-12-31')
  })
})

describe('msUntil', () => {
  it('returns non-negative delta', () => {
    const now = new Date(2026, 7, 5, 10, 0, 0)
    const later = new Date(2026, 7, 5, 10, 0, 5)
    expect(msUntil(later, now)).toBe(5000)
    expect(msUntil(now, later)).toBe(0)
  })
})

describe('dedupe by day', () => {
  const uid = 'user-test'

  afterEach(() => {
    localStorage.removeItem(`eq:lastBrowserReminder:${uid}`)
  })

  it('tracks last notified date', () => {
    expect(getLastNotifiedDate(uid)).toBeNull()
    setLastNotifiedDate(uid, '2026-08-05')
    expect(getLastNotifiedDate(uid)).toBe('2026-08-05')
    expect(wasNotifiedOn(uid, '2026-08-05')).toBe(true)
    expect(wasNotifiedOn(uid, '2026-08-06')).toBe(false)
  })

  it('shouldNotifyNow respects time and dedupe', () => {
    const after = new Date(2026, 7, 5, 20, 30, 0)
    expect(shouldNotifyNow(uid, '20:00', after)).toBe(true)
    setLastNotifiedDate(uid, localDateKey(after))
    expect(shouldNotifyNow(uid, '20:00', after)).toBe(false)

    const before = new Date(2026, 7, 5, 10, 0, 0)
    localStorage.removeItem(`eq:lastBrowserReminder:${uid}`)
    expect(shouldNotifyNow(uid, '20:00', before)).toBe(false)
  })
})

describe('normalize edge via nextReminderAt', () => {
  it('returns null for invalid time', () => {
    expect(nextReminderAt('25:00', new Date())).toBeNull()
  })
})
