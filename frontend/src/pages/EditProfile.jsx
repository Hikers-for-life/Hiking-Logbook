import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { ArrowLeft, Camera, MapPin, User, Lock, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext.jsx";
import { userApiService, locationService } from "../services/userService";


const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must be less than 500 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
});

const EditProfile = () => {
  const [profileImage, setProfileImage] = useState("/placeholder.svg");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      password: "",
      bio: "",
      location: "",
    },
  });

  // ✅ Fetch user profile on mount
  useEffect(() => {
    if (!currentUser) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await userApiService.getCurrentProfile();
        setProfile(data);

        form.reset({
          name: data.displayName || currentUser.displayName || "No name",
          password: "",
          bio: data.bio || "No bio yet",
          location: data.location || "Not set",
        });

        if (data.photoURL) setProfileImage(data.photoURL);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast({
          title: "Error",
          description: "Could not load profile data. Please refresh.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, form, toast]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max size is 5MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => setProfileImage(event.target?.result);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let { latitude, longitude } = profile || {};

      if (!latitude || !longitude || data.location !== profile?.location) {
        try {
          const coords = await locationService.getLocationCoordinates(data.location);
          latitude = coords.latitude;
          longitude = coords.longitude;
        } catch (geoError) {
          console.error("Geocoding error:", geoError);
          toast({
            title: "Invalid location",
            description: "Could not resolve location. Please check spelling.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const updated = await userApiService.updateProfile(currentUser.uid, {
        displayName: data.name,
        bio: data.bio,
        location: data.location,
        latitude,
        longitude,
        ...(data.password ? { password: data.password } : {}),
      });

      setProfile(updated.profile || updated);
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: error.message || "Could not update profile. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-3xl font-bold">Edit Your Hiking Profile</h1>
          <p className="mt-2 opacity-90">Update your information and share your hiking story</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 -mt-8">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <div className="relative mx-auto mb-4">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={profileImage} alt="Profile picture" />
                <AvatarFallback className="text-2xl">
                  {(profile?.displayName || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-3 cursor-pointer shadow-lg">
                <Camera className="h-5 w-5" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            <CardTitle className="text-2xl">Profile Settings</CardTitle>
            <CardDescription>Keep your profile updated to connect with fellow hikers</CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel><User className="h-4 w-4 text-primary inline mr-1" /> Display Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormDescription>This name will be visible to other hikers</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel><MapPin className="h-4 w-4 text-accent inline mr-1" /> Location</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormDescription>Helps us recommend nearby trails</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Password (optional) */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel><Lock className="h-4 w-4 text-primary inline mr-1" /> New Password</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormDescription>Leave blank to keep current password</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bio */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel><FileText className="h-4 w-4 text-primary inline mr-1" /> About You</FormLabel>
                      <FormControl><Textarea {...field} className="min-h-[120px]" /></FormControl>
                      <FormDescription>{field.value?.length || 0}/500 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/">Cancel</Link>
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
