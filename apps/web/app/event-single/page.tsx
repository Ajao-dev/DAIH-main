'use client';

import React from 'react';
import Link from 'next/link';

export default function EventSinglePage() {
  return (
    <>
      <section id="subheader" className="s2">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h2>DAIH Community Event</h2>
              <p className="mb-0">Workshops • Meetups • Masterclasses</p>
            </div>
            <div className="col-md-4">
              <div className="text-md-end">
                <span className="badge bg-color p-2">Date: 15 December 2026</span>
              </div>
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
                <img src="/images/event-details-slider/1.jpg" className="img-fluid rounded" alt="DAIH Event" />
              </div>

              <div className="spacer-single"></div>

              <h3>Event Overview</h3>
              <p>
                Join us at Dare Adeboye Innovation Hub (DAIH) for an engaging session designed to inspire,
                connect, and equip you with practical insights. Expect meaningful conversations, real learning,
                and opportunities to network with professionals, founders, and creatives.
              </p>
              <p className="mb-0">
                <strong>What to expect:</strong> Keynotes, fireside discussions, live Q&amp;A, interactive workshops, and high-value networking.
              </p>

              <div className="spacer-single"></div>

              <h3>Event Location</h3>
              <div className="de-map-wrapper">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31693.13043940911!2d3.4250770906621844!3d6.813409428401215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bcf2e85559e8d%3A0x7283a79ca2ebc02b!2sThe%20Dare%20Adeboye%20Innovation%20Hub%20-%20DAIH!5e0!3m2!1sen!2sng!4v1707407423279!5m2!1sen!2sng"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>

            <div id="sidebar" className="col-lg-4">
              <div className="de-box mb25">
                <div className="sm-icon mb30">
                  <i className="bg-color fa fa-calendar-check-o"></i>
                  <div className="si-inner">
                    <h5 className="event-meta-title">Date &amp; Time</h5>
                    15 December 2026, 10:00 AM
                  </div>
                </div>

                <div className="sm-icon mb30">
                  <i className="bg-color fa fa-map-marker"></i>
                  <div className="si-inner">
                    <h5 className="event-meta-title">Location</h5>
                    Abiona Street By House of Favour, Main Gate, Redemption City, Ogun State
                  </div>
                </div>

                <div className="sm-icon no-bottom">
                  <i className="bg-color fa fa-users"></i>
                  <div className="si-inner">
                    <h5 className="event-meta-title">Capacity</h5>
                    Limited seats available
                  </div>
                </div>
              </div>

              <div className="sidebar_inner">
                <div id="quick_form" className="form-border mb30">
                  <div className="row">
                    <div className="col-md-12">
                      <h3>Join This Event</h3>
                    </div>

                    <div className="col-md-6 mt-3">
                      <input type="text" name="first_name" id="first_name" className="form-control" placeholder="First Name" required />
                    </div>

                    <div className="col-md-6 mt-3">
                      <input type="text" name="last_name" id="last_name" className="form-control" placeholder="Last Name" required />
                    </div>

                    <div className="col-md-12 mt-3">
                      <input type="email" name="work_email" id="work_email" className="form-control" placeholder="Email Address" required />
                    </div>

                    <div className="col-md-12 mt-3">
                      <input type="tel" name="phone" id="phone" className="form-control" placeholder="Phone Number" required />
                    </div>

                    <div className="col-md-12 mt-4">
                      <button type="button" className="btn-main btn-fullwidth text-center">
                        Register for Free Pass
                      </button>
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
