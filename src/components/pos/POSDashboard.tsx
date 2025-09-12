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
  RefreshCw
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface POSOrder {
  id: string;
  order_number: string;
  status: 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';
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
}

export const POSDashboard: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<POSOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue');

  // Load orders
  useEffect(() => {
    if (user) {
      loadOrders();
      subscribeToOrders();
    }
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
        title: "خطأ في تحميل الطلبات",
        description: "حدث خطأ أثناء تحميل طلبات نقاط البيع",
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
              title: "طلب جديد!",
              description: `طلب رقم ${newOrder.order_number} - ${newOrder.total_amount} ${t('common.currency')}`,
              variant: "default"
            });
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
        title: "تم تحديث الطلب",
        description: `تم تغيير حالة الطلب إلى ${t(`pos.status.${newStatus}`)}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث حالة الطلب",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: POSOrder['status']) => {
    switch (status) {
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
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
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
        <Button onClick={loadOrders} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          تحديث
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            {t('pos.dashboard.orderQueue')}
          </TabsTrigger>
          <TabsTrigger value="kitchen" className="flex items-center gap-2">
            <ChefHat className="w-4 h-4" />
            {t('pos.dashboard.kitchenDisplay')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle>{t('pos.dashboard.orderQueue')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد طلبات حالياً
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
                          <h4 className="font-medium mb-2">تفاصيل الطلب:</h4>
                          <div className="space-y-1 text-sm">
                            {order.items.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between">
                                <span>{item.name} x{item.quantity}</span>
                                <span>{(item.price * item.quantity).toLocaleString()} {t('common.currency')}</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t pt-2 mt-2 font-medium">
                            المجموع: {order.total_amount.toLocaleString()} {t('common.currency')}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {order.customer_info && (
                            <div>
                              <h4 className="font-medium mb-1">بيانات العميل:</h4>
                              <div className="text-sm space-y-1">
                                {order.customer_info.name && (
                                  <div>الاسم: {order.customer_info.name}</div>
                                )}
                                {order.customer_info.phone && (
                                  <div>الهاتف: {order.customer_info.phone}</div>
                                )}
                              </div>
                            </div>
                          )}

                          {order.notes && (
                            <div>
                              <h4 className="font-medium mb-1">ملاحظات:</h4>
                              <p className="text-sm text-muted-foreground">{order.notes}</p>
                            </div>
                          )}

                          <div className="flex gap-2 flex-wrap">
                            {order.status === 'new' && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                              >
                                بدء التحضير
                              </Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order.id, 'ready')}
                              >
                                جاهز
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => updateOrderStatus(order.id, 'completed')}
                              >
                                مكتمل
                              </Button>
                            )}
                            {(order.status === 'new' || order.status === 'preparing') && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              >
                                إلغاء
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

        <TabsContent value="kitchen">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                {t('pos.dashboard.kitchenDisplay')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterOrdersByStatus('preparing').map((order) => (
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
                          <strong>ملاحظات:</strong> {order.notes}
                        </div>
                      )}
                      <Button 
                        className="w-full mt-3"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                      >
                        جاهز للتسليم
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                
                {filterOrdersByStatus('preparing').length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    لا توجد طلبات قيد التحضير حالياً
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};