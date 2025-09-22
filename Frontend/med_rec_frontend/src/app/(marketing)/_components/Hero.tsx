import React from 'react'
import Image from "next/image"

const Hero = () => {
    return (
        <>
    <div className='flex flex-col items-center justify-center max-w-5xl' >
        <div className='flex items-center'>
        <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:h-[400px] md:w-[400px]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-blue-600/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 shadow-2xl border border-blue-200/50">
              <Image
                src="/Images/Hero1.png"
                fill
                className="object-contain rounded-xl"
                alt="Documents"
              />
            </div>
        </div>
        
        <div className='relative h-[400px] w-[400px] hidden md:block'>
            <div className="absolute inset-0 bg-gradient-to-bl from-purple-400/20 via-blue-400/20 to-purple-600/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-gradient-to-bl from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-4 shadow-2xl border border-purple-200/50">
              <Image
                src="/Images/Hero1.png"
                fill
                className="object-contain rounded-xl"
                alt="Documents"
              />
            </div>
        </div>
        </div>
    </div>
    </>
  )
}

export default Hero