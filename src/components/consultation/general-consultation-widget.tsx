'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PlanSelectionModal } from './enhanced-plan-selection-modal'
import { 
  MessageSquare, 
  Shield, 
  HelpCircle, 
  BookOpen,
  Users,
  ChevronRight,
  Star
} from 'lucide-react'

interface GeneralConsultationWidgetProps {
  className?: string
  variant?: 'button' | 'card' | 'hero'
}

export function GeneralConsultationWidget({ 
  className = '', 
  variant = 'card' 
}: GeneralConsultationWidgetProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSuccess = (sessionId: string) => {
    console.log('Consultation session created:', sessionId)
    // Could redirect to session page or show success message
  }

  const consultationTopics = [
    { icon: <Shield className="h-4 w-4" />, text: "Phishing Protection" },
    { icon: <BookOpen className="h-4 w-4" />, text: "Learn Cybersecurity" },
    { icon: <Users className="h-4 w-4" />, text: "Business Security" },
    { icon: <HelpCircle className="h-4 w-4" />, text: "Any Security Question" }
  ]

  if (variant === 'button') {
    return (
      <>
        <Button
          onClick={() => setIsModalOpen(true)}
          className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Ask Security Expert
        </Button>
        
        <PlanSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          consultationType="general"
          onSuccess={handleSuccess}
        />
      </>
    )
  }

  if (variant === 'hero') {
    return (
      <>
        <div className={`text-center py-12 px-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl ${className}`}>
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get Expert Cybersecurity Advice
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              Ask our certified security experts any cybersecurity question - from basic protection 
              to advanced threat analysis. Get personalized guidance in real-time.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              {consultationTopics.map((topic, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-full">
                  {topic.icon}
                  <span>{topic.text}</span>
                </div>
              ))}
            </div>
            
            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Start Consultation
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
            
            <p className="text-sm text-gray-500 mt-4">
              Starting from $29.99 • 30-minute sessions • Expert cybersecurity guidance
            </p>
          </div>
        </div>
        
        <PlanSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          consultationType="general"
          onSuccess={handleSuccess}
        />
      </>
    )
  }

  // Default card variant
  return (
    <>
      <Card className={`p-6 hover:shadow-lg transition-shadow duration-200 ${className}`}>
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Ask a Security Expert
              </h3>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 ml-1">Expert Advice</span>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Get personalized cybersecurity guidance from certified experts. 
              Learn about phishing protection, password security, or any security topic.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {consultationTopics.slice(0, 3).map((topic, index) => (
                <div key={index} className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {topic.icon}
                  <span>{topic.text}</span>
                </div>
              ))}
              <div className="text-xs text-gray-400 px-2 py-1">+ More</div>
            </div>
            
            <Button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start Consultation
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              From $29.99 • 30min sessions • Real-time expert chat
            </p>
          </div>
        </div>
      </Card>
      
      <PlanSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        consultationType="general"
        onSuccess={handleSuccess}
      />
    </>
  )
}
