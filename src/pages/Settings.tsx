import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  User,
  Shield,
  HelpCircle,
  LogOut,
  Moon,
  Download,
  FileText,
  Mail,
} from 'lucide-react';
import { format } from 'date-fns';
import { MobileLayout, PageHeader, PageContent } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LegalModal } from '@/components/legal/LegalModal';
import type { LegalVariant } from '@/lib/legal';

export default function Settings() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [legalModal, setLegalModal] = useState<LegalVariant | null>(null);
  const [infoModal, setInfoModal] = useState<'help' | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('soycraft-theme') as 'light' | 'dark') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('soycraft-theme', theme);
  }, [theme]);

  const settingsItems = [
    {
      icon: User,
      label: 'Account',
      description: 'Profile, email, and avatar',
      action: () => navigate('/settings/account'),
    },
    {
      icon: Shield,
      label: 'Privacy & Security',
      description: 'Review how we handle your data',
      action: () => setLegalModal('privacy'),
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      description: 'Get answers or contact the team',
      action: () => setInfoModal('help'),
    },
    {
      icon: FileText,
      label: 'Terms of Service',
      description: 'Understand your responsibilities',
      action: () => setLegalModal('terms'),
    },
  ];

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logged out", description: "You have been signed out successfully." });
    navigate('/');
  };

  const handleExportHealthData = async () => {
    if (!user) {
      toast({ title: "Not logged in", variant: "destructive" });
      return;
    }

    setIsExporting(true);
    
    try {
      // Fetch all pets
      const { data: pets, error: petsError } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id);

      if (petsError) throw petsError;

      // Fetch all logs for each pet
      const petsWithLogs = await Promise.all(
        (pets || []).map(async (pet) => {
          const [foodLogs, poopLogs, supplementLogs, measurementLogs] = await Promise.all([
            supabase.from('food_logs').select('*').eq('pet_id', pet.id).order('logged_at', { ascending: false }),
            supabase.from('poop_logs').select('*').eq('pet_id', pet.id).order('logged_at', { ascending: false }),
            supabase.from('supplement_logs').select('*').eq('pet_id', pet.id).order('logged_at', { ascending: false }),
            supabase.from('measurement_logs').select('*').eq('pet_id', pet.id).order('logged_at', { ascending: false }),
          ]);

          return {
            name: pet.name,
            handle: pet.handle,
            species: pet.species,
            breed: pet.breed,
            gender: pet.gender,
            dateOfBirth: pet.date_of_birth,
            photoUrl: pet.photo_url,
            createdAt: pet.created_at,
            foodLogs: (foodLogs.data || []).map(log => ({
              name: log.name,
              amountGrams: log.amount_grams,
              mealType: log.meal_type,
              notes: log.notes,
              loggedAt: log.logged_at,
            })),
            poopLogs: (poopLogs.data || []).map(log => ({
              consistency: log.consistency,
              color: log.color,
              amount: log.amount,
              location: log.location,
              notes: log.notes,
              userRating: log.user_rating,
              loggedAt: log.logged_at,
            })),
            supplementLogs: (supplementLogs.data || []).map(log => ({
              name: log.name,
              dosage: log.dosage,
              frequency: log.frequency,
              notes: log.notes,
              loggedAt: log.logged_at,
            })),
            measurementLogs: (measurementLogs.data || []).map(log => ({
              weightKg: log.weight_kg,
              neckCm: log.neck_cm,
              chestCm: log.chest_cm,
              bodyLengthCm: log.body_length_cm,
              notes: log.notes,
              loggedAt: log.logged_at,
            })),
          };
        })
      );

      const exportData = {
        exportDate: new Date().toISOString(),
        user: { email: user.email },
        pets: petsWithLogs,
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `soycraft-health-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: "Export complete", description: "Your health data has been downloaded." });
    } catch (error: any) {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <MobileLayout>
      <PageHeader title="Settings" />

      <PageContent className="space-y-6">
        {/* Settings List */}
        <div className="space-y-2">
          {settingsItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-card-muted transition-all hover:bg-card-subtle text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Export Health Data */}
        <button
          onClick={handleExportHealthData}
          disabled={isExporting}
          className="w-full flex items-center gap-4 p-4 rounded-xl bg-card-muted transition-all hover:bg-card-subtle disabled:opacity-50"
        >
          <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <span className="flex-1 text-left font-medium">
            {isExporting ? 'Exporting...' : 'Export Health Data'}
          </span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Theme Toggle */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-card-muted">
          <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
            <Moon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Dark Mode</p>
            <p className="text-xs text-muted-foreground">
              The app respects this preference across sessions.
            </p>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            aria-label="Toggle dark mode"
          />
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 rounded-xl bg-destructive/10 text-destructive transition-all hover:bg-destructive/20"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="flex-1 text-left font-medium">Log Out</span>
        </button>

        {/* App Info */}
        <div className="text-center pt-8">
          <p className="text-sm text-muted-foreground">Soycraft Pet Care</p>
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
        </div>
      </PageContent>

      <Dialog open={infoModal === 'help'} onOpenChange={(open) => setInfoModal(open ? 'help' : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Help & Support</DialogTitle>
            <DialogDescription>
              Reach out if you have product questions, need to report a bug, or want to suggest a feature.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• Review the FAQ inside the Care Hub for quick onboarding tips.</p>
            <p>• Email us screenshots or exported logs if you notice data inconsistencies.</p>
            <p>• We typically respond within one business day.</p>
          </div>
          <Button asChild>
            <a href="mailto:support@soycraft.ai" className="inline-flex items-center gap-2">
              <Mail className="w-4 h-4" />
              support@soycraft.ai
            </a>
          </Button>
        </DialogContent>
      </Dialog>

      {legalModal && (
        <LegalModal
          variant={legalModal}
          open={!!legalModal}
          onOpenChange={(open) => {
            if (!open) {
              setLegalModal(null);
            }
          }}
        />
      )}

      <BottomNav />
    </MobileLayout>
  );
}
