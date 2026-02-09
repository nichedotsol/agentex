/**
 * Send Login Link Endpoint
 * Sends a magic login link to the user's email
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgentByEmail, generateLoginLink } from '@/lib/auth/agentAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if agent exists with this email
    const agent = getAgentByEmail(email);
    if (!agent) {
      // Don't reveal if email exists or not (security best practice)
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a login link has been sent.'
      });
    }

    // Generate login link
    const loginData = generateLoginLink(email);
    if (!loginData) {
      return NextResponse.json(
        { error: 'Failed to generate login link' },
        { status: 500 }
      );
    }

    // TODO: Send email with login link
    // For now, we'll return it in the response (in production, send via email service)
    // In production, use a service like Resend, SendGrid, or AWS SES
    
    console.log(`Login link for ${email}: ${loginData.link}`);

    // In development, return the link. In production, send email and don't return link
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return NextResponse.json({
      success: true,
      message: isDevelopment 
        ? `Login link generated. In production, this would be sent via email. Link: ${loginData.link}`
        : 'A login link has been sent to your email. Check your inbox and click the link to log in.',
      ...(isDevelopment && { loginLink: loginData.link }) // Only return in dev
    });
  } catch (error) {
    console.error('Send login link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
