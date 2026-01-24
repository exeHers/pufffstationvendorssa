import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and Conditions for PUFFF Station Vendors SA.',
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 text-slate-300">
      <h1 className="mb-8 text-4xl font-black text-white uppercase tracking-tighter">Terms of Service</h1>
      
      <div className="space-y-8 leading-relaxed">
        <section>
          <h2 className="mb-3 text-xl font-bold text-white uppercase tracking-widest">1. Agreement to Terms</h2>
          <p>
            By accessing or using the PUFFF Station Vendors SA website, you agree to be bound by these Terms of Service 
            and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited 
            from using or accessing this site.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold uppercase tracking-widest text-red-500">2. Age Restriction (18+)</h2>
          <p className="font-bold border-l-4 border-red-500 pl-4 py-2 bg-red-500/5 rounded-r-xl">
            This website sells products that contain nicotine or are intended for use with nicotine products. 
            You must be at least 18 years of age (or the legal age in your jurisdiction) to purchase products 
            from this website. By entering this site and/or purchasing products, you confirm that you meet 
            these age requirements.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white uppercase tracking-widest">3. Nicotine Warning</h2>
          <p>
            WARNING: Many products sold on this site contain nicotine. Nicotine is an addictive chemical. 
            Nicotine products are intended for use by adult smokers only and are not recommended for 
            non-smokers, children, pregnant women, or persons with cardiovascular conditions.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white uppercase tracking-widest">4. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials on PUFFF Station Vendors SA's 
            website for personal, non-commercial transitory viewing only. This is the grant of a license, 
            not a transfer of title.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white uppercase tracking-widest">5. Disclaimer</h2>
          <p>
            The materials on PUFFF Station Vendors SA's website are provided on an 'as is' basis. 
            PUFFF Station Vendors SA makes no warranties, expressed or implied, and hereby disclaims 
            and negates all other warranties including, without limitation, implied warranties or 
            conditions of merchantability, fitness for a particular purpose, or non-infringement 
            of intellectual property or other violation of rights.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white uppercase tracking-widest">6. Limitation of Liability</h2>
          <p>
            In no event shall PUFFF Station Vendors SA or its suppliers be liable for any damages 
            (including, without limitation, damages for loss of data or profit, or due to business 
            interruption) arising out of the use or inability to use the materials on the website.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white uppercase tracking-widest">7. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws 
            of the Republic of South Africa and you irrevocably submit to the exclusive jurisdiction 
            of the courts in that location.
          </p> section
        </section>

        <footer className="mt-12 pt-8 border-t border-white/5 text-[10px] uppercase font-bold tracking-widest text-slate-500">
          Last Updated: January 2026
        </footer>
      </div>
    </main>
  )
}
