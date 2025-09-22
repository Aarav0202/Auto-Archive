"use client";

import { useAuth } from "@/app/context/AuthContext";
import Navbar from "../_components/Navbar";
import DashboardPage from "../_components/DashboardPage";


export default function DealershipHome() {
  
  const { user } = useAuth();
  return (
    <>
      <Navbar/>
      <div className="mt-3">
      <DashboardPage/>
      </div>
      <h1>🚗 {user?.name} Dashboard</h1>
      <p>Manage cars, employees, and sales here.</p>
    </>
  );
}
