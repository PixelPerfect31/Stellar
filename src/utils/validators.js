import { StrKey } from "@stellar/stellar-sdk";

/**
 * Validates a Stellar address (Ed25519 Public Key)
 * @param {string} address - Stellar address to validate
 * @returns {boolean} True if address is valid
 */
export const isValidAddress = (address) => {
  if (!address) return false;
  try {
    return StrKey.isValidEd25519PublicKey(address.trim());
  } catch (error) {
    return false;
  }
};

/**
 * Validates transaction inputs before building transaction
 * @param {string} address - Destination public key
 * @param {string|number} amount - Amount in XLM
 * @param {number|string} balance - Available balance in XLM
 * @returns {{isValid: boolean, message: string}} Validation result
 */
export const validateTransactionInput = (address, amount, balance) => {
  if (!address || address.trim() === "") {
    return { isValid: false, message: "Recipient address cannot be empty." };
  }

  if (!isValidAddress(address)) {
    return { isValid: false, message: "Invalid Stellar address format. It must be a valid public key (starting with 'G')." };
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return { isValid: false, message: "Amount must be a positive number greater than 0." };
  }

  // Check if amount is specified up to 7 decimal places (Stellar's limit)
  const decimalMatches = String(amount).split(".")[1];
  if (decimalMatches && decimalMatches.length > 7) {
    return { isValid: false, message: "Amount cannot exceed 7 decimal places." };
  }

  const parsedBalance = parseFloat(balance || 0);
  if (parsedAmount > parsedBalance) {
    return { isValid: false, message: `Insufficient balance. You want to send ${parsedAmount} XLM but only have ${parsedBalance} XLM.` };
  }

  return { isValid: true, message: "" };
};
