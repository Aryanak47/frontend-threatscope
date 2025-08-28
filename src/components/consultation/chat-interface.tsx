'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Send, 
  Clock, 
  User, 
  Bot,
  X,
  FileText,
  Star
} from 'lucide-react'

interface ChatMessage {
  id: string
  sender: 'USER' | 'EXPERT' | 'SYSTEM'
  content: string
  timestamp: string
  isRead: boolean
}

interface ChatInterfaceProps {
  sessionId: string
  sessionData: {
    user: { firstName: string; lastName: string; email: string }
    expert?: { name: string; specialization: string }
    plan: { displayName: string; sessionDurationMinutes: number }
    status: string
    sessionNotes: string
  }
  isOpen: boolean
  onClose: () => void
}

export function ChatInterface({ sessionId, sessionData, isOpen, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sessionTimeLeft, setSessionTimeLeft] = useState(sessionData.plan.sessionDurationMinutes * 60) // in seconds
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Check if current user is admin (accessing from admin dashboard)
  const isAdmin = window.location.pathname.includes('/admin')

  // Mock initial messages
  useEffect(() => {
    const initialMessages: ChatMessage[] = [
      {
        id: '1',
        sender: 'SYSTEM',
        content: `Welcome to your ${sessionData.plan.displayName} consultation session!`,
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 min ago
        isRead: true
      },
      {
        id: '2',
        sender: 'USER',
        content: sessionData.sessionNotes,
        timestamp: new Date(Date.now() - 240000).toISOString(), // 4 min ago
        isRead: true
      }
    ]

    // ONLY add expert messages if expert is actually active (not just assigned)
    if (sessionData.expert && sessionData.status === 'ACTIVE') {
      initialMessages.push({
        id: '3',
        sender: 'EXPERT',
        content: `Hello ${sessionData.user.firstName}! I'm ${sessionData.expert.name}, your cybersecurity expert. I've reviewed your question and I'm here to help. Let me start by understanding your specific concerns better.`,
        timestamp: new Date(Date.now() - 180000).toISOString(), // 3 min ago
        isRead: true
      })

      initialMessages.push({
        id: '4',
        sender: 'EXPERT',
        content: 'Could you tell me a bit more about your current security setup? For example, what devices you use, if you have antivirus software, and any specific incidents that prompted your question?',
        timestamp: new Date(Date.now() - 120000).toISOString(), // 2 min ago
        isRead: true
      })
    } else if (sessionData.expert && sessionData.status === 'ASSIGNED') {
      // Expert assigned but session not active yet
      initialMessages.push({
        id: '3',
        sender: 'SYSTEM',
        content: `Expert ${sessionData.expert.name} has been assigned to your consultation. They will join once the session becomes active.`,
        timestamp: new Date(Date.now() - 180000).toISOString(), // 3 min ago
        isRead: true
      })
    } else if (sessionData.status === 'PENDING') {
      // No expert assigned yet
      initialMessages.push({
        id: '3',
        sender: 'SYSTEM',
        content: 'We are assigning a cybersecurity expert to your consultation. This usually takes a few minutes.',
        timestamp: new Date(Date.now() - 180000).toISOString(), // 3 min ago
        isRead: true
      })
    }

    setMessages(initialMessages)
  }, [sessionData])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Session timer
  useEffect(() => {
    if (sessionData.status === 'ACTIVE' && sessionTimeLeft > 0) {
      const timer = setInterval(() => {
        setSessionTimeLeft(prev => Math.max(0, prev - 1))
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [sessionData.status, sessionTimeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: isAdmin ? 'EXPERT' : 'USER', // Admin sends as expert
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')

    // Only simulate expert response if user sent the message (not admin)
    if (!isAdmin) {
      setTimeout(() => {
        const expertResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'EXPERT',
          content: getSmartExpertResponse(newMessage),
          timestamp: new Date().toISOString(),
          isRead: false
        }
        setMessages(prev => [...prev, expertResponse])
      }, 2000 + Math.random() * 3000) // 2-5 second delay
    }
  }

  const getSmartExpertResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase()
    
    if (msg.includes('phishing') || msg.includes('email') || msg.includes('suspicious')) {
      return 'Great question about phishing! Here are the key warning signs to look for: 1) Check the sender email carefully for misspellings, 2) Hover over links without clicking to see the real destination, 3) Be suspicious of urgent language or requests for personal info. Would you like me to walk you through setting up better email security?'
    }
    
    if (msg.includes('password') || msg.includes('login')) {
      return 'Password security is crucial! I recommend: 1) Use a unique password for every account, 2) Enable two-factor authentication wherever possible, 3) Consider a password manager like Bitwarden or 1Password. Are you currently using any password management tools?'
    }
    
    if (msg.includes('malware') || msg.includes('virus') || msg.includes('slow')) {
      return 'Let\'s check for malware systematically. First, run a full system scan with your antivirus. If you don\'t have one, I recommend Windows Defender (built-in) or Malwarebytes. Also check your browser for suspicious extensions. What operating system are you using?'
    }
    
    if (msg.includes('wifi') || msg.includes('network') || msg.includes('router')) {
      return 'Home network security is important! Key steps: 1) Change default router passwords, 2) Use WPA3 encryption (or WPA2 if WPA3 isn\'t available), 3) Hide your network name if needed, 4) Keep router firmware updated. Would you like me to guide you through checking these settings?'
    }
    
    if (msg.includes('social media') || msg.includes('facebook') || msg.includes('instagram')) {
      return 'Social media privacy settings are crucial! I recommend: 1) Review who can see your posts and personal info, 2) Enable two-factor authentication, 3) Be careful about location sharing, 4) Think twice before clicking links from unknown sources. Which platforms are you most concerned about?'
    }
    
    if (msg.includes('learn') || msg.includes('career') || msg.includes('start')) {
      return 'Excellent question about getting into cybersecurity! I\'d recommend starting with: 1) CompTIA Security+ certification, 2) Free resources like Cybrary or Professor Messer, 3) Practice with virtual labs, 4) Consider specializing in areas like incident response, penetration testing, or governance. What interests you most?'
    }
    
    if (msg.includes('business') || msg.includes('company') || msg.includes('employees')) {
      return 'Small business security is critical! Key priorities: 1) Employee security training, 2) Regular backups (3-2-1 rule), 3) Multi-factor authentication for all business accounts, 4) Endpoint protection on all devices, 5) Network segmentation if possible. How many employees do you have and what type of data do you handle?'
    }

    if (msg.includes('thank') || msg.includes('thanks') || msg.includes('helpful')) {
      return 'You\'re very welcome! I\'m here to help you stay secure. Do you have any other cybersecurity questions or would you like me to provide some additional resources for the topics we\'ve discussed?'
    }
    
    // Default response
    return 'That\'s a great question! Let me help you with that. Could you provide a bit more detail so I can give you the most relevant advice? I\'m here to help with any cybersecurity concerns you might have.'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Chat Session #{sessionId}</h2>
            </div>
            
            {sessionData.status === 'ACTIVE' && (
              <Badge className="bg-green-100 text-green-800">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(sessionTimeLeft)} left
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right text-sm">
              <p className="font-medium">{sessionData.user.firstName} {sessionData.user.lastName}</p>
              <p className="text-gray-600">{sessionData.plan.displayName}</p>
            </div>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expert Info */}
        {sessionData.expert && (
          <div className="p-3 bg-blue-50 border-b">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Expert: {sessionData.expert.name} ({sessionData.expert.specialization})
              </span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === 'USER'
                    ? 'bg-blue-600 text-white'
                    : message.sender === 'EXPERT'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {message.sender === 'USER' && <User className="h-3 w-3" />}
                  {message.sender === 'EXPERT' && <Bot className="h-3 w-3" />}
                  {message.sender === 'SYSTEM' && <MessageSquare className="h-3 w-3" />}
                  <span className="text-xs font-medium">
                    {message.sender === 'USER' ? 'You' : 
                     message.sender === 'EXPERT' ? sessionData.expert?.name || 'Expert' : 'System'}
                  </span>
                  <span className="text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        {(sessionData.status === 'ACTIVE' || isAdmin) && sessionTimeLeft > 0 ? (
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isAdmin ? "Type as expert..." : "Type your message..."}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {isAdmin && (
              <div className="text-xs text-center text-blue-600 mt-2">
                🟢 You are responding as the expert
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 border-t bg-gray-50">
            <div className="text-center">
              {sessionData.status === 'PENDING' && !isAdmin && (
                <p className="text-gray-600">Waiting for expert to join the session...</p>
              )}
              {sessionData.status === 'ASSIGNED' && !isAdmin && (
                <p className="text-gray-600">Expert assigned. Session will start shortly...</p>
              )}
              {isAdmin && sessionData.status !== 'ACTIVE' && (
                <p className="text-blue-600">🔧 Admin Access: You can chat regardless of session status</p>
              )}
              {sessionTimeLeft === 0 && (
                <>
                  <p className="text-gray-600 mb-3">Session time has ended. How was your experience?</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm">Rate this session:</span>
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        className="text-2xl text-yellow-400 hover:text-yellow-500"
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
