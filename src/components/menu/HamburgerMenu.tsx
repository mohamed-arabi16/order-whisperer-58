import { useState } from "react";
import { Menu, X, Phone, MessageSquare, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "../LanguageSwitcher";

interface HamburgerMenuProps {
  phoneNumber?: string;
  onFeedbackClick?: () => void;
}

/**
 * Hamburger menu component for mobile-friendly navigation.
 * Contains language switcher, call button, and feedback button.
 */
export const HamburgerMenu = ({ phoneNumber, onFeedbackClick }: HamburgerMenuProps) => {
  const { t, isRTL } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleCall = () => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
    setIsOpen(false);
  };

  const handleFeedback = () => {
    onFeedbackClick?.();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-2 h-8 w-8"
          aria-label={t('common.menu')}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side={isRTL ? "left" : "right"} className="w-72">
        <div className="flex flex-col gap-4 mt-8">
          {/* Language Switcher */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{t('header.language')}</span>
            </div>
            <LanguageSwitcher />
          </div>

          {/* Call Button */}
          {phoneNumber && (
            <Button
              variant="outline"
              onClick={handleCall}
              className="justify-start gap-3 h-12"
            >
              <Phone className="h-5 w-5" />
              {t('common.callUs')}
            </Button>
          )}

          {/* Feedback Button */}
          <Button
            variant="outline"
            onClick={handleFeedback}
            className="justify-start gap-3 h-12"
          >
            <MessageSquare className="h-5 w-5" />
            {t('common.feedback')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};