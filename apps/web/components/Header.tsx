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

  const isHome = pathname === "/";
  const shouldBeTransparent = mounted
    ? isTransparent && isHome
    : isTransparent && (!pathname || pathname === "/");

  return (
    <header
      suppressHydrationWarning
      className={
        shouldBeTransparent
          ? "transparent scroll-light"
          : "header-light scroll-light"
      }
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
                    <Link href="/">
                      Home<span></span>
                    </Link>
                  </li>
                  <li>
                    <a href="/our-plans">
                      Our Plans<span></span>
                    </a>
                    <ul>
                      <li>
                        <Link href="/dedicated-desk">Dedicated Desk</Link>
                      </li>
                      <li>
                        <Link href="/hot-desk">Hot Desk</Link>
                      </li>
                      <li>
                        <Link href="/office-suite">Office Suite</Link>
                      </li>
                      <li>
                        <Link href="/conference-hall">Conference Hall</Link>
                      </li>
                      <li>
                        <Link href="/training-room">Training Room</Link>
                      </li>
                      <li>
                        <a href="#">Lounge (Coming Soon)</a>
                      </li>
                      <li>
                        <a href="#">Studio (Coming Soon)</a>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="#">
                      DAIH<span></span>
                    </a>
                    <ul>
                      <li>
                        <Link href="/about-us">About Us</Link>
                      </li>
                      <li>
                        <Link href="/news">News</Link>
                      </li>
                      <li>
                        <Link href="/jobs">Jobs</Link>
                      </li>
                      <li>
                        <Link href="/contact">Contact</Link>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <Link href="/events">
                      Events<span></span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/gallery">
                      Gallery<span></span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="de-flex-col" suppressHydrationWarning>
                <div className="menu_side_area" suppressHydrationWarning>
                  <a href={getPortalBookingUrl()} className="btn-main">
                    <i className="fa fa-calendar mr-2"></i>
                    <span>Book A Space</span>
                  </a>
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
