"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPortalBookingUrl } from "../lib/config";

export const Header: React.FC<{ isTransparent?: boolean }> = ({
  isTransparent = true,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";
  const shouldBeTransparent = mounted
    ? isTransparent && isHome
    : isTransparent && (!pathname || pathname === "/");

  const closeMenu = () => setMobileOpen(false);

  return (
    <header
      suppressHydrationWarning
      className={`${
        shouldBeTransparent
          ? "transparent scroll-light"
          : "header-light scroll-light"
      } ${mobileOpen ? "mobile-menu-active" : ""}`}
    >
      <div className="container" suppressHydrationWarning>
        <div className="row" suppressHydrationWarning>
          <div className="col-md-12" suppressHydrationWarning>
            <div className="de-flex sm-pt10" suppressHydrationWarning>
              <div className="de-flex-col" suppressHydrationWarning>
                <div className="de-flex-col" suppressHydrationWarning>
                  {/* logo begin */}
                  <div
                    id="logo"
                    suppressHydrationWarning
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <Link
                      href="/"
                      onClick={closeMenu}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        textDecoration: "none",
                      }}
                    >
                      <img
                        alt="DAIH logo"
                        className="logo"
                        src="/images/logo-light.png"
                        style={{
                          height: "36px",
                          maxHeight: "36px",
                          width: "auto",
                          objectFit: "contain",
                        }}
                      />
                      <img
                        alt="DAIH logo"
                        className="logo-2"
                        src="/images/logo.png"
                        style={{
                          height: "36px",
                          maxHeight: "36px",
                          width: "auto",
                          objectFit: "contain",
                        }}
                      />
                    </Link>
                  </div>
                  {/* logo close */}
                </div>
                <div className="de-flex-col"></div>
              </div>

              <div
                className="de-flex-col header-col-mid"
                suppressHydrationWarning
              >
                {/* mainmenu begin */}
                <ul
                  id="mainmenu"
                  suppressHydrationWarning
                  className={mobileOpen ? "open" : ""}
                >
                  <li>
                    <Link href="/" onClick={closeMenu}>
                      Home<span></span>
                    </Link>
                  </li>
                  <li>
                    <a href="/our-plans">
                      Our Plans<span></span>
                    </a>
                    <ul>
                      <li>
                        <Link href="/dedicated-desk" onClick={closeMenu}>
                          Dedicated Desk
                        </Link>
                      </li>
                      <li>
                        <Link href="/hot-desk" onClick={closeMenu}>
                          Hot Desk
                        </Link>
                      </li>
                      <li>
                        <Link href="/office-suite" onClick={closeMenu}>
                          Office Suite
                        </Link>
                      </li>
                      <li>
                        <Link href="/conference-hall" onClick={closeMenu}>
                          Conference Hall
                        </Link>
                      </li>
                      <li>
                        <Link href="/training-room" onClick={closeMenu}>
                          Training Room
                        </Link>
                      </li>
                      <li>
                        <a href="#" onClick={closeMenu}>
                          Lounge (Coming Soon)
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={closeMenu}>
                          Studio (Coming Soon)
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="#">
                      DAIH<span></span>
                    </a>
                    <ul>
                      <li>
                        <Link href="/about-us" onClick={closeMenu}>
                          About Us
                        </Link>
                      </li>
                      <li>
                        <Link href="/news" onClick={closeMenu}>
                          News
                        </Link>
                      </li>
                      <li>
                        <Link href="/jobs" onClick={closeMenu}>
                          Jobs
                        </Link>
                      </li>
                      <li>
                        <Link href="/contact" onClick={closeMenu}>
                          Contact
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <Link href="/events" onClick={closeMenu}>
                      Events<span></span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/gallery" onClick={closeMenu}>
                      Gallery<span></span>
                    </Link>
                  </li>

                  {/* Prominent Book A Space CTA inside mobile menu */}
                  <li className="mobile-menu-cta">
                    <a
                      href={getPortalBookingUrl()}
                      className="btn-main"
                      onClick={closeMenu}
                    >
                      <i className="fa fa-calendar mr-2"></i>
                      <span>Book A Space</span>
                    </a>
                  </li>
                </ul>
              </div>

              <div className="de-flex-col" suppressHydrationWarning>
                <div className="menu_side_area" suppressHydrationWarning>
                  <a
                    href={getPortalBookingUrl()}
                    className="btn-main header-book-btn"
                  >
                    <i className="fa fa-calendar mr-2"></i>
                    <span>Book A Space</span>
                  </a>
                  <span
                    id="menu-btn"
                    className={mobileOpen ? "open" : ""}
                    aria-label="Toggle menu"
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
