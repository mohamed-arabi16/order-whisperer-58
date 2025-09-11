import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Palette, Save, RefreshCw, RotateCcw } from "lucide-react";
import { generateHoverColor } from "@/components/branding/RestaurantBranding";

interface Tenant {
  id: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
}

interface ThemeCustomizerProps {
  tenant: Tenant;
  onUpdate: (colors: { primary_color?: string; secondary_color?: string; accent_color?: string }) => void;
}

const DEFAULT_COLORS = {
  primary: '#2F5233',
  secondary: '#A4C3B2', 
  accent: '#D67D3E',
};

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  tenant,
  onUpdate,
}) => {
  const { t, isRTL } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [colors, setColors] = useState({
    primary: tenant.primary_color || DEFAULT_COLORS.primary,
    secondary: tenant.secondary_color || DEFAULT_COLORS.secondary,
    accent: tenant.accent_color || DEFAULT_COLORS.accent,
  });

  const updatePreview = (colorType: string, color: string) => {
    if (colorType === 'primary') {
      document.documentElement.style.setProperty('--custom-primary', color);
      document.documentElement.style.setProperty('--custom-primary-hover', generateHoverColor(color));
    } else if (colorType === 'secondary') {
      document.documentElement.style.setProperty('--custom-secondary', color);
    } else if (colorType === 'accent') {
      document.documentElement.style.setProperty('--custom-accent', color);
    }
  };

  const handleColorChange = (colorType: 'primary' | 'secondary' | 'accent', color: string) => {
    setColors(prev => ({ ...prev, [colorType]: color }));
    updatePreview(colorType, color);
  };

  const handleReset = () => {
    setColors(DEFAULT_COLORS);
    updatePreview('primary', DEFAULT_COLORS.primary);
    updatePreview('secondary', DEFAULT_COLORS.secondary);
    updatePreview('accent', DEFAULT_COLORS.accent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          primary_color: colors.primary,
          secondary_color: colors.secondary,
          accent_color: colors.accent,
        })
        .eq('id', tenant.id);

      if (error) throw error;

      onUpdate({
        primary_color: colors.primary,
        secondary_color: colors.secondary,
        accent_color: colors.accent,
      });

      toast({
        title: t('restaurant.theme.updateSuccess'),
        description: t('restaurant.theme.updateSuccessDescription'),
      });
    } catch (error: any) {
      console.error('Error updating theme:', error);
      toast({
        title: t('restaurant.theme.updateError'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-card" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          {t('restaurant.theme.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="primary-color">{t('restaurant.theme.primaryColor')}</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="primary-color"
                  type="color"
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-16 h-10 p-1 rounded-lg"
                />
                <Input
                  type="text"
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  placeholder="#2F5233"
                  className="flex-1"
                  dir="ltr"
                />
              </div>
              <div 
                className="h-12 rounded-lg border-2"
                style={{ backgroundColor: colors.primary }}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="secondary-color">{t('restaurant.theme.secondaryColor')}</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="secondary-color"
                  type="color"
                  value={colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="w-16 h-10 p-1 rounded-lg"
                />
                <Input
                  type="text"
                  value={colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  placeholder="#A4C3B2"
                  className="flex-1"
                  dir="ltr"
                />
              </div>
              <div 
                className="h-12 rounded-lg border-2"
                style={{ backgroundColor: colors.secondary }}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="accent-color">{t('restaurant.theme.accentColor')}</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="accent-color"
                  type="color"
                  value={colors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="w-16 h-10 p-1 rounded-lg"
                />
                <Input
                  type="text"
                  value={colors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  placeholder="#D67D3E"
                  className="flex-1"
                  dir="ltr"
                />
              </div>
              <div 
                className="h-12 rounded-lg border-2"
                style={{ backgroundColor: colors.accent }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('restaurant.theme.resetToDefault')}
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t('restaurant.theme.updating')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t('restaurant.theme.saveChanges')}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};