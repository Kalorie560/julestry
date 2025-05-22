# SDOF MCK System Frequency Response Plotter

This project contains a Python script (`mck_plotter.py`) that calculates and visualizes the frequency response of a single-degree-of-freedom (SDOF) mass-spring-damper (MCK) system.

The script plots the amplitude response magnification against the excitation frequency.

## Parameters
The behavior of the system is determined by the following parameters defined within the script:
-   **m**: Mass (kg)
-   **k**: Stiffness (N/m)
-   **c**: Damping coefficient (Ns/m)

## How to Run

1.  **Ensure Dependencies:**
    Make sure you have Python installed, along with the following libraries:
    *   NumPy (`pip install numpy`)
    *   Matplotlib (`pip install matplotlib`)

2.  **Execute the Script:**
    Navigate to the directory containing `mck_plotter.py` and run the following command in your terminal:
    ```bash
    python mck_plotter.py
    ```

This will execute the script and display the frequency response plot.

## Output

The script will generate and display a 2D plot where:
-   The **X-axis** represents the excitation frequency (in rad/s).
-   The **Y-axis** represents the amplitude response magnification (dimensionless).

The plot visualizes how the system's response changes with different excitation frequencies.
