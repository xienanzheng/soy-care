import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { spendCredits } from '@/lib/rewards';

export interface VetThread {
  id: string;
  status: 'pending' | 'open' | 'closed';
  topic?: string | null;
  creditCost?: number | null;
  createdAt: string;
  lastMessageAt?: string | null;
  vet?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    specialty?: string | null;
  };
}

export interface VetMessage {
  id: string;
  threadId: string;
  senderType: 'user' | 'vet';
  message: string;
  createdAt: string;
}

interface StartThreadInput {
  petId?: string | null;
  topic?: string;
  initialMessage: string;
  creditCost?: number;
}

export function useVetChat(selectedPetId?: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pendingTopic, setPendingTopic] = useState('');

  const threadsQuery = useQuery({
    queryKey: ['vet-chat-threads', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('vet_chat_threads')
        .select('*')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        status: row.status as VetThread['status'],
        topic: row.topic,
        creditCost: row.credit_cost,
        createdAt: row.created_at,
        lastMessageAt: row.last_message_at,
        vet: undefined,
      })) as VetThread[];
    },
  });

  const activeThread = useMemo(() => {
    return threadsQuery.data?.find((thread) => thread.status !== 'closed') ?? null;
  }, [threadsQuery.data]);

  const messagesQuery = useQuery({
    queryKey: ['vet-chat-messages', activeThread?.id],
    enabled: !!activeThread?.id,
    queryFn: async () => {
      if (!activeThread) return [];
      const { data, error } = await supabase
        .from('vet_chat_messages')
        .select('*')
        .eq('thread_id', activeThread.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        threadId: row.thread_id,
        senderType: row.sender_type as 'user' | 'vet',
        message: row.message,
        createdAt: row.created_at,
      })) as VetMessage[];
    },
  });

  const invalidateThreads = () => {
    queryClient.invalidateQueries({ queryKey: ['vet-chat-threads', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['vet-chat-messages', activeThread?.id] });
  };

  const startThreadMutation = useMutation({
    mutationFn: async ({ petId, topic, initialMessage, creditCost = 25 }: StartThreadInput) => {
      if (!user) throw new Error('Not authenticated');
      await spendCredits(creditCost, 'vet_chat_session', { topic });
      const { data, error } = await supabase
        .from('vet_chat_threads')
        .insert({
          user_id: user.id,
          pet_id: petId || null,
          topic: topic || null,
          status: 'pending',
          credit_cost: creditCost,
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from('vet_chat_messages').insert({
        thread_id: data.id,
        sender_type: 'user',
        sender_id: user.id,
        message: initialMessage,
      });
      return data;
    },
    onSuccess: () => {
      setPendingTopic('');
      invalidateThreads();
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      if (!user) throw new Error('Not authenticated');
      if (!activeThread) throw new Error('No active thread');
      const { error } = await supabase.from('vet_chat_messages').insert({
        thread_id: activeThread.id,
        sender_type: 'user',
        sender_id: user.id,
        message,
      });
      if (error) throw error;
    },
    onSuccess: () => invalidateThreads(),
  });

  return {
    threads: threadsQuery.data ?? [],
    activeThread,
    messages: messagesQuery.data ?? [],
    isLoadingThreads: threadsQuery.isLoading,
    isLoadingMessages: messagesQuery.isLoading,
    startThread: startThreadMutation.mutateAsync,
    isStarting: startThreadMutation.isPending,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    pendingTopic,
    setPendingTopic,
    canStartThread: !!selectedPetId && !startThreadMutation.isPending,
  };
}
