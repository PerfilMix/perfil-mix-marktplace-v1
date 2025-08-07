
import { memo } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getNichosList, getSeguidoresRanges, getPaisesList, getPlataformasList, getPrecoRanges } from "@/lib/helpers";
import { ChartBar, Brain, Globe, Map, DollarSign } from "lucide-react";

interface FilterBarProps {
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
}

const FilterBar = memo(({
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
}: FilterBarProps) => {
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

  return (
    <div className="bg-tech-card/95 backdrop-blur-sm rounded-xl p-8 my-8 hidden md:grid grid-cols-1 md:grid-cols-5 gap-8 border border-tech-accent/20 shadow-lg shadow-tech-highlight/5">
      <div className="space-y-4">
        <Label htmlFor="seguidores" className="text-tech-highlight font-semibold text-base flex items-center gap-2">
          <ChartBar className="h-4 w-4" />
          Filtrar por seguidores
        </Label>
        <Select
          value={selectedSeguidores || "todos"}
          onValueChange={handleSeguidoresChange}
        >
          <SelectTrigger 
            id="seguidores" 
            className="bg-tech-darker border-tech-accent/30 text-white hover:border-tech-highlight focus:border-tech-highlight focus:ring-tech-highlight/20 h-12 relative z-10"
          >
            <SelectValue placeholder="Todos os seguidores" />
          </SelectTrigger>
          <SelectContent className="bg-tech-card border-tech-accent/30 z-50">
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

      <div className="space-y-4">
        <Label htmlFor="nicho" className="text-tech-highlight font-semibold text-base flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Filtrar por nicho
        </Label>
        <Select
          value={selectedNicho || "todos"}
          onValueChange={handleNichoChange}
        >
          <SelectTrigger 
            id="nicho" 
            className="bg-tech-darker border-tech-accent/30 text-white hover:border-tech-highlight focus:border-tech-highlight focus:ring-tech-highlight/20 h-12 relative z-10"
          >
            <SelectValue placeholder="Todos os nichos" />
          </SelectTrigger>
          <SelectContent className="bg-tech-card border-tech-accent/30 z-50">
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

      <div className="space-y-4">
        <Label htmlFor="pais" className="text-tech-highlight font-semibold text-base flex items-center gap-2">
          <Map className="h-4 w-4" />
          Filtrar por país
        </Label>
        <Select
          value={selectedPais || "todos"}
          onValueChange={handlePaisChange}
        >
          <SelectTrigger 
            id="pais" 
            className="bg-tech-darker border-tech-accent/30 text-white hover:border-tech-highlight focus:border-tech-highlight focus:ring-tech-highlight/20 h-12 relative z-10"
          >
            <SelectValue placeholder="Todos os países" />
          </SelectTrigger>
          <SelectContent className="bg-tech-card border-tech-accent/30 z-50">
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

      <div className="space-y-4">
        <Label htmlFor="plataforma" className="text-tech-highlight font-semibold text-base flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Filtrar por plataforma
        </Label>
        <Select
          value={selectedPlatform || "todos"}
          onValueChange={handlePlataformaChange}
        >
          <SelectTrigger 
            id="plataforma" 
            className="bg-tech-darker border-tech-accent/30 text-white hover:border-tech-highlight focus:border-tech-highlight focus:ring-tech-highlight/20 h-12 relative z-10"
          >
            <SelectValue placeholder="Todas as plataformas" />
          </SelectTrigger>
          <SelectContent className="bg-tech-card border-tech-accent/30 z-50">
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

      <div className="space-y-4">
        <Label htmlFor="preco" className="text-tech-highlight font-semibold text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Filtrar por preço
        </Label>
        <Select
          value={selectedPreco || "todos"}
          onValueChange={handlePrecoChange}
        >
          <SelectTrigger 
            id="preco" 
            className="bg-tech-darker border-tech-accent/30 text-white hover:border-tech-highlight focus:border-tech-highlight focus:ring-tech-highlight/20 h-12 relative z-10"
          >
            <SelectValue placeholder="Todos os preços" />
          </SelectTrigger>
          <SelectContent className="bg-tech-card border-tech-accent/30 z-50">
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
  );
});

FilterBar.displayName = "FilterBar";

export default FilterBar;
