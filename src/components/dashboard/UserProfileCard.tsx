
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import EditProfileModal from "@/components/EditProfileModal";

interface UserProfileCardProps {
  purchasesCount: number;
}

const UserProfileCard = ({ purchasesCount }: UserProfileCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { userProfile, getUserInitials } = useAuth();

  const handleProfileUpdate = (newName: string, newImageUrl: string | null) => {
    console.log("Perfil atualizado:", newName, newImageUrl);
  };

  if (!userProfile) return null;

  return (
    <>
      <Card className="lg:col-span-1 bg-tech-card/95 backdrop-blur-sm border-tech-accent/20 shadow-lg shadow-tech-highlight/5">
        <CardHeader className="pb-2 border-b border-tech-accent/20">
          <CardTitle className="text-lg text-white">Seu Perfil</CardTitle>
          <CardDescription className="text-gray-300 text-sm">Gerencie suas informações</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pt-4">
          <Avatar className="h-16 w-16 mb-3 border-2 border-tech-highlight shadow-lg shadow-tech-highlight/20">
            {userProfile.profile_image_url ? (
              <AvatarImage src={userProfile.profile_image_url} alt={userProfile.name} />
            ) : (
              <AvatarFallback className="text-lg bg-tech-highlight text-white">
                {getUserInitials(userProfile.name)}
              </AvatarFallback>
            )}
          </Avatar>
          
          <h3 className="text-lg font-semibold text-white mt-1">{userProfile.name}</h3>
          <p className="text-gray-300 text-sm truncate w-full text-center">{userProfile.email}</p>
          
          <Button 
            onClick={() => setIsEditModalOpen(true)} 
            className="mt-3 tech-gradient hover:shadow-lg hover:shadow-tech-highlight/20 text-white font-medium transition-all duration-300" 
            size="sm"
          >
            <Edit size={14} className="mr-1" />
            Editar
          </Button>
          
          <div className="mt-4 w-full">
            <div className="bg-tech-darker/50 p-3 rounded-lg border border-tech-accent/20">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Contas compradas:</span>
                <span className="font-semibold text-tech-highlight">{purchasesCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        currentName={userProfile.name} 
        currentImage={userProfile.profile_image_url} 
        userEmail={userProfile.email} 
        onProfileUpdate={handleProfileUpdate} 
      />
    </>
  );
};

export default UserProfileCard;
