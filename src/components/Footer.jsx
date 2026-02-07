import { IoLogoWhatsapp } from 'react-icons/io'

function Footer() {
  return (
    <div className="footer-wrap">
      <div className="footer-cta">
        <a
          className="footer-join"
          href="https://whatsapp.com/channel/0029Va8qJPZ6LwHr5pqgU70a"
          target="_blank"
          rel="noreferrer"
        >
          <IoLogoWhatsapp aria-hidden="true" />
          Join WEFI Bulletin Kerala Whatsapp Channel (All updates for exams)
        </a>
      </div>
      <footer className="footer">
        <a href="https://wefionline.in" target="_blank" rel="noreferrer">
          WEFI Kerala 2026
        </a>
      </footer>
    </div>
  )
}

export default Footer
