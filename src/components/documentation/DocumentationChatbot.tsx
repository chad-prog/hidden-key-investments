import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  FileText,
  Search,
  HelpCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  relatedDocs?: string[];
}

interface DocumentationChatbotProps {
  open?: boolean;
  onClose?: () => void;
  embedded?: boolean;
}

/**
 * AI-powered documentation chatbot
 * Provides interactive help and answers questions about documentation
 * 
 * Note: In production, this would integrate with an AI API like OpenAI or a custom LLM
 */
export function DocumentationChatbot({ 
  open = false, 
  onClose,
  embedded = false
}: DocumentationChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your documentation assistant. I can help you find information, explain concepts, and guide you through our documentation. What would you like to know?',
      timestamp: new Date(),
      suggestions: [
        'How do I get started?',
        'Show me the API documentation',
        'What features are available?',
        'How do I deploy the application?',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response (in production, this would call an AI API)
    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
        relatedDocs: response.relatedDocs,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const generateResponse = (query: string): { 
    content: string; 
    suggestions?: string[]; 
    relatedDocs?: string[];
  } => {
    const lowerQuery = query.toLowerCase();

    // Simple keyword-based responses (in production, use AI)
    if (lowerQuery.includes('start') || lowerQuery.includes('begin')) {
      return {
        content: 'Great! To get started, I recommend checking out these resources:\n\n1. **Quick Start Guide** - Get up and running in 5 minutes\n2. **Setup Guide** - Complete installation instructions\n3. **Architecture Overview** - Understand the system design\n\nWould you like me to open any of these for you?',
        suggestions: [
          'Open the Quick Start Guide',
          'Show me the Setup Guide',
          'Explain the architecture',
        ],
        relatedDocs: [
          '/docs/QUICK-START.md',
          '/SETUP-GUIDE.md',
          '/docs/ARCHITECTURE.md',
        ],
      };
    }

    if (lowerQuery.includes('api') || lowerQuery.includes('endpoint')) {
      return {
        content: 'Our API documentation covers all available endpoints and interfaces. Here\'s what you\'ll find:\n\n• **REST API Reference** - All HTTP endpoints\n• **TypeScript Interfaces** - Type definitions\n• **Code Examples** - Working samples\n• **Authentication** - Security setup\n\nWhich aspect would you like to explore?',
        suggestions: [
          'Show API endpoints',
          'View TypeScript interfaces',
          'See code examples',
        ],
        relatedDocs: [
          '/docs/API-REFERENCE.md',
          '/docs/API-REFERENCE-AUTO.md',
        ],
      };
    }

    if (lowerQuery.includes('deploy') || lowerQuery.includes('production')) {
      return {
        content: 'Deployment is streamlined with our automated CI/CD pipeline. Here\'s the process:\n\n1. **Build** - Run `npm run build`\n2. **Test** - Ensure all tests pass\n3. **Deploy** - Push to `main` branch for production\n\nWe support multiple deployment targets including Netlify, Vercel, and custom servers.',
        suggestions: [
          'Show deployment guide',
          'View environment setup',
          'Explain CI/CD pipeline',
        ],
        relatedDocs: [
          '/DEPLOYMENT-GUIDE.md',
          '/docs/STAGING-SETUP.md',
          '/docs/CI-CD-PIPELINE.md',
        ],
      };
    }

    if (lowerQuery.includes('test') || lowerQuery.includes('testing')) {
      return {
        content: 'Our testing infrastructure includes:\n\n• **Unit Tests** - Component and function tests\n• **Integration Tests** - Full workflow testing\n• **E2E Tests** - End-to-end scenarios\n• **Coverage Reports** - Track test coverage\n\nRun tests with `npm test` or `npm run test:watch` for continuous testing.',
        suggestions: [
          'Show testing guide',
          'View test examples',
          'Explain test utilities',
        ],
        relatedDocs: [
          '/docs/TESTING-GUIDE.md',
        ],
      };
    }

    // Default response
    return {
      content: `I understand you're asking about "${query}". Let me help you find the right information.\n\nI can assist with:\n• Getting started and setup\n• API and technical documentation\n• Deployment and operations\n• Testing and development\n• Architecture and design\n\nCould you provide more details about what you'd like to know?`,
      suggestions: [
        'Show all documentation',
        'Search documentation',
        'View quick reference',
      ],
      relatedDocs: [
        '/README.md',
        '/DOCUMENTATION-INDEX.md',
      ],
    };
  };

  const ChatInterface = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Documentation Assistant</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!embedded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div
                    className={`flex flex-col gap-2 max-w-[80%] ${
                      message.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Related documents */}
                    {message.relatedDocs && message.relatedDocs.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {message.relatedDocs.map((doc, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => window.open(doc, '_blank')}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            {doc.split('/').pop()?.replace('.md', '')}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}

                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about the documentation..."
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 This is a demo chatbot. In production, it would use AI to provide intelligent responses.
            </p>
          </div>
        </>
      )}
    </div>
  );

  if (embedded) {
    return (
      <Card className="h-full">
        <ChatInterface />
      </Card>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-w-2xl h-[600px] p-0">
        <ChatInterface />
      </DialogContent>
    </Dialog>
  );
}

/**
 * Floating chatbot button
 */
export function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      <DocumentationChatbot open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
