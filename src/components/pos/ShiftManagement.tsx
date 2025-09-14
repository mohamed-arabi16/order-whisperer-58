import React, { useState } from 'react';
import { useShifts } from '@/hooks/useShifts';
import { useStaff } from '@/hooks/useStaff';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Play, Square, Users, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const ShiftManagement: React.FC = () => {
  const { shifts, currentShift, openShift, closeShift } = useShifts();
  const { staff } = useStaff();
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [openShiftData, setOpenShiftData] = useState({
    staff_user_id: '',
    opening_cash: 0
  });
  const [closeShiftData, setCloseShiftData] = useState({
    closing_cash: 0,
    notes: ''
  });

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await openShift(openShiftData.staff_user_id, openShiftData.opening_cash);
    if (result) {
      setIsOpenDialogOpen(false);
      setOpenShiftData({ staff_user_id: '', opening_cash: 0 });
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentShift) {
      const result = await closeShift(currentShift.id, closeShiftData.closing_cash, closeShiftData.notes);
      if (result) {
        setIsCloseDialogOpen(false);
        setCloseShiftData({ closing_cash: 0, notes: '' });
      }
    }
  };

  const getStaffName = (staffUserId: string) => {
    const staffMember = staff.find(s => s.id === staffUserId);
    return staffMember?.staff_name || 'غير معروف';
  };

  const formatShiftDuration = (start: string, end?: string) => {
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const duration = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}س ${minutes}د`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6" />
          <h2 className="text-2xl font-bold">إدارة الورديات</h2>
        </div>
        
        <div className="flex gap-2">
          {!currentShift ? (
            <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  فتح وردية
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle>فتح وردية جديدة</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleOpenShift} className="space-y-4">
                  <div>
                    <Label htmlFor="staff_user_id">الموظف</Label>
                    <Select
                      value={openShiftData.staff_user_id}
                      onValueChange={(value) => 
                        setOpenShiftData({ ...openShiftData, staff_user_id: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.filter(s => s.is_active).map((staffMember) => (
                          <SelectItem key={staffMember.id} value={staffMember.id}>
                            {staffMember.staff_name} - {staffMember.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="opening_cash">المبلغ النقدي الافتتاحي</Label>
                    <Input
                      id="opening_cash"
                      type="number"
                      min="0"
                      step="0.01"
                      value={openShiftData.opening_cash}
                      onChange={(e) => setOpenShiftData({ 
                        ...openShiftData, 
                        opening_cash: parseFloat(e.target.value) || 0 
                      })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      فتح الوردية
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsOpenDialogOpen(false)}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  إغلاق الوردية
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إغلاق الوردية الحالية</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleCloseShift} className="space-y-4">
                  <div>
                    <Label htmlFor="closing_cash">المبلغ النقدي النهائي</Label>
                    <Input
                      id="closing_cash"
                      type="number"
                      min="0"
                      step="0.01"
                      value={closeShiftData.closing_cash}
                      onChange={(e) => setCloseShiftData({ 
                        ...closeShiftData, 
                        closing_cash: parseFloat(e.target.value) || 0 
                      })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                    <Textarea
                      id="notes"
                      value={closeShiftData.notes}
                      onChange={(e) => setCloseShiftData({ 
                        ...closeShiftData, 
                        notes: e.target.value 
                      })}
                      placeholder="أي ملاحظات حول الوردية..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" variant="destructive" className="flex-1">
                      إغلاق الوردية
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {/* Current Shift Card */}
      {currentShift && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-green-800">الوردية الحالية</CardTitle>
              <Badge className="bg-green-600">نشطة</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  الموظف
                </div>
                <p className="font-medium">{getStaffName(currentShift.staff_user_id)}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  المدة
                </div>
                <p className="font-medium">{formatShiftDuration(currentShift.shift_start)}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  المبلغ الافتتاحي
                </div>
                <p className="font-medium">{formatCurrency(currentShift.opening_cash)}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  إجمالي المبيعات
                </div>
                <p className="font-medium">{formatCurrency(currentShift.total_sales)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Recent Shifts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">الورديات السابقة</h3>
        
        {shifts.filter(shift => shift.status === 'closed').slice(0, 10).map((shift) => (
          <Card key={shift.id}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">الموظف</div>
                  <p className="font-medium">{getStaffName(shift.staff_user_id)}</p>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">التاريخ</div>
                  <p className="font-medium">
                    {new Date(shift.shift_start).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">المدة</div>
                  <p className="font-medium">
                    {formatShiftDuration(shift.shift_start, shift.shift_end)}
                  </p>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">المبيعات</div>
                  <p className="font-medium">{formatCurrency(shift.total_sales)}</p>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">الطلبات</div>
                  <p className="font-medium">{shift.total_orders}</p>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">الفرق النقدي</div>
                  <p className={`font-medium ${
                    (shift.closing_cash || 0) - shift.opening_cash >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {formatCurrency((shift.closing_cash || 0) - shift.opening_cash)}
                  </p>
                </div>
              </div>
              
              {shift.notes && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">ملاحظات:</div>
                  <p className="text-sm">{shift.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {shifts.filter(shift => shift.status === 'closed').length === 0 && (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد ورديات سابقة</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftManagement;