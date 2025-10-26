import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AccreditedInvestors from '../AccreditedInvestors'
import { test, expect } from 'vitest'

// Basic test: ensure demo submit appends automation log entries
test('demo submit shows automation log entries', async () => {
  render(<AccreditedInvestors />)

  // Fill required fields
  fireEvent.change(screen.getByPlaceholderText(/Enter your full name/i), { target: { value: 'Test User' } })
  fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), { target: { value: 'test@example.com' } })
  fireEvent.change(screen.getByPlaceholderText(/\(555\) 123-4567/i), { target: { value: '(555) 123-4567' } })

  // Fill required selects (labels don't have for/id in markup; select by role)
  const selects = screen.getAllByRole('combobox')
  // Order observed in the form: investmentCapacity, geographicPreference, investmentExperience, timeline, accreditationStatus
  fireEvent.change(selects[0], { target: { value: '250k-500k' } })
  fireEvent.change(selects[1], { target: { value: 'texas' } })
  fireEvent.change(selects[2], { target: { value: '4-10' } })
  fireEvent.change(selects[3], { target: { value: 'immediate' } })
  fireEvent.change(selects[4], { target: { value: 'accredited' } })

  // Submit the form
  const submitBtn = screen.getByRole('button', { name: /Activate Elite Investor Access/i })
  fireEvent.click(submitBtn)

  // Wait for a simulated Zapier automation log entry to appear
  await waitFor(() => expect(screen.getByText(/Zapier \(simulated\): New lead → Slack alert/)).toBeInTheDocument(), { timeout: 4000 })
})
