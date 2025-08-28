'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Send, 
  User, 
  Bot,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { apiClient } from '@/lib/api'

interface ExpertSimulationPanelProps {
  sessionId: string
  expertName?: string
  onMessageSent: () => void
}

export function ExpertSimulationPanel({ 
  sessionId, 
  expertName = 'Security Expert',
  onMessageSent 
}: ExpertSimulationPanelProps) {
  const [customMessage, setCustomMessage] = useState('')
  const [sending, setSending] = useState(false)

  // Use generic expert name for user-facing messages
  const displayExpertName = 'Security Expert'

  // Quick response templates
  const quickResponses = [
    {
      category: 'Greeting',
      icon: '👋',
      messages: [
        `Hello! I'm your assigned security expert. I've reviewed your alert and I'm here to help.`,
        `Hi there! I've been assigned to help you with your security concerns. Let me take a look at your alert.`,
        `Welcome! I'm your cybersecurity consultant for this session. I'll help you understand and respond to this threat.`
      ]
    },
    {
      category: 'Analysis',
      icon: '🔍',
      messages: [
        'Let me analyze this breach data for you. Please give me a moment to review the details.',
        'I\'m examining the compromised data to assess the risk level and impact on your security.',
        'Based on the breach information, I\'m evaluating what data was exposed and the potential implications.'
      ]
    },
    {
      category: 'Immediate Actions',
      icon: '⚡',
      messages: [
        'This breach appears to be legitimate. Here are the immediate steps you should take to secure your accounts.',
        'I recommend changing your password immediately for the affected account and any accounts using the same password.',
        'Based on this alert, you should enable two-factor authentication on all your important accounts right away.',
        'Let\'s start by securing your most critical accounts. Please update your passwords for banking and email first.'
      ]
    },
    {
      category: 'Risk Assessment',
      icon: '📊',
      messages: [
        'This breach has a HIGH risk level because it includes both email addresses and passwords.',
        'The risk level for this breach is MEDIUM - email addresses were exposed but passwords appear to be encrypted.',
        'This appears to be a LOW risk breach as only usernames were compromised, not passwords or sensitive data.',
        'Based on the data types exposed, I assess this as a CRITICAL risk requiring immediate action.'
      ]
    },
    {
      category: 'Next Steps',
      icon: '📋',
      messages: [
        'Here\'s your personalized action plan: 1) Change passwords, 2) Enable 2FA, 3) Monitor accounts, 4) Check credit reports.',
        'I recommend monitoring your accounts closely for the next 30 days and setting up fraud alerts with credit bureaus.',
        'Let\'s create a security checklist for you to follow. This will help ensure all your accounts are properly protected.',
        'I\'ll provide you with a summary of everything we\'ve discussed and the actions you need to take.'
      ]
    },
    {
      category: 'Technical Details',
      icon: '🔧',
      messages: [
        'This breach occurred when hackers gained unauthorized access to the company\'s user database.',
        'The compromised data includes email addresses, usernames, and encrypted passwords from this service.',
        'Based on the breach timeline, your data was potentially accessible to attackers for approximately 30 days.',
        'The company has patched the security vulnerability and is requiring all users to reset their passwords.'
      ]
    }
  ]

  const sendExpertMessage = async (message: string) => {
    if (!message.trim()) return

    setSending(true)
    try {
      console.log('🤖 Sending expert simulation message:', {
        sessionId,
        content: message,
        displayExpertName,
        endpoint: `/api/consultation/${sessionId}/system-message`
      })
      
      // Test the system message endpoint with proper error handling
      const response = await apiClient.request({
        method: 'POST',
        url: `/api/consultation/${sessionId}/system-message`,
        params: { 
          content: `[${displayExpertName}] ${message.trim()}`
        }
      })
      
      console.log('✅ Expert simulation response:', response)
      console.log('🔍 Response sender type:', response?.sender)
      
      toast.success('Expert simulation sent successfully')
      onMessageSent()
      setCustomMessage('')
      
    } catch (error: any) {
      console.error('❌ Expert simulation failed:', {
        error: error,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      
      // Check if it's an authentication issue
      if (error.response?.status === 403) {
        toast.error('Admin role required for expert simulation')
      } else if (error.response?.status === 404) {
        toast.error('System message endpoint not found')
      } else {
        toast.error(`Expert simulation failed: ${error.response?.data?.message || error.message}`)
      }
    } finally {
      setSending(false)
    }
  }

  const handleQuickResponse = (message: string) => {
    sendExpertMessage(message)
  }

  const handleCustomMessage = () => {
    sendExpertMessage(customMessage)
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Expert Response Simulation</h3>
            <p className="text-sm text-gray-600">Send messages as {displayExpertName}</p>
          </div>
        </div>

        {/* Quick Response Categories */}
        <div className="space-y-4">
          {quickResponses.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{category.icon}</span>
                <h4 className="font-medium text-gray-900">{category.category}</h4>
                <Badge variant="outline" className="text-xs">
                  {category.messages.length} responses
                </Badge>
              </div>
              
              <div className="grid gap-2">
                {category.messages.map((message, messageIndex) => (
                  <Button
                    key={messageIndex}
                    variant="outline"
                    className="justify-start h-auto text-left p-3 text-sm"
                    onClick={() => handleQuickResponse(message)}
                    disabled={sending}
                  >
                    <div className="flex items-start space-x-2">
                      <Send className="h-3 w-3 mt-1 text-gray-400" />
                      <span className="flex-1">{message}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Custom Message */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium text-gray-900 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Custom Expert Response
          </h4>
          
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder={`Type a custom response as ${displayExpertName}...`}
            rows={3}
            className="resize-none"
          />
          
          <Button 
            onClick={handleCustomMessage}
            disabled={!customMessage.trim() || sending}
            className="w-full"
          >
            {sending ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Sending Response...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Expert Response
              </>
            )}
          </Button>
        </div>

        {/* Status Information */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Simulation Mode</span>
          </div>
          <p className="text-xs text-amber-700 mt-1">
            These messages will appear as system messages in the user's chat with expert attribution.
            This is a temporary solution until the expert interface is fully implemented.
          </p>
        </div>
      </div>
    </Card>
  )
}
