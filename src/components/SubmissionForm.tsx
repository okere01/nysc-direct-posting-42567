import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  course: z.string().min(2, "Course must be at least 2 characters").max(100),
  callUp: z.string().min(2, "Call up number is required").max(50),
  stateOfOrigin: z.string().min(2, "State of origin is required").max(50),
  stateOfChoices: z.string().min(2, "State of choices is required").max(200),
  stateCode: z.string().optional(),
  serviceType: z.enum(["link_one", "link_two", "medical", "origin", "normal_relocate", "express_relocate"], {
    required_error: "Please select a service type",
  }),
  nyscEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  nyscPassword: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const SubmissionForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const serviceType = watch("serviceType");
  const stateOfChoices = watch("stateOfChoices");

  // Calculate price based on service type and state selection
  useEffect(() => {
    if (!serviceType) return;

    const isLagosOrAbuja = stateOfChoices?.toLowerCase().includes("lagos") || 
                           stateOfChoices?.toLowerCase().includes("abuja");

    let amount = 0;
    if (serviceType === "link_one") {
      amount = isLagosOrAbuja ? 130000 : 120000;
    } else if (serviceType === "link_two") {
      amount = isLagosOrAbuja ? 100000 : 90000;
    } else if (serviceType === "medical") {
      amount = 240000;
    } else if (serviceType === "origin") {
      amount = 250000;
    } else if (serviceType === "normal_relocate") {
      amount = isLagosOrAbuja ? 130000 : 120000;
    } else if (serviceType === "express_relocate") {
      amount = isLagosOrAbuja ? 230000 : 210000;
    }

    setCalculatedAmount(amount);
  }, [serviceType, stateOfChoices]);

  const onSubmit = async (data: FormData) => {
    if (!paymentProof) {
      toast.error("Please upload payment proof before submitting.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to submit your application.");
        navigate("/auth");
        return;
      }

      // Upload payment proof to storage
      const fileExt = paymentProof.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, paymentProof);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Insert submission with payment proof
      const { error } = await supabase.from("submissions").insert({
        user_id: session.user.id,
        name: data.name,
        course: data.course,
        call_up: data.callUp,
        state_of_origin: data.stateOfOrigin,
        state_of_choices: data.stateOfChoices,
        service_type: data.serviceType,
        calculated_amount: calculatedAmount,
        nysc_email: data.nyscEmail || null,
        nysc_password: data.nyscPassword || null,
        payment_proof_url: publicUrl,
      });

      if (error) throw error;

      toast.success("Submission successful! Your NYSC direct posting request has been received.");
      reset();
      setPaymentProof(null);
      navigate("/submissions");
    } catch (error) {
      toast.error("Failed to submit your application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File size must be less than 20MB");
        return;
      }
      setPaymentProof(file);
      toast.success("Payment proof uploaded successfully");
    }
  };

  return (
    <Card className="w-full shadow-xl border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-shadow">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-xl md:text-2xl font-bold text-foreground">NYSC Application Form</CardTitle>
        <CardDescription className="text-sm md:text-base text-muted-foreground">
          Fill in your details to submit your posting request
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 md:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="serviceType" className="text-foreground font-medium">
              Service Type <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="serviceType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="border-input bg-background">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link_one">Link One</SelectItem>
                    <SelectItem value="link_two">Link Two</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="origin">Origin</SelectItem>
                    <SelectItem value="normal_relocate">Normal Relocation</SelectItem>
                    <SelectItem value="express_relocate">Express Relocation</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.serviceType && (
              <p className="text-sm text-destructive">{errors.serviceType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter your full name"
              className="border-input bg-background"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="course" className="text-foreground font-medium">
              Course of Study <span className="text-destructive">*</span>
            </Label>
            <Input
              id="course"
              {...register("course")}
              placeholder="e.g., Computer Science"
              className="border-input bg-background"
            />
            {errors.course && (
              <p className="text-sm text-destructive">{errors.course.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="callUp" className="text-foreground font-medium">
              Call Up Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="callUp"
              {...register("callUp")}
              placeholder="Enter your call up number"
              className="border-input bg-background"
            />
            {errors.callUp && (
              <p className="text-sm text-destructive">{errors.callUp.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stateOfOrigin" className="text-foreground font-medium">
              State of Origin <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stateOfOrigin"
              {...register("stateOfOrigin")}
              placeholder="e.g., Lagos"
              className="border-input bg-background"
            />
            {errors.stateOfOrigin && (
              <p className="text-sm text-destructive">{errors.stateOfOrigin.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stateOfChoices" className="text-foreground font-medium">
              State of Choices <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stateOfChoices"
              {...register("stateOfChoices")}
              placeholder="e.g., Lagos, Abuja, Port Harcourt"
              className="border-input bg-background"
            />
            {errors.stateOfChoices && (
              <p className="text-sm text-destructive">{errors.stateOfChoices.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stateCode" className="text-foreground font-medium">
              State Code
            </Label>
            <Input
              id="stateCode"
              {...register("stateCode")}
              placeholder="Enter state code (optional)"
              className="border-input bg-background"
            />
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Login Details (Optional)
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nyscEmail" className="text-foreground font-medium">
                  NYSC Email
                </Label>
                <Input
                  id="nyscEmail"
                  type="email"
                  {...register("nyscEmail")}
                  placeholder="your.email@nysc.gov.ng"
                  className="border-input bg-background"
                />
                {errors.nyscEmail && (
                  <p className="text-sm text-destructive">{errors.nyscEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nyscPassword" className="text-foreground font-medium">
                  NYSC Password
                </Label>
                <Input
                  id="nyscPassword"
                  type="password"
                  {...register("nyscPassword")}
                  placeholder="Enter your NYSC portal password"
                  className="border-input bg-background"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Payment Information
            </h3>
            
            {calculatedAmount > 0 ? (
              <>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl p-4 md:p-6 mb-6 shadow-lg">
                  <div className="text-center mb-4">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground mb-2">
                      Total Amount to Pay
                    </p>
                    <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      ₦{calculatedAmount.toLocaleString()}
                    </p>
                    {(serviceType === "link_one" || serviceType === "link_two" || 
                      serviceType === "normal_relocate" || serviceType === "express_relocate") && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {stateOfChoices?.toLowerCase().includes("lagos") || 
                         stateOfChoices?.toLowerCase().includes("abuja")
                          ? "Lagos/Abuja rate applied"
                          : "Other states rate applied"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 md:p-6 mb-6 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Make payment to:
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-xs md:text-sm font-medium text-muted-foreground">Bank:</span>
                      <span className="text-sm md:text-base text-foreground font-semibold">Opay</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-xs md:text-sm font-medium text-muted-foreground">Account Number:</span>
                      <span className="text-sm md:text-base text-foreground font-semibold">6111931518</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs md:text-sm font-medium text-muted-foreground">Account Name:</span>
                      <span className="text-sm md:text-base text-foreground font-semibold">Olusegun Raphael</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-muted/50 border border-border rounded-lg p-6 mb-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Please select a service type and enter your state of choices to see the payment amount
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="paymentProof" className="text-foreground font-medium">
                Upload Payment Proof <span className="text-destructive">*</span>
              </Label>
              <Input
                id="paymentProof"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="border-input bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Upload screenshot or receipt of your payment (Max 20MB)
              </p>
              {paymentProof && (
                <p className="text-sm text-primary font-medium">
                  ✓ {paymentProof.name}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !paymentProof}
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed py-5 md:py-6 text-sm md:text-base"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
                Submitting...
              </span>
            ) : "Submit Application →"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
