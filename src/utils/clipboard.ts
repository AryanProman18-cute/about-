/**
 * Clipboard helper with a legacy execCommand fallback, works even inside
 * sandboxed preview iframes where the async Clipboard API is unavailable.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Fire after a click on an external link: if the document is still visible and
 * focused a moment later, the environment blocked the navigation (e.g. a
 * sandboxed preview iframe), copy the link and tell the user instead of
 * letting the click feel dead.
 */
export function externalLinkFallback(href: string, label: string, toast: (msg: string) => void) {
  window.setTimeout(() => {
    if (document.visibilityState === 'visible' && document.hasFocus()) {
      copyToClipboard(href);
      const pretty = href.replace(/^https?:\/\//, '').replace(/\/$/, '');
      toast(`${label} link copied: ${pretty}`);
    }
  }, 400);
}
