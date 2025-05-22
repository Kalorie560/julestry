import matplotlib.pyplot as plt
import numpy as np

def calculate_amplitude_response(m: float, k: float, c: float, omega):
  """
  Calculates the amplitude response magnification (Xk/F0) for an MCK system.

  Args:
    m: Mass (float).
    k: Stiffness (float).
    c: Damping coefficient (float).
    omega: Excitation frequency (float or numpy array).

  Returns:
    The amplitude response magnification (Xk/F0) (float or numpy array).
  """
  term1 = 1 - (omega**2 * m / k)
  term2 = c * omega / k
  
  # Using np.square for element-wise squaring if omega is an array
  # and np.sqrt for square root.
  magnification = 1 / np.sqrt(np.square(term1) + np.square(term2))
  return magnification

def generate_response_data():
  """
  Generates frequency response data for an example MCK system.

  Defines example m, k, c values, creates a frequency range,
  and calculates the amplitude response.

  Returns:
    omega_range: Numpy array of frequencies.
    amplitude_response: Numpy array of corresponding amplitude responses.
  """
  m = 1.0  # kg
  k = 100.0  # N/m
  c = 1.0  # Ns/m
  omega_range = np.linspace(0.1, 20, 500)  # rad/s

  amplitude_response = calculate_amplitude_response(m, k, c, omega_range)
  
  return omega_range, amplitude_response

def plot_response(omega_range, amplitude_response):
  """
  Plots the frequency response of an MCK system.

  Args:
    omega_range: Numpy array of frequencies.
    amplitude_response: Numpy array of corresponding amplitude responses.
  """
  plt.figure(figsize=(10, 6))
  plt.plot(omega_range, amplitude_response)
  plt.xlabel("Frequency (rad/s)")
  plt.ylabel("Amplitude Response Magnification")
  plt.title("Frequency Response of SDOF MCK System")
  plt.grid(True)
  plt.show()

if __name__ == "__main__":
  omega_range, amplitude_response = generate_response_data()
  plot_response(omega_range, amplitude_response)
