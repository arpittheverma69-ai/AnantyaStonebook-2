import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, User, Phone, Mail, MapPin, Gem, Star, AlertCircle, CheckCircle, Clock4 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import CustomCalendar from "@/components/ui/custom-calendar";
import CustomTimePicker from "@/components/ui/custom-time-picker";

const consultationFormSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientPhone: z.string().min(10, "Valid phone number is required"),
  clientEmail: z.string().email("Valid email is required"),
  consultationType: z.enum(["Initial", "Follow-up", "Emergency", "Routine", "VIP"]),
  consultationDate: z.date(),
  consultationTime: z.string().min(1, "Time is required"),
  duration: z.string().min(1, "Duration is required"),
  gemstoneInterest: z.array(z.string()).min(1, "At least one gemstone interest is required"),
  budget: z.string().min(1, "Budget range is required"),
  urgency: z.enum(["Low", "Medium", "High", "Critical"]),
  consultationStatus: z.enum(["Scheduled", "In Progress", "Completed", "Cancelled", "Rescheduled"]),
  consultationNotes: z.string().min(10, "Detailed notes are required"),
  followUpRequired: z.boolean(),
  followUpDate: z.date().optional(),
  followUpNotes: z.string().optional(),
  recommendations: z.string().min(10, "Recommendations are required"),
  nextSteps: z.string().min(10, "Next steps are required"),
  clientSatisfaction: z.number().min(1).max(5).optional(),
  specialRequirements: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  consultationMethod: z.enum(["In-Person", "Video Call", "Phone Call", "WhatsApp", "Email"]),
  paymentStatus: z.enum(["Pending", "Partial", "Completed", "Waived"]),
  consultationFee: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type ConsultationFormData = z.infer<typeof consultationFormSchema>;

interface ConsultationFormProps {
  onSubmit: (data: ConsultationFormData) => void;
  initialData?: Partial<ConsultationFormData>;
  isLoading?: boolean;
}

const gemstoneTypes = [
  "Ruby", "Blue Sapphire", "Emerald", "Diamond", "Pearl", "Yellow Sapphire", 
  "Red Coral", "Hessonite", "Cat's Eye", "White Sapphire", "Pink Sapphire", 
  "Aquamarine", "Amethyst", "Citrine", "Garnet", "Opal", "Turquoise", "Lapis Lazuli"
];

const budgetRanges = [
  "₹10,000 - ₹50,000",
  "₹50,000 - ₹1,00,000", 
  "₹1,00,000 - ₹5,00,000",
  "₹5,00,000 - ₹10,00,000",
  "₹10,00,000+"
];

const consultationTypes = [
  { value: "Initial", label: "Initial Consultation", icon: "👋" },
  { value: "Follow-up", label: "Follow-up", icon: "🔄" },
  { value: "Emergency", label: "Emergency", icon: "🚨" },
  { value: "Routine", label: "Routine Check", icon: "📋" },
  { value: "VIP", label: "VIP Consultation", icon: "👑" }
];

const urgencyLevels = [
  { value: "Low", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "Medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "High", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "Critical", label: "Critical", color: "bg-red-100 text-red-800" }
];

const consultationMethods = [
  { value: "In-Person", label: "In-Person", icon: "👥" },
  { value: "Video Call", label: "Video Call", icon: "📹" },
  { value: "Phone Call", label: "Phone Call", icon: "📞" },
  { value: "WhatsApp", label: "WhatsApp", icon: "💬" },
  { value: "Email", label: "Email", icon: "📧" }
];

export default function ConsultationForm({ onSubmit, initialData, isLoading }: ConsultationFormProps) {
  const [selectedGemstones, setSelectedGemstones] = useState<string[]>(initialData?.gemstoneInterest || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [showFollowUp, setShowFollowUp] = useState(initialData?.followUpRequired || false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: {
      consultationDate: initialData?.consultationDate || new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 12, 0, 0),
      consultationTime: initialData?.consultationTime || "09:00",
      consultationStatus: "Scheduled",
      paymentStatus: "Pending",
      consultationMethod: "In-Person",
      urgency: "Medium",
      followUpRequired: false,
      clientSatisfaction: 5,
      ...initialData,
    },
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (value !== undefined) {
          // Handle date fields specially to avoid timezone issues
          if (key === 'consultationDate' && value instanceof Date) {
            const dateOnly = new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12, 0, 0);
            setValue(key as keyof ConsultationFormData, dateOnly);
          } else if (key === 'followUpDate' && value instanceof Date) {
            const dateOnly = new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12, 0, 0);
            setValue(key as keyof ConsultationFormData, dateOnly);
          } else {
            setValue(key as keyof ConsultationFormData, value);
          }
        }
      });
    }
  }, [initialData, setValue]);

  const watchedFollowUpRequired = watch("followUpRequired");

  const handleGemstoneToggle = (gemstone: string) => {
    const updated = selectedGemstones.includes(gemstone)
      ? selectedGemstones.filter(g => g !== gemstone)
      : [...selectedGemstones, gemstone];
    setSelectedGemstones(updated);
    setValue("gemstoneInterest", updated);
  };

  const handleTagToggle = (tag: string) => {
    const updated = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(updated);
    setValue("tags", updated);
  };

  const handleFormSubmit = (data: ConsultationFormData) => {
    console.log('Form: handleFormSubmit called with data:', data);
    console.log('Form: selectedGemstones:', selectedGemstones);
    console.log('Form: selectedTags:', selectedTags);
    
    const finalData = {
      ...data,
      gemstoneInterest: selectedGemstones,
      tags: selectedTags,
    };
    
    console.log('Form: Final data being submitted:', finalData);
    onSubmit(finalData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <Card className="card-shadow-lg relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Consultation Management
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 relative">
            {/* Client Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      {...register("clientName")}
                      placeholder="Enter client's full name"
                      className="mt-1"
                    />
                    {errors.clientName && (
                      <p className="text-sm text-red-600 mt-1">{errors.clientName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="clientPhone">Phone Number *</Label>
                    <Input
                      id="clientPhone"
                      {...register("clientPhone")}
                      placeholder="Enter phone number"
                      className="mt-1"
                    />
                    {errors.clientPhone && (
                      <p className="text-sm text-red-600 mt-1">{errors.clientPhone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="clientEmail">Email Address *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      {...register("clientEmail")}
                      placeholder="Enter email address"
                      className="mt-1"
                    />
                    {errors.clientEmail && (
                      <p className="text-sm text-red-600 mt-1">{errors.clientEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      {...register("location")}
                      placeholder="City, State"
                      className="mt-1"
                    />
                    {errors.location && (
                      <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Consultation Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Consultation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Consultation Type *</Label>
                    <Select onValueChange={(value) => setValue("consultationType", value as any)} defaultValue={initialData?.consultationType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select consultation type" />
                      </SelectTrigger>
                      <SelectContent className="z-[99999]" side="bottom" align="start">
                        {consultationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Consultation Date *</Label>
                    <CustomCalendar
                      selectedDate={watch("consultationDate")}
                      onDateSelect={(date) => {
                        console.log('Form: Received date from calendar:', date);
                        console.log('Form: Date type:', typeof date);
                        console.log('Form: Date instanceof Date:', date instanceof Date);
                        console.log('Form: Date formatted:', format(date, "PPP"));
                        console.log('Form: Date ISO string:', date.toISOString());
                        setValue("consultationDate", date);
                      }}
                      placeholder="Click to select date"
                      className="mt-1 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="consultationTime">Time *</Label>
                      <CustomTimePicker
                        selectedTime={watch("consultationTime")}
                        onTimeSelect={(time) => setValue("consultationTime", time)}
                        placeholder="Select time"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration *</Label>
                      <Select onValueChange={(value) => setValue("duration", value)} defaultValue={initialData?.duration}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                        <SelectContent className="z-[99999]" side="bottom" align="start">
                          <SelectItem value="15 min">15 minutes</SelectItem>
                          <SelectItem value="30 min">30 minutes</SelectItem>
                          <SelectItem value="45 min">45 minutes</SelectItem>
                          <SelectItem value="1 hour">1 hour</SelectItem>
                          <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                          <SelectItem value="2 hours">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Consultation Method *</Label>
                    <Select onValueChange={(value) => setValue("consultationMethod", value as any)} defaultValue={initialData?.consultationMethod}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent className="z-[99999]" side="bottom" align="start">
                        {consultationMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            <span className="flex items-center gap-2">
                              <span>{method.icon}</span>
                              {method.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gemstone Interest & Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gem className="h-4 w-4" />
                    Gemstone Interest *
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {gemstoneTypes.map((gemstone) => (
                      <Button
                        key={gemstone}
                        type="button"
                        variant={selectedGemstones.includes(gemstone) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleGemstoneToggle(gemstone)}
                        className="text-xs"
                      >
                        {gemstone}
                      </Button>
                    ))}
                  </div>
                  {errors.gemstoneInterest && (
                    <p className="text-sm text-red-600 mt-2">{errors.gemstoneInterest.message}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Budget & Urgency
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Budget Range *</Label>
                    <Select onValueChange={(value) => setValue("budget", value)} defaultValue={initialData?.budget}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent className="z-[99999]" side="bottom" align="start">
                        {budgetRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Urgency Level *</Label>
                    <Select onValueChange={(value) => setValue("urgency", value as any)} defaultValue={initialData?.urgency}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent className="z-[99999]" side="bottom" align="start">
                        {urgencyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <Badge className={level.color}>{level.label}</Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="consultationFee">Consultation Fee</Label>
                    <Input
                      id="consultationFee"
                      {...register("consultationFee")}
                      placeholder="₹0"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Payment Status *</Label>
                    <Select onValueChange={(value) => setValue("paymentStatus", value as any)} defaultValue={initialData?.paymentStatus}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="z-[99999]" side="bottom" align="start">
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Partial">Partial</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Waived">Waived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Consultation Notes & Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Consultation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Consultation Status *</Label>
                  <Select onValueChange={(value) => setValue("consultationStatus", value as any)} defaultValue={initialData?.consultationStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="z-[99999]" side="bottom" align="start">
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                      <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                    </SelectContent>
                  </Select>
              </div>

                <div>
                  <Label htmlFor="consultationNotes">Consultation Notes *</Label>
                  <Textarea
                    id="consultationNotes"
                    {...register("consultationNotes")}
                    placeholder="Detailed notes about the consultation, client concerns, and observations..."
                    className="mt-1 min-h-[100px]"
                  />
                  {errors.consultationNotes && (
                    <p className="text-sm text-red-600 mt-1">{errors.consultationNotes.message}</p>
                  )}
              </div>

                <div>
                  <Label htmlFor="recommendations">Recommendations *</Label>
                  <Textarea
                    id="recommendations"
                    {...register("recommendations")}
                    placeholder="Gemstone recommendations, astrological advice, and suggestions..."
                    className="mt-1 min-h-[100px]"
                  />
                  {errors.recommendations && (
                    <p className="text-sm text-red-600 mt-1">{errors.recommendations.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nextSteps">Next Steps *</Label>
                  <Textarea
                    id="nextSteps"
                    {...register("nextSteps")}
                    placeholder="Action items, follow-up tasks, and next consultation details..."
                    className="mt-1 min-h-[100px]"
                  />
                  {errors.nextSteps && (
                    <p className="text-sm text-red-600 mt-1">{errors.nextSteps.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="specialRequirements">Special Requirements</Label>
                  <Textarea
                    id="specialRequirements"
                    {...register("specialRequirements")}
                    placeholder="Any special requirements, dietary restrictions, or specific needs..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Follow-up Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock4 className="h-4 w-4" />
                  Follow-up Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="followUpRequired"
                    {...register("followUpRequired")}
                    onChange={(e) => setShowFollowUp(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="followUpRequired">Follow-up Required</Label>
                </div>

                {showFollowUp && (
                  <div className="space-y-4 pl-6 border-l-2 border-muted">
                    <div>
                      <Label>Follow-up Date</Label>
                      <CustomCalendar
                        selectedDate={watch("followUpDate")}
                        onDateSelect={(date) => setValue("followUpDate", date)}
                        placeholder="Select follow-up date"
                        className="mt-1 cursor-pointer"
                      />
                    </div>

                    <div>
                      <Label htmlFor="followUpNotes">Follow-up Notes</Label>
                      <Textarea
                        id="followUpNotes"
                        {...register("followUpNotes")}
                        placeholder="Notes for the follow-up consultation..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags & Satisfaction */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {["VIP Client", "New Client", "Returning Client", "High Priority", "Astrology Focus", "Gemstone Focus", "Budget Conscious", "Premium Client"].map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTagToggle(tag)}
                        className="text-xs"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Client Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="satisfaction">Rating:</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Button
                          key={star}
                          type="button"
                          variant={(watch("clientSatisfaction") || 0) >= star ? "default" : "outline"}
                          size="sm"
                          onClick={() => setValue("clientSatisfaction", star)}
                          className="h-8 w-8 p-0"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline">
                Save Draft
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : initialData ? "Update Consultation" : "Log Consultation"}
              </Button>
            </div>
      </form>
        </CardContent>
      </Card>
    </div>
  );
}
