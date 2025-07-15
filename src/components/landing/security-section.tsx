import { Lock, Eye, Server, UserX } from 'lucide-react'

export function SecuritySection() {
  return (
    <section className="py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Privacy & Security First
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your searches are ephemeral and encrypted. We never store your queries or compromise your privacy.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-50 dark:bg-green-950 rounded-full flex items-center justify-center mb-4">
              <UserX className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Zero Data Retention</h3>
            <p className="text-sm text-muted-foreground">Your searches are never stored or logged</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-950 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">End-to-End Encryption</h3>
            <p className="text-sm text-muted-foreground">All data in transit and at rest is encrypted</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-purple-50 dark:bg-purple-950 rounded-full flex items-center justify-center mb-4">
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ephemeral Sessions</h3>
            <p className="text-sm text-muted-foreground">Sessions expire automatically for security</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-50 dark:bg-orange-950 rounded-full flex items-center justify-center mb-4">
              <Server className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure Infrastructure</h3>
            <p className="text-sm text-muted-foreground">SOC 2 compliant hosting and operations</p>
          </div>
        </div>
      </div>
    </section>
  )
}
