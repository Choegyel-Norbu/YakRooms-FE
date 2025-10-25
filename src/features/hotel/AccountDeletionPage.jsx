import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";
import { RadioGroup, RadioGroupItem } from "@/shared/components/radio-group";
import { Label } from "@/shared/components/label";
import { Textarea } from "@/shared/components/textarea";
import { Separator } from "@/shared/components/separator";
import { useAuth } from "../authentication";
import api from "@/shared/services/Api";
import { toast } from "sonner";
import { EzeeRoomLogo } from "@/shared/components";

const AccountDeletionPage = () => {
  const navigate = useNavigate();
  const { userId, hotelId, selectedHotelId, userName } = useAuth();
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const deletionReasons = [
    {
      id: "no-longer-needed",
      label: "No longer need the service",
      description: "I no longer require hotel management services"
    },
    {
      id: "switching-platforms",
      label: "Switching to another platform",
      description: "I'm moving to a different hotel management system"
    },
    {
      id: "business-closure",
      label: "Business closure",
      description: "My hotel business is closing down"
    },
    {
      id: "privacy-concerns",
      label: "Privacy concerns",
      description: "I have concerns about data privacy and security"
    },
    {
      id: "cost-issues",
      label: "Cost-related issues",
      description: "The service is too expensive for my needs"
    },
    {
      id: "technical-issues",
      label: "Technical difficulties",
      description: "I'm experiencing persistent technical problems"
    },
    {
      id: "poor-support",
      label: "Poor customer support",
      description: "I'm not satisfied with the support provided"
    },
    {
      id: "feature-limitations",
      label: "Missing features",
      description: "The platform doesn't have features I need"
    },
    {
      id: "other",
      label: "Other reason",
      description: "Please specify your reason below"
    }
  ];

  const handleSubmitDeletionRequest = async () => {
    if (!selectedReason) {
      toast.error("Please select a reason for account deletion");
      return;
    }

    if (selectedReason === "other" && !customReason.trim()) {
      toast.error("Please provide a reason for account deletion");
      return;
    }

    setIsSubmitting(true);

    try {
      // Use selectedHotelId if available, otherwise fall back to hotelId
      const currentHotelId = selectedHotelId || hotelId;
      
      const deletionData = {
        hotelId: parseInt(currentHotelId),
        deletionReason: selectedReason === "other" ? customReason.trim() : deletionReasons.find(r => r.id === selectedReason)?.description || selectedReason
      };

      // Submit deletion request to admin
      const response = await api.post("/hotels/request-deletion", deletionData);

      setIsSubmitted(true);
      
      toast.success("Deletion request submitted successfully", {
        description: `Your request has been sent to our admin team. ${response.data.emailSent ? 'Confirmation email sent.' : ''} ${response.data.adminsNotified ? `${response.data.adminsNotified} admins notified.` : ''}`
      });

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);

    } catch (error) {
      console.error("Error submitting deletion request:", error);
      toast.error("Failed to submit deletion request", {
        description: "Please try again or contact support if the issue persists."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate("/hotelAdmin");
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Request Submitted Successfully
            </h2>
            <p className="text-muted-foreground mb-6">
              Your account deletion request has been sent to our admin team. 
              You will be contacted within 24-48 hours regarding the next steps.
              A confirmation email has been sent to your registered email address.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Redirecting to homepage in a few seconds...
              </p>
              <Button 
                onClick={() => navigate("/")} 
                variant="outline" 
                className="w-full"
              >
                Go to Homepage Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3 lg:px-6 lg:py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {/* <Separator orientation="vertical" className="h-6" /> */}
            <div>
              <EzeeRoomLogo size="default" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Warning Card */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-destructive mb-2">
                    Account Deletion Request
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We're sorry to see you go, {userName}. Before we process your request, 
                    please help us understand why you're leaving. This information helps us 
                    improve our service for other hotel owners.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reason Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Why are you deleting your account?</CardTitle>
              <p className="text-sm text-muted-foreground">
                Please select the primary reason for your account deletion request.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={selectedReason}
                onValueChange={setSelectedReason}
                className="space-y-3"
              >
                {deletionReasons.map((reason) => (
                  <div key={reason.id} className="flex items-start space-x-3">
                    <RadioGroupItem 
                      value={reason.id} 
                      id={reason.id}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <Label 
                        htmlFor={reason.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {reason.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              {/* Custom Reason Input */}
              {selectedReason === "other" && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="custom-reason" className="text-sm font-medium">
                    Please specify your reason
                  </Label>
                  <Textarea
                    id="custom-reason"
                    placeholder="Tell us more about why you're leaving..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="min-h-[100px] resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {customReason.length}/500 characters
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <h4 className="font-semibold text-foreground mb-3">
                What happens next?
              </h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>Your deletion request will be reviewed by our admin team</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>Your hotel will not be discoverable by other users on our platform</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>Your account and all associated data will be permanently deleted</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>This action cannot be undone once processed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDeletionRequest}
              disabled={isSubmitting || !selectedReason || (selectedReason === "other" && !customReason.trim())}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                "Submit Deletion Request"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountDeletionPage;
