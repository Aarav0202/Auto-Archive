"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import Navbar from "../_components/Navbar";
import DashboardPage from "../_components/DashboardPage";


export default function DealershipHome() {
  const { user } = useAuth();
  const [apiMessage, setApiMessage] = useState<string>("");

  // Fetch data from protected API endpoint
  useEffect(() => {
    const fetchDealershipData = async () => {
      try {
        const response = await fetch("http://localhost:8080/dealership/home", {
          credentials: "include", // Important: sends cookies
        });
        
        if (response.ok) {
          const data = await response.text(); // dealership.js sends text, not JSON
          setApiMessage(data);
        } else {
          console.error("Failed to fetch dealership data");
        }
      } catch (error) {
        console.error("Error fetching dealership data:", error);
      }
    };

    if (user?.role === "carDealership") {
      fetchDealershipData();
    }
  }, [user]);
  return (
    <>
      <Navbar/>
      <div className="mt-3">
      <DashboardPage/>
      </div>
      <h1>🚗 {user?.name} Dashboard</h1>
      <p>Manage cars, employees, and sales here.</p>
      {apiMessage && (
        <p className="text-sm text-blue-600 mt-2 font-medium">
          Server says: {apiMessage}
        </p>
      )}
    </>
  );
}
