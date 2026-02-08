import PDFFlipbook from '../components/PDFFlipbook';

function Viewer({ fileUrl, title }) {
  const decodedUrl = decodeURIComponent(fileUrl || '');
  const decodedTitle = decodeURIComponent(title || '');
  const displayTitle =
    decodedTitle || decodedUrl.split('/').pop() || 'Document';

  return (
    <div className="viewer-page">
      <header className="viewer-header">
        <button
          type="button"
          className="viewer-back"
          onClick={() => {
            window.location.href = '/';
          }}
        >
          Back to Library
        </button>
        <div className="viewer-title" title={displayTitle}>
          {displayTitle}
        </div>
      </header>
      <PDFFlipbook pdfUrl={decodedUrl} fileName={displayTitle} />
    </div>
  );
}

export default Viewer;
