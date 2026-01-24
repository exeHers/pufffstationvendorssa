import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund & Return Policy',
  description: 'Refund, Return, and Exchange policy for PUFFF Station Vendors SA.',
}

export default function RefundPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 text-slate-300">
      <h1 className="mb-8 text-4xl font-black text-white uppercase tracking-tighter">Refund & Return Policy</h1>
      
      <div className="space-y-8 leading-relaxed">
        <section>
          <h2 className="mb-3 text-xl font-bold text-white uppercase tracking-widest">1. Return Eligibility</h2>
          <p>
            In accordance with the Consumer Protection Act (CPA) of South Africa, you are entitled to return products 
            that are defective or do not match the description provided. However, due to the nature of our products 
            (vaping hardware and e-liquids), strict hygiene and safety rules apply.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white uppercase tracking-widest">2. Non-Returnable Items</h2>
          <p>For your safety and the safety of others, we cannot accept returns on:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Opened E-liquids or nicotine salts.</li>
            <li>Used disposable vapes (unless confirmed DOA/Defective within 24 hours of delivery).</li>
            <li>Opened coils, pods, or mouthpieces.</li>
            <li>Products damaged by user misuse or accidental damage.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold uppercase tracking-widest text-emerald-400">3. Defective Products (DOA)</h2>
          <p>
            If your product is defective upon arrival (Dead on Arrival), you must notify us within **24 hours** 
             of receiving the delivery. Please contact our support terminal at <span className="text-white font-bold">support@pufffstationsa.co.za</span> 
            with your order number and clear proof of the defect.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white uppercase tracking-widest">4. Refund Process</h2>
          <p>
            Once a return is authorized and the product is inspected, we will notify you of the approval or 
            rejection of your refund. If approved, a refund or store credit will be processed within 
            7-10 business days.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white uppercase tracking-widest">5. Shipping Costs</h2>
          <p>
            You will be responsible for paying your own shipping costs for returning your item unless 
            the item is confirmed to be defective. Shipping costs are non-refundable.
          </p>
        </section>

        <footer className="mt-12 pt-8 border-t border-white/5 text-[10px] uppercase font-bold tracking-widest text-slate-500">
          Last Updated: January 2026
        </footer>
      </div>
    </main>
  )
}
