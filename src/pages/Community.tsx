import { useMemo } from 'react';
import { Heart, RefreshCcw } from 'lucide-react';
import { MobileLayout, PageHeader, PageContent } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { useCommunityFeed } from '@/hooks/useCommunityFeed';
import { useApp } from '@/contexts/AppContext';
import { PetAvatar } from '@/components/common/PetAvatar';
import { format } from 'date-fns';

export default function Community() {
  const { posts, isLoading, refetch } = useCommunityFeed();
  const { pets } = useApp();

  const feed = useMemo(() => {
    return posts.map((post) => ({
      ...post,
      pet: pets.find((pet) => pet.id === post.petId),
    }));
  }, [posts, pets]);

  return (
    <MobileLayout>
      <PageHeader
        title="Community"
        rightAction={
          <button onClick={() => refetch()} className="p-2 -mr-2 text-primary">
            <RefreshCcw className="w-5 h-5" />
          </button>
        }
      />

      <PageContent className="pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">Loading feed…</div>
        ) : feed.length === 0 ? (
          <div className="rounded-2xl bg-card-muted p-6 text-center">
            <p className="font-medium mb-2">No posts yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Share a food log or poop entry with a note to let other pet parents know how it’s going.
            </p>
            <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Refresh</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {feed.map((post) => (
              <article key={post.id} className="p-4 rounded-2xl bg-card-muted space-y-3">
                <div className="flex items-center gap-3">
                  <PetAvatar name={post.pet?.name ?? 'Pet'} photoUrl={post.pet?.photoUrl} size="sm" />
                  <div>
                    <p className="font-medium">{post.pet?.name || 'Pet pal'}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.ownerName} • {format(new Date(post.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
                <p className="text-sm">{post.content}</p>
                {post.photoUrl && (
                  <img src={post.photoUrl} alt="Community" className="w-full h-48 object-cover rounded-xl" />
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    {post.likes ?? 0} cheers
                  </span>
                  {post.pet?.favoriteActivities && (
                    <span>Fav: {post.pet.favoriteActivities}</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </PageContent>

      <BottomNav />
    </MobileLayout>
  );
}
