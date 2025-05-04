// OtpInput.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'react-toastify';

const OtpInput = ({ length = 6, onSubmit, isLoading }) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputsRef = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    focusInput(0);
  }, []);

  const focusInput = (index) => {
    if (inputsRef.current[index]) {
      inputsRef.current[index].focus();
    }
  };


  const handlePaste = (e, index) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('Text').replace(/\D/g, '').slice(0, length - index);

    if (pasted.length === 0) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[index + i] = pasted[i];
      if (inputsRef.current[index + i]) {
        inputsRef.current[index + i].value = pasted[i];
      }
    }
    setOtp(newOtp);
    const nextIndex = Math.min(index + pasted.length, length - 1);
    focusInput(nextIndex);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    
    if (/^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-submit when last digit is entered
      if (index === length - 1 && newOtp.every(d => d !== '')) {
        handleSubmit();
      } else if (index < length - 1) {
        focusInput(index + 1);
      }
    }
  };

  // ... (keep other functions like handlePaste and handleKeyDown the same as previous improved version)

  const handleSubmit = () => {
    const finalOtp = otp.join('');
    if (finalOtp.length === length) {
      onSubmit?.(finalOtp.toString());
      setOtp(Array(length).fill('')); // Clear inputs after submission
      focusInput(0); // Return focus to first input
    } else {
      toast.error('Please enter the complete OTP');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex gap-2">
        {Array.from({ length }).map((_, index) => (
          <Input
            key={index}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            className="w-12 h-12 text-center focus:border-secondary text-xl font-semibold"
            value={otp[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={(e) => handlePaste(e, index)}
            ref={(el) => (inputsRef.current[index] = el)}
            disabled={isLoading}
          />
        ))}
      </div>
      <Button 
        onClick={handleSubmit}
        className="w-full max-w-xs"
        disabled={isLoading}
      >
        {isLoading ? 'Verifying...' : 'Submit OTP'}
      </Button>
    </div>
  );
};

export default OtpInput;