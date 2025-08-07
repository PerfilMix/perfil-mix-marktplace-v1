
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SimpleBanner, BannerType } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'app_banners';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export const useBanners = () => {
  const [banners, setBanners] = useState<SimpleBanner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load banners from Supabase on mount
  useEffect(() => {
    loadBannersFromSupabase();
    
    // Setup real-time subscription
    const channel = supabase
      .channel('banners-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'banners'
        },
        () => {
          console.log('Banner change detected, reloading...');
          loadBannersFromSupabase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBannersFromSupabase = async () => {
    try {
      console.log('Loading banners from Supabase...');
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading banners from Supabase:', error);
        // Fallback to localStorage if Supabase fails
        loadBannersFromLocalStorage();
        return;
      }

      // Convert Supabase data to SimpleBanner format
      const convertedBanners: SimpleBanner[] = data.map(banner => ({
        id: banner.id,
        type: banner.type as BannerType,
        imageData: banner.image_url,
        linkUrl: banner.link_url || undefined,
        createdAt: banner.created_at,
        isActive: banner.is_active
      }));

      setBanners(convertedBanners);
      console.log('Banners loaded from Supabase:', convertedBanners);
      console.log('Dashboard banners:', convertedBanners.filter(b => b.type === 'dashboard'));
    } catch (error) {
      console.error('Error loading banners:', error);
      loadBannersFromLocalStorage();
    }
  };

  const loadBannersFromLocalStorage = () => {
    const savedBanners = localStorage.getItem(STORAGE_KEY);
    if (savedBanners) {
      try {
        const parsed = JSON.parse(savedBanners);
        setBanners(parsed);
        console.log('Banners loaded from localStorage (fallback):', parsed);
      } catch (error) {
        console.error('Error loading banners from localStorage:', error);
      }
    }
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Apenas arquivos PNG, JPEG e WebP são aceitos';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Arquivo muito grande. Máximo 5MB';
    }
    return null;
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadBanner = async (file: File, type: BannerType, linkUrl?: string) => {
    try {
      setIsLoading(true);
      console.log(`Uploading ${type} banner...`);
      
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      const imageData = await compressImage(file);
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('banners')
        .insert({
          type,
          image_url: imageData,
          link_url: linkUrl || null,
          is_active: true,
          order_position: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting banner to Supabase:', error);
        // Fallback to localStorage
        const newBanner: SimpleBanner = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type,
          imageData,
          linkUrl: linkUrl || undefined,
          createdAt: new Date().toISOString(),
          isActive: true
        };

        const updatedBanners = [...banners, newBanner];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBanners));
        setBanners(updatedBanners);
        console.log('Banner saved to localStorage (fallback):', newBanner);
      } else {
        console.log('Banner saved to Supabase successfully:', data);
        // Force reload banners from Supabase to update local state
        await loadBannersFromSupabase();
      }

      toast({
        title: "Banner adicionado com sucesso! 🎉",
        description: `Banner ${type} está agora ativo na página inicial.`,
      });

      return data;
    } catch (error: any) {
      console.error('Error in uploadBanner:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar banner",
        description: error.message || "Ocorreu um erro inesperado.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBannerStatus = async (bannerId: string) => {
    try {
      setIsLoading(true);
      
      const banner = banners.find(b => b.id === bannerId);
      if (!banner) return;

      // Update in Supabase
      const { error } = await supabase
        .from('banners')
        .update({ is_active: !banner.isActive })
        .eq('id', bannerId);

      if (error) {
        console.error('Error updating banner status in Supabase:', error);
        // Fallback to localStorage
        const updatedBanners = banners.map(b => 
          b.id === bannerId 
            ? { ...b, isActive: !b.isActive }
            : b
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBanners));
        setBanners(updatedBanners);
      } else {
        // Force reload banners from Supabase
        await loadBannersFromSupabase();
      }
      
      toast({
        title: !banner.isActive ? "Banner ativado" : "Banner desativado",
        description: !banner.isActive 
          ? "Banner está agora visível na página inicial." 
          : "Banner foi ocultado da página inicial.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao alterar status do banner",
        description: error.message || "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBanner = async (bannerId: string) => {
    try {
      setIsLoading(true);
      
      // Delete from Supabase
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', bannerId);

      if (error) {
        console.error('Error deleting banner from Supabase:', error);
        // Fallback to localStorage
        const updatedBanners = banners.filter(b => b.id !== bannerId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBanners));
        setBanners(updatedBanners);
      } else {
        // Force reload banners from Supabase
        await loadBannersFromSupabase();
      }

      toast({
        title: "Banner removido",
        description: "Banner foi removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover banner",
        description: error.message || "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBannersByType = (type: BannerType, activeOnly: boolean = false) => {
    const filtered = banners.filter(banner => 
      banner.type === type && (activeOnly ? banner.isActive : true)
    );
    
    console.log(`getBannersByType(${type}, ${activeOnly}):`, filtered);
    return filtered;
  };

  const getActiveBannersByType = (type: BannerType) => {
    const activeBanners = getBannersByType(type, true);
    console.log(`getActiveBannersByType(${type}):`, activeBanners);
    return activeBanners;
  };

  const clearAllBanners = async () => {
    try {
      setIsLoading(true);
      
      // Delete all from Supabase
      const { error } = await supabase
        .from('banners')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) {
        console.error('Error clearing banners from Supabase:', error);
      }
      
      // Clear localStorage as well
      localStorage.removeItem(STORAGE_KEY);
      setBanners([]);
      console.log('All banners cleared');
      
      toast({
        title: "Todos os banners foram removidos",
        description: "Cache local e banco de dados foram limpos.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao limpar banners",
        description: error.message || "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    banners,
    isLoading,
    uploadBanner,
    deleteBanner,
    toggleBannerStatus,
    getBannersByType,
    getActiveBannersByType,
    clearAllBanners
  };
};
