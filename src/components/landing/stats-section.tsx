export function StatsSection() {
  return (
    <section className="py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Security Professionals Worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of cybersecurity experts who rely on ThreatScope for their investigations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-security-600 mb-2">10,000+</div>
            <div className="text-muted-foreground">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-intelligence-600 mb-2">1M+</div>
            <div className="text-muted-foreground">Daily Searches</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
            <div className="text-muted-foreground">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
            <div className="text-muted-foreground">Enterprise Clients</div>
          </div>
        </div>
      </div>
    </section>
  )
}
