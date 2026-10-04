export function pageMetadata(options?: {
  pageType?: string
  title?: string
  parentTitle?: string
  modeId?: string
  images?: Record<string, string | undefined>
}): { title: string; description: string }
