import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { 
  Plus,
  Edit,
  QrCode,
  Users,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface RestaurantTable {
  id: string;
  table_number: string;
  capacity: number;
  location_area?: string;
  qr_code_url?: string;
  is_active: boolean;
  currentOrder?: {
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
  };
}

export const TableManagementTab: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [formData, setFormData] = useState({
    table_number: '',
    capacity: 4,
    location_area: ''
  });

  useEffect(() => {
    if (user) {
      loadTables();
    }
  }, [user]);

  const loadTables = async () => {
    try {
      setLoading(true);
      
      // Load tables
      const { data: tablesData, error: tablesError } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('table_number::integer');

      if (tablesError) throw tablesError;

      // Load current orders for each table
      const tablesWithOrders = await Promise.all(
        (tablesData || []).map(async (table) => {
          const { data: orderData } = await supabase
            .from('pos_orders')
            .select('id, order_number, status, total_amount')
            .eq('table_id', table.id)
            .in('status', ['new', 'preparing', 'ready'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...table,
            currentOrder: orderData || undefined
          };
        })
      );

      setTables(tablesWithOrders);
    } catch (error) {
      console.error('Error loading tables:', error);
      toast({
        title: t('common.error'),
        description: "حدث خطأ أثناء تحميل الطاولات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get user's tenant
      const { data: userTenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id, slug')
        .eq('owner_id', (user as any).id)
        .single();

      if (tenantError || !userTenant) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على بيانات المطعم",
          variant: "destructive",
        });
        return;
      }

      const qrCodeUrl = `${window.location.origin}/menu/${userTenant.slug}?table=${formData.table_number}`;
      
      const tableData = {
        ...formData,
        tenant_id: userTenant.id,
        qr_code_url: qrCodeUrl
      };

      let result;
      if (editingTable) {
        result = await supabase
          .from('restaurant_tables')
          .update(tableData)
          .eq('id', editingTable.id);
      } else {
        result = await supabase
          .from('restaurant_tables')
          .insert([tableData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "تم الحفظ",
        description: editingTable ? "تم تحديث الطاولة بنجاح" : "تم إضافة الطاولة بنجاح",
        variant: "default"
      });

      setIsDialogOpen(false);
      setEditingTable(null);
      setFormData({ table_number: '', capacity: 4, location_area: '' });
      loadTables();
    } catch (error) {
      console.error('Error saving table:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ بيانات الطاولة",
        variant: "destructive"
      });
    }
  };

  const getTableStatus = (table: RestaurantTable) => {
    if (!table.is_active) return 'inactive';
    if (table.currentOrder) return 'occupied';
    return 'available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500 text-white';
      case 'occupied': return 'bg-red-500 text-white';
      case 'inactive': return 'bg-gray-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'occupied': return <Clock className="w-4 h-4" />;
      case 'inactive': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const openEditDialog = (table: RestaurantTable) => {
    setEditingTable(table);
    setFormData({
      table_number: table.table_number,
      capacity: table.capacity,
      location_area: table.location_area || ''
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingTable(null);
    setFormData({ table_number: '', capacity: 4, location_area: '' });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{t('pos.tables.title')}</h3>
          <p className="text-sm text-muted-foreground">
            إدارة طاولات المطعم وتتبع الطلبات الحالية
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 mr-2" />
              {t('pos.tables.addTable')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTable ? t('pos.tables.editTable') : t('pos.tables.addTable')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="table_number">{t('pos.tables.tableNumber')}</Label>
                <Input
                  id="table_number"
                  value={formData.table_number}
                  onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                  placeholder="مثال: 1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="capacity">{t('pos.tables.capacity')}</Label>
                <Select
                  value={formData.capacity.toString()}
                  onValueChange={(value) => setFormData({ ...formData, capacity: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'شخص' : 'أشخاص'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location_area">المنطقة</Label>
                <Input
                  id="location_area"
                  value={formData.location_area}
                  onChange={(e) => setFormData({ ...formData, location_area: e.target.value })}
                  placeholder="مثال: الدور الأول، النافذة، الشرفة"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingTable ? 'حفظ' : 'إضافة'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {tables.filter(t => getTableStatus(t) === 'available').length}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('pos.tables.available')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold">
                  {tables.filter(t => getTableStatus(t) === 'occupied').length}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('pos.tables.occupied')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-2xl font-bold">
                  {tables.filter(t => !t.is_active).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  غير نشطة
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {tables.reduce((sum, t) => sum + t.capacity, 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  إجمالي السعة
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => {
          const status = getTableStatus(table);
          return (
            <Card key={table.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    طاولة #{table.table_number}
                  </CardTitle>
                  <Badge className={getStatusColor(status)}>
                    {getStatusIcon(status)}
                    <span className="mr-1">
                      {status === 'available' ? t('pos.tables.available') :
                       status === 'occupied' ? t('pos.tables.occupied') : 'غير نشطة'}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{table.capacity} أشخاص</span>
                  </div>
                  
                  {table.location_area && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{table.location_area}</span>
                    </div>
                  )}

                  {table.currentOrder && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium">
                        {t('pos.tables.currentOrder')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        #{table.currentOrder.order_number}
                      </div>
                      <div className="text-sm font-medium">
                        {table.currentOrder.total_amount.toLocaleString()} {t('common.currency')}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(table)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (table.qr_code_url) {
                          // Generate QR code image URL and open it
                          const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&data=${encodeURIComponent(table.qr_code_url)}`;
                          window.open(qrImageUrl, '_blank');
                        } else {
                          toast({
                            title: "خطأ",
                            description: "لا يوجد رمز QR لهذه الطاولة",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="flex-1"
                    >
                      <QrCode className="w-4 h-4 mr-1" />
                      QR
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {tables.length === 0 && (
          <div className="col-span-full text-center py-8">
            <div className="text-muted-foreground">
              لا توجد طاولات مضافة بعد
            </div>
            <Button className="mt-4" onClick={openNewDialog}>
              <Plus className="w-4 h-4 mr-2" />
              إضافة أول طاولة
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};