import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ProfileData {
  id?: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  businessName?: string;
  specialization?: string;
  experience?: string;
  bio?: string;
  avatar?: string;
  preferences?: {
    theme?: string;
    notifications?: boolean;
    language?: string;
  };
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    email: user?.email || "",
    fullName: user?.user_metadata?.full_name || "",
    role: user?.user_metadata?.role || "",
    phone: user?.user_metadata?.phone || "",
    address: user?.user_metadata?.address || "",
    city: user?.user_metadata?.city || "",
    state: user?.user_metadata?.state || "",
    businessName: user?.user_metadata?.business_name || "",
    specialization: user?.user_metadata?.specialization || "",
    experience: user?.user_metadata?.experience || "",
    bio: user?.user_metadata?.bio || "",
    avatar: user?.user_metadata?.avatar || "",
    preferences: user?.user_metadata?.preferences || {
      theme: "light",
      notifications: true,
      language: "en"
    }
  });

  useEffect(() => {
    // Load profile data from backend if user exists
    if (user?.id) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest(`/api/profile/${user?.id}`);
      if (response) {
        setProfileData(prev => ({ ...prev, ...response }));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setIsLoading(true);
      
      // Update local storage for immediate sidebar update
      const updatedMetadata = {
        full_name: profileData.fullName,
        role: profileData.role,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        business_name: profileData.businessName,
        specialization: profileData.specialization,
        experience: profileData.experience,
        bio: profileData.bio,
        avatar: profileData.avatar,
        preferences: profileData.preferences
      };
      
      localStorage.setItem("anantya-user-meta", JSON.stringify(updatedMetadata));

      // Save to backend
      const response = await apiRequest('/api/profile', {
        method: user?.id ? 'PUT' : 'POST',
        body: {
          ...profileData,
          userId: user?.id
        }
      });

      if (response) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        
        // Reload the page to update the sidebar
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  return (
    <div className="p-3 md:p-6 max-w-4xl mx-auto">
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-lg md:text-xl">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                value={profileData.email} 
                disabled 
                className="bg-muted text-sm md:text-base"
              />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input 
                id="fullName"
                value={profileData.fullName} 
                onChange={(e) => handleInputChange('fullName', e.target.value)} 
                placeholder="Your full name"
                className="text-sm md:text-base"
              />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select value={profileData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger className="text-sm md:text-base">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Gemologist">Gemologist</SelectItem>
                  <SelectItem value="Assistant">Assistant</SelectItem>
                  <SelectItem value="Consultant">Consultant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone"
                value={profileData.phone || ""} 
                onChange={(e) => handleInputChange('phone', e.target.value)} 
                placeholder="+91 98765 43210"
                className="text-sm md:text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-lg md:text-xl">Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input 
                id="businessName"
                value={profileData.businessName || ""} 
                onChange={(e) => handleInputChange('businessName', e.target.value)} 
                placeholder="Your business name"
                className="text-sm md:text-base"
              />
            </div>
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Select value={profileData.specialization || ""} onValueChange={(value) => handleInputChange('specialization', value)}>
                <SelectTrigger className="text-sm md:text-base">
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ruby">Ruby</SelectItem>
                  <SelectItem value="Sapphire">Sapphire</SelectItem>
                  <SelectItem value="Emerald">Emerald</SelectItem>
                  <SelectItem value="Diamond">Diamond</SelectItem>
                  <SelectItem value="Pearl">Pearl</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Input 
                id="experience"
                value={profileData.experience || ""} 
                onChange={(e) => handleInputChange('experience', e.target.value)} 
                placeholder="e.g., 5 years"
                className="text-sm md:text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-lg md:text-xl">Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address"
                value={profileData.address || ""} 
                onChange={(e) => handleInputChange('address', e.target.value)} 
                placeholder="Your complete address"
                rows={3}
                className="text-sm md:text-base"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city"
                  value={profileData.city || ""} 
                  onChange={(e) => handleInputChange('city', e.target.value)} 
                  placeholder="City"
                  className="text-sm md:text-base"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input 
                  id="state"
                  value={profileData.state || ""} 
                  onChange={(e) => handleInputChange('state', e.target.value)} 
                  placeholder="State"
                  className="text-sm md:text-base"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-lg md:text-xl">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select 
                value={profileData.preferences?.theme || "light"} 
                onValueChange={(value) => handlePreferenceChange('theme', value)}
              >
                <SelectTrigger className="text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <Select 
                value={profileData.preferences?.language || "en"} 
                onValueChange={(value) => handlePreferenceChange('language', value)}
              >
                <SelectTrigger className="text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="gu">Gujarati</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bio Section */}
      <Card className="mt-4 md:mt-6">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl">Bio</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            value={profileData.bio || ""} 
            onChange={(e) => handleInputChange('bio', e.target.value)} 
            placeholder="Tell us about yourself, your expertise, and your journey in the gemstone industry..."
            rows={4}
            className="text-sm md:text-base"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-end mt-4 md:mt-6">
        <Button variant="outline" onClick={() => signOut()} className="w-full sm:w-auto">
          Sign out
        </Button>
        <Button onClick={saveProfile} disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}


