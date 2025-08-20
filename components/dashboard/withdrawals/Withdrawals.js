"use client";
import Image from "next/image";
import React, { useState } from "react";
import Btcpayment from "./Btcpayment";
import { useUserData } from "../../../contexts/userrContext";
import axios from "axios";
import { useTheme } from "../../../contexts/themeContext";
import { Skeleton } from "../../ui/skeleton";
import { toast as t, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Withdrawals() {
  const { details, coinPrices, setNotification, setDetails } = useUserData();
  const { isDarkMode } = useTheme();
  const { email } = useUserData();

  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [btcFilled, setBtcFilled] = useState(true); // 👈 controls progress bar
  const [formData, setFormData] = useState({
    walletAddress: "",
    cryptoType: "BTC",
    amount: "",
    password: "",
    withdrawalAccount: "mainAccount",
  });

  const [formErrors, setFormErrors] = useState({});

  const validateForm = (computedTradeBonus) => {
    const errors = {};
    let isValid = true;

    if (!formData.walletAddress) {
      errors.walletAddress = "Wallet Address is required";
      isValid = false;
    }
    if (!formData.amount) {
      errors.amount = "Amount is required";
      isValid = false;
    }
    if (!formData.cryptoType) {
      errors.cryptoType = "Crypto Type is required";
      isValid = false;
    }
    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    }

    const amount = Number(formData.amount);
    if (amount > computedTradeBonus) {
      errors.amount = `Insufficient Balance, you can only withdraw $${computedTradeBonus.toLocaleString()}`;
      isValid = false;
    }
    if (amount <= 0) {
      errors.amount = "Please enter a valid amount";
      isValid = false;
    }

    setFormErrors(errors);
    if (!isValid) t.error("Please fix the form errors before submitting.");
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function loginUser(email, password) {
    try {
      const response = await axios.post("/withdrawals/verifypw/api", {
        email,
        password,
      });
      console.log("Login response:", response.data);

      if (response.data.success) {
        setFormSubmitted(true);
        return true;
      } else {
        t.error("Incorrect password. Please try again.");
        setFormErrors({ password: "Incorrect! Check password and try again" });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      t.error("An error occurred while verifying password.");
      return false;
    }
  }

  const sendWithdrawHistory = async () => {
    try {
      const response = await axios.post("/history/withdraw/api", {
        email,
        withdrawMethod: `${formData.cryptoType} - ${formData.walletAddress}`,
        amount: formData.amount,
        transactionStatus: "Pending",
        withdrawalAccount: formData.withdrawalAccount,
      });

      console.log("Withdraw response:", response.data);

      if (response.data.success) {
        setDetails((prev) => ({
          ...prev,
          withdrawalHistory: [
            ...prev.withdrawalHistory,
            {
              id: response.data.id,
              withdrawMethod: formData.cryptoType,
              withdrawalAccount: formData.withdrawalAccount,
              amount: formData.amount,
              transactionStatus: "Pending",
              dateAdded: response.data.date,
            },
          ],
        }));
        setNotification(
          `Withdrawal of $${formData.amount} under review`,
          "transaction",
          "pending"
        );
        t.success(`Withdrawal of $${formData.amount} under review`);
      } else {
        t.error(response.data.message || "Withdrawal request failed.");
      }
    } catch (error) {
      console.error("Error adding withdrawal history:", error);
      t.error("Unable to process withdrawal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 🚨 Upgrade & Verification Check
    if (!details.upgraded) {
      t.error("You need to upgrade your account before making withdrawals.");
      setLoading(false);
      return;
    }
    if (!details.isVerified) {
      t.error("Your account must be verified before making withdrawals.");
      setLoading(false);
      return;
    }

    // Check balances
    let computedTradeBonus = 0;
    if (formData.withdrawalAccount === "mainAccount") {
      computedTradeBonus = Number(details.tradingBalance);
    } else if (formData.withdrawalAccount === "profit") {
      computedTradeBonus = Number(details.planBonus);
    } else if (formData.withdrawalAccount === "totalWon") {
      computedTradeBonus = Number(details.totalWon);
    }

    if (!validateForm(computedTradeBonus)) {
      setLoading(false);
      return;
    }

    try {
      const loginSuccess = await loginUser(email, formData.password);
      if (loginSuccess) {
        setBtcFilled(false); // start progress UI first
        await sendWithdrawHistory(); // record in background
        t.info("Withdrawal initiated. Please follow on-screen steps.");
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Unexpected error in handleSubmit:", err);
      t.error("Unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const resetFormData = () => {
    setFormData({
      walletAddress: "",
      amount: "",
      password: "",
      cryptoType: "BTC",
      withdrawalAccount: "mainAccount",
    });
    setFormErrors({});
    setFormSubmitted(false);
    setBtcFilled(true);
  };

  return (
    <>
      <ToastContainer />
      {details === 0 ? (
        <div className="p-4">
          <Skeleton
            className={`h-80 ${isDarkMode ? "bg-[#333]" : "bg-gray-200/80"}`}
          />
        </div>
      ) : (
        <div>
          {/* Balance card */}
          <div
            className={`sticky rounded-lg px-2 py-4 ${
              isDarkMode ? "bg-[#111] text-white" : "bg-white border"
            } transition-all`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`rounded-full p-3 mr-2 text-[#00a055] ${
                    isDarkMode ? "bg-[#00a05520]" : "bg-[#00a05510]"
                  }`}
                >
                  <Image
                    src="/assets/bitcoin.webp"
                    alt="balance"
                    width={20}
                    height={20}
                  />
                </div>
                <div>
                  <p className="text-xs">Available Balance</p>
                  <p
                    className={`text-lg ${
                      isDarkMode ? "text-white" : "text-gray-700"
                    }`}
                  >
                    ${details?.tradingBalance?.toLocaleString()}.00
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment form */}
          <div className="bitcoin-payment my-3 rounded-xl">
            <Btcpayment
              formErrors={formErrors}
              loading={loading}
              setLoading={setLoading}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              formData={formData}
              btcFilled={btcFilled}
              setBtcFilled={setBtcFilled}
              email={email}
              formSubmitted={formSubmitted}
              resetFormData={resetFormData}
            />
          </div>
        </div>
      )}
    </>
  );
}
