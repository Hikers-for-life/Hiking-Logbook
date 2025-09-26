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
import { ArrowLeft, Camera, MapPin, User, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { useAuth } from '../contexts/AuthContext.jsx';
// Correctly import both services
import { userApiService, locationService } from '../services/userService';

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
});

const EditProfile = () => {
  const [profileImage, setProfileImage] = useState("/placeholder.svg");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      bio: "",
      location: "",
    },
  });

  useEffect(() => {
    if (!currentUser) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        // NOTE: Changed to getCurrentProfile to fetch the logged-in user's data securely
        const data = await userApiService.getCurrentProfile();
        setProfile(data);

        form.reset({
          name: data.displayName || currentUser.displayName || "",
          bio: data.bio || "",
          location: data.location || "",
        });

        if (data.photoURL) {
          setProfileImage(data.photoURL);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, form, toast]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let latitude = profile?.latitude;
      let longitude = profile?.longitude;

      // If location changed or coordinates are missing, fetch them
      if (!latitude || !longitude || data.location !== profile?.location) {
        try {
          // FIX: Call getLocationCoordinates from the correct service
          const coordinates = await locationService.getLocationCoordinates(data.location);
          latitude = coordinates.latitude;
          longitude = coordinates.longitude;
        } catch (geoError) {
          console.error('Geocoding error:', geoError);
          toast({
            title: "Invalid location",
            description: "Could not find coordinates. Please check the spelling and try again.",
            variant: "destructive",
          });
          setIsSubmitting(false); // Stop submission
          return;
        }
      }

      const profileData = {
        displayName: data.name,
        bio: data.bio,
        location: data.location,
        latitude,
        longitude,
      };

      // FIX: Removed the redundant 'token' argument. 
      // The `makeAuthenticatedRequest` in your service handles this automatically.
      const updatedProfile = await userApiService.updateProfile(
        currentUser.uid,
        profileData
      );

      setProfile(updatedProfile.profile || updatedProfile);

      toast({
        title: "Profile Updated",
        description: "Your hiking profile has been successfully updated!",
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error.message || "Unable to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-accent p-6 text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-3xl font-bold">Edit Your Hiking Profile</h1>
          <p className="text-primary-foreground/90 mt-2">
            Update your information and share your hiking journey
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 -mt-8">
        <Card className="shadow-lg border-0" style={{ boxShadow: "var(--nature-shadow)" }}>
          <CardHeader className="text-center pb-6">
            <div className="relative mx-auto mb-4">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={profileImage} alt="Profile picture" />
                <AvatarFallback className="text-2xl">
                  {(profile?.displayName || currentUser?.displayName || 'U')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-3 cursor-pointer transition-colors shadow-lg">
                <Camera className="h-5 w-5" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  aria-label="Upload avatar" 
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <CardTitle className="text-2xl">Profile Settings</CardTitle>
            <CardDescription>
              Keep your hiking profile up to date to connect with fellow adventurers
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          Display Name
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your hiking name" 
                            className="focus:ring-primary" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          This is how other hikers will see you on the trail
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location Field */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-accent" />
                          Location
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="City, State/Country" 
                            className="focus:ring-primary" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Share your home base for local trail recommendations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Bio Field */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        About You
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell fellow hikers about your outdoor adventures, favorite trails, hiking experience, and what motivates you to explore nature..."
                          className="min-h-[120px] focus:ring-primary resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Share your hiking story and connect with like-minded adventurers ({field.value?.length || 0}/500)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Saving Changes...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-border hover:bg-accent hover:text-accent-foreground"
                    asChild
                    disabled={isSubmitting}
                  >
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