
import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";
import { getNichosList, getSeguidoresRanges, getPaisesList, getPlataformasList, getPrecoRanges } from "@/lib/helpers";

interface MobileFilterDrawerProps {
  selectedPlatform?: string | null;
  setSelectedPlatform?: React.Dispatch<React.SetStateAction<string | null>>;
  selectedNicho?: string | null;
  setSelectedNicho?: React.Dispatch<React.SetStateAction<string | null>>;
  selectedSeguidores?: string;
  setSelectedSeguidores?: React.Dispatch<React.SetStateAction<string>>;
  selectedPais?: string;
  setSelectedPais?: React.Dispatch<React.SetStateAction<string>>;
  selectedPreco?: string;
  setSelectedPreco?: React.Dispatch<React.SetStateAction<string>>;
  onClearFilters: () => void;
}

const MobileFilterDrawer = memo(({
  selectedPlatform,
  setSelectedPlatform,
  selectedNicho,
  setSelectedNicho,
  selectedSeguidores,
  setSelectedSeguidores,
  selectedPais,
  setSelectedPais,
  selectedPreco,
  setSelectedPreco,
  onClearFilters,
}: MobileFilterDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const nichos = getNichosList();
  const seguidoresRanges = getSeguidoresRanges();
  const plataformas = getPlataformasList();
  const paises = getPaisesList();
  const precoRanges = getPrecoRanges();

  const handleNichoChange = (value: string) => {
    if (setSelectedNicho) {
      setSelectedNicho(value === "todos" ? null : value);
    }
  };

  const handlePlataformaChange = (value: string) => {
    if (setSelectedPlatform) {
      setSelectedPlatform(value === "todos" ? null : value);
    }
  };

  const handleSeguidoresChange = (value: string) => {
    if (setSelectedSeguidores) {
      setSelectedSeguidores(value);
    }
  };

  const handlePaisChange = (value: string) => {
    if (setSelectedPais) {
      setSelectedPais(value);
    }
  };

  const handlePrecoChange = (value: string) => {
    if (setSelectedPreco) {
      setSelectedPreco(value);
    }
  };

  const handleClearFilters = () => {
    onClearFilters();
    setIsOpen(false);
  };

  // Contar filtros ativos
  const activeFiltersCount = [
    selectedPlatform && selectedPlatform !== "todos",
    selectedNicho && selectedNicho !== "todos", 
    selectedSeguidores && selectedSeguidores !== "todos",
    selectedPais && selectedPais !== "todos",
    selectedPreco && selectedPreco !== "todos"
  ].filter(Boolean).length;

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            className="border-tech-accent/30 bg-tech-card/95 text-white hover:bg-tech-accent/20 hover:border-tech-highlight relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-tech-highlight text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent side="bottom" className="bg-tech-card border-tech-accent/30 text-white">
          <SheetHeader className="text-left">
            <SheetTitle className="text-white">Filtros de Busca</SheetTitle>
            <SheetDescription className="text-gray-300">
              Selecione os critérios para filtrar as contas disponíveis
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid grid-cols-1 gap-6 py-6">
            <div className="space-y-3">
              <Label htmlFor="mobile-seguidores" className="text-tech-highlight font-medium">Seguidores</Label>
              <Select
                value={selectedSeguidores || "todos"}
                onValueChange={handleSeguidoresChange}
              >
                <SelectTrigger 
                  id="mobile-seguidores" 
                  className="bg-tech-darker border-tech-accent/30 text-white hover:border-tech-highlight focus:border-tech-highlight focus:ring-tech-highlight/20"
                >
                  <SelectValue placeholder="Filtrar por seguidores" />
                </SelectTrigger>
                <SelectContent className="bg-tech-card border-tech-accent/30">
                  <SelectGroup>
                    {seguidoresRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value} className="text-white hover:bg-tech-accent/20 focus:bg-tech-accent/20">
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="mobile-nicho" className="text-tech-highlight font-medium">Nicho</Label>
              <Select
                value={selectedNicho || "todos"}
                onValueChange={handleNichoChange}
              >
                <SelectTrigger 
                  id="mobile-nicho" 
                  className="bg-tech-darker border-tech-accent/30 text-white hover:border-tech-highlight focus:border-tech-highlight focus:ring-tech-highlight/20"
                >
                  <SelectValue placeholder="Filtrar por nicho" />
                </SelectTrigger>
                <SelectContent className="bg-tech-card border-tech-accent/30">
                  <SelectGroup>
                    <SelectItem value="todos" className="text-white hover:bg-tech-accent/20 focus:bg-tech-accent/20">Todos</SelectItem>
                    {nichos.map((nicho) => (
                      <SelectItem key={nicho} value={nicho} className="text-white hover:bg-tech-accent/20 focus:bg-tech-accent/20">
                        {nicho}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="mobile-pais" className="text-tech-highlight font-medium">País</Label>
              <Select
                value={selectedPais || "todos"}
                onValueChange={handlePaisChange}
              >
                <SelectTrigger 
                  id="mobile-pais" 
                  className="bg-tech-darker border-tech-accent/30 text-white hover:border-tech-highlight focus:border-tech-highlight focus:ring-tech-highlight/20"
                >
                  <SelectValue placeholder="Filtrar por país" />
                </SelectTrigger>
                <SelectContent className="bg-tech-card border-tech-accent/30">
                  <SelectGroup>
                    {paises.map((pais) => (
                      <SelectItem key={pais.value} value={pais.value} className="text-white hover:bg-tech-accent/20 focus:bg-tech-accent/20">
                        {pais.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="mobile-plataforma" className="text-tech-highlight font-medium">Plataforma</Label>
              <Select
                value={selectedPlatform || "todos"}
                onValueChange={handlePlataformaChange}
              >
                <SelectTrigger 
                  id="mobile-plataforma" 
                  className="bg-tech-darker border-tech-accent/30 text-white hover:border-tech-highlight focus:border-tech-highlight focus:ring-tech-highlight/20"
                >
                  <SelectValue placeholder="Filtrar por plataforma" />
                </SelectTrigger>
                <SelectContent className="bg-tech-card border-tech-accent/30">
                  <SelectGroup>
                    <SelectItem value="todos" className="text-white hover:bg-tech-accent/20 focus:bg-tech-accent/20">Todas</SelectItem>
                    {plataformas.map((plataforma) => (
                      <SelectItem key={plataforma} value={plataforma} className="text-white hover:bg-tech-accent/20 focus:bg-tech-accent/20">
                        {plataforma}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="mobile-preco" className="text-tech-highlight font-medium">Preço</Label>
              <Select
                value={selectedPreco || "todos"}
                onValueChange={handlePrecoChange}
              >
                <SelectTrigger 
                  id="mobile-preco" 
                  className="bg-tech-darker border-tech-accent/30 text-white hover:border-tech-highlight focus:border-tech-highlight focus:ring-tech-highlight/20"
                >
                  <SelectValue placeholder="Filtrar por preço" />
                </SelectTrigger>
                <SelectContent className="bg-tech-card border-tech-accent/30">
                  <SelectGroup>
                    {precoRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value} className="text-white hover:bg-tech-accent/20 focus:bg-tech-accent/20">
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setIsOpen(false)}
              className="flex-1 tech-gradient hover:shadow-lg hover:shadow-tech-highlight/20 text-white font-medium"
            >
              Aplicar Filtros
            </Button>
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="border-tech-accent/30 text-white hover:bg-tech-accent/20"
            >
              Limpar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
});

MobileFilterDrawer.displayName = "MobileFilterDrawer";

export default MobileFilterDrawer;
