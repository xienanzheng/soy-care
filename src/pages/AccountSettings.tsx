import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileLayout, PageHeader, PageContent } from '@/components/layout/MobileLayout';
import { PhotoUpload } from '@/components/common/PhotoUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { toast } from '@/hooks/use-toast';

export default function AccountSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const { uploadPhoto, isUploading } = usePhotoUpload();
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      let avatarUrl = formData.avatarUrl;
      
      if (photoFile) {
        const uploadedUrl = await uploadPhoto(photoFile, 'pet-photos', 'avatars');
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      await updateProfile({
        displayName: formData.displayName || undefined,
        avatarUrl: avatarUrl || undefined,
      });
      
      toast({ title: "Profile updated!", description: "Your profile has been saved." });
      navigate('/settings');
    } catch (error: any) {
      toast({ 
        title: "Failed to update profile", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <PageHeader
          leftAction={
            <button onClick={() => navigate('/settings')} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
          }
          title="Account"
        />
        <PageContent className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </PageContent>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <PageHeader
        leftAction={
          <button onClick={() => navigate('/settings')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
        title="Account"
      />

      <PageContent className="flex flex-col pb-8">
        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <PhotoUpload
            value={formData.avatarUrl}
            onChange={(url) => setFormData({ ...formData, avatarUrl: url || '' })}
            onFileSelect={(file) => setPhotoFile(file)}
            isUploading={isUploading}
            size="lg"
            shape="circle"
            placeholder="Add photo"
          />
        </div>

        {/* Email (read-only) */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Email</label>
          <Input
            value={user?.email || ''}
            disabled
            className="bg-card-muted"
          />
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
        </div>

        {/* Display Name */}
        <div className="mb-8">
          <label className="text-sm font-medium mb-2 block">Display Name</label>
          <Input
            placeholder="e.g., Taylor Chen"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isUpdating || isUploading}
          className="w-full"
        >
          {isUpdating || isUploading ? 'Saving...' : 'Save Changes'}
        </Button>
      </PageContent>
    </MobileLayout>
  );
}
