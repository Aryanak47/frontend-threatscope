import { Shield, Search, Database, Bell, BarChart3, Download } from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'Advanced Search',
    description: 'Multi-type search across emails, usernames, IPs, domains, and more with advanced filtering capabilities.'
  },
  {
    icon: Database,
    title: 'Massive Database',
    description: 'Access to 14+ billion records from breaches, stealer logs, and public data sources.'
  },
  {
    icon: Bell,
    title: 'Real-time Alerts',
    description: 'Monitor your digital footprint and get instant notifications when new breaches are detected.'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Comprehensive analytics and reporting tools for threat intelligence and investigation workflows.'
  },
  {
    icon: Download,
    title: 'Export Capabilities',
    description: 'Export search results in multiple formats including CSV, Excel, PDF, and JSON.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade security with end-to-end encryption, audit logs, and compliance certifications.'
  }
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features for Modern OSINT
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need for comprehensive threat intelligence and digital investigations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-security-50 dark:bg-security-950 rounded-lg">
                  <feature.icon className="h-6 w-6 text-security-600" />
                </div>
                <h3 className="text-xl font-semibold ml-3">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
