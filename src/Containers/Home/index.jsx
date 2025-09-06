import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { profileAPI, formatImageUrl } from '../../services/api';
import './styles.scss';

const Home = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    title: '',
    bio: '',
    profileImage: ''
  });
  const [loading, setLoading] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const roles = [
      'Full Stack Developer',
      'UI/UX Designer', 
      'Problem Solver',
      'Tech Enthusiast'
    ];
    
    const title = profileData.title || roles[0];
    if (currentIndex < title.length) {
      const timeout = setTimeout(() => {
        setTypedText(title.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentIndex(0);
        setTypedText('');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, profileData.title]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await profileAPI.get();
      if (response.status === 'success' && response.data) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
    setLoading(false);
  };

  const location = useLocation();

  const scrollTo = (id) => {
    if (location.pathname.startsWith('/admin')) return; // allow normal routing in admin
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <section className="home">
        <div className="home__container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="home">
      <div className="home__bg-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
      
      <div className="home__container">
        <div className="home__content">
          <div className="home__text">
            <div className="home__greeting-wrapper">
              <span className="home__wave">👋</span>
              <h1 className="home__greeting">Hello, I'm</h1>
            </div>
            <h2 className="home__name">{profileData.name || "Your Name"}</h2>
            <div className="home__title-wrapper">
              <h3 className="home__title">
                <span className="typing-text">{typedText}</span>
                <span className="cursor">|</span>
              </h3>
            </div>
            <p className="home__description">
              {profileData.bio || "Welcome to my portfolio! I'm a passionate developer creating modern web applications with cutting-edge technologies."}
            </p>

            <div className="home__buttons">
              <Link
                to="/Portfolio"
                onClick={(e)=>{ if(!location.pathname.startsWith('/admin')) { e.preventDefault(); scrollTo('portfolio'); } }}
                className="home__btn home__btn--primary"
              >
                <span>View My Work</span>
                <i className="btn-icon">→</i>
              </Link>
              <Link
                to="/Contact"
                onClick={(e)=>{ if(!location.pathname.startsWith('/admin')) { e.preventDefault(); scrollTo('contact'); } }}
                className="home__btn home__btn--secondary"
              >
                <span>Get In Touch</span>
                <i className="btn-icon">📧</i>
              </Link>
            </div>
          </div>
          
          <div className="home__visual">
            <div className="home__image-container">
              <div className="home__image">
                {profileData.profileImage ? (
                  <img 
                    src={formatImageUrl(profileData.profileImage)} 
                    alt={profileData.name} 
                    className="home__profile-image" 
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="home__image-placeholder">
                    <span>Profile Image</span>
                  </div>
                )}
              </div>
              <div className="orbit-ring ring-1">
                <div className="orbit-dot dot-1"></div>
              </div>
              <div className="orbit-ring ring-2">
                <div className="orbit-dot dot-2"></div>
              </div>
            </div>
            
            <div className="tech-icons">
              <div className="tech-icon">⚛️</div>
              <div className="tech-icon">🚀</div>
              <div className="tech-icon">💻</div>
              <div className="tech-icon">🎨</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;