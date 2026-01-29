import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileLayout, PageHeader, PageContent } from '@/components/layout/MobileLayout';
import { PetSelector } from '@/components/common/PetSelector';
import { PhotoUpload } from '@/components/common/PhotoUpload';
import { useApp } from '@/contexts/AppContext';
import { useFoodLogs } from '@/hooks/useLogs';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useMealPresets } from '@/hooks/useMealPresets';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MealPreset } from '@/types/pet';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const FOOD_TYPES = ['Kibble', 'Wet Food', 'Raw', 'Freeze Dried', 'Homemade', 'Treats'];

export default function AddFood() {
  const navigate = useNavigate();
  const { pets, selectedPet, selectedPetId, setSelectedPetId } = useApp();
  const { createLog, isCreating } = useFoodLogs(selectedPetId);
  const { uploadPhoto, isUploading } = usePhotoUpload();
  const {
    presets,
    isLoading: presetsLoading,
    createPreset,
    isSavingPreset,
    deletePreset,
  } = useMealPresets();
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [presetName, setPresetName] = useState('');
  const [formData, setFormData] = useState({
    foodName: '',
    customFood: '',
    amountGrams: '',
    mealType: 'breakfast' as typeof MEAL_TYPES[number],
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: new Date().toTimeString().slice(0, 5),
    calories: '',
    proteinPercent: '',
    fatPercent: '',
    carbPercent: '',
  });
  const resolvedFoodName = formData.customFood || formData.foodName;

  const handleSubmit = async () => {
    if (!selectedPet || !selectedPetId) {
      toast({ title: "No pet selected", variant: "destructive" });
      return;
    }

    if (!resolvedFoodName || !formData.amountGrams) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    try {
      // Upload photo if selected
      let photoUrl: string | undefined;
      if (photoFile) {
        const uploadedUrl = await uploadPhoto(photoFile, 'log-photos', 'food');
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }

      // Create timestamp from date and time
      const timestamp = new Date(`${formData.date}T${formData.time}`).toISOString();

      await createLog({
        petId: selectedPetId,
        foodName: resolvedFoodName,
        amountGrams: parseInt(formData.amountGrams),
        mealType: formData.mealType,
        notes: formData.notes || undefined,
        photoUrl,
        timestamp,
        calories: formData.calories ? parseInt(formData.calories) : undefined,
        proteinPercent: formData.proteinPercent ? parseInt(formData.proteinPercent) : undefined,
        fatPercent: formData.fatPercent ? parseInt(formData.fatPercent) : undefined,
        carbPercent: formData.carbPercent ? parseInt(formData.carbPercent) : undefined,
      });

      toast({ title: "Food log added", description: `${resolvedFoodName} - ${formData.amountGrams}g` });
      navigate('/dashboard');
    } catch (error: any) {
      toast({ title: "Failed to add log", description: error.message, variant: "destructive" });
    }
  };

  const handleApplyPreset = (preset: MealPreset) => {
    setFormData((prev) => ({
      ...prev,
      foodName: preset.defaultFoodName,
      customFood: '',
      amountGrams: preset.defaultAmountGrams ? String(preset.defaultAmountGrams) : '',
      mealType: (preset.defaultMealType as typeof MEAL_TYPES[number]) || prev.mealType,
      calories: preset.defaultCalories ? String(preset.defaultCalories) : '',
      proteinPercent: preset.defaultProteinPercent ? String(preset.defaultProteinPercent) : '',
      fatPercent: preset.defaultFatPercent ? String(preset.defaultFatPercent) : '',
      carbPercent: preset.defaultCarbPercent ? String(preset.defaultCarbPercent) : '',
      notes: preset.notes || prev.notes,
    }));
    toast({ title: 'Preset applied', description: `${preset.name} loaded.` });
  };

  const handleSavePreset = async () => {
    if (!resolvedFoodName || !formData.amountGrams) {
      toast({
        title: 'Add required info',
        description: 'Select or enter a food name and amount before saving a preset.',
        variant: 'destructive',
      });
      return;
    }

    const nameToSave = presetName || resolvedFoodName;
    try {
      await createPreset({
        name: nameToSave,
        defaultFoodName: resolvedFoodName,
        defaultMealType: formData.mealType,
        defaultAmountGrams: parseInt(formData.amountGrams),
        defaultCalories: formData.calories ? parseInt(formData.calories) : undefined,
        defaultProteinPercent: formData.proteinPercent ? parseInt(formData.proteinPercent) : undefined,
        defaultFatPercent: formData.fatPercent ? parseInt(formData.fatPercent) : undefined,
        defaultCarbPercent: formData.carbPercent ? parseInt(formData.carbPercent) : undefined,
        notes: formData.notes || undefined,
      });
      toast({ title: 'Preset saved', description: `${nameToSave} is ready for next time.` });
      setPresetName('');
    } catch (error: any) {
      toast({ title: 'Unable to save preset', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    try {
      await deletePreset(presetId);
      toast({ title: 'Preset deleted' });
    } catch (error: any) {
      toast({ title: 'Unable to delete preset', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <MobileLayout>
      <PageHeader
        title="Add Food"
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

        {/* Food type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Food Type</label>
          <div className="flex flex-wrap gap-2">
            {FOOD_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setFormData({ ...formData, foodName: type, customFood: '' })}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  formData.foodName === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-card-muted hover:bg-card-subtle"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Custom food name */}
        <div>
          <label className="text-sm font-medium mb-2 block">Or enter custom food</label>
          <Input
            placeholder="e.g., Chicken"
            value={formData.customFood}
            onChange={(e) => setFormData({ ...formData, customFood: e.target.value, foodName: '' })}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Meal presets</label>
            {presetsLoading && <span className="text-xs text-muted-foreground">Loading…</span>}
          </div>
          {presets.length === 0 && !presetsLoading ? (
            <p className="text-xs text-muted-foreground">
              Save any meal below to auto-fill portions and macros next time.
            </p>
          ) : (
            <div className="space-y-2">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{preset.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {preset.defaultAmountGrams ? `${preset.defaultAmountGrams}g` : 'Tap to autofill'}
                      {preset.defaultMealType ? ` • ${preset.defaultMealType}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleApplyPreset(preset)}
                    >
                      Use
                    </Button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreset(preset.id);
                      }}
                      className="p-1 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete preset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-card-subtle p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Save current meal as preset</label>
            <span className="text-xs text-muted-foreground">Skip typing later</span>
          </div>
          <Input
            placeholder="Optional preset name"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={handleSavePreset}
            disabled={isSavingPreset}
          >
            {isSavingPreset ? 'Saving…' : 'Save preset'}
          </Button>
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm font-medium mb-2 block">Amount (grams)</label>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-card-muted flex items-center justify-center">
              <span className="text-lg">🍽️</span>
            </div>
            <Input
              type="number"
              placeholder="120"
              value={formData.amountGrams}
              onChange={(e) => setFormData({ ...formData, amountGrams: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>

        {/* Nutrition */}
        <div>
          <label className="text-sm font-medium mb-2 block">Nutrition (optional)</label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="320"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
            />
            <Input
              type="number"
              placeholder="32"
              value={formData.proteinPercent}
              onChange={(e) => setFormData({ ...formData, proteinPercent: e.target.value })}
            />
            <Input
              type="number"
              placeholder="18"
              value={formData.fatPercent}
              onChange={(e) => setFormData({ ...formData, fatPercent: e.target.value })}
            />
            <Input
              type="number"
              placeholder="40"
              value={formData.carbPercent}
              onChange={(e) => setFormData({ ...formData, carbPercent: e.target.value })}
            />
          </div>
        </div>

        {/* Meal type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Meal</label>
          <div className="flex flex-wrap gap-2">
            {MEAL_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setFormData({ ...formData, mealType: type })}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all capitalize",
                  formData.mealType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-card-muted hover:bg-card-subtle"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium mb-2 block">Additional Notes</label>
          <textarea
            placeholder="e.g., Mixed with warm water for easier chewing"
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
          {isCreating || isUploading ? 'Adding...' : 'Add Food'}
        </Button>

        {/* Quick action */}
        <Button variant="secondary" onClick={() => navigate('/add-supplement')} className="w-full">
          Add Supplements
        </Button>
      </PageContent>
    </MobileLayout>
  );
}
