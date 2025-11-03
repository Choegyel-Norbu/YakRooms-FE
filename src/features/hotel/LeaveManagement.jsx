import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  RefreshCw,
  Settings,
  FileText,
  Shield,
  MoreVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { Textarea } from "@/shared/components/textarea";
import { Badge } from "@/shared/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/tabs";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/dropdown-menu";
import { Checkbox } from "@/shared/components/checkbox";
import { toast } from "sonner";
import { useAuth } from "../authentication";
import api from "../../shared/services/Api";
import { LeaveManagementTabs } from "@/components/ui/leave-management-tabs";
import * as XLSX from "xlsx";

const LeaveManagement = ({ hotelId }) => {
  const { userId, roles } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [enhancedLeaves, setEnhancedLeaves] = useState([]);
  const [staff, setStaff] = useState([]);
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [enhancedFilterStatus, setEnhancedFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("requests");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [leaveSummary, setLeaveSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectingLeaveId, setRejectingLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [allStaff, setAllStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffLeaves, setStaffLeaves] = useState([]);
  const [staffLeavesLoading, setStaffLeavesLoading] = useState(false);
  const leaveHistoryRef = useRef(null);

  // Check if user is staff or frontdesk (can only see their own requests)
  const isStaff = roles?.includes("STAFF");
  const isFrontdesk = roles?.includes("FRONTDESK");
  const isStaffOrFrontdesk = isStaff || isFrontdesk; // Combined check for identical functionality
  const isHotelAdmin = roles?.includes("HOTEL_ADMIN");
  const canManagePolicies = !roles?.includes("STAFF") && !roles?.includes("FRONTDESK");
  const canViewPolicies = true; // All users can view policies
  const canRequestLeave = !roles?.includes("HOTEL_OWNER") && !roles?.includes("HOTEL_ADMIN"); // Only hotel owners and hotel admins cannot request leave
  const canViewBasicLeaves = !isHotelAdmin; // Hotel admins only see enhanced view
  const canEditStatus = !isStaffOrFrontdesk; // Only admins and managers can edit status

  const [leaveForm, setLeaveForm] = useState({
    staffId: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    status: "PENDING",
  });

  const [policyForm, setPolicyForm] = useState({
    leaveTypeEnum: "",
    isPaid: true,
    maxDaysPerYear: "",
    carryForward: false,
    requiresApproval: true,
    active: true,
    description: "",
  });

  const leaveTypeEnums = [
    "SICK_LEAVE",
    "ANNUAL_LEAVE", 
    "PERSONAL_LEAVE",
    "MATERNITY_LEAVE",
    "PATERNITY_LEAVE",
    "EMERGENCY_LEAVE",
    "COMPENSATORY_LEAVE",
    "STUDY_LEAVE",
    "BEREAVEMENT_LEAVE",
    "MEDICAL_LEAVE",
  ];

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
    APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  };

  const statusIcons = {
    PENDING: AlertCircle,
    APPROVED: CheckCircle,
    REJECTED: XCircle,
  };

  useEffect(() => {
    console.log("LeaveManagement useEffect - hotelId:", hotelId);
    console.log("isStaffOrFrontdesk:", isStaffOrFrontdesk);
    fetchLeaves();
    fetchStaff();
    fetchLeavePolicies();
    if (!isStaffOrFrontdesk) {
      fetchAllStaff();
    }
  }, [hotelId]);

  // Set default tab for hotel admins
  useEffect(() => {
    if (isHotelAdmin && enhancedLeaves.length > 0) {
      setActiveTab("enhanced");
    }
  }, [isHotelAdmin, enhancedLeaves.length]);

  // Set default tab for managers (hide "My Leave Requests" tab)
  useEffect(() => {
    const isManager = roles?.includes("MANAGER");
    if (isManager) {
      // Default to enhanced tab if available, otherwise staff tab
      if (enhancedLeaves.length > 0) {
        setActiveTab("enhanced");
      } else {
        setActiveTab("staff");
      }
    }
  }, [roles, enhancedLeaves.length]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      if (isStaffOrFrontdesk) {
        // Staff and Frontdesk users can only see their own leave requests
        const response = await api.get(`/leaves/user/${userId}`);
        setLeaves(response.data);
      } else if (roles?.includes("MANAGER")) {
        // Managers can see all leave requests for the hotel (including their own)
        const response = await api.get(`/leaves/hotel/${hotelId}`);
        const data = response.data || [];
        
        // Set the basic leaves data
        setLeaves(data);
        
        // Check if the response has enhanced format with employee information
        if (data.length > 0 && data[0].employeeName) {
          setEnhancedLeaves(data);
        } else {
          setEnhancedLeaves([]);
        }
      } else {
        // Hotel admins and other roles can see all leave requests for the hotel
        const response = await api.get(`/leaves/hotel/${hotelId}`);
        const data = response.data || [];
        
        // Set the basic leaves data
        setLeaves(data);
        
        // Check if the response has enhanced format with employee information
        if (data.length > 0 && data[0].employeeName) {
          setEnhancedLeaves(data);
        } else {
          setEnhancedLeaves([]);
        }
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      toast.error("Failed to fetch leave requests");
      setEnhancedLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await api.get(`/hotels/${hotelId}/staff`);
      setStaff(response.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const fetchLeavePolicies = async () => {
    try {
      const response = await api.get(`/leave-types`);
      setLeavePolicies(response.data);
    } catch (error) {
      console.error("Error fetching leave policies:", error);
      toast.error("Failed to fetch leave policies");
    }
  };

  const fetchAllStaff = async () => {
    try {
      console.log("Fetching staff for hotelId:", hotelId);
      console.log("API URL:", `/staff/hotel/${hotelId}`);
      
      // Try the API call
      const response = await api.get(`/staff/hotel/${hotelId}`);
      console.log("Staff response:", response.data);
      setAllStaff(response.data);
    } catch (error) {
      console.error("Error fetching all staff:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Full error object:", error);
      
      // Try alternative endpoint if the first one fails
      if (error.response?.status === 404) {
        console.log("Trying alternative endpoint...");
        try {
          const altResponse = await api.get(`/hotels/${hotelId}/staff`);
          console.log("Alternative staff response:", altResponse.data);
          setAllStaff(altResponse.data);
          return;
        } catch (altError) {
          console.error("Alternative endpoint also failed:", altError);
        }
      }
      
      toast.error(`Failed to fetch staff list: ${error.response?.data?.message || error.message}`);
    }
  };

  const fetchStaffLeaves = async (userId) => {
    try {
      setStaffLeavesLoading(true);
      console.log("Fetching leaves for userId:", userId);
      console.log("API URL:", `/leaves/user/${userId}`);
      const response = await api.get(`/leaves/user/${userId}`);
      console.log("Staff leaves response:", response.data);
      setStaffLeaves(response.data);
      
      // Scroll to leave history table after data is loaded
      setTimeout(() => {
        if (leaveHistoryRef.current) {
          leaveHistoryRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 200);
    } catch (error) {
      console.error("Error fetching staff leaves:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast.error(`Failed to fetch staff leave history: ${error.response?.data?.message || error.message}`);
      setStaffLeaves([]);
    } finally {
      setStaffLeavesLoading(false);
    }
  };

  const handleStaffSelect = (staff) => {
    setSelectedStaff(staff);
    fetchStaffLeaves(staff.userId || staff.staffId || staff.id);
  };

  const handleExportLeaves = async () => {
    try {
      // Show loading toast
      const loadingToast = toast.loading("Preparing Excel export...");

      // Fetch all leaves for the hotel
      const response = await api.get(`/leaves/hotel/${hotelId}`);
      const leavesData = response.data || [];
      
      if (leavesData.length === 0) {
        toast.dismiss(loadingToast);
        toast.warning("No leave data to export");
        return;
      }

      // Prepare data for Excel export
      const excelData = leavesData.map((leave) => ({
        "Employee Name": leave.employeeName || "N/A",
        "Employee Email": leave.employeeEmail || "N/A",
        "Position": leave.employeePosition || "N/A",
        "Leave Type": leave.leaveType?.name || formatLeaveTypeEnum(leave.leaveType?.leaveTypeEnum) || "N/A",
        "Start Date": leave.startDate ? new Date(leave.startDate).toLocaleDateString() : "N/A",
        "End Date": leave.endDate ? new Date(leave.endDate).toLocaleDateString() : "N/A",
        "Total Days": leave.totalDays || calculateDays(leave.startDate, leave.endDate) || "N/A",
        "Status": leave.status || "N/A",
        "Reason": leave.reason || "N/A",
        "Rejection Reason": leave.rejectionReason || "N/A",
        "Approved By": leave.approvedBy || "N/A",
        "Created At": leave.createdAt ? new Date(leave.createdAt).toLocaleDateString() : "N/A",
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths for better formatting
      const columnWidths = [
        { wch: 20 }, // Employee Name
        { wch: 25 }, // Employee Email
        { wch: 15 }, // Position
        { wch: 15 }, // Leave Type
        { wch: 12 }, // Start Date
        { wch: 12 }, // End Date
        { wch: 10 }, // Total Days
        { wch: 12 }, // Status
        { wch: 30 }, // Reason
        { wch: 30 }, // Rejection Reason
        { wch: 20 }, // Approved By
        { wch: 15 }, // Created At
      ];
      worksheet["!cols"] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Requests");

      // Generate filename with current date
      const fileName = `Hotel_Leaves_${hotelId}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Write and download file
      XLSX.writeFile(workbook, fileName);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Exported ${leavesData.length} leave requests to Excel`, {
        duration: 6000,
      });
    } catch (error) {
      console.error("Error exporting leaves:", error);
      toast.error("Failed to export leave data to Excel");
    }
  };

  const toggleLeaveSummary = async () => {
    if (showSummary) {
      // Hide the summary
      setShowSummary(false);
    } else {
      // Show the summary - fetch data if not already loaded
      if (!leaveSummary) {
        try {
          setSummaryLoading(true);
          const response = await api.get(`/leaves/summary/user/${userId}`);
          setLeaveSummary(response.data);
        } catch (error) {
          console.error("Error fetching leave summary:", error);
          toast.error("Failed to fetch leave summary");
          return;
        } finally {
          setSummaryLoading(false);
        }
      }
      setShowSummary(true);
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!leaveForm.leaveType) {
      toast.error("Please select a leave type");
      return;
    }
    
    if (!leaveForm.startDate || !leaveForm.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    
    if (new Date(leaveForm.startDate) > new Date(leaveForm.endDate)) {
      toast.error("End date must be after start date");
      return;
    }
    
    try {
      const totalDays = calculateDays(leaveForm.startDate, leaveForm.endDate);
      
      const leaveData = {
        userId: parseInt(userId, 10),
        leaveTypeId: parseInt(leaveForm.leaveType, 10),
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        totalDays: totalDays,
        reason: leaveForm.reason
      };

      console.log("Submitting leave data:", leaveData);
      console.log("API endpoint:", editingLeave ? `PUT /leaves/${editingLeave.id}` : "POST /leaves");

      if (editingLeave) {
        await api.put(`/leaves/${editingLeave.id}`, leaveData);
        toast.success("Leave request updated successfully");
      } else {
        await api.post("/leaves", leaveData);
        toast.success("Leave request submitted successfully");
      }
      
      setShowLeaveForm(false);
      setEditingLeave(null);
      setLeaveForm({
        staffId: "",
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
        status: "PENDING",
      });
      fetchLeaves();
    } catch (error) {
      console.error("Error submitting leave:", error);
      console.error("Leave data that was sent:", leaveData);
      console.error("Error response:", error.response?.data);
      toast.error(`Failed to submit leave request: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdateStatus = async (leaveId, status, rejectionReason = null) => {
    try {
      const requestBody = { status };
      if (rejectionReason) {
        requestBody.rejectionReason = rejectionReason;
      }
      await api.patch(`/leaves/${leaveId}/status`, requestBody);
      toast.success(`Leave request ${status.toLowerCase()}`);
      fetchLeaves();
    } catch (error) {
      console.error("Error updating leave status:", error);
      toast.error("Failed to update leave status");
    }
  };

  const handleRejectLeave = (leaveId) => {
    setRejectingLeaveId(leaveId);
    setRejectionReason("");
    setShowRejectionDialog(true);
  };

  const handleConfirmRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    await handleUpdateStatus(rejectingLeaveId, "REJECTED", rejectionReason.trim());
    setShowRejectionDialog(false);
    setRejectingLeaveId(null);
    setRejectionReason("");
  };

  const handleDeleteLeave = async (leaveId) => {
    try {
      await api.delete(`/leaves/${leaveId}`);
      toast.success("Leave request deleted");
      fetchLeaves();
    } catch (error) {
      console.error("Error deleting leave:", error);
      toast.error("Failed to delete leave request");
    }
  };

  const handleEditLeave = (leave) => {
    setEditingLeave(leave);
    setLeaveForm({
      staffId: "",
      leaveType: leave.leaveTypeId?.toString() || leave.leaveType?.toString() || "",
      startDate: leave.startDate.split('T')[0],
      endDate: leave.endDate.split('T')[0],
      reason: leave.reason,
      status: leave.status,
    });
    setShowLeaveForm(true);
  };

  const handleSubmitPolicy = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!policyForm.leaveTypeEnum) {
      toast.error("Please select a leave type");
      return;
    }
    
    if (!policyForm.maxDaysPerYear || policyForm.maxDaysPerYear === "") {
      toast.error("Please enter maximum days per year");
      return;
    }
    
    const maxDays = parseInt(policyForm.maxDaysPerYear, 10);
    if (isNaN(maxDays) || maxDays <= 0) {
      toast.error("Please enter a valid number for maximum days per year");
      return;
    }
    
    try {
      // Convert maxDaysPerYear to number for API
      const policyData = {
        ...policyForm,
        maxDaysPerYear: maxDays
      };

      console.log("Submitting policy data:", policyData);
      console.log("API endpoint:", editingPolicy ? `PUT /leave-types/${editingPolicy.id}` : "POST /leave-types");

      if (editingPolicy) {
        await api.put(`/leave-types/${editingPolicy.id}`, policyData);
        toast.success("Leave policy updated successfully");
      } else {
        await api.post("/leave-types", policyData);
        toast.success("Leave policy created successfully");
      }
      
      setShowPolicyForm(false);
      setEditingPolicy(null);
      setPolicyForm({
        leaveTypeEnum: "",
        isPaid: true,
        maxDaysPerYear: "",
        carryForward: false,
        requiresApproval: true,
        active: true,
        description: "",
      });
      fetchLeavePolicies();
    } catch (error) {
      console.error("Error submitting policy:", error);
      console.error("Policy data that was sent:", policyData);
      console.error("Error response:", error.response?.data);
      toast.error(`Failed to submit leave policy: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeletePolicy = async (policyId) => {
    try {
      await api.delete(`/leave-types/${policyId}`);
      toast.success("Leave policy deleted");
      fetchLeavePolicies();
    } catch (error) {
      console.error("Error deleting policy:", error);
      toast.error("Failed to delete leave policy");
    }
  };

  const handleEditPolicy = (policy) => {
    setEditingPolicy(policy);
    setPolicyForm({
      leaveTypeEnum: policy.leaveTypeEnum,
      isPaid: policy.isPaid,
      maxDaysPerYear: policy.maxDaysPerYear.toString(),
      carryForward: policy.carryForward,
      requiresApproval: policy.requiresApproval,
      active: policy.active,
      description: policy.description || "",
    });
    setShowPolicyForm(true);
  };

  const filteredLeaves = leaves.filter((leave) => {
    const statusMatch = filterStatus === "all" || leave.status === filterStatus;
    return statusMatch;
  });

  const filteredEnhancedLeaves = enhancedLeaves.filter((leave) => {
    const statusMatch = enhancedFilterStatus === "all" || leave.status === enhancedFilterStatus;
    return statusMatch;
  });

  const getStaffName = (staffId) => {
    const staffMember = staff.find((s) => s.id === staffId || s.id === parseInt(staffId, 10));
    return staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : "Unknown Staff";
  };

  const getLeaveTypeName = (leaveTypeId) => {
    const policy = leavePolicies.find((p) => p.id === leaveTypeId || p.id === parseInt(leaveTypeId, 10));
    return policy ? formatLeaveTypeEnum(policy.leaveTypeEnum) : "Unknown Type";
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatLeaveTypeEnum = (enumValue) => {
    const enumMap = {
      "SICK_LEAVE": "Sick Leave",
      "ANNUAL_LEAVE": "Annual Leave",
      "PERSONAL_LEAVE": "Personal Leave",
      "MATERNITY_LEAVE": "Maternity Leave",
      "PATERNITY_LEAVE": "Paternity Leave",
      "EMERGENCY_LEAVE": "Emergency Leave",
      "COMPENSATORY_LEAVE": "Compensatory Leave",
      "STUDY_LEAVE": "Study Leave",
      "BEREAVEMENT_LEAVE": "Bereavement Leave",
      "MEDICAL_LEAVE": "Medical Leave",
    };
    return enumMap[enumValue] || enumValue;
  };

  const getPolicyStatusColor = (active) => {
    return active 
      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading leave requests...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* <div>
          <p className="text-muted-foreground text-sm">
            {isStaffOrFrontdesk 
              ? "Request leave and view your leave history"
              : roles?.includes("MANAGER")
                ? "Request leave, view your leave history, and manage staff leave requests"
                : canRequestLeave
                  ? "Manage staff leave requests and configure leave policies"
                  : "Manage staff leave requests and configure leave policies (Leave requests disabled for admin roles)"
            }
          </p>
        </div> */}
        <div className="flex gap-2">
          {canRequestLeave && (
            <Button
              variant="outline"
              onClick={() => setShowLeaveForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Request Leave
            </Button>
          )}
          {canManagePolicies && (
            <Button
              variant="outline"
              onClick={() => setShowPolicyForm(true)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Add Policy
            </Button>
          )}
        </div>
      </div>

      {/* Tabs with Enhanced Styling */}
      <LeaveManagementTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        canViewBasicLeaves={canViewBasicLeaves}
        canViewPolicies={canViewPolicies}
        isStaffOrFrontdesk={isStaffOrFrontdesk}
        enhancedLeaves={enhancedLeaves}
        roles={roles}
      />

        {/* Leave Requests Tab */}
        {canViewBasicLeaves && !roles?.includes("MANAGER") && activeTab === "requests" && (
          <div className="space-y-4">
          
          {/* Leave Requests - Desktop Table View */}
          <Card className="hidden md:block">
            <CardHeader>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeaves.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-muted-foreground">No leave requests found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLeaves.map((leave) => {
                        const StatusIcon = statusIcons[leave.status];
                        return (
                          <TableRow key={leave.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {getLeaveTypeName(leave.leaveTypeId || leave.leaveType)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(leave.startDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(leave.endDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {calculateDays(leave.startDate, leave.endDate)} days
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[leave.status]}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {leave.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {leave.reason}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {/* For hotel data: Approve/Reject buttons */}
                                {!isStaffOrFrontdesk && leave.status === "PENDING" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateStatus(leave.id, "APPROVED")}
                                      className="h-8 px-3 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateStatus(leave.id, "REJECTED")}
                                      className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                
                                {/* For staff data: Three-dots menu for edit/delete actions */}
                                {isStaffOrFrontdesk && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="none"
                                        className="h-8 w-8 p-0"
                                        title="More actions"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={() => handleEditLeave(leave)}
                                        disabled={leave.status !== "PENDING"}
                                        className={leave.status !== "PENDING" ? "opacity-50 cursor-not-allowed" : ""}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Request
                                        {leave.status !== "PENDING" && (
                                          <span className="ml-auto text-xs text-muted-foreground">
                                            (Only pending requests can be edited)
                                          </span>
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => setDeleteConfirmId(leave.id)}
                                        disabled={leave.status !== "PENDING"}
                                        className={`text-red-600 focus:text-red-600 ${leave.status !== "PENDING" ? "opacity-50 cursor-not-allowed" : ""}`}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Request
                                        {leave.status !== "PENDING" && (
                                          <span className="ml-auto text-xs text-muted-foreground">
                                            (Only pending requests can be deleted)
                                          </span>
                                        )}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Leave Requests - Mobile Card View */}
          <div className="md:hidden space-y-4">
            
            {filteredLeaves.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No leave requests found</p>
                </CardContent>
              </Card>
            ) : (
              filteredLeaves.map((leave) => {
                const StatusIcon = statusIcons[leave.status];
                return (
                  <Card key={leave.id} className="p-4">
                    <div className="space-y-3">
                      {/* Header with Leave Type and Status */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-muted-foreground">Leave Type</h4>
                          <p className="font-semibold">
                            {getLeaveTypeName(leave.leaveTypeId || leave.leaveType)}
                          </p>
                        </div>
                        <Badge className={statusColors[leave.status]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {leave.status}
                        </Badge>
                      </div>

                      {/* Dates and Duration */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Start Date</h4>
                          <p className="text-sm">{new Date(leave.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">End Date</h4>
                          <p className="text-sm">{new Date(leave.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Duration */}
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Duration</h4>
                        <Badge variant="outline" className="mt-1">
                          {calculateDays(leave.startDate, leave.endDate)} days
                        </Badge>
                      </div>

                      {/* Reason */}
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Reason</h4>
                        <p className="text-sm mt-1">{leave.reason}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        {/* For hotel data: Approve/Reject buttons */}
                        {!isStaffOrFrontdesk && leave.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(leave.id, "APPROVED")}
                              className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(leave.id, "REJECTED")}
                              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {/* For staff data: Edit/Delete actions */}
                        {isStaffOrFrontdesk && (
                          <div className="flex gap-2 w-full">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditLeave(leave)}
                              disabled={leave.status !== "PENDING"}
                              className={`flex-1 ${leave.status !== "PENDING" ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteConfirmId(leave.id)}
                              disabled={leave.status !== "PENDING"}
                              className={`flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 ${leave.status !== "PENDING" ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        )}

                        {/* Disabled state message for non-pending requests */}
                        {isStaffOrFrontdesk && leave.status !== "PENDING" && (
                          <div className="w-full text-center">
                            <p className="text-xs text-muted-foreground">
                              {leave.status === "APPROVED" ? "Request approved - cannot be modified" : "Request rejected - cannot be modified"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
        )}

        {/* Enhanced Leave Requests Tab */}
        {!isStaffOrFrontdesk && enhancedLeaves.length > 0 && activeTab === "enhanced" && (
          <div className="space-y-4">
          {/* Export Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleExportLeaves}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export to excel
            </Button>
          </div>

          {/* Enhanced Leave Requests - Desktop Table View */}
          <Card className="hidden md:block">
            <CardHeader>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnhancedLeaves.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-muted-foreground">No enhanced leave requests found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEnhancedLeaves.map((leave) => {
                        const StatusIcon = statusIcons[leave.status];
                        return (
                          <TableRow key={leave.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span className="font-semibold">{leave.employeeName}</span>
                                <span className="text-sm text-muted-foreground">{leave.employeeEmail}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {leave.employeePosition}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                  <span>{leave.leaveType.name || formatLeaveTypeEnum(leave.leaveType.leaveTypeEnum)}</span>
                                  <div className="flex gap-1 text-xs text-muted-foreground">
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(leave.startDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(leave.endDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {leave.totalDays} days
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge className={statusColors[leave.status]}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {leave.status}
                                </Badge>
                                {leave.status === "REJECTED" && leave.rejectionReason && (
                                  <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                    Reason: {leave.rejectionReason}
                                  </span>
                                )}
                                {leave.status === "APPROVED" && leave.approvedBy && (
                                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                    Approved by: {leave.approvedBy}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {leave.reason}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col text-sm">
                                <span className="font-medium">{leave.contactNumber || leave.employeePhoneNumber || "N/A"}</span>
                                {leave.emergencyContact && (
                                  <span className="text-muted-foreground">Emergency: {leave.emergencyContact}</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {/* Emergency indicator */}
                                {leave.isEmergency && (
                                  <Badge variant="destructive" className="text-xs">
                                    Emergency
                                  </Badge>
                                )}
                                
                                {/* Actions dropdown menu */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="none"
                                      className="h-8 w-8 p-0"
                                      title="More actions"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {leave.status === "PENDING" && (
                                      <>
                                        <DropdownMenuItem 
                                          onClick={() => handleUpdateStatus(leave.id, "APPROVED")}
                                          className="text-green-600 focus:text-green-600"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleRejectLeave(leave.id)}
                                          className="text-red-600 focus:text-red-600"
                                        >
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Reject
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {leave.status !== "PENDING" && (
                                      <DropdownMenuItem disabled>
                                        <span className="text-muted-foreground">
                                          {leave.status === "APPROVED" ? "Already Approved" : "Already Rejected"}
                                        </span>
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Leave Requests - Mobile Card View */}
          <div className="md:hidden space-y-4">
            
            {filteredEnhancedLeaves.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No enhanced leave requests found</p>
                </CardContent>
              </Card>
            ) : (
              filteredEnhancedLeaves.map((leave) => {
                const StatusIcon = statusIcons[leave.status];
                return (
                  <Card key={leave.id} className="p-4">
                    <div className="space-y-3">
                      {/* Header with Employee Info and Status */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base">{leave.employeeName}</h4>
                          <p className="text-sm text-muted-foreground">{leave.employeeEmail}</p>
                          <Badge variant="outline" className="mt-1">
                            {leave.employeePosition}
                          </Badge>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={statusColors[leave.status]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {leave.status}
                          </Badge>
                          {leave.isEmergency && (
                            <Badge variant="destructive" className="text-xs">
                              Emergency
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Leave Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Leave Type</h4>
                          <p className="text-sm font-medium">
                            {leave.leaveType.name || formatLeaveTypeEnum(leave.leaveType.leaveTypeEnum)}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Duration</h4>
                          <Badge variant="outline" className="mt-1">
                            {leave.totalDays} days
                          </Badge>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Start Date</h4>
                          <p className="text-sm">{new Date(leave.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">End Date</h4>
                          <p className="text-sm">{new Date(leave.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Reason */}
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Reason</h4>
                        <p className="text-sm mt-1">{leave.reason}</p>
                      </div>

                      {/* Contact Info */}
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Contact</h4>
                        <div className="text-sm mt-1">
                          <p className="font-medium">{leave.contactNumber || leave.employeePhoneNumber || "N/A"}</p>
                          {leave.emergencyContact && (
                            <p className="text-muted-foreground">Emergency: {leave.emergencyContact}</p>
                          )}
                        </div>
                      </div>

                      {/* Status Details */}
                      {leave.status === "REJECTED" && leave.rejectionReason && (
                        <div className="p-2 bg-red-50 rounded">
                          <h4 className="font-medium text-sm text-red-600">Rejection Reason</h4>
                          <p className="text-sm text-red-600">{leave.rejectionReason}</p>
                        </div>
                      )}
                      {leave.status === "APPROVED" && leave.approvedBy && (
                        <div className="p-2 bg-green-50 rounded">
                          <h4 className="font-medium text-sm text-green-600">Approved By</h4>
                          <p className="text-sm text-green-600">{leave.approvedBy}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        {leave.status === "PENDING" ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(leave.id, "APPROVED")}
                              className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectLeave(leave.id)}
                              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        ) : (
                          <div className="w-full text-center">
                            <p className="text-sm text-muted-foreground">
                              {leave.status === "APPROVED" ? "Request already approved" : "Request already rejected"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
        )}

        {/* Staff Leave Overview Tab */}
        {!isStaffOrFrontdesk && activeTab === "staff" && (
          <div className="space-y-6">
            {/* Staff List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Employee Leave Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allStaff.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No staff members found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allStaff.map((staffMember) => (
                      <Card 
                        key={staffMember.staffId || staffMember.id} 
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedStaff?.staffId === staffMember.staffId || selectedStaff?.id === staffMember.id
                            ? 'ring-1 ring-primary bg-primary/1' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleStaffSelect(staffMember)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Header with Profile Picture and Basic Info */}
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                                {staffMember.profilePictureUrl ? (
                                  <img 
                                    src={staffMember.profilePictureUrl} 
                                    alt={staffMember.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="h-6 w-6 text-primary" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">
                                  {staffMember.fullName || `${staffMember.firstName || ''} ${staffMember.lastName || ''}`.trim()}
                                </h4>
                                <p className="text-xs text-muted-foreground truncate">
                                  {staffMember.position || 'Staff Member'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {staffMember.staffEmail || staffMember.email}
                                </p>
                              </div>
                            </div>

                            {/* Additional Details */}
                            <div className="space-y-2">
                              {/* Contact Number */}
                              {staffMember.number && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Phone:</span>
                                  <span className="text-xs font-medium">{staffMember.number}</span>
                                </div>
                              )}

                              {/* Role */}
                              {staffMember.role && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Role:</span>
                                  <div className="flex gap-1">
                                    {staffMember.role.split(',').map((role, index) => {
                                      const trimmedRole = role.trim();
                                      // Filter out GUEST role
                                      if (trimmedRole === 'GUEST') return null;
                                      return (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {trimmedRole}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Staff Leave History */}
            {selectedStaff && (
              <Card ref={leaveHistoryRef}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      Leave History - {selectedStaff.fullName || `${selectedStaff.firstName || ''} ${selectedStaff.lastName || ''}`.trim()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStaff(null);
                        setStaffLeaves([]);
                      }}
                    >
                      Close
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {staffLeavesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading leave history...</span>
                    </div>
                  ) : staffLeaves.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No leave requests found for this staff member</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Leave Balance Summary */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="text-left p-3 font-medium">Leave Type</th>
                                <th className="text-right p-3 font-medium">Total Allowed</th>
                                <th className="text-right p-3 font-medium">Used</th>
                                <th className="text-right p-3 font-medium">Remaining</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const leaveTypeData = Object.entries(
                                  staffLeaves.reduce((acc, leave) => {
                                    const leaveTypeName = leave.leaveTypeName || getLeaveTypeName(leave.leaveTypeId || leave.leaveType);
                                    if (!acc[leaveTypeName]) {
                                      acc[leaveTypeName] = {
                                        totalAllowed: 0,
                                        used: 0,
                                        leaveTypeCode: leave.leaveTypeCode
                                      };
                                    }
                                    return acc;
                                  }, {})
                                );

                                // Calculate totals
                                let totalAllowedSum = 0;
                                let totalUsedSum = 0;
                                let totalRemainingSum = 0;

                                const leaveRows = leaveTypeData.map(([leaveTypeName, data]) => {
                                  // Find the leave policy for this type
                                  const leavePolicy = leavePolicies.find(p => 
                                    p.leaveTypeEnum === data.leaveTypeCode || 
                                    formatLeaveTypeEnum(p.leaveTypeEnum) === leaveTypeName
                                  );
                                  
                                  const totalAllowed = leavePolicy?.maxDaysPerYear || 12;
                                  const used = staffLeaves
                                    .filter(l => (l.leaveTypeName || getLeaveTypeName(l.leaveTypeId || l.leaveType)) === leaveTypeName && l.status === 'APPROVED')
                                    .reduce((sum, l) => sum + (l.totalDays || calculateDays(l.startDate, l.endDate)), 0);
                                  const remaining = Math.max(0, totalAllowed - used);

                                  // Add to totals
                                  totalAllowedSum += totalAllowed;
                                  totalUsedSum += used;
                                  totalRemainingSum += remaining;
                                  
                                  return (
                                    <tr key={leaveTypeName} className="border-t">
                                      <td className="p-3">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm">{leaveTypeName}</span>
                                        </div>
                                      </td>
                                      <td className="p-3 text-right text-sm">{totalAllowed}</td>
                                      <td className="p-3 text-right text-sm">{used}</td>
                                      <td className="p-3 text-right">
                                        <span className={`text-sm ${remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {remaining}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                });

                                // Add total row
                                const totalRow = (
                                  <tr key="total" className="border-t-1 border-primary bg-primary/5">
                                    <td className="p-3">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-primary">Total Leaves</span>
                                      </div>
                                    </td>
                                    <td className="p-3 text-right font-bold text-primary">{totalAllowedSum}</td>
                                    <td className="p-3 text-right font-bold text-primary">{totalUsedSum}</td>
                                    <td className="p-3 text-right">
                                      <span className={`font-bold ${totalRemainingSum > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {totalRemainingSum}
                                      </span>
                                    </td>
                                  </tr>
                                );

                                return [...leaveRows, totalRow];
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Leave Policies Tab */}
        {canViewPolicies && activeTab === "policies" && (
          <div className="space-y-4">
          {/* Leave Policies - Desktop Table View */}
          <Card className="hidden md:block">
            <CardHeader>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Max Days/Year</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Carry Forward</TableHead>
                      <TableHead>Requires Approval</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leavePolicies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-muted-foreground">No leave policies configured</p>
                            {canManagePolicies && (
                              <Button
                                variant="outline"
                                onClick={() => setShowPolicyForm(true)}
                                className="mt-2"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add First Policy
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      leavePolicies.map((policy) => (
                        <TableRow key={policy.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              {formatLeaveTypeEnum(policy.leaveTypeEnum)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {policy.maxDaysPerYear} days
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={policy.isPaid ? "default" : "secondary"}>
                              {policy.isPaid ? "Paid" : "Unpaid"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={policy.carryForward ? "default" : "secondary"}>
                              {policy.carryForward ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={policy.requiresApproval ? "default" : "secondary"}>
                              {policy.requiresApproval ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPolicyStatusColor(policy.active)}>
                              {policy.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {policy.description || "No description"}
                          </TableCell>
                          <TableCell>
                            {canManagePolicies ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditPolicy(policy)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Leave Policy</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this leave policy? This action cannot be undone and may affect existing leave requests.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeletePolicy(policy.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">View Only</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Leave Policies - Mobile Card View */}
          <div className="md:hidden space-y-4">
            {leavePolicies.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">No leave policies configured</p>
                  {canManagePolicies && (
                    <Button
                      variant="outline"
                      onClick={() => setShowPolicyForm(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Policy
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              leavePolicies.map((policy) => (
                <Card key={policy.id} className="p-4">
                  <div className="space-y-3">
                    {/* Header with Leave Type and Status */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {formatLeaveTypeEnum(policy.leaveTypeEnum)}
                        </h4>
                      </div>
                      <Badge className={getPolicyStatusColor(policy.active)}>
                        {policy.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    {/* Policy Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Max Days/Year</h4>
                        <Badge variant="outline" className="mt-1">
                          {policy.maxDaysPerYear} days
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Payment</h4>
                        <Badge variant={policy.isPaid ? "default" : "secondary"} className="mt-1">
                          {policy.isPaid ? "Paid" : "Unpaid"}
                        </Badge>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Carry Forward</h4>
                        <Badge variant={policy.carryForward ? "default" : "secondary"} className="mt-1">
                          {policy.carryForward ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Requires Approval</h4>
                        <Badge variant={policy.requiresApproval ? "default" : "secondary"} className="mt-1">
                          {policy.requiresApproval ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    {policy.description && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Description</h4>
                        <p className="text-sm mt-1">{policy.description}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      {canManagePolicies ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPolicy(policy)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Leave Policy</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this leave policy? This action cannot be undone and may affect existing leave requests.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePolicy(policy.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      ) : (
                        <div className="w-full text-center">
                          <p className="text-sm text-muted-foreground">View Only</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
        )}

      {/* Leave Summary Section - Hidden for Hotel Admin and Hotel Owner */}
      {!isHotelAdmin && !roles?.includes("HOTEL_OWNER") && (
        <Card>
          <CardContent className="space-y-6">
            <Button
              variant="outline"
              onClick={toggleLeaveSummary}
              disabled={summaryLoading}
              className="flex items-center gap-2"
            >
              {summaryLoading ? (
                <>
                  Loading Summary...
                  <RefreshCw className="h-4 w-4 animate-spin" />
                </>
              ) : showSummary ? (
                <>
                  Hide Leave Summary
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  My Leave Summary
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>

            {/* Display Leave Summary Data */}
            {showSummary && leaveSummary && (
            <div className="space-y-6">

              {/* Total Summary */}
              <div className="">
                <h3 className="font-semibold text-lg mb-3">Total Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">
                      {leaveSummary.totalDaysTaken}
                    </p>
                    <p className="text-sm text-muted-foreground">Days Taken</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">
                      {leaveSummary.totalDaysRemaining}
                    </p>
                    <p className="text-sm text-muted-foreground">Days Remaining</p>
                  </div>
                </div>
              </div>

              {/* Leave Type Details */}
              <div className="">
                <h3 className="font-semibold text-lg mb-4">Leave Type Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {leaveSummary.leaveTypeDetails.map((leaveType, index) => (
                    <div key={leaveType.leaveTypeId} className="border rounded-lg p-6">
                      {/* Header with icon and title */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{leaveType.leaveTypeName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {leaveType.leaveTypeCode} • Max: {leaveType.maxDaysPerYear} days/year
                          </p>
                        </div>
                      </div>

                      {/* Status badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant={leaveType.isPaid ? "default" : "secondary"} className="text-xs">
                          {leaveType.isPaid ? "Paid" : "Unpaid"}
                        </Badge>
                        {leaveType.carryForward && (
                          <Badge variant="outline" className="text-xs">Carry Forward</Badge>
                        )}
                        {leaveType.requiresApproval && (
                          <Badge variant="outline" className="text-xs">Requires Approval</Badge>
                        )}
                      </div>
                      
                      {/* Main metrics grid */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 border rounded-lg">
                          <p className="text-2xl font-bold">
                            {leaveType.daysTaken}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">Days Taken</p>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <p className="text-2xl font-bold">
                            {leaveType.daysRemaining}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">Days Remaining</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Leave Request Form Dialog */}
      <Dialog open={showLeaveForm} onOpenChange={setShowLeaveForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLeave ? "Edit Leave Request" : "Request Leave"}
            </DialogTitle>
            <DialogDescription>
              {editingLeave 
                ? "Update the leave request details below."
                : "Fill in the details to submit a new leave request."
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitLeave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="leaveType">Leave Type</Label>
              <Select
                value={leaveForm.leaveType}
                onValueChange={(value) =>
                  setLeaveForm({ ...leaveForm, leaveType: value })
                }
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leavePolicies.filter(policy => policy.active).map((policy) => (
                    <SelectItem key={policy.id} value={policy.id.toString()}>
                      {formatLeaveTypeEnum(policy.leaveTypeEnum)} ({policy.maxDaysPerYear} days)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, endDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={leaveForm.reason}
                onChange={(e) =>
                  setLeaveForm({ ...leaveForm, reason: e.target.value })
                }
                placeholder="Enter reason for leave..."
                required
              />
            </div>

            {editingLeave && canEditStatus && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={leaveForm.status}
                  onValueChange={(value) =>
                    setLeaveForm({ ...leaveForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowLeaveForm(false);
                  setEditingLeave(null);
                  setLeaveForm({
                    staffId: "",
                    leaveType: "",
                    startDate: "",
                    endDate: "",
                    reason: "",
                    status: "PENDING",
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingLeave ? "Update Request" : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Leave Policy Form Dialog */}
      <Dialog open={showPolicyForm} onOpenChange={setShowPolicyForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? "Edit Leave Policy" : "Add Leave Policy"}
            </DialogTitle>
            <DialogDescription>
              {editingPolicy 
                ? "Update the leave policy details below."
                : "Configure a new leave policy for your hotel."
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPolicy} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="leaveTypeEnum">Leave Type</Label>
              <Select
                value={policyForm.leaveTypeEnum}
                onValueChange={(value) =>
                  setPolicyForm({ ...policyForm, leaveTypeEnum: value })
                }
                required
                disabled={editingPolicy} // Prevent changing leave type when editing
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypeEnums.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatLeaveTypeEnum(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDaysPerYear">Maximum Days Per Year</Label>
              <Input
                id="maxDaysPerYear"
                type="number"
                min="1"
                max="365"
                value={policyForm.maxDaysPerYear}
                onChange={(e) =>
                  setPolicyForm({ ...policyForm, maxDaysPerYear: e.target.value })
                }
                placeholder="e.g., 12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={policyForm.description}
                onChange={(e) =>
                  setPolicyForm({ ...policyForm, description: e.target.value })
                }
                placeholder="Enter policy description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPaid"
                  checked={policyForm.isPaid}
                  onCheckedChange={(checked) =>
                    setPolicyForm({ ...policyForm, isPaid: checked })
                  }
                />
                <Label htmlFor="isPaid">Paid Leave</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="carryForward"
                  checked={policyForm.carryForward}
                  onCheckedChange={(checked) =>
                    setPolicyForm({ ...policyForm, carryForward: checked })
                  }
                />
                <Label htmlFor="carryForward">Carry Forward</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresApproval"
                  checked={policyForm.requiresApproval}
                  onCheckedChange={(checked) =>
                    setPolicyForm({ ...policyForm, requiresApproval: checked })
                  }
                />
                <Label htmlFor="requiresApproval">Requires Approval</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={policyForm.active}
                  onCheckedChange={(checked) =>
                    setPolicyForm({ ...policyForm, active: checked })
                  }
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPolicyForm(false);
                  setEditingPolicy(null);
                  setPolicyForm({
                    leaveTypeEnum: "",
                    isPaid: true,
                    maxDaysPerYear: "",
                    carryForward: false,
                    requiresApproval: true,
                    active: true,
                    description: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingPolicy ? "Update Policy" : "Create Policy"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Leave Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this leave request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmId) {
                  handleDeleteLeave(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rejection Reason Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this leave request. This reason will be visible to the employee.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={4}
                required
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowRejectionDialog(false);
                setRejectingLeaveId(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmRejection}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default LeaveManagement;
