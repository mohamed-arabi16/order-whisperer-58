import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { POSSystemPlan } from "@/components/restaurant/POSSystemPlan";

/**
 * POS System page component that displays the POS system development plan
 * Only accessible by authenticated restaurant owners and super admins
 */
const POSSystem = (): JSX.Element => {
  const { user, loading, isAdmin, isRestaurantOwner } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isRestaurantOwner)) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <POSSystemPlan />
    </div>
  );
};

export default POSSystem;