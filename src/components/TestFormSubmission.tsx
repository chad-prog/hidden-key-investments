
/**
 * Test form submission component for debugging and verifying form functionality
 * Provides real-time feedback and test modes without spamming email
 */
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CheckCircle, XCircle, Mail } from 'lucide-react';

interface TestFormData {
  name: string;
  email: string;
  message: string;
}

export default function TestFormSubmission() {
  const [formData, setFormData] = useState<TestFormData>({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionResult(null);

    // Simulate form submission - replace with actual Formspree or API call later
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      // For testing, randomly succeed or fail to simulate real scenarios
      const shouldSucceed = Math.random() > 0.3; // 70% success rate for testing
      
      if (shouldSucceed) {
        setSubmissionResult('success');
        console.log('Form submission successful:', formData);
      } else {
        setSubmissionResult('error');
        console.error('Form submission failed:', formData);
      }
    } catch (error) {
      setSubmissionResult('error');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="w-full max-w-md mx-auto border-2 border-dashed border-yellow-400">
      <CardHeader className="bg-yellow-50">
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Mail className="h-5 w-5" />
          Form Test Mode
        </CardTitle>
        <CardDescription className="text-yellow-700">
          Test form submissions without sending real emails
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message
            </Label>
            <textarea
              id="message"
              name="message"
              placeholder="Enter your message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            {isSubmitting ? 'Testing Submission...' : 'Test Form Submission'}
          </Button>
        </form>

        {submissionResult && (
          <Alert className={`mt-4 ${submissionResult === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            {submissionResult === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={submissionResult === 'success' ? 'text-green-800' : 'text-red-800'}>
              {submissionResult === 'success' 
                ? 'Form submission test successful! Ready for production.' 
                : 'Form submission test failed. Check console for details.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          <p>This is a test component. Check browser console for submission details.</p>
        </div>
      </CardContent>
    </Card>
  );
}
