'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Lock, Mail, LogIn, Building2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır')
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (error) throw error

      if (authData.user) {
        toast.success('Giriş başarılı! Yönlendiriliyorsunuz...')
        router.push('/admin/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Giriş yapılırken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 px-4 py-12">
      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Başlık */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-9 h-9 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">
            GÜLER YAPI PROJE
          </h1>
          <p className="text-gray-600 text-lg">Admin Panel</p>
        </div>
        
        {/* Login Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-center mb-8">
            <div className="p-4 bg-orange-600 rounded-xl">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Giriş Yap
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all"
                placeholder="admin@gulerinsaat.org"
              />
              {errors.email && (
                <p className="mt-2 text-red-600 text-sm">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Şifre
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-2 text-red-600 text-sm">{errors.password.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-lg hover:shadow-xl hover:shadow-orange-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Giriş Yap
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <a 
              href="/"
              className="text-gray-600 hover:text-orange-600 transition-colors text-sm"
            >
              ← Ana Sayfaya Dön
            </a>
          </div>
        </div>
        
        {/* İnfo */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>Admin girişi için yetkili olmanız gerekmektedir.</p>
        </div>
      </div>
    </div>
  )
}

