import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Shield,
  Bell,
  CreditCard,
  FileText,
  Trash2,
  Globe,
  Upload,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

const Settings = () => {
  const { t, language, setLanguage } = useTranslation();
  const { toast } = useToast();
  
  // User data state
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    cccd: "",
    licenseNumber: "",
    address: "",
    gender: "",
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    emailBooking: true,
    emailPromotions: false,
    smsReminders: true,
    pushNotifications: true,
  });

  // Auto fill user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          toast({
            title: "Error",
            description: "Please login to access settings",
            variant: "destructive",
          });
          return;
        }

        const response = await apiService.getCurrentUser();
        if (response.success && response.user) {
          const user = response.user;
          setUserData({
            fullName: user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
            dateOfBirth: user.dateOfBirth || "",
            cccd: user.cccd || "",
            licenseNumber: user.licenseNumber || "",
            address: user.address || "",
            gender: user.gender || "",
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [toast]);

  // Handle input changes
  const handleInputChange = (field: keyof typeof userData, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const response = await apiService.updatePersonalInfo({
        email: userData.email,
        cccd: userData.cccd,
        licenseNumber: userData.licenseNumber,
        address: userData.address,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        phone: userData.phone,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Personal information updated successfully",
        });
      } else {
        throw new Error("Failed to update personal information");
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("settings.title")}
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t("settings.subtitle")}
          </p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">{t("settings.profile")}</TabsTrigger>
            <TabsTrigger value="security">{t("settings.security")}</TabsTrigger>
            <TabsTrigger value="notifications">
              {t("settings.notifications")}
            </TabsTrigger>
            <TabsTrigger value="billing">{t("settings.billing")}</TabsTrigger>
            <TabsTrigger value="language">{t("settings.language")}</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {t("settings.personalInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading user data...</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">{t("settings.firstName")}</Label>
                        <Input
                          id="fullName"
                          value={userData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="text-black"
                          disabled
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">{t("settings.email")}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="text-black"
                          disabled
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">{t("settings.phone")}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={userData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="text-black"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dateOfBirth">
                        {t("settings.dateOfBirth")}
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={userData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="text-black"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={userData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="text-black"
                        placeholder="Enter your address"
                      />
                    </div>

                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={userData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                        <SelectTrigger className="text-black">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {t("settings.driversLicense")}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="licenseNumber">
                            {t("settings.licenseNumber")}
                          </Label>
                          <Input
                            id="licenseNumber"
                            value={userData.licenseNumber}
                            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                            className="text-black"
                            placeholder="Enter your license number"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {language === "vi"
                          ? "Căn Cước Công Dân (CCCD)"
                          : "Identity Verification"}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cccdNumber">
                            {language === "vi" ? "Số CCCD" : "ID Number"}
                          </Label>
                          <Input
                            id="cccdNumber"
                            value={userData.cccd}
                            onChange={(e) => handleInputChange('cccd', e.target.value)}
                            className="text-black"
                            placeholder={
                              language === "vi"
                                ? "Nhập số CCCD 12 số"
                                : "Enter 12-digit ID number"
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {t("settings.saveChanges")}
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  {t("settings.security")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {t("settings.changePassword")}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">
                        {t("settings.currentPassword")}
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        className="text-black"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">
                        {t("settings.newPassword")}
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        className="text-black"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">
                        {t("settings.confirmPassword")}
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="text-black"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {t("settings.twoFactorAuth")}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("settings.enable2FA")}</p>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Button>{t("settings.saveChanges")}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  {t("settings.notifications")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("settings.emailNotifications")}</p>
                      <p className="text-sm text-gray-600">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailBooking}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, emailBooking: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("settings.smsNotifications")}</p>
                      <p className="text-sm text-gray-600">
                        Receive notifications via SMS
                      </p>
                    </div>
                    <Switch
                      checked={notifications.smsReminders}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, smsReminders: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("settings.pushNotifications")}</p>
                      <p className="text-sm text-gray-600">
                        Receive push notifications
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("settings.bookingConfirmations")}</p>
                      <p className="text-sm text-gray-600">
                        Get notified about booking confirmations
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailBooking}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, emailBooking: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("settings.promotionalEmails")}</p>
                      <p className="text-sm text-gray-600">
                        Receive promotional emails and offers
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailPromotions}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, emailPromotions: checked }))
                      }
                    />
                  </div>
                </div>

                <Button>{t("settings.saveChanges")}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  {t("settings.billing")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {t("settings.paymentMethods")}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        <span>**** **** **** 1234</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Remove
                      </Button>
                    </div>
                    <Button variant="outline">
                      {t("settings.addPaymentMethod")}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {t("settings.billingHistory")}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Monthly Subscription</p>
                        <p className="text-sm text-gray-600">Dec 1, 2023</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$29.99</p>
                        <p className="text-sm text-green-600">Paid</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button>{t("settings.saveChanges")}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Language Tab */}
          <TabsContent value="language">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  {t("settings.language")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="language">{t("settings.selectLanguage")}</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t("settings.english")}</SelectItem>
                      <SelectItem value="vi">{t("settings.vietnamese")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button>{t("settings.saveChanges")}</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;