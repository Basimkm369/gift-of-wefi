import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoMdContract,
  IoMdExpand,
  IoLogoWhatsapp,
} from 'react-icons/io';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PDFViewer({ pdfUrl, fileName }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageRatio, setPageRatio] = useState(1.35);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const shellRef = useRef(null);
  const touchStartX = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const reservedSpace = 240;
      const safePadding = 16;
      const containerWidth = containerRef.current.clientWidth;
      const availableWidth = Math.max(containerWidth - safePadding * 2, 260);
      const availableHeight = Math.max(
        window.innerHeight - reservedSpace - safePadding * 2,
        320
      );
      const widthFromHeight = availableHeight / pageRatio;
      const finalWidth = Math.min(availableWidth, widthFromHeight);
      const nextWidth = Math.floor(Math.max(finalWidth, 260));
      setPageWidth(nextWidth);
      setPageHeight(Math.round(nextWidth * pageRatio));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pageRatio]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const onDocumentLoadSuccess = (pdf) => {
    setNumPages(pdf.numPages);
    setCurrentPage(1);
    pdf.getPage(1).then((page) => {
      const viewport = page.getViewport({ scale: 1 });
      const ratio = viewport.height / viewport.width;
      if (Number.isFinite(ratio) && ratio > 0) {
        setPageRatio(ratio);
      }
      setIsLoading(false);
    });
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    if (!numPages) return;
    setCurrentPage((prev) => Math.min(prev + 1, numPages));
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    const threshold = 50;
    if (deltaX > threshold) {
      goToPrevPage();
    } else if (deltaX < -threshold) {
      goToNextPage();
    }
    touchStartX.current = null;
  };

  const handleStageClick = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - bounds.left;
    if (clickX < bounds.width * 0.45) {
      goToPrevPage();
      return;
    }
    if (clickX > bounds.width * 0.55) {
      goToNextPage();
    }
  };

  const toggleFullscreen = async () => {
    if (!shellRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
      return;
    }
    await shellRef.current.requestFullscreen?.();
  };

  const resolvedFileName =
    fileName || pdfUrl?.split('/').pop() || 'document.pdf';
  const displayTitle = resolvedFileName.replace(/\.pdf$/i, '');
  const totalPages = numPages || 0;

  return (
    <div className="pdf-viewer">
      <div className="pdf-shell" ref={shellRef}>
        <button
          type="button"
          className="pdf-fullscreen"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit full screen' : 'View full screen'}
          title={isFullscreen ? 'Exit full screen' : 'View full screen'}
        >
          {isFullscreen ? <IoMdContract /> : <IoMdExpand />}
        </button>
        {isLoading && (
          <div className="pdf-loading">
            <div className="pdf-loading-inner">
              <svg
                className="spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="spin-track"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="spin-head"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading page...</span>
            </div>
          </div>
        )}

        <div
          className={`pdf-stage ${isLoading ? 'hidden' : ''}`}
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleStageClick}
          style={{
            height: pageHeight ? `${pageHeight}px` : undefined,
          }}
        >
          <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
            <div className="pdf-page">
              <Page
                pageNumber={currentPage}
                width={pageWidth || undefined}
                height={pageHeight || undefined}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          </Document>
        </div>
      </div>

      {!isLoading && (
        <div className="pdf-controls">
          <button
            type="button"
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className={`pdf-btn ${currentPage <= 1 ? 'disabled' : ''}`}
            aria-label="Previous page"
          >
            <IoIosArrowBack />
            <span>Previous</span>
          </button>

          <span className="pdf-page-count">
            {displayTitle} — Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className={`pdf-btn ${currentPage >= totalPages ? 'disabled' : ''}`}
            aria-label="Next page"
          >
            <span>Next</span>
            <IoIosArrowForward />
          </button>
        </div>
      )}

      {!isLoading && (
        <div className="pdf-join-row">
          <a
            className="pdf-join"
            href="https://whatsapp.com/channel/0029Va8qJPZ6LwHr5pqgU70a"
            target="_blank"
            rel="noreferrer"
          >
            <IoLogoWhatsapp aria-hidden="true" />
            Join WEFI Bulletin Kerala Whatsapp Channel (All updates for exams)
          </a>
        </div>
      )}
    </div>
  );
}

export default PDFViewer;
