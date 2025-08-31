# Curio H5 Mobile App

A sophisticated HTML5 mobile application featuring interactive bullet screen (弹幕) functionality, live broadcast rooms, and character interaction systems.

## 🚀 Features

- **Interactive Splash Screen**: Smooth opening animation sequence with museum-style presentation
- **Multi-Page Navigation**: 18+ interconnected pages with seamless transitions
- **Bullet Screen System**: Real-time scrolling message display with clickable interactions
- **Live Broadcast Room**: Interactive chat environment with floating emojis and character messages
- **Character Intro System**: Detailed character profiles (Vincent van Gogh, Qianlong, etc.)
- **Image Upload Flow**: Camera integration with frame positioning and gallery selection
- **Settings Management**: User preferences, language switching, and character customization
- **Responsive Design**: Optimized for 393x852px mobile viewport

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: Tailwind CSS (CDN)
- **Animations**: CSS Keyframes, Transitions
- **Architecture**: Page-based SPA with modular components

## 📱 Page Structure

1. **Pages 1-2**: Splash screen animation
2. **Page 3**: Main opening page with picture frames
3. **Page 4**: Detail view with live room access
4. **Page 5**: Settings modal
5. **Page 6**: Character preferences
6. **Page 7**: Image upload options
7. **Page 8**: Camera interface
8. **Page 9**: Photo capture animation
9. **Page 10**: Image analysis
10. **Page 11**: Gallery preparation
11. **Page 13**: Live broadcast room
12. **Page 14**: Interactive bullet screen
13. **Page 15**: Character introduction
14. **Page 18**: Advanced bullet screen features

## 🎯 Key Functionality

### Bullet Screen (弹幕) System
- Continuous scrolling message display
- Transparent fade-out effects
- Clickable message interaction
- Seamless loop animation
- Real-time user message integration

### Live Room Features
- Interactive chat interface
- Floating emoji animations
- Character message integration
- Voice input simulation
- Timer display for live events

### Navigation System
- `showPage(pageNumber)`: Core navigation function
- `showIntro()`: Character introduction display
- `showLiveRoom()`: Broadcast room access
- Event-driven page transitions

## 🚦 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for file:// protocol limitations)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/t-yixinxia_microsoft/curio-h5-mobile-app.git
   cd curio-h5-mobile-app
   ```

2. **Serve the application**:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**:
   Navigate to `http://localhost:8000` and open developer tools in mobile view (393x852px)

### Development

The application is built as a single HTML file with embedded CSS and JavaScript for simplicity and performance.

**Key files:**
- `curio-h5.html` - Main application file
- `src/assets/` - Image and SVG assets
- `.gitignore` - Git ignore rules
- `README.md` - Project documentation

## 🎨 Design System

### Color Palette
- Primary: `#221400` (dark brown)
- Background: `#000` (black)
- Text: `#fff` (white)
- Accent: `#007aff` (iOS blue)
- Overlay: `rgba(0,0,0,0.3)` (semi-transparent)

### Typography
- Primary: 'Avenir LT Std'
- Headers: 'ABC Ginto Nord Unlicensed Trial'
- System: -apple-system, BlinkMacSystemFont

### Animations
- Fade transitions: 300-500ms ease-out
- Bullet screen: 12-25s linear loops
- Modal slides: 300ms ease with scale
- Floating effects: 1.5-3s ease-out

## 🔧 Configuration

### Mobile Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Container Dimensions
```css
.mobile-container {
    width: 393px;
    height: 852px;
    position: relative;
    overflow: hidden;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Images not loading**: Ensure you're serving via HTTP/HTTPS, not file://
2. **Animations stuttering**: Check browser performance settings
3. **Touch events not working**: Verify mobile viewport meta tag
4. **Assets missing**: Confirm all files in `src/assets/` are present

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📦 Deployment

## 🔑 Environment Variables (Updated Backend Integration)

Create a `.env` file (or configure host env) for Vite:

```
VITE_BACKEND_API_BASE=http://localhost:8000
# (Legacy — only needed if some dev utilities still test direct Azure access)
VITE_AZURE_OPENAI_ENDPOINT=
VITE_AZURE_OPENAI_API_KEY=
VITE_AZURE_OPENAI_DEPLOYMENT_NAME=model-router
VITE_AZURE_OPENAI_API_VERSION=2025-01-01-preview
```

`VITE_BACKEND_API_BASE` points to the FastAPI backend that now performs:
1. Image classification `/api/classification/classify`
2. Metadata generation `/api/metadata/generate`
3. Multi-character conversation `/api/openai/conversation`
4. Prompt retrieval `/api/prompts/*` (for debugging/versioning)

Front-end no longer calls Azure OpenAI directly in production paths; logic is centralized server-side for security, prompt governance, and consistency.

### Endpoint Switching
To deploy against another environment (e.g. staging/production), only change `VITE_BACKEND_API_BASE` (no code changes required). Example:

```
VITE_BACKEND_API_BASE=https://curio-api.staging.example.com
```

If you need health verification, the app internally can hit `${VITE_BACKEND_API_BASE}/api/openai/health`.


### GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select source branch (main)
4. Access via `https://t-yixinxia_microsoft.github.io/curio-h5-mobile-app/`

### Other Platforms
- Netlify: Drag and drop the project folder
- Vercel: Connect GitHub repository
- Firebase Hosting: Use Firebase CLI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Stellar** - *Initial work* - [t-yixinxia_microsoft](https://github.com/t-yixinxia_microsoft)

## 🙏 Acknowledgments

- Figma design specifications
- Tailwind CSS framework
- Museum artwork assets
- Character design inspirations

## 📊 Project Stats

- **Lines of Code**: 5000+
- **Pages**: 18+
- **Components**: 15+
- **Animations**: 25+
- **Assets**: 100+

---

**Built with ❤️ for interactive mobile experiences**
