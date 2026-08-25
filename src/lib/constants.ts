export type Role = "CUSTOMER" | "ADMIN";
export type VehicleType =
  | "BUS"
  | "MINI_BUS"
  | "TEMPO_TRAVELLER"
  | "INNOVA"
  | "CAR"
  | "OTHER";
export type VehicleStatus =
  | "AVAILABLE"
  | "BOOKED"
  | "ON_TRIP"
  | "MAINTENANCE"
  | "UNAVAILABLE";
export type TripType = "ONEWAY" | "ROUNDTRIP";
export type BookingStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";
export type EnquiryStatus = "NEW" | "CONTACTED" | "FOLLOWUP" | "CONVERTED" | "CLOSED";
export type PackagePricingType = "PER_PERSON" | "FIXED" | "VEHICLE_BASED" | "CONTACT";

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  BUS: "Bus",
  MINI_BUS: "Mini Bus",
  TEMPO_TRAVELLER: "Tempo Traveller",
  INNOVA: "Innova",
  CAR: "Car",
  OTHER: "Other",
};

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  AVAILABLE: "Available",
  BOOKED: "Booked",
  ON_TRIP: "On Trip",
  MAINTENANCE: "Maintenance",
  UNAVAILABLE: "Unavailable",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  FOLLOWUP: "Follow-up",
  CONVERTED: "Converted",
  CLOSED: "Closed",
};

export const PACKAGE_PRICING_LABELS: Record<PackagePricingType, string> = {
  PER_PERSON: "Per Person",
  FIXED: "Fixed Price",
  VEHICLE_BASED: "Vehicle Based",
  CONTACT: "Contact for Price",
};

export const GALLERY_CATEGORIES = [
  "Buses",
  "Tempo Traveller",
  "Innova",
  "Trips",
  "Destinations",
  "Events",
  "Company",
];
