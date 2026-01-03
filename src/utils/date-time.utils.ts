export function formatIntlDate(dateString: string | Date) {
  const date = new Date(dateString)
  // Then specify how you want your dates to be formatted
  return new Intl.DateTimeFormat('default', { dateStyle: 'long' }).format(date)
}

/**
 * Format a date to a localized string
 * @param dateString - Date to format
 * @returns Formatted date string (MM/DD/YYYY, HH:MM)
 */
export function formatDate(dateString: Date | string | null | undefined): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format a date to a relative time string (e.g., "5m ago", "2h ago")
 * @param dateString - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: Date | string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${ diffInMinutes }m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${ diffInHours }h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${ diffInDays }d ago`

  const diffInWeeks = Math.floor(diffInDays / 7)
  return `${ diffInWeeks }w ago`
}

/**
 * Format a duration in seconds to a human-readable string (e.g., "2h 30m")
 * @param seconds - Duration in seconds
 * @returns Formatted duration string or '-' if null/undefined
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '-'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${ hours }h ${ minutes }m ${ secs }s`
  } else if (minutes > 0) {
    return `${ minutes }m ${ secs }s`
  }
  return `${ secs }s`
}
