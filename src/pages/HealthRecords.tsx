import { useRef, useState, type ChangeEvent } from 'react';
import { format } from 'date-fns';
import { Syringe, FileText, Plus, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { MobileLayout, PageHeader, PageContent } from '@/components/layout/MobileLayout';
import { PetSelector } from '@/components/common/PetSelector';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useVaccinationRecords, useHealthCertificates } from '@/hooks/useHealthRecords';
import { toast } from '@/hooks/use-toast';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';

export default function HealthRecords() {
  const { pets, selectedPet, selectedPetId, setSelectedPetId } = useApp();
  const {
    records: vaccinations,
    isLoading: vaccinationsLoading,
    createRecord: addVaccination,
    deleteRecord: deleteVaccination,
    isSaving: isSavingVaccination,
  } = useVaccinationRecords(selectedPetId);
  const {
    records: certificates,
    isLoading: certificatesLoading,
    createRecord: addCertificate,
    deleteRecord: deleteCertificate,
    isSaving: isSavingCertificate,
  } = useHealthCertificates(selectedPetId);

  const [vaccDialogOpen, setVaccDialogOpen] = useState(false);
  const [certDialogOpen, setCertDialogOpen] = useState(false);

  const [vaccForm, setVaccForm] = useState({
    vaccineName: '',
    dateAdministered: format(new Date(), 'yyyy-MM-dd'),
    nextDue: '',
    vetName: '',
    clinic: '',
    lotNumber: '',
    documentUrl: '',
    notes: '',
  });

  const [certForm, setCertForm] = useState({
    title: '',
    issuedAt: format(new Date(), 'yyyy-MM-dd'),
    expiresAt: '',
    vetName: '',
    clinic: '',
    documentUrl: '',
    notes: '',
  });

  const isLoading = vaccinationsLoading || certificatesLoading;

  const {
    uploadPhoto: uploadVaccDocument,
    isUploading: isUploadingVaccDocument,
  } = usePhotoUpload();
  const {
    uploadPhoto: uploadCertDocument,
    isUploading: isUploadingCertDocument,
  } = usePhotoUpload();

  const vaccFileInputRef = useRef<HTMLInputElement>(null);
  const certFileInputRef = useRef<HTMLInputElement>(null);

  const handleVaccDocumentUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!selectedPetId) {
      toast({ title: 'Select a pet first', variant: 'destructive' });
      event.target.value = '';
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    const url = await uploadVaccDocument(file, 'documents', `vaccinations/${selectedPetId}`);
    if (url) {
      setVaccForm((prev) => ({ ...prev, documentUrl: url }));
      toast({ title: 'Attachment uploaded' });
    } else {
      toast({ title: 'Upload failed', variant: 'destructive' });
    }
    event.target.value = '';
  };

  const handleCertDocumentUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!selectedPetId) {
      toast({ title: 'Select a pet first', variant: 'destructive' });
      event.target.value = '';
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    const url = await uploadCertDocument(file, 'documents', `certificates/${selectedPetId}`);
    if (url) {
      setCertForm((prev) => ({ ...prev, documentUrl: url }));
      toast({ title: 'Attachment uploaded' });
    } else {
      toast({ title: 'Upload failed', variant: 'destructive' });
    }
    event.target.value = '';
  };

  const handleVaccSubmit = async () => {
    if (!selectedPetId) {
      toast({ title: 'Select a pet first', variant: 'destructive' });
      return;
    }
    if (!vaccForm.vaccineName) {
      toast({ title: 'Vaccine name is required', variant: 'destructive' });
      return;
    }
    try {
      await addVaccination({
        petId: selectedPetId,
        vaccineName: vaccForm.vaccineName,
        dateAdministered: vaccForm.dateAdministered,
        nextDue: vaccForm.nextDue || undefined,
        vetName: vaccForm.vetName || undefined,
        clinic: vaccForm.clinic || undefined,
        lotNumber: vaccForm.lotNumber || undefined,
        documentUrl: vaccForm.documentUrl || undefined,
        notes: vaccForm.notes || undefined,
      });
      toast({ title: 'Vaccination saved' });
      setVaccDialogOpen(false);
      setVaccForm({
        vaccineName: '',
        dateAdministered: format(new Date(), 'yyyy-MM-dd'),
        nextDue: '',
        vetName: '',
        clinic: '',
        lotNumber: '',
        documentUrl: '',
        notes: '',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast({ title: 'Unable to save vaccination', description: message, variant: 'destructive' });
    }
  };

  const handleCertSubmit = async () => {
    if (!selectedPetId) {
      toast({ title: 'Select a pet first', variant: 'destructive' });
      return;
    }
    if (!certForm.title) {
      toast({ title: 'Certificate title is required', variant: 'destructive' });
      return;
    }
    try {
      await addCertificate({
        petId: selectedPetId,
        title: certForm.title,
        issuedAt: certForm.issuedAt,
        expiresAt: certForm.expiresAt || undefined,
        vetName: certForm.vetName || undefined,
        clinic: certForm.clinic || undefined,
        documentUrl: certForm.documentUrl || undefined,
        notes: certForm.notes || undefined,
      });
      toast({ title: 'Certificate saved' });
      setCertDialogOpen(false);
      setCertForm({
        title: '',
        issuedAt: format(new Date(), 'yyyy-MM-dd'),
        expiresAt: '',
        vetName: '',
        clinic: '',
        documentUrl: '',
        notes: '',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast({ title: 'Unable to save certificate', description: message, variant: 'destructive' });
    }
  };

  const handleDeleteVaccination = async (id: string) => {
    try {
      await deleteVaccination(id);
      toast({ title: 'Vaccination removed' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast({ title: 'Delete failed', description: message, variant: 'destructive' });
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    try {
      await deleteCertificate(id);
      toast({ title: 'Certificate removed' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast({ title: 'Delete failed', description: message, variant: 'destructive' });
    }
  };

  return (
    <MobileLayout>
      <PageHeader title="Health Records" subtitle="Track vaccinations and vet-issued certificates." />
      <PageContent className="space-y-6 pb-24">
        <PetSelector
          pets={pets}
          selectedPetId={selectedPetId}
          onSelectPet={setSelectedPetId}
          showAddButton={false}
        />

        {!selectedPet && (
          <div className="p-4 rounded-xl bg-card-muted text-sm text-muted-foreground">
            Add a pet to start tracking health records.
          </div>
        )}

        {selectedPet && (
          <div className="space-y-8">
            <section className="card-nude space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Vaccinations</p>
                  <h3 className="text-lg font-display font-semibold">Timeline</h3>
                </div>
                <Dialog open={vaccDialogOpen} onOpenChange={setVaccDialogOpen}>
                  <Button variant="secondary" size="sm" className="flex items-center gap-1" onClick={() => setVaccDialogOpen(true)}>
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Log vaccination</DialogTitle>
                      <DialogDescription>Store proof of shots for quick reference.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Input
                        placeholder="Vaccine name"
                        value={vaccForm.vaccineName}
                        onChange={(e) => setVaccForm({ ...vaccForm, vaccineName: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="date"
                          value={vaccForm.dateAdministered}
                          onChange={(e) => setVaccForm({ ...vaccForm, dateAdministered: e.target.value })}
                        />
                        <Input
                          type="date"
                          placeholder="Next due"
                          value={vaccForm.nextDue}
                          onChange={(e) => setVaccForm({ ...vaccForm, nextDue: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Vet name"
                          value={vaccForm.vetName}
                          onChange={(e) => setVaccForm({ ...vaccForm, vetName: e.target.value })}
                        />
                        <Input
                          placeholder="Clinic"
                          value={vaccForm.clinic}
                          onChange={(e) => setVaccForm({ ...vaccForm, clinic: e.target.value })}
                        />
                      </div>
                      <Input
                        placeholder="Lot number"
                        value={vaccForm.lotNumber}
                        onChange={(e) => setVaccForm({ ...vaccForm, lotNumber: e.target.value })}
                      />
                      <div className="space-y-2">
                        <input
                          type="file"
                          ref={vaccFileInputRef}
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={handleVaccDocumentUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => vaccFileInputRef.current?.click()}
                          disabled={isUploadingVaccDocument}
                          className="w-full"
                        >
                          {isUploadingVaccDocument ? 'Uploading…' : vaccForm.documentUrl ? 'Replace attachment' : 'Upload document/photo'}
                        </Button>
                        {vaccForm.documentUrl && (
                          <div className="text-xs flex items-center justify-between">
                            <a href={vaccForm.documentUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                              View current attachment
                            </a>
                            <button
                              type="button"
                              className="text-destructive"
                              onClick={() => setVaccForm((prev) => ({ ...prev, documentUrl: '' }))}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                      <Textarea
                        placeholder="Notes"
                        value={vaccForm.notes}
                        onChange={(e) => setVaccForm({ ...vaccForm, notes: e.target.value })}
                      />
                      <Button onClick={handleVaccSubmit} disabled={isSavingVaccination}>
                        {isSavingVaccination ? 'Saving…' : 'Save vaccination'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-3">
                {isLoading && <p className="text-sm text-muted-foreground">Loading records…</p>}
                {!isLoading && vaccinations.length === 0 && (
                  <p className="text-sm text-muted-foreground">No vaccinations logged yet.</p>
                )}
                {vaccinations.map((record) => (
                  <div key={record.id} className="rounded-xl border border-border p-3 bg-background/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-blue/30 flex items-center justify-center">
                          <Syringe className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{record.vaccineName}</p>
                          <p className="text-xs text-muted-foreground">
                            Given {format(new Date(record.dateAdministered), 'MMM d, yyyy')}
                            {record.nextDue && ` • Next due ${format(new Date(record.nextDue), 'MMM d, yyyy')}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteVaccination(record.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {(record.vetName || record.clinic || record.notes) && (
                      <div className="mt-2 text-xs text-muted-foreground space-y-1">
                        {record.vetName && <p>Vet: {record.vetName}{record.clinic ? ` @ ${record.clinic}` : ''}</p>}
                        {record.notes && <p>{record.notes}</p>}
                        {record.documentUrl && (
                          <a
                            href={record.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline"
                          >
                            View document
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="card-nude space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Certificates</p>
                  <h3 className="text-lg font-display font-semibold">Health documents</h3>
                </div>
                <Dialog open={certDialogOpen} onOpenChange={setCertDialogOpen}>
                  <Button variant="secondary" size="sm" className="flex items-center gap-1" onClick={() => setCertDialogOpen(true)}>
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload certificate</DialogTitle>
                      <DialogDescription>Log vet-issued certificates or travel docs.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Input
                        placeholder="Document title"
                        value={certForm.title}
                        onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="date"
                          value={certForm.issuedAt}
                          onChange={(e) => setCertForm({ ...certForm, issuedAt: e.target.value })}
                        />
                        <Input
                          type="date"
                          placeholder="Expires"
                          value={certForm.expiresAt}
                          onChange={(e) => setCertForm({ ...certForm, expiresAt: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Vet name"
                          value={certForm.vetName}
                          onChange={(e) => setCertForm({ ...certForm, vetName: e.target.value })}
                        />
                        <Input
                          placeholder="Clinic"
                          value={certForm.clinic}
                          onChange={(e) => setCertForm({ ...certForm, clinic: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <input
                          type="file"
                          ref={certFileInputRef}
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={handleCertDocumentUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => certFileInputRef.current?.click()}
                          disabled={isUploadingCertDocument}
                          className="w-full"
                        >
                          {isUploadingCertDocument ? 'Uploading…' : certForm.documentUrl ? 'Replace attachment' : 'Upload document/photo'}
                        </Button>
                        {certForm.documentUrl && (
                          <div className="text-xs flex items-center justify-between">
                            <a href={certForm.documentUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                              View current attachment
                            </a>
                            <button
                              type="button"
                              className="text-destructive"
                              onClick={() => setCertForm((prev) => ({ ...prev, documentUrl: '' }))}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                      <Textarea
                        placeholder="Notes"
                        value={certForm.notes}
                        onChange={(e) => setCertForm({ ...certForm, notes: e.target.value })}
                      />
                      <Button onClick={handleCertSubmit} disabled={isSavingCertificate}>
                        {isSavingCertificate ? 'Saving…' : 'Save certificate'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-3">
                {isLoading && <p className="text-sm text-muted-foreground">Loading documents…</p>}
                {!isLoading && certificates.length === 0 && (
                  <p className="text-sm text-muted-foreground">No certificates uploaded yet.</p>
                )}
                {certificates.map((record) => (
                  <div key={record.id} className="rounded-xl border border-border p-3 bg-background/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-pink/40 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{record.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Issued {format(new Date(record.issuedAt), 'MMM d, yyyy')}
                            {record.expiresAt && ` • Expires ${format(new Date(record.expiresAt), 'MMM d, yyyy')}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCertificate(record.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {(record.vetName || record.notes) && (
                      <div className="mt-2 text-xs text-muted-foreground space-y-1">
                        {record.vetName && <p>Vet: {record.vetName}{record.clinic ? ` @ ${record.clinic}` : ''}</p>}
                        {record.notes && <p>{record.notes}</p>}
                        {record.documentUrl && (
                          <a
                            href={record.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline"
                          >
                            View certificate
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </PageContent>
      <BottomNav />
    </MobileLayout>
  );
}
