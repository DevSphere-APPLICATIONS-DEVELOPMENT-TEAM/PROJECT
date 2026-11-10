const API_URL = "http://192.168.56.1:5000/api"; //replace the ip address with your local ip address

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