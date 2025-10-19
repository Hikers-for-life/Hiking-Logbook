import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Calendar, MapPin, Mountain, Clock } from 'lucide-react';

// Updated form validation schema
const hikePlanSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200, 'Location must be less than 200 characters'),
  distance: z.string().min(1, 'Distance is required'),
  difficulty: z.enum(['Easy', 'Moderate', 'Hard'], {
    required_error: 'Please select a difficulty level',
  }),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
});

const NewHikePlanForm = ({
  open,
  onOpenChange,
  onSubmit,
  editingHike,
  isEditMode,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const form = useForm({
    resolver: zodResolver(hikePlanSchema),
    defaultValues: {
      title: '',
      date: '',
      startTime: '',
      location: '',
      distance: '',
      difficulty: '',
      description: '',
      notes: '',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && editingHike) {
      form.reset({
        title: editingHike.title || editingHike.trailName || '',
        date: editingHike.date || '',
        startTime: editingHike.startTime || '',
        location: editingHike.location || '',
        distance: editingHike.distance || '',
        difficulty: editingHike.difficulty || '',
        description: editingHike.description || '',
        notes: editingHike.notes || '',
      });
      setSelectedDifficulty(editingHike.difficulty || '');
    } else if (editingHike) {
      // Handle trail data from TrailExplorer
      form.reset({
        title: editingHike.trailName || editingHike.title || '',
        date: editingHike.date || '',
        startTime: editingHike.startTime || '',
        location: editingHike.location || '',
        distance: editingHike.distance || '',
        difficulty: editingHike.difficulty || '',
        description: editingHike.description || '',
        notes: editingHike.notes || '',
      });
      setSelectedDifficulty(editingHike.difficulty || '');
    } else {
      form.reset({
        title: '',
        date: '',
        startTime: '',
        location: '',
        distance: '',
        difficulty: '',
        description: '',
        notes: '',
      });
      setSelectedDifficulty('');
    }
  }, [isEditMode, editingHike, form]);

  const handleSubmit = (data) => {
    const planData = {
      ...data,
      participants: ['You'],
      status: 'planning',
      createdAt: new Date().toISOString(),
    };

    onSubmit(planData);
    form.reset();
    setSelectedDifficulty('');
    onOpenChange(false);
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
    form.setValue('difficulty', difficulty);
  };

  const handleClose = () => {
    form.reset();
    setSelectedDifficulty('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground">
            {isEditMode ? 'Edit Hike Plan' : 'Plan New Hike'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Title */}
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

            {/* Date and Start Time Row */}
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
                      <Input type="date" className="border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Start Time
                    </FormLabel>
                    <FormControl>
                      <Input type="time" className="border-border" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location and Distance */}
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
            </div>

            {/* Difficulty Selection */}
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Difficulty Level
                  </FormLabel>
                  <div className="flex gap-2 mt-2">
                    {['Easy', 'Moderate', 'Hard'].map((difficulty) => (
                      <Button
                        key={difficulty}
                        type="button"
                        variant={
                          selectedDifficulty === difficulty
                            ? 'default'
                            : 'outline'
                        }
                        size="sm"
                        onClick={() => handleDifficultySelect(difficulty)}
                        className={`min-w-[80px] ${
                          selectedDifficulty === difficulty
                            ? 'bg-forest text-primary-foreground'
                            : 'border-border hover:bg-muted'
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

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Additional Notes (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Equipment needed, special considerations, meeting instructions..."
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
                onClick={handleClose}
                className="border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-trail text-primary-foreground"
              >
                {isEditMode ? 'Update Hike Plan' : 'Create Hike Plan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewHikePlanForm;
