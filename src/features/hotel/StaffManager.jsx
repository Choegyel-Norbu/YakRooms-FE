import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { Button } from "@/shared/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/alert-dialog";

import { Separator } from "@/shared/components/separator";
import { Skeleton } from "@/shared/components/skeleton";
import { Badge } from "@/shared/components/badge";
import { toast } from "sonner";
import {
  Trash2,
  Plus,
  User,
  Phone,
  Mail,
  Users,
  AlertCircle,
  RefreshCw,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/dropdown-menu";
import api from "../../shared/services/Api";
import { useAuth } from "@/features/authentication";

// Validation utilities
const validators = {
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address",
  },
  phone: {
    regex: /^[\+]?[1-9][\d]{7,15}$/,
    message: "Please enter a valid phone number",
  },
};

const StaffManager = () => {
  const { hotelId } = useAuth();

  // State management
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    position: "Front Desk",
    dateJoined: new Date().toISOString().split('T')[0], // Default to today's date
  });
  const [formErrors, setFormErrors] = useState({});

  const staffPositions = [
    "frontdesk",
    "Housekeeping",
    "Manager",
    "Concierge",
    "Security",
    "Maintenance",
    "Chef",
    "Porter",
    "Waiter",
    "Bellhop",
    "Other",
  ];

  // Fetch staff data
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get(`/staff/hotel/${hotelId}`);

      console.log("Staff data fetched:", data);
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching staff:", error);
      console.error("Error response data:", error.response?.data);
      
      let errorMessage = "Failed to load staff members";
      
      // Handle different error response formats
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        const responseData = error.response.data;
        if (responseData.error === "Internal Server Error" && responseData.status === 500) {
          errorMessage = "The server encountered an unexpected error while loading staff members. Please try again in a few moments.";
          console.error("Server error details:", responseData);
        } else {
          errorMessage = `Server error: ${responseData.error}`;
        }
      } else if (error.response?.status === 500) {
        errorMessage = "The server encountered an unexpected error. Please try again in a few moments.";
      }
      
      setError(errorMessage);
      toast.error("Failed to load staff members. Please try again.", { duration: 6000 });
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  // Initial data fetch
  useEffect(() => {
    if (hotelId) {
    fetchStaff();
    }
  }, [fetchStaff, hotelId]);

  // Form validation
  const validateForm = useCallback(() => {
    const errors = {};

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validators.email.regex.test(formData.email.trim())) {
      errors.email = validators.email.message;
    }

    // Phone validation
    const cleanPhone = formData.phoneNumber.replace(/[\s\-\(\)]/g, "");
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!validators.phone.regex.test(cleanPhone)) {
      errors.phoneNumber = validators.phone.message;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Add new staff member
  const handleAddStaff = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Handle frontdesk position with specific value
      let positionValue = formData.position;
      if (formData.position === "Front Desk" || formData.position.toLowerCase() === "frontdesk") {
        positionValue = "frontdesk"; // Send this specific value for frontdesk
      }

      const payload = {
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim(),
        hotelId,
        position: positionValue,
        dateJoined: formData.dateJoined,
        roles: ["STAFF"]
      };

      const { data: newStaff } = await api.post("/staff", payload);

      setStaff((prev) => [...prev, newStaff]);
      handleCloseDialog();
      toast.success("Staff member added successfully!", { duration: 6000 });
    } catch (error) {
      console.error("Error adding staff:", error);
      console.error("Error response data:", error.response?.data);
      let errorMessage = "Failed to add staff member";
      
      // Handle specific backend exceptions
      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        
        // Handle ResourceConflictException for email conflicts
        if (backendMessage.includes("Staff") && backendMessage.includes("email")) {
          errorMessage = "A staff member with this email address already exists. Please use a different email.";
        } 
        // Handle other conflict exceptions
        else if (backendMessage.includes("already exists") || backendMessage.includes("conflict")) {
          errorMessage = "This staff member information conflicts with existing data. Please check the details and try again.";
        }
        // Handle validation errors
        else if (backendMessage.includes("Invalid") || backendMessage.includes("validation")) {
          errorMessage = "Invalid data provided. Please check the email and phone number format.";
        }
        // Use the backend message directly for other cases
        else {
          errorMessage = backendMessage;
        }
      }
      // Handle response body with error field (500 Internal Server Error format)
      else if (error.response?.data?.error) {
        const responseData = error.response.data;
        
        if (responseData.error === "Internal Server Error" && responseData.status === 500) {
          errorMessage = "The server encountered an unexpected error while adding the staff member. Please try again in a few moments.";
          
          // Log detailed error for debugging
          console.error("Server error details:", {
            timestamp: responseData.timestamp,
            status: responseData.status,
            error: responseData.error,
            path: responseData.path
          });
        } else {
          errorMessage = `Server error: ${responseData.error}`;
        }
      }
      // Handle HTTP status codes
      else if (error.response?.status === 500) {
        errorMessage = "The server encountered an unexpected error. Please try again in a few moments.";
      } else if (error.response?.status === 409) {
        errorMessage = "A staff member with this email address already exists. Please use a different email.";
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid data provided. Please check the email and phone number format.";
      } else if (error.response?.status === 422) {
        errorMessage = "The provided data is invalid or incomplete. Please verify all fields.";
      } else if (error.response?.status === 503) {
        errorMessage = "The service is temporarily unavailable. Please try again later.";
      } else if (error.response?.status >= 500) {
        errorMessage = "A server error occurred. Please try again later.";
      }
      
      toast.error(errorMessage, { duration: 6000 });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete staff member
  const handleDeleteStaff = async (staffMember) => {
    try {
      setDeletingId(staffMember.id);

      await api.delete(`/staff/${staffMember.staffId}`);

      setStaff((prev) => prev.filter((member) => member.id !== staffMember.id));
      toast.success("Staff member removed successfully!", { duration: 6000 });
    } catch (error) {
      console.error("Error deleting staff:", error);
      console.error("Error response data:", error.response?.data);
      
      let errorMessage = "Failed to delete staff member";
      
      // Handle different error response formats
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        const responseData = error.response.data;
        if (responseData.error === "Internal Server Error" && responseData.status === 500) {
          errorMessage = "The server encountered an unexpected error while deleting the staff member. Please try again in a few moments.";
          console.error("Server error details:", responseData);
        } else {
          errorMessage = `Server error: ${responseData.error}`;
        }
      } else if (error.response?.status === 500) {
        errorMessage = "The server encountered an unexpected error. Please try again in a few moments.";
      }
      
      toast.error(errorMessage, { duration: 6000 });
    } finally {
      setDeletingId(null);
    }
  };

  // Handle input changes
  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
        setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    },
    [formErrors]
  );

  // Reset form and close dialog
  const handleCloseDialog = useCallback(() => {
    setFormData({ email: "", phoneNumber: "", position: "Front Desk", dateJoined: new Date().toISOString().split('T')[0] });
    setFormErrors({});
    setShowAddDialog(false);
  }, []);

  // Render loading state
  if (loading) {
  return (
      <div className="p-4 max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full max-w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
        <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-8 w-8" />
          </div>
        </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render error state
  if (error && !staff.length) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Failed to Load Staff</h3>
                <p className="text-muted-foreground text-sm">{error}</p>
              </div>
              <Button
                variant="outline"
                onClick={fetchStaff}
                className="flex items-center gap-2"
                size="sm"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Mobile-optimized Header */}
        <div className="space-y-3">
          
        <Button 
          onClick={() => setShowAddDialog(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
            size="default"
        >
          <Plus className="h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

        {/* <Separator /> */}

      {/* Staff List */}
        <Card className="border-0 sm:border shadow-sm">
          <CardHeader className="">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-16 p-0">Staff Members</CardTitle>
                <CardDescription className="text-sm">
                  {staff.length} {staff.length === 1 ? "member" : "members"}
                </CardDescription>
                    </div>
              {staff.length > 0 && (
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  {staff.length}
                </Badge>
              )}
                  </div>
          </CardHeader>
          <CardContent className="px-4">
            {staff.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  No staff members yet
                </h3>
                <p className="text-gray-600 mb-6 text-sm max-w-xs mx-auto">
                  Add your first team member to get started
                </p>
            </div>
          ) : (
            <div className="space-y-3">
              {staff.map((member) => (
                  <div
                    key={member.id}
                    className="group relative flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-all duration-200 bg-white"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        {member.profilePictureUrl && member.profilePictureUrl !== null ? (
                          <img 
                            src={member.profilePictureUrl} 
                            alt={member.fullName || 'Staff Member'}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-white" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate text-sm">
                            {member.fullName || member.staffEmail || "Staff Member"}
                          </h4>
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-0.5"
                          >
                            {member.role || "STAFF"}
                          </Badge>
                    </div>
                        
                        {/* Contact Info - Stack on mobile */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-600 truncate">
                              {member.staffEmail || "No email"}
                            </span>
                      </div>
                      <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-600">
                              {member.number || "No phone"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions - Mobile-friendly dropdown */}
                  <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            disabled={deletingId === member.id}
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="mx-4 max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-base">
                                  Remove Staff Member
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-sm">
                                  Are you sure you want to remove{" "}
                                  <span className="font-semibold text-gray-900">
                                    {member.fullName ||
                                      member.staffEmail ||
                                      member.email}
                                  </span>
                                  ? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteStaff(member)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

        {/* Add Staff Dialog - Mobile optimized */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className=" max-w-md w-[calc(100vw-2rem)] sm:mx-auto">
          <DialogHeader>
              <DialogTitle className="text-lg">Add New Staff Member</DialogTitle>
              <DialogDescription className="text-sm">
                Add a new member to your hotel team. They will receive an
                invitation to join.
            </DialogDescription>
          </DialogHeader>
            <div className="space-y-4 py-2">
            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
              <Input
                id="email"
                type="email"
                  placeholder="staff@hotel.com"
                value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`h-11 ${
                    formErrors.email ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                disabled={submitting}
                  autoComplete="email"
              />
              {formErrors.email && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.email}
                  </p>
              )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
              <Input
                id="phone"
                type="tel"
                  placeholder="+975 17 123 456"
                value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className={`h-11 ${
                    formErrors.phoneNumber
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                disabled={submitting}
                  autoComplete="tel"
              />
              {formErrors.phoneNumber && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.phoneNumber}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium">
                  Position
                </Label>
                <select
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  className="h-11 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary text-sm px-3 disabled:bg-gray-100"
                  disabled={submitting}
                >
                  {staffPositions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateJoined" className="text-sm font-medium">
                  Date Joined
                </Label>
                <Input
                  id="dateJoined"
                  type="date"
                  value={formData.dateJoined}
                  onChange={(e) => handleInputChange("dateJoined", e.target.value)}
                  className="h-11"
                  disabled={submitting}
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-2">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleCloseDialog}
                className="w-full sm:w-auto"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddStaff}
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Adding...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Staff
                  </span>
                )}
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default StaffManager;