import { useEffect, useMemo, useState } from 'react';
import { HeartHandshake, Medal, MessageSquareText, NotebookPen, PlusCircle, ShieldPlus } from 'lucide-react';
import { MobileLayout, PageHeader, PageContent } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRewards } from '@/hooks/useRewards';
import { useVetContacts } from '@/hooks/useVetContacts';
import { useVetChat } from '@/hooks/useVetChat';
import { useApp } from '@/contexts/AppContext';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const emptyContact = {
  vetName: '',
  clinic: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

export default function CareHub() {
  const { selectedPet, selectedPetId } = useApp();
  const { metrics, transactions, claimDaily, isClaiming } = useRewards();
  const { contact, saveContact, isSaving } = useVetContacts();
  const {
    activeThread,
    messages,
    startThread,
    sendMessage,
    isStarting,
    isSending,
    threads,
  } = useVetChat(selectedPetId);
  const [contactForm, setContactForm] = useState(emptyContact);
  const [newThreadNotes, setNewThreadNotes] = useState('');
  const [liveMessage, setLiveMessage] = useState('');

  useEffect(() => {
    if (contact) {
      setContactForm({
        vetName: contact.vetName ?? '',
        clinic: contact.clinic ?? '',
        phone: contact.phone ?? '',
        email: contact.email ?? '',
        address: contact.address ?? '',
        notes: contact.notes ?? '',
      });
    }
  }, [contact]);

  const handleSaveContact = async () => {
    try {
      await saveContact(contactForm);
      toast({ title: 'Vet contact saved' });
    } catch (error: any) {
      toast({
        title: 'Unable to save',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleClaimDaily = async () => {
    try {
      await claimDaily();
      toast({ title: 'Credits added', description: 'Thanks for checking in today!' });
    } catch (error: any) {
      toast({
        title: 'Already claimed?',
        description: error.message || 'You can only claim once per day.',
        variant: 'destructive',
      });
    }
  };

  const handleStartThread = async () => {
    if (!selectedPetId) {
      toast({
        title: 'Select a pet first',
        description: 'Choose a pet so vets can tailor their reply.',
        variant: 'destructive',
      });
      return;
    }
    if (!newThreadNotes.trim()) {
      toast({
        title: 'Add a quick summary',
        description: 'Let the vet know what is going on.',
      });
      return;
    }
    try {
      await startThread({
        petId: selectedPetId,
        topic: `${selectedPet?.name ?? 'My pet'} • urgent care`,
        initialMessage: newThreadNotes.trim(),
        creditCost: 25,
      });
      toast({
        title: 'Chat opened',
        description: 'A vet will join shortly. We deducted 25 credits.',
      });
      setNewThreadNotes('');
    } catch (error: any) {
      toast({
        title: 'Unable to start chat',
        description: error.message || 'Check your credit balance.',
        variant: 'destructive',
      });
    }
  };

  const handleSendVetMessage = async () => {
    if (!liveMessage.trim()) return;
    try {
      await sendMessage({ message: liveMessage.trim() });
      setLiveMessage('');
    } catch (error: any) {
      toast({
        title: 'Message failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const streakLabel = useMemo(() => {
    if (!metrics?.consecutiveDays) return 'Start streak';
    return `${metrics.consecutiveDays} day streak`;
  }, [metrics]);

  return (
    <MobileLayout>
      <PageHeader
        title="Care hub"
        subtitle="Rewards, local vets and live help"
      />
      <PageContent className="space-y-6 pb-24">
        <section className="card-nude space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-muted-foreground flex items-center gap-1">
                <Medal className="w-3 h-3" /> Daily streak
              </p>
              <h3 className="font-display text-lg">Keep logging, earn credits</h3>
            </div>
            <Badge variant="secondary">{streakLabel}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-background/70 p-3">
              <p className="text-sm text-muted-foreground">Credits</p>
              <p className="text-2xl font-semibold">{metrics?.credits ?? 0}</p>
            </div>
            <div className="rounded-xl bg-background/70 p-3">
              <p className="text-sm text-muted-foreground">Entries logged</p>
              <p className="text-2xl font-semibold">{metrics?.totalEntries ?? 0}</p>
            </div>
          </div>
          <Button onClick={handleClaimDaily} disabled={isClaiming} className="w-full">
            {isClaiming ? 'Claiming…' : 'Claim daily boost (+5 credits)'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Log food, poop, supplements or measurements daily to earn automatic credit bonuses.
          </p>
        </section>

        <section className="card-nude space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display flex items-center gap-2">
              <NotebookPen className="w-4 h-4" />
              Credits activity
            </h3>
          </div>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No credit history yet. Log some care to unlock rewards.</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between rounded-xl bg-background/70 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{txn.reason ?? 'Activity bonus'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(txn.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <span className={txn.delta >= 0 ? 'text-emerald-600 font-semibold' : 'text-destructive font-semibold'}>
                    {txn.delta > 0 ? `+${txn.delta}` : txn.delta}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card-nude space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display flex items-center gap-2">
              <HeartHandshake className="w-4 h-4" />
              My trusted vet
            </h3>
            <Button size="sm" variant="secondary" onClick={handleSaveContact} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          </div>
          <div className="space-y-3">
            <Input
              placeholder="e.g., Dr. Ana Lopez"
              value={contactForm.vetName}
              onChange={(e) => setContactForm((prev) => ({ ...prev, vetName: e.target.value }))}
            />
            <Input
              placeholder="e.g., Sunset Animal Clinic"
              value={contactForm.clinic}
              onChange={(e) => setContactForm((prev) => ({ ...prev, clinic: e.target.value }))}
            />
            <Input
              placeholder="e.g., 415-555-0199"
              value={contactForm.phone}
              onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
            <Input
              placeholder="e.g., hello@sunsetvet.com"
              value={contactForm.email}
              onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <Input
              placeholder="e.g., 123 Market St, San Francisco"
              value={contactForm.address}
              onChange={(e) => setContactForm((prev) => ({ ...prev, address: e.target.value }))}
            />
            <Textarea
              placeholder="e.g., Prefers texts before weekend emergencies"
              value={contactForm.notes}
              onChange={(e) => setContactForm((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </section>

        <section className="card-nude space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display flex items-center gap-2">
              <ShieldPlus className="w-4 h-4" />
              Real vet chat
            </h3>
            <Badge variant="outline">{threads.length} thread{threads.length === 1 ? '' : 's'}</Badge>
          </div>
          {activeThread ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-background/70 p-3">
                <p className="text-sm font-medium">Current case</p>
                <p className="text-xs text-muted-foreground">
                  {activeThread.topic || 'Awaiting vet assignment'} • opened{' '}
                  {format(new Date(activeThread.createdAt), 'MMM d, h:mm a')}
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-2xl px-3 py-2 text-sm ${
                      message.senderType === 'vet'
                        ? 'bg-primary/90 text-primary-foreground'
                        : 'bg-background/80'
                    }`}
                  >
                    {message.message}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-sm text-muted-foreground">Waiting for your first update.</p>
                )}
              </div>
              <div className="space-y-2">
                <Textarea
                  value={liveMessage}
                  onChange={(e) => setLiveMessage(e.target.value)}
                  placeholder="Share an update or respond to your vet"
                  rows={3}
                />
                <Button onClick={handleSendVetMessage} disabled={isSending || !liveMessage.trim()}>
                  {isSending ? 'Sending…' : 'Send'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Have a concern that needs a human touch? Open a conversation with a licensed vet (25 credits).
              </p>
              <Textarea
                value={newThreadNotes}
                onChange={(e) => setNewThreadNotes(e.target.value)}
                placeholder="Describe the issue or upload details"
                rows={4}
              />
              <Button onClick={handleStartThread} disabled={isStarting}>
                {isStarting ? 'Connecting…' : 'Open vet chat (25 credits)'}
              </Button>
            </div>
          )}
        </section>

        <section className="card-nude space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-4 h-4" />
            <h3 className="font-display">How to earn more credits</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>Log meals, poop, supplements or measurements daily (+2 to +5).</li>
            <li>Upload stool photos for AI review (+3).</li>
            <li>Maintain a 7 day streak for a 15 credit boost.</li>
          </ul>
          <Button variant="ghost" className="gap-2 justify-start" onClick={() => toast({ title: 'Log activity', description: 'Use the + button on the home screen to log items.' })}>
            <PlusCircle className="w-4 h-4" />
            Quick log shortcut
          </Button>
        </section>
      </PageContent>
      <BottomNav />
    </MobileLayout>
  );
}
