import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Badge } from "./ui/badge";
import { Calendar, MapPin, Mountain, Clock, Users, Plus, X } from "lucide-react";

// Form validation schema
const hikePlanSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required").max(200, "Location must be less than 200 characters"),
  distance: z.string().min(1, "Distance is required"),
  estimatedDuration: z.string().min(1, "Estimated duration is required"),
  difficulty: z.enum(["Easy", "Moderate", "Hard"], {
    required_error: "Please select a difficulty level",
  }),
  maxParticipants: z.string().transform((val) => parseInt(val) || 1),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  meetingPoint: z.string().min(1, "Meeting point is required"),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
});

const NewHikePlanForm = ({ open, onOpenChange, onSubmit }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [inviteEmails, setInviteEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");

  const form = useForm({
    resolver: zodResolver(hikePlanSchema),
    defaultValues: {
      title: "",
      date: "",
      location: "",
      distance: "",
      estimatedDuration: "",
      difficulty: "",
      maxParticipants: "8",
      description: "",
      meetingPoint: "",
      notes: "",
    },
  });

  const handleSubmit = (data) => {
    // Generate a unique ID for the new plan
    const newPlan = {
      id: Date.now(),
      ...data,
      maxParticipants: parseInt(data.maxParticipants) || 1,
      participants: ["You"],
      invitedEmails: inviteEmails,
      status: "planning",
      createdAt: new Date().toISOString(),
    };
    
    onSubmit(newPlan);
    form.reset();
    setSelectedDifficulty("");
    setInviteEmails([]);
    setEmailInput("");
    onOpenChange(false);
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
    form.setValue("difficulty", difficulty);
  };

  const addInviteEmail = () => {
    if (emailInput && emailInput.includes("@") && !inviteEmails.includes(emailInput)) {
      setInviteEmails([...inviteEmails, emailInput]);
      setEmailInput("");
    }
  };

  const removeInviteEmail = (emailToRemove) => {
    setInviteEmails(inviteEmails.filter(email => email !== emailToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addInviteEmail();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground">
            Plan New Hike
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Title and Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Hike Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Weekend Warriors: Table Mountain" 
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
            </div>

            {/* Location and Meeting Point */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Trail Location
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Table Mountain National Park" 
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
                name="meetingPoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Meeting Point</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Lower Cable Station parking" 
                        className="border-border"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Distance, Duration, Max Participants */}
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
                        placeholder="e.g., 8.5 km" 
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
                name="estimatedDuration"
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

              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Max People
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="20"
                        placeholder="8" 
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

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the hike, highlights, what to expect..."
                      className="border-border min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Invite Friends */}
            <div className="space-y-3">
              <FormLabel className="text-foreground">Invite Friends (Optional)</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="border-border"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addInviteEmail}
                  className="border-forest text-forest hover:bg-forest hover:text-primary-foreground"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {inviteEmails.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {inviteEmails.map((email, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-forest/10 text-forest border-forest/20"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => removeInviteEmail(email)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Equipment needed, meeting instructions, special considerations..."
                      className="border-border min-h-[80px]"
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
                Create Hike Plan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewHikePlanForm;
