import { foldKey } from './keys.ts'
import type { Heading, WikiLink } from './model.ts'

/**
 * The headings that open a section: those `parseNote` saw as direct blocks of
 * the document. A `## Meetings` nested in a blockquote or a list item is quoted
 * prose, so it must neither receive an automatic entry nor cut a real section
 * short.
 */
export function topLevelHeadings(headings: readonly Heading[]): readonly Heading[] {
  return headings.filter((heading) => heading.topLevel)
}

/** End offset for `target` within an ordered set of top-level headings. */
export function sectionEnd(
  headings: readonly Heading[],
  target: Heading,
  sourceLength: number,
): number {
  return (
    headings.find((heading) => heading.from > target.from && heading.level <= target.level)?.from ??
    sourceLength
  )
}

/** The target when a heading consists entirely of one parsed wiki link. */
export function linkedHeadingTarget(
  source: string,
  heading: Heading,
  wikiLinks: readonly WikiLink[],
): string | null {
  const raw = source.slice(heading.from, heading.to)
  const firstLine = raw.slice(0, !raw.includes('\n') ? raw.length : raw.indexOf('\n'))
  const content = firstLine
    .replace(/^[ \t]{0,3}#{1,6}[ \t]+/, '')
    .replace(/[ \t]+#+[ \t]*$/, '')
    .trim()
  const match = /^\[\[\s*([^\]|\r\n]+?)\s*(?:\|[^\]\r\n]*)?\]\]$/.exec(content)
  const textTarget = match?.[1]?.trim()
  if (textTarget === undefined || textTarget === '') {
    return null
  }
  const parsedLink = wikiLinks.find(
    (link) =>
      link.from >= heading.from &&
      link.to <= heading.to &&
      foldKey(link.target) === foldKey(textTarget),
  )
  return parsedLink?.target ?? null
}

/**
 * Whether `heading` names `title` either as a linked heading (`## [[Links]]`)
 * or as the legacy plain form (`## Links`). A linked heading's target, rather
 * than its display alias, identifies the section.
 */
export function headingMatchesBacklinkedTitle(
  source: string,
  heading: Heading,
  wikiLinks: readonly WikiLink[],
  title: string,
): boolean {
  return foldKey(linkedHeadingTarget(source, heading, wikiLinks) ?? heading.text) === foldKey(title)
}
