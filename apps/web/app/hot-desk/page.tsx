'use client';

import React from 'react';
import Link from 'next/link';

export default function HotDeskPage() {
  return (
    <>
      <section id="subheader" className="s2">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <ul className="crumb">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/our-plans">Our Plans</Link></li>
                <li><Link href="/hot-desk">Hot Desk</Link></li>
              </ul>
              <h2>Hot Desk</h2>
            </div>
            <div className="clearfix"></div>
          </div>
        </div>
      </section>

      <section aria-label="section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div id="slider-carousel" className="mb30">
                <img src="/images/location-details-slider/2.jpg" className="img-fluid rounded" alt="Hot Desk" />
              </div>

              {/* Real pricing */}
              <div className="de-price">
                Hot Desk pricing:
                <ul className="price-list">
                  <li>Daily — ₦3,000</li>
                  <li>Weekly — ₦14,000</li>
                  <li>Monthly — ₦45,000</li>
                  <li>Monthly (without internet) — ₦35,000</li>
                  <li>Night Plan (11 PM - 6 AM) — ₦3,500/night</li>
                </ul>
              </div>

              <div className="spacer-single"></div>

              <h3>Overview</h3>
              <p>
                A flexible workspace solution for remote professionals, nomadic freelancers, and creators.
                Grab any available open desk, plug into ultra-fast internet, and start working immediately in an energizing collaborative atmosphere.
              </p>

              <div className="spacer-single"></div>

              <h3>Location on Maps</h3>
              <div className="de-map-wrapper">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31693.13043940911!2d3.4250770906621844!3d6.813409428401215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bcf2e85559e8d%3A0x7283a79ca2ebc02b!2sThe%20Dare%20Adeboye%20Innovation%20Hub%20-%20DAIH!5e0!3m2!1sen!2sng!4v1707407423279!5m2!1sen!2sng"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>

            <div id="sidebar" className="col-lg-4">
              <div className="de-box de-location-address">
                <h3>What’s Included</h3>
                <p>Everything you need for a flexible workday:</p>
                <ul className="ul-style-2">
                  <li>Ergonomic chair and desk</li>
                  <li>High-speed fiber WiFi</li>
                  <li>24/7 power backup</li>
                  <li>Access to lounge & coffee</li>
                  <li>24-hour security & CCTV</li>
                  <li>Water (hot & cold)</li>
                </ul>
              </div>

              <div className="spacer-single"></div>

              <div className="sidebar_inner">
                <div id="quick_form" className="form-border mb30">
                  <div className="row">
                    <div className="col-md-12">
                      <h3>Book Your Hot Desk</h3>
                      <select className="form-control" name="select_plan" id="select_plan" defaultValue="">
                        <option value="">Pick an option</option>
                        <option value="daily">Daily — ₦3,000</option>
                        <option value="weekly">Weekly — ₦14,000</option>
                        <option value="monthly">Monthly — ₦45,000</option>
                      </select>
                    </div>

                    <div className="col-md-6 mt-3">
                      <input type="text" name="first_name" id="first_name" className="form-control" placeholder="First Name" required />
                    </div>

                    <div className="col-md-6 mt-3">
                      <input type="text" name="last_name" id="last_name" className="form-control" placeholder="Last Name" required />
                    </div>

                    <div className="col-md-12 mt-3">
                      <input type="email" name="email" id="email" className="form-control" placeholder="Your Email" required />
                    </div>

                    <div className="col-md-12 mt-3">
                      <input type="tel" name="phone" id="phone" className="form-control" placeholder="Your Phone" required />
                    </div>

                    <div className="col-md-12 mt-4">
                      <a href="http://localhost:3001/book/hot-desk" className="btn-main btn-fullwidth text-center">
                        Proceed to Instant Booking
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
