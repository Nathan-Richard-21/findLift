const PrivacyPolicy = () => {
  return (
    <div className="container-custom section-padding">
      <h1 className="text-3xl font-bold text-black mb-8">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-4">Last updated: September 17, 2025</p>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-black mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, book a ride, or contact us for support.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">3. POPIA Compliance</h2>
            <p>Find Lift is committed to complying with the Protection of Personal Information Act (POPIA) and protecting your personal information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-3">4. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@findlift.com</p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy