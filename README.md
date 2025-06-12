CulturaPulse 🌍
Your Interactive Global Cultural Intelligence App.

CulturaPulse is a real-time, cross-platform mobile application built with React Native and Expo. It's designed to provide travelers, remote workers, digital nomads, and the culturally curious with instant insights into local cultures around the world. From daily language phrases and local news to etiquette tips and cultural events, CulturaPulse helps you connect more deeply with any country.





✨ Key Features
🌐 Real-Time Country Data: Get up-to-date local news, holidays, and cultural information for any country.
🗣️ Daily Language Phrases: Learn a new phrase every day with Text-to-Speech (TTS) and pre-recorded audio for authentic pronunciation.
📅 Interactive Events Calendar: Discover cultural events, national holidays, and local festivals.
🤝 Cultural Etiquette & Insights: Access practical tips on social customs, dining etiquette, and business practices.
📰 Personalized News Feed: Stay informed with top headlines from local news sources, filtered by country.
🔖 Bookmarks & Personalization: Save your favorite countries for quick access and customize your experience.
Modern, Animated UI: A beautiful, dark-themed interface with smooth parallax animations, blurs, and 3D-inspired card elements for an engaging user experience.
Authentication: Secure user accounts powered by Supabase for syncing preferences and bookmarks across devices.
📸 Screenshots & Demo


https://github.com/user-attachments/assets/6d1b0738-c016-4c33-8799-b5b3106dc2a3




🛠️ Tech Stack
Core Framework & Platform
React Native: Cross-platform mobile development.

Expo (SDK 50): Tooling for building and deploying React Native apps.

Expo Router: File-based routing for navigation.

TypeScript: For strong typing and code safety.

Backend & Database

Supabase: Open-source Firebase alternative for authentication and user profile storage.
APIs & Services
Nager.Date: For public holiday information.
GNews.io: For real-time, country-specific news headlines.
Curated Content: Cultural etiquette and language phrases are managed via mock data, designed to be replaced by a dedicated backend or CMS for scalability.
UI & Styling

Custom Component Library: Reusable, themed UI components (Button, Card, Input, Text).

lucide-react-native: For a clean and modern icon set.

React Native Animated API: For performant parallax scroll effects and animations.

expo-blur: For frosted-glass/blur effects on UI elements.

expo-av & expo-speech: For audio playback and Text-to-Speech functionality.



🚀 Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

Prerequisites

Node.js (LTS version recommended)

Yarn or npm

Expo Go app on your iOS or Android device for testing.

Supabase Account: You'll need to create a project on Supabase to handle authentication and user profiles.



Installation & Setup
Clone the repository:

Bash


git clone https://github.com/your-username/CulturaPulse.git
cd CulturaPulse
Install dependencies:

Bash

npm install
# or
yarn install
Set up Environment Variables:

Create a .env file in the root of the project by copying the example:
Bash

cp .env.example .env
Supabase:
Log in to your Supabase project dashboard.
Go to Project Settings > API.
Find your Project URL and anon (public) Key.
Add them to your .env file.
GNews API:
Sign up for a free account at GNews.io.
Get your API key from your GNews dashboard.
Add it to your .env file.
Your .env file should look like this:

# Supabase credentials
EXPO_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key

# GNews API key
EXPO_PUBLIC_GNEWS_API_KEY=your-gnews-api-key
(Note: The EXPO_PUBLIC_ prefix is required by Expo to expose variables to the client-side app.)

Run the application:

Bash

npx expo start
Scan the QR code with the Expo Go app on your phone.

📂 Project Structure
The project is organized into a modular structure for clarity and scalability.





📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
