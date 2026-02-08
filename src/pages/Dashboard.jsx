import { Suspense, lazy, useEffect, useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

const Materials = lazy(() => import('../components/Materials'));

function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPdfs = async () => {
      try {
        const response = await fetch('/pdfs/index.json');
        if (!response.ok) return;
        const files = await response.json();
        if (!Array.isArray(files)) return;
        const mapped = files.map((file) => ({
          file,
          url: `/pdfs/${encodeURIComponent(file)}`,
        }));
        setSubjects(mapped);
      } catch (error) {
        console.error('Failed to load PDF list', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPdfs();
  }, []);

  const skeletonCards = Array.from({ length: 6 }, (_, index) => (
    <article key={`skeleton_${index}`} className="material-card skeleton-card">
      <div className="material-top">
        <div className="skeleton-pill" />
        <div className="skeleton-line" />
      </div>
      <div className="material-actions">
        <div className="skeleton-button" />
      </div>
    </article>
  ));

  return (
    <div className="page">
      <Header />
      <main className="main">
        <Hero />
        <Suspense
          fallback={
            <section className="materials" aria-label="Loading PDFs">
              <div className="section-title">
                <h2>Study Materials</h2>
                <span className="title-underline" aria-hidden="true" />
              </div>
              <p className="section-subtitle">View Subject PDFs</p>
              <div className="card-grid">{skeletonCards}</div>
            </section>
          }
        >
          {isLoading ? (
            <section className="materials" aria-label="Loading PDFs">
              <div className="section-title">
                <h2>Study Materials</h2>
                <span className="title-underline" aria-hidden="true" />
              </div>
              <p className="section-subtitle">View Subject PDFs</p>
              <div className="card-grid">{skeletonCards}</div>
            </section>
          ) : (
            <Materials subjects={subjects} />
          )}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;
