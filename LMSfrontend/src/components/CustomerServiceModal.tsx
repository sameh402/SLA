import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Phone,
  Mail,
  User,
  MessageSquare,
  Send,
  HeadphonesIcon
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { useI18n } from "@/lib/i18n";
import api from "@/api/client";
import { useToast } from "@/hooks/use-toast";

interface CustomerServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerServiceModal({ isOpen, onClose }: CustomerServiceModalProps) {
  const { user } = useAuth();
  const { t, language } = useI18n();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setFormData({ subject: "", message: "" });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) return;

    setIsSubmitting(true);
    try {
      await api.post("/api/support/tickets/", {
        subject: formData.subject,
        message: formData.message
      });
      setIsSubmitted(true);
      toast({
        title: language === "ar" ? "تم الإرسال" : "Message Sent",
        description: language === "ar" ? "تم إرسال رسالتك بنجاح" : "Your message has been sent successfully",
      });

      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Support ticket error:", error);
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل في إرسال الرسالة" : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-600/5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <HeadphonesIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl text-foreground">
                  {language === "ar" ? "خدمة العملاء" : "Customer Service"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "نحن هنا لمساعدتك في أي أسئلة أو استفسارات" : "We're here to help you with any questions or concerns"}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isSubmitted ? (
            /* Success Message */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {language === "ar" ? "تم إرسال الرسالة بنجاح!" : "Message Sent Successfully!"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === "ar"
                  ? "شكراً لتواصلك معنا. سيرد عليك فريق الدعم في أقرب وقت ممكن."
                  : "Thank you for contacting us. Our support team will get back to you as soon as possible."}
              </p>
            </div>
          ) : (
            /* Contact Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Info (Read Only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {language === "ar" ? "الموضوع" : "Subject"}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder={language === "ar" ? "ما هو موضوع استفسارك؟" : "What is your inquiry about?"}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    {language === "ar" ? "رسالتك" : "Your Message"}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder={language === "ar" ? "يرجى وصف سؤالك أو مشكلتك بالتفصيل..." : "Please describe your question or issue in detail..."}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  <p>{language === "ar" ? "وقت الرد المتوقع: خلال 24 ساعة" : "Response time: Usually within 24 hours"}</p>
                </div>

                <div className="flex space-x-3 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.message.trim() || !formData.subject.trim()}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{language === "ar" ? "جاري الإرسال..." : "Sending..."}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>{language === "ar" ? "إرسال الرسالة" : "Send Message"}</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
