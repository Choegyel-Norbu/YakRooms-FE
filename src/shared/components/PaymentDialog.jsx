import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Separator } from "./separator";
import { Badge } from "./badge";
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  Users,
  Shield,
  Clock
} from "lucide-react";
import { toast } from "sonner";

const PaymentDialog = ({ isOpen, onClose, bookingData, onPaymentSuccess }) => {
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    email: ""
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `Nu ${parseFloat(amount || 0).toFixed(2)}`;
  };

  const validatePaymentForm = () => {
    const newErrors = {};

    if (paymentMethod === "card") {
      // Card number validation
      const cardNumber = paymentDetails.cardNumber.replace(/\s/g, '');
      if (!cardNumber) {
        newErrors.cardNumber = "Card number is required";
      } else if (!/^\d{16}$/.test(cardNumber)) {
        newErrors.cardNumber = "Card number must be 16 digits";
      }

      // Expiry date validation
      if (!paymentDetails.expiryDate) {
        newErrors.expiryDate = "Expiry date is required";
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentDetails.expiryDate)) {
        newErrors.expiryDate = "Please use MM/YY format";
      } else {
        const [month, year] = paymentDetails.expiryDate.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const now = new Date();
        if (expiryDate < now) {
          newErrors.expiryDate = "Card has expired";
        }
      }

      // CVV validation
      if (!paymentDetails.cvv) {
        newErrors.cvv = "CVV is required";
      } else if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
        newErrors.cvv = "CVV must be 3 or 4 digits";
      }

      // Cardholder name validation
      if (!paymentDetails.cardholderName.trim()) {
        newErrors.cardholderName = "Cardholder name is required";
      } else if (paymentDetails.cardholderName.trim().length < 2) {
        newErrors.cardholderName = "Name must be at least 2 characters";
      }
    }

    // Email validation
    if (!paymentDetails.email.trim()) {
      newErrors.email = "Email is required for receipt";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentDetails.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    // Format card number with spaces
    if (name === "cardNumber") {
      const cardNumber = value.replace(/\s/g, '');
      if (cardNumber.length <= 16) {
        formattedValue = cardNumber.replace(/(.{4})/g, '$1 ').trim();
      }
    }
    
    // Format expiry date
    if (name === "expiryDate") {
      const expiry = value.replace(/\D/g, '');
      if (expiry.length <= 4) {
        formattedValue = expiry.replace(/(\d{2})(\d{0,2})/, '$1/$2');
      }
    }
    
    // Limit CVV to 4 digits
    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setPaymentDetails(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validatePaymentForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsProcessing(true);
    
    try {
      // Check if this is a BFS-Secure payment flow
      if (bookingData?.paymentFormHtml) {
        // Handle BFS-Secure payment redirect
        handleBFSPaymentRedirect(bookingData);
        return;
      }
      
      // Fallback to mock payment processing for non-BFS payments
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success("Payment Successful!", {
        description: "Your payment has been processed successfully. Receipt sent to your email.",
        duration: 5000
      });

      // Call the success callback
      if (onPaymentSuccess) {
        onPaymentSuccess({
          ...bookingData,
          paymentStatus: 'completed',
          paymentMethod: paymentMethod,
          paymentDate: new Date().toISOString(),
          transactionId: `TXN_${Date.now()}`
        });
      }

      // Close the payment dialog
      onClose();
      
    } catch (error) {
      
      toast.error("Payment Failed", {
        description: "There was an error processing your payment. Please try again.",
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle BFS-Secure payment redirect
  const handleBFSPaymentRedirect = (bookingResponse) => {
    try {
      // Create a temporary div to parse the HTML form
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = bookingResponse.paymentFormHtml;
      
      // Find the form element
      const form = tempDiv.querySelector('form');
      if (!form) {
        throw new Error('Payment form not found in response');
      }
      
      // Create a temporary form element and append it to the body
      const paymentForm = document.createElement('form');
      paymentForm.method = form.method || 'POST';
      paymentForm.action = form.action;
      paymentForm.style.display = 'none';
      
      // Copy all form inputs
      const inputs = form.querySelectorAll('input');
      inputs.forEach(input => {
        const newInput = document.createElement('input');
        newInput.type = input.type;
        newInput.name = input.name;
        newInput.value = input.value;
        paymentForm.appendChild(newInput);
      });
      
      // Append form to body and submit
      document.body.appendChild(paymentForm);
      paymentForm.submit();
      
      // Show success message
      toast.success("Redirecting to Payment Gateway", {
        description: "You are being redirected to BFS-Secure for payment processing.",
        duration: 5000
      });
      
      // Close the payment dialog
      onClose();
      
    } catch (error) {
      
      toast.error("Payment Redirect Failed", {
        description: "There was an error redirecting to the payment gateway. Please try again.",
        duration: 6000
      });
    }
  };

  const InfoItem = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`flex items-start gap-3 py-2 ${className}`}>
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-sm text-muted-foreground break-words">{value}</div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-lg">
            <CreditCard className="h-6 w-6 text-blue-600" />
            Complete Your Payment
          </DialogTitle>
          <DialogDescription className="text-sm">
            Secure payment processing for your booking
          </DialogDescription>
        </DialogHeader>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto pt-4 space-y-6">
          {/* Booking Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="text-base font-semibold text-foreground">Booking Summary</h3>
            
            <div className="space-y-2">
              <InfoItem
                icon={MapPin}
                label="Hotel & Room"
                value={`${bookingData?.hotelName || bookingData?.room?.hotelName || 'Hotel Name'} - Room ${bookingData?.roomNumber || bookingData?.room?.roomNumber || 'N/A'}`}
              />
              
              <InfoItem
                icon={Calendar}
                label="Stay Duration"
                value={`${formatDate(bookingData?.checkInDate)} to ${formatDate(bookingData?.checkOutDate)}`}
              />
              
              <InfoItem
                icon={Users}
                label="Guests"
                value={`${bookingData?.guests || 1} ${(bookingData?.guests || 1) === 1 ? 'Guest' : 'Guests'}`}
              />
              
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-base font-semibold">Total Amount</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(bookingData?.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Form */}
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Payment Information</h3>
            
            {/* BFS-Secure Payment Notice */}
            {bookingData?.paymentFormHtml && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">BFS-Secure Payment Gateway</p>
                    <p className="text-blue-700 mt-1">
                      Your payment will be processed securely through BFS-Secure. You will be redirected to complete the payment.
                    </p>
                    {bookingData?.transactionId && (
                      <p className="text-xs text-blue-600 mt-2">
                        Transaction ID: {bookingData.transactionId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Payment Method Selection - Only show if not BFS-Secure */}
            {!bookingData?.paymentFormHtml && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Payment Method</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={paymentMethod === "card" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPaymentMethod("card")}
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Credit/Debit Card
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === "bank" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPaymentMethod("bank")}
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Bank Transfer
                  </Button>
                </div>
              </div>
            )}

            {/* Card Payment Form - Only show if not BFS-Secure */}
            {!bookingData?.paymentFormHtml && paymentMethod === "card" && (
              <>
                {/* Card Number */}
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-sm font-medium">
                    Card Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      type="text"
                      value={paymentDetails.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className={`pl-10 ${errors.cardNumber ? "border-destructive" : ""}`}
                      maxLength={19}
                    />
                  </div>
                  {errors.cardNumber && (
                    <p className="text-sm text-destructive">{errors.cardNumber}</p>
                  )}
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate" className="text-sm font-medium">
                      Expiry Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      type="text"
                      value={paymentDetails.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className={errors.expiryDate ? "border-destructive" : ""}
                      maxLength={5}
                    />
                    {errors.expiryDate && (
                      <p className="text-sm text-destructive">{errors.expiryDate}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="text-sm font-medium">
                      CVV <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cvv"
                      name="cvv"
                      type="text"
                      value={paymentDetails.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className={errors.cvv ? "border-destructive" : ""}
                      maxLength={4}
                    />
                    {errors.cvv && (
                      <p className="text-sm text-destructive">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-2">
                  <Label htmlFor="cardholderName" className="text-sm font-medium">
                    Cardholder Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cardholderName"
                    name="cardholderName"
                    type="text"
                    value={paymentDetails.cardholderName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={errors.cardholderName ? "border-destructive" : ""}
                  />
                  {errors.cardholderName && (
                    <p className="text-sm text-destructive">{errors.cardholderName}</p>
                  )}
                </div>
              </>
            )}

            {/* Bank Transfer - Only show if not BFS-Secure */}
            {!bookingData?.paymentFormHtml && paymentMethod === "bank" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">Bank Transfer Details</p>
                    <p className="text-blue-700 mt-1">
                      You will be redirected to complete the bank transfer. Your booking will be confirmed once payment is received.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Email for Receipt - Only show if not BFS-Secure */}
            {!bookingData?.paymentFormHtml && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email for Receipt <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={paymentDetails.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">
                    {bookingData?.paymentFormHtml ? "BFS-Secure Payment" : "Secure Payment"}
                  </p>
                  <p className="text-green-700 mt-1">
                    {bookingData?.paymentFormHtml 
                      ? "Your payment is processed securely through BFS-Secure, Bhutan's trusted payment gateway. All transactions are encrypted and protected."
                      : "Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data."
                    }
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button 
            type="button"
            variant="outline" 
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={handlePaymentSubmit}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                {bookingData?.paymentFormHtml 
                  ? `Pay with BFS-Secure - ${formatCurrency(bookingData?.totalPrice)}`
                  : `Pay ${formatCurrency(bookingData?.totalPrice)}`
                }
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
