'use client';

import React from 'react';
import Link from 'next/link';

export default function DedicatedDeskPage() {
  return (
    <>
      <section id="subheader" className="s2">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <ul className="crumb">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/our-plans">Our Plans</Link></li>
                <li><Link href="/dedicated-desk">Dedicated Desk</Link></li>
              </ul>
              <h2>Dedicated Desk</h2>
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
                <img src="/images/location-details-slider/1.jpg" className="img-fluid rounded" alt="Dedicated Desk" />
              </div>

              {/* Real pricing */}
              <div className="de-price">
                Dedicated Desk pricing:
                <ul className="price-list">
                  <li>Daily — ₦4,000</li>
                  <li>Weekly — ₦20,000</li>
                  <li>Monthly — ₦68,000</li>
                  <li>10-Day Flex Plan — ₦30,000 <small>(within a 15-day timeframe)</small></li>
                  <li>6 Months — ₦380,000</li>
                  <li>Monthly Plan (without internet) — ₦55,000</li>
                </ul>
              </div>

              <div className="spacer-single"></div>

              <h3>Overview</h3>
              <p>
                Enjoy a personalized workspace within our vibrant coworking community. Ideal for freelancers,
                entrepreneurs, and teams seeking focus and collaboration.
              </p>
              <p>
                Our Dedicated Desk program offers the perfect blend of customization and community.
                Tailor your workspace to your style (within specific boundaries) while enjoying shared amenities
                and networking opportunities.
              </p>
              <p>
                Fuel your productivity and spark creativity in a collaborative atmosphere that fosters connections
                and inspires new ideas.
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

              <div className="spacer-double"></div>

              <h3>Ratings &amp; Reviews</h3>
              <ul className="de-review-list">
                <li>
                  <h5>Excellent coworking place</h5>
                  <div className="p-rating">
                    <i className="fa fa-star checked"></i><i className="fa fa-star checked"></i>
                    <i className="fa fa-star checked"></i><i className="fa fa-star checked"></i>
                    <i className="fa fa-star checked"></i>
                  </div>
                  <p className="d-testi">It's exactly what I've been looking for. DAIH impressed me on multiple levels.</p>
                  <div className="d-user">By: Janice Mojica</div>
                </li>
              </ul>
            </div>

            <div id="sidebar" className="col-lg-4">
              <div className="de-box de-location-address">
                <h3>What’s Included</h3>
                <p>Everything you need for a productive workday:</p>
                <ul className="ul-style-2">
                  <li>Ergonomic furniture</li>
                  <li>High-speed internet</li>
                  <li>24/7 power supply</li>
                  <li>Packing space</li>
                  <li>Call and deal room</li>
                  <li>24-hour security</li>
                  <li>CCTV</li>
                  <li>Water</li>
                </ul>
              </div>

              <div className="spacer-single"></div>

              <div className="sidebar_inner">
                <div id="quick_form" className="form-border mb30">
                  <div className="row">
                    <div className="col-md-12">
                      <h3>Book Your Space Now</h3>
                      <select className="form-control" name="select_plan" id="select_plan" defaultValue="">
                        <option value="">Pick an option</option>
                        <option value="daily">Daily — ₦4,000</option>
                        <option value="weekly">Weekly — ₦20,000</option>
                        <option value="monthly">Monthly — ₦68,000</option>
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
                      <a href="http://localhost:3001/book/dedicated-desk" className="btn-main btn-fullwidth text-center">
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
