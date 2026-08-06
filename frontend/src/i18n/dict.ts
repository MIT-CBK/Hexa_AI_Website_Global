/**
 * UI / chrome strings (navigation, buttons, labels). Content-heavy marketing
 * copy lives in the data files as localized objects; this is just the frame.
 */
export const dict = {
  // Nav
  "nav.solutions": { vi: "Giải pháp", en: "Solutions" },
  "nav.services": { vi: "Dịch vụ", en: "Services" },
  "nav.certifications": { vi: "Chứng chỉ", en: "Certifications" },
  "nav.newsletter": { vi: "Newsletter", en: "Newsletter" },
  "nav.vision": { vi: "Tầm nhìn & Sứ mệnh", en: "Vision & Mission" },
  "nav.contact": { vi: "Liên hệ", en: "Contact" },
  "nav.home": { vi: "Trang chủ", en: "Home" },
  "nav.support": { vi: "Hỗ trợ", en: "Support" },

  // Support portal
  "support.title": { vi: "Trung tâm Hỗ trợ", en: "Support Center" },
  "support.subtitle": {
    vi: "Dành cho khách hàng đang sử dụng giải pháp & dịch vụ của Hexa AI. Đăng nhập để tạo và theo dõi yêu cầu hỗ trợ.",
    en: "For customers using Hexa AI's solutions & services. Sign in to create and track support tickets.",
  },
  "support.signIn": { vi: "Đăng nhập", en: "Sign in" },
  "support.signUp": { vi: "Đăng ký", en: "Sign up" },
  "support.logout": { vi: "Đăng xuất", en: "Log out" },
  "support.name": { vi: "Họ và tên", en: "Full name" },
  "support.email": { vi: "Email", en: "Email" },
  "support.password": { vi: "Mật khẩu", en: "Password" },
  "support.company": { vi: "Công ty (không bắt buộc)", en: "Company (optional)" },
  "support.code": { vi: "Mã khách hàng", en: "Customer code" },
  "support.codeHint": {
    vi: "Mã được cấp khi bạn mua giải pháp/dịch vụ của Hexa AI. Chưa có? Liên hệ đội ngũ của chúng tôi.",
    en: "The code issued when you purchased a Hexa AI solution/service. Don't have one? Contact our team.",
  },
  "support.haveAccount": { vi: "Đã có tài khoản? Đăng nhập", en: "Have an account? Sign in" },
  "support.noAccount": { vi: "Chưa có tài khoản? Đăng ký", en: "No account? Sign up" },
  "support.welcome": { vi: "Xin chào", en: "Welcome" },
  "support.newTicket": { vi: "Tạo yêu cầu mới", en: "New ticket" },
  "support.myTickets": { vi: "Yêu cầu của tôi", en: "My tickets" },
  "support.tabTickets": { vi: "Yêu cầu hỗ trợ", en: "Tickets" },
  "support.tabDownload": { vi: "Tải xuống", en: "Download" },
  "support.tabDocument": { vi: "Tài liệu", en: "Document" },
  "support.searchFiles": { vi: "Tìm tệp…", en: "Search files…" },
  "support.searchDocs": { vi: "Tìm tài liệu…", en: "Search documents…" },
  "support.allProducts": { vi: "Tất cả sản phẩm", en: "All products" },
  "support.noResults": { vi: "Không tìm thấy kết quả phù hợp.", en: "No matching results." },
  "support.noTickets": {
    vi: "Bạn chưa có yêu cầu hỗ trợ nào.",
    en: "You don't have any tickets yet.",
  },
  "support.subject": { vi: "Tiêu đề", en: "Subject" },
  "support.subjectPh": { vi: "Mô tả ngắn gọn vấn đề", en: "Briefly describe the issue" },
  "support.product": { vi: "Sản phẩm / dịch vụ", en: "Product / service" },
  "support.severity": { vi: "Mức độ ảnh hưởng", en: "Severity" },
  "support.description": { vi: "Mô tả chi tiết lỗi", en: "Detailed description" },
  "support.descriptionPh": {
    vi: "Điều gì xảy ra, các bước tái hiện, thông báo lỗi, thời điểm bắt đầu…",
    en: "What happened, steps to reproduce, error messages, when it started…",
  },
  "support.contactEmail": { vi: "Email liên lạc", en: "Contact email" },
  "support.attachments": { vi: "Đính kèm (ảnh / log)", en: "Attachments (images / logs)" },
  "support.attachHint": {
    vi: "JPG, PNG, GIF, WEBP, TXT, LOG, JSON, CSV, ZIP — tối đa 8MB mỗi tệp.",
    en: "JPG, PNG, GIF, WEBP, TXT, LOG, JSON, CSV, ZIP — up to 8MB each.",
  },
  "support.addFile": { vi: "Thêm tệp", en: "Add file" },
  "support.submit": { vi: "Gửi yêu cầu", en: "Submit ticket" },
  "support.submitting": { vi: "Đang gửi…", en: "Submitting…" },
  "support.created": { vi: "Đã gửi yêu cầu hỗ trợ!", en: "Ticket submitted!" },
  "support.cancel": { vi: "Huỷ", en: "Cancel" },
  "support.uploading": { vi: "Đang tải tệp…", en: "Uploading…" },

  "sev.low": { vi: "Thấp", en: "Low" },
  "sev.medium": { vi: "Trung bình", en: "Medium" },
  "sev.high": { vi: "Cao", en: "High" },
  "sev.critical": { vi: "Khẩn cấp", en: "Critical" },
  "tst.open": { vi: "Mới", en: "Open" },
  "tst.in_progress": { vi: "Đang xử lý", en: "In progress" },
  "tst.resolved": { vi: "Đã xử lý", en: "Resolved" },
  "tst.closed": { vi: "Đã đóng", en: "Closed" },

  // Common CTAs
  "cta.explore": { vi: "Khám phá giải pháp", en: "Explore solutions" },
  "cta.consult": { vi: "Đặt lịch tư vấn", en: "Book a consultation" },
  "cta.demo": { vi: "Đặt lịch demo", en: "Request a demo" },
  "cta.contact": { vi: "Liên hệ với chúng tôi", en: "Get in touch" },
  "cta.viewAll": { vi: "Xem tất cả", en: "View all" },
  "cta.learnMore": { vi: "Tìm hiểu thêm", en: "Learn more" },
  "cta.readArticle": { vi: "Đọc bài viết", en: "Read article" },
  "cta.back": { vi: "Quay lại", en: "Back" },
  "cta.retry": { vi: "Thử lại", en: "Try again" },

  // Hero
  "hero.badge": {
    vi: "Nền tảng an ninh mạng thế hệ AI-Native",
    en: "AI-Native cybersecurity platform",
  },
  "hero.trust": {
    vi: "Tuân thủ & xây dựng theo các chuẩn",
    en: "Aligned with leading security standards",
  },
  "hero.title": {
    vi: "Bảo vệ & vận hành hạ tầng với sức mạnh của *trí tuệ nhân tạo*",
    en: "Defend & operate your infrastructure with the power of *artificial intelligence*",
  },
  "hero.subtitle": {
    vi: "Hexa AI hợp nhất giám sát hạ tầng, phát hiện mối đe doạ và phản ứng tự động trên một nền tảng duy nhất — cùng đội ngũ chuyên gia bảo mật được chứng nhận quốc tế.",
    en: "Hexa AI unifies infrastructure monitoring, threat detection and automated response on a single platform — backed by an internationally-certified security team.",
  },

  // Section eyebrows / headings
  "solutions.eyebrow": { vi: "Module Giải pháp", en: "Solutions module" },
  "solutions.title": {
    vi: "Nền tảng công nghệ *phòng thủ toàn diện*",
    en: "Six tools, *one platform*",
  },
  "solutions.desc": {
    vi: "Năm năng lực công nghệ cốt lõi — giám sát, quan sát và ngăn chặn mối đe doạ trên mọi lớp hạ tầng, được tăng cường bởi AI.",
    en: "Five core technology capabilities — monitor, observe and stop threats across every layer of your infrastructure, enhanced by AI.",
  },
  "services.eyebrow": { vi: "Module Dịch vụ", en: "Services module" },
  "services.title": {
    vi: "Đội ngũ chuyên gia *đồng hành cùng bạn*",
    en: "Certified operators *watching your stack*",
  },
  "services.desc": {
    vi: "Từ vận hành an ninh 24/7, kiểm thử tấn công thực chiến đến tư vấn tuân thủ — dịch vụ quản trị bởi chuyên gia được chứng nhận quốc tế.",
    en: "From 24/7 security operations and real-world offensive testing to compliance advisory — managed by internationally-certified experts.",
  },

  "vision.eyebrow": { vi: "Tầm nhìn & Sứ mệnh", en: "Vision & Mission" },
  "vision.title": {
    vi: "Vì một không gian mạng *an toàn và tự chủ*",
    en: "Toward a *safe and sovereign* cyberspace",
  },
  "vision.visionTitle": { vi: "Tầm nhìn", en: "Vision" },
  "vision.visionBody": {
    vi: "Trở thành nền tảng an ninh mạng AI-Native hàng đầu khu vực, nơi mọi tổ chức — dù quy mô nào — đều có thể tự bảo vệ hạ tầng số của mình một cách chủ động, thông minh và bền vững.",
    en: "To become the region's leading AI-Native cybersecurity platform, where every organization — at any scale — can defend its digital infrastructure proactively, intelligently and sustainably.",
  },
  "vision.missionTitle": { vi: "Sứ mệnh", en: "Mission" },
  "vision.missionBody": {
    vi: "Hợp nhất giám sát, phát hiện và phản ứng trên một nền tảng duy nhất được tăng cường bởi AI — giúp đội ngũ an ninh chuyển từ phòng thủ bị động sang chủ động, giảm rủi ro và chi phí vận hành.",
    en: "To unify monitoring, detection and response on a single AI-enhanced platform — helping security teams shift from reactive to proactive defense while cutting risk and operating cost.",
  },

  // Certifications
  "certs.eyebrow": { vi: "Năng lực đội ngũ", en: "Team expertise" },
  "certs.title": {
    vi: "Chứng chỉ *quốc tế hàng đầu*",
    en: "*Top-tier* global certifications",
  },
  "certs.desc": {
    vi: "Đội ngũ Hexa AI sở hữu những chứng chỉ bảo mật khắt khe nhất thế giới — minh chứng cho năng lực thực chiến trong tấn công, phòng thủ và quản trị.",
    en: "Our team holds OSCP, OSEP, CRTO and CISSP among others — the hands-on certifications you earn by breaking into real systems under a clock, not by passing a multiple-choice exam.",
  },
  "certs.navCta": { vi: "Xem chứng chỉ đội ngũ", en: "See team certifications" },
  "certs.issuer": { vi: "Tổ chức cấp", en: "Issuer" },

  // Newsletter
  "news.eyebrow": { vi: "Newsletter", en: "Newsletter" },
  "news.previewTitle": {
    vi: "Góc nhìn từ *đội ngũ Hexa AI*",
    en: "Insights from *the Hexa AI team*",
  },
  "news.previewDesc": {
    vi: "Phân tích, hướng dẫn và xu hướng mới nhất về an ninh mạng và vận hành thông minh.",
    en: "Detection rules, incident write-ups and what we're seeing in the wild — from the team running the SOC.",
  },
  "news.pageTitle": {
    vi: "Tin tức & *góc nhìn chuyên gia*",
    en: "News & *expert insights*",
  },
  "news.pageDesc": {
    vi: "Cập nhật xu hướng an ninh mạng, hướng dẫn kỹ thuật và phân tích từ đội ngũ Hexa AI.",
    en: "Detection rules, incident write-ups and analysis from the team running the SOC.",
  },
  "news.search": { vi: "Tìm bài viết…", en: "Search articles…" },
  "news.all": { vi: "Tất cả", en: "All" },
  "news.empty": { vi: "Không tìm thấy bài viết phù hợp.", en: "No matching articles found." },
  "news.loading": { vi: "Đang tải bài viết…", en: "Loading articles…" },
  "news.related": { vi: "Bài viết liên quan", en: "Related articles" },
  "news.allArticles": { vi: "Tất cả bài viết", en: "All articles" },
  "news.attachments": { vi: "Tệp đính kèm", en: "Attachments" },

  // Detail pages
  "detail.overview": { vi: "Tổng quan", en: "Overview" },
  "detail.features": { vi: "Tính năng nổi bật", en: "Key features" },
  "detail.outcomes": { vi: "Giá trị mang lại", en: "Outcomes" },
  "detail.related": { vi: "Có thể bạn quan tâm", en: "You may also like" },
  "detail.allSolutions": { vi: "Tất cả giải pháp", en: "All solutions" },
  "detail.allServices": { vi: "Tất cả dịch vụ", en: "All services" },
  "detail.consultAbout": { vi: "Tư vấn về", en: "Ask about" },

  // CTA band
  "ctaBand.title": {
    vi: "Bắt đầu hành trình bảo mật *AI-Native* ngay hôm nay",
    en: "See Hexa AI run on *your own* infrastructure",
  },
  "ctaBand.desc": {
    vi: "Đặt lịch demo trực tiếp với chuyên gia của Hexa AI và xem nền tảng vận hành trên chính hạ tầng của bạn.",
    en: "Book a live demo with a Hexa AI expert and see the platform run on your own infrastructure.",
  },

  // Contact
  "contact.eyebrow": { vi: "Liên hệ", en: "Contact" },
  "contact.title": {
    vi: "Sẵn sàng nâng cấp *an ninh mạng?*",
    en: "Tell us what you're *trying to protect*",
  },
  "contact.desc": {
    vi: "Đội ngũ chuyên gia của Hexa AI luôn sẵn sàng tư vấn giải pháp phù hợp với hạ tầng của bạn.",
    en: "Hexa AI's experts are ready to advise on the right solution for your infrastructure.",
  },
  "contact.email": { vi: "Email", en: "Email" },
  "contact.office": { vi: "Văn phòng", en: "Office" },
  "contact.officeValue": { vi: "Việt Nam · Singapore", en: "Vietnam · Singapore" },
  "contact.name": { vi: "Họ và tên", en: "Full name" },
  "contact.namePlaceholder": { vi: "Nguyễn Văn A", en: "John Doe" },
  "contact.company": { vi: "Công ty", en: "Company" },
  "contact.companyPlaceholder": {
    vi: "Tên tổ chức (không bắt buộc)",
    en: "Organization (optional)",
  },
  "contact.message": { vi: "Nội dung", en: "Message" },
  "contact.messagePlaceholder": {
    vi: "Chúng tôi có thể giúp gì cho bạn?",
    en: "How can we help you?",
  },
  "contact.send": { vi: "Gửi liên hệ", en: "Send message" },
  "contact.sending": { vi: "Đang gửi…", en: "Sending…" },
  "contact.thanksTitle": { vi: "Cảm ơn bạn đã liên hệ!", en: "Thank you for reaching out!" },
  "contact.thanksBody": {
    vi: "Tin nhắn của bạn đã được gửi tới đội ngũ Hexa AI. Chúng tôi sẽ phản hồi sớm nhất qua email.",
    en: "Your message has been sent to the Hexa AI team. We'll get back to you by email shortly.",
  },
  "contact.again": { vi: "Gửi liên hệ khác", en: "Send another message" },
  "contact.error": {
    vi: "Gửi không thành công. Vui lòng thử lại.",
    en: "Sending failed. Please try again.",
  },
  "contact.errName": { vi: "Vui lòng nhập tên", en: "Please enter your name" },
  "contact.errEmail": { vi: "Email không hợp lệ", en: "Invalid email" },
  "contact.errMessage": { vi: "Nội dung tối thiểu 10 ký tự", en: "Message must be at least 10 characters" },

  // Footer
  "footer.solutions": { vi: "Giải pháp", en: "Solutions" },
  "footer.services": { vi: "Dịch vụ", en: "Services" },
  "footer.company": { vi: "Công ty", en: "Company" },
  "footer.rights": { vi: "Bảo lưu mọi quyền.", en: "All rights reserved." },
  "footer.adminLink": { vi: "Quản trị Newsletter", en: "Newsletter admin" },
  "footer.certifications": { vi: "Chứng chỉ đội ngũ", en: "Team certifications" },

  // 404
  "notfound.title": { vi: "Không tìm thấy trang", en: "Page not found" },
  "notfound.desc": {
    vi: "Trang bạn tìm không tồn tại hoặc đã được di chuyển.",
    en: "The page you're looking for doesn't exist or has been moved.",
  },
  "notfound.home": { vi: "Về trang chủ", en: "Back to home" },

  // States
  "state.error": { vi: "Không tải được dữ liệu.", en: "Failed to load data." },

  // NMS dashboard (hero visual)
  "nms.topology": { vi: "Sơ đồ mạng trực tiếp", en: "Live topology" },
  "nms.devices": { vi: "Thiết bị", en: "Devices" },
  "nms.uptime": { vi: "Uptime", en: "Uptime" },
  "nms.throughput": { vi: "Lưu lượng", en: "Throughput" },
  "nms.anomalies": { vi: "Bất thường", en: "Anomalies" },
  "nms.copilotPre": {
    vi: "Lưu lượng bất thường tại ",
    en: "Anomalous traffic at ",
  },
  "nms.copilotPost": {
    vi: " — đã khoanh vùng & gợi ý khắc phục.",
    en: " — isolated & remediation suggested.",
  },
} as const

export type DictKey = keyof typeof dict
