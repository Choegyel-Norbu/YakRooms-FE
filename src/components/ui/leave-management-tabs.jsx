import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Users, 
  Settings,
  Clock
} from "lucide-react";

function LeaveManagementTabs({ 
  activeTab,
  setActiveTab,
  canViewBasicLeaves,
  canViewPolicies,
  isStaffOrFrontdesk,
  enhancedLeaves,
  roles
}) {
  const isManager = roles?.includes("MANAGER");
  // Hide "My Leave Requests" tab for managers
  const showBasicLeavesTab = canViewBasicLeaves && !isManager;
  
  return (
    <div className="mb-6">
      <ScrollArea>
        <div className="flex h-auto -space-x-px bg-background p-0 shadow-sm shadow-black/5 rtl:space-x-reverse rounded-lg">
          {showBasicLeavesTab && (
            <button
              onClick={() => setActiveTab("requests")}
              className={`cursor-pointer relative overflow-hidden rounded-none border border-border py-3 px-4 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e transition-colors ${
                activeTab === "requests"
                  ? "bg-muted after:bg-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar
                  className="opacity-60"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium whitespace-nowrap">
                  {isStaffOrFrontdesk ? "My Leave Requests" : "Leave Requests"}
                </span>
              </div>
            </button>
          )}
          {!isStaffOrFrontdesk && enhancedLeaves.length > 0 && (
            <button
              onClick={() => setActiveTab("enhanced")}
              className={`cursor-pointer relative overflow-hidden rounded-none border border-border py-3 px-4 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e transition-colors ${
                activeTab === "enhanced"
                  ? "bg-muted after:bg-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock
                  className="opacity-60"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium whitespace-nowrap">
                  Employee leave requests
                </span>
              </div>
            </button>
          )}
          {!isStaffOrFrontdesk && (
            <button
              onClick={() => setActiveTab("staff")}
              className={`cursor-pointer relative overflow-hidden rounded-none border border-border py-3 px-4 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e transition-colors ${
                activeTab === "staff"
                  ? "bg-muted after:bg-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Users
                  className="opacity-60"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium whitespace-nowrap">
                Employee Leave Overview
                </span>
              </div>
            </button>
          )}
          {canViewPolicies && (
            <button
              onClick={() => setActiveTab("policies")}
              className={`cursor-pointer relative overflow-hidden rounded-none border border-border py-3 px-4 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e transition-colors ${
                activeTab === "policies"
                  ? "bg-muted after:bg-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings
                  className="opacity-60"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium whitespace-nowrap">
                 Hotel Leave Policies
                </span>
              </div>
            </button>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

export { LeaveManagementTabs };
