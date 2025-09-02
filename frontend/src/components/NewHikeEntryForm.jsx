import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Calendar, MapPin, Mountain, Clock, Thermometer, Camera } from "lucide-react";

// Form validation schema
const hikeSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required").max(200, "Location must be less than 200 characters"),
  distance: z.string().min(1, "Distance is required"),
  elevation: z.string().min(1, "Elevation is required"),
  duration: z.string().min(1, "Duration is required"),
  weather: z.string().min(1, "Weather is required").max(100, "Weather must be less than 100 characters"),
  difficulty: z.enum(["Easy", "Moderate", "Hard"], {
    required_error: "Please select a difficulty level",
  }),
  photos: z.string().transform((val) => parseInt(val) || 0),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
});

const NewHikeEntryForm = ({ open, onOpenChange, onSubmit, initialData = null, title = "Add New Hike Entry" }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialData?.difficulty || "");

  const form = useForm({
    resolver: zodResolver(hikeSchema),
    defaultValues: {
      title: initialData?.title || "",
      date: initialData?.date || "",
      location: initialData?.location || "",
      distance: initialData?.distance || "",
      elevation: initialData?.elevation || "",
      duration: initialData?.duration || "",
      weather: initialData?.weather || "",
      difficulty: initialData?.difficulty || "",
      photos: initialData?.photos?.toString() || "0",
      notes: initialData?.notes || "",
    },
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        date: initialData.date || "",
        location: initialData.location || "",
        distance: initialData.distance || "",
        elevation: initialData.elevation || "",
        duration: initialData.duration || "",
        weather: initialData.weather || "",
        difficulty: initialData.difficulty || "",
        photos: initialData.photos?.toString() || "0",
        notes: initialData.notes || "",
      });
      setSelectedDifficulty(initialData.difficulty || "");
    }
  }, [initialData, form]);

  const handleSubmit = (data) => {
    // Generate a unique ID for the new entry
    const newEntry = {
      id: Date.now(),
      ...data,
      photos: parseInt(data.photos) || 0,
    };
    
    onSubmit(newEntry);
    form.reset();
    setSelectedDifficulty("");
    onOpenChange(false);
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
    form.setValue("difficulty", difficulty);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground">
            {title}
          </DialogTitle>
          <p className="text-muted-foreground">
            {initialData ? 'Edit your hike entry details' : 'Record a hike you completed before using real-time tracking'}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Hike Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Sunrise at Eagle Peak" 
                      className="border-border"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Location Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Date
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="border-border"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Eagle Peak Trail, Colorado" 
                        className="border-border"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="distance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-1">
                      <Mountain className="h-4 w-4" />
                      Distance
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 8.2 miles" 
                        className="border-border"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="elevation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-1">
                      <Mountain className="h-4 w-4" />
                      Elevation
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 2,400 ft" 
                        className="border-border"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Duration
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 4h 30m" 
                        className="border-border"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Weather and Photos Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weather"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-1">
                      <Thermometer className="h-4 w-4" />
                      Weather
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Clear, 7°C" 
                        className="border-border"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-1">
                      <Camera className="h-4 w-4" />
                      Photos Count
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="0" 
                        className="border-border"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Difficulty Selection */}
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Difficulty Level</FormLabel>
                  <div className="flex gap-2 mt-2">
                    {["Easy", "Moderate", "Hard"].map((difficulty) => (
                      <Button
                        key={difficulty}
                        type="button"
                        variant={selectedDifficulty === difficulty ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDifficultySelect(difficulty)}
                        className={`min-w-[80px] ${
                          selectedDifficulty === difficulty
                            ? "bg-forest text-primary-foreground"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {difficulty}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience, memorable moments, or tips for other hikers..."
                      className="border-border min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-trail text-primary-foreground"
              >
                Add Past Hike
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewHikeEntryForm;
