"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { AddEmployeeDialog } from './AddEmployeeDialog'
import { AddCustomerDialog } from './AddCustomerDialog'
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  UserPlus, 
  Eye, 
  UserCheck,
  UserMinus
} from 'lucide-react'


const NavSelect = () => {
  const router = useRouter()
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <>
      <NavigationMenu className="relative">
        <NavigationMenuList className="flex space-x-2">
          {/* Dashboard */}
          <NavigationMenuItem>
            <Button 
              variant="ghost" 
              onClick={() => handleNavigation('/dealership/home')}
              className="text-sm font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
              Dashboard
            </Button>
          </NavigationMenuItem>

          {/* Employees */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-sm font-medium data-[state=open]:bg-green-50 data-[state=open]:text-green-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              Employees
            </NavigationMenuTrigger>
            <NavigationMenuContent className="left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto">
              <div className="grid gap-2 p-4 w-[220px] bg-white border border-green-100 rounded-lg shadow-lg">
                <NavigationMenuLink asChild>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleNavigation('/dealership/employees/view')}
                    className="justify-start h-auto p-3 text-left hover:bg-green-50 hover:text-green-700 transition-colors duration-200 flex items-center gap-3"
                  >
                    <Eye className="w-4 h-4 text-green-500" />
                    <span>View Employees</span>
                  </Button>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsAddEmployeeOpen(true)}
                    className="justify-start h-auto p-3 text-left hover:bg-green-50 hover:text-green-700 transition-colors duration-200 flex items-center gap-3"
                  >
                    <UserPlus className="w-4 h-4 text-green-500" />
                    <span>Add Employee</span>
                  </Button>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Service Station */}
          <NavigationMenuItem>
            <Button 
              variant="ghost" 
              onClick={() => handleNavigation('/dealership/service')}
              className="text-sm font-medium hover:bg-orange-50 hover:text-orange-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Wrench className="w-4 h-4 text-orange-600" />
              Service Station
            </Button>
          </NavigationMenuItem>

          {/* Customers */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-sm font-medium data-[state=open]:bg-purple-50 data-[state=open]:text-purple-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-600" />
              Customers
            </NavigationMenuTrigger>
            <NavigationMenuContent className="left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto">
              <div className="grid gap-2 p-4 w-[220px] bg-white border border-purple-100 rounded-lg shadow-lg">
                <NavigationMenuLink asChild>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleNavigation('/dealership/customers/view')}
                    className="justify-start h-auto p-3 text-left hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200 flex items-center gap-3"
                  >
                    <Eye className="w-4 h-4 text-purple-500" />
                    <span>View Customers</span>
                  </Button>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsAddCustomerOpen(true)}
                    className="justify-start h-auto p-3 text-left hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200 flex items-center gap-3"
                  >
                    <UserPlus className="w-4 h-4 text-purple-500" />
                    <span>Add New Customer</span>
                  </Button>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Dialog Components */}
      <AddEmployeeDialog 
        open={isAddEmployeeOpen} 
        onOpenChange={setIsAddEmployeeOpen} 
      />
      <AddCustomerDialog 
        open={isAddCustomerOpen} 
        onOpenChange={setIsAddCustomerOpen} 
      />
    </>
  )
}

export default NavSelect