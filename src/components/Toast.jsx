import React, { useEffect } from "react";
import { HiCheckCircle } from "react-icons/hi";
import { BiErrorCircle } from "react-icons/bi";
import { HiInformationCircle } from "react-icons/hi";

const Toast = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-dismiss in 3s
    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          bgColor: "bg-yellow-50 border border-yellow-200",
          textColor: "text-yellow-800",
          icon: <HiCheckCircle className="text-yellow-500 w-5 h-5" />
        };
      case "error":
        return {
          bgColor: "bg-yellow-50 border border-yellow-200",
          textColor: "text-yellow-800",
          icon: <BiErrorCircle className="text-yellow-500 w-5 h-5" />
        };
      case "warning":
        return {
          bgColor: "bg-yellow-50 border border-yellow-200",
          textColor: "text-yellow-800",
          icon: <HiInformationCircle className="text-yellow-500 w-5 h-5" />
        };
      case "info":
      default:
        return {
          bgColor: "bg-yellow-50 border border-yellow-200",
          textColor: "text-yellow-800",
          icon: <HiInformationCircle className="text-yellow-500 w-5 h-5" />
        };
    }
  };

  const { bgColor, textColor, icon } = getToastStyles();

  return (
    <div
      className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 shadow-lg px-6 py-4 rounded-lg transition-all duration-300 max-w-md w-full mx-4 ${bgColor} ${textColor}`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
