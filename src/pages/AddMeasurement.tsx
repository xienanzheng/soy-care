import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileLayout, PageHeader, PageContent } from '@/components/layout/MobileLayout';
import { PetSelector } from '@/components/common/PetSelector';
import { useApp } from '@/contexts/AppContext';
import { useMeasurementLogs } from '@/hooks/useLogs';
import { toast } from '@/hooks/use-toast';

export default function AddMeasurement() {
  const navigate = useNavigate();
  const { pets, selectedPet, selectedPetId, setSelectedPetId } = useApp();
  const { createLog, isCreating } = useMeasurementLogs(selectedPetId);
  
  const [formData, setFormData] = useState({
    weightKg: '',
    neckCm: '',
    chestCm: '',
    bodyLengthCm: '',
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: new Date().toTimeString().slice(0, 5),
  });

  const handleSubmit = async () => {
    if (!selectedPet || !selectedPetId) {
      toast({ title: "No pet selected", variant: "destructive" });
      return;
    }

    if (!formData.weightKg && !formData.neckCm && !formData.chestCm && !formData.bodyLengthCm) {
      toast({ title: "Please enter at least one measurement", variant: "destructive" });
      return;
    }

    try {
      // Create timestamp from date and time
      const timestamp = new Date(`${formData.date}T${formData.time}`).toISOString();

      await createLog({
        petId: selectedPetId,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : undefined,
        neckCm: formData.neckCm ? parseFloat(formData.neckCm) : undefined,
        chestCm: formData.chestCm ? parseFloat(formData.chestCm) : undefined,
        bodyLengthCm: formData.bodyLengthCm ? parseFloat(formData.bodyLengthCm) : undefined,
        notes: formData.notes || undefined,
        timestamp,
      });

      toast({ title: "Measurement added", description: formData.weightKg ? `Weight: ${formData.weightKg}kg` : "Measurements saved" });
      navigate('/dashboard');
    } catch (error: any) {
      toast({ title: "Failed to add measurement", description: error.message, variant: "destructive" });
    }
  };

  return (
    <MobileLayout>
      <PageHeader
        title="Add Measurements"
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

        {/* Weight */}
        <div>
          <label className="text-sm font-medium mb-2 block">Weight (kg)</label>
          <Input
            type="number"
            step="0.1"
            placeholder="6.5"
            value={formData.weightKg}
            onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
          />
        </div>

        {/* Neck */}
        <div>
          <label className="text-sm font-medium mb-2 block">Neck Circumference (cm)</label>
          <Input
            type="number"
            step="0.1"
            placeholder="28"
            value={formData.neckCm}
            onChange={(e) => setFormData({ ...formData, neckCm: e.target.value })}
          />
        </div>

        {/* Chest */}
        <div>
          <label className="text-sm font-medium mb-2 block">Chest/Girth (cm)</label>
          <Input
            type="number"
            step="0.1"
            placeholder="45"
            value={formData.chestCm}
            onChange={(e) => setFormData({ ...formData, chestCm: e.target.value })}
          />
        </div>

        {/* Body Length */}
        <div>
          <label className="text-sm font-medium mb-2 block">Body Length (cm)</label>
          <Input
            type="number"
            step="0.1"
            placeholder="52"
            value={formData.bodyLengthCm}
            onChange={(e) => setFormData({ ...formData, bodyLengthCm: e.target.value })}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium mb-2 block">Notes</label>
          <textarea
            placeholder="e.g., Weighed after morning walk"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full h-24 rounded-xl bg-card-subtle px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Submit button */}
        <Button onClick={handleSubmit} className="w-full mt-8" disabled={isCreating}>
          {isCreating ? 'Saving...' : 'Save Measurements'}
        </Button>
      </PageContent>
    </MobileLayout>
  );
}
