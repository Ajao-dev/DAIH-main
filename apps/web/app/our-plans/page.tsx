'use client';

import React from 'react';
import Link from 'next/link';

export default function OurPlansPage() {
  return (
    <>
      {/* section begin */}
      <section
        id="subheader"
        className="text-light"
        style={{
          backgroundImage: 'url(/images/background/subheader-2.jpg)',
          backgroundPosition: 'top',
          backgroundSize: 'cover',
        }}
      >
        <div className="center-y relative text-center">
          <div className="container">
            <div className="row">
              <div className="col-md-12 text-center">
                <h1>Spaces Available</h1>
              </div>
              <div className="clearfix"></div>
            </div>
          </div>
        </div>
      </section>
      {/* section close */}

      {/* section begin */}
      <section id="section-result" className="pt50 pb50">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h4>Showing 6 Spaces Available</h4>
              <div className="spacer-40"></div>
            </div>

            {/* Dedicated Desk */}
            <div className="col-lg-4 col-md-6 mb25">
              <Link href="/dedicated-desk" className="de-card s2">
                <div className="de-image">
                  <img src="/images/search/1.jpg" className="img-fluid" alt="Dedicated Desk" />
                </div>
                <div className="text">
                  <h4>Dedicated Desk</h4>
                  <div className="de-rating">
                    <div className="p-rating">
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star"></i>
                      <span>(22)</span>
                    </div>
                  </div>
                  <ul className="ul-style-3">
                    <li>Reliable power supply</li>
                    <li>High-speed internet</li>
                    <li>Personal workspace</li>
                    <li>Secure storage/locker</li>
                    <li>Daily cleaning</li>
                    <li>Water (hot &amp; cold)</li>
                    <li>Tea &amp; coffee (where available)</li>
                  </ul>
                  <div className="d-price">
                    <div>Starting from</div>
                    <span>₦3,900 / Day</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Hot Desk */}
            <div className="col-lg-4 col-md-6 mb25">
              <Link href="/hot-desk" className="de-card s2">
                <div className="de-image">
                  <img src="/images/search/2.jpg" className="img-fluid" alt="Hot Desk" />
                </div>
                <div className="text">
                  <h4>Hot Desk</h4>
                  <div className="de-rating">
                    <div className="p-rating">
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star"></i>
                      <span>(22)</span>
                    </div>
                  </div>
                  <ul className="ul-style-3">
                    <li>Reliable power supply</li>
                    <li>High-speed internet</li>
                    <li>Shared workspace seating</li>
                    <li>Access to communal areas</li>
                    <li>Daily cleaning</li>
                    <li>Water (hot &amp; cold)</li>
                    <li>Networking-friendly environment</li>
                  </ul>
                  <div className="d-price">
                    <div>Starting from</div>
                    <span>₦16,900 / Day</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Office Suite */}
            <div className="col-lg-4 col-md-6 mb25">
              <Link href="/office-suite" className="de-card s2">
                <div className="de-image">
                  <img src="/images/search/3.jpg" className="img-fluid" alt="Office Suite" />
                </div>
                <div className="text">
                  <h4>Office Suite</h4>
                  <div className="de-rating">
                    <div className="p-rating">
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star"></i>
                      <span>(22)</span>
                    </div>
                  </div>
                  <ul className="ul-style-3">
                    <li>Private workspace</li>
                    <li>Reliable power supply</li>
                    <li>High-speed internet</li>
                    <li>Comfort &amp; privacy for calls</li>
                    <li>Access to shared spaces</li>
                    <li>Daily cleaning</li>
                    <li>Professional environment</li>
                  </ul>
                  <div className="d-price">
                    <div>Starting from</div>
                    <span>₦32,900 / Day</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Conference Hall */}
            <div className="col-lg-4 col-md-6 mb25">
              <Link href="/conference-hall" className="de-card s2">
                <div className="de-image">
                  <img src="/images/search/4.jpg" className="img-fluid" alt="Conference Hall" />
                </div>
                <div className="text">
                  <h4>Meeting/Conference Hall</h4>
                  <div className="de-rating">
                    <div className="p-rating">
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star"></i>
                      <span>(22)</span>
                    </div>
                  </div>
                  <ul className="ul-style-3">
                    <li>Presentation setup (on request)</li>
                    <li>Reliable power supply</li>
                    <li>High-speed internet</li>
                    <li>Comfortable seating</li>
                    <li>Great for meetings &amp; events</li>
                    <li>Support staff (where available)</li>
                    <li>Water (hot &amp; cold)</li>
                  </ul>
                  <div className="d-price">
                    <div>Starting from</div>
                    <span>₦32,900 / Day</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Training Room */}
            <div className="col-lg-4 col-md-6 mb25">
              <Link href="/training-room" className="de-card s2">
                <div className="de-image">
                  <img src="/images/search/5.jpg" className="img-fluid" alt="Training Room" />
                </div>
                <div className="text">
                  <h4>Training Room</h4>
                  <div className="de-rating">
                    <div className="p-rating">
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star checked"></i>
                      <i className="fa fa-star"></i>
                      <span>(22)</span>
                    </div>
                  </div>
                  <ul className="ul-style-3">
                    <li>Classroom-style setup</li>
                    <li>Reliable power supply</li>
                    <li>High-speed internet</li>
                    <li>Ideal for workshops</li>
                    <li>Whiteboard/projector (on request)</li>
                    <li>Daily cleaning</li>
                    <li>Water (hot &amp; cold)</li>
                  </ul>
                  <div className="d-price">
                    <div>Starting from</div>
                    <span>₦32,900 / Day</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Coming soon */}
            <div className="col-lg-4 col-md-6 mb25">
              <div className="de-card s2">
                <div className="de-image">
                  <img src="/images/search/6.jpg" className="img-fluid" alt="Lounge and Studio Coming Soon" />
                </div>
                <div className="text">
                  <h4>Lounge &amp; Studio (Coming Soon)</h4>
                  <div className="de-rating">
                    <div className="p-rating">
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <span>(0)</span>
                    </div>
                  </div>
                  <ul className="ul-style-3">
                    <li>Creative &amp; relaxed setup</li>
                    <li>Internet access</li>
                    <li>Content creation friendly</li>
                    <li>Great for networking</li>
                    <li>More details soon</li>
                  </ul>
                  <div className="d-price">
                    <div>Launching soon</div>
                    <span>Stay tuned</span>
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
