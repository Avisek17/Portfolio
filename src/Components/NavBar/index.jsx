import React, { useState } from 'react';
import {FaBars, FaReact } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import {HiX} from 'react-icons/hi';
import './styles.scss';
const navItems = [
  { label: 'HOME', target: 'home' },
  { label: 'PORTFOLIO', target: 'portfolio' },
  { label: 'SKILLS', target: 'skills' },
  { label: 'RESUME', target: 'resume' },
  { label: 'CONTACT', target: 'contact' },
];

const Navbar = () => {
  const [toggleIcon , setToggleIcon] = useState(false);
  const location = useLocation();

  const handleToggleIcon = () => setToggleIcon(!toggleIcon);

  const handleScroll = (targetId) => {
    // If currently on an admin route, use normal navigation
    if (location.pathname.startsWith('/admin')) return;
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setToggleIcon(false);
    }
  };
  return (
    <div>
      <nav className="navbar">
        <div className="navbar_container">
          <Link to={'/'} className="navbar_container_logo" onClick={(e)=>{ if(!location.pathname.startsWith('/admin')) { e.preventDefault(); handleScroll('home'); } }}>
            <FaReact size={40} />
          </Link>
        </div>
        <ul className = {`navbar_container_menu ${toggleIcon ? 'active' : ''}`}>
          {navItems.map((item, key) => (
            <li key={key} className="navbar_container_menu_item">
              {location.pathname.startsWith('/admin') ? (
                <Link className="navbar_container_menu_item_links" to={item.target === 'home' ? '/' : `/${item.target}`}>{item.label}</Link>
              ) : (
                <button
                  type="button"
                  className="navbar_container_menu_item_links navbar__scroll-btn"
                  onClick={() => handleScroll(item.target)}
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className='nav-icon' onClick={handleToggleIcon}>
            {
                toggleIcon ? <HiX size={40} /> : <FaBars size={40}/>
            }

        </div>
      </nav>
    </div>
  )
}

export default Navbar;