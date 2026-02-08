import * as pdfjsLib from './pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.mjs';

const loadingEl = document.getElementById('pdfLoading');
const stageEl = document.getElementById('pdfStage');
const pageEl = document.getElementById('pdfPage');
const canvas = document.getElementById('pdfCanvas');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageCountEl = document.getElementById('pageCount');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const shellEl = document.querySelector('.pdf-shell');
const viewerEl = document.querySelector('.pdf-viewer');
const controlsEl = document.querySelector('.pdf-controls');

let pdfDoc = null;
let currentPage = 1;
let totalPages = 1;
let isRendering = false;
let touchStartX = null;

const safeDecode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch (err) {
    return value;
  }
};

const DEFAULT_RATIO = 1.35;

const getParams = () => {
  const search =
    window.parent && window.parent.location
      ? window.parent.location.search
      : window.location.search;
  return new URLSearchParams(search);
};

const setLoading = (isLoading) => {
  if (isLoading) {
    loadingEl.classList.remove('hidden');
  } else {
    loadingEl.classList.add('hidden');
  }
};

const updateControls = () => {
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
  pageCountEl.textContent = `Page ${currentPage} of ${totalPages}`;
};

const computeSize = (ratio) => {
  const reservedSpace = 0;
  const safePadding = 2;
  const containerWidth = stageEl.clientWidth;
  const viewerHeight =
    document.fullscreenElement || document.webkitFullscreenElement
      ? window.innerHeight
      : viewerEl?.clientHeight || window.innerHeight;
  const controlsHeight = controlsEl ? controlsEl.offsetHeight : 0;
  const containerHeight = Math.max(viewerHeight - controlsHeight - 12, 220);
  const availableWidth = Math.max(containerWidth - safePadding * 2, 260);
  const availableHeight = Math.max(
    containerHeight - reservedSpace - safePadding * 2,
    220
  );
  const widthFromHeight = availableHeight / ratio;
  const finalWidth = Math.min(availableWidth, widthFromHeight);
  const finalHeight = Math.round(finalWidth * ratio);
  stageEl.style.height = `${finalHeight}px`;
  return { width: finalWidth, height: finalHeight };
};

const renderPage = (pageNum) => {
  if (!pdfDoc || isRendering) return;
  isRendering = true;
  setLoading(true);
  shellEl.classList.add('is-loading');
  pdfDoc
    .getPage(pageNum)
    .then((page) => {
      const viewport = page.getViewport({ scale: 1 });
      const ratio = viewport.height / viewport.width;
      const size = computeSize(ratio);
      const scale = size.width / viewport.width;
      const cappedScale = Math.min(scale, 2.5);
      const dpr = window.devicePixelRatio || 1;
      const scaledViewport = page.getViewport({ scale: cappedScale * dpr });
      const ctx = canvas.getContext('2d');
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      canvas.style.width = `${scaledViewport.width / dpr}px`;
      canvas.style.height = `${scaledViewport.height / dpr}px`;
      return page.render({
        canvasContext: ctx,
        viewport: scaledViewport,
      }).promise;
    })
    .then(() => {
      isRendering = false;
      setLoading(false);
      shellEl.classList.remove('is-loading');
      updateControls();
    })
    .catch(() => {
      isRendering = false;
      setLoading(false);
      shellEl.classList.remove('is-loading');
    });
};

const goToPage = (delta) => {
  if (!pdfDoc) return;
  const target = currentPage + delta;
  if (target < 1 || target > totalPages) return;
  currentPage = target;
  renderPage(currentPage);
};

const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
    return;
  }
  if (shellEl.requestFullscreen) {
    shellEl.requestFullscreen();
  }
};

prevBtn.addEventListener('click', () => goToPage(-1));
nextBtn.addEventListener('click', () => goToPage(1));
fullscreenBtn.addEventListener('click', toggleFullscreen);

document.addEventListener('fullscreenchange', () => {
  if (pdfDoc) {
    stageEl.style.height = '';
    setTimeout(() => {
      renderPage(currentPage);
    }, 0);
  }
});

document.addEventListener('webkitfullscreenchange', () => {
  if (pdfDoc) {
    stageEl.style.height = '';
    setTimeout(() => {
      renderPage(currentPage);
    }, 0);
  }
});

if (window.ResizeObserver) {
  const resizeObserver = new ResizeObserver(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  });
  resizeObserver.observe(shellEl);
  if (controlsEl) {
    resizeObserver.observe(controlsEl);
  }
}

window.addEventListener('resize', () => {
  if (pdfDoc) {
    renderPage(currentPage);
  }
});

stageEl.addEventListener('click', (event) => {
  const bounds = stageEl.getBoundingClientRect();
  const clickX = event.clientX - bounds.left;
  if (clickX < bounds.width * 0.45) {
    goToPage(-1);
    return;
  }
  if (clickX > bounds.width * 0.55) {
    goToPage(1);
  }
});

stageEl.addEventListener('touchstart', (event) => {
  if (!event.touches || !event.touches.length) return;
  touchStartX = event.touches[0].clientX;
});

stageEl.addEventListener('touchend', (event) => {
  if (touchStartX === null) return;
  const endX = event.changedTouches[0].clientX;
  const deltaX = endX - touchStartX;
  touchStartX = null;
  if (deltaX > 50) {
    goToPage(-1);
  } else if (deltaX < -50) {
    goToPage(1);
  }
});

const params = getParams();
const file = params.get('file') || params.get('pdf') || '';
const title = params.get('title') || file.split('/').pop() || 'Document';
safeDecode(title).replace(/\.pdf$/i, '');

computeSize(DEFAULT_RATIO);

if (!file) {
  pageCountEl.textContent = 'PDF not found';
  prevBtn.disabled = true;
  nextBtn.disabled = true;
  setLoading(false);
} else {
  const decodedFile = safeDecode(file);
  pdfjsLib
    .getDocument(decodedFile)
    .promise.then((pdf) => {
      pdfDoc = pdf;
      totalPages = pdf.numPages || 1;
      currentPage = 1;
      updateControls();
      renderPage(currentPage);
    })
    .catch(() => {
      pageCountEl.textContent = 'Failed to load PDF';
      setLoading(false);
    });
}
