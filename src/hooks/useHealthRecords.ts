import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { HealthCertificateRecord, VaccinationRecord } from '@/types/pet';

export function useVaccinationRecords(petId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['vaccinations', petId],
    queryFn: async () => {
      if (!user || !petId) return [];

      const { data, error } = await supabase
        .from('pet_vaccinations')
        .select('*')
        .eq('pet_id', petId)
        .order('date_administered', { ascending: false });

      if (error) throw error;

      return (data || []).map((record): VaccinationRecord => ({
        id: record.id,
        petId: record.pet_id,
        vaccineName: record.vaccine_name,
        dateAdministered: record.date_administered,
        nextDue: record.next_due || undefined,
        vetName: record.vet_name || undefined,
        clinic: record.clinic || undefined,
        lotNumber: record.lot_number || undefined,
        documentUrl: record.document_url || undefined,
        notes: record.notes || undefined,
        createdAt: record.created_at,
      }));
    },
    enabled: !!user && !!petId,
  });

  const createMutation = useMutation({
    mutationFn: async (record: Omit<VaccinationRecord, 'id' | 'createdAt'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pet_vaccinations')
        .insert({
          user_id: user.id,
          pet_id: record.petId,
          vaccine_name: record.vaccineName,
          date_administered: record.dateAdministered,
          next_due: record.nextDue || null,
          vet_name: record.vetName || null,
          clinic: record.clinic || null,
          lot_number: record.lotNumber || null,
          document_url: record.documentUrl || null,
          notes: record.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations', petId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('pet_vaccinations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations', petId] });
    },
  });

  return {
    records: query.data ?? [],
    isLoading: query.isLoading,
    createRecord: createMutation.mutateAsync,
    isSaving: createMutation.isPending,
    deleteRecord: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useHealthCertificates(petId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['health_certificates', petId],
    queryFn: async () => {
      if (!user || !petId) return [];

      const { data, error } = await supabase
        .from('pet_health_certificates')
        .select('*')
        .eq('pet_id', petId)
        .order('issued_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((record): HealthCertificateRecord => ({
        id: record.id,
        petId: record.pet_id,
        title: record.title,
        issuedAt: record.issued_at,
        expiresAt: record.expires_at || undefined,
        vetName: record.vet_name || undefined,
        clinic: record.clinic || undefined,
        documentUrl: record.document_url || undefined,
        notes: record.notes || undefined,
        createdAt: record.created_at,
      }));
    },
    enabled: !!user && !!petId,
  });

  const createMutation = useMutation({
    mutationFn: async (record: Omit<HealthCertificateRecord, 'id' | 'createdAt'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pet_health_certificates')
        .insert({
          user_id: user.id,
          pet_id: record.petId,
          title: record.title,
          issued_at: record.issuedAt,
          expires_at: record.expiresAt || null,
          vet_name: record.vetName || null,
          clinic: record.clinic || null,
          document_url: record.documentUrl || null,
          notes: record.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health_certificates', petId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('pet_health_certificates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health_certificates', petId] });
    },
  });

  return {
    records: query.data ?? [],
    isLoading: query.isLoading,
    createRecord: createMutation.mutateAsync,
    isSaving: createMutation.isPending,
    deleteRecord: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
