
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AccountStatusType } from "@/types";

interface AccountStatusSelectorProps {
  value: AccountStatusType;
  onChange: (value: AccountStatusType) => void;
}

const AccountStatusSelector = ({ value, onChange }: AccountStatusSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="status" className="text-gray-300">
        Status da Conta
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-tech-card border-tech-accent/20 text-white">
          <SelectValue placeholder="Selecione o status" />
        </SelectTrigger>
        <SelectContent className="bg-tech-card border-tech-accent/20">
          <SelectItem value="disponivel_venda" className="text-white hover:bg-tech-accent/20">
            Disponibilizar para venda
          </SelectItem>
          <SelectItem value="em_producao" className="text-white hover:bg-tech-accent/20">
            Manter em produção
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AccountStatusSelector;
