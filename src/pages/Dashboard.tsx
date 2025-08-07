
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { loading } = useAuth();

  // Redirecionar para a página principal
  if (!loading) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-tech-darker">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-tech-highlight border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">Redirecionando...</p>
      </div>
    </div>
  );
};

export default Dashboard;
