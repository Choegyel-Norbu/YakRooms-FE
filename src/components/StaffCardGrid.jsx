import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/services/Api';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Trash2, 
  Users,
  Shield,
  UserCheck
} from 'lucide-react';

// Individual Staff Card Component
const StaffCard = ({ staff }) => {
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      return `Joined on ${date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`;
    } catch (error) {
      return 'Date not available';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role) => {
    const roleColors = {
      'admin': 'bg-red-100 text-red-800 border-red-200',
      'manager': 'bg-blue-100 text-blue-800 border-blue-200',
      'receptionist': 'bg-green-100 text-green-800 border-green-200',
      'housekeeping': 'bg-purple-100 text-purple-800 border-purple-200',
      'maintenance': 'bg-orange-100 text-orange-800 border-orange-200',
      'security': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    if (!role) return 'bg-gray-100 text-gray-800 border-gray-200';
    return roleColors[role.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPositionIcon = (position) => {
    const positionIcons = {
      'manager': Shield,
      'admin': UserCheck,
      'receptionist': User,
      'housekeeping': User,
      'maintenance': User,
      'security': Shield,
    };
    
    if (!position) return User;
    const IconComponent = positionIcons[position.toLowerCase()] || User;
    return IconComponent;
  };

  const PositionIcon = getPositionIcon(staff.position);

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:bg-white/90"
      role="article"
      aria-label={`Staff member ${staff.fullName || '-'}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                <AvatarImage 
                  src={staff.profilePictureUrl} 
                  alt={`${staff.fullName || 'Staff member'} profile picture`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {getInitials(staff.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-lg">
                {staff.fullName || '-'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {staff.position && (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs font-medium ${getRoleColor(staff.position)}`}
                  >
                    <PositionIcon className="w-3 h-3 mr-1" />
                    {staff.position}
                  </Badge>
                )}
                {staff.role && staff.role !== staff.position && (
                  <Badge variant="outline" className="text-xs">
                    {staff.role}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2 text-gray-400" />
            <span className="truncate" title={staff.staffEmail}>
              {staff.staffEmail || 'No email provided'}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            <span>{staff.number || 'No phone provided'}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>{formatJoinDate(staff.dateJoined)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Loading Skeleton Component
const StaffCardSkeleton = () => (
  <Card className="border-0 shadow-sm bg-white/80">
    <CardHeader className="pb-3">
      <div className="flex items-start space-x-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-3">
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-2" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-2" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-2" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Empty State Component
const EmptyState = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Users className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Staff Members Found</h3>
    <p className="text-gray-500 mb-6 max-w-sm">
      There are currently no staff members assigned to this hotel. Add some team members to get started.
    </p>
  </div>
);

// Main StaffCardGrid Component
const StaffCardGrid = ({ hotelId, className = "" }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock API call - replace with your actual API implementation
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const res = await api.get(`/staff/hotel/${hotelId}`);
      setStaff(res.data);
     
    
    } catch (err) {
      setError('Failed to load staff members. Please try again.');
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId) {
      fetchStaff();
    }
  }, [hotelId]);

  if (error) {
    return (
      <div className={`rounded-lg bg-red-50 border border-red-200 p-6 text-center ${className}`}>
        <div className="text-red-600 font-medium mb-2">Error Loading Staff</div>
        <div className="text-red-500 text-sm mb-4">{error}</div>
        <Button 
          variant="outline" 
          onClick={fetchStaff}
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className='pl-4'>
          <h2 className="text-lg font-bold text-gray-900">Staff Members</h2>
          <p className="text-sm text-gray-600 mt-1">
            {loading ? 'Loading...' : `${staff.length} staff member${staff.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 8 }).map((_, index) => (
            <StaffCardSkeleton key={index} />
          ))
        ) : staff.length === 0 ? (
          // Empty state
          <EmptyState />
        ) : (
          // Staff cards
          staff.map((staffMember) => (
            <StaffCard
              key={staffMember.staffId}
              staff={staffMember}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default StaffCardGrid;