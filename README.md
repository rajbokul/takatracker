
# ৳ TakaTracker - Android Build Guide

This project is prepared for a native Android build using **Capacitor**. Because an APK is a compiled binary, you must perform the final build on a computer with Android Studio installed.

## Prerequisites
1. **Node.js**: Install from [nodejs.org](https://nodejs.org/)
2. **Android Studio**: Install from [developer.android.com](https://developer.android.com/studio)

## Build Instructions

### 1. Initialize the project
Open your terminal/command prompt in the project folder and run:
```bash
npm install
```

### 2. Add Android Platform
Run the following command to generate the Android Studio project:
```bash
npx cap add android
```

### 3. Open in Android Studio
Run this to launch Android Studio with your project:
```bash
npx cap open android
```

### 4. Generate the APK
Inside **Android Studio**:
1. Wait for the "Gradle Sync" to finish (check the bottom progress bar).
2. Go to the top menu: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. Once finished, a notification will appear at the bottom right. Click **locate** to find your `app-debug.apk` file.

## Features
- **Offline First**: Works without internet via Service Workers.
- **Local Storage**: All your financial data stays on your phone.
- **AI Integration**: Uses Gemini for smart transaction parsing.
- **BDT Optimized**: Built specifically for Bangladeshi currency and heads.
