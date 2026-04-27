# GeoSurvey-Platform

Professional GIS & Survey Management

## Project Structure

```
📁 GeoSurvey-Platform
├── 📁 geo-survey-platform
│   ├── 📁 public
│   │   ├── 🖼️ favicon.png
│   │   ├── 🌐 index.html
│   │   ├── ⚙️ manifest.json
│   │   └── 📄 robots.txt
│   ├── 📁 src
│   │   ├── 📁 assets
│   │   │   ├── 📁 MapViewer
│   │   │   ├── 📁 content
│   │   │   ├── 📁 quickLinks
│   │   │   ├── 📁 quickactions
│   │   ├── 📁 components
│   │   │   ├── 📁 MapViewer
│   │   │   │   ├── 📄 FeatureOverlay.jsx
│   │   │   │   ├── 📄 FmsPanel.jsx
│   │   │   │   ├── 📄 LeftPanel.jsx
│   │   │   │   ├── 📄 MapHeader.jsx
│   │   │   │   ├── 📄 MapMain.jsx
│   │   │   │   ├── 📄 NearestRoutesPanel.jsx
│   │   │   │   └── 📄 StreetViewPanel.jsx
│   │   │   ├── 📄 ContentSection.jsx
│   │   │   ├── 📄 ContentTabs.jsx
│   │   │   ├── 📄 Header.jsx
│   │   │   ├── 📄 QuickActions.jsx
│   │   │   ├── 📄 QuickLinks.jsx
│   │   │   └── 📄 SystemOverview.jsx
│   │   ├── 📁 pages
│   │   │   ├── 📄 Dashboard.jsx
│   │   │   └── 📄 MapViewer.jsx
│   │   ├── 📁 styles
│   │   │   ├── 📁 MapViewer
│   │   │   │   ├── 🎨 FmsPanel.css
│   │   │   │   ├── 🎨 leftpanel.css
│   │   │   │   ├── 🎨 mapheader.css
│   │   │   │   ├── 🎨 mapmain.css
│   │   │   │   ├── 🎨 mapviewer.css
│   │   │   │   ├── 🎨 nearestRoutesPanel.css
│   │   │   │   └── 🎨 streetviewpanel.css
│   │   │   ├── 🎨 contentsection.css
│   │   │   ├── 🎨 dashboard.css
│   │   │   ├── 🎨 header.css
│   │   │   ├── 🎨 quickactions.css
│   │   │   ├── 🎨 quicklinks.css
│   │   │   └── 🎨 systemoverview.css
│   │   ├── 📁 utils
│   │   │   └── 📄 indexedDB.js
│   │   ├── 🎨 App.css
│   │   ├── 📄 App.js
│   │   ├── 📄 App.test.js
│   │   ├── 🎨 index.css
│   │   ├── 📄 index.js
│   │   ├── 📄 reportWebVitals.js
│   │   └── 📄 setupTests.js
│   ├── ⚙️ .gitignore
│   ├── 📝 README.md
│   ├── 📄 notes.txt
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   ├── 📄 postcss.config.js
│   └── 📄 tailwind.config.js
├── 📁 middleware
│   └── 📁 geoserver-fms-wrapper
│       ├── 📁 models
│       │   └── 📄 FormSchema.js
│       ├── 📁 routes
│       │   ├── 📄 distanceMatrix.js
│       │   ├── 📄 fms-download.js
│       │   ├── 📄 fms.js
│       │   └── 📄 systemoverview.js
│       ├── ⚙️ package-lock.json
│       ├── ⚙️ package.json
│       ├── 📄 server.js
│       └── 📄 socket.js
├── ⚙️ .gitignore
└── 📝 README.md
```
