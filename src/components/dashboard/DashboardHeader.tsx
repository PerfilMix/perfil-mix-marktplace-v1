
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {
  const navigate = useNavigate();

  const handleBackToMarketplace = () => {
    console.log("Navegando para marketplace público");
    navigate("/");
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Button 
          onClick={handleBackToMarketplace} 
          variant="outline" 
          className="border-tech-accent text-tech-highlight hover:bg-tech-accent/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Marketplace
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
