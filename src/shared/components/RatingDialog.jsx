import React, { useState, useEffect } from "react";
import { Heart, ThumbsUp, Smile, Frown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/dialog";
import { Button } from "@/shared/components/button";
import { Textarea } from "@/shared/components/textarea";
import { Label } from "@/shared/components/label";
import { Switch } from "@/shared/components/switch";
import { RatingScaleGroup, RatingScaleItem } from "@/components/ui/rating-scale-group";
import api from "@/shared/services/Api";
import { useAuth } from "@/features/authentication/AuthProvider";

const RatingDialog = ({ open, onOpenChange }) => {
  const { authState } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setRating(0);
      setHoveredRating(0);
      setComment("");
      setIsAnonymous(false);
      setIsSuccess(false);
    }
  }, [open]);

  const handleRatingChange = (value) => {
    setRating(parseInt(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAnonymous && rating === 0) return;

    setIsSubmitting(true);
    try {
      // Collect basic device information
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        timestamp: new Date().toISOString()
      };
      
      const feedbackData = {
        rating,
        comment: comment.trim() || "",
        userId: isAnonymous ? null : authState.userId,
        isAnonymous,
        deviceInfo
      };

      const response = await api.post("/feedbacks", feedbackData);
      
      if (response.status === 200 || response.status === 201) {
        setIsSuccess(true);
        // Auto-close after 2 seconds
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      // You could add a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingIcon = (value) => {
    if (value <= 3) return <Frown className="w-6 h-6 text-red-500" />;
    if (value <= 6) return <Smile className="w-6 h-6 text-yellow-500" />;
    if (value <= 8) return <ThumbsUp className="w-6 h-6 text-blue-500" />;
    return <Heart className="w-6 h-6 text-green-500" />;
  };

  const getRatingText = (value) => {
    if (value <= 3) return "Poor";
    if (value <= 6) return "Fair";
    if (value <= 8) return "Good";
    return "Excellent";
  };

  const getRatingColor = (value) => {
    if (value <= 3) return "text-red-500";
    if (value <= 6) return "text-yellow-500";
    if (value <= 8) return "text-blue-500";
    return "text-green-500";
  };

  if (isSuccess) {
    return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full animate-in slide-in-from-bottom-4 duration-300">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-xl font-semibold text-green-600">
              Thank You!
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Your feedback has been submitted successfully. We appreciate your input!
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Rate Your Experience
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Help us improve EzeeRoom by sharing your feedback
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              How would you rate EzeeRoom? {!isAnonymous && "*"}
            </Label>
            
            <div className="flex justify-center px-2">
              <RatingScaleGroup 
                value={rating.toString()} 
                onValueChange={handleRatingChange}
                className="flex-wrap justify-center gap-1 max-w-full"
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <RatingScaleItem 
                    key={i} 
                    value={(i + 1).toString()} 
                    label={(i + 1).toString()} 
                    className="h-8 w-8 text-xs"
                  />
                ))}
              </RatingScaleGroup>
            </div>

            {/* Rating Scale Labels */}
            <div className="flex justify-between text-xs font-medium text-muted-foreground px-2">
              <span>Not satisfied 😞</span>
              <span>Very satisfied 🤩</span>
            </div>

            {/* Rating Summary */}
            {rating > 0 && (
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {getRatingIcon(rating)}
                  <span className={`text-lg font-semibold ${getRatingColor(rating)}`}>
                    {rating}/10 - {getRatingText(rating)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium text-gray-700">
              Additional Comments (Optional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Tell us more about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500">
              {comment.length}/500 characters
            </div>
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="anonymous" className="text-sm font-medium text-gray-700">
                Submit anonymously
              </Label>
              <p className="text-xs text-gray-500">
                Your identity will remain private
              </p>
            </div>
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Maybe Later
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={(!isAnonymous && rating === 0) || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit Rating"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
