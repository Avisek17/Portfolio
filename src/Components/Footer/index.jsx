import React from 'react';
import './styles.scss';

const Footer = () => {
  return (
    <footer className="site-footer simple-footer">
      <div className="site-footer__inner">
        <p className="site-footer__copyright">© {new Date().getFullYear()} Avisek Dulal. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;