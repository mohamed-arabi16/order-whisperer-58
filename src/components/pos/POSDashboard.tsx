import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle,
  ChefHat,
  Monitor,
  Bell,
  RefreshCw,
  BarChart3,
  Settings,
  Table,
  Wifi,
  WifiOff
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { POSAnalyticsTab } from "./POSAnalyticsTab";
import { TableManagementTab } from "./TableManagementTab";
import { NotificationManager } from "./NotificationManager";

interface POSOrder {
  id: string;
  order_number: string;
  status: 'pending_approval' | 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  order_type: string;
  customer_info?: {
    name?: string;
    phone?: string;
  };
  items: any[];
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
}

export const POSDashboard: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<POSOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineOrders, setOfflineOrders] = useState<POSOrder[]>([]);

  // Load orders and setup offline detection
  useEffect(() => {
    if (user) {
      loadOrders();
      subscribeToOrders();
    }

    // Setup offline detection
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineOrders();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('pos_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setOrders((data || []) as POSOrder[]);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: t('common.error'),
        description: t('pos.dashboard.loadError') || "حدث خطأ أثناء تحميل طلبات نقاط البيع",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToOrders = () => {
    const channel = supabase
      .channel('pos-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pos_orders'
        },
        (payload) => {
          console.log('POS Order change:', payload);
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as POSOrder;
            setOrders(prev => [newOrder, ...prev]);
            
            // Show notification for new orders
            toast({
              title: t('pos.dashboard.newOrder') || "طلب جديد!",
              description: `${t('pos.dashboard.orderNumber')} ${newOrder.order_number} - ${newOrder.total_amount} ${t('common.currency')}`,
              variant: "default"
            });

            // Play notification sound if enabled
            playNotificationSound();
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as POSOrder;
            setOrders(prev => 
              prev.map(order => 
                order.id === updatedOrder.id ? updatedOrder : order
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateOrderStatus = async (orderId: string, newStatus: POSOrder['status']) => {
    try {
      const { error } = await supabase
        .from('pos_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: t('pos.dashboard.orderUpdated') || "تم تحديث الطلب",
        description: `${t('pos.dashboard.statusChanged')} ${t(`pos.status.${newStatus}`)}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: t('common.error'),
        description: t('pos.dashboard.updateError') || "حدث خطأ أثناء تحديث حالة الطلب", 
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: POSOrder['status']) => {
    switch (status) {
      case 'pending_approval': return 'bg-orange-500 text-white';
      case 'new': return 'bg-blue-500 text-white';
      case 'preparing': return 'bg-yellow-500 text-white';
      case 'ready': return 'bg-green-500 text-white';
      case 'completed': return 'bg-gray-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getStatusIcon = (status: POSOrder['status']) => {
    switch (status) {
      case 'pending_approval': return <Bell className="w-4 h-4" />;
      case 'new': return <Bell className="w-4 h-4" />;
      case 'preparing': return <Clock className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filterOrdersByStatus = (status?: POSOrder['status']) => {
    if (!status) return orders;
    return orders.filter(order => order.status === status);
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvGIYBjiNz+/OfC0EJXHBzi2');
      audio.play().catch(() => {
        // Ignore audio errors in case user hasn't interacted with page
      });
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  const syncOfflineOrders = async () => {
    if (offlineOrders.length === 0) return;
    
    try {
      for (const order of offlineOrders) {
        await supabase
          .from('pos_orders')
          .update({ status: order.status })
          .eq('id', order.id);
      }
      
      setOfflineOrders([]);
      toast({
        title: t('pos.offline.syncComplete') || "تم التزامن",
        description: `تم تزامن ${offlineOrders.length} طلب`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error syncing offline orders:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin">
          <RefreshCw className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('pos.dashboard.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('pos.dashboard.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOff className="w-3 h-3" />
              {t('pos.dashboard.offline')}
            </Badge>
          )}
          {isOnline && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              {t('pos.dashboard.online')}
            </Badge>
          )}
          <Button onClick={loadOrders} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('pos.dashboard.refresh')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-500" />
              {t('pos.dashboard.pendingApproval')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filterOrdersByStatus('pending_approval').length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-500" />
              {t('pos.dashboard.newOrders')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filterOrdersByStatus('new').length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              {t('pos.dashboard.preparing')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filterOrdersByStatus('preparing').length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {t('pos.dashboard.ready')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filterOrdersByStatus('ready').length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gray-500" />
              {t('pos.dashboard.completed')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filterOrdersByStatus('completed').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            {t('pos.dashboard.orderQueue')}
          </TabsTrigger>
          <TabsTrigger value="kitchen" className="flex items-center gap-2">
            <ChefHat className="w-4 h-4" />
            {t('pos.dashboard.kitchenDisplay')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {t('pos.dashboard.analytics')}
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <Table className="w-4 h-4" />
            {t('pos.dashboard.tableManagement')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {t('pos.dashboard.notifications')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('pos.dashboard.orderQueue')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                 {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('pos.dashboard.noOrders')}
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="mr-1">{t(`pos.status.${order.status}`)}</span>
                          </Badge>
                          <span className="font-medium">#{order.order_number}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleTimeString('ar-EG', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">{t('pos.dashboard.orderDetails')}:</h4>
                          <div className="space-y-1 text-sm">
                            {order.items.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between">
                                <span>{item.name} x{item.quantity}</span>
                                <span>{(item.price * item.quantity).toLocaleString()} {t('common.currency')}</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t pt-2 mt-2 font-medium">
                            {t('common.total')}: {order.total_amount.toLocaleString()} {t('common.currency')}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {order.customer_info && (
                            <div>
                              <h4 className="font-medium mb-1">{t('pos.dashboard.customerInfo')}:</h4>
                              <div className="text-sm space-y-1">
                                {order.customer_info.name && (
                                  <div>{t('common.name')}: {order.customer_info.name}</div>
                                )}
                                {order.customer_info.phone && (
                                  <div>{t('common.phone')}: {order.customer_info.phone}</div>
                                )}
                              </div>
                            </div>
                          )}

                          {order.notes && (
                            <div>
                              <h4 className="font-medium mb-1">{t('common.notes')}:</h4>
                              <p className="text-sm text-muted-foreground">{order.notes}</p>
                            </div>
                          )}

                          <div className="flex gap-2 flex-wrap">
                            {order.status === 'pending_approval' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, 'new')}
                                >
                                  {t('pos.actions.approve')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                >
                                  {t('pos.actions.reject')}
                                </Button>
                              </>
                            )}
                            {order.status === 'new' && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                              >
                                {t('pos.actions.startPreparing')}
                              </Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order.id, 'ready')}
                              >
                                {t('pos.actions.markReady')}
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => updateOrderStatus(order.id, 'completed')}
                              >
                                {t('pos.actions.markCompleted')}
                              </Button>
                            )}
                            {(order.status === 'new' || order.status === 'preparing') && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              >
                                {t('pos.actions.cancel')}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kitchen" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                {t('pos.dashboard.kitchenDisplay')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterOrdersByStatus('preparing').length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    {t('pos.dashboard.noPreparingOrders')}
                  </div>
                ) : (
                  filterOrdersByStatus('preparing').map((order) => (
                  <Card key={order.id} className="border-l-4 border-l-yellow-500">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">#{order.order_number}</CardTitle>
                        <Badge variant="outline">
                          {new Date(order.created_at).toLocaleTimeString('ar-EG', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {order.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="font-medium">{item.name}</span>
                            <span>x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      {order.notes && (
                        <div className="mt-3 p-2 bg-muted rounded text-sm">
                          <strong>{t('common.notes')}:</strong> {order.notes}
                        </div>
                      )}
                      <Button 
                        className="w-full mt-3"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                      >
                        {t('pos.actions.markReady')}
                      </Button>
                    </CardContent>
                  </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <POSAnalyticsTab />
        </TabsContent>

        <TabsContent value="tables" className="mt-6">
          <TableManagementTab />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};