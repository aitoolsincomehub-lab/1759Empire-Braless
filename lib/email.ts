import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}

function logEmailFailure(context: string, reason: string, identifier?: string) {
  console.error("[resend] email notification failed", { context, identifier, reason });
}

async function sendEmail({ to, subject, text, html, context, identifier }: { to: string; subject: string; text: string; html?: string; context: string; identifier?: string }) {
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!resend || !from) {
    const error = "RESEND is not configured.";
    logEmailFailure(context, error, identifier);
    return { ok: false, error };
  }

  try {
    const response = await resend.emails.send({
      from,
      to,
      subject,
      text,
      html: html || text,
    });

    if (response.error) {
      const error = response.error.message || "Email delivery failed.";
      logEmailFailure(context, error, identifier);
      return { ok: false, error };
    }
    return { ok: true, data: response.data };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Email delivery failed.";
    logEmailFailure(context, reason, identifier);
    return { ok: false, error: reason };
  }
}

export async function sendBookingNotificationEmails({
  bookingReference,
  roomName,
  checkIn,
  checkOut,
  guests,
  amount,
  status,
  source,
  guestEmail,
}: {
  bookingReference: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
  status: string;
  source?: string;
  guestEmail?: string | null;
}) {
  const managementEmail = process.env.RESEND_TO_EMAIL?.trim();
  if (!managementEmail) {
    const error = "RESEND_TO_EMAIL is not configured.";
    logEmailFailure("booking.configuration", error, bookingReference);
    return { ok: false, error };
  }
  const htmlBookingReference = escapeHtml(bookingReference);
  const htmlRoomName = escapeHtml(roomName);
  const htmlCheckIn = escapeHtml(checkIn);
  const htmlCheckOut = escapeHtml(checkOut);
  const htmlStatus = escapeHtml(status);
  const htmlSource = source ? escapeHtml(source) : "";

  const internalText = [
    "1759 Empire booking request",
    `Reference: ${bookingReference}`,
    `Room: ${roomName}`,
    `Check-in: ${checkIn}`,
    `Check-out: ${checkOut}`,
    `Guests: ${guests}`,
    `Estimated amount: ₦${Number(amount || 0).toLocaleString()}`,
    `Status: ${status}`,
    source ? `Source: ${source}` : undefined,
  ].filter(Boolean).join("\n");

  const internalResult = await sendEmail({
    to: managementEmail,
    subject: `New booking request • ${bookingReference}`,
    context: "booking.internal",
    identifier: bookingReference,
    text: internalText,
    html: `<p><strong>1759 Empire booking request</strong></p><p><strong>Reference:</strong> ${htmlBookingReference}</p><p><strong>Room:</strong> ${htmlRoomName}</p><p><strong>Check-in:</strong> ${htmlCheckIn}</p><p><strong>Check-out:</strong> ${htmlCheckOut}</p><p><strong>Guests:</strong> ${guests}</p><p><strong>Estimated amount:</strong> ₦${Number(amount || 0).toLocaleString()}</p><p><strong>Status:</strong> ${htmlStatus}</p>${source ? `<p><strong>Source:</strong> ${htmlSource}</p>` : ""}`,
  });

  if (guestEmail && /\S+@\S+\.\S+/.test(guestEmail)) {
    const customerText = [
      "Your 1759 Empire booking request has been received.",
      `Reference: ${bookingReference}`,
      `Room: ${roomName}`,
      `Check-in: ${checkIn}`,
      `Check-out: ${checkOut}`,
      `Guests: ${guests}`,
      `Estimated amount: ₦${Number(amount || 0).toLocaleString()}`,
      "Payment has not been taken.",
      "1759 will confirm the request and continue the next step with you.",
    ].join("\n");

    await sendEmail({
      to: guestEmail,
      subject: `1759 Empire booking request received • ${bookingReference}`,
      context: "booking.customer",
      identifier: bookingReference,
      text: customerText,
      html: `<p><strong>Your 1759 Empire booking request has been received.</strong></p><p><strong>Reference:</strong> ${htmlBookingReference}</p><p><strong>Room:</strong> ${htmlRoomName}</p><p><strong>Check-in:</strong> ${htmlCheckIn}</p><p><strong>Check-out:</strong> ${htmlCheckOut}</p><p><strong>Guests:</strong> ${guests}</p><p><strong>Estimated amount:</strong> ₦${Number(amount || 0).toLocaleString()}</p><p>Payment has not been taken.</p><p>1759 will confirm the request and continue the next step with you.</p>`,
    });
  }

  return internalResult;
}

export async function sendEventEnquiryNotificationEmails({
  enquiryId,
  eventTitle,
  eventDate,
  guestName,
  phone,
  email,
  people,
  enquiryType,
}: {
  enquiryId: string;
  eventTitle: string;
  eventDate?: string | null;
  guestName: string;
  phone: string;
  email?: string | null;
  people: number;
  enquiryType: string;
}) {
  const managementEmail = process.env.RESEND_TO_EMAIL?.trim();
  if (!managementEmail) {
    const error = "RESEND_TO_EMAIL is not configured.";
    logEmailFailure("event-enquiry.configuration", error, enquiryId);
    return { ok: false, error };
  }
  const htmlEnquiryId = escapeHtml(enquiryId);
  const htmlEventTitle = escapeHtml(eventTitle);
  const htmlEventDate = eventDate ? escapeHtml(eventDate) : "";
  const htmlGuestName = escapeHtml(guestName);
  const htmlPhone = escapeHtml(phone);
  const htmlEmail = email ? escapeHtml(email) : "";

  const internalText = [
    "1759 Empire event enquiry",
    `Reference: ${enquiryId}`,
    `Event: ${eventTitle}`,
    eventDate ? `Date: ${eventDate}` : undefined,
    `Guest: ${guestName}`,
    `Phone: ${phone}`,
    email ? `Email: ${email}` : undefined,
    `People: ${people}`,
    `Type: ${enquiryType}`,
  ].filter(Boolean).join("\n");

  const internalResult = await sendEmail({
    to: managementEmail,
    subject: `Event enquiry • ${eventTitle}`,
    context: "event-enquiry.internal",
    identifier: enquiryId,
    text: internalText,
    html: `<p><strong>1759 Empire event enquiry</strong></p><p><strong>Reference:</strong> ${htmlEnquiryId}</p><p><strong>Event:</strong> ${htmlEventTitle}</p>${eventDate ? `<p><strong>Date:</strong> ${htmlEventDate}</p>` : ""}<p><strong>Guest:</strong> ${htmlGuestName}</p><p><strong>Phone:</strong> ${htmlPhone}</p>${email ? `<p><strong>Email:</strong> ${htmlEmail}</p>` : ""}<p><strong>People:</strong> ${people}</p><p><strong>Type:</strong> ${escapeHtml(enquiryType)}</p>`,
  });

  if (email && /\S+@\S+\.\S+/.test(email)) {
    await sendEmail({
      to: email,
      subject: `1759 Empire event enquiry received • ${eventTitle}`,
      context: "event-enquiry.customer",
      identifier: enquiryId,
      text: `Your enquiry for ${eventTitle} has been received. Reference: ${enquiryId}. Our team will contact you shortly.`,
      html: `<p><strong>Your enquiry for ${htmlEventTitle} has been received.</strong></p><p><strong>Reference:</strong> ${htmlEnquiryId}</p><p>Our team will contact you shortly.</p>`,
    });
  }

  return internalResult;
}

export async function sendGeneralEnquiryNotificationEmails({
  enquiryId,
  name,
  phone,
  email,
  message,
}: {
  enquiryId: string;
  name: string;
  phone: string;
  email?: string | null;
  message: string;
}) {
  const managementEmail = process.env.RESEND_TO_EMAIL?.trim();
  if (!managementEmail) {
    const error = "RESEND_TO_EMAIL is not configured.";
    logEmailFailure("general-enquiry.configuration", error, enquiryId);
    return { ok: false, error };
  }
  const htmlEnquiryId = escapeHtml(enquiryId);
  const htmlName = escapeHtml(name);
  const htmlPhone = escapeHtml(phone);
  const htmlEmail = email ? escapeHtml(email) : "";
  const htmlMessage = escapeHtml(message);

  const internalText = [
    "1759 Empire general enquiry",
    `Reference: ${enquiryId}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    email ? `Email: ${email}` : undefined,
    `Message: ${message}`,
  ].filter(Boolean).join("\n");

  const internalResult = await sendEmail({
    to: managementEmail,
    subject: `General enquiry • ${enquiryId}`,
    context: "general-enquiry.internal",
    identifier: enquiryId,
    text: internalText,
    html: `<p><strong>1759 Empire general enquiry</strong></p><p><strong>Reference:</strong> ${htmlEnquiryId}</p><p><strong>Name:</strong> ${htmlName}</p><p><strong>Phone:</strong> ${htmlPhone}</p>${email ? `<p><strong>Email:</strong> ${htmlEmail}</p>` : ""}<p><strong>Message:</strong> ${htmlMessage}</p>`,
  });

  if (email && /\S+@\S+\.\S+/.test(email)) {
    await sendEmail({
      to: email,
      subject: "1759 Empire enquiry received",
      context: "general-enquiry.customer",
      identifier: enquiryId,
      text: `Thanks for contacting 1759 Empire. We have received your enquiry and will get back to you shortly. Reference: ${enquiryId}.`,
      html: `<p><strong>Thanks for contacting 1759 Empire.</strong></p><p>We have received your enquiry and will get back to you shortly.</p><p><strong>Reference:</strong> ${htmlEnquiryId}</p>`,
    });
  }

  return internalResult;
}
