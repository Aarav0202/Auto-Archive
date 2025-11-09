"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import Navbar from "../_components/Navbar";
import Cards from "../_components/Cards";
import Slider from "../_components/Slider";
import { User, Car, Calendar, Settings } from "lucide-react";

export default function CustomerHome() {
  const { user } = useAuth();
  const [apiMessage, setApiMessage] = useState<string>("");

  // Fetch data from protected API endpoint
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await fetch("http://localhost:8080/customer/home", {
          credentials: "include", // Important: sends cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          setApiMessage(data.message);
        } else {
          console.error("Failed to fetch customer data");
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };

    if (user?.role === "customer") {
      fetchCustomerData();
    }
  }, [user]);
  
  return (
    <>
      <Navbar/>
      <div className="pt-20 min-h-screen bg-gradient-to-br from-green-50/50 via-white to-blue-50/50">
        <div className="container mx-auto px-6 py-8">
          {/* Welcome Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-full">
                <User className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Customer Dashboard
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              Welcome back, <span className="font-semibold text-green-700">{user?.name || "dear customer"}</span>!
            </p>
            {apiMessage && (
              <p className="text-sm text-blue-600 mt-2 font-medium">
                Server says: {apiMessage}
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-8 flex justify-center">
            <div className="flex items-center gap-4">
              <Slider />
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                <Car className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800 font-medium">My Vehicles</span>
              </div>
            </div>
          </div>

          {/* Cards Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800">Your Vehicle Records</h2>
            </div>
            <Cards/>
          </div>
        </div>
      </div>
    </>
  );
}
