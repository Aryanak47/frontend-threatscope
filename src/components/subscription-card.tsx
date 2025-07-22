import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth'
import { useUsageStore } from '@/stores/usage'
import { Crown, Settings, CreditCard, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export function SubscriptionCard() {
  const { user } = useAuthStore()
  const { quota } = useUsageStore()
  
  const getPlanInfo = () => {
    // Use real subscription data if available
    if (user?.subscription) {
      const planType = user.subscription.planType
      const status = user.subscription.status
      
      // Return plan info based on actual subscription
      switch (planType) {
        case 'FREE':
          return { name: 'Free', color: 'gray', searches: 25, status }
        case 'BASIC':
          return { name: 'Basic', color: 'blue', searches: 100, status }
        case 'PROFESSIONAL':
          return { name: 'Professional', color: 'purple', searches: 1200, status }
        case 'ENTERPRISE':
          return { name: 'Enterprise', color: 'amber', searches: 'unlimited', status }
        default:
          return { name: 'Free', color: 'gray', searches: 25, status: 'ACTIVE' }
      }
    }
    
    // Fallback to quota-based inference if no subscription data
    if (!quota) return { name: 'Free', color: 'gray', searches: 25, status: 'ACTIVE' }
    
    if (quota.totalSearches <= 25) return { name: 'Free', color: 'gray', searches: 25, status: 'ACTIVE' }
    if (quota.totalSearches <= 100) return { name: 'Basic', color: 'blue', searches: 100, status: 'ACTIVE' }
    if (quota.totalSearches <= 1200) return { name: 'Professional', color: 'purple', searches: 1200, status: 'ACTIVE' }
    return { name: 'Enterprise', color: 'amber', searches: 'unlimited', status: 'ACTIVE' }
  }
  
  const planInfo = getPlanInfo()
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Crown className="h-6 w-6 text-amber-600" />
          <div>
            <h3 className="font-semibold">Current Plan</h3>
            <div className="flex items-center space-x-2">
              <Badge variant={planInfo.color === 'gray' ? 'secondary' : 'default'} className={`
                ${planInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
                ${planInfo.color === 'purple' ? 'bg-purple-100 text-purple-800' : ''}
                ${planInfo.color === 'amber' ? 'bg-amber-100 text-amber-800' : ''}
              `}>
                {planInfo.name}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {planInfo.searches === 'unlimited' ? 'Unlimited' : `${planInfo.searches} searches/day`}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/pricing">
              <Settings className="h-4 w-4 mr-1" />
              Manage
            </Link>
          </Button>
          
          {planInfo.name === 'Free' && (
            <Button size="sm" asChild>
              <Link href="/pricing">
                <Crown className="h-4 w-4 mr-1" />
                Upgrade
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {/* Usage Overview */}
      {quota && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Daily Searches</span>
            <span className={quota.remainingSearches < 5 ? 'text-red-600' : 'text-green-600'}>
              {quota.remainingSearches}/{quota.totalSearches}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                quota.remainingSearches < 5 ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ 
                width: `${Math.max(0, (quota.remainingSearches / quota.totalSearches) * 100)}%` 
              }}
            />
          </div>
          
          {quota.remainingSearches < 5 && (
            <div className="flex items-center space-x-2 text-sm text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span>Running low on searches - consider upgrading</span>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
