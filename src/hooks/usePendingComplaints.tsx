import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePendingComplaints = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      const { count, error } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pendente')
        .eq('arquivada', false);

      if (!error && count !== null) {
        setPendingCount(count);
      }
    };

    fetchPendingCount();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('complaints-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
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