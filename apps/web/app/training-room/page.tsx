'use client';

import React from 'react';
import Link from 'next/link';

export default function TrainingRoomPage() {
  return (
    <>
      <section id="subheader" className="s2">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <ul className="crumb">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/our-plans">Our Plans</Link></li>
                <li><Link href="/training-room">Training Room</Link></li>
              </ul>
              <h2>Training &amp; Workshop Room</h2>
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
                <img src="/images/location-details-slider/2.jpg" className="img-fluid rounded" alt="Training Room" />
              </div>

              {/* Real pricing */}
              <div className="de-price">
                Training Room pricing:
                <ul className="price-list">
                  <li>Hourly Rate — ₦25,000 / Hour</li>
                  <li>Full Day (8 Hours) — ₦150,000 / Day</li>
                  <li>Weekly Bootcamp Package — ₦650,000 / Week</li>
                </ul>
              </div>

              <div className="spacer-single"></div>

              <h3>Overview</h3>
              <p>
                Our modular classroom-style Training Room accommodates up to 40 participants with high-density power sockets, interactive smart whiteboard, and gigabit lab internet for coding bootcamps, workshops, and corporate training.
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
                <h3>Included Facilities</h3>
                <p>Equipped for learning:</p>
                <ul className="ul-style-2">
                  <li>Interactive smart touchscreen</li>
                  <li>Modular movable desks</li>
                  <li>High-speed training WiFi</li>
                  <li>Whiteboard walls &amp; markers</li>
                  <li>Coffee &amp; water dispenser</li>
                  <li>Air conditioning &amp; 24/7 power</li>
                </ul>
              </div>

              <div className="spacer-single"></div>

              <div className="sidebar_inner">
                <div id="quick_form" className="form-border mb30">
                  <div className="row">
                    <div className="col-md-12">
                      <h3>Reserve Training Room</h3>
                      <select className="form-control" name="select_plan" id="select_plan" defaultValue="">
                        <option value="">Select Plan</option>
                        <option value="hourly">Hourly — ₦25,000/hr</option>
                        <option value="daily">Full Day — ₦150,000/day</option>
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
                      <a href="http://localhost:3001/book/training-room" className="btn-main btn-fullwidth text-center">
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
