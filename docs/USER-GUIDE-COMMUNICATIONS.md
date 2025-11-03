# Communication System User Guide

Complete guide to using the SendGrid + Twilio integration for email and SMS communications.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Template Management](#template-management)
3. [Workflow Builder](#workflow-builder)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)

## Getting Started

### Overview

The communication system allows you to:
- Send emails via SendGrid
- Send SMS messages via Twilio
- Create reusable templates
- Build automated workflows
- Track communication history

### Quick Start

1. **Access Template Management**
   - Navigate to `/templates` in your browser
   - Or click "Templates" in the navigation menu

2. **Access Workflow Builder**
   - Navigate to `/workflows` in your browser
   - Or click "Workflows" in the navigation menu

### Initial Setup (For Administrators)

1. **Configure SendGrid** (Optional - works in demo mode without)
   - Sign up at [SendGrid](https://sendgrid.com)
   - Get your API key
   - Add to Netlify environment variables:
     ```
     SENDGRID_API_KEY=your_key
     SENDGRID_FROM_EMAIL=noreply@yourdomain.com
     SENDGRID_FROM_NAME=Your Company
     ```

2. **Configure Twilio** (Optional - works in demo mode without)
   - Sign up at [Twilio](https://www.twilio.com)
   - Get your credentials
   - Add to Netlify environment variables:
     ```
     TWILIO_ACCOUNT_SID=your_sid
     TWILIO_AUTH_TOKEN=your_token
     TWILIO_PHONE_NUMBER=+1234567890
     ```

## Template Management

### Creating Templates

1. **Navigate to Templates**
   - Go to `/templates`
   - Click "New Template" button

2. **Fill in Template Details**
   - **Name**: Descriptive name (e.g., "Welcome Email")
   - **Description**: Brief explanation of purpose
   - **Type**: Choose Email or SMS
   - **Subject**: (Email only) Subject line
   - **Content**: Your message content
   - **Tags**: Comma-separated tags for organization

3. **Use Template Variables**
   - Add placeholders using `{{variableName}}` syntax
   - Examples:
     - `{{firstName}}` - First name
     - `{{propertyName}}` - Property name
     - `{{date}}` - Date
     - `{{amount}}` - Amount
   
   Example email template:
   ```html
   <h1>Welcome, {{firstName}}!</h1>
   <p>Thank you for your interest in {{propertyName}}.</p>
   <p>Location: {{location}}</p>
   <p>Price: ${{price}}</p>
   ```

   Example SMS template:
   ```
   Hi {{firstName}}, reminder: Your appointment at {{location}} on {{date}} at {{time}}.
   ```

4. **Save and Activate**
   - Click "Create Template"
   - Template is saved as "Draft"
   - Click "Activate" to make it available for use

### Managing Templates

**Viewing Templates**
- All templates are displayed as cards
- Filter by Type (Email/SMS) or Status (Active/Draft/Archived)
- View variables, tags, and status at a glance

**Editing Templates**
- Templates are automatically updated in the system
- Note: Cannot directly edit via UI yet (coming soon)
- Can be duplicated and modified

**Duplicating Templates**
- Click the copy icon on any template
- Creates a new draft with "(Copy)" suffix
- Modify and save as a new template

**Activating/Deactivating**
- Click "Activate" to make template available
- Click "Deactivate" to remove from active use
- Deactivated templates remain available for reactivation

**Deleting Templates**
- Click the trash icon
- Confirm deletion
- Warning: This action cannot be undone

### Template Tips

**Email Templates:**
- Use HTML for formatting
- Keep images hosted externally
- Test with different email clients
- Include unsubscribe links for compliance
- Recommended max size: 102KB

**SMS Templates:**
- Keep messages concise (160 characters = 1 segment)
- Use clear, actionable language
- Include opt-out instructions (e.g., "Reply STOP to opt out")
- Avoid special characters that use extra space

**Variables:**
- Use clear, descriptive names
- Document available variables
- Provide fallback text if variable is missing
- Common variables:
  - `{{firstName}}`, `{{lastName}}`
  - `{{email}}`, `{{phone}}`
  - `{{companyName}}`
  - `{{date}}`, `{{time}}`
  - `{{propertyName}}`, `{{location}}`

## Workflow Builder

### Understanding Workflows

A workflow is an automated sequence of actions triggered by an event:

**Example: Welcome Series**
```
1. Trigger: New lead created
2. Action: Send welcome email
3. Action: Wait 2 days
4. Action: Send follow-up email
```

### Creating Workflows

1. **Start from Template or Blank**
   - Go to `/workflows`
   - Click "New Workflow"
   - Choose a pre-built template or "Start from Scratch"

2. **Available Templates**
   - **Welcome Email Series**: Automated onboarding
   - **Lead Scoring Automation**: Route qualified leads
   - **SMS Appointment Reminder**: 24-hour reminders
   - **Investment Opportunity**: Multi-channel notifications

3. **Workflow Components**
   - **Triggers**: Events that start the workflow
     - New lead created
     - Lead updated
     - Appointment scheduled
     - Property listed
   
   - **Actions**: Things to do
     - Send email (via SendGrid)
     - Send SMS (via Twilio)
     - Wait/Delay
     - Update CRM
   
   - **Conditions**: Decision points
     - Check lead score
     - Check property type
     - Check date/time

### Building a Custom Workflow

**Example: New Property Alert**

1. **Create the Workflow**
   - Name: "New Property Alert"
   - Description: "Notify investors about new listings"

2. **Add Trigger Node**
   - Type: Trigger
   - Event: "New Property Listed"

3. **Add Email Action**
   - Type: Action
   - Service: SendGrid
   - Template: Select "Investment Opportunity" template
   - Variables: Map property data to template variables

4. **Add SMS Action (Optional)**
   - Type: Action
   - Service: Twilio
   - Template: Select SMS alert template
   - Variables: Include property address and link

5. **Save and Activate**
   - Review the workflow
   - Click "Activate"
   - Workflow will now run automatically

### Testing Workflows

**Manual Testing:**
1. Create a test workflow
2. Use test data (test email, test phone)
3. Execute manually via the execution API
4. Check logs for results
5. Verify emails/SMS are received

**Demo Mode Testing:**
- When API keys are not configured
- Workflows execute but don't send real messages
- Check console logs for execution details
- Perfect for development and testing

### Monitoring Workflows

**Execution Tab:**
- View recent workflow executions
- See success/failure status
- Review execution logs
- Identify issues

**Analytics Tab:**
- Track workflow performance
- Monitor success rates
- Analyze execution times
- View trend data

## Best Practices

### Email Best Practices

1. **Subject Lines**
   - Keep under 50 characters
   - Personalize with variables
   - Avoid spam trigger words
   - Be clear and specific

2. **Content**
   - Mobile-responsive design
   - Clear call-to-action
   - Professional formatting
   - Test across devices

3. **Compliance**
   - Include unsubscribe link
   - Add physical address
   - Follow CAN-SPAM Act
   - Respect opt-outs

### SMS Best Practices

1. **Timing**
   - Send during business hours
   - Respect time zones
   - Avoid weekends (unless appropriate)

2. **Content**
   - Be concise and clear
   - Include brand name
   - Provide opt-out instructions
   - Use shortened URLs

3. **Compliance**
   - Obtain explicit consent
   - Follow TCPA regulations
   - Honor opt-outs immediately
   - Keep records of consent

### Template Best Practices

1. **Organization**
   - Use descriptive names
   - Add helpful descriptions
   - Tag templates consistently
   - Archive unused templates

2. **Maintenance**
   - Review templates quarterly
   - Update outdated content
   - Test after changes
   - Document variables

3. **Version Control**
   - Duplicate before major changes
   - Keep old versions as drafts
   - Document changes
   - Test thoroughly

### Workflow Best Practices

1. **Design**
   - Start simple, add complexity gradually
   - Document the purpose
   - Map out flow before building
   - Consider edge cases

2. **Testing**
   - Test with real data
   - Verify all branches
   - Check error handling
   - Monitor after deployment

3. **Maintenance**
   - Review performance regularly
   - Update based on feedback
   - Archive unused workflows
   - Document changes

## Troubleshooting

### Common Issues

**Templates not loading**
- Check browser console for errors
- Verify network connection
- Refresh the page
- Clear browser cache

**Email not sending**
- Verify SendGrid API key is configured
- Check email address format
- Review template for errors
- Check SendGrid dashboard for blocks

**SMS not sending**
- Verify Twilio credentials
- Check phone number format (must be E.164)
- Ensure phone number is verified (trial accounts)
- Review Twilio console for errors

**Workflow not executing**
- Check workflow is activated
- Verify trigger conditions are met
- Review execution logs
- Check node configurations

### Error Messages

**"Missing required fields"**
- Ensure all required fields are filled
- Check template syntax
- Verify variable names

**"Invalid email address"**
- Use valid email format: user@domain.com
- Remove spaces and special characters

**"Invalid phone number format"**
- Use E.164 format: +[country][number]
- Example: +12025551234
- Remove spaces, dashes, parentheses

**"Template not found"**
- Verify template ID exists
- Check template is not archived
- Refresh template list

### Getting Help

1. **Check Documentation**
   - Review API documentation
   - Read user guides
   - Check troubleshooting section

2. **View Logs**
   - Browser console for frontend issues
   - Netlify function logs for backend issues
   - SendGrid/Twilio dashboards for delivery issues

3. **Demo Mode**
   - Use demo mode for testing without API keys
   - Check console logs for execution details
   - Verify logic before production deployment

4. **Contact Support**
   - Provide error messages
   - Include steps to reproduce
   - Share relevant logs
   - Note when issue started

## Next Steps

- Explore [API Documentation](./API-COMMUNICATION.md)
- Review [Workflow Examples](./WORKFLOW-EXAMPLES.md)
- Check [Integration Guide](./INTEGRATION-GUIDE.md)
- Learn about [Advanced Features](./ADVANCED-FEATURES.md)
