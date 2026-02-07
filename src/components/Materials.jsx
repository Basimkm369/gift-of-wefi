import { viewerUrl } from '../utils/pdf'

function Materials({ subjects }) {
  return (
    <section className="materials" id="materials">
      <div className="section-title">
        <h2>Study Materials</h2>
        <span className="title-underline" aria-hidden="true" />
      </div>
      <p className="section-subtitle">View Subject PDFs</p>

      <div className="card-grid">
        {subjects.map((subject) => (
          <article key={subject.file} className="material-card">
            <div className="material-top">
              <div className="badge">PDF</div>
              <h3>{subject.file}</h3>
            </div>
            <div className="material-actions">
              <a
                className="btn primary"
                href={viewerUrl(subject.file)}
                target="_blank"
                rel="noreferrer"
              >
                Open Flipbook
              </a>
              <a
                className="btn ghost"
                href={`/pdfs/${encodeURIComponent(subject.file)}`}
                download
              >
                Download PDF
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Materials
