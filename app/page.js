import Image from "next/image";
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import CorredorSection from '../components/CorredorSection'
import BenefitsSection from '../components/BenefitsSection'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6f4f2] text-black">
      
      {/* Hero Section */}
      <HeroSection />
      
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          
          {/* Corredor Section */}
          <CorredorSection />
          
          {/* Benefits Section */}
          <BenefitsSection />
        </div>
      </main>
    </div>
  )
}
