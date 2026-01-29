import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileLayout, PageHeader, PageContent } from '@/components/layout/MobileLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setEmailSent(true);
    toast({
      title: "Check your email",
      description: "We've sent you a password reset link.",
    });
  };

  return (
    <MobileLayout>
      <PageHeader
        leftAction={
          <button onClick={() => navigate('/login')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />

      <PageContent className="flex flex-col items-center justify-center">
        {emailSent ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-semibold mb-2">Check your email</h1>
              <p className="text-muted-foreground">
                We've sent a password reset link to<br />
                <span className="text-foreground font-medium">{email}</span>
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-display font-semibold mb-2">Forgot password?</h1>
              <p className="text-muted-foreground">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 w-full">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Reset password"}
              </Button>
            </form>

            <button
              onClick={() => navigate('/login')}
              className="text-sm text-muted-foreground hover:text-foreground mt-6"
            >
              ← Back to login
            </button>
          </>
        )}
      </PageContent>
    </MobileLayout>
  );
}
