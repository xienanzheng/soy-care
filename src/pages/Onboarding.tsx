import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileLayout, PageHeader, PageContent } from '@/components/layout/MobileLayout';
import { PhotoUpload } from '@/components/common/PhotoUpload';
import { useApp } from '@/contexts/AppContext';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const SPECIES_OPTIONS = ['Dog', 'Cat', 'Rabbit', 'Hamster', 'Guinea Pig', 'Others'];
const BREED_OPTIONS: Record<string, string[]> = {
  Dog: ['Golden Retriever', 'Beagle', 'Terrier', 'Corgi', 'Border Collie', 'Pomeranian', 'Spitz', 'Great Dane', 'Poodle', 'Maltese', 'Others'],
  Cat: ['Persian', 'Siamese', 'Maine Coon', 'Ragdoll', 'British Shorthair', 'Others'],
  Rabbit: ['Holland Lop', 'Mini Rex', 'Netherland Dwarf', 'Others'],
  Hamster: ['Syrian', 'Dwarf', 'Roborovski', 'Others'],
  'Guinea Pig': ['American', 'Peruvian', 'Abyssinian', 'Others'],
  Others: ['Others'],
};

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const PERSONALITY_OPTIONS = ['Calm', 'Playful', 'Sensitive', 'High energy', 'Chill', 'Curious'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { createPet, setSelectedPetId, isCreatingPet } = useApp();
  const { uploadPhoto, isUploading } = usePhotoUpload();
  const [step, setStep] = useState(1);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [petData, setPetData] = useState({
    name: '',
    species: '',
    breed: '',
    customBreed: '',
    gender: '',
    dateOfBirth: '',
    photoUrl: '',
    handle: '',
    ownerName: '',
    medicalHistory: '',
    allergies: '',
    favoriteActivities: '',
    personality: '',
  });

  const totalSteps = 4;

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      const finalBreed = petData.breed === 'Others' ? petData.customBreed : petData.breed;
      
      try {
        // Upload photo if selected
        let photoUrl = petData.photoUrl;
        if (photoFile) {
          const uploadedUrl = await uploadPhoto(photoFile, 'pet-photos', 'pets');
          if (uploadedUrl) {
            photoUrl = uploadedUrl;
          }
        }

        const newPet = await createPet({
          name: petData.name,
          handle: petData.handle || `@${petData.name.toLowerCase().replace(/\s+/g, '')}`,
          species: petData.species,
          breed: finalBreed,
          gender: (petData.gender || 'other') as 'male' | 'female' | 'other',
          dateOfBirth: petData.dateOfBirth || undefined,
          photoUrl: photoUrl || undefined,
          ownerName: petData.ownerName || undefined,
          medicalHistory: petData.medicalHistory || undefined,
          allergies: petData.allergies || undefined,
          favoriteActivities: petData.favoriteActivities || undefined,
          personality: petData.personality || undefined,
        });
        
        setSelectedPetId(newPet.id);
        toast({ title: "Pet added!", description: `Welcome ${petData.name} to Soycraft!` });
        navigate('/dashboard');
      } catch (error: any) {
        toast({ 
          title: "Failed to add pet", 
          description: error.message,
          variant: "destructive" 
        });
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/dashboard');
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return petData.name.trim().length > 0;
      case 2:
        const breedValid = petData.breed === 'Others' 
          ? petData.customBreed.trim().length > 0 
          : petData.breed.length > 0;
        return petData.species.length > 0 && breedValid;
      case 3:
        return true; // Gender and DOB are optional
      case 4:
        return true; // Profile extras optional
      default:
        return false;
    }
  };

  return (
    <MobileLayout>
      <PageHeader
        leftAction={
          <button onClick={handleBack} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />

      <PageContent className="flex flex-col">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i < step ? "bg-primary" : "bg-card-muted"
              )}
            />
          ))}
        </div>

        {/* Step 1: Photo & Name */}
        {step === 1 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h1 className="text-2xl font-display font-semibold mb-2">Let's meet your pet</h1>
              <p className="text-muted-foreground">
                Upload a hero photo so AI can recognise them and estimate their breed mix.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <PhotoUpload
                value={petData.photoUrl}
                onChange={(url) => setPetData({ ...petData, photoUrl: url || '' })}
                onFileSelect={(file) => setPhotoFile(file)}
                isUploading={isUploading}
                size="lg"
                shape="square"
              />
              <p className="text-xs text-muted-foreground text-center">
                The photo powers the AI dashboard (breed percentages, stool analysis and more).
              </p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Name</p>
              <Input
                placeholder="e.g., Luna"
                value={petData.name}
                onChange={(e) => setPetData({ ...petData, name: e.target.value })}
                className="mb-2"
              />
              <p className="text-xs text-muted-foreground">
                You can add more pets anytime from your profile.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Species & Breed */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-display font-semibold mb-2">What are your pet's attributes</h1>
            <p className="text-muted-foreground mb-8">Select species and breed</p>

            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Species</p>
              <div className="flex flex-wrap gap-2">
                {SPECIES_OPTIONS.map((species) => (
                  <button
                    key={species}
                    onClick={() => setPetData({ ...petData, species, breed: '' })}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      petData.species === species
                        ? "bg-primary text-primary-foreground"
                        : "bg-card-muted hover:bg-card-subtle"
                    )}
                  >
                    {species}
                  </button>
                ))}
              </div>
            </div>

            {petData.species && (
              <div className="animate-fade-in">
                <p className="text-sm font-medium mb-3">Breed</p>
                <div className="flex flex-wrap gap-2">
                  {BREED_OPTIONS[petData.species]?.map((breed) => (
                    <button
                      key={breed}
                      onClick={() => setPetData({ ...petData, breed, customBreed: breed === 'Others' ? petData.customBreed : '' })}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all",
                        petData.breed === breed
                          ? "bg-primary text-primary-foreground"
                          : "bg-card-muted hover:bg-card-subtle"
                      )}
                    >
                      {breed}
                    </button>
                  ))}
                </div>
                
                {petData.breed === 'Others' && (
                  <div className="mt-4 animate-fade-in">
                    <Input
                      placeholder="e.g., Sheepadoodle mix"
                      value={petData.customBreed}
                      onChange={(e) => setPetData({ ...petData, customBreed: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Gender & Date of Birth */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-display font-semibold mb-2">A few more details</h1>
            <p className="text-muted-foreground mb-8">Tell us about {petData.name}</p>

            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Owner name</label>
              <Input
                placeholder="e.g., Taylor Chen"
                value={petData.ownerName}
                onChange={(e) => setPetData({ ...petData, ownerName: e.target.value })}
              />
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Gender</p>
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPetData({ ...petData, gender: option.value })}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      petData.gender === option.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-card-muted hover:bg-card-subtle"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Personality</p>
              <div className="flex flex-wrap gap-2">
                {PERSONALITY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => setPetData({ ...petData, personality: option })}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      petData.personality === option
                        ? "bg-primary text-primary-foreground"
                        : "bg-card-muted hover:bg-card-subtle"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Date of Birth</p>
              <Input
                type="date"
                placeholder="2021-09-15"
                value={petData.dateOfBirth}
                onChange={(e) => setPetData({ ...petData, dateOfBirth: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground mt-2">Optional - helps track your pet's age</p>
            </div>
          </div>
        )}

        {/* Step 4: Handle & extras */}
        {step === 4 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h1 className="text-2xl font-display font-semibold mb-2">Personalize their profile</h1>
              <p className="text-muted-foreground mb-4">Give Soycraft more context so insights feel personal.</p>

              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input
                  placeholder={petData.name ? petData.name.toLowerCase().replace(/\s+/g, '') : 'soycraftpup'}
                  value={petData.handle}
                  onChange={(e) => setPetData({ ...petData, handle: e.target.value })}
                  className="pl-8"
                />
              </div>

              <label className="text-sm font-medium mb-2 block">Favourite activities</label>
              <Input
                placeholder="e.g., park runs, puzzle toys"
                value={petData.favoriteActivities}
                onChange={(e) => setPetData({ ...petData, favoriteActivities: e.target.value })}
                className="mb-4"
              />

              <label className="text-sm font-medium mb-2 block">Medical history</label>
              <textarea
                placeholder="Chicken sensitivity; ACL surgery in 2022"
                value={petData.medicalHistory}
                onChange={(e) => setPetData({ ...petData, medicalHistory: e.target.value })}
                className="w-full h-24 rounded-xl bg-card-subtle px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 mb-4"
              />

              <label className="text-sm font-medium mb-2 block">Allergies</label>
              <Input
                placeholder="e.g., chicken protein, grass"
                value={petData.allergies}
                onChange={(e) => setPetData({ ...petData, allergies: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-auto pt-8 flex gap-3">
          {step > 1 && (
            <Button variant="secondary" onClick={handleBack} className="flex-1">
              Previous
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!isStepValid() || isCreatingPet || isUploading}
            className="flex-1"
          >
            {isCreatingPet || isUploading ? 'Adding...' : step === totalSteps ? 'Finish' : 'Next'}
          </Button>
        </div>
      </PageContent>
    </MobileLayout>
  );
}
