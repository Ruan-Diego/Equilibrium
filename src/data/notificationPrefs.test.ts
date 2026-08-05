import { describe, expect, it } from 'vitest'
import {
  DEFAULT_NOTIFICATION_PREFS,
  normalizeNotificationPrefs,
} from './notificationPrefs'

describe('normalizeNotificationPrefs', () => {
  it('returns defaults for empty input', () => {
    expect(normalizeNotificationPrefs(null)).toEqual(DEFAULT_NOTIFICATION_PREFS)
    expect(normalizeNotificationPrefs(undefined)).toEqual(
      DEFAULT_NOTIFICATION_PREFS,
    )
  })

  it('reads enabled flag and valid time', () => {
    expect(
      normalizeNotificationPrefs({ browserEnabled: true, time: '08:15' }),
    ).toEqual({ browserEnabled: true, time: '08:15' })
  })

  it('falls back invalid time and coerces enabled', () => {
    expect(
      normalizeNotificationPrefs({ browserEnabled: 'yes', time: '25:00' }),
    ).toEqual({ browserEnabled: false, time: '20:00' })
  })
})
