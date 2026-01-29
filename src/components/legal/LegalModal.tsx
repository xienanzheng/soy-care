import { LEGAL_DOCUMENTS, LegalVariant } from '@/lib/legal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LegalModalProps {
  variant: LegalVariant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LegalModal({ variant, open, onOpenChange }: LegalModalProps) {
  const document = LEGAL_DOCUMENTS[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{document.title}</DialogTitle>
          <DialogDescription>{document.intro}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 text-sm leading-relaxed">
            {document.sections.map((section) => (
              <section key={section.heading} className="space-y-1.5">
                <h4 className="font-semibold text-foreground">{section.heading}</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{section.body}</p>
              </section>
            ))}
            <p className="text-muted-foreground text-xs pt-4 border-t border-border">
              {document.footer}
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
