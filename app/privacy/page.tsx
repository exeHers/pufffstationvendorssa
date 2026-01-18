import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy and Data Protection information for PUFFF Station Vendors SA.',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 text-slate-300">
      <h1 className="mb-8 text-4xl font-black text-white uppercase tracking-tighter">Privacy Policy</h1>
      
      <div className="space-y-8 leading-relaxed">
        <section>
          <h2 className="mb-3 text-xl font-bold text-white uppercase tracking-widest">1. Introduction</h2>
          <p>
            PUFFF Station Vendors SA ("we," "us," or "our") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, and safeguard your personal information 
            in accordance with the Protection of Personal Information Act (POPIA) of South Africa.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white uppercase tracking-widest">2. Information We Collect</h2>
          <p>We collect information you provide directly to us when you:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Register for an account (Email, Name, Age).</li>
            <li>Place an order (Shipping address, Phone number).</li>
            <li>Contact our support team.</li>
            <li>Provide customer reviews.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white uppercase tracking-widest">3. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Process and fulfill your orders.</li>
            <li>Verify your age to comply with legal requirements.</li>
            <li>Improve our website and customer service.</li>
            <li>Communicate with you regarding your account or orders.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white uppercase tracking-widest">4. Data Storage & Security</h2>
          <p>
            Your data is stored securely using industry-standard encryption provided by our 
            infrastructure partners (Supabase & Vercel). We do not store full credit card details 
            on our servers; all payments are processed through secured third-party gateways (Ozow).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white uppercase tracking-widest">5. Third-Party Sharing</h2>
          <p>
            We only share your information with third parties necessary for operation, such as:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Courier services for delivery (e.g., Courier Guy / PUDO).</li>
            <li>Payment processors (Ozow).</li>
            <li>Transactional email services (Resend).</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white uppercase tracking-widest">6. Your Rights</h2>
          <p>
            Under POPIA, you have the right to access, correct, or request the deletion of your 
            personal information. You may also object to the processing of your data for marketing 
            purposes at any time.
          </p>
        </section>

        <footer className="mt-12 pt-8 border-t border-white/5 text-[10px] uppercase font-bold tracking-widest text-slate-500">
          Last Updated: January 2026
        </footer>
      </div>
    </main>
  )
}
