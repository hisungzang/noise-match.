const { useState, useEffect, useRef } = React;

// --- INITIAL MOCK DATA ---
const INITIAL_CAFES = [
  {
    cafe_id: "cafe-1",
    name: "스타벅스 신촌독수리광장점",
    address: "서울특별시 서대문구 연세로 12",
    lat: 37.5585,
    lng: 126.9365,
    outlet_status: "ALL", // ALL, PARTIAL, NONE
    wifi_available: true,
    open_hours: { weekday: "07:00 - 23:00", weekend: "08:00 - 22:00" },
    // Live metrics (will be loaded/updated from localStorage if present)
    noise_grade: 1, // 1 (Quiet), 2 (Moderate), 3 (Loud)
    db_value: 42.5,
    congestion: "SPACIOUS", // SPACIOUS, MODERATE, CROWDED
    last_reported: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
  },
  {
    cafe_id: "cafe-2",
    name: "투썸플레이스 신촌연세로점",
    address: "서울특별시 서대문구 연세로 28",
    lat: 37.5598,
    lng: 126.9362,
    outlet_status: "PARTIAL",
    wifi_available: true,
    open_hours: { weekday: "08:00 - 24:00", weekend: "08:00 - 24:00" },
    noise_grade: 2,
    db_value: 54.8,
    congestion: "MODERATE",
    last_reported: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
  },
  {
    cafe_id: "cafe-3",
    name: "할리스 신촌점",
    address: "서울특별시 서대문구 연세로 34",
    lat: 37.5612,
    lng: 126.9358,
    outlet_status: "ALL",
    wifi_available: true,
    open_hours: { weekday: "00:00 - 24:00", weekend: "00:00 - 24:00" }, // 24 Hours
    noise_grade: 3,
    db_value: 68.2,
    congestion: "CROWDED",
    last_reported: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
  },
  {
    cafe_id: "cafe-4",
    name: "카페 브라운칩 (개인카페)",
    address: "서울특별시 서대문구 연세로5다길 16",
    lat: 37.5578,
    lng: 126.9340,
    outlet_status: "PARTIAL",
    wifi_available: true,
    open_hours: { weekday: "09:00 - 22:00", weekend: "10:00 - 22:00" },
    noise_grade: 1,
    db_value: 38.1,
    congestion: "SPACIOUS",
    last_reported: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 90 mins ago (Expired -> greyed out)
  },
  {
    cafe_id: "cafe-5",
    name: "커피빈 신촌역점",
    address: "서울특별시 마포구 신촌로 94",
    lat: 37.5562,
    lng: 126.9378,
    outlet_status: "NONE",
    wifi_available: true,
    open_hours: { weekday: "08:00 - 22:30", weekend: "09:00 - 22:00" },
    noise_grade: 2,
    db_value: 58.4,
    congestion: "MODERATE",
    last_reported: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 mins ago
  }
];

const PRESET_USER = {
  email: "student@yonsei.ac.kr",
  nickname: "카공마스터지수",
  style_preferences: ["ST_QUIET", "ST_LOW_BGM"],
  outlet_preference: "REQUIRED"
};

// SVG Icon Pack Component
function Icon({ name, className = "w-5 h-5", ...props }) {
  const icons = {
    map: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />,
    list: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />,
    heart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    filter: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />,
    mic: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />,
    compass: <g><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></g>,
    clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    volume: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />,
    power: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    info: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    bell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    chevronLeft: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />,
    chevronRight: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />,
    wifi: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />, // Using power icon for wifi as fallback/simplification
    star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.18 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 10.1c-.773-.564-.374-1.81.588-1.81h4.908a1 1 0 00.95-.69l1.519-4.674z" />,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className={className}
      {...props}
    >
      {icons[name] || <circle cx="12" cy="12" r="10" strokeWidth="2" />}
    </svg>
  );
}

// Main App Container
function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("nm_user");
    return saved ? JSON.parse(saved) : PRESET_USER;
  });
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem("nm_onboarded") === "true";
  });
  
  const [cafes, setCafes] = useState(() => {
    const saved = localStorage.getItem("nm_cafes");
    return saved ? JSON.parse(saved) : INITIAL_CAFES;
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("nm_favorites");
    return saved ? JSON.parse(saved) : ["cafe-1", "cafe-4"];
  });

  // State Management
  const [activeTab, setActiveTab] = useState("map"); // 'map', 'list', 'favorites', 'profile'
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  
  // Filters State
  const [filters, setFilters] = useState({
    outlet: "ALL_TYPES", // ALL_TYPES, ALL, PARTIAL, NONE
    noiseLevels: [], // [1, 2, 3]
    onlyOpen: true,
    congestions: [], // 'SPACIOUS', 'MODERATE', 'CROWDED'
    minMatchingRate: "ALL" // 'ALL', '80', '90'
  });

  // Map settings
  const [userLocation, setUserLocation] = useState({ lat: 37.5590, lng: 126.9360 }); // Sinschon Center
  const [searchRange, setSearchRange] = useState(1); // 1km, 0.5km, 2km
  const [searchQuery, setSearchQuery] = useState("");

  // Simulated Push Notifications
  const [notifications, setNotifications] = useState([]);
  
  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("nm_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("nm_cafes", JSON.stringify(cafes));
  }, [cafes]);

  useEffect(() => {
    localStorage.setItem("nm_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("nm_onboarded", isOnboarded);
  }, [isOnboarded]);

  // Handle Simulated Notification triggers
  const triggerNotification = (title, message) => {
    const newNotif = { id: Date.now(), title, message };
    setNotifications(prev => [newNotif, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 6000);
  };

  // WebSocket Server Simulation (Periodic live updates)
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random cafe and simulate someone reporting new data
      const randomCafeIndex = Math.floor(Math.random() * cafes.length);
      const targetCafe = cafes[randomCafeIndex];
      
      const randomNoiseGrade = Math.floor(Math.random() * 3) + 1;
      const dbBase = randomNoiseGrade === 1 ? 38 : randomNoiseGrade === 2 ? 55 : 72;
      const randomDb = parseFloat((dbBase + Math.random() * 8).toFixed(1));
      
      const congestions = ["SPACIOUS", "MODERATE", "CROWDED"];
      const randomCongestion = congestions[Math.floor(Math.random() * congestions.length)];

      // Construct update
      const updatedCafes = cafes.map((c, index) => {
        if (index === randomCafeIndex) {
          return {
            ...c,
            noise_grade: randomNoiseGrade,
            db_value: randomDb,
            congestion: randomCongestion,
            last_reported: new Date().toISOString()
          };
        }
        return c;
      });

      setCafes(updatedCafes);

      // Trigger user alerts if it's their favorite
      if (favorites.includes(targetCafe.cafe_id)) {
        let isImproved = false;
        let alertMessage = "";
        
        if (randomCongestion === "SPACIOUS" && targetCafe.congestion !== "SPACIOUS") {
          isImproved = true;
          alertMessage = `${targetCafe.name}이 여유로워졌어요! ☕`;
        } else if (randomNoiseGrade === 1 && targetCafe.noise_grade !== 1) {
          isImproved = true;
          alertMessage = `조용해졌어요! ${targetCafe.name} 지금 가기 딱 좋아요 😶`;
        }

        if (isImproved) {
          triggerNotification("매칭 알림", alertMessage);
        }
      }

    }, 25000); // Trigger every 25 seconds for nice dynamic feel

    return () => clearInterval(interval);
  }, [cafes, favorites]);

  // Helper matching rate algorithm (from PRD)
  const calculateMatchingRate = (cafe) => {
    // If noise data expired (more than 60 mins)
    const minutesSinceReport = (new Date() - new Date(cafe.last_reported)) / (1000 * 60);
    if (minutesSinceReport >= 60) return null; // "매칭률 계산 불가"

    let noiseScore = 0;
    let outletScore = 0;
    let congestionScore = 0;

    // 1. Noise Grade Score
    // User preference matching
    // Quiet preference (ST_QUIET) likes Grade 1.
    // Low BGM preference (ST_LOW_BGM) likes Grade 1-2.
    // White Noise/Crowd (ST_CROWD) likes Grade 2.
    // Lively atmosphere (ST_LIVELY) likes Grade 2-3.
    const userLikesNoise = [];
    if (user.style_preferences.includes("ST_QUIET")) userLikesNoise.push(1);
    if (user.style_preferences.includes("ST_LOW_BGM")) { userLikesNoise.push(1); userLikesNoise.push(2); }
    if (user.style_preferences.includes("ST_CROWD")) userLikesNoise.push(2);
    if (user.style_preferences.includes("ST_LIVELY")) { userLikesNoise.push(2); userLikesNoise.push(3); }

    const isMatch = userLikesNoise.includes(cafe.noise_grade);
    if (isMatch) {
      noiseScore = 100;
    } else {
      // Find closest distance in grades
      let minDiff = 3;
      userLikesNoise.forEach(grade => {
        const diff = Math.abs(grade - cafe.noise_grade);
        if (diff < minDiff) minDiff = diff;
      });
      noiseScore = minDiff === 1 ? 60 : 0;
    }

    // 2. Outlet Score
    if (user.outlet_preference === "REQUIRED") {
      if (cafe.outlet_status === "ALL") outletScore = 100;
      else if (cafe.outlet_status === "PARTIAL") outletScore = 50;
      else outletScore = 0;
    } else {
      outletScore = 100; // Not required, always satisfied
    }

    // 3. Congestion Score
    if (cafe.congestion === "SPACIOUS") congestionScore = 100;
    else if (cafe.congestion === "MODERATE") congestionScore = 70;
    else if (cafe.congestion === "CROWDED") congestionScore = 20;

    // Weight formula
    const finalRate = Math.round((noiseScore * 0.5) + (outletScore * 0.3) + (congestionScore * 0.2));
    return finalRate;
  };

  // Filter application
  const filteredCafes = cafes.filter(cafe => {
    // 1. Name query filter
    if (searchQuery && !cafe.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // 2. Distance filter (mock range slider simulation based on lat/lng)
    const distance = getDistance(userLocation.lat, userLocation.lng, cafe.lat, cafe.lng);
    if (distance > searchRange) return false;

    // 3. Outlet status filter
    if (filters.outlet !== "ALL_TYPES") {
      if (filters.outlet === "ALL" && cafe.outlet_status !== "ALL") return false;
      if (filters.outlet === "PARTIAL" && (cafe.outlet_status !== "ALL" && cafe.outlet_status !== "PARTIAL")) return false;
      if (filters.outlet === "NONE" && cafe.outlet_status !== "NONE") return false;
    }

    // 4. Noise filter
    if (filters.noiseLevels.length > 0 && !filters.noiseLevels.includes(cafe.noise_grade)) {
      return false;
    }

    // 5. Congestion filter
    if (filters.congestions.length > 0 && !filters.congestions.includes(cafe.congestion)) {
      return false;
    }

    // 6. Matching rate filter
    if (filters.minMatchingRate !== "ALL") {
      const rate = calculateMatchingRate(cafe);
      if (rate === null) return false; // Exclude expired/unknown from matches if user filters by it
      if (parseInt(filters.minMatchingRate) === 90 && rate < 90) return false;
      if (parseInt(filters.minMatchingRate) === 80 && rate < 80) return false;
    }

    return true;
  });

  // Sort cafes by matching score (default), distance, or quietest
  const sortedCafes = [...filteredCafes].sort((a, b) => {
    const rateA = calculateMatchingRate(a) || 0;
    const rateB = calculateMatchingRate(b) || 0;
    return rateB - rateA; // Highest matches first
  });

  // Calculate distance in km
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of earth
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Dist in km
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // Toggle favorite
  const toggleFavorite = (cafeId) => {
    if (favorites.includes(cafeId)) {
      setFavorites(favorites.filter(id => id !== cafeId));
    } else {
      setFavorites([...favorites, cafeId]);
      triggerNotification("즐겨찾기 추가", "카페가 즐겨찾기에 추가되었습니다.");
    }
  };

  // Onboarding Complete Handler
  const handleOnboardingComplete = (preferences, outletPref) => {
    setUser(prev => ({
      ...prev,
      style_preferences: preferences,
      outlet_preference: outletPref
    }));
    setIsOnboarded(true);
    triggerNotification("온보딩 완료", `반갑습니다, ${user.nickname}님! 나에게 맞는 카공 카페를 검색해보세요.`);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative flex flex-col overflow-hidden pb-16">
      
      {/* Toast Notification Container */}
      <div className="absolute top-4 left-4 right-4 z-50 pointer-events-none flex flex-col gap-2">
        {notifications.map(n => (
          <div key={n.id} className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between pointer-events-auto border border-slate-700 animate-slide-up">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-brand rounded-full">
                <Icon name="bell" className="w-4 h-4 text-white" />
              </span>
              <div>
                <p className="text-xs font-semibold text-brand-400">{n.title}</p>
                <p className="text-sm">{n.message}</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-white" onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}>×</button>
          </div>
        ))}
      </div>

      {/* Screen Render Control */}
      {!isOnboarded ? (
        <OnboardingScreen onComplete={handleOnboardingComplete} initialUser={user} />
      ) : (
        <>
          {/* Main App Layout */}
          {activeTab === "map" && (
            <MapTab
              cafes={filteredCafes}
              selectedCafe={selectedCafe}
              setSelectedCafe={setSelectedCafe}
              userLocation={userLocation}
              searchRange={searchRange}
              setSearchRange={setSearchRange}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setShowFilterModal={setShowFilterModal}
              calculateMatchingRate={calculateMatchingRate}
              getDistance={getDistance}
            />
          )}

          {activeTab === "list" && (
            <ListTab
              cafes={sortedCafes}
              setSelectedCafe={setSelectedCafe}
              calculateMatchingRate={calculateMatchingRate}
              getDistance={getDistance}
              userLocation={userLocation}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setShowFilterModal={setShowFilterModal}
            />
          )}

          {activeTab === "favorites" && (
            <FavoritesTab
              cafes={cafes}
              favorites={favorites}
              setSelectedCafe={setSelectedCafe}
              calculateMatchingRate={calculateMatchingRate}
              getDistance={getDistance}
              userLocation={userLocation}
            />
          )}

          {activeTab === "profile" && (
            <ProfileTab
              user={user}
              setUser={setUser}
              setIsOnboarded={setIsOnboarded}
              cafes={cafes}
            />
          )}

          {/* Navigation Bar */}
          <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around px-4 z-40">
            <button
              onClick={() => { setActiveTab("map"); setSelectedCafe(null); }}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 ${activeTab === "map" ? "text-brand font-semibold" : "text-slate-400"}`}
            >
              <Icon name="map" className="w-5 h-5" />
              <span className="text-[11px]">지도</span>
            </button>
            
            <button
              onClick={() => { setActiveTab("list"); setSelectedCafe(null); }}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 ${activeTab === "list" ? "text-brand font-semibold" : "text-slate-400"}`}
            >
              <Icon name="list" className="w-5 h-5" />
              <span className="text-[11px]">목록</span>
            </button>

            <button
              onClick={() => { setActiveTab("favorites"); setSelectedCafe(null); }}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 ${activeTab === "favorites" ? "text-brand font-semibold" : "text-slate-400"}`}
            >
              <Icon name="heart" className="w-5 h-5" />
              <span className="text-[11px]">즐겨찾기</span>
            </button>

            <button
              onClick={() => { setActiveTab("profile"); setSelectedCafe(null); }}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 ${activeTab === "profile" ? "text-brand font-semibold" : "text-slate-400"}`}
            >
              <Icon name="user" className="w-5 h-5" />
              <span className="text-[11px]">마이페이지</span>
            </button>
          </nav>
        </>
      )}

      {/* Cafe Detail Modal (Slides up if a cafe is selected) */}
      {selectedCafe && (
        <CafeDetailModal
          cafe={selectedCafe}
          onClose={() => setSelectedCafe(null)}
          isFavorite={favorites.includes(selectedCafe.cafe_id)}
          onToggleFavorite={() => toggleFavorite(selectedCafe.cafe_id)}
          calculateMatchingRate={calculateMatchingRate}
          getDistance={getDistance}
          userLocation={userLocation}
          onOpenReport={() => setShowReportSheet(true)}
        />
      )}

      {/* Filter Bottom Sheet */}
      {showFilterModal && (
        <FilterBottomSheet
          filters={filters}
          setFilters={setFilters}
          onClose={() => setShowFilterModal(false)}
        />
      )}

      {/* Report Audio & Congestion Bottom Sheet */}
      {showReportSheet && selectedCafe && (
        <ReportBottomSheet
          cafe={selectedCafe}
          onClose={() => setShowReportSheet(false)}
          onSubmitReport={(dbVal, grade, cong) => {
            const updated = cafes.map(c => {
              if (c.cafe_id === selectedCafe.cafe_id) {
                return {
                  ...c,
                  noise_grade: grade,
                  db_value: dbVal,
                  congestion: cong,
                  last_reported: new Date().toISOString()
                };
              }
              return c;
            });
            setCafes(updated);
            
            // Sync current active view
            setSelectedCafe(updated.find(c => c.cafe_id === selectedCafe.cafe_id));
            
            setShowReportSheet(false);
            triggerNotification("제보 성공", `소음도 ${dbVal}dB, 혼잡도 제보가 등록되었습니다! (+10p)`);
          }}
        />
      )}
    </div>
  );
}

// ---------------- COMPONENTS ----------------

// 1. Onboarding & Register Screen
function OnboardingScreen({ onComplete, initialUser }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(initialUser.email);
  const [nickname, setNickname] = useState(initialUser.nickname);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [preferences, setPreferences] = useState(initialUser.style_preferences);
  const [outletPreference, setOutletPreference] = useState(initialUser.outlet_preference);
  const [errors, setErrors] = useState({});

  const togglePreference = (prefId) => {
    if (preferences.includes(prefId)) {
      setPreferences(preferences.filter(p => p !== prefId));
    } else {
      setPreferences([...preferences, prefId]);
    }
  };

  const handleNext = () => {
    const tempErrors = {};
    if (step === 1) {
      if (!email.includes("@") || !email.includes(".")) {
        tempErrors.email = "올바른 이메일 형식을 입력하세요.";
      }
      if (nickname.length < 2 || nickname.length > 10) {
        tempErrors.nickname = "닉네임은 2~10자로 입력하세요.";
      }
      if (Object.keys(tempErrors).length > 0) {
        setErrors(tempErrors);
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      if (password.length < 8) {
        tempErrors.password = "비밀번호는 8자 이상이어야 합니다.";
      }
      if (password !== passwordConfirm) {
        tempErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
      }
      if (Object.keys(tempErrors).length > 0) {
        setErrors(tempErrors);
        return;
      }
      setErrors({});
      setStep(3);
    }
  };

  const handleFinish = () => {
    if (preferences.length === 0) {
      setErrors({ preferences: "하나 이상의 성향을 선택해주세요." });
      return;
    }
    onComplete(preferences, outletPreference);
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-50 justify-between">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-extrabold text-brand tracking-tight flex items-center justify-center gap-2">
          <span>🎧</span> NoiseMatch
        </h1>
        <p className="text-slate-400 text-sm mt-1">실시간 소음도 기반 맞춤형 카공 카페 매칭</p>
      </div>

      {/* Main Flow card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex-1 flex flex-col justify-between my-4">
        
        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-xl font-bold text-slate-800 mb-6">사용자 정보를 등록해 주세요 👤</h2>
            
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">이메일</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 ${errors.email ? "border-danger" : "border-slate-200"}`}
              />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">닉네임 (2~10자)</label>
              <input
                type="text"
                placeholder="예) 카공마스터"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 ${errors.nickname ? "border-danger" : "border-slate-200"}`}
              />
              {errors.nickname && <p className="text-xs text-danger mt-1">{errors.nickname}</p>}
            </div>
          </div>
        )}

        {/* STEP 2: Password Setting */}
        {step === 2 && (
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-xl font-bold text-slate-800 mb-6">보안을 위해 비밀번호를 입력해 주세요 🔒</h2>
            
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">비밀번호 (8자 이상)</label>
              <input
                type="password"
                placeholder="영문+숫자+특수문자 조합"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 ${errors.password ? "border-danger" : "border-slate-200"}`}
              />
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">비밀번호 확인</label>
              <input
                type="password"
                placeholder="동일하게 한 번 더 입력"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 ${errors.passwordConfirm ? "border-danger" : "border-slate-200"}`}
              />
              {errors.passwordConfirm && <p className="text-xs text-danger mt-1">{errors.passwordConfirm}</p>}
            </div>
          </div>
        )}

        {/* STEP 3: Preference Setting */}
        {step === 3 && (
          <div className="flex-1 flex flex-col justify-start overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-1">당신의 카공 성향은 어떤가요? 📝</h2>
            <p className="text-slate-400 text-xs mb-4">선택하신 성향 기반으로 실시간 최적 매칭률을 계산합니다.</p>
            
            <div className="space-y-2 mb-6">
              <div
                onClick={() => togglePreference("ST_QUIET")}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all-custom ${preferences.includes("ST_QUIET") ? "active-radio border-brand" : "border-slate-200 bg-slate-50"}`}
              >
                <div>
                  <p className="font-semibold text-sm">🤫 완전 정숙</p>
                  <p className="text-slate-400 text-[11px]">아무 소리도 없어야 집중이 잘 돼요 (1단계 소음)</p>
                </div>
                {preferences.includes("ST_QUIET") && <span className="w-5 h-5 bg-brand text-white rounded-full flex items-center justify-center text-xs">✓</span>}
              </div>

              <div
                onClick={() => togglePreference("ST_LOW_BGM")}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all-custom ${preferences.includes("ST_LOW_BGM") ? "active-radio border-brand" : "border-slate-200 bg-slate-50"}`}
              >
                <div>
                  <p className="font-semibold text-sm">🎵 잔잔한 음악</p>
                  <p className="text-slate-400 text-[11px]">조용한 BGM이나 백그라운드 음악은 괜찮아요 (1~2단계 소음)</p>
                </div>
                {preferences.includes("ST_LOW_BGM") && <span className="w-5 h-5 bg-brand text-white rounded-full flex items-center justify-center text-xs">✓</span>}
              </div>

              <div
                onClick={() => togglePreference("ST_CROWD")}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all-custom ${preferences.includes("ST_CROWD") ? "active-radio border-brand" : "border-slate-200 bg-slate-50"}`}
              >
                <div>
                  <p className="font-semibold text-sm">🌊 약간의 소음</p>
                  <p className="text-slate-400 text-[11px]">백색 소음이나 웅성거림이 있어야 집중이 돼요 (2단계 소음)</p>
                </div>
                {preferences.includes("ST_CROWD") && <span className="w-5 h-5 bg-brand text-white rounded-full flex items-center justify-center text-xs">✓</span>}
              </div>

              <div
                onClick={() => togglePreference("ST_LIVELY")}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all-custom ${preferences.includes("ST_LIVELY") ? "active-radio border-brand" : "border-slate-200 bg-slate-50"}`}
              >
                <div>
                  <p className="font-semibold text-sm">🎉 활기찬 분위기</p>
                  <p className="text-slate-400 text-[11px]">시끌벅적하고 활기찬 카페 분위기를 좋아해요 (2~3단계 소음)</p>
                </div>
                {preferences.includes("ST_LIVELY") && <span className="w-5 h-5 bg-brand text-white rounded-full flex items-center justify-center text-xs">✓</span>}
              </div>
              {errors.preferences && <p className="text-xs text-danger font-medium">{errors.preferences}</p>}
            </div>

            {/* Outlet Preference Choice */}
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">콘센트 중요 여부</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOutletPreference("REQUIRED")}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border ${outletPreference === "REQUIRED" ? "bg-brand text-white border-brand" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                >
                  콘센트 필수 🔌
                </button>
                <button
                  onClick={() => setOutletPreference("OPTIONAL")}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border ${outletPreference === "OPTIONAL" ? "bg-brand text-white border-brand" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                >
                  상관없음 ☕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="py-3 px-4 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm"
            >
              이전
            </button>
          )}
          <button
            onClick={step === 3 ? handleFinish : handleNext}
            className="flex-1 py-3 bg-brand text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition"
          >
            {step === 3 ? "매칭 시작하기 🚀" : "계속하기"}
          </button>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-1.5 pb-2">
        <span className={`w-2 h-2 rounded-full ${step === 1 ? "bg-brand" : "bg-slate-200"}`}></span>
        <span className={`w-2 h-2 rounded-full ${step === 2 ? "bg-brand" : "bg-slate-200"}`}></span>
        <span className={`w-2 h-2 rounded-full ${step === 3 ? "bg-brand" : "bg-slate-200"}`}></span>
      </div>
    </div>
  );
}

// 2. Map Tab Component
function MapTab({
  cafes,
  selectedCafe,
  setSelectedCafe,
  userLocation,
  searchRange,
  setSearchRange,
  searchQuery,
  setSearchQuery,
  setShowFilterModal,
  calculateMatchingRate,
  getDistance
}) {
  return (
    <div className="flex-1 flex flex-col relative h-[calc(100vh-4rem)]">
      
      {/* Search Overlay */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center gap-2 pointer-events-auto">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="카페명 검색..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl shadow-lg border border-slate-100 focus:outline-none text-sm"
          />
          <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
        <button
          onClick={() => setShowFilterModal(true)}
          className="p-2.5 bg-white text-slate-600 rounded-xl shadow-lg border border-slate-100 hover:bg-slate-50 relative"
        >
          <Icon name="filter" className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand rounded-full"></span>
        </button>
      </div>

      {/* Range Controller Overlay */}
      <div className="absolute top-16 left-4 right-4 z-20 pointer-events-none mt-2">
        <div className="bg-white/95 backdrop-blur px-3 py-2 rounded-xl shadow-md border border-slate-100 inline-flex items-center gap-2 pointer-events-auto text-xs">
          <span className="font-semibold text-slate-500">반경:</span>
          <button
            onClick={() => setSearchRange(0.5)}
            className={`px-2 py-0.5 rounded ${searchRange === 0.5 ? "bg-brand text-white font-bold" : "text-slate-600"}`}
          >
            500m
          </button>
          <button
            onClick={() => setSearchRange(1.0)}
            className={`px-2 py-0.5 rounded ${searchRange === 1.0 ? "bg-brand text-white font-bold" : "text-slate-600"}`}
          >
            1km
          </button>
          <button
            onClick={() => setSearchRange(2.0)}
            className={`px-2 py-0.5 rounded ${searchRange === 2.0 ? "bg-brand text-white font-bold" : "text-slate-600"}`}
          >
            2km
          </button>
        </div>
      </div>

      {/* Simulated Map Background */}
      <div className="flex-1 bg-slate-200 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="absolute text-slate-400 font-mono text-[9px] bottom-20 left-4">
          SEOUL SHINCHON AREA (MOCKUP MAP)<br/>
          LAT: {userLocation.lat.toFixed(4)} / LNG: {userLocation.lng.toFixed(4)}
        </div>

        {/* User Location Pulse */}
        <div className="absolute w-8 h-8 flex items-center justify-center z-10">
          <div className="absolute w-6 h-6 rounded-full bg-brand/30 ping-marker"></div>
          <div className="absolute w-3 h-3 rounded-full bg-brand border-2 border-white shadow-md"></div>
        </div>

        {/* Cafe Markers */}
        {cafes.map(cafe => {
          const offsetX = (cafe.lng - userLocation.lng) * 45000;
          const offsetY = -(cafe.lat - userLocation.lat) * 60000;

          const minsAgo = (new Date() - new Date(cafe.last_reported)) / (1000 * 60);
          const isExpired = minsAgo >= 60;

          let markerColor = "bg-success";
          let markerIcon = "😶";
          if (isExpired) {
            markerColor = "bg-slate-400";
            markerIcon = "❓";
          } else if (cafe.noise_grade === 2) {
            markerColor = "bg-warning";
            markerIcon = "🗣️";
          } else if (cafe.noise_grade === 3) {
            markerColor = "bg-danger";
            markerIcon = "📢";
          }

          const rate = calculateMatchingRate(cafe);

          return (
            <div
              key={cafe.cafe_id}
              onClick={() => setSelectedCafe(cafe)}
              className="absolute cursor-pointer flex flex-col items-center group transition transform hover:scale-110 z-20"
              style={{
                transform: `translate(${offsetX}px, ${offsetY}px)`,
              }}
            >
              {rate && (
                <span className="bg-slate-900 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-full mb-1 shadow-md opacity-85">
                  {rate}%
                </span>
              )}
              <div className={`w-8 h-8 rounded-full ${markerColor} border-2 border-white flex items-center justify-center text-sm shadow-lg`}>
                {markerIcon}
              </div>
              <span className="text-[10px] font-bold bg-white/95 px-1.5 py-0.5 rounded shadow mt-1 max-w-[80px] truncate text-slate-800 border border-slate-100">
                {cafe.name.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-20 left-4 right-4 bg-white/95 backdrop-blur p-3 rounded-xl shadow-lg border border-slate-100 flex items-center justify-between text-xs z-30">
        <div className="flex items-center gap-2">
          <Icon name="info" className="w-4 h-4 text-brand" />
          <span className="text-slate-600">지도를 드래그하거나 핀을 클릭하세요</span>
        </div>
        <div className="flex gap-2 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success"></span>정숙</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning"></span>보통</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger"></span>혼잡</span>
        </div>
      </div>
    </div>
  );
}

// 3. List Tab Component
function ListTab({
  cafes,
  setSelectedCafe,
  calculateMatchingRate,
  getDistance,
  userLocation,
  searchQuery,
  setSearchQuery,
  setShowFilterModal
}) {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-[calc(100vh-4rem)] p-4 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-lg font-extrabold text-slate-800">매칭 카페 리스트 ☕</h2>
        <p className="text-slate-400 text-xs">내 카공 성향에 가장 알맞은 순서대로 정렬되었습니다.</p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="카페명 또는 주소 검색..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none text-xs"
          />
          <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <button
          onClick={() => setShowFilterModal(true)}
          className="p-2 bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1 text-xs font-semibold"
        >
          <Icon name="filter" className="w-4 h-4" />
          <span>필터</span>
        </button>
      </div>

      <div className="space-y-3 pb-8">
        {cafes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="text-sm font-semibold">필터 조건에 부합하는 카페가 없습니다</p>
          </div>
        ) : (
          cafes.map(cafe => {
            const rate = calculateMatchingRate(cafe);
            const dist = getDistance(userLocation.lat, userLocation.lng, cafe.lat, cafe.lng).toFixed(1);
            const minsAgo = Math.round((new Date() - new Date(cafe.last_reported)) / (1000 * 60));
            const isExpired = minsAgo >= 60;

            let matchColor = "bg-slate-100 text-slate-600";
            let matchLabel = "비추천";
            if (rate === null) {
              matchColor = "bg-slate-100 text-slate-400";
              matchLabel = "계산 불가";
            } else if (rate >= 90) {
              matchColor = "bg-emerald-50 text-emerald-700 border border-emerald-100";
              matchLabel = "최적 매칭 🔥";
            } else if (rate >= 70) {
              matchColor = "bg-blue-50 text-blue-700 border border-blue-100";
              matchLabel = "좋은 매칭 👍";
            } else if (rate >= 50) {
              matchColor = "bg-amber-50 text-amber-700 border border-amber-100";
              matchLabel = "보통 매칭";
            }

            return (
              <div
                key={cafe.cafe_id}
                onClick={() => setSelectedCafe(cafe)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-brand/30 cursor-pointer transition flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800">{cafe.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{cafe.address}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${matchColor}`}>
                    {rate ? `${rate}% ${matchLabel}` : matchLabel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-50 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">실시간 소음</span>
                    <div className="flex items-center gap-1 font-semibold">
                      <span>{isExpired ? "❓ 없음" : cafe.noise_grade === 1 ? "😶 1단계" : cafe.noise_grade === 2 ? "🗣️ 2단계" : "📢 3단계"}</span>
                      {cafe.db_value && !isExpired && <span className="text-[10px] text-slate-400">({cafe.db_value}dB)</span>}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">혼잡도</span>
                    <span className={`font-semibold ${cafe.congestion === "SPACIOUS" ? "text-success" : cafe.congestion === "MODERATE" ? "text-warning" : "text-danger"}`}>
                      {cafe.congestion === "SPACIOUS" ? "🟢 여유" : cafe.congestion === "MODERATE" ? "🟡 보통" : "🔴 만석직전"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">정보 갱신</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {isExpired ? <span className="text-danger font-bold text-[9px]">만료</span> : `${minsAgo}분 전`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 px-2 py-0.5 rounded">콘센트: {cafe.outlet_status === "ALL" ? "모든좌석🔌" : cafe.outlet_status === "PARTIAL" ? "일부🔌" : "없음❌"}</span>
                  </div>
                  <span className="font-bold text-slate-600">{dist} km</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// 4. Favorites Tab Component
function FavoritesTab({
  cafes,
  favorites,
  setSelectedCafe,
  calculateMatchingRate,
  getDistance,
  userLocation
}) {
  const favoriteCafes = cafes.filter(c => favorites.includes(c.cafe_id));

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-[calc(100vh-4rem)] p-4 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-1.5">
          <Icon name="heart" className="w-5 h-5 text-red-500 fill-red-500" />
          즐겨찾기 카페
        </h2>
        <p className="text-slate-400 text-xs">최대 20개까지 등록하여 혼잡도 개선 시 푸시 알림을 받을 수 있습니다.</p>
      </div>

      <div className="space-y-3 pb-8">
        {favoriteCafes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
            <p className="text-sm font-semibold">즐겨찾기한 카페가 없습니다</p>
          </div>
        ) : (
          favoriteCafes.map(cafe => {
            const rate = calculateMatchingRate(cafe);
            const dist = getDistance(userLocation.lat, userLocation.lng, cafe.lat, cafe.lng).toFixed(1);

            return (
              <div
                key={cafe.cafe_id}
                onClick={() => setSelectedCafe(cafe)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-red-200 cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{cafe.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-semibold ${cafe.congestion === "SPACIOUS" ? "text-success" : cafe.congestion === "MODERATE" ? "text-warning" : "text-danger"}`}>
                      {cafe.congestion === "SPACIOUS" ? "여유" : cafe.congestion === "MODERATE" ? "보통" : "만석 직전"}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{dist} km</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {rate && (
                    <span className="bg-emerald-50 text-emerald-700 font-mono font-bold text-xs px-2 py-1 rounded-lg">
                      {rate}% 매칭
                    </span>
                  )}
                  <Icon name="chevronRight" className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// 5. Profile Tab Component
function ProfileTab({ user, setUser, setIsOnboarded, cafes }) {
  const [nickname, setNickname] = useState(user.nickname);
  const [email, setEmail] = useState(user.email);
  const [pref, setPref] = useState(user.style_preferences);
  const [outlet, setOutlet] = useState(user.outlet_preference);

  const togglePref = (pId) => {
    if (pref.includes(pId)) {
      setPref(pref.filter(item => item !== pId));
    } else {
      setPref([...pref, pId]);
    }
  };

  const handleSave = () => {
    setUser({
      ...user,
      nickname,
      email,
      style_preferences: pref,
      outlet_preference: outlet
    });
    alert("성향 및 계정 설정이 저장되었습니다.");
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-[calc(100vh-4rem)] p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-extrabold text-slate-800">마이페이지 ⚙️</h2>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4 mb-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-sm text-slate-700 font-semibold"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">내 카공 성향 상세</h3>
        
        <div className="space-y-2">
          {[
            { id: "ST_QUIET", label: "🤫 완전 정숙 (1단계)" },
            { id: "ST_LOW_BGM", label: "🎵 잔잔한 음악 (1~2단계)" },
            { id: "ST_CROWD", label: "🌊 약간의 소음 (2단계)" },
            { id: "ST_LIVELY", label: "🎉 활기찬 분위기 (2~3단계)" }
          ].map(item => (
            <div
              key={item.id}
              onClick={() => togglePref(item.id)}
              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer text-xs font-semibold transition ${pref.includes(item.id) ? "border-brand bg-blue-50/35 text-brand" : "border-slate-200 bg-slate-50 text-slate-600"}`}
            >
              <span>{item.label}</span>
              {pref.includes(item.id) && <span>✓</span>}
            </div>
          ))}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-2">콘센트 선호도</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setOutlet("REQUIRED")}
              className={`py-2 px-3 font-semibold rounded-lg border ${outlet === "REQUIRED" ? "bg-brand text-white border-brand" : "bg-slate-50 text-slate-600 border-slate-200"}`}
            >
              콘센트 필요 🔌
            </button>
            <button
              onClick={() => setOutlet("OPTIONAL")}
              className={`py-2 px-3 font-semibold rounded-lg border ${outlet === "OPTIONAL" ? "bg-brand text-white border-brand" : "bg-slate-50 text-slate-600 border-slate-200"}`}
            >
              상관없음 ☕
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-brand text-white font-bold text-xs rounded-xl shadow-md"
        >
          설정 저장하기
        </button>

        <button
          onClick={() => {
            if (confirm("로그아웃 하시겠습니까?")) {
              setIsOnboarded(false);
              localStorage.clear();
            }
          }}
          className="w-full py-2.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl"
        >
          초기화 후 로그아웃
        </button>
      </div>
    </div>
  );
}

// 6. Filter Bottom Sheet Modal
function FilterBottomSheet({ filters, setFilters, onClose }) {
  const [outlet, setOutlet] = useState(filters.outlet);
  const [noises, setNoises] = useState(filters.noiseLevels);
  const [congests, setCongests] = useState(filters.congestions);
  const [matchingRate, setMatchingRate] = useState(filters.minMatchingRate);

  const toggleNoise = (level) => {
    if (noises.includes(level)) setNoises(noises.filter(n => n !== level));
    else setNoises([...noises, level]);
  };

  const toggleCongest = (c) => {
    if (congests.includes(c)) setCongests(congests.filter(item => item !== c));
    else setCongests([...congests, c]);
  };

  const applyFilters = () => {
    setFilters({
      ...filters,
      outlet,
      noiseLevels: noises,
      congestions: congests,
      minMatchingRate: matchingRate
    });
    onClose();
  };

  const resetFilters = () => {
    setOutlet("ALL_TYPES");
    setNoises([]);
    setCongests([]);
    setMatchingRate("ALL");
  };

  return (
    <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
      <div className="bg-white rounded-t-3xl max-h-[85%] overflow-y-auto p-5 animate-slide-up flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <span className="font-extrabold text-slate-800">카공 환경 필터 ⚙️</span>
          <button onClick={onClose} className="text-slate-400 font-bold text-lg">×</button>
        </div>

        <div className="space-y-5 flex-1">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-2">콘센트 상태</label>
            <div className="grid grid-cols-4 gap-1.5 text-[11px] font-semibold">
              {[
                { id: "ALL_TYPES", label: "전체" },
                { id: "ALL", label: "모든좌석" },
                { id: "PARTIAL", label: "일부좌석" },
                { id: "NONE", label: "없음" }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setOutlet(opt.id)}
                  className={`py-2 rounded-lg border ${outlet === opt.id ? "bg-brand text-white border-brand" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-2">소음도 등급</label>
            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
              {[
                { id: 1, label: "😶 1단계 (정숙)" },
                { id: 2, label: "🗣️ 2단계 (보통)" },
                { id: 3, label: "📢 3단계 (시끌)" }
              ].map(opt => {
                const active = noises.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleNoise(opt.id)}
                    className={`py-2 rounded-lg border ${active ? "bg-brand text-white border-brand" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-2">혼잡도 상태</label>
            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
              {[
                { id: "SPACIOUS", label: "🟢 여유" },
                { id: "MODERATE", label: "🟡 보통" },
                { id: "CROWDED", label: "🔴 만석직전" }
              ].map(opt => {
                const active = congests.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleCongest(opt.id)}
                    className={`py-2 rounded-lg border ${active ? "bg-brand text-white border-brand" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-2">내 매칭률 추천</label>
            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
              {[
                { id: "ALL", label: "전체" },
                { id: "80", label: "80% 이상" },
                { id: "90", label: "90% 이상" }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setMatchingRate(opt.id)}
                  className={`py-2 rounded-lg border ${matchingRate === opt.id ? "bg-brand text-white border-brand" : "bg-slate-50 text-slate-600 border-slate-200"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
          <button
            onClick={resetFilters}
            className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs"
          >
            초기화
          </button>
          <button
            onClick={applyFilters}
            className="flex-1 py-3 bg-brand text-white rounded-xl font-bold text-xs"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}

// 7. Cafe Detail Modal Panel
function CafeDetailModal({
  cafe,
  onClose,
  isFavorite,
  onToggleFavorite,
  calculateMatchingRate,
  getDistance,
  userLocation,
  onOpenReport
}) {
  const rate = calculateMatchingRate(cafe);
  const dist = getDistance(userLocation.lat, userLocation.lng, cafe.lat, cafe.lng).toFixed(1);
  const minsAgo = Math.round((new Date() - new Date(cafe.last_reported)) / (1000 * 60));
  const isExpired = minsAgo >= 60;

  const mockHistory = [
    { time: "10분 전", grade: cafe.noise_grade, db: cafe.db_value, text: "조금씩 사람 모임" },
    { time: "35분 전", grade: cafe.noise_grade === 1 ? 1 : 2, db: (cafe.db_value - 4).toFixed(1), text: "공부하는 팀 많음" },
    { time: "1시간 전", grade: 2, db: 52.0, text: "음악 소리가 조금 큼" }
  ];

  return (
    <div className="absolute inset-0 bg-slate-900/60 z-40 flex flex-col justify-end">
      <div className="bg-white rounded-t-3xl max-h-[90%] overflow-y-auto p-5 animate-slide-up flex flex-col pb-20">
        
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-bold">
              📍 신촌 대학가 • {dist}km 거리
            </span>
            <h2 className="text-xl font-extrabold text-slate-800 mt-1.5">{cafe.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{cafe.address}</p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-full border transition ${isFavorite ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 text-slate-400"}`}
            >
              <Icon name="heart" className={`w-5 h-5 ${isFavorite ? "fill-red-500" : ""}`} />
            </button>
            <button onClick={onClose} className="text-slate-400 font-bold text-2xl px-2">×</button>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4 grid grid-cols-2 gap-4">
          <div className="border-r border-slate-200/60 pr-2">
            <span className="text-[10px] font-bold text-slate-400 block mb-1">실시간 소음 등급</span>
            {isExpired ? (
              <span className="text-sm font-bold text-slate-400">데이터 만료</span>
            ) : (
              <div>
                <p className="text-lg font-extrabold text-slate-800 flex items-center gap-1.5">
                  <span>{cafe.noise_grade === 1 ? "😶 1단계" : cafe.noise_grade === 2 ? "🗣️ 2단계" : "📢 3단계"}</span>
                </p>
                <span className="text-[11px] text-slate-500">({cafe.noise_grade === 1 ? "도서관급 정숙" : cafe.noise_grade === 2 ? "잔잔한 대화" : "시끌벅적함"} • {cafe.db_value}dB)</span>
              </div>
            )}
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 block mb-1">실시간 혼잡도</span>
            <p className={`text-lg font-extrabold ${cafe.congestion === "SPACIOUS" ? "text-success" : cafe.congestion === "MODERATE" ? "text-warning" : "text-danger"}`}>
              {cafe.congestion === "SPACIOUS" ? "🟢 여유" : cafe.congestion === "MODERATE" ? "🟡 보통" : "🔴 만석직전"}
            </p>
            <span className="text-[10px] text-slate-400">
              마지막 제보: {isExpired ? <span className="text-danger font-bold">1시간 초과됨</span> : `${minsAgo}분 전`}
            </span>
          </div>
        </div>

        {minsAgo >= 30 && minsAgo < 60 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-xl text-[11px] mb-4">
            ⚠️ 정보가 30분 이상 경과하여 최신이 아닐 수 있습니다.
          </div>
        )}
        {isExpired && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-xl text-[11px] mb-4 font-semibold">
            🚨 데이터가 만료되었습니다. 첫 소음 제보자가 되어보세요!
          </div>
        )}

        <div className="border border-slate-100 rounded-2xl p-4 bg-blue-50/20 mb-4 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-600">내 성향 매칭률 분석</span>
            <span className="bg-brand text-white font-extrabold px-2 py-0.5 rounded-full">{rate ? `${rate}% 매칭` : "산출 불가"}</span>
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-slate-600">
            {cafe.noise_grade === 1 && <li>🤫 선호하시는 조용한 공부환경(1등급)에 완벽 부합합니다.</li>}
            {cafe.noise_grade === 2 && <li>🎵 약간의 화이트 노이즈(2등급)가 있는 활기 있는 분위기입니다.</li>}
            {cafe.outlet_status === "ALL" ? (
              <li>🔌 모든 좌석에 콘센트가 구비되어 있어 충전이 편리합니다.</li>
            ) : cafe.outlet_status === "PARTIAL" ? (
              <li>🔌 일부 벽면 좌석에만 콘센트가 구비되어 있습니다.</li>
            ) : (
              <li>❌ 콘센트가 거의 없는 매장입니다.</li>
            )}
          </ul>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-400 block mb-2 uppercase">카페 상세 사양</h3>
          <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 text-slate-600">
            <div className="flex justify-between"><span className="text-slate-400">🔌 콘센트</span><span className="font-semibold">{cafe.outlet_status === "ALL" ? "모든 좌석" : cafe.outlet_status === "PARTIAL" ? "일부 좌석" : "없음"}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">📶 와이파이</span><span className="font-semibold">{cafe.wifi_available ? "제공" : "미제공"}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">⏰ 영업 시간</span><span className="font-semibold">평일: {cafe.open_hours.weekday}</span></div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 block mb-2 uppercase">최근 제보 히스토리</h3>
          <div className="relative border-l-2 border-slate-100 pl-4 space-y-3 ml-2">
            {mockHistory.map((hist, idx) => (
              <div key={idx} className="relative text-xs">
                <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white"></span>
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>제보 시간: {hist.time}</span>
                  <span className="font-semibold">{hist.db}dB</span>
                </div>
                <p className="font-bold text-slate-700 text-[11px] mt-0.5">{hist.text} • 소음 {hist.grade}단계</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-40 bg-white pt-2">
          <button
            onClick={onOpenReport}
            className="w-full py-3 bg-brand text-white font-extrabold rounded-xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Icon name="mic" className="w-4 h-4" />
            <span>실시간 소음 제보하고 기여하기 (+10p)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// 8. Report Bottom Sheet Modal
function ReportBottomSheet({ cafe, onClose, onSubmitReport }) {
  const [step, setStep] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(30);
  const [dbVal, setDbVal] = useState(0);
  const [congestion, setCongestion] = useState("SPACIOUS");
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const audioTimerIntervalRef = useRef(null);
  const decibelSamplesRef = useRef([]);

  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [step, countdown]);

  useEffect(() => {
    if (step === 2 && countdown === 0) {
      startAudioMonitoring();

      audioTimerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(audioTimerIntervalRef.current);
            finishMeasurement();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (audioTimerIntervalRef.current) clearInterval(audioTimerIntervalRef.current);
    };
  }, [step, countdown]);

  const startAudioMonitoring = async () => {
    decibelSamplesRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const sampleLoop = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const mappedDb = Math.min(85, Math.max(30, 30 + (average / 255) * 55));
        
        decibelSamplesRef.current.push(mappedDb);
        setDbVal(parseFloat(mappedDb.toFixed(1)));

        if (timer > 0) {
          requestAnimationFrame(sampleLoop);
        }
      };
      
      sampleLoop();

    } catch (err) {
      const simulatedMeter = () => {
        if (timer <= 0) return;
        const base = cafe.noise_grade === 1 ? 38 : cafe.noise_grade === 2 ? 55 : 72;
        const mappedDb = base - 3 + Math.random() * 8;
        decibelSamplesRef.current.push(mappedDb);
        setDbVal(parseFloat(mappedDb.toFixed(1)));
        setTimeout(simulatedMeter, 300);
      };
      simulatedMeter();
    }
  };

  const stopAudioTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
  };

  const finishMeasurement = () => {
    stopAudioTracks();
    const samples = [...decibelSamplesRef.current];
    if (samples.length > 5) {
      samples.sort((a, b) => a - b);
      const middleSamples = samples.slice(Math.floor(samples.length * 0.1), Math.floor(samples.length * 0.9));
      const avgDb = middleSamples.reduce((sum, v) => sum + v, 0) / middleSamples.length;
      setDbVal(parseFloat(avgDb.toFixed(1)));
    }
    setStep(3);
  };

  const handleSubmit = () => {
    let grade = 2;
    if (dbVal <= 45) grade = 1;
    else if (dbVal >= 66) grade = 3;
    onSubmitReport(dbVal, grade, congestion);
  };

  const handleSkipMeasurement = () => {
    clearInterval(audioTimerIntervalRef.current);
    stopAudioTracks();
    const finalMockDb = parseFloat((40 + Math.random() * 25).toFixed(1));
    setDbVal(finalMockDb);
    setStep(3);
  };

  return (
    <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
      <div className="bg-white rounded-t-3xl max-h-[85%] p-5 animate-slide-up flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <span className="font-extrabold text-slate-800">소음도 제보하기 🎙️</span>
          <button onClick={() => { stopAudioTracks(); onClose(); }} className="text-slate-400 font-bold text-lg">×</button>
        </div>

        {step === 1 && (
          <div className="text-center py-6 flex-1 flex flex-col justify-between">
            <div>
              <p className="text-slate-400 text-xs mb-2">지정한 카페: {cafe.name}</p>
              <h3 className="text-lg font-extrabold text-slate-800 mb-4">측정을 위한 준비를 해주세요!</h3>
              <ul className="text-left text-xs text-slate-500 max-w-xs mx-auto space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <li>🤫 마이크가 가려지지 않도록 핸드폰을 테이블 위에 가볍게 놓아주세요.</li>
                <li>⏳ 3초 카운트다운 후, 30초 동안 주변 소음을 정밀 수집합니다.</li>
              </ul>
            </div>
            <div className="mt-8">
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-brand text-white font-extrabold rounded-xl"
              >
                측정 시작하기 🎙️
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center py-6 flex-1 flex flex-col justify-between">
            {countdown > 0 ? (
              <div className="my-10">
                <span className="text-[10px] text-slate-400 font-bold block mb-2">준비 중</span>
                <span className="text-6xl font-black text-brand animate-ping block">{countdown}</span>
              </div>
            ) : (
              <div className="my-6">
                <span className="text-[10px] text-brand font-black block mb-2">🔴 소음 수집 및 정밀 계측 중</span>
                <div className="text-5xl font-black text-slate-800 mb-2">{dbVal} <span className="text-lg text-slate-400">dB</span></div>
                <div className="flex items-center justify-center gap-1.5 h-12 my-4">
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                </div>
                <div className="text-xs font-semibold text-slate-500">남은 시간: {timer}초</div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSkipMeasurement}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl"
              >
                즉시 스킵 (테스트용)
              </button>
              <button
                onClick={() => { stopAudioTracks(); onClose(); }}
                className="px-4 py-3 bg-red-50 text-danger font-bold text-xs rounded-xl"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col justify-start">
            <h3 className="text-base font-extrabold text-slate-800 mb-1">계측이 완료되었습니다! 🎉</h3>
            
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between mb-4 mt-2">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">최종 소음도</span>
                <span className="text-2xl font-black text-slate-800">{dbVal} <span className="text-sm font-normal text-slate-500">dB</span></span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${dbVal <= 45 ? "bg-success/10 text-success" : dbVal >= 66 ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"}`}>
                {dbVal <= 45 ? "😶 1단계 (정숙)" : dbVal >= 66 ? "📢 3단계 (시끌)" : "🗣️ 2단계 (보통)"}
              </span>
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-slate-400 block mb-2 uppercase">현재 카페 혼잡도 선택</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "SPACIOUS", label: "🟢 여유", desc: "자리가 많아요" },
                  { id: "MODERATE", label: "🟡 보통", desc: "적당히 있어요" },
                  { id: "CROWDED", label: "🔴 만석직전", desc: "자리가 거의 없어요" }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setCongestion(opt.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition ${congestion === opt.id ? "border-brand bg-blue-50/50" : "border-slate-100 bg-slate-50"}`}
                  >
                    <span className="text-xs font-bold text-slate-800">{opt.label}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3.5 bg-brand text-white font-extrabold text-sm rounded-xl"
            >
              기여하고 제출 완료 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
