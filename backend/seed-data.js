import { Client, Databases, Permission, Role, ID } from 'node-appwrite';
import fs from 'fs';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('6a9e9053003be1fde2dc')
  .setKey('standard_43e6b28309162e22b7852c13ae50aed42bdbebe22c896b326e22961cd949b481cb385bf780b6eb18f9d1556d2678d6b6ba0b8eec0e973118d77908001e8660c562008557099c026f75d137b5f90773766f37b95baf23f1f829e82ab8d1bb51fb2c7c110f54bb07fa111784feaa4d58522aa719fb2e4d61f71fa1be4e2dd0a01e');

const databases = new Databases(client);
const DATABASE_ID = 'my_library_db';

const booksData = [
  {
    id: 'book_01',
    ownerId: 'user_sooraj_01',
    title: 'One Piece',
    author: 'Eiichiro Oda',
    description: 'Follows the legendary adventures of Monkey D. Luffy and the Straw Hat Pirates across the Grand Line in search of the ultimate treasure left behind by Gol D. Roger.',
    category: 'Manga',
    language: 'English',
    coverFileUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    totalChapters: 1120,
    totalPages: null,
    readingState: {
      id: 'rs_01',
      userId: 'user_sooraj_01',
      status: 'Reading',
      currentChapter: 1085,
      currentPage: null,
      progressPercentage: 97,
      wishlist: false,
    },
  },
  {
    id: 'book_02',
    ownerId: 'user_sooraj_01',
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'An easy & proven way to build good habits & break bad ones. Small, incremental changes lead to monumental life-changing results.',
    category: 'Other Books',
    language: 'English',
    coverFileUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    totalChapters: null,
    totalPages: 320,
    readingState: {
      id: 'rs_02',
      userId: 'user_sooraj_01',
      status: 'Reading',
      currentChapter: null,
      currentPage: 215,
      progressPercentage: 67,
      wishlist: false,
    },
  },
  {
    id: 'book_03',
    ownerId: 'user_sooraj_01',
    title: 'Solo Leveling',
    author: 'Chugong',
    description: 'Known as the Weakest Hunter of All Mankind, Sung Jinwoo encounters a mysterious double dungeon that grants him a unique quest log to level up without limits.',
    category: 'Manhwa',
    language: 'Korean',
    coverFileUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    totalChapters: 179,
    totalPages: null,
    readingState: {
      id: 'rs_03',
      userId: 'user_sooraj_01',
      status: 'Completed',
      currentChapter: 179,
      currentPage: null,
      progressPercentage: 100,
      wishlist: false,
    },
  },
  {
    id: 'book_04',
    ownerId: 'user_sooraj_01',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    description: 'A magical fable about following your dream and listening to your heart. Santiago, an Andalusian shepherd boy, yearns to travel in search of worldly treasure.',
    category: 'Novel',
    language: 'English',
    coverFileUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    totalChapters: null,
    totalPages: 208,
    readingState: {
      id: 'rs_04',
      userId: 'user_sooraj_01',
      status: 'Completed',
      currentChapter: null,
      currentPage: 208,
      progressPercentage: 100,
      wishlist: false,
    },
  },
  {
    id: 'book_05',
    ownerId: 'user_sooraj_01',
    title: 'Nano Machine',
    author: 'Jeolmu Hyeon',
    description: 'Cheon Yeo-Woon, an illegitimate prince of the Demonic Cult, receives an unexpected injection of futuristic nanotechnology from a mysterious descendant.',
    category: 'Manhwa',
    language: 'Korean',
    coverFileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    totalChapters: 215,
    totalPages: null,
    readingState: {
      id: 'rs_05',
      userId: 'user_sooraj_01',
      status: 'Reading',
      currentChapter: 142,
      currentPage: null,
      progressPercentage: 66,
      wishlist: false,
    },
  },
  {
    id: 'book_06',
    ownerId: 'user_sooraj_01',
    title: 'Attack on Titan',
    author: 'Hajime Isayama',
    description: 'Humanity lives behind colossal concentric walls to protect themselves from man-eating Titans. Eren Yeager vows to cleanse the earth of every last Titan.',
    category: 'Manga',
    language: 'Japanese',
    coverFileUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    totalChapters: 139,
    totalPages: null,
    readingState: {
      id: 'rs_06',
      userId: 'user_sooraj_01',
      status: 'Completed',
      currentChapter: 139,
      currentPage: null,
      progressPercentage: 100,
      wishlist: false,
    },
  },
  {
    id: 'book_07',
    ownerId: 'user_sooraj_01',
    title: 'Death Note',
    author: 'Tsugumi Ohba & Takeshi Obata',
    description: 'High school genius Light Yagami discovers a supernatural notebook that grants him the ability to kill anyone whose name and face he knows.',
    category: 'Manga',
    language: 'English',
    coverFileUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    totalChapters: 108,
    totalPages: null,
    readingState: {
      id: 'rs_07',
      userId: 'user_sooraj_01',
      status: 'Completed',
      currentChapter: 108,
      currentPage: null,
      progressPercentage: 100,
      wishlist: false,
    },
  },
  {
    id: 'book_08',
    ownerId: 'user_sooraj_01',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    author: 'Koyoharu Gotouge',
    description: 'Tanjiro Kamado sets out to become a demon slayer after his family is slaughtered and his younger sister Nezuko is turned into a demon.',
    category: 'Manga',
    language: 'English',
    coverFileUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    totalChapters: 205,
    totalPages: null,
    readingState: {
      id: 'rs_08',
      userId: 'user_sooraj_01',
      status: 'Completed',
      currentChapter: 205,
      currentPage: null,
      progressPercentage: 100,
      wishlist: false,
    },
  },
  {
    id: 'book_09',
    ownerId: 'user_sooraj_01',
    title: "Hell's Paradise: Jigokuraku",
    author: 'Yuji Kaku',
    description: 'Gabimaru the Hollow, an immortal ninja on death row, is offered a full pardon if he can retrieve the Elixir of Life from a mythical supernatural island.',
    category: 'Manga',
    language: 'English',
    coverFileUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    totalChapters: 127,
    totalPages: null,
    readingState: {
      id: 'rs_09',
      userId: 'user_sooraj_01',
      status: 'Not Started',
      currentChapter: 0,
      currentPage: null,
      progressPercentage: 0,
      wishlist: true,
    },
  },
  {
    id: 'book_10',
    ownerId: 'user_sooraj_01',
    title: 'Blue Lock',
    author: 'Muneyuki Kaneshiro & Yusuke Nomura',
    description: 'Japan initiates a radical training experiment called Blue Lock, gathering 300 high school forwards into a prison-like facility to create the worlds most egotistical striker.',
    category: 'Manga',
    language: 'Japanese',
    coverFileUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
    totalChapters: 270,
    totalPages: null,
    readingState: {
      id: 'rs_10',
      userId: 'user_sooraj_01',
      status: 'Reading',
      currentChapter: 210,
      currentPage: null,
      progressPercentage: 78,
      wishlist: false,
    },
  },
  {
    id: 'book_11',
    ownerId: 'user_sooraj_01',
    title: 'Sakamoto Days',
    author: 'Yuto Suzuki',
    description: 'Taro Sakamoto was once the ultimate legendary hitman feared by all villains. Now a chubby convenience store owner with a family, he must fight assassins to keep peace.',
    category: 'Manga',
    language: 'English',
    coverFileUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    totalChapters: 175,
    totalPages: null,
    readingState: {
      id: 'rs_11',
      userId: 'user_sooraj_01',
      status: 'Not Started',
      currentChapter: 0,
      currentPage: null,
      progressPercentage: 0,
      wishlist: true,
    },
  },
];

const projectsData = [
  {
    id: 'proj_01',
    ownerId: 'user_sooraj_01',
    title: 'Speed-Typing',
    tagline: 'Interactive typing speed and accuracy testing platform with real-time analytics.',
    description: 'A responsive typing test application that measures WPM (Words Per Minute), accuracy percentages, and character error rates with customizable practice modes.',
    status: 'Completed',
    technologies: ['JavaScript', 'HTML5', 'CSS3', 'Web Audio API'],
    githubUrl: 'https://github.com/soorajstudio/Speed-Typing',
    liveDemoUrl: '',
    iconUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj_02',
    ownerId: 'user_sooraj_01',
    title: 'FIFA 2026 Prediction',
    tagline: 'Machine Learning simulation model predicting FIFA World Cup 2026 match outcomes.',
    description: 'Data science and predictive analytics model utilizing historical international football team performance data, FIFA rankings, and Monte Carlo tournament simulations.',
    status: 'Completed',
    technologies: ['Python', 'Pandas', 'Scikit-Learn', 'Matplotlib'],
    githubUrl: 'https://github.com/soorajstudio/fifa-2026-prediction',
    liveDemoUrl: '',
    iconUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj_03',
    ownerId: 'user_sooraj_01',
    title: 'Traffic Detection with YOLO',
    tagline: 'Real-time vehicle detection, tracking, and traffic density estimation.',
    description: 'Computer vision pipeline using YOLOv8 deep learning architecture to detect cars, buses, motorcycles, and pedestrians on video streams with bounding boxes and counting.',
    status: 'Completed',
    technologies: ['Python', 'YOLOv8', 'OpenCV', 'PyTorch'],
    githubUrl: 'https://github.com/soorajstudio/Traffic_Detection_with_YOLO',
    liveDemoUrl: '',
    iconUrl: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj_04',
    ownerId: 'user_sooraj_01',
    title: 'GitHub Contribution Viewer',
    tagline: 'Interactive 3D visualization and deep metric analysis of GitHub developer commit activity.',
    description: 'Connects to GitHub REST & GraphQL APIs to render interactive heatmaps, repository commit streaks, language distribution charts, and printable developer summaries.',
    status: 'Completed',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'GitHub API'],
    githubUrl: 'https://github.com/soorajstudio/github-contribution-viewer',
    liveDemoUrl: '',
    iconUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj_05',
    ownerId: 'user_sooraj_01',
    title: 'Social Media Web Application',
    tagline: 'Full-featured social networking platform with real-time messaging and feed discovery.',
    description: 'Modern social media ecosystem featuring user profiles, post creation with media uploads, likes, comment threads, friend connections, and instant WebSocket notifications.',
    status: 'Completed',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.io'],
    githubUrl: 'https://github.com/soorajstudio/Social_Media_Web_Application',
    liveDemoUrl: '',
    iconUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj_06',
    ownerId: 'user_sooraj_01',
    title: 'Full Stack Quiz Game Web App',
    tagline: 'Multiplayer trivia and competitive quiz game platform with timed challenges.',
    description: 'Dynamic trivia web app with category selection, timed question rounds, score leaderboards, and teacher/host question creation portal.',
    status: 'Completed',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    githubUrl: 'https://github.com/soorajstudio/Full_Stack_Quiz_Game_Web_Application',
    liveDemoUrl: '',
    iconUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj_07',
    ownerId: 'user_sooraj_01',
    title: 'School Zone Alert System',
    tagline: 'IoT and GPS-based geo-fencing speed notification system for school areas.',
    description: 'Smart transit safety application that monitors vehicle proximity to school boundaries and triggers audible/visual speed reduction warnings.',
    status: 'Completed',
    technologies: ['Python', 'IoT', 'GPS Geo-fencing', 'Flask'],
    githubUrl: 'https://github.com/soorajstudio/School_Zone_Alert_System',
    liveDemoUrl: '',
    iconUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj_08',
    ownerId: 'user_sooraj_01',
    title: 'Home Book',
    tagline: 'Smart household inventory and property maintenance management portal.',
    description: 'Personal asset tracking platform for cataloging household devices, warranty receipts, scheduled maintenance dates, and emergency home contacts.',
    status: 'Completed',
    technologies: ['React', 'TypeScript', 'Firebase', 'Tailwind CSS'],
    githubUrl: 'https://github.com/soorajstudio/Home_Book',
    liveDemoUrl: '',
    iconUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj_09',
    ownerId: 'user_sooraj_01',
    title: 'API Showcase',
    tagline: 'Interactive developer sandbox for testing and inspecting microservice REST endpoints.',
    description: 'Developer utility tool with request building, parameter injection, header customization, real-time response schema validation, and cURL snippet generation.',
    status: 'Completed',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Swagger/OpenAPI'],
    githubUrl: 'https://github.com/soorajstudio/api-showcase',
    liveDemoUrl: '',
    iconUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj_10',
    ownerId: 'user_sooraj_01',
    title: 'Steganography Image Encoder Decoder',
    tagline: 'Security tool hiding confidential encrypted text payloads inside digital image pixels.',
    description: 'Cryptographic steganography application utilizing Least Significant Bit (LSB) encoding to conceal secret messages and AES-256 encrypted text within PNG/BMP image pixels without visual degradation.',
    status: 'Completed',
    technologies: ['Python', 'Cryptology', 'OpenCV', 'Streamlit'],
    githubUrl: 'https://github.com/soorajstudio/Steganography_Image_Encoder_Decoder_Web_Application',
    liveDemoUrl: '',
    iconUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=120&auto=format&fit=crop&q=80',
  },
];

async function seed() {
  console.log('🌱 Seeding Appwrite Database with your Books & Projects...');

  for (const b of booksData) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        'books',
        b.id,
        {
          ownerId: b.ownerId,
          title: b.title,
          author: b.author,
          description: b.description,
          category: b.category,
          language: b.language,
          coverFileUrl: b.coverFileUrl,
          totalPages: b.totalPages,
          totalChapters: b.totalChapters,
        },
        [Permission.read(Role.any()), Permission.update(Role.any()), Permission.delete(Role.any())]
      );
      console.log(`  ✅ Seeded Book: ${b.title}`);
    } catch (err) {
      console.log(`  ℹ️ Book "${b.title}": ${err.message}`);
    }

    if (b.readingState) {
      try {
        await databases.createDocument(
          DATABASE_ID,
          'reading_states',
          b.readingState.id,
          {
            userId: b.readingState.userId,
            bookId: b.id,
            status: b.readingState.status,
            currentChapter: b.readingState.currentChapter,
            currentPage: b.readingState.currentPage,
            progressPercentage: b.readingState.progressPercentage,
            wishlist: b.readingState.wishlist,
          },
          [Permission.read(Role.any()), Permission.update(Role.any()), Permission.delete(Role.any())]
        );
      } catch (err) {
        // ignore duplicate
      }
    }
  }

  for (const p of projectsData) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        'projects',
        p.id,
        {
          ownerId: p.ownerId,
          title: p.title,
          tagline: p.tagline,
          description: p.description,
          status: p.status,
          technologies: p.technologies,
          githubUrl: p.githubUrl,
          liveDemoUrl: p.liveDemoUrl,
          iconUrl: p.iconUrl,
        },
        [Permission.read(Role.any()), Permission.update(Role.any()), Permission.delete(Role.any())]
      );
      console.log(`  ✅ Seeded Project: ${p.title}`);
    } catch (err) {
      console.log(`  ℹ️ Project "${p.title}": ${err.message}`);
    }
  }

  console.log('\n🎉 ALL BOOKS & PROJECTS ARE LIVE IN APPWRITE DATABASE!');
}

seed().catch(console.error);
