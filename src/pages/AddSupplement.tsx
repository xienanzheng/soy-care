import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileLayout, PageHeader, PageContent } from '@/components/layout/MobileLayout';
import { PetSelector } from '@/components/common/PetSelector';
import { PhotoUpload } from '@/components/common/PhotoUpload';
import { useApp } from '@/contexts/AppContext';
import { useSupplementLogs } from '@/hooks/useLogs';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { SupplementLog } from '@/types/pet';

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As Needed' },
] as const;

const COMMON_SUPPLEMENTS = [
  'Probiotics',
  'Fish Oil',
  'Glucosamine',
  'Multivitamin',
  'Psyllium Husk',
  'Coconut Oil',
];

export default function AddSupplement() {
  const navigate = useNavigate();
  const { pets, selectedPet, selectedPetId, setSelectedPetId } = useApp();
  const { createLog, isCreating } = useSupplementLogs(selectedPetId);
  const { uploadPhoto, isUploading } = usePhotoUpload();
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    supplementName: '',
    customName: '',
    dosage: '',
    frequency: 'daily' as SupplementLog['frequency'],
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: new Date().toTimeString().slice(0, 5),
    purpose: '',
  });

  const handleSubmit = async () => {
    if (!selectedPet || !selectedPetId) {
      toast({ title: "No pet selected", variant: "destructive" });
      return;
    }

    const supplementName = formData.customName || formData.supplementName;
    if (!supplementName || !formData.dosage) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    try {
      // Upload photo if selected
      let photoUrl: string | undefined;
      if (photoFile) {
        const uploadedUrl = await uploadPhoto(photoFile, 'log-photos', 'supplements');
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }

      // Create timestamp from date and time
      const timestamp = new Date(`${formData.date}T${formData.time}`).toISOString();

      await createLog({
        petId: selectedPetId,
        supplementName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        notes: formData.notes || undefined,
        photoUrl,
        timestamp,
        purpose: formData.purpose || undefined,
      });

      toast({ title: "Supplement added", description: `${supplementName} - ${formData.dosage}` });
      navigate('/dashboard');
    } catch (error: any) {
      toast({ title: "Failed to add supplement", description: error.message, variant: "destructive" });
    }
  };

  return (
    <MobileLayout>
      <PageHeader
        title="Add Supplements"
        leftAction={
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <X className="w-5 h-5" />
          </button>
        }
      />

      <PageContent className="space-y-6">
        {/* Pet Selector */}
        <PetSelector
          pets={pets}
          selectedPetId={selectedPetId}
          onSelectPet={setSelectedPetId}
          showAddButton={false}
        />

        {/* Date and Time selector */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Date</label>
            <Input
              type="date"
              placeholder="2024-05-01"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              max={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Time</label>
            <Input
              type="time"
              placeholder="08:30"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
        </div>

        {/* Common supplements */}
        <div>
          <label className="text-sm font-medium mb-2 block">Supplement</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_SUPPLEMENTS.map((name) => (
              <button
                key={name}
                onClick={() => setFormData({ ...formData, supplementName: name, customName: '' })}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  formData.supplementName === name
                    ? "bg-primary text-primary-foreground"
                    : "bg-card-muted hover:bg-card-subtle"
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom supplement name */}
        <div>
          <label className="text-sm font-medium mb-2 block">Or enter custom supplement</label>
          <Input
            placeholder="e.g., Vitamin E"
            value={formData.customName}
            onChange={(e) => setFormData({ ...formData, customName: e.target.value, supplementName: '' })}
          />
        </div>

        {/* Dosage */}
        <div>
          <label className="text-sm font-medium mb-2 block">Dosage</label>
          <Input
            placeholder="e.g., 1 tablespoon"
            value={formData.dosage}
            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
          />
        </div>

        {/* Purpose */}
        <div>
          <label className="text-sm font-medium mb-2 block">Purpose / reason</label>
          <Input
            placeholder="e.g., gut health"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="text-sm font-medium mb-2 block">Frequency</label>
          <div className="grid grid-cols-3 gap-2">
            {FREQUENCY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, frequency: option.value })}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  formData.frequency === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card-muted hover:bg-card-subtle"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium mb-2 block">Additional Notes</label>
          <textarea
            placeholder="e.g., Give with dinner if tummy is upset"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full h-24 rounded-xl bg-card-subtle px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Photo upload */}
        <div>
          <label className="text-sm font-medium mb-2 block">Photo (optional)</label>
          <PhotoUpload
            value={photoPreview}
            onChange={setPhotoPreview}
            onFileSelect={setPhotoFile}
            isUploading={isUploading}
            size="lg"
            shape="square"
            className="w-full h-32"
          />
        </div>

        {/* Submit button */}
        <Button onClick={handleSubmit} className="w-full mt-8" disabled={isCreating || isUploading}>
          {isCreating || isUploading ? 'Adding...' : 'Add Supplements'}
        </Button>
      </PageContent>
    </MobileLayout>
  );
}
