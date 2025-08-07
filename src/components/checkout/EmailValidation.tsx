
import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmailValidationProps {
  email: string;
  userEmail: string;
  onEmailChange: (email: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

const EmailValidation = ({
  email,
  userEmail,
  onEmailChange,
  onValidationChange
}: EmailValidationProps) => {
  const [emailMatchesUser, setEmailMatchesUser] = useState(true);

  useEffect(() => {
    const emailMatchesCurrentUser = email === userEmail;
    
    setEmailMatchesUser(emailMatchesCurrentUser);
    
    // É válido se o email é o mesmo do usuário logado e não está vazio
    const isValid = emailMatchesCurrentUser && email.trim() !== '';
    onValidationChange(isValid);
  }, [email, userEmail, onValidationChange]);

  return (
    <div>
      <Label htmlFor="email" className="text-gray-300">E-mail *</Label>
      <Input
        id="email"
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder="seu@email.com"
        className={`mt-1 bg-tech-darker border-tech-accent/30 text-white placeholder:text-gray-500 ${
          !emailMatchesUser && email ? 'border-red-500' : ''
        }`}
      />
      {!emailMatchesUser && email && (
        <div className="flex items-center gap-2 mt-2 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <p className="text-sm text-red-300">
            O e-mail informado não corresponde ao e-mail da sua conta. Use o mesmo e-mail com o qual está logado para continuar.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmailValidation;
