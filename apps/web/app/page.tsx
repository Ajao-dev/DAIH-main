'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [isMonthly, setIsMonthly] = useState(false);

  return (
    <>
      {/* Carousel wrapper */}
      <section id="de-carousel" className="no-top no-bottom carousel slide carousel-fade shadow-2-strong" data-mdb-ride="carousel">
        {/* Indicators */}
        <ol className="carousel-indicators">
          <li data-mdb-target="#de-carousel" data-mdb-slide-to="0" className="active"></li>
          <li data-mdb-target="#de-carousel" data-mdb-slide-to="1"></li>
          <li data-mdb-target="#de-carousel" data-mdb-slide-to="2"></li>
        </ol>

        {/* Inner */}
        <div className="carousel-inner">
          {/* Single item 1 */}
          <div
            className="carousel-item active"
            style={{
              backgroundImage: 'url(/images/slider/1.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="mask">
              <div className="d-flex justify-content-center align-items-center h-100">
                <div className="container text-white text-center">
                  <div className="row">
                    <div className="col-md-6 offset-md-3">
                      <h1 className="mb-3 wow fadeInUp">Work. Meet. Create. Grow.</h1>
                      <p className="lead wow fadeInUp" data-wow-delay=".3s">
                        Welcome to Dare Adeboye Innovation Hub (DAIH) — flexible workspaces designed for focus,
                        collaboration, and productivity in Redemption City, Ogun State.
                      </p>
                      <div className="spacer-10"></div>
                      <Link href="/our-plans" className="btn-main wow fadeInUp" data-wow-delay=".6s">
                        View Our Plans
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Single item 2 */}
          <div
            className="carousel-item"
            style={{
              backgroundImage: 'url(/images/slider/2.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="mask">
              <div className="d-flex justify-content-center align-items-center h-100">
                <div className="container text-white text-center">
                  <div className="row">
                    <div className="col-md-6 offset-md-3">
                      <h1 className="mb-3 wow fadeInUp">Modern &amp; comfortable spaces to work</h1>
                      <p className="lead wow fadeInUp" data-wow-delay=".3s">
                        Enjoy ergonomic furniture, serene common areas, and reliable facilities that keep you comfortable
                        and productive throughout the day.
                      </p>
                      <div className="spacer-10"></div>
                      <Link href="/our-plans" className="btn-main wow fadeInUp" data-wow-delay=".6s">
                        View Our Plans
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Single item 3 */}
          <div
            className="carousel-item"
            style={{
              backgroundImage: 'url(/images/slider/3.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="mask">
              <div className="d-flex justify-content-center align-items-center h-100">
                <div className="container text-white text-center">
                  <div className="row">
                    <div className="col-md-6 offset-md-3">
                      <h1 className="mb-3 wow fadeInUp">A workspace for every need</h1>
                      <p className="lead wow fadeInUp" data-wow-delay=".3s">
                        From hot desks and dedicated desks to private offices, conference rooms, and training rooms —
                        choose what fits your work style.
                      </p>
                      <div className="spacer-10"></div>
                      <Link href="/our-plans" className="btn-main wow fadeInUp" data-wow-delay=".6s">
                        View Our Plans
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <a className="carousel-control-prev" href="#de-carousel" role="button" data-mdb-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="sr-only">Previous</span>
        </a>
        <a className="carousel-control-next" href="#de-carousel" role="button" data-mdb-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="sr-only">Next</span>
        </a>
      </section>

      {/* Pricing Section */}
      <section id="section-pricing">
        <div className="container">
          <div className="row">
            <div className="col-md-6 offset-md-3">
              <div className="text-center">
                <h2>Select Your Plan</h2>
                <p className="mt10 mb0">Pick a space that fits your work style — and scale as you grow.</p>
                <div className="spacer-20"></div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col text-center">
              <div className="switch-set">
                <div>Daily</div>
                <div>
                  <input
                    id="sw-1"
                    className="switch"
                    type="checkbox"
                    checked={isMonthly}
                    onChange={(e) => setIsMonthly(e.target.checked)}
                  />
                </div>
                <div>Monthly</div>
                <div className="spacer-20"></div>
              </div>
            </div>
          </div>

          <div className="item pricing">
            <div className="container">
              <div className="row">
                {/* Office Suite */}
                <div className="col-lg-4 col-md-6 col-sm-12">
                  <div className="pricing-s1 mb30">
                    <div className="top">
                      <h2>Office Suite</h2>
                      <p className="plan-tagline">Best for privacy &amp; professional image</p>
                    </div>
                    <div className="mid bg-color-secondary text-light">
                      <p className="price">
                        <span className="currency">₦</span>
                        <span className="m opt-1">{isMonthly ? '350,000' : '15,000'}</span>
                        <span className="month">{isMonthly ? '/month' : '/day'}</span>
                      </p>
                    </div>

                    <div className="bottom">
                      <ul>
                        <li><i className="fa fa-check"></i>Private, professional workspace</li>
                        <li><i className="fa fa-check"></i>High-speed internet</li>
                        <li><i className="fa fa-check"></i>24/7 power supply</li>
                        <li><i className="fa fa-check"></i>Secure access (CCTV &amp; 24/7 security)</li>
                        <li><i className="fa fa-check"></i>Access to common areas</li>
                        <li><i className="fa fa-check"></i>On-site support</li>
                      </ul>
                    </div>

                    <div className="action">
                      <Link href="/office-suite" className="btn-main">Book Now</Link>
                    </div>
                  </div>
                </div>

                {/* Hot Desk */}
                <div className="col-lg-4 col-md-6 col-sm-12">
                  <div className="pricing-s1 mb30">
                    <div className="top">
                      <h2>Hot Desk</h2>
                      <p className="plan-tagline">Best for flexibility &amp; daily focus</p>
                    </div>

                    <div className="mid bg-color-secondary text-light">
                      <p className="price">
                        <span className="currency">₦</span>
                        <span className="m opt-1">{isMonthly ? '45,000' : '3,000'}</span>
                        <span className="month">{isMonthly ? '/month' : '/day'}</span>
                      </p>
                    </div>

                    <div className="bottom">
                      <ul>
                        <li><i className="fa fa-check"></i>Choose your seat daily</li>
                        <li><i className="fa fa-check"></i>High-speed internet</li>
                        <li><i className="fa fa-check"></i>Ergonomic furniture</li>
                        <li><i className="fa fa-check"></i>24/7 power supply</li>
                        <li><i className="fa fa-check"></i>Secure environment (CCTV)</li>
                        <li><i className="fa fa-check"></i>Water available</li>
                      </ul>
                    </div>

                    <div className="action">
                      <Link href="/hot-desk" className="btn-main">Book Now</Link>
                    </div>
                  </div>
                </div>

                {/* Dedicated Desk */}
                <div className="col-lg-4 col-md-6 col-sm-12">
                  <div className="pricing-s1 mb30">
                    <div className="top">
                      <h2>Dedicated Desk</h2>
                      <p className="plan-tagline">Best for consistency &amp; productivity</p>
                    </div>

                    <div className="mid bg-color-secondary text-light">
                      <p className="price">
                        <span className="currency">₦</span>
                        <span className="m opt-1">{isMonthly ? '75,000' : '5,000'}</span>
                        <span className="month">{isMonthly ? '/month' : '/day'}</span>
                      </p>
                    </div>

                    <div className="bottom">
                      <ul>
                        <li><i className="fa fa-check"></i>Your reserved desk</li>
                        <li><i className="fa fa-check"></i>High-speed internet</li>
                        <li><i className="fa fa-check"></i>Ergonomic furniture</li>
                        <li><i className="fa fa-check"></i>24/7 power supply</li>
                        <li><i className="fa fa-check"></i>Call &amp; Deal room access</li>
                        <li><i className="fa fa-check"></i>Secure access (CCTV &amp; 24/7 security)</li>
                      </ul>
                    </div>

                    <div className="action">
                      <Link href="/dedicated-desk" className="btn-main">Book Now</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-center align-items-center h-100 mt-4">
          <div className="container text-white text-center">
            <div className="row">
              <div className="col-md-6 offset-md-3">
                <h1 className="mb-3 wow fadeInUp">DAIH</h1>
                <Link href="/our-plans" className="btn-main wow fadeInUp" data-wow-delay=".6s">
                  View All
                </Link>
                <div className="spacer-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="section-why-choose-us" className="pt60 pb60">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-12">
              <div className="text-center">
                <h2>Why Choose Us?</h2>
                <div className="small-border bg-color"></div>
                <p className="mt10 mb0">
                  Everything you need to work, meet, train, and grow — in one inspiring hub.
                </p>
              </div>
            </div>

            <div className="col-md-6 why-media">
              <img src="/images/misc/images-set-2.png" className="lazy img-fluid" alt="DAIH workspaces" />
            </div>

            <div className="col-md-6">
              <div className="row g-4 align-items-stretch">
                <div className="col-12 col-lg-6 d-flex">
                  <div className="w-100">
                    <h4>Flexible Workspaces</h4>
                    <p>Choose from hot desks to dedicated desks, private offices, conference rooms, or training halls — find the workspace that perfectly suits your needs.</p>
                  </div>
                </div>

                <div className="col-12 col-lg-6 d-flex">
                  <div className="w-100">
                    <h4>High-Speed Connectivity</h4>
                    <p>Our state-of-the-art infrastructure ensures seamless, reliable internet connectivity to keep you productive and connected.</p>
                  </div>
                </div>

                <div className="col-12 col-lg-6 d-flex">
                  <div className="w-100">
                    <h4>Productivity &amp; Comfort</h4>
                    <p>Inspiring private spaces, serene common areas, and modern training rooms — ergonomically designed to support focus and well-being.</p>
                  </div>
                </div>

                <div className="col-12 col-lg-6 d-flex">
                  <div className="w-100">
                    <h4>24/7 Power Supply</h4>
                    <p>Work whenever inspiration hits — with reliable power available around the clock.</p>
                  </div>
                </div>

                <div className="col-12">
                  <h4>Collaborative Environment</h4>
                  <p className="mb-0">Communal areas and conference rooms make it easy to brainstorm, host team meetings, and network with other professionals.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section id="section-video">
        <div className="container">
          <div className="row align-items-center">
            <div className="de-map-wrapper">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/yT53yVmCLzU?si=03Z58vEb__U_dBPg"
                title="DAIH video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Space Type Section */}
      <section id="section-studio-type">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-12">
              <div className="text-center">
                <h2>Space Type</h2>
                <div className="small-border bg-color-2"></div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="de-image-text">
                <a href="#" className="d-text">
                  <h3><span className="id-color">01</span> Podcast</h3>
                  <p>Record with clarity in a focused space designed for great audio and smooth sessions.</p>
                </a>
                <img src="/images/misc/space-type-podcast.jpg" className="img-fluid" alt="Podcast space" />
              </div>
            </div>

            <div className="col-md-4">
              <div className="de-image-text">
                <a href="#" className="d-text">
                  <h3><span className="id-color">02</span> Live Streaming</h3>
                  <p>Stream confidently with reliable power and a professional environment.</p>
                </a>
                <img src="/images/misc/space-type-streaming.jpg" className="img-fluid" alt="Live streaming space" />
              </div>
            </div>

            <div className="col-md-4">
              <div className="de-image-text">
                <a href="#" className="d-text">
                  <h3><span className="id-color">03</span> Photo &amp; Video Shoot</h3>
                  <p>Create standout content with a clean setup that supports your production needs.</p>
                </a>
                <img src="/images/misc/space-type-photo.jpg" className="img-fluid" alt="Photo and video space" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="section-location">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-12">
              <div className="text-center">
                <h2>Location on Maps</h2>
                <div className="small-border bg-color"></div>
              </div>
            </div>

            <div className="de-map-wrapper">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31693.13043940911!2d3.4250770906621844!3d6.813409428401215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bcf2e85559e8d%3A0x7283a79ca2ebc02b!2sThe%20Dare%20Adeboye%20Innovation%20Hub%20-%20DAIH!5e0!3m2!1sen!2sng!4v1707407423279!5m2!1sen!2sng"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
