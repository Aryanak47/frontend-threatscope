import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.projectType || !formData.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Log the submission (in production, save to database)
    console.log('🚀 Development Quote Request:', {
      timestamp: new Date().toISOString(),
      ...formData
    })

    // Option 1: Send email notification (you'll need to set up email service)
    await sendQuoteRequestEmail(formData)
    
    // Option 2: Save to database (you'll need to set up database)
    // await saveQuoteRequestToDatabase(formData)
    
    // Option 3: Send to CRM/Slack/Discord webhook
    // await sendToWebhook(formData)

    return NextResponse.json({ 
      message: 'Quote request submitted successfully',
      submittedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Development quote API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Email notification function
async function sendQuoteRequestEmail(formData: any) {
  try {
    // Send notification email to your team
    const { data, error } = await resend.emails.send({
      from: 'ThreatScope Development <noreply@threatscope.com>',
      to: [process.env.DEV_TEAM_EMAIL || 'dev@threatscope.com'],
      subject: `🚀 New Development Quote Request - ${formData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #e2e8f0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin-bottom: 5px;">ThreatScope Development</h1>
            <h2 style="color: #e2e8f0; font-size: 24px; margin-top: 0;">New Quote Request</h2>
          </div>
          
          <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #60a5fa; margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${formData.email}" style="color: #60a5fa;">${formData.email}</a></p>
            <p><strong>Company:</strong> ${formData.company || 'Not provided'}</p>
            <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
          </div>
          
          <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #34d399; margin-top: 0;">Project Details</h3>
            <p><strong>Project Type:</strong> <span style="background: #065f46; padding: 2px 8px; border-radius: 4px; color: #6ee7b7;">${formData.projectType}</span></p>
            <p><strong>Budget Range:</strong> ${formData.budget || 'Not specified'}</p>
            <p><strong>Timeline:</strong> ${formData.timeframe || 'Not specified'}</p>
          </div>
          
          <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #a78bfa; margin-top: 0;">Project Description</h3>
            <div style="background: #0f172a; padding: 15px; border-radius: 4px; border-left: 4px solid #8b5cf6;">
              ${formData.description}
            </div>
            ${formData.features ? `
              <h4 style="color: #a78bfa; margin-bottom: 10px;">Key Features & Requirements</h4>
              <div style="background: #0f172a; padding: 15px; border-radius: 4px; border-left: 4px solid #8b5cf6;">
                ${formData.features}
              </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; padding: 20px; background: #7c3aed; border-radius: 8px;">
            <p style="margin: 0; font-weight: bold;">Submitted: ${new Date().toLocaleString()}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Respond within 24 hours for best results!</p>
          </div>
        </div>
      `,
      text: `
New Development Quote Request - ${formData.name}

Contact Information:
- Name: ${formData.name}
- Email: ${formData.email}
- Company: ${formData.company || 'Not provided'}
- Phone: ${formData.phone || 'Not provided'}

Project Details:
- Type: ${formData.projectType}
- Budget: ${formData.budget || 'Not specified'}
- Timeline: ${formData.timeframe || 'Not specified'}

Project Description:
${formData.description}

${formData.features ? `Key Features & Requirements:\n${formData.features}` : ''}

Submitted: ${new Date().toLocaleString()}
      `
    })

    if (error) {
      console.error('❌ Failed to send email:', error)
      throw new Error('Failed to send notification email')
    }

    console.log('✅ Quote request email sent successfully:', data?.id)

    // Also send confirmation email to the client
    await sendConfirmationEmail(formData)
    
  } catch (error) {
    console.error('❌ Email service error:', error)
    throw error
  }
}

// Send confirmation email to the client
async function sendConfirmationEmail(formData: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'ThreatScope Development <noreply@threatscope.com>',
      to: [formData.email],
      subject: 'Thank you for your development quote request - ThreatScope',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #e2e8f0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin-bottom: 5px;">ThreatScope Development</h1>
            <h2 style="color: #10b981; font-size: 24px; margin-top: 0;">Quote Request Received!</h2>
          </div>
          
          <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p>Hi ${formData.name},</p>
            <p>Thank you for your interest in our development services! We've received your quote request for <strong style="color: #60a5fa;">${formData.projectType}</strong> and our team is already reviewing the details.</p>
          </div>
          
          <div style="background: #065f46; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
            <h3 style="color: #6ee7b7; margin-top: 0;">⚡ What happens next?</h3>
            <ul style="color: #d1fae5;">
              <li>Our team will analyze your project requirements</li>
              <li>We'll prepare a detailed quote with timeline and costs</li>
              <li>You'll receive our response within <strong>24 hours</strong></li>
              <li>We'll schedule a free consultation call to discuss details</li>
            </ul>
          </div>
          
          <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #a78bfa; margin-top: 0;">Your Project Summary</h3>
            <p><strong>Project:</strong> ${formData.projectType}</p>
            <p><strong>Budget:</strong> ${formData.budget || 'To be discussed'}</p>
            <p><strong>Timeline:</strong> ${formData.timeframe || 'To be discussed'}</p>
          </div>
          
          <div style="text-align: center; background: #7c3aed; padding: 20px; border-radius: 8px;">
            <p style="margin: 0; font-weight: bold; color: white;">Questions? Reply to this email or call +1-555-THREAT</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9; color: #e0e7ff;">We're excited to help bring your project to life!</p>
          </div>
        </div>
      `,
      text: `
Hi ${formData.name},

Thank you for your interest in our development services! We've received your quote request for ${formData.projectType} and our team is already reviewing the details.

What happens next?
- Our team will analyze your project requirements
- We'll prepare a detailed quote with timeline and costs
- You'll receive our response within 24 hours
- We'll schedule a free consultation call to discuss details

Your Project Summary:
- Project: ${formData.projectType}
- Budget: ${formData.budget || 'To be discussed'}
- Timeline: ${formData.timeframe || 'To be discussed'}

Questions? Reply to this email or call +1-555-THREAT

We're excited to help bring your project to life!

Best regards,
ThreatScope Development Team
      `
    })

    if (error) {
      console.error('❌ Failed to send confirmation email:', error)
    } else {
      console.log('✅ Confirmation email sent to client:', data?.id)
    }
  } catch (error) {
    console.error('❌ Confirmation email error:', error)
    // Don't throw error for confirmation email - main notification is more important
  }
}

// Webhook notification function (example for Slack/Discord)
async function sendToWebhook(formData: any) {
  // Example: Send to Slack webhook
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `🚀 New Development Quote Request from ${formData.name} (${formData.email}) - Project: ${formData.projectType}, Budget: ${formData.budget}`
      })
    })
  }
}