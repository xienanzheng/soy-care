import { useCallback, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InsightResponse {
  summary: string;
  riskLevel?: string;
  recommendations?: string;
}

export interface BreedBreakdownResponse {
  breakdown: { label: string; percentage: number; traits?: string }[];
  originStory?: string;
  watchouts?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
}

export function usePetInsights() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFetchingBreed, setIsFetchingBreed] = useState(false);
  const [isChatting, setIsChatting] = useState(false);

  const getBaseUrl = useCallback(() => {
    const baseUrl = import.meta.env.VITE_PET_INSIGHTS_URL;
    if (!baseUrl) {
      toast({
        title: 'Insights server not configured',
        description: 'Set VITE_PET_INSIGHTS_URL to your MCP server URL.',
        variant: 'destructive',
      });
      return null;
    }
    return baseUrl.replace(/\/$/, '');
  }, []);

  const getAuthHeaders = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      toast({
        title: 'Please sign in again',
        description: 'We could not find a valid session to call the insights service.',
        variant: 'destructive',
      });
      return null;
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const triggerAnalysis = useCallback(async (petId: string) => {
    const baseUrl = getBaseUrl();
    if (!baseUrl) return null;

    try {
      setIsAnalyzing(true);
      const headers = await getAuthHeaders();
      if (!headers) return null;

      const response = await fetch(`${baseUrl}/analyze`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ petId }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload: InsightResponse = await response.json();
      toast({
        title: 'Health insight updated',
        description: payload.summary || 'New note saved.',
      });
      return payload;
    } catch (error: any) {
      toast({
        title: 'Analysis failed',
        description: error.message || 'Unable to reach MCP server.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [getAuthHeaders, getBaseUrl]);

  const fetchBreedBreakdown = useCallback(async (petId: string): Promise<BreedBreakdownResponse | null> => {
    const baseUrl = getBaseUrl();
    if (!baseUrl) return null;

    try {
      setIsFetchingBreed(true);
      const headers = await getAuthHeaders();
      if (!headers) return null;

      const response = await fetch(`${baseUrl}/breed-breakdown`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ petId }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload: BreedBreakdownResponse = await response.json();
      return payload;
    } catch (error: any) {
      toast({
        title: 'Breed insight failed',
        description: error.message || 'Unable to reach MCP server.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsFetchingBreed(false);
    }
  }, [getAuthHeaders, getBaseUrl]);

  const sendChatMessage = useCallback(async (petId: string, messages: ChatMessage[]): Promise<ChatResponse | null> => {
    const baseUrl = getBaseUrl();
    if (!baseUrl) return null;

    try {
      setIsChatting(true);
      const headers = await getAuthHeaders();
      if (!headers) return null;

      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ petId, messages }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload: ChatResponse = await response.json();
      return payload;
    } catch (error: any) {
      toast({
        title: 'Chat failed',
        description: error.message || 'Unable to reach MCP server.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsChatting(false);
    }
  }, [getBaseUrl, getAuthHeaders]);

  return { triggerAnalysis, fetchBreedBreakdown, sendChatMessage, isAnalyzing, isFetchingBreed, isChatting };
}
