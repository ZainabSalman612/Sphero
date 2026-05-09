# 🔵 Sphero — AI-Powered Social Intelligence Engine

**Search once. See everything.** 

Sphero is a unified search engine that aggregates real-time public discussions from X (Twitter), Reddit, Hacker News, and across the social web into a single AI-powered intelligence dashboard. It doesn't just find links—it summarizes the global sentiment and extracts the core narratives behind any topic.

![Sphero Header](https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop)

## ✨ Features

- **Unified Social Search:** Search once and get results from X (Twitter), Reddit, YouTube, Hacker News, Medium, and more.
- **AI-Powered Insights:** Real-time summarization of social sentiment, trending narratives, and controversial takes using Google Gemini 1.5 Flash.
- **Live Hacker News Integration:** Real-time data fetching from the Hacker News Algolia API.
- **Premium UI/UX:** A stunning Glassmorphism design system featuring dark mode, fluid animations (Framer Motion), and responsive layouts.
- **Personal Dashboard:** Authenticated users can track their search history, view activity stats, and save bookmarks.
- **Platform Heatmaps:** Visual representation of platform discussion intensity using Recharts.

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)

### Backend
- **Architecture:** Next.js API Routes (Serverless ready)
- **AI Engine:** Google Gemini 1.5 Flash
- **API Integration:** Hacker News (Algolia), Mock Platform Adapters

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/sphero.git
   cd sphero
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your API keys:
   ```env
   GOOGLE_GEMINI_API_KEY=your_google_ai_studio_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

- `src/app/`: Next.js App Router (Pages, Layouts, API Routes)
- `src/components/`: Reusable UI components (Search, AI, Layout)
- `src/stores/`: Zustand state management (Auth, Search)
- `src/lib/`: Utility functions, constants, and mock data generators
- `src/styles/`: Global CSS and Tailwind configurations

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
