
import { API_URL } from "../constants/api";

export type ApprovedRide = {
  _id: string;
  pickup: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  departureAt?: string | null;
  seats: number;
  cost: number;
  driverId: {
    name: string;
    profilePicture?: string | null;
  } | null;
};

export type RideRouteFilter = {
  pickup?: string;
  destination?: string;
};

export const getApprovedRides = async (
  token: string,
  filters?: RideRouteFilter
): Promise<{ rides: ApprovedRide[] }> => {
  const params = new URLSearchParams();
  const pickup = filters?.pickup?.trim();
  const destination = filters?.destination?.trim();

  if (pickup) {
    params.append("pickup", pickup);
  }
  if (destination) {
    params.append("destination", destination);
  }

  const query = params.toString();
  const response = await fetch(
    `${API_URL}/rides/approved${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load available rides.");
  }

  return data;
};

export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  matricNumber: string;
  phone: string;
}) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};

export const forgotPassword = async (email: string) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to send OTP");
  }

  return data;
};

export const verifyResetOTP = async (
  email: string,
  otp: string
) => {
  const response = await fetch(`${API_URL}/auth/verify-reset-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "OTP verification failed");
  }

  return data;
};

export const resetPassword = async (
  email: string,
  newPassword: string
) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Password reset failed");
  }

  return data;
};
