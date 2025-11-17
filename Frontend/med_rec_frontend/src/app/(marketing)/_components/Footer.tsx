import React from 'react'
import Image from "next/image"
import { Button } from '@/components/ui/button'

const Footer = () => {
    
  return (
    <div className='flex items-center w-full p-6 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-50 border-t border-gray-200/50 dark:border-gray-700/50'>
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md">
            <Image
              src="/Images/Logo.svg"  
              alt="logo"
              width={20} 
              height={20}
              className="filter brightness-0 invert"    
            />
          </div>
          <p className="pl-2 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Auto Archive
          </p>
        </div>
        
        <div className='md:ml-auto w-full justify-between md:justify-end flex items-center gap-x-2 text-muted-foreground'>
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200 cursor-pointer"
            >
              Privacy Policy
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-700 transition-all duration-200 cursor-pointer"
            >
              Terms & Conditions
            </Button>
        </div>
    </div>
  )
}

export default Footer