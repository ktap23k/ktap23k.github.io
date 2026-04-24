window.CV_DATA = {
  defaultLang: 'en',
  langs: {
    en: {
      meta: {
        title: 'CV — Trần Anh Tuấn · Backend / Full-stack Developer',
        description:
          'Bilingual CV of Trần Anh Tuấn, a backend and full-stack developer working with Python, APIs, data crawling, cloud, and DevOps.',
      },
      fileName: 'tran-anh-tuan-cv-en.pdf',
      ui: {
        languageLabel: 'Language',
        languageOptions: {
          en: 'English',
          vi: 'Tiếng Việt',
        },
        download: '⬇ Download PDF',
        downloading: 'Generating PDF...',
        nav: {
          home: 'Home',
          posts: 'Posts',
          about: 'About',
          contact: 'Contact',
          cv: 'CV',
        },
        footer: {
          text: '© 2026 <strong>tuanta</strong> · Built with love and vanilla HTML',
          home: 'Home',
          posts: 'Posts',
        },
        sections: {
          contact: 'Contact',
          skills: 'Core Skills',
          education: 'Education',
          additional: 'Additional',
          summaryEyebrow: 'Profile',
          summaryTitle: 'Professional Summary',
          experienceEyebrow: 'Career',
          experienceTitle: 'Experience',
          projectsEyebrow: 'Work Samples',
          projectsTitle: 'Selected Projects',
        },
        miniGroups: {
          workflow: 'Workflow',
          interests: 'Interests',
        },
        projectLink: 'View project',
      },
      profile: {
        name: 'Trần Anh Tuấn',
        initials: 'TA',
        title: 'Backend / Full-stack Developer',
        location: 'Da Nang, Vietnam',
      },
      contact: [
        {
          icon: '✉',
          label: 'Email',
          value: 'ktap23k@gmail.com',
          href: 'mailto:ktap23k@gmail.com',
        },
        {
          icon: '☎',
          label: 'Phone',
          value: '0763025389',
          href: 'tel:+84763025389',
        },
        {
          icon: '📍',
          label: 'Location',
          value: 'Da Nang, Vietnam',
        },
        {
          icon: '🐙',
          label: 'GitHub',
          value: 'github.com/ktap23k',
          href: 'https://github.com/ktap23k',
        },
        {
          icon: '🌐',
          label: 'Portfolio',
          value: 'ktap23k.github.io',
          href: 'https://ktap23k.github.io',
        },
      ],
      summary: {
        paragraphs: [
          'Backend and full-stack developer with 4+ years of experience building Python APIs, data crawling pipelines, and operational tools for client-facing and internal products.',
        ],
        highlights: [
          'Python-first delivery',
          'REST APIs and data crawling',
          'Cloud, CI/CD and production support',
        ],
      },
      skillGroups: [
        {
          title: 'Languages',
          items: ['Python', 'Go', 'JavaScript', 'Java', 'C/C++', 'SQL'],
        },
        {
          title: 'Frameworks',
          items: ['FastAPI', 'Django', 'Flask', 'Node.js', 'React', 'Next.js'],
        },
        {
          title: 'Data & Search',
          items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQL Server', 'pgvector'],
        },
        {
          title: 'Cloud & Delivery',
          items: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Git'],
        },
        {
          title: 'AI / Crawling',
          items: ['TensorFlow', 'OpenCV', 'Selenium', 'BeautifulSoup', 'RAG', 'LLM APIs'],
        },
      ],
      education: [
        {
          degree: 'B.E. in Information Technology',
          period: '2018 — 2023',
          school: 'Academy of Cryptography Techniques (KMA)',
          details: [
            'Participated in research related to malware analysis and detection.',
            'Graduation project: hand-gesture vehicle control.',
          ],
        },
      ],
      additional: {
        workflow: ['Git', 'GitLab', 'Jira', 'Agile Scrum'],
      },
      interests: [
        { icon: '✍', text: 'Technical blogging and knowledge sharing' },
        { icon: '🏸', text: 'Badminton and outdoor activities' },
        { icon: '🧭', text: 'Traveling and exploring new places' },
      ],
      experience: [
        {
          role: 'Middle Full-stack Developer',
          period: '11/2024 — Present',
          company: 'Picon Technology · Da Nang',
          bullets: [
            'Designed and delivered microservices for an e-commerce platform serving 2K+ daily active users across key business workflows.',
            'Optimized PostgreSQL queries and built CI/CD workflows with GitHub Actions, Docker, and Kubernetes while supporting code review and mentoring.',
          ],
          tags: ['Python', 'PostgreSQL', 'Redis', 'gRPC', 'Kubernetes'],
        },
        {
          role: 'Full-stack Developer',
          period: '05/2024 — 10/2024',
          company: 'Atech Digital · Da Nang',
          bullets: [
            'Developed REST APIs and data crawling services for internal and client-facing products using Python and Node.js.',
            'Packaged services with Docker and worked with PostgreSQL, MongoDB, and Redis to support data processing flows.',
          ],
          tags: ['Python', 'Node.js', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker'],
        },
        {
          role: 'Software Developer',
          period: '03/2023 — 04/2024',
          company: 'Tinh Vân Software · Hanoi',
          bullets: [
            'Delivered backend and frontend features across budgeting, warehouse, conversion, and company website projects using Django, Flask, React, and Next.js.',
            'Refactored legacy modules, converted selected Node.js logic to Python, and handled APIs, cron jobs, deployment, and code review on several tracks.',
          ],
          tags: ['Python', 'Django', 'Flask', 'Node.js', 'React'],
        },
        {
          role: 'Backend Developer',
          period: '03/2022 — 02/2023',
          company: 'Miichisoft · Hanoi',
          bullets: [
            'Built APIs, cron jobs, and backend workflows for parking and data-collection products serving the Japanese market.',
            'Crawled data from 100+ parking-related and Pachinko sources, then reviewed and deployed services on AWS with Django, FastAPI, Docker, and Kubernetes.',
          ],
          tags: ['Django', 'FastAPI', 'AWS', 'Docker', 'Kubernetes'],
        },
        {
          role: 'Software Developer',
          period: '03/2021 — 01/2022',
          company: 'TMT Trường Minh Thịnh',
          bullets: [
            'Built computer-vision and OCR workflows with TensorFlow, OpenCV, and YOLO for advertisement recognition, document scanning, preprocessing, and model training.',
          ],
          tags: ['TensorFlow', 'OpenCV', 'YOLO', 'Flask'],
        },
        {
          role: 'Freelance Developer',
          period: '2019 — Present (part-time)',
          company: 'Independent / Client projects',
          bullets: [
            'Delivered small and medium-sized products for clients across backend, frontend, deployment, and production support using Django, FastAPI, Node.js, React, Next.js, and AWS.',
          ],
          tags: ['Django', 'FastAPI', 'Node.js', 'React', 'AWS'],
        },
      ],
      projects: [
        {
          name: 'Budget Tools',
          period: '06/2023 — 12/2023',
          company: 'Tinh Vân Software',
          description:
            'Budget and reporting platform for departments and stores. I handled backend/frontend delivery, refactoring, Node.js-to-Python migration, cron jobs, and deployment.',
          tags: ['Flask', 'Node.js', 'MongoDB', 'Docker'],
        },
        {
          name: 'App Pcollection',
          period: '03/2022 — 02/2023',
          company: 'Miichisoft',
          description:
            'Parking lot management product for the Japanese market. I led backend delivery for a 4-person team, designed APIs and cron jobs, crawled 100+ sources, and shipped on AWS.',
          tags: ['Django', 'AWS', 'Docker', 'Kubernetes'],
          featured: true,
        },
        {
          name: 'RAG Chatbot Engine',
          period: 'Personal project',
          company: 'Open-source',
          description:
            'A retrieval-augmented chatbot engine with OpenAI and Gemini APIs, pgvector-based search, automatic chunking, and Docker Compose deployment.',
          tags: ['Go', 'pgvector', 'LLM APIs', 'Docker'],
          link: 'https://github.com/ktap23k/rag-engine',
        },
      ],
    },
    vi: {
      meta: {
        title: 'CV — Trần Anh Tuấn · Backend / Full-stack Developer',
        description:
          'CV song ngữ của Trần Anh Tuấn, lập trình viên backend và full-stack với kinh nghiệm về Python, API, crawl dữ liệu, cloud và DevOps.',
      },
      fileName: 'tran-anh-tuan-cv-vi.pdf',
      ui: {
        languageLabel: 'Ngôn ngữ',
        languageOptions: {
          en: 'English',
          vi: 'Tiếng Việt',
        },
        download: '⬇ Tải PDF',
        downloading: 'Đang tạo PDF...',
        nav: {
          home: 'Trang chủ',
          posts: 'Bài viết',
          about: 'Về tôi',
          contact: 'Liên hệ',
          cv: 'CV',
        },
        footer: {
          text: '© 2026 <strong>tuanta</strong> · Được xây dựng với ❤️ và HTML thuần',
          home: 'Trang chủ',
          posts: 'Bài viết',
        },
        sections: {
          contact: 'Liên hệ',
          skills: 'Kỹ năng chính',
          education: 'Học vấn',
          additional: 'Bổ sung',
          summaryEyebrow: 'Hồ sơ',
          summaryTitle: 'Tóm tắt chuyên môn',
          experienceEyebrow: 'Kinh nghiệm',
          experienceTitle: 'Kinh nghiệm làm việc',
          projectsEyebrow: 'Dự án',
          projectsTitle: 'Dự án chọn lọc',
        },
        miniGroups: {
          workflow: 'Quy trình làm việc',
          interests: 'Sở thích',
        },
        projectLink: 'Xem dự án',
      },
      profile: {
        name: 'Trần Anh Tuấn',
        initials: 'TA',
        title: 'Backend / Full-stack Developer',
        location: 'Đà Nẵng, Việt Nam',
      },
      contact: [
        {
          icon: '✉',
          label: 'Email',
          value: 'ktap23k@gmail.com',
          href: 'mailto:ktap23k@gmail.com',
        },
        {
          icon: '☎',
          label: 'Điện thoại',
          value: '0763025389',
          href: 'tel:+84763025389',
        },
        {
          icon: '📍',
          label: 'Địa điểm',
          value: 'Đà Nẵng, Việt Nam',
        },
        {
          icon: '🐙',
          label: 'GitHub',
          value: 'github.com/ktap23k',
          href: 'https://github.com/ktap23k',
        },
        {
          icon: '🌐',
          label: 'Portfolio',
          value: 'ktap23k.github.io',
          href: 'https://ktap23k.github.io',
        },
      ],
      summary: {
        paragraphs: [
          'Lập trình viên backend và full-stack với hơn 4 năm kinh nghiệm thực chiến trong việc xây dựng API bằng Python, pipeline crawl dữ liệu và công cụ vận hành cho cả sản phẩm khách hàng lẫn hệ thống nội bộ.',
        ],
        highlights: [
          'Ưu tiên Python trong delivery',
          'REST API và crawl dữ liệu',
          'Cloud, CI/CD và vận hành production',
        ],
      },
      skillGroups: [
        {
          title: 'Ngôn ngữ',
          items: ['Python', 'Go', 'JavaScript', 'Java', 'C/C++', 'SQL'],
        },
        {
          title: 'Framework',
          items: ['FastAPI', 'Django', 'Flask', 'Node.js', 'React', 'Next.js'],
        },
        {
          title: 'Dữ liệu & Search',
          items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQL Server', 'pgvector'],
        },
        {
          title: 'Cloud & Delivery',
          items: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Git'],
        },
        {
          title: 'AI / Crawling',
          items: ['TensorFlow', 'OpenCV', 'Selenium', 'BeautifulSoup', 'RAG', 'LLM APIs'],
        },
      ],
      education: [
        {
          degree: 'Kỹ sư Công nghệ Thông tin',
          period: '2018 — 2023',
          school: 'Học viện Kỹ thuật Mật mã (KMA)',
          details: [
            'Tham gia nghiên cứu liên quan tới phân tích và phát hiện mã độc.',
            'Đồ án tốt nghiệp: điều khiển xe bằng cử chỉ tay.',
          ],
        },
      ],
      additional: {
        workflow: ['Git', 'GitLab', 'Jira', 'Agile Scrum'],
      },
      interests: [
        { icon: '✍', text: 'Viết blog kỹ thuật và chia sẻ kiến thức' },
        { icon: '🏸', text: 'Cầu lông và các hoạt động ngoài trời' },
        { icon: '🧭', text: 'Du lịch và khám phá địa điểm mới' },
      ],
      experience: [
        {
          role: 'Middle Full-stack Developer',
          period: '11/2024 — Hiện tại',
          company: 'Picon Technology · Đà Nẵng',
          bullets: [
            'Thiết kế và triển khai các microservice cho nền tảng thương mại điện tử phục vụ hơn 2K người dùng hoạt động mỗi ngày ở các luồng nghiệp vụ chính.',
            'Tối ưu truy vấn PostgreSQL và xây dựng luồng CI/CD với GitHub Actions, Docker, Kubernetes, đồng thời tham gia review code và mentoring.',
          ],
          tags: ['Python', 'PostgreSQL', 'Redis', 'gRPC', 'Kubernetes'],
        },
        {
          role: 'Full-stack Developer',
          period: '05/2024 — 10/2024',
          company: 'Atech Digital · Đà Nẵng',
          bullets: [
            'Phát triển REST API và các dịch vụ crawl dữ liệu cho sản phẩm nội bộ và sản phẩm khách hàng bằng Python và Node.js.',
            'Đóng gói dịch vụ với Docker và làm việc với PostgreSQL, MongoDB, Redis để phục vụ các luồng xử lý dữ liệu.',
          ],
          tags: ['Python', 'Node.js', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker'],
        },
        {
          role: 'Software Developer',
          period: '03/2023 — 04/2024',
          company: 'Tinh Vân Software · Hà Nội',
          bullets: [
            'Triển khai tính năng backend và frontend cho các dự án quản lý ngân sách, kho vận, chuyển đổi hệ thống và website công ty bằng Django, Flask, React, Next.js.',
            'Refactor module cũ, chuyển một phần logic Node.js sang Python, đồng thời phụ trách API, cron job, deploy và review code ở nhiều nhánh delivery.',
          ],
          tags: ['Python', 'Django', 'Flask', 'Node.js', 'React'],
        },
        {
          role: 'Backend Developer',
          period: '03/2022 — 02/2023',
          company: 'Miichisoft · Hà Nội',
          bullets: [
            'Xây dựng API, cron job và workflow backend cho các sản phẩm quản lý bãi đỗ xe và thu thập dữ liệu phục vụ thị trường Nhật Bản.',
            'Crawl dữ liệu từ hơn 100 nguồn về bãi đỗ xe và Pachinko, sau đó review và triển khai dịch vụ trên AWS bằng Django, FastAPI, Docker và Kubernetes.',
          ],
          tags: ['Django', 'FastAPI', 'AWS', 'Docker', 'Kubernetes'],
        },
        {
          role: 'Software Developer',
          period: '03/2021 — 01/2022',
          company: 'TMT Trường Minh Thịnh',
          bullets: [
            'Xây dựng workflow computer vision và OCR với TensorFlow, OpenCV, YOLO cho bài toán nhận diện quảng cáo, scan tài liệu, tiền xử lý và train model.',
          ],
          tags: ['TensorFlow', 'OpenCV', 'YOLO', 'Flask'],
        },
        {
          role: 'Freelance Developer',
          period: '2019 — Hiện tại (part-time)',
          company: 'Dự án cá nhân / khách hàng',
          bullets: [
            'Thực hiện các sản phẩm nhỏ và vừa cho khách hàng, đảm nhận backend, frontend, triển khai và hỗ trợ production bằng Django, FastAPI, Node.js, React, Next.js và AWS.',
          ],
          tags: ['Django', 'FastAPI', 'Node.js', 'React', 'AWS'],
        },
      ],
      projects: [
        {
          name: 'Budget Tools',
          period: '06/2023 — 12/2023',
          company: 'Tinh Vân Software',
          description:
            'Nền tảng quản lý ngân sách và báo cáo cho phòng ban, cửa hàng. Tôi phụ trách backend, frontend, refactor, chuyển một phần Node.js sang Python, cron job và deploy.',
          tags: ['Flask', 'Node.js', 'MongoDB', 'Docker'],
        },
        {
          name: 'App Pcollection',
          period: '03/2022 — 02/2023',
          company: 'Miichisoft',
          description:
            'Sản phẩm quản lý bãi đỗ xe cho thị trường Nhật Bản. Tôi lead backend cho nhóm 4 người, thiết kế API và cron job, crawl hơn 100 nguồn và triển khai trên AWS.',
          tags: ['Django', 'AWS', 'Docker', 'Kubernetes'],
          featured: true,
        },
        {
          name: 'RAG Chatbot Engine',
          period: 'Dự án cá nhân',
          company: 'Open-source',
          description:
            'Engine chatbot theo mô hình retrieval-augmented, tích hợp OpenAI và Gemini API, hỗ trợ pgvector, chunking tự động và triển khai qua Docker Compose.',
          tags: ['Go', 'pgvector', 'LLM APIs', 'Docker'],
          link: 'https://github.com/ktap23k/rag-engine',
        },
      ],
    },
  },
};
