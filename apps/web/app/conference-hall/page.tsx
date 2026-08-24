'use client';

import React from 'react';
import Link from 'next/link';

export default function ConferenceHallPage() {
  return (
    <>
      <section id="subheader" className="s2">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <ul className="crumb">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/our-plans">Our Plans</Link></li>
                <li><Link href="/conference-hall">Conference Hall</Link></li>
              </ul>
              <h2>Conference Hall &amp; Auditorium</h2>
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
                <img src="/images/location-details-slider/1.jpg" className="img-fluid rounded" alt="Conference Hall" />
              </div>

              {/* Real pricing */}
              <div className="de-price">
                Conference Hall pricing:
                <ul className="price-list">
                  <li>Half Day (4 Hours) — ₦200,000</li>
                  <li>Full Day (8 Hours) — ₦350,000</li>
                  <li>Live-Streaming &amp; Tech Bundle — ₦50,000 extra</li>
                </ul>
              </div>

              <div className="spacer-single"></div>

              <h3>Overview</h3>
              <p>
                Our prestigious 250-seat Conference Hall is designed for high-profile tech summits, corporate AGMs, product launches, and hybrid masterclasses.
                Equipped with dual 4K laser projection, broadcast line-array audio, stage lighting, and a live-streaming control booth.
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
                <h3>Venue Amenities</h3>
                <p>Features included with booking:</p>
                <ul className="ul-style-2">
                  <li>Dual 4K laser projectors</li>
                  <li>Wireless handheld &amp; lapel mics</li>
                  <li>Stage lighting &amp; podium</li>
                  <li>Live-stream broadcast setup</li>
                  <li>Dedicated AV technician on duty</li>
                  <li>VIP Green Room</li>
                </ul>
              </div>

              <div className="spacer-single"></div>

              <div className="sidebar_inner">
                <div id="quick_form" className="form-border mb30">
                  <div className="row">
                    <div className="col-md-12">
                      <h3>Reserve Conference Hall</h3>
                      <select className="form-control" name="select_plan" id="select_plan" defaultValue="">
                        <option value="">Select Duration</option>
                        <option value="half-day">Half Day (4h) — ₦200,000</option>
                        <option value="full-day">Full Day (8h) — ₦350,000</option>
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
                      <a href="http://localhost:3001/book/conference-hall" className="btn-main btn-fullwidth text-center">
                        Proceed to Reservation
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
