import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './App.scss';
import Home from './Containers/Home';
import Portfolio from './Containers/Portfolio';
import Skills from './Containers/Skills';
import Contact from './Containers/Contact';
import Admin from './Containers/Admin';
import Navbar from './Components/NavBar';
import Resume from './Containers/Resume';
import Footer from './Components/Footer';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Admin section remains routed; public site becomes a single scrolling page
  if (isAdminRoute) {
    return (
      <div className="App">
        <Routes>
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="App single-page">
      <div id="particles" className="particles-bg"></div>
      <Navbar />
      <div className="page-content single-page__sections">
        {/* Single-page sections in DOM order (with reveal animations) */}
        <div id="home" className="single-page__section reveal" style={{'--reveal-delay': '0ms'}}><Home /></div>
        <div id="portfolio" className="single-page__section reveal" style={{'--reveal-delay': '120ms'}}><Portfolio /></div>
        <div id="skills" className="single-page__section reveal" style={{'--reveal-delay': '240ms'}}><Skills /></div>
        <div id="resume" className="single-page__section reveal" style={{'--reveal-delay': '360ms'}}><Resume /></div>
        <div id="contact" className="single-page__section reveal" style={{'--reveal-delay': '480ms'}}><Contact /></div>
      </div>
      <Footer />
    </div>
  );
}

// Attach observer after component definition to avoid recreating on every render
function useSectionReveal() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('.single-page__section.reveal'));
    if (!('IntersectionObserver' in window) || sections.length === 0) {
      sections.forEach(sec => sec.classList.add('reveal--visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('reveal--visible');
          // Remove will-change after transition ends to free memory
          const tidy = () => {
            el.style.willChange = 'auto';
            el.removeEventListener('transitionend', tidy);
          };
          el.addEventListener('transitionend', tidy);
          observer.unobserve(entry.target); // only animate once
        }
      });
    }, {
      root: null,
      threshold: 0.18,
      rootMargin: '0px 0px -10% 0px'
    });

    sections.forEach(sec => observer.observe(sec));
    return () => observer.disconnect();
  }, []);
}

// Invoke hook inside App (after definition)
function AppWithReveal() {
  useSectionReveal();
  return <App />;
}

export default AppWithReveal;