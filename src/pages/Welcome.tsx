import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MobileLayout, PageContent } from '@/components/layout/MobileLayout';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <MobileLayout className="bg-soycraft-cream">
      <PageContent className="flex flex-col items-center justify-center min-h-screen px-8">
        {/* Illustration */}
        <div className="w-40 h-40 mb-8 animate-fade-in bg-secondary/30 rounded-full flex items-center justify-center">
          <span className="text-6xl">🐕</span>
        </div>

        {/* Text content */}
        <div className="text-center mb-12 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <h1 className="text-3xl font-display font-semibold mb-4 text-foreground">
            Help your Furbabies live their best life today!
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Welcome to Soycraft, where you can track your pet's health, nutrition, and daily activities with love and care.
          </p>
        </div>

        {/* CTA Button */}
        <div className="w-full animate-fade-up" style={{ animationDelay: '200ms' }}>
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate('/signup')}
          >
            Get Started
          </Button>
        </div>

        {/* Login link */}
        <p className="mt-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '300ms' }}>
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-foreground font-medium hover:underline"
          >
            Log In
          </button>
        </p>
      </PageContent>
    </MobileLayout>
  );
}