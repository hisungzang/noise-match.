# NoiseMatch (실시간 소음도 기반 카페 매칭 플랫폼 데모)

본 프로젝트는 실시간 소음도 측정(Web Audio API), 위치 기반 필터링, 유저 성향 매칭 및 WebSocket 기반 실시간 크라우드소싱 갱신 기능을 정적으로 완벽히 시뮬레이션한 데모 웹 애플리케이션입니다.

## 📁 주요 구성 파일
- `index.html`: React 18, Tailwind CSS, Babel CDN 연동 및 전체 앱 컨테이너
- `app.js`: 유저 온보딩, 매칭 알고리즘, 실시간 갱신 웹소켓 시물레이터 및 UI 컴포넌트 로직
- `styles.css`: Glassmorphism 효과, 맥동 위치 마커, 오디오 파형 등의 스타일링

## 🚀 로컬에서 실행하기
본 애플리케이션은 **React + Tailwind CDN**과 **Babel**을 사용하여 빌드/컴파일 단계 없이 브라우저에서 직접 실행할 수 있습니다.

1. 본 폴더에 있는 `index.html` 파일을 더블 클릭하여 크롬이나 사파리 브라우저로 엽니다.
2. (권한 요청) "실시간 소음 제보하기" 기능 이용 시 브라우저 마이크 접근 권한을 허용하시면 실제 주변 소음 데시벨(dB)을 수집하여 측정합니다.

## 🌐 GitHub Pages에 배포하기
이 프로젝트는 백엔드 서버 없이 프론트엔드 내에 완전한 데이터베이스 및 WebSocket 시뮬레이션을 구현하였기 때문에, **GitHub Pages**를 통해 무료로 손쉽게 호스팅하여 모바일 기기 등에서 바로 사용할 수 있습니다.

### 배포 방법
1. 본인의 GitHub 계정에 새 저장소(Repository)를 생성합니다. (예: `noise-match`)
2. 바탕화면 `NoiseMatch` 폴더 내의 파일들을 해당 저장소에 업로드(Push)합니다.
   ```bash
   git init
   git add .
   git commit -m "Initial commit for NoiseMatch MVP demo"
   git remote add origin https://github.com/사용자이름/noise-match.git
   git branch -M main
   git push -u origin main
   ```
3. GitHub 저장소의 **Settings** -> **Pages** 메뉴로 이동합니다.
4. **Build and deployment** 항목의 **Source**를 `Deploy from a branch`로 설정하고, Branch를 `main` (또는 업로드한 브랜치), 폴더를 `/ (root)`로 지정한 뒤 **Save**를 클릭합니다.
5. 약 1~2분 후, 상단에 생성된 GitHub Pages 주소(예: `https://사용자이름.github.io/noise-match/`)로 접속하면 실시간으로 동작하는 데모를 모바일 환경에서 바로 확인하고 공유하실 수 있습니다!
