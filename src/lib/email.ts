import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ""),
  },
});

const ADMIN_EMAIL = process.env.GMAIL_USER || "balajiholidayshimoga@gmail.com";
const SITE_NAME = "Balaji Holidays Travels";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Admin: New Booking Notification ──────────────────────
export async function sendBookingEmailToAdmin(booking: {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  vehicleName: string;
  pickup: string;
  destination: string;
  travelDate: Date;
  returnDate: Date | null;
  tripType: string;
  passengers: number;
  distanceKm: number;
  estimatedPrice: number;
}) {
  const subject = `🚗 New Booking: ${booking.bookingId} — ${booking.pickup} → ${booking.destination}`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1e3a5f, #c8a951); padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">🚗 New Booking Request</h1>
        <p style="color: #f0e6c0; margin: 6px 0 0;">${SITE_NAME}</p>
      </div>

      <div style="padding: 24px; background: #f9f9f9;">
        <div style="background: white; border-radius: 6px; padding: 16px; margin-bottom: 16px; border-left: 4px solid #c8a951;">
          <h2 style="margin: 0 0 8px; color: #1e3a5f; font-size: 18px;">Booking ID: ${booking.bookingId}</h2>
          <p style="margin: 0; color: #666; font-size: 14px;">Status: <strong style="color: #f59e0b;">PENDING</strong></p>
        </div>

        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden;">
          <tr style="background: #f0f4f8;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f; width: 40%;">Customer</td>
            <td style="padding: 10px 14px; color: #333;">${booking.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Phone</td>
            <td style="padding: 10px 14px; color: #333;">
              <a href="tel:${booking.customerPhone}" style="color: #2563eb;">${booking.customerPhone}</a>
            </td>
          </tr>
          ${booking.customerEmail ? `
          <tr style="background: #f0f4f8;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Email</td>
            <td style="padding: 10px 14px; color: #333;">
              <a href="mailto:${booking.customerEmail}" style="color: #2563eb;">${booking.customerEmail}</a>
            </td>
          </tr>
          ` : ""}
          <tr${!booking.customerEmail ? ' style="background: #f0f4f8;"' : ""}>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Vehicle</td>
            <td style="padding: 10px 14px; color: #333;">${booking.vehicleName}</td>
          </tr>
          <tr style="background: #f0f4f8;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Route</td>
            <td style="padding: 10px 14px; color: #333;">${booking.pickup} → ${booking.destination}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Trip Type</td>
            <td style="padding: 10px 14px; color: #333;">${booking.tripType === "round_trip" ? "Round Trip" : "One Way"}</td>
          </tr>
          <tr style="background: #f0f4f8;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Travel Date</td>
            <td style="padding: 10px 14px; color: #333;">${formatDate(booking.travelDate)}</td>
          </tr>
          ${booking.returnDate ? `
          <tr>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Return Date</td>
            <td style="padding: 10px 14px; color: #333;">${formatDate(booking.returnDate)}</td>
          </tr>
          ` : ""}
          <tr style="background: #f0f4f8;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Passengers</td>
            <td style="padding: 10px 14px; color: #333;">${booking.passengers}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Distance</td>
            <td style="padding: 10px 14px; color: #333;">${booking.distanceKm.toFixed(1)} km</td>
          </tr>
          <tr style="background: #f0f4f8;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Estimated Price</td>
            <td style="padding: 10px 14px; color: #16a34a; font-weight: 700; font-size: 16px;">${formatINR(booking.estimatedPrice)}</td>
          </tr>
        </table>
      </div>

      <div style="padding: 16px 24px; background: #1e3a5f; text-align: center;">
        <p style="margin: 0; color: #c8a951; font-size: 13px;">Log in to the admin panel to review this booking</p>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"${SITE_NAME}" <${ADMIN_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject,
    html,
  });
}

// ── Admin: New Enquiry Notification ──────────────────────
export async function sendEnquiryEmailToAdmin(enquiry: {
  name: string;
  phone: string;
  email: string | null;
  subject: string | null;
  message: string;
}) {
  const subjectText = `📩 New Enquiry from ${enquiry.name}${enquiry.subject ? ` — ${enquiry.subject}` : ""}`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1e3a5f, #c8a951); padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">📩 New Enquiry</h1>
        <p style="color: #f0e6c0; margin: 6px 0 0;">${SITE_NAME}</p>
      </div>

      <div style="padding: 24px; background: #f9f9f9;">
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden;">
          <tr style="background: #f0f4f8;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f; width: 35%;">Name</td>
            <td style="padding: 10px 14px; color: #333;">${enquiry.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Phone</td>
            <td style="padding: 10px 14px; color: #333;">
              <a href="tel:${enquiry.phone}" style="color: #2563eb;">${enquiry.phone}</a>
            </td>
          </tr>
          ${enquiry.email ? `
          <tr style="background: #f0f4f8;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Email</td>
            <td style="padding: 10px 14px; color: #333;">
              <a href="mailto:${enquiry.email}" style="color: #2563eb;">${enquiry.email}</a>
            </td>
          </tr>
          ` : ""}
          ${enquiry.subject ? `
          <tr${!enquiry.email ? ' style="background: #f0f4f8;"' : ""}>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Subject</td>
            <td style="padding: 10px 14px; color: #333;">${enquiry.subject}</td>
          </tr>
          ` : ""}
        </table>

        <div style="background: white; border-radius: 6px; padding: 16px; margin-top: 16px; border-left: 4px solid #c8a951;">
          <h3 style="margin: 0 0 8px; color: #1e3a5f; font-size: 15px;">Message</h3>
          <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${enquiry.message}</p>
        </div>
      </div>

      <div style="padding: 16px 24px; background: #1e3a5f; text-align: center;">
        <p style="margin: 0; color: #c8a951; font-size: 13px;">Log in to the admin panel to respond</p>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"${SITE_NAME}" <${ADMIN_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: subjectText,
    html,
  });
}

// ── Admin: New Package Enquiry Notification ──────────────
export async function sendPackageEnquiryEmailToAdmin(enquiry: {
  name: string;
  phone: string;
  email: string | null;
  packageName: string;
  travelDate: Date | null;
  passengers: number | null;
  message: string | null;
}) {
  const subjectText = `🏖️ Package Enquiry: ${enquiry.packageName} from ${enquiry.name}`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1e3a5f, #c8a951); padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">🏖️ Package Enquiry</h1>
        <p style="color: #f0e6c0; margin: 6px 0 0;">${SITE_NAME}</p>
      </div>

      <div style="padding: 24px; background: #f9f9f9;">
        <div style="background: white; border-radius: 6px; padding: 16px; margin-bottom: 16px; border-left: 4px solid #16a34a;">
          <h2 style="margin: 0; color: #16a34a; font-size: 18px;">${enquiry.packageName}</h2>
        </div>

        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden;">
          <tr style="background: #f0f4f8;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f; width: 35%;">Customer</td>
            <td style="padding: 10px 14px; color: #333;">${enquiry.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Phone</td>
            <td style="padding: 10px 14px; color: #333;">
              <a href="tel:${enquiry.phone}" style="color: #2563eb;">${enquiry.phone}</a>
            </td>
          </tr>
          ${enquiry.email ? `
          <tr style="background: #f0f4f8;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Email</td>
            <td style="padding: 10px 14px; color: #333;">
              <a href="mailto:${enquiry.email}" style="color: #2563eb;">${enquiry.email}</a>
            </td>
          </tr>
          ` : ""}
          ${enquiry.travelDate ? `
          <tr${!enquiry.email ? ' style="background: #f0f4f8;"' : ""}>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Travel Date</td>
            <td style="padding: 10px 14px; color: #333;">${formatDate(enquiry.travelDate)}</td>
          </tr>
          ` : ""}
          ${enquiry.passengers ? `
          <tr>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Passengers</td>
            <td style="padding: 10px 14px; color: #333;">${enquiry.passengers}</td>
          </tr>
          ` : ""}
        </table>

        ${enquiry.message ? `
        <div style="background: white; border-radius: 6px; padding: 16px; margin-top: 16px; border-left: 4px solid #c8a951;">
          <h3 style="margin: 0 0 8px; color: #1e3a5f; font-size: 15px;">Message</h3>
          <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${enquiry.message}</p>
        </div>
        ` : ""}
      </div>

      <div style="padding: 16px 24px; background: #1e3a5f; text-align: center;">
        <p style="margin: 0; color: #c8a951; font-size: 13px;">Log in to the admin panel to respond</p>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"${SITE_NAME}" <${ADMIN_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: subjectText,
    html,
  });
}

// ── Customer: Booking Confirmation ──────────────────────
export async function sendBookingConfirmationToCustomer(customer: {
  name: string;
  email: string;
}, booking: {
  bookingId: string;
  vehicleName: string;
  pickup: string;
  destination: string;
  travelDate: Date;
  returnDate: Date | null;
  tripType: string;
  passengers: number;
  distanceKm: number;
  estimatedPrice: number;
}) {
  const subject = `Booking Confirmed — ${booking.bookingId} | ${SITE_NAME}`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1e3a5f, #c8a951); padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">✅ Booking Received!</h1>
        <p style="color: #f0e6c0; margin: 6px 0 0;">Thank you, ${customer.name}</p>
      </div>

      <div style="padding: 24px; background: #f9f9f9;">
        <div style="background: white; border-radius: 6px; padding: 16px; margin-bottom: 16px; border-left: 4px solid #16a34a;">
          <h2 style="margin: 0 0 6px; color: #1e3a5f; font-size: 18px;">Booking ID: ${booking.bookingId}</h2>
          <p style="margin: 0; color: #666; font-size: 14px;">We've received your booking request and will confirm shortly.</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden;">
          <tr style="background: #f0f4f8;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f; width: 40%;">Vehicle</td>
            <td style="padding: 10px 14px; color: #333;">${booking.vehicleName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Route</td>
            <td style="padding: 10px 14px; color: #333;">${booking.pickup} → ${booking.destination}</td>
          </tr>
          <tr style="background: #f0f4f8;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Trip Type</td>
            <td style="padding: 10px 14px; color: #333;">${booking.tripType === "round_trip" ? "Round Trip" : "One Way"}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Travel Date</td>
            <td style="padding: 10px 14px; color: #333;">${formatDate(booking.travelDate)}</td>
          </tr>
          ${booking.returnDate ? `
          <tr style="background: #f0f4f8;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Return Date</td>
            <td style="padding: 10px 14px; color: #333;">${formatDate(booking.returnDate)}</td>
          </tr>
          ` : ""}
          <tr${booking.returnDate ? "" : ' style="background: #f0f4f8;"'}>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Passengers</td>
            <td style="padding: 10px 14px; color: #333;">${booking.passengers}</td>
          </tr>
          <tr style="background: #f0f4f8;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Distance</td>
            <td style="padding: 10px 14px; color: #333;">${booking.distanceKm.toFixed(1)} km</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">Estimated Price</td>
            <td style="padding: 10px 14px; color: #16a34a; font-weight: 700; font-size: 16px;">${formatINR(booking.estimatedPrice)}</td>
          </tr>
        </table>

        <div style="background: white; border-radius: 6px; padding: 16px; margin-top: 16px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>What's next?</strong><br/>
            Our team will review your booking and confirm via phone call or WhatsApp. For any queries, call us at <a href="tel:+919876543210" style="color: #2563eb;">+91 98765 43210</a>
          </p>
        </div>
      </div>

      <div style="padding: 16px 24px; background: #1e3a5f; text-align: center;">
        <p style="margin: 0; color: #c8a951; font-size: 13px;">Balaji Holidays Travels — Your Journey, Our Passion</p>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"${SITE_NAME}" <${ADMIN_EMAIL}>`,
    to: customer.email,
    subject,
    html,
  });
}
