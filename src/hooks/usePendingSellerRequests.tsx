import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePendingSellerRequests = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      const { count, error } = await supabase
        .from('seller_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (!error && count !== null) {
        setPendingCount(count);
      }
    };

    fetchPendingCount();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('seller-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seller_requests',
        },
        () => {
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return pendingCount;
};