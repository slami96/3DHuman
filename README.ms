# Interactive Human Body Explorer

An educational 3D web application that allows users to explore the human body by clicking on different parts to learn about their functions and characteristics.

## Features

- Interactive 3D human body model
- Clickable body parts with informational display
- Responsive design for desktop and mobile devices
- Smooth loading with progress indicators
- Dark theme for better visibility of the model

## Technology Stack

- Next.js (React framework)
- Three.js (3D rendering)
- React Three Fiber (React renderer for Three.js)
- Drei (useful helpers for React Three Fiber)

## Getting Started

### Running Locally (Optional)

If you want to run the project locally, you'll need:

1. Node.js installed
2. Clone the repository
3. Run `npm install`
4. Run `npm run dev`

### Development via GitHub

This project is set up to be editable directly on GitHub:

1. Use GitHub's web editor
2. Make changes to files
3. Commit changes
4. GitHub Actions will build and verify your changes
5. Vercel will deploy automatically

## Adding Your 3D Model

1. Upload your GLB file to the `public/models/` directory
2. If your model is larger than GitHub's file size limit:
   - Consider using Git LFS
   - Or host it externally and update the URL in `ModelViewer.js`

### Model Requirements

- Format: GLB preferred (converted from GLTF if needed)
- Structure: Model should have named meshes for different body parts
- Size: Optimize if larger than 20MB

## Deployment

This project is configured for automatic deployment to Vercel:

1. Connect your GitHub repository to Vercel
2. Configure the project (Vercel will automatically detect Next.js)
3. Deploy

## Customizing

### Adding More Body Parts

Edit the `bodyPartsData` object in `pages/index.js` to add or modify body parts information.

### Changing Colors and Styling

Modify the CSS files in the `styles` directory to customize the appearance.

### Adjusting the 3D Model Behavior

Edit the `ModelViewer.js` file to change camera settings, lighting, or interaction behavior.

## Browser Compatibility

This application should work in modern browsers that support WebGL:
- Chrome, Firefox, Edge, Safari
- Mobile browsers on recent iOS and Android devices

## License

[Your License Here]

## Acknowledgements

- Three.js for 3D rendering capabilities
- React Three Fiber for React integration
- Next.js for the React framework
- [Credit your 3D model source here]
