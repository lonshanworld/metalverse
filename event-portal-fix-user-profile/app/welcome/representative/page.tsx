import { RepresentativeForm } from "@/components/onboarding/representative-form"
import Image from "next/image"

export default function RepresentativePage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/org/images/Containers.png"
          alt="Onboarding Background"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 relative flex items-center justify-center px-6 py-12 lg:px-12">
        <Image
          src="/org/images/background.png"
          alt="Form Background"
          fill
          priority
          className="object-cover -z-10 opacity-50"
        />
        <RepresentativeForm />
      </div>
    </div>
  )
}