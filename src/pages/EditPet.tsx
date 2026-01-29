import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileLayout, PageHeader, PageContent } from '@/components/layout/MobileLayout';
import { PhotoUpload } from '@/components/common/PhotoUpload';
import { useApp } from '@/contexts/AppContext';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { formatPetAge } from '@/lib/petAge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SPECIES_OPTIONS = ['Dog', 'Cat', 'Rabbit', 'Hamster', 'Guinea Pig', 'Others'];
const BREED_OPTIONS: Record<string, string[]> = {
  Dog: ['Golden Retriever', 'Beagle', 'Terrier', 'Corgi', 'Border Collie', 'Pomeranian', 'Spitz', 'Great Dane', 'Poodle', 'Maltese', 'Others'],
  Cat: ['Persian', 'Siamese', 'Maine Coon', 'Ragdoll', 'British Shorthair', 'Others'],
  Rabbit: ['Holland Lop', 'Mini Rex', 'Netherland Dwarf', 'Others'],
  Hamster: ['Syrian', 'Dwarf', 'Roborovski', 'Others'],
  'Guinea Pig': ['American', 'Peruvian', 'Abyssinian', 'Others'],
  Others: ['Others'],
};
const PERSONALITY_OPTIONS = ['Calm', 'Playful', 'Sensitive', 'High energy', 'Chill', 'Curious'];

export default function EditPet() {
  const navigate = useNavigate();
  const { petId } = useParams<{ petId: string }>();
  const { pets, updatePet, deletePet, selectedPetId, setSelectedPetId, isUpdatingPet, isDeletingPet } = useApp();
  const { uploadPhoto, isUploading } = usePhotoUpload();
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [petData, setPetData] = useState({
    name: '',
    species: '',
    breed: '',
    customBreed: '',
    photoUrl: '',
    handle: '',
    dateOfBirth: '',
    gender: 'other' as 'male' | 'female' | 'other',
    ownerName: '',
    medicalHistory: '',
    allergies: '',
    favoriteActivities: '',
    personality: '',
  });

  const pet = pets.find(p => p.id === petId);

  useEffect(() => {
    if (pet) {
      const isCustomBreed = pet.species && BREED_OPTIONS[pet.species] && !BREED_OPTIONS[pet.species].includes(pet.breed);
      setPetData({
        name: pet.name,
        species: pet.species,
        breed: isCustomBreed ? 'Others' : pet.breed,
        customBreed: isCustomBreed ? pet.breed : '',
        photoUrl: pet.photoUrl || '',
        handle: pet.handle.replace('@', ''),
        dateOfBirth: pet.dateOfBirth || '',
        gender: pet.gender,
        ownerName: pet.ownerName || '',
        medicalHistory: pet.medicalHistory || '',
        allergies: pet.allergies || '',
        favoriteActivities: pet.favoriteActivities || '',
        personality: pet.personality || '',
      });
    }
  }, [pet]);

  if (!pet) {
    return (
      <MobileLayout>
        <PageHeader
          leftAction={
            <button onClick={() => navigate('/pets')} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
          }
          title="Pet not found"
        />
        <PageContent className="flex items-center justify-center">
          <p className="text-muted-foreground">This pet doesn't exist.</p>
        </PageContent>
      </MobileLayout>
    );
  }

  const handleSave = async () => {
    const finalBreed = petData.breed === 'Others' ? petData.customBreed : petData.breed;
    
    try {
      let photoUrl = petData.photoUrl;
      if (photoFile) {
        const uploadedUrl = await uploadPhoto(photoFile, 'pet-photos', 'pets');
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }

      await updatePet({
        id: pet.id,
        name: petData.name,
        handle: petData.handle || petData.name.toLowerCase().replace(/\s+/g, ''),
        species: petData.species,
        breed: finalBreed,
        gender: petData.gender,
        dateOfBirth: petData.dateOfBirth || undefined,
        photoUrl: photoUrl || undefined,
        ownerName: petData.ownerName || undefined,
        medicalHistory: petData.medicalHistory || undefined,
        allergies: petData.allergies || undefined,
        favoriteActivities: petData.favoriteActivities || undefined,
        personality: petData.personality || undefined,
      });
      
      toast({ title: "Pet updated!", description: `${petData.name}'s profile has been saved.` });
      navigate('/pets');
    } catch (error: any) {
      toast({ 
        title: "Failed to update pet", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deletePet(pet.id);
      
      // If this was the selected pet, clear selection
      if (selectedPetId === pet.id) {
        const remainingPets = pets.filter(p => p.id !== pet.id);
        if (remainingPets.length > 0) {
          setSelectedPetId(remainingPets[0].id);
        } else {
          setSelectedPetId(null);
        }
      }
      
      toast({ title: "Pet deleted", description: `${pet.name} has been removed.` });
      navigate('/pets');
    } catch (error: any) {
      toast({ 
        title: "Failed to delete pet", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const isValid = petData.name.trim().length > 0 && 
    petData.species.length > 0 && 
    (petData.breed !== 'Others' ? petData.breed.length > 0 : petData.customBreed.trim().length > 0);

  return (
    <MobileLayout>
      <PageHeader
        leftAction={
          <button onClick={() => navigate('/pets')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
        title="Edit Pet"
        rightAction={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-2 -mr-2 text-destructive">
                <Trash2 className="w-5 h-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {pet.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All logs and measurements for {pet.name} will also be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeletingPet}
                >
                  {isDeletingPet ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />

      <PageContent className="flex flex-col pb-8">
        {/* Photo */}
        <div className="flex justify-center mb-8">
          <PhotoUpload
            value={petData.photoUrl}
            onChange={(url) => setPetData({ ...petData, photoUrl: url || '' })}
            onFileSelect={(file) => setPhotoFile(file)}
            isUploading={isUploading}
            size="lg"
            shape="square"
          />
        </div>

        {/* Name */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Name</label>
          <Input
            placeholder="e.g., Luna"
            value={petData.name}
            onChange={(e) => setPetData({ ...petData, name: e.target.value })}
          />
        </div>

        {/* Handle */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Handle</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
            <Input
              placeholder={petData.name ? petData.name.toLowerCase().replace(/\s+/g, '') : 'soycraftpup'}
              value={petData.handle}
              onChange={(e) => setPetData({ ...petData, handle: e.target.value })}
              className="pl-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Owner name</label>
            <Input
              placeholder="e.g., Taylor Chen"
              value={petData.ownerName}
              onChange={(e) => setPetData({ ...petData, ownerName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Favourite activities</label>
            <Input
              placeholder="e.g., trails, agility, naps"
              value={petData.favoriteActivities}
              onChange={(e) => setPetData({ ...petData, favoriteActivities: e.target.value })}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium mb-3 block">Personality</label>
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

        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Medical history</label>
          <textarea
            placeholder="Chicken sensitivity; pancreatitis flare in 2023"
            value={petData.medicalHistory}
            onChange={(e) => setPetData({ ...petData, medicalHistory: e.target.value })}
            className="w-full h-24 rounded-xl bg-card-subtle px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Allergies</label>
          <Input
            placeholder="e.g., chicken protein, grass"
            value={petData.allergies}
            onChange={(e) => setPetData({ ...petData, allergies: e.target.value })}
          />
        </div>

        {/* Species */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-3 block">Species</label>
          <div className="flex flex-wrap gap-2">
            {SPECIES_OPTIONS.map((species) => (
              <button
                key={species}
                onClick={() => setPetData({ ...petData, species, breed: '', customBreed: '' })}
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

        {/* Breed */}
        {petData.species && (
          <div className="mb-6 animate-fade-in">
            <label className="text-sm font-medium mb-3 block">Breed</label>
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
                  placeholder="Enter breed name"
                  value={petData.customBreed}
                  onChange={(e) => setPetData({ ...petData, customBreed: e.target.value })}
                />
              </div>
            )}
          </div>
        )}

        {/* Gender */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-3 block">Gender</label>
          <div className="flex flex-wrap gap-2">
            {(['male', 'female', 'other'] as const).map((gender) => (
              <button
                key={gender}
                onClick={() => setPetData({ ...petData, gender })}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all capitalize",
                  petData.gender === gender
                    ? "bg-primary text-primary-foreground"
                    : "bg-card-muted hover:bg-card-subtle"
                )}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Date of Birth */}
        <div className="mb-8">
          <label className="text-sm font-medium mb-2 block">Date of Birth</label>
          <Input
            type="date"
            placeholder="2021-09-15"
            value={petData.dateOfBirth}
            onChange={(e) => setPetData({ ...petData, dateOfBirth: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
          />
          {petData.dateOfBirth && (
            <p className="text-sm text-muted-foreground mt-2">
              Age: {formatPetAge(petData.dateOfBirth)}
            </p>
          )}
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!isValid || isUpdatingPet || isUploading}
          className="w-full"
        >
          {isUpdatingPet || isUploading ? 'Saving...' : 'Save Changes'}
        </Button>
      </PageContent>
    </MobileLayout>
  );
}
