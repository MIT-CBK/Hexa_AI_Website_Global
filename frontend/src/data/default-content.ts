import type { SiteContent } from "@/data/content-types"

/**
 * Bundled default content — used as the initial value for the editor and as a
 * fallback when the backend has no saved document yet. Once an admin saves via
 * the CMS, the server document takes over.
 */
export const DEFAULT_CONTENT: SiteContent = {
  home: {
    hero: {
      badge: {
        vi: "Nền tảng an ninh mạng thế hệ AI-Native",
        en: "AI-Native cybersecurity platform",
      },
      title: {
        vi: "Bảo vệ & vận hành hạ tầng với sức mạnh của *trí tuệ nhân tạo*",
        en: "Defend and operate your infrastructure at *machine speed*",
      },
      subtitle: {
        vi: "Hexa AI hợp nhất giám sát hạ tầng, phát hiện mối đe doạ và phản ứng tự động trên một nền tảng duy nhất — cùng đội ngũ chuyên gia bảo mật được chứng nhận quốc tế.",
        en: "Hexa AI unifies infrastructure monitoring, threat detection and automated response on a single platform — backed by an internationally-certified security team.",
      },
    },
    stats: [
      { value: "10", label: { vi: "Solutions & services", en: "Solutions & services" } },
      { value: "9+", label: { vi: "Global certifications", en: "Global certifications" } },
      { value: "<60s", label: { vi: "Detection time (MTTD)", en: "Detection time (MTTD)" } },
      { value: "24/7", label: { vi: "SOC monitoring", en: "SOC monitoring" } },
    ],
    solutions: {
      eyebrow: { vi: "Module Giải pháp", en: "Solutions module" },
      title: {
        vi: "Nền tảng công nghệ *phòng thủ toàn diện*",
        en: "Six tools, *one platform*",
      },
      desc: {
        vi: "Six products — NMS, Observability, SIEM, NDR, EDR and SOAR — on one platform, sharing a single data model and one AI correlation engine.",
        en: "Six products — NMS, Observability, SIEM, NDR, EDR and SOAR — on one platform, sharing a single data model and one AI correlation engine.",
      },
    },
    services: {
      eyebrow: { vi: "Module Dịch vụ", en: "Services module" },
      title: { vi: "Đội ngũ chuyên gia *đồng hành cùng bạn*", en: "Certified operators *watching your stack*" },
      desc: {
        vi: "Từ vận hành an ninh 24/7, kiểm thử tấn công thực chiến đến tư vấn tuân thủ — dịch vụ quản trị bởi chuyên gia được chứng nhận quốc tế.",
        en: "From 24/7 security operations and real-world offensive testing to compliance advisory — managed by internationally-certified experts.",
      },
    },
    vision: {
      eyebrow: { vi: "Tầm nhìn & Sứ mệnh", en: "Vision & Mission" },
      title: {
        vi: "Vì một không gian mạng *an toàn và tự chủ*",
        en: "Toward a *safe and sovereign* cyberspace",
      },
      visionTitle: { vi: "Tầm nhìn", en: "Vision" },
      visionBody: {
        vi: "Trở thành nền tảng an ninh mạng AI-Native hàng đầu khu vực, nơi mọi tổ chức — dù quy mô nào — đều có thể tự bảo vệ hạ tầng số của mình một cách chủ động, thông minh và bền vững.",
        en: "To let any organization defend its own infrastructure without standing up a 50-person security team — whether it runs 200 endpoints or 200,000.",
      },
      missionTitle: { vi: "Sứ mệnh", en: "Mission" },
      missionBody: {
        vi: "Hợp nhất giám sát, phát hiện và phản ứng trên một nền tảng duy nhất được tăng cường bởi AI — giúp đội ngũ an ninh chuyển từ phòng thủ bị động sang chủ động, giảm rủi ro và chi phí vận hành.",
        en: "To unify monitoring, detection and response on a single AI-enhanced platform — helping security teams shift from reactive to proactive defense while cutting risk and operating cost.",
      },
      values: [
        {
          iconKey: "cpu",
          title: { vi: "AI làm cốt lõi", en: "AI at the core" },
          desc: {
            vi: "Trí tuệ nhân tạo hiện diện trong từng quyết định — không phải tính năng đính kèm.",
            en: "AI lives in every decision — not a bolted-on feature.",
          },
        },
        {
          iconKey: "lock",
          title: { vi: "Secure by design", en: "Secure by design" },
          desc: {
            vi: "Bảo mật được thiết kế từ dòng code đầu tiên theo nguyên tắc Zero-Trust.",
            en: "Security designed in from the first line of code, Zero-Trust by default.",
          },
        },
        {
          iconKey: "layers",
          title: { vi: "Hợp nhất nền tảng", en: "Unified platform" },
          desc: {
            vi: "Một nguồn dữ liệu, một trải nghiệm — xoá bỏ silo công cụ rời rạc.",
            en: "One data source, one experience — no more tool silos.",
          },
        },
        {
          iconKey: "zap",
          title: { vi: "Tốc độ phản ứng", en: "Speed of response" },
          desc: {
            vi: "Phát hiện và phản ứng tính bằng giây, không phải giờ hay ngày.",
            en: "Detection and response measured in seconds, not hours or days.",
          },
        },
      ],
    },
    certs: {
      eyebrow: { vi: "Năng lực đội ngũ", en: "Team expertise" },
      title: { vi: "Chứng chỉ *quốc tế hàng đầu*", en: "*Top-tier* global certifications" },
      desc: {
        vi: "Đội ngũ Hexa AI sở hữu những chứng chỉ bảo mật khắt khe nhất thế giới — minh chứng cho năng lực thực chiến trong tấn công, phòng thủ và quản trị.",
        en: "Our team holds OSCP, OSEP, CRTO and CISSP among others — the hands-on certifications you earn by breaking into real systems under a clock, not by passing a multiple-choice exam.",
      },
    },
    newsletter: {
      eyebrow: { vi: "Newsletter", en: "Newsletter" },
      previewTitle: {
        vi: "Góc nhìn từ *đội ngũ Hexa AI*",
        en: "Insights from *the Hexa AI team*",
      },
      previewDesc: {
        vi: "Phân tích, hướng dẫn và xu hướng mới nhất về an ninh mạng và vận hành thông minh.",
        en: "Detection rules, incident write-ups and what we're seeing in the wild — from the team running the SOC.",
      },
    },
    cta: {
      title: {
        vi: "Bắt đầu hành trình bảo mật *AI-Native* ngay hôm nay",
        en: "See Hexa AI run on *your own* infrastructure",
      },
      desc: {
        vi: "Đặt lịch demo trực tiếp với chuyên gia của Hexa AI và xem nền tảng vận hành trên chính hạ tầng của bạn.",
        en: "Book a live demo with a Hexa AI expert and see the platform run on your own infrastructure.",
      },
    },
    contact: {
      eyebrow: { vi: "Liên hệ", en: "Contact" },
      title: {
        vi: "Sẵn sàng nâng cấp *an ninh mạng?*",
        en: "Tell us what you're *trying to protect*",
      },
      desc: {
        vi: "Đội ngũ chuyên gia của Hexa AI luôn sẵn sàng tư vấn giải pháp phù hợp với hạ tầng của bạn.",
        en: "Hexa AI's experts are ready to advise on the right solution for your infrastructure.",
      },
      email: "info@hexacyber.ai",
      office: { vi: "Việt Nam · Singapore", en: "Vietnam · Singapore" },
    },
  },

  solutions: [
    {
      slug: "nms",
      abbr: "NMS",
      iconKey: "network",
      gradient: "from-cyan-400 to-sky-500",
      category: { vi: "Giám sát hạ tầng", en: "Infrastructure monitoring" },
      name: { vi: "AI Network Management System", en: "AI Network Management System" },
      tagline: {
        vi: "Giám sát, dự đoán và tự động khắc phục hạ tầng mạng bằng AI — trong một bảng điều khiển.",
        en: "Monitor, predict and auto-remediate your network with AI — in a single console.",
      },
      summary: {
        vi: "Auto-discovery, topology trực quan, AIOps phát hiện bất thường và gợi ý khắc phục tự động cho hàng nghìn thiết bị đa nhà cung cấp.",
        en: "Auto-discovery, live topology and AIOps anomaly detection with auto-remediation for thousands of multi-vendor devices.",
      },
      overview: {
        vi: "NMS của Hexa AI mang đến khả năng quan sát toàn diện cho hạ tầng mạng — từ switch, router, firewall đến server và thiết bị IoT. Lõi AIOps học hành vi bình thường của mạng để phát hiện bất thường sớm, dự đoán sự cố trước khi xảy ra và gợi ý (hoặc tự động) khắc phục, thay vì chỉ cảnh báo thụ động.",
        en: "Hexa AI's NMS delivers complete visibility across your network — from switches, routers and firewalls to servers and IoT devices. An AIOps core learns your network's normal behavior to surface anomalies early, predict incidents before they happen and recommend (or auto-apply) fixes — not just passive alerts.",
      },
      features: [
        {
          title: { vi: "AIOps & dự đoán sự cố", en: "AIOps & incident prediction" },
          desc: {
            vi: "AI học baseline lưu lượng, phát hiện bất thường và dự báo nghẽn/sự cố trước khi ảnh hưởng người dùng.",
            en: "AI learns traffic baselines, flags anomalies and forecasts congestion/outages before users are hit.",
          },
        },
        {
          title: { vi: "Auto-discovery đa nhà cung cấp", en: "Multi-vendor auto-discovery" },
          desc: {
            vi: "Phát hiện và phân loại thiết bị qua SNMP, ICMP, API với thư viện vendor profile phong phú.",
            en: "Discover and classify devices via SNMP, ICMP and APIs with a rich vendor-profile library.",
          },
        },
        {
          title: { vi: "Topology trực quan", en: "Live topology" },
          desc: {
            vi: "Sơ đồ mạng kéo-thả, hiển thị liên kết và lan truyền sự cố theo thời gian thực.",
            en: "Drag-and-drop network maps showing links and incident propagation in real time.",
          },
        },
        {
          title: { vi: "Cảnh báo thông minh", en: "Smart alerting" },
          desc: {
            vi: "Ngưỡng động dựa trên AI giúp giảm nhiễu cảnh báo, gom nhóm sự kiện liên quan.",
            en: "AI-driven dynamic thresholds cut alert noise and correlate related events.",
          },
        },
        {
          title: { vi: "Phân tích lưu lượng", en: "Traffic analytics" },
          desc: {
            vi: "NetFlow/sFlow, phát hiện điểm nghẽn và bất thường băng thông.",
            en: "NetFlow/sFlow analysis to spot bottlenecks and bandwidth anomalies.",
          },
        },
      ],
      outcomes: [
        { vi: "Giảm 60% thời gian khoanh vùng sự cố mạng", en: "60% faster network incident isolation" },
        { vi: "Một bảng điều khiển cho hạ tầng đa site", en: "One console for multi-site infrastructure" },
        { vi: "Báo cáo SLA & năng lực tự động", en: "Automated SLA & capacity reporting" },
      ],
      aiHighlight: {
        title: {
          vi: "AIOps — Vận hành mạng tự lái",
          en: "AIOps — The self-driving network",
        },
        desc: {
          vi: "Lõi AIOps biến NMS từ công cụ giám sát thụ động thành trợ lý vận hành chủ động: học hành vi mạng, dự đoán sự cố và tự động khắc phục.",
          en: "An AIOps core turns NMS from a passive monitor into a proactive operations copilot: it learns your network, predicts incidents and remediates automatically.",
        },
        points: [
          {
            title: { vi: "Phát hiện bất thường", en: "Anomaly detection" },
            desc: {
              vi: "Học baseline lưu lượng & hành vi thiết bị, phát hiện lệch chuẩn theo thời gian thực — không cần đặt ngưỡng thủ công.",
              en: "Learns traffic & device baselines and flags deviations in real time — no manual thresholds.",
            },
          },
          {
            title: { vi: "Dự đoán sự cố", en: "Predictive incidents" },
            desc: {
              vi: "Cảnh báo nghẽn băng thông, suy giảm thiết bị và nguy cơ gián đoạn trước khi người dùng bị ảnh hưởng.",
              en: "Forecasts congestion, device degradation and outage risk before users are affected.",
            },
          },
          {
            title: { vi: "Tự động khắc phục", en: "Auto-remediation" },
            desc: {
              vi: "Gợi ý hoặc tự chạy playbook khắc phục (reroute, cô lập, khởi động lại dịch vụ) và gom nhóm sự kiện liên quan.",
              en: "Recommends or runs remediation playbooks (reroute, isolate, restart) and correlates related events.",
            },
          },
          {
            title: { vi: "Copilot ngôn ngữ tự nhiên", en: "Natural-language copilot" },
            desc: {
              vi: "Hỏi đáp về hạ tầng bằng tiếng Việt/Anh: “thiết bị nào đang quá tải?”, “nguyên nhân gốc của sự cố EDGE-02?”.",
              en: "Ask your infrastructure in plain language: \"which devices are overloaded?\", \"root cause of the EDGE-02 incident?\".",
            },
          },
        ],
      },
    },
    {
      slug: "observability",
      abbr: "OBS",
      iconKey: "activity",
      gradient: "from-emerald-400 to-teal-500",
      category: { vi: "Giám sát hạ tầng", en: "Infrastructure monitoring" },
      name: { vi: "Observability", en: "Observability" },
      tagline: {
        vi: "Metrics, logs và traces hợp nhất — hiểu hệ thống trước khi nó hỏng.",
        en: "Unified metrics, logs and traces — understand systems before they break.",
      },
      summary: {
        vi: "Nền tảng quan sát full-stack với correlation AI giữa hạ tầng, ứng dụng và trải nghiệm người dùng.",
        en: "Full-stack observability with AI correlation across infrastructure, applications and user experience.",
      },
      overview: {
        vi: "Observability của Hexa AI thu thập metrics, logs và distributed traces trên toàn bộ stack, sau đó dùng AI để tương quan tín hiệu và chỉ ra nguyên nhân gốc rễ. Đội vận hành chuyển từ phản ứng bị động sang chủ động ngăn chặn sự cố.",
        en: "Hexa AI's Observability collects metrics, logs and distributed traces across the whole stack, then uses AI to correlate signals and surface root causes — so teams fix the underlying fault instead of triaging the same alert twice.",
      },
      features: [
        {
          title: { vi: "Ba trụ cột hợp nhất", en: "Three pillars unified" },
          desc: {
            vi: "Metrics, logs, traces trong cùng một dòng thời gian, liên kết tự động.",
            en: "Metrics, logs and traces on one timeline, automatically linked.",
          },
        },
        {
          title: { vi: "Root-cause AI", en: "AI root-cause" },
          desc: {
            vi: "Mô hình phát hiện bất thường và truy vết chuỗi nguyên nhân chỉ trong vài giây.",
            en: "Anomaly-detection models trace the causal chain in seconds.",
          },
        },
        {
          title: { vi: "SLO & error budget", en: "SLO & error budget" },
          desc: {
            vi: "Theo dõi mục tiêu dịch vụ, cảnh báo khi tiêu hao ngân sách lỗi.",
            en: "Track service objectives and alert as error budgets burn down.",
          },
        },
        {
          title: { vi: "OpenTelemetry-native", en: "OpenTelemetry-native" },
          desc: {
            vi: "Tương thích chuẩn mở, không khoá nhà cung cấp.",
            en: "Open-standard compatible — no vendor lock-in.",
          },
        },
      ],
      outcomes: [
        {
          vi: "Phát hiện suy giảm hiệu năng trước khi người dùng nhận ra",
          en: "Catch degradations before users notice",
        },
        { vi: "Giảm MTTR nhờ truy vết nguyên nhân tự động", en: "Lower MTTR via automated root-cause" },
        { vi: "Mở rộng đến hàng tỷ data point/ngày", en: "Scales to billions of data points per day" },
      ],
    },
    {
      slug: "siem",
      abbr: "SIEM",
      iconKey: "radar",
      gradient: "from-indigo-400 to-blue-500",
      category: { vi: "Phát hiện mối đe doạ", en: "Threat detection" },
      name: {
        vi: "Security Information & Event Management",
        en: "Security Information & Event Management",
      },
      tagline: {
        vi: "Thu thập, tương quan và săn tìm mối đe doạ trên toàn bộ dữ liệu bảo mật.",
        en: "Collect, correlate and hunt threats across all your security data.",
      },
      summary: {
        vi: "Phân tích log tập trung với rule correlation, threat intelligence và phát hiện hành vi bất thường dựa trên ML.",
        en: "Centralized log analytics with rule correlation, threat intelligence and ML-based anomaly detection.",
      },
      overview: {
        vi: "SIEM của Hexa AI tổng hợp sự kiện bảo mật từ mọi nguồn — endpoint, mạng, cloud, ứng dụng — chuẩn hoá và tương quan để biến hàng triệu log thành cảnh báo có thể hành động. Kết hợp threat intelligence và UEBA để bắt cả mối đe doạ chưa từng biết.",
        en: "Hexa AI's SIEM aggregates security events from every source — endpoints, network, cloud and apps — normalizing and correlating them to turn millions of logs into actionable alerts. Threat intelligence and UEBA catch even unknown threats.",
      },
      features: [
        {
          title: { vi: "Correlation thời gian thực", en: "Real-time correlation" },
          desc: {
            vi: "Hàng trăm rule dựng sẵn theo MITRE ATT&CK, tuỳ biến không giới hạn.",
            en: "Hundreds of prebuilt MITRE ATT&CK rules, infinitely customizable.",
          },
        },
        {
          title: { vi: "UEBA", en: "UEBA" },
          desc: {
            vi: "Phân tích hành vi người dùng & thực thể để phát hiện insider threat.",
            en: "User & entity behavior analytics to detect insider threats.",
          },
        },
        {
          title: { vi: "Threat Intelligence", en: "Threat intelligence" },
          desc: {
            vi: "Làm giàu sự kiện với feed IOC toàn cầu và nội bộ.",
            en: "Enrich events with global and internal IOC feeds.",
          },
        },
        {
          title: { vi: "Compliance dựng sẵn", en: "Built-in compliance" },
          desc: {
            vi: "Báo cáo PCI-DSS, ISO 27001, GDPR, NIST chỉ với vài cú nhấp.",
            en: "PCI-DSS, ISO 27001, GDPR and NIST reports in a few clicks.",
          },
        },
      ],
      outcomes: [
        { vi: "Tập trung 100% log bảo mật vào một nơi", en: "Centralize 100% of security logs" },
        { vi: "Ánh xạ tự động theo MITRE ATT&CK", en: "Automatic MITRE ATT&CK mapping" },
        { vi: "Rút ngắn điều tra từ giờ xuống phút", en: "Cut investigations from hours to minutes" },
      ],
    },
    {
      slug: "ndr",
      abbr: "NDR",
      iconKey: "siren",
      gradient: "from-accent to-accent-strong",
      category: { vi: "Threat detection", en: "Threat detection" },
      name: { vi: "Network Detection & Response", en: "Network Detection & Response" },
      tagline: {
        vi: "See every packet. Expose the threats hiding in your network traffic.",
        en: "See every packet. Expose the threats hiding in your network traffic.",
      },
      summary: {
        vi: "AI-driven analysis of north-south and east-west traffic to surface lateral movement, exfiltration and stealthy threats.",
        en: "AI-driven analysis of north-south and east-west traffic to surface lateral movement, exfiltration and stealthy threats.",
      },
      overview: {
        vi: "Hexa AI's NDR continuously analyzes network traffic across your entire estate — north-south at the perimeter and east-west between workloads. Machine-learning models baseline normal behavior and expose lateral movement, command-and-control, data exfiltration and living-off-the-land techniques that never touch an endpoint agent.",
        en: "Hexa AI's NDR continuously analyzes network traffic across your entire estate — north-south at the perimeter and east-west between workloads. Machine-learning models baseline normal behavior and expose lateral movement, command-and-control, data exfiltration and living-off-the-land techniques that never touch an endpoint agent.",
      },
      features: [
        {
          title: { vi: "Full-traffic analysis", en: "Full-traffic analysis" },
          desc: {
            vi: "Inspect north-south and east-west flows with no agents and no blind spots.",
            en: "Inspect north-south and east-west flows with no agents and no blind spots.",
          },
        },
        {
          title: { vi: "Behavioral ML detection", en: "Behavioral ML detection" },
          desc: {
            vi: "Baseline normal traffic and flag deviations — including previously unknown threats.",
            en: "Baseline normal traffic and flag deviations — including previously unknown threats.",
          },
        },
        {
          title: { vi: "Lateral-movement tracing", en: "Lateral-movement tracing" },
          desc: {
            vi: "Follow an attacker as they pivot between hosts and network segments.",
            en: "Follow an attacker as they pivot between hosts and network segments.",
          },
        },
        {
          title: { vi: "Encrypted-traffic analytics", en: "Encrypted-traffic analytics" },
          desc: {
            vi: "Detect malicious patterns inside encrypted flows without decryption.",
            en: "Detect malicious patterns inside encrypted flows without decryption.",
          },
        },
      ],
      outcomes: [
        { vi: "Expose threats that evade endpoint and perimeter tools", en: "Expose threats that evade endpoint and perimeter tools" },
        { vi: "Reconstruct the full attacker kill-chain across the network", en: "Reconstruct the full attacker kill-chain across the network" },
        { vi: "Retain full-fidelity traffic metadata for investigation", en: "Retain full-fidelity traffic metadata for investigation" },
      ],
    },
    {
      slug: "edr",
      abbr: "EDR",
      iconKey: "monitor",
      gradient: "from-violet-400 to-purple-500",
      category: { vi: "Phát hiện mối đe doạ", en: "Threat detection" },
      name: { vi: "Endpoint Detection & Response", en: "Endpoint Detection & Response" },
      tagline: {
        vi: "Bảo vệ, phát hiện và phản ứng ngay trên từng endpoint.",
        en: "Protect, detect and respond right at every endpoint.",
      },
      summary: {
        vi: "Agent nhẹ giám sát liên tục tiến trình, file, registry và mạng — chặn ransomware và tự động cô lập thiết bị bị nhiễm.",
        en: "A lightweight agent that watches processes, files, registry and network — blocking ransomware and isolating infected hosts automatically.",
      },
      overview: {
        vi: "EDR của Hexa AI triển khai agent nhẹ trên endpoint để ghi nhận telemetry chi tiết, phát hiện hành vi tấn công bằng AI và phản ứng tức thì: cô lập máy, kết thúc tiến trình độc hại, rollback thay đổi do ransomware.",
        en: "Hexa AI's EDR deploys a lightweight endpoint agent to record rich telemetry, detect attack behavior with AI and respond instantly: isolate hosts, kill malicious processes and roll back ransomware changes.",
      },
      features: [
        {
          title: { vi: "Phát hiện hành vi", en: "Behavioral detection" },
          desc: {
            vi: "Mô hình ML nhận diện kỹ thuật tấn công thay vì chỉ dựa vào chữ ký.",
            en: "ML models recognize attack techniques, not just signatures.",
          },
        },
        {
          title: { vi: "Phản ứng tự động", en: "Automated response" },
          desc: {
            vi: "Cô lập mạng, kill process, cách ly file chỉ trong một thao tác.",
            en: "Network isolation, process kill and file quarantine in one action.",
          },
        },
        {
          title: { vi: "Rollback ransomware", en: "Ransomware rollback" },
          desc: {
            vi: "Khôi phục file bị mã hoá từ bản chụp được bảo vệ.",
            en: "Restore encrypted files from protected snapshots.",
          },
        },
        {
          title: { vi: "Threat hunting", en: "Threat hunting" },
          desc: {
            vi: "Truy vấn telemetry lịch sử để săn tìm dấu vết tấn công.",
            en: "Query historical telemetry to hunt for attacker footprints.",
          },
        },
      ],
      outcomes: [
        { vi: "Chặn ransomware trước khi lan rộng", en: "Stop ransomware before it spreads" },
        { vi: "Telemetry chi tiết cho điều tra forensic", en: "Rich telemetry for forensic investigation" },
        { vi: "Triển khai hàng vạn endpoint từ một console", en: "Deploy tens of thousands of endpoints from one console" },
      ],
    },
    {
      slug: "soar",
      abbr: "SOAR",
      iconKey: "zap",
      gradient: "from-accent to-accent-strong",
      category: { vi: "Automation & response", en: "Automation & response" },
      name: {
        vi: "Security Orchestration, Automation & Response",
        en: "Security Orchestration, Automation & Response",
      },
      tagline: {
        vi: "Turn manual playbooks into instant, automated action.",
        en: "Turn manual playbooks into instant, automated action.",
      },
      summary: {
        vi: "Codify response playbooks that orchestrate every security tool and cut mean-time-to-respond from hours to seconds.",
        en: "Codify response playbooks that orchestrate every security tool and cut mean-time-to-respond from hours to seconds.",
      },
      overview: {
        vi: "Hexa AI's SOAR connects your entire security stack — SIEM, EDR, NDR, firewalls and ticketing — behind drag-and-drop playbooks. When a threat is confirmed, response runs at machine speed: enrich, contain, remediate and notify, keeping humans in the loop only where real judgment is required.",
        en: "Hexa AI's SOAR connects your entire security stack — SIEM, EDR, NDR, firewalls and ticketing — behind drag-and-drop playbooks. When a threat is confirmed, response runs at machine speed: enrich, contain, remediate and notify, keeping humans in the loop only where real judgment is required.",
      },
      features: [
        {
          title: { vi: "Drag-and-drop playbooks", en: "Drag-and-drop playbooks" },
          desc: {
            vi: "Build and version response workflows visually — no code required.",
            en: "Build and version response workflows visually — no code required.",
          },
        },
        {
          title: { vi: "Cross-tool orchestration", en: "Cross-tool orchestration" },
          desc: {
            vi: "Coordinate actions across SIEM, EDR, NDR, firewalls and ticketing.",
            en: "Coordinate actions across SIEM, EDR, NDR, firewalls and ticketing.",
          },
        },
        {
          title: { vi: "Automated triage & enrichment", en: "Automated triage & enrichment" },
          desc: {
            vi: "Auto-enrich alerts with threat intelligence and dismiss the noise.",
            en: "Auto-enrich alerts with threat intelligence and dismiss the noise.",
          },
        },
        {
          title: { vi: "Case management", en: "Case management" },
          desc: {
            vi: "Track incidents end-to-end with a full, auditable timeline.",
            en: "Track incidents end-to-end with a full, auditable timeline.",
          },
        },
      ],
      outcomes: [
        { vi: "Cut MTTR from hours to seconds", en: "Cut MTTR from hours to seconds" },
        { vi: "Consistent, repeatable response every time", en: "Consistent, repeatable response every time" },
        { vi: "Free analysts from repetitive manual work", en: "Free analysts from repetitive manual work" },
      ],
    },
  ],

  services: [
    {
      slug: "soc",
      abbr: "SOC",
      iconKey: "headphones",
      gradient: "from-amber-400 to-orange-500",
      category: { vi: "Vận hành quản trị", en: "Managed operations" },
      name: { vi: "Security Operations Center", en: "Security Operations Center" },
      tagline: {
        vi: "Đội ngũ chuyên gia giám sát, điều tra và phản ứng 24/7 thay bạn.",
        en: "Experts monitoring, investigating and responding 24/7 on your behalf.",
      },
      summary: {
        vi: "SOC-as-a-Service kết hợp con người, quy trình và AI — giám sát liên tục, săn tìm mối đe doạ và ứng cứu sự cố.",
        en: "SOC-as-a-Service blending people, process and AI — continuous monitoring, threat hunting and incident response.",
      },
      overview: {
        vi: "SOC của Hexa AI cung cấp năng lực vận hành bảo mật trọn gói: giám sát 24/7, phân loại cảnh báo, săn tìm mối đe doạ chủ động và điều phối ứng cứu sự cố. Kết hợp SOAR để tự động hoá playbook và rút ngắn thời gian phản ứng.",
        en: "Hexa AI's SOC delivers end-to-end security operations: 24/7 monitoring, alert triage, proactive threat hunting and incident-response coordination — with SOAR automating playbooks to shorten response time.",
      },
      features: [
        {
          title: { vi: "Giám sát 24/7", en: "24/7 monitoring" },
          desc: {
            vi: "Đội analyst trực liên tục, không bỏ sót cảnh báo nào.",
            en: "Analysts on watch around the clock — no alert missed.",
          },
        },
        {
          title: { vi: "SOAR playbook", en: "SOAR playbooks" },
          desc: {
            vi: "Tự động hoá quy trình ứng cứu, phản ứng nhất quán và nhanh chóng.",
            en: "Automated response workflows for fast, consistent action.",
          },
        },
        {
          title: { vi: "Threat hunting chủ động", en: "Proactive threat hunting" },
          desc: {
            vi: "Tìm kiếm mối đe doạ tiềm ẩn trước khi chúng kích hoạt.",
            en: "Seek out latent threats before they detonate.",
          },
        },
        {
          title: { vi: "Báo cáo điều hành", en: "Executive reporting" },
          desc: {
            vi: "Dashboard và báo cáo định kỳ cho lãnh đạo và tuân thủ.",
            en: "Dashboards and periodic reports for leadership and compliance.",
          },
        },
      ],
      outcomes: [
        { vi: "Năng lực SOC cấp doanh nghiệp không cần tự xây", en: "Enterprise-grade SOC without building one" },
        { vi: "MTTD < 60 giây, MTTR tính bằng phút", en: "MTTD under 60s, MTTR in minutes" },
        { vi: "Báo cáo tuân thủ & điều hành sẵn sàng", en: "Compliance & executive reports ready to go" },
      ],
    },
    {
      slug: "pentest",
      abbr: "Pentest",
      iconKey: "crosshair",
      gradient: "from-fuchsia-400 to-pink-500",
      category: { vi: "Tấn công chủ động", en: "Offensive security" },
      name: { vi: "Penetration Testing", en: "Penetration Testing" },
      tagline: {
        vi: "Tìm ra lỗ hổng trước khi kẻ tấn công làm điều đó.",
        en: "Find your vulnerabilities before attackers do.",
      },
      summary: {
        vi: "Kiểm thử xâm nhập web, mobile, API, hạ tầng và cloud theo chuẩn OWASP & PTES, kèm báo cáo khắc phục chi tiết.",
        en: "Web, mobile, API, infrastructure and cloud penetration testing per OWASP & PTES, with detailed remediation reports.",
      },
      overview: {
        vi: "Dịch vụ Pentest của Hexa AI mô phỏng kỹ thuật của kẻ tấn công thực thụ để đánh giá khả năng phòng thủ của bạn. Chuyên gia được chứng nhận OSCP/OSWE/OSEP thực hiện kiểm thử thủ công chuyên sâu, loại bỏ false positive và cung cấp PoC kèm hướng dẫn vá.",
        en: "Hexa AI's Pentest service emulates real attacker techniques to assess your defenses. OSCP/OSWE/OSEP-certified experts run deep manual testing, eliminate false positives and deliver proof-of-concept exploits with remediation guidance.",
      },
      features: [
        {
          title: { vi: "Kiểm thử thủ công chuyên sâu", en: "Deep manual testing" },
          desc: {
            vi: "Web, mobile, API, hạ tầng và cloud theo chuẩn OWASP & PTES.",
            en: "Web, mobile, API, infra and cloud per OWASP & PTES.",
          },
        },
        {
          title: { vi: "Chuyên gia được chứng nhận", en: "Certified experts" },
          desc: {
            vi: "Thực hiện bởi đội ngũ giữ chứng chỉ OSCP, OSWE, OSEP, OSED.",
            en: "Performed by OSCP, OSWE, OSEP and OSED holders.",
          },
        },
        {
          title: { vi: "PoC & xác thực", en: "PoC & validation" },
          desc: {
            vi: "Mọi phát hiện đều có proof-of-concept, loại bỏ false positive.",
            en: "Every finding has a proof-of-concept — no false positives.",
          },
        },
        {
          title: { vi: "Báo cáo khắc phục", en: "Remediation report" },
          desc: {
            vi: "Xếp hạng rủi ro và hướng dẫn vá chi tiết theo mức ưu tiên.",
            en: "Risk-ranked findings with prioritized, detailed fix guidance.",
          },
        },
      ],
      outcomes: [
        { vi: "Phát hiện lỗ hổng trước kẻ tấn công", en: "Discover vulnerabilities before attackers" },
        { vi: "Đáp ứng yêu cầu kiểm thử của tiêu chuẩn tuân thủ", en: "Meet compliance pentest requirements" },
        { vi: "Báo cáo sẵn sàng cho khách hàng & kiểm toán", en: "Reports ready for customers & auditors" },
      ],
    },
    {
      slug: "red-team",
      abbr: "Red Team",
      iconKey: "swords",
      gradient: "from-red-400 to-rose-600",
      category: { vi: "Tấn công chủ động", en: "Offensive security" },
      name: { vi: "Red Teaming", en: "Red Teaming" },
      tagline: {
        vi: "Mô phỏng tấn công thực chiến đa giai đoạn — kiểm chứng năng lực phòng thủ.",
        en: "Multi-stage adversary simulation — validate your defenses for real.",
      },
      summary: {
        vi: "Chiến dịch red team theo kịch bản đối thủ thực, kiểm tra cả con người, quy trình và công nghệ — bao gồm cả social engineering.",
        en: "Real-adversary red-team campaigns testing people, process and technology — including social engineering.",
      },
      overview: {
        vi: "Red Teaming của Hexa AI mô phỏng một kẻ tấn công thực thụ với mục tiêu cụ thể, qua nhiều giai đoạn: trinh sát, xâm nhập ban đầu, leo thang, di chuyển ngang và đánh cắp dữ liệu. Đội ngũ giữ chứng chỉ CRTO/CRTL kiểm chứng năng lực phát hiện và phản ứng của Blue Team.",
        en: "Hexa AI's Red Teaming emulates a determined adversary with a concrete objective across multiple stages: recon, initial access, escalation, lateral movement and exfiltration. CRTO/CRTL-certified operators validate how well your Blue Team detects and responds.",
      },
      features: [
        {
          title: { vi: "Kịch bản đối thủ thực", en: "Real adversary scenarios" },
          desc: {
            vi: "Mô phỏng TTP theo MITRE ATT&CK của các nhóm APT thực tế.",
            en: "Emulate real APT TTPs mapped to MITRE ATT&CK.",
          },
        },
        {
          title: { vi: "Đa vector", en: "Multi-vector" },
          desc: {
            vi: "Kết hợp tấn công kỹ thuật, vật lý và social engineering.",
            en: "Combine technical, physical and social-engineering attacks.",
          },
        },
        {
          title: { vi: "Purple team", en: "Purple teaming" },
          desc: {
            vi: "Phối hợp cùng Blue Team để cải thiện khả năng phát hiện.",
            en: "Collaborate with the Blue Team to improve detection.",
          },
        },
        {
          title: { vi: "Báo cáo theo kill-chain", en: "Kill-chain report" },
          desc: {
            vi: "Tái hiện từng bước tấn công kèm khuyến nghị phòng thủ.",
            en: "Reconstruct each attack step with defensive recommendations.",
          },
        },
      ],
      outcomes: [
        { vi: "Kiểm chứng năng lực phát hiện & phản ứng thực tế", en: "Validate real detection & response capability" },
        { vi: "Phát hiện lỗ hổng quy trình và con người", en: "Expose process and human weaknesses" },
        { vi: "Nâng cao năng lực Blue Team qua purple teaming", en: "Upskill the Blue Team via purple teaming" },
      ],
    },
    {
      slug: "grc",
      abbr: "GRC",
      iconKey: "clipboard",
      gradient: "from-teal-400 to-emerald-500",
      category: { vi: "Tư vấn tuân thủ", en: "Compliance advisory" },
      name: { vi: "Governance, Risk & Compliance", en: "Governance, Risk & Compliance" },
      tagline: {
        vi: "Đạt chứng nhận ISO 27001:2022 và SOC 2 Type 2 — nhanh và bền vững.",
        en: "Achieve ISO 27001:2022 and SOC 2 Type 2 — fast and sustainably.",
      },
      summary: {
        vi: "Tư vấn xây dựng hệ thống quản lý an toàn thông tin, đánh giá rủi ro và đồng hành đạt chứng nhận ISO 27001:2022, SOC 2 Type 2.",
        en: "Advisory to build your information-security management system, assess risk and reach ISO 27001:2022 and SOC 2 Type 2 certification.",
      },
      overview: {
        vi: "Dịch vụ GRC của Hexa AI đồng hành cùng tổ chức từ đánh giá khoảng cách (gap assessment), xây dựng chính sách & quy trình, triển khai kiểm soát đến chuẩn bị kiểm toán cho ISO 27001:2022 và SOC 2 Type 2. Chúng tôi biến tuân thủ thành lợi thế kinh doanh thực sự, không chỉ là tấm chứng chỉ.",
        en: "Hexa AI's GRC service walks you from gap assessment, policy and process design and control implementation through audit readiness for ISO 27001:2022 and SOC 2 Type 2. We turn compliance into a real business advantage — not just a certificate.",
      },
      features: [
        {
          title: { vi: "Gap assessment", en: "Gap assessment" },
          desc: {
            vi: "Đánh giá hiện trạng so với yêu cầu của tiêu chuẩn.",
            en: "Assess your current state against the standard's requirements.",
          },
        },
        {
          title: { vi: "ISMS & chính sách", en: "ISMS & policies" },
          desc: {
            vi: "Xây dựng hệ thống quản lý ATTT, chính sách và quy trình.",
            en: "Build your ISMS, policies and operating procedures.",
          },
        },
        {
          title: { vi: "Quản trị rủi ro", en: "Risk management" },
          desc: {
            vi: "Phương pháp luận đánh giá và xử lý rủi ro theo chuẩn.",
            en: "Standards-based risk assessment and treatment methodology.",
          },
        },
        {
          title: { vi: "Sẵn sàng kiểm toán", en: "Audit readiness" },
          desc: {
            vi: "Chuẩn bị bằng chứng, diễn tập và đồng hành kỳ kiểm toán.",
            en: "Evidence preparation, mock audits and audit support.",
          },
        },
      ],
      outcomes: [
        { vi: "Đạt ISO 27001:2022 & SOC 2 Type 2", en: "Achieve ISO 27001:2022 & SOC 2 Type 2" },
        { vi: "Rút ngắn thời gian & chi phí chứng nhận", en: "Cut certification time and cost" },
        { vi: "Tăng niềm tin của khách hàng & đối tác", en: "Build customer and partner trust" },
      ],
    },
  ],

  certGroups: [
    {
      key: "offensive",
      iconKey: "crosshair",
      gradient: "from-fuchsia-400 to-pink-500",
      title: { vi: "Offensive Security (OffSec)", en: "Offensive Security (OffSec)" },
      desc: {
        vi: "Bộ chứng chỉ thực hành khắc nghiệt nhất ngành — thi 24–48 giờ, khai thác thật, không trắc nghiệm.",
        en: "The industry's most punishing hands-on certs — 24–48 hour exams, real exploitation, zero multiple-choice.",
      },
      items: [
        {
          code: "OSCP",
          logoUrl: "/certs/oscp.png",
          issuer: "OffSec",
          elite: true,
          name: { vi: "Offensive Security Certified Professional", en: "Offensive Security Certified Professional" },
          blurb: {
            vi: "Chứng chỉ pentest thực hành danh giá: khai thác và leo thang trong phòng lab 24 giờ.",
            en: "The renowned hands-on pentest cert: exploit and escalate across a 24-hour lab.",
          },
        },
        {
          code: "OSWE",
          logoUrl: "/certs/oswe.svg",
          issuer: "OffSec",
          elite: true,
          name: { vi: "Offensive Security Web Expert", en: "Offensive Security Web Expert" },
          blurb: {
            vi: "Chuyên gia khai thác lỗ hổng ứng dụng web ở mức whitebox, viết exploit tự động.",
            en: "Expert-level white-box web exploitation and automated exploit development.",
          },
        },
        {
          code: "OSEP",
          logoUrl: "/certs/osep.svg",
          issuer: "OffSec",
          elite: true,
          name: { vi: "Offensive Security Experienced Penetration Tester", en: "Offensive Security Experienced Penetration Tester" },
          blurb: {
            vi: "Kỹ thuật né tránh phòng thủ nâng cao và tấn công Active Directory.",
            en: "Advanced defense-evasion techniques and Active Directory attacks.",
          },
        },
        {
          code: "OSED",
          logoUrl: "/certs/osed.svg",
          issuer: "OffSec",
          elite: true,
          name: { vi: "Offensive Security Exploit Developer", en: "Offensive Security Exploit Developer" },
          blurb: {
            vi: "Phát triển exploit Windows: tràn bộ đệm, vượt DEP/ASLR, viết shellcode.",
            en: "Windows exploit development: buffer overflows, DEP/ASLR bypass and shellcode.",
          },
        },
      ],
    },
    {
      key: "redteam",
      iconKey: "swords",
      gradient: "from-red-400 to-rose-600",
      title: { vi: "Red Teaming", en: "Red Teaming" },
      desc: {
        vi: "Năng lực điều hành chiến dịch tấn công đa giai đoạn mô phỏng đối thủ thực.",
        en: "Capability to run multi-stage adversary-emulation campaigns.",
      },
      items: [
        {
          code: "CRTO",
          logoUrl: "/certs/crto.png",
          issuer: "Zero-Point Security",
          name: { vi: "Certified Red Team Operator", en: "Certified Red Team Operator" },
          blurb: {
            vi: "Vận hành C2, tấn công Active Directory và né tránh EDR trong chiến dịch red team.",
            en: "C2 operations, Active Directory attacks and EDR evasion in red-team campaigns.",
          },
        },
        {
          code: "CRTL",
          logoUrl: "/certs/crtl.png",
          issuer: "Zero-Point Security",
          elite: true,
          name: { vi: "Certified Red Team Lead", en: "Certified Red Team Lead" },
          blurb: {
            vi: "Dẫn dắt chiến dịch red team, phát triển công cụ và malleable C2 nâng cao.",
            en: "Lead red-team engagements with advanced tooling and malleable C2 development.",
          },
        },
      ],
    },
    {
      key: "governance",
      iconKey: "shield-check",
      gradient: "from-indigo-400 to-blue-500",
      title: { vi: "Quản trị & Lãnh đạo", en: "Governance & Leadership" },
      desc: {
        vi: "Năng lực thiết kế, quản trị và lãnh đạo chương trình an ninh thông tin toàn diện.",
        en: "Designing, governing and leading enterprise-wide security programs.",
      },
      items: [
        {
          code: "CISSP",
          logoUrl: "/certs/cissp.png",
          issuer: "(ISC)²",
          elite: true,
          name: { vi: "Certified Information Systems Security Professional", en: "Certified Information Systems Security Professional" },
          blurb: {
            vi: "Chuẩn vàng về quản trị an ninh thông tin trên 8 lĩnh vực kiến thức (CBK).",
            en: "The gold standard in security management across 8 knowledge domains (CBK).",
          },
        },
      ],
    },
    {
      key: "ethical",
      iconKey: "bug",
      gradient: "from-amber-400 to-orange-500",
      title: { vi: "Ethical Hacking", en: "Ethical Hacking" },
      desc: {
        vi: "Kiến thức nền tảng và thực hành về kỹ thuật tấn công có đạo đức.",
        en: "Foundational and hands-on knowledge of ethical-hacking techniques.",
      },
      items: [
        {
          code: "CEH Master",
          logoUrl: "/certs/ceh-master.svg",
          issuer: "EC-Council",
          name: { vi: "Certified Ethical Hacker (Master)", en: "Certified Ethical Hacker (Master)" },
          blurb: {
            vi: "Chứng nhận ethical hacking kèm kỳ thi thực hành (CEH Practical).",
            en: "Ethical-hacking certification paired with a hands-on practical exam.",
          },
        },
      ],
    },
    {
      key: "network",
      iconKey: "network",
      gradient: "from-cyan-400 to-sky-500",
      title: { vi: "Mạng & Hạ tầng", en: "Network & Infrastructure" },
      desc: {
        vi: "Chuyên môn sâu về thiết kế, vận hành và bảo mật hạ tầng mạng doanh nghiệp.",
        en: "Deep expertise in designing, operating and securing enterprise networks.",
      },
      items: [
        {
          code: "CCNP",
          logoUrl: "/certs/ccnp.png",
          issuer: "Cisco",
          name: { vi: "Cisco Certified Network Professional", en: "Cisco Certified Network Professional" },
          blurb: {
            vi: "Chuyên gia triển khai và vận hành hạ tầng mạng doanh nghiệp phức tạp.",
            en: "Professional-level deployment and operation of complex enterprise networks.",
          },
        },
      ],
    },
  ],
}
