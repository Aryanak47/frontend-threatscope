'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlanSelectionModal } from './plan-selection-modal'
import { MessageSquare } from 'lucide-react'

interface AskExpertButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
}

export function AskExpertButton({ 
  className = '', 
  variant = 'default',
  size = 'default'
}: AskExpertButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSuccess = (sessionId: string) => {
    console.log('General consultation session created:', sessionId)
    // Could redirect to session page or show success message
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant={variant}
        size={size}
        className={className}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Ask Expert
      </Button>
      
      <PlanSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // No alertId or alertTitle = general consultation
        onSuccess={handleSuccess}
      />
    </>
  )
}
