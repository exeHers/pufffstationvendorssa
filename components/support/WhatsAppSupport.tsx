'use client'

import { useEffect, useMemo, useState } from 'react'
import React from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import {
  DEFAULT_WHATSAPP_CONFIG,
  normalizeWhatsAppNumber,
  type WhatsAppConfig,
} from '@/lib/whatsapp-config'

export default function WhatsAppSupport() {
  const [config, setConfig] = useState<WhatsAppConfig>(DEFAULT_WHATSAPP_CONFIG)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabaseBrowser()
        .from('settings')
        .select('value')
        .eq('key', 'whatsapp_config')
        .maybeSingle()

      if (!error && data?.value) {
        setConfig((prev) => ({ ...prev, ...(data.value as Partial<WhatsAppConfig>) }))
      }
    }

    void load()
  }, [])

  const whatsappUrl = useMemo(() => {
    const whatsappNumber = normalizeWhatsAppNumber(config.whatsapp_number)
    const message = config.support_message || DEFAULT_WHATSAPP_CONFIG.support_message
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  }, [config])

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_8px_30px_rgba(37,211,102,0.6)] active:scale-95 sm:bottom-8 sm:right-8"
      aria-label="Contact support on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-8 w-8"
      >
        <path d="M12.031 2c-5.511 0-9.989 4.478-9.989 9.989 0 1.762.459 3.418 1.264 4.861L2 22l5.313-1.395c1.401.761 2.992 1.196 4.685 1.196 5.511 0 9.989-4.478 9.989-9.989S17.542 2 12.031 2zm6.541 14.288c-.27.76-1.328 1.445-2.133 1.536-.532.06-1.221.085-2.482-.438-1.611-.666-2.647-2.302-2.727-2.408-.08-.107-.648-.863-.648-1.646 0-.783.409-1.168.555-1.341.146-.173.319-.216.426-.216.107 0 .213.001.306.004.099.003.232-.037.363.28.133.32.453 1.106.493 1.186.04.08.067.173.013.28-.053.107-.08.173-.16.266-.08.093-.167.206-.24.28-.08.087-.163.18-.07.34.093.16.411.677.881 1.096.606.54 1.115.707 1.275.787.16.08.253.067.346-.04.093-.107.4-.466.507-.626.107-.16.213-.133.359-.08.146.053.933.44 1.093.52.16.08.266.12.306.186.04.067.04.387-.23 1.147z" />
      </svg>
    </a>
  )
}
