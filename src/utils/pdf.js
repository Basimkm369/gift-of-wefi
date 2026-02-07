export const viewerUrl = (fileUrl, title) => {
  const params = new URLSearchParams()
  params.set('file', fileUrl)
  if (title) {
    params.set('title', title)
  }
  return `/?${params.toString()}`
}
