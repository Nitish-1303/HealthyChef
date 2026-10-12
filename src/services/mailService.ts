import nodemailer from 'nodemailer';
import type { Invoice } from '../types.js';

export interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    const service = process.env.EMAIL_SERVICE;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!service || !user || !pass) {
      console.warn('Email configuration missing. Email notifications will be disabled.');
      return null;
    }

    transporter = nodemailer.createTransport({
      service,
      auth: { user, pass },
    });
  }
  return transporter;
}

export function getAppUrl() {
  const fallback = `http://localhost:${process.env.PORT || 3000}`;
  return (process.env.APP_URL || fallback).replace(/\/+$/, '');
}

/** Customer-supplied text goes into the email HTML, so it must be escaped. */
export function escapeHtml(value: unknown) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendEmail(data: EmailData) {
  const mailTransporter = getTransporter();
  if (!mailTransporter) return null;

  try {
    const info = await mailTransporter.sendMail({
      from: `"HealthyChef Invoice System" <${process.env.EMAIL_USER}>`,
      ...data
    });
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

export async function sendInvoiceEmail(invoice: Invoice) {
  const subject = `Invoice ${invoice.invoiceNumber} from HealthyChef`;
  const invoiceUrl = `${getAppUrl()}/invoices/${encodeURIComponent(invoice.id)}`;
  
  const html = `
    <div style="font-family: 'Inter', sans-serif; color: #2d2d2a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e8e8df; border-radius: 20px;">
      <h1 style="font-family: 'Libre Baskerville', serif; color: #5a5a40; font-style: italic; margin-bottom: 24px;">HealthyChef</h1>
      <p>Dear ${escapeHtml(invoice.customer.fullName)},</p>
      <p>A new invoice has been generated for your recent culinary experience.</p>
      
      <div style="background-color: #f5f5f0; padding: 24px; border-radius: 12px; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b6b64;">Invoice Number</p>
        <p style="margin: 4px 0 16px 0; font-size: 20px; font-weight: bold;">${escapeHtml(invoice.invoiceNumber)}</p>
        
        <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b6b64;">Amount Due</p>
        <p style="margin: 4px 0 0 0; font-size: 32px; font-weight: bold; color: #5a5a40;">₹${invoice.grandTotal.toLocaleString('en-IN')}</p>
      </div>
      
      <p>Please ensure payment is settled by ${escapeHtml(invoice.dueDate)}. You can view the full details and download your PDF invoice through the link below:</p>
      
      <a href="${escapeHtml(invoiceUrl)}" style="display: inline-block; background-color: #5a5a40; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; margin: 24px 0;">View Full Invoice</a>
      
      <p style="font-size: 12px; color: #6b6b64; margin-top: 40px; border-top: 1px solid #e8e8df; padding-top: 24px; font-style: italic;">
        Thank you for choosing HealthyChef. We appreciate your commitment to premium culinary standards.
      </p>
    </div>
  `;

  return sendEmail({
    to: invoice.customer.email,
    subject,
    text: `Invoice ${invoice.invoiceNumber} for ₹${invoice.grandTotal} is ready. View it here: ${invoiceUrl}`,
    html
  });
}
