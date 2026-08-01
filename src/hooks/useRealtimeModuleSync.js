import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook de Sincronização em Tempo Real e Reatividade Autônoma Zero-UI.
 * Assina eventos do Supabase Realtime nas tabelas dos módulos do OdontoCRM
 * e fornece estado efêmero de iluminação sutil (glow) para novos elementos.
 */
export function useRealtimeModuleSync(tableName, clinicId, onUpdateCallback) {
  const [highlightedIds, setHighlightedIds] = useState(new Set());
  const callbackRef = useRef(onUpdateCallback);

  useEffect(() => {
    callbackRef.current = onUpdateCallback;
  }, [onUpdateCallback]);

  const triggerHighlight = useCallback((recordId) => {
    if (!recordId) return;
    
    setHighlightedIds((prev) => new Set(prev).add(recordId));
    
    // Remove o destaque suave após 2.5 segundos
    setTimeout(() => {
      setHighlightedIds((prev) => {
        const next = new Set(prev);
        next.delete(recordId);
        return next;
      });
    }, 2500);
  }, []);

  useEffect(() => {
    if (!tableName) return;

    // Criar canal de escuta do Supabase Realtime
    const channelName = `realtime-${tableName}-${clinicId || 'global'}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          ...(clinicId ? { filter: `clinic_id=eq.${clinicId}` } : {})
        },
        (payload) => {
          const newRecord = payload.new;
          if (newRecord?.id) {
            triggerHighlight(newRecord.id);
          }

          if (callbackRef.current) {
            callbackRef.current(payload);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, clinicId, triggerHighlight]);

  const isHighlighted = useCallback(
    (id) => highlightedIds.has(id),
    [highlightedIds]
  );

  return {
    highlightedIds,
    isHighlighted,
    triggerHighlight
  };
}
