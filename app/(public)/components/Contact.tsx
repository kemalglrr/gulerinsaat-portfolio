'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

const contactSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir email adresi giriniz'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Mesaj en az 10 karakter olmalıdır')
})

type ContactFormData = z.infer<typeof contactSchema>

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    
    try {
      // Send to API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Bir hata oluştu')
      }

      toast.success('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.')
      reset()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="iletisim" className="relative pt-16 pb-32 px-4 bg-white">
      <div className="container mx-auto relative z-10">
        {/* Başlık */}
        <div className="text-center mb-16">
          <div className="inline-block mb-10 px-4 py-2 bg-orange-50 border-2 border-black rounded-full">
            <span className="text-gray-700 font-semibold text-sm tracking-wider">BİZE ULAŞIN</span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Teklif Alın
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Projeleriniz için bizimle iletişime geçin
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Sol Taraf - Taşeron ve İletişim Bilgileri */}
          <div className="flex flex-col gap-6">
              {/* Taşeron - Üstte */}
              <div className="bg-gray-100 border border-gray-200 rounded-2xl p-8">
                <h4 className="text-2xl font-bold mb-4 text-gray-900">
                  Taşeron
                </h4>
                <p className="text-xl text-gray-700 font-semibold">Cevdet Güler</p>
              </div>
              
              {/* İletişim Bilgileri - Altta */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-8">
                  İletişim Bilgileri
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-500 rounded-lg">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Telefon</p>
                      <a href="tel:+905324372264" className="text-gray-900 text-lg font-semibold">
                        +90 532 437 22 64
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-500 rounded-lg">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Email</p>
                      <a href="mailto:guleryapiproje@gmail.com" className="text-gray-900 text-lg font-semibold">
                        guleryapiproje@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-500 rounded-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Adres</p>
                      <p className="text-gray-900 text-lg font-semibold">
                        Havaalanı, Gülyüzü Sk. 36 A, 34230 Esenler/İstanbul
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          </div>
          
          {/* İletişim Formu */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg flex flex-col">
              <h3 className="text-3xl font-bold text-gray-900 mb-8">
                Bize Ulaşın
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 flex-1 flex flex-col">
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">
                    Adınız Soyadınız *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-slate-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Adınız Soyadınız"
                  />
                  {errors.name && (
                    <p className="mt-1 text-red-600 text-sm">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">
                    Email *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-4 py-3 bg-gray-50 border border-slate-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="ornek@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-red-600 text-sm">{errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">
                    Telefon
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full px-4 py-3 bg-gray-50 border border-slate-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="0555 123 4567"
                  />
                </div>
                
                <div className="flex-1 flex flex-col">
                  <label className="block text-gray-700 mb-2 font-semibold">
                    Mesajınız *
                  </label>
                  <textarea
                    {...register('message')}
                    className="w-full flex-1 px-4 py-3 bg-gray-50 border border-slate-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    placeholder="Mesajınızı buraya yazın..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-red-600 text-sm">{errors.message.message}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Mesajı Gönder
                    </>
                  )}
                </button>
              </form>
          </div>
        </div>
      </div>
    </section>
  )
}

