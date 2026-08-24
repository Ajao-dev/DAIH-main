"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@daih/api-client";
import { FacilityResource } from "@daih/types";
import { Loader2, CheckCircle2, MapPin, Users, ArrowRight } from "lucide-react";

function getWorkspaceImage(slug: string, imageUrl?: string | null): string {
  if (
    imageUrl &&
    (imageUrl.startsWith("http") || imageUrl.startsWith("/images/"))
  ) {
    return imageUrl;
  }
  const s = (slug || "").toLowerCase();
  if (s.includes("studio") || s.includes("audio") || s.includes("stream"))
    return "/images/search/4.jpg";
  if (s.includes("rooftop")) return "/images/search/6.jpg";
  if (s.includes("training") || s.includes("meeting"))
    return "/images/search/5.jpg";
  if (s.includes("office") || s.includes("private"))
    return "/images/search/3.jpg";
  if (s.includes("dedicated")) return "/images/search/1.jpg";
  return "/images/search/2.jpg";
}

function getDurationLabel(plan: any): string {
  if (plan.durationMonths)
    return plan.durationMonths === 1
      ? "/ Month"
      : `/${plan.durationMonths} Months`;
  if (plan.durationDays)
    return plan.durationDays === 1 ? "/ Day" : `/${plan.durationDays} Days`;
  if (plan.durationHours)
    return plan.durationHours === 1 ? "/ Hour" : `/${plan.durationHours} Hours`;
  return "";
}

interface WorkspaceDetailViewProps {
  slug: string;
}

export const WorkspaceDetailView: React.FC<WorkspaceDetailViewProps> = ({
  slug,
}) => {
  const [resource, setResource] = useState<FacilityResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.catalogue
      .getResourceBySlug(slug)
      .then((data) => {
        if (data) {
          setResource(data);
        } else {
          setError(`Workspace '${slug}' not found.`);
        }
      })
      .catch((err) => {
        setError(
          err?.message || "Failed to load workspace details from database.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="d-flex justify-content-center align-items-center mb-3">
          <Loader2
            className="animate-spin text-primary"
            style={{ width: "40px", height: "40px" }}
          />
        </div>
        <p className="text-muted">
          Loading live workspace details from database...
        </p>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning my-5">
          <h4>Unable to Load Workspace</h4>
          <p>
            {error ||
              "This workspace is currently not available in the catalogue database."}
          </p>
          <Link href="/our-plans" className="btn-main mt-3">
            View All Available Plans
          </Link>
        </div>
      </div>
    );
  }

  const imageSrc = getWorkspaceImage(resource.slug, resource.imageUrl);

  return (
    <>
      {/* Subheader */}
      <section id="subheader" className="s2">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <ul className="crumb">
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/our-plans">Our Plans</Link>
                </li>
                <li>
                  <Link href={`/${resource.slug}`}>{resource.name}</Link>
                </li>
              </ul>
              <h2>{resource.name}</h2>
            </div>
            <div className="clearfix"></div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section aria-label="section" className="pt50 pb50">
        <div className="container">
          <div className="row">
            {/* Left Column: Image & Details */}
            <div className="col-lg-8">
              <div
                id="slider-carousel"
                className="mb30 rounded overflow-hidden shadow-sm"
              >
                <img
                  src={imageSrc}
                  className="img-fluid w-100"
                  alt={resource.name}
                  style={{ maxHeight: "440px", objectFit: "cover" }}
                />
              </div>

              <div className="de-price mb-4 p-4 bg-light rounded border">
                <h5 className="mb-2 text-primary font-weight-bold">
                  Live Pricing Tiers (From Database):
                </h5>
                {resource.pricing && resource.pricing.length > 0 ? (
                  <ul className="price-list list-unstyled mb-0">
                    {resource.pricing.map((plan) => (
                      <li
                        key={plan.id}
                        className="d-flex justify-content-between align-items-center py-2 border-bottom"
                      >
                        <span className="font-weight-bold">
                          {plan.planName}
                          {plan.isPopular && (
                            <span className="badge badge-primary ml-2">
                              POPULAR
                            </span>
                          )}
                        </span>
                        <span className="h5 text-primary mb-0 font-weight-bold">
                          ₦{Number(plan.price).toLocaleString()}{" "}
                          <span className="small text-muted font-weight-normal">
                            {getDurationLabel(plan)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted mb-0">
                    No active pricing tiers configured.
                  </p>
                )}
              </div>

              <div className="spacer-single"></div>

              <h3>Overview</h3>
              <p className="lead">{resource.description}</p>

              <div className="d-flex flex-wrap gap-4 text-muted mb-4 py-2 border-top border-bottom">
                <div className="mr-4">
                  <i className="fa fa-map-marker text-primary mr-1"></i>
                  <strong>Location:</strong>{" "}
                  {resource.location || "DAIH Campus, Redemption City"}
                </div>
                <div>
                  <i className="fa fa-users text-primary mr-1"></i>
                  <strong>Capacity:</strong> Up to {resource.capacity || 1}{" "}
                  Persons
                </div>
              </div>

              <div className="spacer-single"></div>

              <h3>What is Included</h3>
              <ul className="ul-style-2 row">
                {(resource.amenities || []).map((item, idx) => (
                  <li key={idx} className="col-md-6 mb-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: Sticky Booking Card */}
            <div className="col-lg-4">
              <div
                className="de-card s2 p-4 shadow-sm rounded sticky-top"
                style={{ top: "100px" }}
              >
                <h4 className="border-bottom pb-3">Reserve This Space</h4>
                <p className="text-muted small">
                  Instant reservation with guaranteed power, fast internet, and
                  access passes.
                </p>

                <div className="spacer-10"></div>

                <div className="mb-4">
                  <label className="small text-muted font-weight-bold text-uppercase">
                    Starting Rate
                  </label>
                  <div className="h3 text-primary font-weight-bold">
                    {resource.pricing && resource.pricing.length > 0 ? (
                      <>
                        ₦{Number(resource.pricing[0].price).toLocaleString()}
                        <span className="small text-muted font-weight-normal">
                          {" "}
                          {getDurationLabel(resource.pricing[0])}
                        </span>
                      </>
                    ) : (
                      "Contact Us"
                    )}
                  </div>
                </div>

                <div className="spacer-20"></div>

                <a
                  href={`http://localhost:3002/book/${resource.slug}`}
                  className="btn-main w-100 text-center py-3 font-weight-bold d-block"
                  style={{ textDecoration: "none" }}
                >
                  Book Online in Customer Portal
                </a>

                <div className="text-center mt-3">
                  <span className="small text-muted">
                    <i className="fa fa-lock text-success mr-1"></i> Secure
                    checkout via Paystack
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
