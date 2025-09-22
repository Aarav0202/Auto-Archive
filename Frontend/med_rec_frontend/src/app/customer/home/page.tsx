"use client";

import { useAuth } from "@/app/context/AuthContext";
import Navbar from "../_components/Navbar";
import Cards from "../_components/Cards";

export default function CustomerHome() {
  const { user } = useAuth();
  

  return (
    <>
      <Navbar/>
      <div  className=" pt-20 ">
      <h1>👤 Customer Dashboard</h1>
      <p>Welcome, {user?.name || "dear cc"}!</p>
      <Cards/>
      </div>
    </>
  );
}
