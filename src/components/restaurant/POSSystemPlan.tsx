import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Clock, 
  Users, 
  BarChart3, 
  Printer, 
  Smartphone,
  Wifi,
  CreditCard,
  Package,
  Bell
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * POS System Architecture Plan Component
 * This component outlines the comprehensive plan for implementing a POS system
 * that integrates with the existing digital menu and WhatsApp ordering system.
 */
export const POSSystemPlan: React.FC = () => {
  const { t, isRTL } = useTranslation();

  const features = [
    {
      icon: ShoppingCart,
      title: "Real-time Order Management",
      description: "Live order queue with status tracking from WhatsApp orders",
      status: "planned"
    },
    {
      icon: Clock,
      title: "Kitchen Display System (KDS)",
      description: "Digital screens showing order details and preparation times",
      status: "planned"
    },
    {
      icon: Users,
      title: "Staff Management",
      description: "Role-based access and performance tracking",
      status: "planned"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time sales, inventory, and performance metrics",
      status: "planned"
    },
    {
      icon: Printer,
      title: "Receipt & Kitchen Printing",
      description: "Automated printing for orders and receipts",
      status: "planned"
    },
    {
      icon: Smartphone,
      title: "Mobile POS App",
      description: "Tablet/mobile interface for order management",
      status: "planned"
    },
    {
      icon: Wifi,
      title: "Offline Capability",
      description: "Continue operations during network disruptions",
      status: "planned"
    },
    {
      icon: CreditCard,
      title: "Payment Processing",
      description: "Integration with local and international payment gateways",
      status: "planned"
    },
    {
      icon: Package,
      title: "Inventory Management",
      description: "Track ingredients and menu item availability",
      status: "planned"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Real-time alerts for orders, low inventory, and issues",
      status: "planned"
    }
  ];

  const phases = [
    {
      phase: 1,
      title: "Foundation & Order Management",
      duration: "2-3 months",
      features: [
        "Real-time order dashboard integration with WhatsApp orders",
        "Basic kitchen display system",
        "Order status tracking (New → Preparing → Ready → Delivered)",
        "Staff user management and roles"
      ]
    },
    {
      phase: 2,
      title: "Payment & Customer Management",
      duration: "2-3 months", 
      features: [
        "Payment gateway integrations (Stripe, local processors)",
        "Customer database and order history",
        "Receipt generation and printing",
        "Basic inventory tracking"
      ]
    },
    {
      phase: 3,
      title: "Advanced Features & Analytics",
      duration: "3-4 months",
      features: [
        "Advanced analytics and reporting dashboard",
        "Inventory management with low-stock alerts",
        "Mobile POS application",
        "Offline capability and data synchronization"
      ]
    },
    {
      phase: 4,
      title: "Enterprise Features",
      duration: "2-3 months",
      features: [
        "Multi-location support",
        "Advanced staff scheduling and performance tracking",
        "Integration with accounting software",
        "Custom reporting and business intelligence"
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-primary text-primary-foreground';
      case 'in-progress': return 'bg-accent text-accent-foreground';
      case 'planned': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold gradient-hero bg-clip-text text-transparent mb-4">
          نظام نقاط البيع (POS) - خطة التطوير
        </h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          خطة شاملة لتطوير نظام نقاط بيع متكامل يعمل مع نظام القائمة الرقمية وطلبات الواتساب الحالي
        </p>
      </div>

      {/* Feature Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            الميزات المخططة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground">{feature.title}</h3>
                    <Badge variant="outline" className={getStatusColor(feature.status)}>
                      {feature.status === 'planned' ? 'مخطط' : feature.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Development Phases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            مراحل التطوير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {phases.map((phase, index) => (
              <div key={index} className="relative">
                {index !== phases.length - 1 && (
                  <div className="absolute left-4 top-8 w-0.5 h-full bg-border" />
                )}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {phase.phase}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{phase.title}</h3>
                      <Badge variant="outline">{phase.duration}</Badge>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {phase.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            الهيكل التقني
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-3">Frontend Components</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• POS Dashboard (React/TypeScript)</li>
                  <li>• Kitchen Display System Interface</li>  
                  <li>• Mobile POS App (PWA)</li>
                  <li>• Real-time order management</li>
                  <li>• Payment processing interface</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-3">Backend Services</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• WebSocket connections for real-time updates</li>
                  <li>• Supabase Edge Functions for POS logic</li>
                  <li>• Payment gateway integrations</li>
                  <li>• Inventory management system</li>
                  <li>• Analytics and reporting engine</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            نقاط التكامل مع النظام الحالي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <div>
                <h4 className="font-medium text-foreground">WhatsApp Order Integration</h4>
                <p className="text-sm text-muted-foreground">تحويل طلبات الواتساب تلقائياً إلى نظام نقاط البيع للمعالجة</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-secondary/30">
              <div className="w-2 h-2 bg-secondary rounded-full mt-2" />
              <div>
                <h4 className="font-medium text-foreground">Menu Synchronization</h4>
                <p className="text-sm text-muted-foreground">مزامنة تلقائية بين القائمة الرقمية ونظام نقاط البيع</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
              <div className="w-2 h-2 bg-accent rounded-full mt-2" />
              <div>
                <h4 className="font-medium text-foreground">Analytics Enhancement</h4>
                <p className="text-sm text-muted-foreground">تحسين نظام التحليلات الحالي بإضافة بيانات نقاط البيع</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};