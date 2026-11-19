/**
 * Write `text` to the clipboard, falling back to the legacy
 * document.execCommand('copy') path when navigator.clipboard is unavailable.
 *
 * navigator.clipboard requires a "secure context" (HTTPS or localhost). When
 * the app is reached over plain HTTP from a LAN IP — common for local dev
 * served at http://<lan-ip>:3000 — navigator.clipboard is undefined and the
 * modern path fails silently. The fallback uses a transient textarea + the
 * legacy copy command, which works in non-secure contexts as long as the
 * call originates from a real user gesture (click).
 *
 * @returns true if the copy succeeded, false otherwise.
 */
export async function writeToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // fall through to legacy
    }
  }

  if (typeof document === 'undefined') return false

  const ta = document.createElement('textarea')
  ta.value = text
  // readonly + position off-screen avoids the iOS Safari keyboard and the
  // page-zoom that triggers below 12pt font-size on focus
  ta.setAttribute('readonly', '')
  ta.style.position = 'absolute'
  ta.style.left = '-9999px'
  ta.style.top = '0'
  ta.style.fontSize = '12pt'
  ta.style.opacity = '0'
  ta.style.pointerEvents = 'none'
  document.body.appendChild(ta)

  const selection = document.getSelection()
  const previousRange = selection?.rangeCount ? selection.getRangeAt(0) : null
  // iOS Safari ignores ta.select() on a readonly textarea; setSelectionRange
  // is the documented workaround
  ta.focus()
  ta.setSelectionRange(0, ta.value.length)

  let ok = false
  try {
    ok = document.execCommand('copy') // NOSONAR S1874 - intentional legacy fallback for non-secure contexts
  } catch {
    ok = false
  } finally {
    ta.remove()
    if (previousRange && selection) {
      selection.removeAllRanges()
      selection.addRange(previousRange)
    }
  }
  return ok
}
