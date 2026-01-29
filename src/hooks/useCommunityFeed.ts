import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityPost } from '@/types/pet';

export function useCommunityFeed() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['community_posts', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map(
        (post): CommunityPost => ({
          id: post.id,
          petId: post.pet_id,
          ownerName: post.owner_name,
          content: post.content,
          photoUrl: post.photo_url || undefined,
          likes: post.likes || undefined,
          createdAt: post.created_at,
        })
      );
    },
    enabled: !!user,
  });

  return {
    posts: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
