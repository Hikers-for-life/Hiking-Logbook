import { useState } from "react";
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
import { useAuth } from '../contexts/AuthContext.jsx';
import { useEffect} from "react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must be less than 500 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
});



const EditProfile = () => {
  const [profileImage, setProfileImage] = useState("/placeholder.svg");
  const { currentUser } = useAuth();        //  get currentUser
  const [profile, setProfile] = useState(null); //  profile state
  const { toast } = useToast();
  const form = useForm({
  resolver: zodResolver(profileSchema),
  defaultValues: {
    name: currentUser.displayName || "No name",
    password: "",
    bio: "No bio yet",
    location: "Not set",
  },
});

useEffect(() => {
  if (!currentUser) return;

  const fetchProfile = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/users/${currentUser.uid}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);

      //  Update form values when profile loads
      form.reset({
        name: data.displayName || currentUser.displayName || "No name",
       
        bio: data.bio || "No bio yet",
        location: data.location || "Not set",
      });
    } catch (err) {
      console.error(err);
    }
  };

  fetchProfile();
}, [currentUser, form]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

const onSubmit = async (data) => {
  try {
    console.log("Submitting form data:", data);

    // Step 1: Check if latitude and longitude exist in current profile
    let latitude = profile?.latitude;
    let longitude = profile?.longitude;

    // Step 2: If location changed or coordinates missing, fetch from Geocoding API
    if (!latitude || !longitude || data.location !== profile?.location) {
      const geoRes = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(data.location)}&limit=1&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`
      );
      const geoData = await geoRes.json();
      if (!geoData || geoData.length === 0) {
        toast({
          title: "Invalid location",
          description: "Could not find coordinates for the specified location.",
          variant: "destructive",
        });
        return;
      }

      latitude = geoData[0].lat;
      longitude = geoData[0].lon;
    }

    // Step 3: Update Firestore with location + coordinates
    const res = await fetch(`http://localhost:3001/api/users/${currentUser.uid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName: data.name,
        bio: data.bio,
        location: data.location,
        latitude,
        longitude,
      }),
    });

    if (!res.ok) throw new Error("Failed to update profile");
    const updatedProfile = await res.json();
    setProfile(updatedProfile);

    toast({
      title: "Profile Updated",
      description: "Your hiking profile has been successfully updated!",
    });
  } catch (err) {
    console.error(err);
    toast({
      title: "Error",
      description: "Unable to update profile. Try again.",
      variant: "destructive",
    });
  }
};



  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-3xl font-bold">Edit Your Hiking Profile</h1>
          <p className="text-primary-foreground/90 mt-2">Update your information and share your hiking journey</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 -mt-8">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <div className="relative mx-auto mb-4">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={profileImage} alt="Profile picture" />
              <AvatarFallback className="text-2xl">
                {form.defaultValues?.name 
                  .split('')
                  .map((n) => n[0])
                  .join('')}
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

                {/* Password Field */}
              

                {/* Bio Field */}
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
                 
                    {/* fields... */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-border hover:bg-accent hover:text-accent-foreground"
                        asChild
                      >
                        <Link to="/">Cancel</Link>
                      </Button>
                    </div>
                  

                  
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
