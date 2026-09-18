/**
 * Tombstone file. An earlier upload of this site shipped a custom cursor
 * here; it was removed again, but the deploy workflow extracts each zip
 * over the repo without deleting files, so the old copy would survive in
 * the repo and break the build (it imported gsap, which is no longer a
 * dependency). This harmless stub overwrites that stale copy on every
 * deploy. Nothing imports it, so it never ends up in the bundle.
 */
export default function CustomCursor() {
  return null;
}
