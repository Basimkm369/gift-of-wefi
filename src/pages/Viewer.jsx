import PDFFlipbook from '../components/PDFFlipbook'

function Viewer({ fileUrl, title }) {
  const decodedUrl = decodeURIComponent(fileUrl || '')
  const decodedTitle = decodeURIComponent(title || '')

  return (
    <div className="viewer-page">
      <header className="viewer-header">
        <button
          type="button"
          className="viewer-back"
          onClick={() => {
            window.location.href = '/'
          }}
        >
          Back to Library
        </button>
      </header>
      <PDFFlipbook
        pdfUrl={decodedUrl}
        fileName={decodedTitle || decodedUrl.split('/').pop()}
      />
    </div>
  )
}

export default Viewer
