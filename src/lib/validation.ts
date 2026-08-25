import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .min(10, "Please enter a valid phone number.")
  .max(15, "Please enter a valid phone number.")
  .regex(/^\+?[0-9]{10,15}$/, "Please enter a valid phone number.");

export const bookingSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle."),
  driverId: z.string().optional().nullable(),
  pickup: z.string().trim().min(2, "Please enter a pickup location."),
  destination: z.string().trim().min(2, "Please select a destination."),
  travelDate: z.string().min(1, "Please select a travel date."),
  returnDate: z.string().optional().nullable(),
  tripType: z.enum(["ONEWAY", "ROUNDTRIP"]).default("ONEWAY"),
  passengers: z.coerce.number().int().min(1).max(200),
  oneWayDistanceKm: z.coerce.number().positive(),
  customerName: z.string().trim().min(2, "Please enter your name."),
  customerPhone: phoneSchema,
  customerEmail: z
    .string()
    .trim()
    .email("Please enter a valid email.")
    .optional()
    .or(z.literal("")),
  customerNotes: z.string().max(1000).optional(),
});

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  phone: phoneSchema,
  email: z.string().trim().email("Please enter a valid email.").optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5, "Please enter your message.").max(3000),
  vehicleId: z.string().optional().nullable(),
});

export const packageEnquirySchema = z.object({
  packageId: z.string().min(1),
  name: z.string().trim().min(2, "Please enter your name."),
  phone: phoneSchema,
  email: z.string().trim().email("Please enter a valid email.").optional().or(z.literal("")),
  travelDate: z.string().optional().nullable(),
  passengers: z.coerce.number().int().min(1).max(200).optional(),
  message: z.string().trim().max(3000).optional(),
});
