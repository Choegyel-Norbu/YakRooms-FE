import React, { useEffect } from "react";
import { HiCheckCircle } from "react-icons/hi";
import { BiErrorCircle } from "react-icons/bi"; // Boxicons

const Toast = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-dismiss in 3s
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-[#adebad]"
      : type === "error"
      ? "bg-[#ff9999]"
      : "bg-gray-700";

  const icon =
    type === "success" ? (
      <HiCheckCircle className="text-green-500 w-6 h-6" />
    ) : (
      <BiErrorCircle className="text-red-500 w-6 h-6" />
    );

  return (
    <div
      className={`fixed w-full m-auto top-5 z-50 shadow-lg text-[#4d4d4d] text-14 px-6 py-3 rounded-lg transition-transform duration-300 ${bgColor}`}
    >
      <div className="flex items-center justify-between space-x-4">
        <div className="flex flex-row gap-2 items-center">
          {icon}
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
};

export default Toast;
