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
import { Badge } from './ui/badge';
import {
  Target,
  Mountain,
  Clock,
  MapPin,
  TrendingUp,
  Calendar,
  X,
} from 'lucide-react';

// Form validation schema
const goalSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  category: z.enum(
    ['distance', 'time', 'elevation', 'hikes', 'streak', 'custom'],
    {
      required_error: 'Please select a category',
    }
  ),
  target: z.string().min(1, 'Target is required'),
  targetDate: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
});

const goalCategories = [
  { value: 'distance', label: 'Distance', icon: MapPin, unit: 'km' },
  { value: 'time', label: 'Time', icon: Clock, unit: 'hours' },
  { value: 'elevation', label: 'Elevation', icon: Mountain, unit: 'm' },
  { value: 'hikes', label: 'Number of Hikes', icon: Target, unit: 'hikes' },
  { value: 'streak', label: 'Streak', icon: TrendingUp, unit: 'days' },
  { value: 'custom', label: 'Custom', icon: Target, unit: '' },
];

const GoalForm = ({
  open,
  onOpenChange,
  onSubmit,
  initialData = null,
  title = 'Create New Goal',
}) => {
  const [selectedCategory, setSelectedCategory] = useState(
    initialData?.category || ''
  );

  // Helper function to format date for HTML date input
  const formatDateForInput = (date) => {
    if (!date) return '';

    console.log('formatDateForInput received:', date, 'type:', typeof date);

    try {
      // If it's already in YYYY-MM-DD format, return as is
      if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        console.log('Date already in correct format:', date);
        return date;
      }

      // If it's a Date object, convert to YYYY-MM-DD
      if (date instanceof Date) {
        const formatted = date.toISOString().split('T')[0];
        console.log('Converted Date object to:', formatted);
        return formatted;
      }

      // If it's a timestamp or other format, try to parse it
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        const formatted = parsedDate.toISOString().split('T')[0];
        console.log('Parsed date to:', formatted);
        return formatted;
      }

      console.log('Could not parse date:', date);
      return '';
    } catch (error) {
      console.warn('Failed to format date:', date, error);
      return '';
    }
  };

  const form = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      target: (
        initialData?.targetValue ||
        initialData?.maxProgress ||
        0
      ).toString(),
      targetDate: formatDateForInput(initialData?.targetDate),
      unit: initialData?.unit || '',
    },
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || '',
        target: (
          initialData.targetValue ||
          initialData.maxProgress ||
          0
        ).toString(),
        targetDate: formatDateForInput(initialData.targetDate),
        unit: initialData.unit || '',
      });
      setSelectedCategory(initialData.category || '');
    }
  }, [initialData, form]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category.value);
    form.setValue('category', category.value);
    form.setValue('unit', category.unit);
  };

  const handleSubmit = (data) => {
    const goalData = {
      title: data.title,
      description: data.description || '',
      category: data.category,
      targetValue: parseFloat(data.target),
      unit: data.unit,
      targetDate: data.targetDate || null,
    };

    onSubmit(goalData);
    form.reset();
    setSelectedCategory('');
    onOpenChange(false);
  };

  const selectedCategoryData = goalCategories.find(
    (cat) => cat.value === selectedCategory
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Hike 100km this year"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your goal and motivation..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Category</FormLabel>
              <div className="grid grid-cols-2 gap-3">
                {goalCategories.map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = selectedCategory === category.value;

                  return (
                    <div
                      key={category.value}
                      onClick={() => handleCategorySelect(category)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {category.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={selectedCategoryData?.unit || 'unit'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="targetDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? 'Update Goal' : 'Create Goal'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalForm;
