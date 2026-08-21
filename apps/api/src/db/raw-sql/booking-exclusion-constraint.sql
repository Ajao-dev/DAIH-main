-- PostgreSQL Exclusion Constraint for Booking Range Overlap Prevention
-- Ensures no resource can have overlapping active/held/confirmed bookings

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
ADD CONSTRAINT no_overlapping_active_bookings
EXCLUDE USING gist (
  "resourceId" WITH =,
  tstzrange("startTime", "endTime", '[)') WITH &&
)
WHERE (state IN ('HELD', 'PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE', 'CHECKED_IN'));
