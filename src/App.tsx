import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Suspense, lazy } from "react";

// Pages - lazy loaded
const Welcome = lazy(() => import("./pages/Welcome"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddFood = lazy(() => import("./pages/AddFood"));
const AddPoop = lazy(() => import("./pages/AddPoop"));
const AddSupplement = lazy(() => import("./pages/AddSupplement"));
const AddMeasurement = lazy(() => import("./pages/AddMeasurement"));
const Pets = lazy(() => import("./pages/Pets"));
const EditPet = lazy(() => import("./pages/EditPet"));
const History = lazy(() => import("./pages/History"));
const Settings = lazy(() => import("./pages/Settings"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Community = lazy(() => import("./pages/Community"));
const CareHub = lazy(() => import("./pages/CareHub"));
const AIAnalytics = lazy(() => import("./pages/AIAnalytics"));
const HealthRecords = lazy(() => import("./pages/HealthRecords"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppProvider>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Auth routes */}
                  <Route path="/" element={<Welcome />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* Protected routes */}
                  <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><AIAnalytics /></ProtectedRoute>} />
                  <Route path="/add-food" element={<ProtectedRoute><AddFood /></ProtectedRoute>} />
                  <Route path="/add-poop" element={<ProtectedRoute><AddPoop /></ProtectedRoute>} />
                  <Route path="/add-supplement" element={<ProtectedRoute><AddSupplement /></ProtectedRoute>} />
                  <Route path="/add-measurement" element={<ProtectedRoute><AddMeasurement /></ProtectedRoute>} />
                  <Route path="/pets" element={<ProtectedRoute><Pets /></ProtectedRoute>} />
                  <Route path="/pets/:petId/edit" element={<ProtectedRoute><EditPet /></ProtectedRoute>} />
                  <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                  <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                  <Route path="/records" element={<ProtectedRoute><HealthRecords /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/settings/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
                  <Route path="/care" element={<ProtectedRoute><CareHub /></ProtectedRoute>} />
                  
                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AppProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
