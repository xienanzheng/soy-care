import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileLayout, PageHeader, PageContent } from '@/components/layout/MobileLayout';
import { PetSelector } from '@/components/common/PetSelector';
import { PhotoUpload } from '@/components/common/PhotoUpload';
import { RatingSlider } from '@/components/common/RatingSlider';
import { useApp } from '@/contexts/AppContext';
import { usePoopLogs } from '@/hooks/useLogs';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PoopLog, MoistureLevel } from '@/types/pet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

const CONSISTENCY_OPTIONS = [
  { value: 'regular', label: 'Regular' },
  { value: 'soft', label: 'Soft' },
  { value: 'sticky', label: 'Sticky' },
  { value: 'hard', label: 'Hard' },
  { value: 'diarrhea', label: 'Diarrhea' },
] as const;

const COLOR_OPTIONS = [
  { value: 'brown', label: 'Brown' },
  { value: 'dark_brown', label: 'Dark Brown' },
  { value: 'light_brown', label: 'Light Brown' },
  { value: 'black', label: 'Black / Tarry' },
  { value: 'red', label: 'Red / Bloody' },
  { value: 'green', label: 'Green' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'orange', label: 'Orange' },
  { value: 'white', label: 'White' },
  { value: 'grey', label: 'Grey' },
  { value: 'clay', label: 'Clay' },
] as const;

const AMOUNT_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
] as const;

const MOISTURE_OPTIONS: { value: MoistureLevel; label: string }[] = [
  { value: 'dry', label: 'Dry' },
  { value: 'normal', label: 'Normal' },
  { value: 'wet', label: 'Wet' },
];

const UNDESIRABLE_BEHAVIOR_OPTIONS = [
  { value: 'not_applicable', label: 'Not applicable' },
  { value: 'undesirable_behavior', label: 'Undesirable behavior' },
  { value: 'lip_paws', label: 'Lip paws' },
  { value: 'vomit', label: 'Vomit' },
  { value: 'other', label: 'Others' },
] as const;

export default function AddPoop() {
  const navigate = useNavigate();
  const { pets, selectedPet, selectedPetId, setSelectedPetId } = useApp();
  const { createLog, isCreating } = usePoopLogs(selectedPetId);
  const { uploadPhoto, isUploading } = usePhotoUpload();
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    consistency: '' as PoopLog['consistency'] | '',
    color: '' as PoopLog['color'] | '',
    amount: '' as PoopLog['amount'] | '',
    location: '',
    notes: '',
    userRating: undefined as number | undefined,
    date: format(new Date(), 'yyyy-MM-dd'),
    time: new Date().toTimeString().slice(0, 5),
    moistureLevel: '' as MoistureLevel | '',
    bloodPresent: false,
    mucusPresent: false,
    smellLevel: 3,
    undesirableBehaviors: [] as string[],
    undesirableBehaviorNotes: '',
  });

  const handleBehaviorToggle = (value: string) => {
    setFormData((prev) => {
      if (value === 'not_applicable') {
        const isAlreadySelected = prev.undesirableBehaviors.includes(value);
        return {
          ...prev,
          undesirableBehaviors: isAlreadySelected ? [] : ['not_applicable'],
          undesirableBehaviorNotes: isAlreadySelected ? prev.undesirableBehaviorNotes : '',
        };
      }

      const cleaned = prev.undesirableBehaviors.filter((item) => item !== 'not_applicable');
      const exists = cleaned.includes(value);
      const updated = exists ? cleaned.filter((item) => item !== value) : [...cleaned, value];
      return {
        ...prev,
        undesirableBehaviors: updated,
        undesirableBehaviorNotes: updated.includes('other') ? prev.undesirableBehaviorNotes : '',
      };
    });
  };

  const handleSubmit = async () => {
    if (!selectedPet || !selectedPetId) {
      toast({ title: "No pet selected", variant: "destructive" });
      return;
    }

    if (!formData.consistency || !formData.color || !formData.amount) {
      toast({ title: "Please select consistency, color, and amount", variant: "destructive" });
      return;
    }

    try {
      // Upload photo if selected
      let photoUrl: string | undefined;
      if (photoFile) {
        const uploadedUrl = await uploadPhoto(photoFile, 'log-photos', 'poop');
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }

      // Create timestamp from date and time
      const timestamp = new Date(`${formData.date}T${formData.time}`).toISOString();

      await createLog({
        petId: selectedPetId,
        consistency: formData.consistency,
        color: formData.color,
        amount: formData.amount,
        location: formData.location,
        notes: formData.notes || undefined,
        photoUrl,
        userRating: formData.userRating,
        timestamp,
        aiStatus: 'not_requested',
        moistureLevel: formData.moistureLevel || undefined,
        bloodPresent: formData.bloodPresent,
        mucusPresent: formData.mucusPresent,
        smellLevel: formData.smellLevel,
        undesirableBehaviors: formData.undesirableBehaviors.length
          ? formData.undesirableBehaviors
          : undefined,
        undesirableBehaviorNotes: formData.undesirableBehaviorNotes || undefined,
      });

      toast({ title: "Poop log added", description: `${formData.consistency} - ${formData.amount}` });
      navigate('/dashboard');
    } catch (error: any) {
      toast({ title: "Failed to add log", description: error.message, variant: "destructive" });
    }
  };

  return (
    <MobileLayout>
      <PageHeader
        title="Add Poop"
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

        {/* AI Badge */}
        <div className="p-4 rounded-xl bg-accent-pink/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-sm">AI Health Insights</p>
            <p className="text-xs text-muted-foreground">
              Upload a clear photo to unlock AI stool analysis inside the Analytics Lab.
            </p>
          </div>
        </div>

        {/* Photo upload */}
        <div>
          <label className="text-sm font-medium mb-2 block">Photo (recommended for AI)</label>
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

        {/* Consistency */}
        <div>
          <label className="text-sm font-medium mb-2 block">Consistency</label>
          <div className="grid grid-cols-2 gap-2">
            {CONSISTENCY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, consistency: option.value })}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  formData.consistency === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card-muted hover:bg-card-subtle"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="text-sm font-medium mb-2 block">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, color: option.value })}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  formData.color === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card-muted hover:bg-card-subtle"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm font-medium mb-2 block">Amount</label>
          <div className="grid grid-cols-3 gap-2">
            {AMOUNT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, amount: option.value })}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  formData.amount === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card-muted hover:bg-card-subtle"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Moisture */}
        <div>
          <label className="text-sm font-medium mb-2 block">Moisture level</label>
          <div className="grid grid-cols-3 gap-2">
            {MOISTURE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, moistureLevel: option.value })}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  formData.moistureLevel === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card-muted hover:bg-card-subtle"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Smell + blood/mucus */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Smell intensity</label>
            <Slider
              min={1}
              max={5}
              step={1}
              value={[formData.smellLevel]}
              onValueChange={(value) => setFormData({ ...formData, smellLevel: value[0] || 1 })}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Mild</span>
              <span>Strong</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between rounded-xl bg-card-subtle px-4 py-3">
              <div>
                <p className="text-sm font-medium">Blood spotted?</p>
                <p className="text-xs text-muted-foreground">We’ll highlight this in AI summaries.</p>
              </div>
              <Switch
                checked={formData.bloodPresent}
                onCheckedChange={(checked) => setFormData({ ...formData, bloodPresent: checked })}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-card-subtle px-4 py-3">
              <div>
                <p className="text-sm font-medium">Mucus present?</p>
                <p className="text-xs text-muted-foreground">Helps identify inflammation issues.</p>
              </div>
              <Switch
                checked={formData.mucusPresent}
                onCheckedChange={(checked) => setFormData({ ...formData, mucusPresent: checked })}
              />
            </div>
          </div>
        </div>

        {/* Undesirable behaviors */}
        <div>
          <label className="text-sm font-medium mb-2 block">Undesirable behavior</label>
          <div className="grid grid-cols-2 gap-2">
            {UNDESIRABLE_BEHAVIOR_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleBehaviorToggle(option.value)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all text-left',
                  formData.undesirableBehaviors.includes(option.value)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card-muted hover:bg-card-subtle'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {formData.undesirableBehaviors.includes('other') && (
            <Input
              className="mt-3"
              placeholder="Describe the behavior"
              value={formData.undesirableBehaviorNotes}
              onChange={(e) => setFormData({ ...formData, undesirableBehaviorNotes: e.target.value })}
            />
          )}
        </div>

        {/* User Rating */}
        <RatingSlider
          value={formData.userRating}
          onChange={(rating) => setFormData({ ...formData, userRating: rating })}
        />

        {/* Location */}
        <div>
          <label className="text-sm font-medium mb-2 block">Location</label>
          <Input
            placeholder="e.g., Backyard, Walk"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium mb-2 block">Additional Notes</label>
          <textarea
            placeholder="e.g., Noticed a tiny streak of mucus"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full h-24 rounded-xl bg-card-subtle px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Submit button */}
        <Button onClick={handleSubmit} className="w-full mt-8" disabled={isCreating || isUploading}>
          {isCreating || isUploading ? 'Adding...' : 'Add Poop'}
        </Button>

        {/* Quick action */}
        <Button variant="secondary" onClick={() => navigate('/add-supplement')} className="w-full">
          Add Supplements
        </Button>
      </PageContent>
    </MobileLayout>
  );
}
