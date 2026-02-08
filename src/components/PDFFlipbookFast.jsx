import { PdfFlipbook } from 'react-pdf-flipbook';
import { IoLogoWhatsapp } from 'react-icons/io';

function PDFFlipbookFast({ fileName, pdfUrl }) {
  const resolvedFileName =
    fileName || pdfUrl?.split('/').pop() || 'document.pdf';
  resolvedFileName.replace(/\.pdf$/i, '');

  return (
    <div className="pdf-viewer pdf-viewer--iframe">
      <div className="pdf-shell">
        <div className="pdf-iframe-frame">
          <PdfFlipbook />
        </div>
      </div>
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
    </div>
  );
}

export default PDFFlipbookFast;
