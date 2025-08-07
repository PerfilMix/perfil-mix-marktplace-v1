
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tech-darker via-tech-darker to-tech-card/20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 tech-gradient opacity-5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-gradient-to-br from-tech-highlight to-tech-accent opacity-5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="text-center px-4 relative z-10 max-w-2xl mx-auto">
        <div className="animate-in">
          {/* 404 Number */}
          <div className="relative mb-8">
            <h1 className="text-9xl md:text-[12rem] font-bold text-gradient leading-none animate-glow">
              404
            </h1>
            <div className="absolute inset-0 text-9xl md:text-[12rem] font-bold text-tech-accent/20 blur-sm leading-none">
              404
            </div>
          </div>
        </div>

        <div className="animate-in-delayed">
          <h2 className="heading-lg text-white mb-6">
            Página não encontrada
          </h2>
        </div>

        <div className="animate-in-slow">
          <p className="text-subtitle mb-8 max-w-lg mx-auto">
            Oops! A página que você está procurando não existe ou foi removida. 
            Que tal explorar nosso marketplace?
          </p>
        </div>

        {/* Error Details */}
        <div className="glass-card p-6 mb-8 max-w-md mx-auto animate-in-slow">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-tech-accent/20 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-tech-accent" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Rota não encontrada</h3>
          <p className="text-gray-400 text-sm mb-4">
            A URL <code className="bg-tech-darker px-2 py-1 rounded text-tech-highlight text-xs">
              {location.pathname}
            </code> não existe em nosso sistema.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in-slow">
          <Link to="/">
            <Button className="btn-primary min-w-[200px] group">
              <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Voltar ao Início
            </Button>
          </Link>
          
          <Link to="/">
            <Button className="btn-secondary min-w-[200px] group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Explorar Contas
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 animate-in-slow">
          <p className="text-gray-400 text-sm mb-4">Você também pode:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/login" className="text-tech-accent hover:text-tech-highlight transition-colors hover:underline">
              Fazer Login
            </Link>
            <span className="text-gray-600">•</span>
            <Link to="/dashboard" className="text-tech-accent hover:text-tech-highlight transition-colors hover:underline">
              Acessar Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
