/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import { InfinitySpin } from "react-loader-spinner";
import { useTheme } from "../../../contexts/themeContext";
import { toast as t } from "react-toastify";

export default function Btcpayment({
  handleInputChange,
  formErrors,
  handleSubmit,
  formData,
  btcFilled, // true = show form, false = show progress
  setBtcFilled, // available if you need to toggle back
  loading,
}) {
  const { isDarkMode } = useTheme();

  // Progress state
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [waitingForPin, setWaitingForPin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Pins
  const [taxCodePin, setTaxCodePin] = useState("");
  const [taxCodePinError, setTaxCodePinError] = useState("");
  const [withdrawalPin, setWithdrawalPin] = useState("");
  const [withdrawalPinError, setWithdrawalPinError] = useState("");

  // Reset progress view whenever btcFilled flips to false
  useEffect(() => {
    if (!btcFilled) {
      setProgress(0);
      setProgressMessage("Initializing secure connection...");
      setWaitingForPin(false);
      setShowSuccess(false);
    }
  }, [btcFilled]);

  // Progress loop
  useEffect(() => {
    if (btcFilled) return; // only when progress view active
    if (showSuccess) return; // stop after success
    if (waitingForPin) return; // paused for pin entry

    const tick = () => {
      setProgress((prev) => {
        let next = prev + 0.5;

        // Pause at 80% for Tax Code Pin
        if (next >= 80 && !taxCodePin) {
          setWaitingForPin(true);
          return 80;
        }

        // Pause at 90% for Withdrawal Pin
        if (next >= 90 && !withdrawalPin) {
          setWaitingForPin(true);
          return 90;
        }

        if (next >= 100) {
          setShowSuccess(true);
          updateProgressMessage(100);
          return 100;
        }

        updateProgressMessage(next);
        return next;
      });
    };

    const interval = setInterval(tick, 100); // every 0.1s
    return () => clearInterval(interval);
  }, [btcFilled, waitingForPin, taxCodePin, withdrawalPin, showSuccess]);

  const updateProgressMessage = (val) => {
    if (val < 10) setProgressMessage("Initializing secure connection...");
    else if (val < 20) setProgressMessage("Verifying user credentials...");
    else if (val < 30) setProgressMessage("Fetching user wallet details...");
    else if (val < 40)
      setProgressMessage("Getting contract ID from the blockchain...");
    else if (val < 50)
      setProgressMessage("Validating transaction parameters...");
    else if (val < 60)
      setProgressMessage("Connecting to primary trading wallet...");
    else if (val < 70)
      setProgressMessage(
        "Securing transaction with multi-signature technology..."
      );
    else if (val < 80) setProgressMessage("Preparing crypto for transfer...");
    else if (val < 90)
      setProgressMessage("Getting withdrawal data from the network...");
    else if (val < 100)
      setProgressMessage("Finalizing transfer of requested funds...");
    else setProgressMessage("Transaction complete. Please check your wallet.");
  };

  // PIN handlers
  const onSubmitTaxPin = (e) => {
    e.preventDefault();
    if (taxCodePin.length < 6) {
      setTaxCodePinError("Tax Code Pin must be at least 6 characters");
      return;
    }
    setTaxCodePinError("");
    setWaitingForPin(false);
    t.success("Tax Code verified");
  };

  const onSubmitWithdrawalPin = (e) => {
    e.preventDefault();
    if (withdrawalPin.length < 4) {
      setWithdrawalPinError("Withdrawal Pin must be at least 4 digits");
      return;
    }
    setWithdrawalPinError("");
    setWaitingForPin(false);
    t.success("Withdrawal Pin verified");
  };

  // ---------- RENDER ----------
  return (
    <>
      {/* FORM VIEW */}
      {btcFilled && (
        <div
          className={`bitcoin-payment-form p-4 ${
            isDarkMode ? "text-white/80" : ""
          }`}
        >
          <form onSubmit={handleSubmit}>
            {/* Withdrawal Account */}
            <label className="font-bold text-sm py-2">
              Account to Withdraw From
            </label>
            <select
              id="withdrawalAccount"
              name="withdrawalAccount"
              value={formData.withdrawalAccount}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 h-11 mb-5 text-xs rounded-md ${
                isDarkMode ? "bg-[#111]" : "border"
              } ${formErrors?.withdrawalAccount ? "border-red-500" : ""}`}
            >
              <option value="mainAccount">Main Account</option>
              <option value="profit">Profit</option>
              <option value="totalWon">Total Won</option>
            </select>

            {/* Crypto Type */}
            <label className="font-bold text-sm py-2">Select Crypto</label>
            <select
              id="cryptoType"
              name="cryptoType"
              value={formData.cryptoType}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 h-11 mb-5 text-xs rounded-md ${
                isDarkMode ? "bg-[#111]" : "border"
              } ${formErrors?.cryptoType ? "border-red-500" : ""}`}
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="LTC">Litecoin (LTC)</option>
              <option value="XRP">Ripple (XRP)</option>
              <option value="USDT">Tether (USDT)</option>
            </select>

            {/* Wallet Address */}
            <input
              type="text"
              id="walletAddress"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleInputChange}
              placeholder="Enter Wallet Address"
              className={`w-full px-4 py-3 h-11 text-xs rounded-md ${
                isDarkMode ? "bg-[#111]" : "border"
              } ${formErrors?.walletAddress ? "border-red-500" : ""}`}
            />
            {formErrors?.walletAddress && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.walletAddress}
              </p>
            )}

            {/* Amount */}
            <label className="font-bold text-sm py-2">Enter Amount (USD)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter Amount"
              className={`w-full px-4 py-3 h-11 text-xs rounded-md ${
                isDarkMode ? "bg-[#111]" : "border"
              } ${formErrors?.amount ? "border-red-500" : ""}`}
            />
            {formErrors?.amount && (
              <p className="text-red-500 text-xs mt-1">{formErrors.amount}</p>
            )}

            {/* Password */}
            <label className="font-bold text-sm py-2">
              Password Verification
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter Password"
              className={`w-full px-4 py-3 h-11 text-xs rounded-md ${
                isDarkMode ? "bg-[#111]" : "border"
              } ${formErrors?.password ? "border-red-500" : ""}`}
            />
            {formErrors?.password && (
              <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
            )}

            {/* Submit */}
            <button
              disabled={loading}
              type="submit"
              className="w-full px-4 mt-4 text-sm rounded-lg flex items-center justify-center bg-[#00a055] text-white font-bold hover:bg-green-700 focus:outline-none"
            >
              {loading ? (
                <InfinitySpin width="80" color="#ffffff" />
              ) : (
                <div className="py-3">Withdraw</div>
              )}
            </button>
          </form>
        </div>
      )}

      {/* PROGRESS VIEW */}
      {!btcFilled && !showSuccess && (
        <div className="py-20">
          <div className="flex w-full justify-center items-center">
            <div className="w-full px-5 md:px-14">
              <div
                className={`${
                  isDarkMode ? "text-white/90" : ""
                } text-sm font-bold mb-1 flex items-center justify-between`}
              >
                <div>{progressMessage}</div>
                <div className="font-bold text-sm">{progress.toFixed()}%</div>
              </div>

              <div className="w-full">
                <div
                  className={`w-full h-2 relative overflow-hidden rounded-full ${
                    isDarkMode ? "bg-red-500/10" : "bg-red-50"
                  }`}
                >
                  <div
                    className="absolute h-full rounded-full transition-all bg-[#00a055]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tax Code Pin at 80% */}
          {progress >= 80 && waitingForPin && progress < 90 && (
            <div className="px-5 md:px-14 mt-8">
              <form onSubmit={onSubmitTaxPin}>
                <input
                  type="text"
                  id="taxCodePin"
                  name="taxCodePin"
                  placeholder="Enter Tax Code Pin"
                  value={taxCodePin}
                  onChange={(e) => setTaxCodePin(e.target.value)}
                  className={`w-full px-4 py-3 h-11 text-xs rounded-md ${
                    isDarkMode ? "bg-[#111] text-white/90" : "border"
                  } ${taxCodePinError ? "border-red-500 border" : ""}`}
                />
                {taxCodePinError && (
                  <p className="text-red-500 font-bold text-xs mt-1">
                    {taxCodePinError}
                  </p>
                )}
                <button
                  type="submit"
                  className="bg-[#00a055] mt-2 w-full flex justify-center items-center rounded-lg text-sm text-white font-bold"
                >
                  <div className="py-3">Proceed withdrawal</div>
                </button>
              </form>
            </div>
          )}

          {/* Withdrawal Pin at 90% */}
          {progress >= 90 && waitingForPin && (
            <div className="px-5 md:px-14 mt-8">
              <form onSubmit={onSubmitWithdrawalPin}>
                <input
                  type="text"
                  id="withdrawalPin"
                  name="withdrawalPin"
                  placeholder="Enter Withdrawal Pin"
                  value={withdrawalPin}
                  onChange={(e) => setWithdrawalPin(e.target.value)}
                  className={`w-full px-4 py-3 h-11 text-xs rounded-md ${
                    isDarkMode ? "bg-[#111] text-white/90" : "border"
                  } ${withdrawalPinError ? "border-red-500 border" : ""}`}
                />
                {withdrawalPinError && (
                  <p className="text-red-500 font-bold text-xs mt-1">
                    {withdrawalPinError}
                  </p>
                )}
                <button
                  type="submit"
                  className="bg-[#00a055] mt-2 w-full flex items-center justify-center rounded-lg text-sm text-white font-bold"
                >
                  <div className="py-3">Finalize withdrawal</div>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* SUCCESS VIEW */}
      {showSuccess && (
        <div
          className={`flex flex-col justify-center items-center px-5 md:px-14 mt-8 py-10 ${
            isDarkMode ? "textwhite border border-white/10" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-16 h-16 mx-auto mb-4 ${
              isDarkMode ? "text-white/50" : "text-black/40"
            }`}
          >
            <path
              fillRule="evenodd"
              d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          <h1 className="text-xl font-bold mb-2">Withdrawal Successful</h1>
          <p
            className={`mb-6 text-center text-sm px-5 md:px-20 lg:px-32 ${
              isDarkMode ? "text-white/80" : "text-muted-foreground"
            }`}
          >
            Your withdrawal is now in the confirmation phase on the network.
            Times may vary from 5 minutes to 2 hours. You can monitor the
            transaction from your history.
          </p>

          {/* ✅ Go Back Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setBtcFilled(true)} // back to withdrawal form
              className="bg-[#00a055] hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold"
            >
              Go Back to Withdrawal
            </button>

            <button
              onClick={() => (window.location.href = "/dashboard")} // back to dashboard
              className="bg-gray-600 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-bold"
            >
              Go Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
}
