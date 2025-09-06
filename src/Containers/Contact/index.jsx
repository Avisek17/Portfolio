import React, { useState, useEffect } from "react";
import { profileAPI, contactAPI } from '../../services/api';
import './styles.scss';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [profileData, setProfileData] = useState({
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    twitter: '',
    instagram: '',
    website: '',
    contactDescription: ''
  });
  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');
    setFormSuccess('');
    
    try {
      const response = await contactAPI.submit(formData);
      if (response.status === 'success') {
        setFormSuccess('Thank you for your message!!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      setFormError('Failed to send message: ' + error.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: "📧",
      title: "Email",
      value: profileData.email || "Not set",
      link: profileData.email ? `mailto:${profileData.email}` : "#"
    },
    {
      icon: "📱",
      title: "Phone",
      value: profileData.phone || "Not set",
      link: profileData.phone ? `tel:${profileData.phone}` : "#"
    },
    {
      icon: "📍",
      title: "Location",
      value: profileData.location || "Not set",
      link: "#"
    },
    {
      icon: "🌐",
      title: "Website",
      value: profileData.website || "Not set",
      link: profileData.website
        ? (profileData.website.startsWith('http')
            ? profileData.website
            : `https://${profileData.website}`)
        : "#"
    }
  ];

  const normalizeUrl = (u) => {
    if (!u) return "#";
    return u.startsWith('http') ? u : `https://${u}`;
  };

  const socialLinks = [
    { name: "GitHub", icon: "🐙", url: normalizeUrl(profileData.github) },
    { name: "LinkedIn", icon: "💼", url: normalizeUrl(profileData.linkedin) },
    { name: "Twitter", icon: "🐦", url: normalizeUrl(profileData.twitter) },
    { name: "Instagram", icon: "📷", url: normalizeUrl(profileData.instagram) }
  ].filter(link => link.url !== "#"); // Only show links that are set

  if (loading) {
    return (
      <section className="contact">
        <div className="contact__container">
          <div className="loading">Loading contact information...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="contact">
      <div className="contact__container">
        <h2 className="contact__title">Get In Touch</h2>
        <p className="contact__subtitle">Let's discuss the next project</p>
        
        {(!profileData.email && !profileData.phone) && (
          <div className="contact__admin-notice">
            <p>💡 Add your contact information through the <a href="/admin/profile">Admin Panel</a></p>
          </div>
        )}
        
        <div className="contact__content">
          <div className="contact__info">
            <h3 className="contact__section-title">Contact Information</h3>
            <p className="contact__description">
              {profileData.contactDescription || 
               "I'm always interested in new opportunities and exciting projects. Feel free to reach out if you have a project in mind or just want to say hello!"}
            </p>
            
            <div className="contact__info-list">
              {contactInfo.map((info, index) => (
                <a 
                  key={index} 
                  href={info.link} 
                  className="contact__info-item"
                  target={info.link.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                >
                  <span className="contact__info-icon">{info.icon}</span>
                  <div className="contact__info-details">
                    <span className="contact__info-title">{info.title}</span>
                    <span className="contact__info-value">{info.value}</span>
                  </div>
                </a>
              ))}
            </div>

            <div className="contact__social">
              <h4 className="contact__social-title">Follow Me</h4>
              <div className="contact__social-links">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    className="contact__social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.name}
                  >
                    <span className="contact__social-icon">{social.icon}</span>
                    <span className="contact__social-name">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="contact__form-wrapper">
            <h3 className="contact__section-title">Send Message</h3>
            
            {formSuccess && (
              <div className="contact__form-success">
                {formSuccess}
              </div>
            )}
            
            {formError && (
              <div className="contact__form-error">
                {formError}
              </div>
            )}
            
            <form className="contact__form" onSubmit={handleSubmit}>
              <div className="contact__form-group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="contact__input"
                  required
                />
              </div>
              
              <div className="contact__form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  className="contact__input"
                  required
                />
              </div>
              
              <div className="contact__form-group">
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  className="contact__input"
                  required
                />
              </div>
              
              <div className="contact__form-group">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  className="contact__textarea"
                  rows="5"
                  required
                ></textarea>
              </div>
              
              <button type="submit" className="contact__submit-btn" disabled={formSubmitting}>
                {formSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;