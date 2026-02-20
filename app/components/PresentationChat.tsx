'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Loader2,
  Check
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PresentationChatProps {
  currentContent: string;
  onApplyContent: (content: string) => void;
}

export function PresentationChat({ currentContent, onApplyContent }: PresentationChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showApplyButton, setShowApplyButton] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');
    setShowApplyButton(false);
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userMessage, 
          currentContent 
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setStreamingContent(fullContent);
      }

      // Add assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: fullContent }]);
      setShowApplyButton(true);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Error:', error);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        }]);
      }
    } finally {
      setIsLoading(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  }, [input, isLoading, currentContent]);

  const extractMarkdownFromLastMessage = (): string | null => {
    const lastAssistantMessage = messages
      .slice()
      .reverse()
      .find(m => m.role === 'assistant');
    
    if (!lastAssistantMessage) return null;

    const content = lastAssistantMessage.content;

    // Look for markdown code block
    const codeBlockMatch = content.match(/```markdown\n([\s\S]*?)```/) || 
                          content.match(/```md\n([\s\S]*?)```/) ||
                          content.match(/```([\s\S]*?)```/);
    
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    // If no code block, check if content looks like markdown
    if (content.includes('#') || content.includes('---') || content.includes('```')) {
      return content.trim();
    }

    return null;
  };

  const handleApply = () => {
    const markdown = extractMarkdownFromLastMessage();
    if (markdown) {
      onApplyContent(markdown);
      setShowApplyButton(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingContent('');
    setShowApplyButton(false);
    setInput('');
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-ink text-rice 
                   rounded-full shadow-lg hover:bg-charcoal transition-all duration-300
                   hover:scale-105 z-50"
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">AI Assistant</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-washi border border-sand 
                    rounded-lg shadow-2xl z-50 flex flex-col max-h-150">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-sand bg-rice/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sage" />
          <span className="text-sm font-medium text-ink">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-1.5 text-clay hover:text-ink hover:bg-sand/50 
                         rounded-md transition-colors text-xs"
              title="Clear chat"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-clay hover:text-ink hover:bg-sand/50 
                       rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-100 min-h-50">
        {messages.length === 0 && (
          <div className="text-center py-8 text-stone">
            <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm mb-1">How can I help you?</p>
            <p className="text-xs opacity-70">
              Ask me to create a presentation or edit the current one
            </p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                message.role === 'user'
                  ? 'bg-ink text-rice'
                  : 'bg-sand/50 text-charcoal'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
        
        {/* Streaming response */}
        {isLoading && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-sand/50 text-charcoal">
              <div className="whitespace-pre-wrap">{streamingContent}</div>
            </div>
          </div>
        )}
        
        {isLoading && !streamingContent && (
          <div className="flex justify-start">
            <div className="bg-sand/50 rounded-lg px-3 py-2 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-clay" />
              <span className="text-xs text-clay">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Apply Button */}
      {showApplyButton && extractMarkdownFromLastMessage() && (
        <div className="px-4 py-2 border-t border-sand bg-sage/10">
          <button
            onClick={handleApply}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sage 
                       text-white rounded-md text-sm font-medium hover:bg-sage/90 
                       transition-colors"
          >
            <Check className="w-4 h-4" />
            Apply to Editor
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-sand">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to create or edit..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-rice border border-sand rounded-md 
                     text-sm text-ink placeholder-stone
                     focus:outline-none focus:border-sage disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 bg-ink text-rice rounded-md 
                     hover:bg-charcoal transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-stone mt-2 text-center">
          AI can create presentations or edit current content
        </p>
      </form>
    </div>
  );
}
