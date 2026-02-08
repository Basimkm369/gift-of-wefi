import { useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoLogoWhatsapp,
} from 'react-icons/io';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PDFFlipbook({ pdfUrl, fileName }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [bookWidth, setBookWidth] = useState(520);
  const [bookHeight, setBookHeight] = useState(720);
  const [pageRatio, setPageRatio] = useState(1.35);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const flipBookRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const mobile = containerRef.current.clientWidth < 768;
      setIsMobile(mobile);

      const containerWidth = containerRef.current.clientWidth;
      const targetPageWidth = mobile
        ? containerWidth
        : Math.floor(containerWidth / 2);
      const reservedSpace = mobile ? 280 : 260;
      const availableHeight = Math.max(window.innerHeight - reservedSpace, 360);
      const targetPageHeight = targetPageWidth * pageRatio;
      const scale =
        targetPageHeight > availableHeight
          ? availableHeight / targetPageHeight
          : 1;

      const newWidth = Math.floor(Math.max(targetPageWidth * scale, 320));
      const newHeight = Math.round(newWidth * pageRatio);
      setBookWidth(newWidth);
      setBookHeight(newHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pageRatio]);

  const onDocumentLoadSuccess = (pdf) => {
    setNumPages(pdf.numPages);
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
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const goToNextPage = () => {
    if (flipBookRef.current && numPages && currentPage < numPages) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const resolvedFileName =
    fileName || pdfUrl?.split('/').pop() || 'document.pdf';
  const displayTitle = resolvedFileName.replace(/\.pdf$/i, '');
  const totalPages = numPages || 0;

  const pages = useMemo(() => {
    if (!numPages) return [];
    const pageZoom = 1;
    return Array.from(new Array(numPages), (_, index) => (
      <div
        key={`page_${index + 1}`}
        className="flipbook-page"
        style={{ '--page-zoom': pageZoom }}
      >
        <div className="flipbook-page-canvas">
          <Page
            pageNumber={index + 1}
            width={bookWidth}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </div>
      </div>
    ));
  }, [bookWidth, isMobile, numPages]);

  return (
    <div className="flipbook-viewer" ref={containerRef}>
      <div
        className={`flipbook-loading ${isLoading ? '' : 'hidden'}`}
        style={{
          width: isMobile ? bookWidth : bookWidth * 2,
          height: bookHeight,
          margin: '0 auto',
        }}
      >
        <div className="flipbook-loading-inner">
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
          <span>Loading flipbook...</span>
        </div>
      </div>

      <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
        <div className={`flipbook-shell ${isLoading ? 'hidden' : ''}`}>
          {currentPage === 1 && (
            <div className="flipbook-overlay flipbook-overlay-left">
              <span className="flipbook-overlay-kicker">Document</span>
              <h4>{displayTitle}</h4>
            </div>
          )}
          {numPages ? (
            <HTMLFlipBook
              width={bookWidth}
              height={bookHeight}
              minWidth={bookWidth}
              maxWidth={bookWidth}
              minHeight={bookHeight}
              maxHeight={bookHeight}
              style={{ margin: '0 auto' }}
              className="flipbook-frame"
              startPage={0}
              size="fixed"
              flippingTime={500}
              usePortrait
              maxShadowOpacity={0.2}
              mobileScrollSupport
              autoSize
              drawShadow
              startZIndex={0}
              clickEventForward={false}
              useMouseEvents
              swipeDistance={10}
              showPageCorners={false}
              disableFlipByClick={false}
              onFlip={(event) => setCurrentPage(event.data + 1)}
              ref={flipBookRef}
            >
              {pages}
            </HTMLFlipBook>
          ) : null}
        </div>
      </Document>

      {!isLoading && (
        <div className="flipbook-controls">
          <button
            type="button"
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className={`flipbook-btn ${currentPage <= 1 ? 'disabled' : ''}`}
            aria-label="Previous page"
          >
            {isMobile ? <IoIosArrowBack /> : 'Previous'}
          </button>

          <span className="flipbook-page-count">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className={`flipbook-btn ${currentPage >= totalPages ? 'disabled' : ''}`}
            aria-label="Next page"
          >
            {isMobile ? <IoIosArrowForward /> : 'Next'}
          </button>
        </div>
      )}

      {!isLoading && (
        <div className="flipbook-join-row">
          <a
            className="flipbook-join"
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

export default PDFFlipbook;
