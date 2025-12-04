const TermsOfService = () => {
  return (
    <div className="container-custom section-padding">
      <h1 className="text-3xl font-bold text-black mb-8">Terms of Service</h1>
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-4">Last updated: September 17, 2025</p>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using Find Lift, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">2. Use License</h2>
            <p>Permission is granted to temporarily use Find Lift for personal, non-commercial transporting viewing only.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">3. Disclaimer</h2>
            <p>The materials on Find Lift are provided on an 'as is' basis. Find Lift makes no warranties, expressed or implied.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">4. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at legal@findlift.com</p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TermsOfService