'use client'

import Image from 'next/image'
import { Users2, Zap } from 'lucide-react'

export default function Hero() {
  return (
    <section id="hakkimizda" className="relative min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <div className="text-center mb-20">
            <div className="inline-block mb-10 px-4 py-1.5 bg-orange-50 rounded-full">
              <span className="text-orange-700 font-semibold text-xs tracking-[0.2em]">GÜLER YAPI PROJE</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight text-gray-900">
              Profesyonel İnşaat,<br />
              <span className="text-orange-500">Güvenilir</span> Çözümler
            </h1>
          </div>
          
          {/* About Section */}
          <div className="max-w-6xl mx-auto mb-20">
            {/* Main Description */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl p-8 md:p-12 mb-8 shadow-2xl">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center shadow-lg flex-shrink-0 p-3">
                  <Image
                    src="/logo.png"
                    alt="Güler Yapı Proje Logo"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Güler Yapı Proje</h2>
                  <p className="text-gray-300 text-lg">Güvenilir Taşeronluk Hizmetleri</p>
                </div>
              </div>
              <p className="text-lg md:text-xl text-gray-100 leading-relaxed">
                30+ yıllık sektör deneyimimizle, tüm yapı projelerinde kalite ve güvenliği ön planda tutuyoruz. Modern inşaat teknolojileri ve uzman kadromuzla, her türlü yapı projesinde mükemmelliği hedefliyoruz.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-8">
                <div className="w-14 h-14 rounded-xl bg-orange-500 flex items-center justify-center mb-6">
                  <Users2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Profesyonel Ekip</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Deneyimli uzman kadro</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Sürekli eğitim ve gelişim</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Modern ekipman</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-2xl p-8">
                <div className="w-14 h-14 rounded-xl bg-orange-500 flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Hızlı & Kaliteli</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Zamanında teslimat garantisi</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Kaliteli malzeme kullanımı</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Titiz kalite kontrol</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
              <div className="text-5xl md:text-6xl font-bold text-orange-500 mb-2">150+</div>
              <div className="text-gray-700 text-lg">Tamamlanan Proje</div>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
              <div className="text-5xl md:text-6xl font-bold text-orange-500 mb-2">30+</div>
              <div className="text-gray-700 text-lg">Yıllık Deneyim</div>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
              <div className="text-5xl md:text-6xl font-bold text-orange-500 mb-2">500+</div>
              <div className="text-gray-700 text-lg">Mutlu Müşteri</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

