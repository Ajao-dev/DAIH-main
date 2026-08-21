'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export const Header: React.FC<{ isTransparent?: boolean }> = ({ isTransparent = true }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className={isTransparent ? 'transparent scroll-light' : 'header-light scroll-light'}>
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="de-flex sm-pt10">
              <div className="de-flex-col">
                <div className="de-flex-col">
                  {/* logo begin */}
                  <div id="logo">
                    <Link href="/">
                      <img alt="DAIH logo" className="logo" src="/images/logo-light.png" />
                      <img alt="DAIH logo" className="logo-2" src="/images/logo.png" />
                    </Link>
                  </div>
                  {/* logo close */}
                </div>
                <div className="de-flex-col"></div>
              </div>

              <div className="de-flex-col header-col-mid">
                {/* mainmenu begin */}
                <ul id="mainmenu" className={mobileOpen ? 'open' : ''}>
                  <li>
                    <Link href="/">Home<span></span></Link>
                  </li>
                  <li>
                    <a href="/our-plans">Our Plans<span></span></a>
                    <ul>
                      <li><Link href="/dedicated-desk">Dedicated Desk</Link></li>
                      <li><Link href="/hot-desk">Hot Desk</Link></li>
                      <li><Link href="/office-suite">Office Suite</Link></li>
                      <li><Link href="/conference-hall">Conference Hall</Link></li>
                      <li><Link href="/training-room">Training Room</Link></li>
                      <li><a href="#">Lounge (Coming Soon)</a></li>
                      <li><a href="#">Studio (Coming Soon)</a></li>
                    </ul>
                  </li>
                  <li>
                    <a href="#">DAIH<span></span></a>
                    <ul>
                      <li><Link href="/about-us">About Us</Link></li>
                      <li><Link href="/news">News</Link></li>
                      <li><Link href="/jobs">Jobs</Link></li>
                      <li><Link href="/contact">Contact</Link></li>
                    </ul>
                  </li>
                  <li>
                    <Link href="/events">Events<span></span></Link>
                  </li>
                  <li>
                    <Link href="/gallery">Gallery<span></span></Link>
                  </li>
                </ul>
              </div>

              <div className="de-flex-col">
                <div className="menu_side_area">
                  <Link href="/our-plans" className="btn-main">
                    <i className="fa fa-calendar mr-2"></i><span>Book A Space</span>
                  </Link>
                  <span
                    id="menu-btn"
                    onClick={() => setMobileOpen(!mobileOpen)}
                  ></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
