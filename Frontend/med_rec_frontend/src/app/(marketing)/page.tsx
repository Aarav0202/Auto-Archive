import React from 'react'
import HeadingSection from './_components/HeadingSection'
import Hero from './_components/Hero'
import Footer from './_components/Footer'

const page = () => {
    
  return (
   <>
    <div className='min-h-full flex flex-col bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='flex flex-col items-center justify-center md:justify-start text-center gap-y-12 flex-1 px-6 py-8' >
        <HeadingSection/>
        <Hero/>
        <Footer/>
      </div>
    </div>
    </>
  )
}

export default page