# Video Tutorial System - Uribarri Online

## Overview

This is a **context-aware video tutorial system** that displays relevant YouTube videos based on where the user is in the application. When users click the video tutorial button (red play icon) in the TopBar, they see a video tutorial specific to the current page or action they're performing.

## How It Works

1. **Button Location**: The video tutorial button (🎬 red play icon) is located in the TopBar, next to the notification bell icon
2. **Context Detection**: The system automatically detects what page/section the user is on
3. **Smart Display**: Shows the most relevant tutorial video for that specific context
4. **Modal Player**: Videos play in a beautiful modal overlay with YouTube embed

## File Structure

```
/front-end/
├── src/
│   ├── components/
│   │   └── video_tutorial/
│   │       ├── VideoTutorialModal.jsx       # Modal component for displaying videos
│   │       ├── FloatingVideoButton.jsx      # Floating help button for pages
│   │       └── README.md                    # This file
│   ├── config/
│   │   └── videoTutorials.js                # Video URL configuration
│   └── app_context/
│       └── UIContext.jsx                    # Global state management (updated)
└── css/
    ├── VideoTutorialModal.module.css        # Modal styling
    ├── FloatingVideoButton.module.css       # Floating button styling
    └── TopBar.module.css                    # TopBar button styling (updated)
```

## Adding YouTube Videos

### Step 1: Get Your YouTube Video Link

You can provide the video in any of these formats:

1. **Standard URL**: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
2. **Short URL**: `https://youtu.be/dQw4w9WgXcQ`
3. **Just the ID**: `dQw4w9WgXcQ`
4. **Embed URL**: `https://www.youtube.com/embed/dQw4w9WgXcQ`

### Step 2: Edit the Configuration File

Open the file: `/front-end/src/config/videoTutorials.js`

Find the appropriate context and add your video URL:

```javascript
// BEFORE (empty):
loginRegister: {
  title: 'Cómo Registrarse en Uribarri Online',
  url: '', // Add YouTube URL here
  description: 'Tutorial sobre registro y creación de cuenta'
},

// AFTER (with video):
loginRegister: {
  title: 'Cómo Registrarse en Uribarri Online',
  url: 'https://www.youtube.com/watch?v=ABC123XYZ',
  description: 'Tutorial sobre registro y creación de cuenta'
},
```

### Step 3: Test It

1. Start your development server
2. Navigate to the page you added a video for
3. Click the red play button (🎬) in the TopBar
4. The video should open in a modal

## Available Contexts

Here are all the contexts you can add videos for:

### Authentication & Account
- `loginRegister` - Registration and login page
- `emailVerification` - Email verification process
- `forgotPassword` - Password recovery
- `userProfile` - User profile management

### Shopping & Commerce (Customer View)
- `shopWindow` - Browse shops catalog
- `shopStore` - Individual shop view and purchasing
- `orderHistory` - View order history

### Seller Management
- `shopManagement` - Seller dashboard
- `createShop` - Creating a new shop
- `productManagement` - Managing products
- `createProduct` - Adding a new product
- `packageManagement` - Creating product bundles/offers
- `orderManagement` - Managing received orders

### Delivery/Rider
- `riderManagement` - Rider dashboard
- `riderDelivery` - Delivery process

### Community Features
- `infoManagement` - Community board/bulletin
- `createOrganization` - Creating an organization
- `createPublication` - Creating posts
- `manageOrganization` - Managing organization
- `createEvent` - Creating cultural events

### Default
- `default` - General introduction video (fallback)

## Context Detection Logic

The system detects context in this priority order:

1. **Login/Register** → Shows account creation tutorial
2. **Product Management** → Shows product tutorial
3. **Shop Management** → Shows shop tutorial
4. **Shop Store** → Shows shopping tutorial
5. **Shop Window** → Shows browsing tutorial
6. **Info Management** → Shows community board tutorial
7. **Rider Management** → Shows delivery tutorial
8. **Default** → Shows general introduction

## Button Types & Placement

### 1. TopBar Video Button (Main)

**Location:** TopBar, between title and notifications/menu
**Appearance:** Red play icon (🎬)
**Visibility:** Shows when TopBar is visible (logged in or on public pages)

```jsx
// Automatically included in TopBar.jsx
<button className={styles.videoTutorialButton} onClick={handleVideoTutorialClick}>
  <PlayCircle size={20} />
</button>
```

### 2. FloatingVideoButton (For pages without TopBar)

**Location:** Fixed position on screen (customizable)
**Appearance:** Red gradient button with "Ayuda" label and pulsing icon
**Visibility:** Always visible on the page where it's placed

**Features:**
- ✅ Animated entrance (slides from bottom)
- ✅ Pulsing play icon to attract attention
- ✅ Becomes circular on mobile (< 480px)
- ✅ Configurable position (4 corners)
- ✅ Context-aware (shows specific video)

**Usage Example:**

```jsx
import FloatingVideoButton from '../video_tutorial/FloatingVideoButton.jsx';
import VideoTutorialModal from '../video_tutorial/VideoTutorialModal.jsx';

function MyComponent() {
  const {
    showVideoTutorialModal,
    currentVideoUrl,
    currentVideoTitle,
    closeVideoTutorial
  } = useUI();

  return (
    <div>
      {/* Your component content */}

      {/* Add floating help button */}
      <FloatingVideoButton
        context="loginRegister"    // Which video context
        position="bottom-right"    // bottom-right | bottom-left | top-right | top-left
      />

      {/* Add modal (controlled by UIContext) */}
      <VideoTutorialModal
        isOpen={showVideoTutorialModal}
        onClose={closeVideoTutorial}
        videoUrl={currentVideoUrl}
        title={currentVideoTitle}
      />
    </div>
  );
}
```

**Already Implemented In:**
- ✅ LoginRegisterForm (bottom-right, "loginRegister" context)

**Recommended For:**
- EmailVerification page
- ForgotPassword page
- ResetPassword page
- Any standalone page without TopBar

## Customization

### Change Video Titles

Edit the `title` property in `videoTutorials.js`:

```javascript
shopWindow: {
  title: 'Tu Nuevo Título Aquí',
  url: 'https://...',
  description: '...'
}
```

### Add New Contexts

1. Add your new context to `videoTutorials.js`:

```javascript
export const VIDEO_TUTORIALS = {
  // ... existing contexts ...

  myNewFeature: {
    title: 'Tutorial de Mi Nueva Funcionalidad',
    url: 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID',
    description: 'Descripción del tutorial'
  }
};
```

2. Update the context detection logic in `/front-end/src/components/top_bar/TopBar.jsx`:

```javascript
const getCurrentContext = () => {
  // Add your new condition
  if (showMyNewFeature) {
    return 'myNewFeature';
  }

  // ... existing conditions ...
};
```

### Change Button Appearance

Edit `/front-end/css/TopBar.module.css`:

```css
.videoTutorialButton {
  color: #ff0000; /* Change color */
  /* Modify other styles */
}
```

## Modal Features

The VideoTutorialModal includes:

- ✅ **Responsive design** - Works on mobile and desktop
- ✅ **16:9 aspect ratio** - Proper video dimensions
- ✅ **Escape key support** - Press ESC to close
- ✅ **Click outside to close** - Click backdrop to dismiss
- ✅ **YouTube branding** - Red YouTube icon in header
- ✅ **Channel link** - Footer links to your YouTube channel
- ✅ **Graceful fallback** - Shows "Coming Soon" if no video URL
- ✅ **Accessibility** - ARIA labels and keyboard support

## YouTube Channel Link

Update your channel link in `VideoTutorialModal.jsx`:

```jsx
<a
  href="https://www.youtube.com/@YOUR_CHANNEL_NAME"
  target="_blank"
  rel="noopener noreferrer"
>
  canal de YouTube
</a>
```

## Example: Complete Workflow

### 1. Upload Video to YouTube

Upload your tutorial video to: `https://www.youtube.com/@uribarrionline`

### 2. Get Video URL

After upload, copy the URL: `https://www.youtube.com/watch?v=XYZ123ABC`

### 3. Update Configuration

Edit `/front-end/src/config/videoTutorials.js`:

```javascript
shopWindow: {
  title: 'Cómo Buscar y Explorar Comercios',
  url: 'https://www.youtube.com/watch?v=XYZ123ABC',
  description: 'Navegar por el escaparate de comercios locales'
}
```

### 4. Test

```bash
# In /front-end directory
npm run dev

# Open browser to http://localhost:5173
# Navigate to Shop Window
# Click the red play button
# Video opens in modal!
```

## Troubleshooting

### Video Doesn't Load

1. **Check URL format** - Make sure it's a valid YouTube URL
2. **Check privacy settings** - Video must be Public or Unlisted (not Private)
3. **Check embedding** - Ensure YouTube embedding is enabled for the video
4. **Check browser console** - Look for error messages

### Button Doesn't Appear

1. **Check you're on a supported page** - Button only shows on certain pages
2. **Clear browser cache** - Force refresh with Ctrl+F5
3. **Check console for errors** - Look for JavaScript errors

### Wrong Video Shows

1. **Check context detection** - Verify the `getCurrentContext()` logic
2. **Check configuration** - Ensure the right URL is in the right context
3. **Clear localStorage** - App state might be cached

## Testing All Contexts

Create a checklist for testing:

- [ ] Login/Register page
- [ ] Shop Window (browsing)
- [ ] Shop Store (individual shop)
- [ ] Shop Management (seller view)
- [ ] Product Management
- [ ] Rider Dashboard
- [ ] Community Board
- [ ] Each shows the correct video

## Future Enhancements

Ideas for improvement:

- [ ] Add video playlist support
- [ ] Track video views/analytics
- [ ] Add video timestamps/chapters
- [ ] Support for multiple languages
- [ ] Add video search functionality
- [ ] Create video thumbnail previews
- [ ] Add video duration display

## Support

For issues or questions:
- Check the browser console for errors
- Review this documentation
- Test with a known working YouTube video first
- Verify all file paths are correct

---

**Last Updated**: 2025
**Maintainer**: Uribarri Online Team
**YouTube Channel**: [@uribarrionline](https://www.youtube.com/@uribarrionline)
