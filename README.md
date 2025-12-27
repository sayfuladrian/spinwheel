# Spin Wheel Web App

A modern, responsive, and configurable spin wheel application built with vanilla JavaScript, HTML, and CSS.

## Features

- **Modern Design:** Rounded, flat theme following the Golden Ratio for spacing and typography.
- **Configurable Input:**
  - Import data via CSV.
  - Text input support (Format: `Name, Group, Weight`).
- **Advanced Weighting:**
  - **Individual:** Probability is proportional to the item's weight.
  - **Group:** Groups get equal screen space, with items distributed within their group's slice.
- **Customizable:**
  - Toggle weight visibility on the wheel.
  - Set spin duration.
  - Choose between Automatic or Manual stop modes.
- **Animations:** Smooth spinning physics and UI interactions.

## How to Run Locally

This application uses ES Modules (`import`/`export`), which requires the files to be served via an HTTP server rather than opening `index.html` directly from the file system (due to CORS security policies).

### Option 1: Using Python (Recommended)

If you have Python installed (Mac/Linux usually do):

1. Open your terminal or command prompt.
2. Navigate to the project directory.
3. Run the following command:
   ```bash
   python3 -m http.server 8000 --directory src
   ```
4. Open your web browser and go to: `http://localhost:8000`

### Option 2: Using Node.js

If you have Node.js installed:

1. Install a simple server globally:
   ```bash
   npm install -g serve
   ```
2. Run the server:
   ```bash
   serve src
   ```

### Option 3: VS Code

If you use Visual Studio Code:
1. Install the "Live Server" extension.
2. Right-click on `src/index.html` and select "Open with Live Server".

## Deployment (Making it visible on the Internet)

Currently, this application resides on your local machine. To share it with the world, you need to host it. Since it is a static site (HTML/CSS/JS only), you can use free hosting services:

- **GitHub Pages:** Push this code to a GitHub repository and enable GitHub Pages in the settings.
- **Netlify / Vercel:** Drag and drop the `src` folder onto their dashboard for instant hosting.
- **Cloud Storage:** Host the files in an AWS S3 bucket or Google Cloud Storage configured for static website hosting.

Once deployed, you will get a public URL (e.g., `https://my-spin-wheel.netlify.app`) that anyone can access.
