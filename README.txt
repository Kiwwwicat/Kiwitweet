Kiwitweet
=========

트위터(X) 알림 페이지의 멘션 탭에서 답글이 0개인 멘션만 골라 보여주는
토글을 제공하는 브라우저 확장 프로그램.

알림 페이지 우상단에 뜨는 토글 하나로 필터를 켜고 끌 수 있다. 토글을
켜면 자동으로 멘션 탭으로 이동하고, 누군가가 답글을 단 멘션은 숨겨
답해야 할 것만 남긴다.


주요 기능
---------

- /notifications/* 경로 진입 시 우상단에 "미답변만" 토글 표시
- 토글 ON: 멘션 탭으로 이동 + 답글 0개 멘션만 노출 (나머지는 숨김)
- 누가 답글을 달면 다음 갱신/스크롤 시 자동으로 사라짐
  (트위터 reply 카운트를 DOM에서 직접 읽음)
- 알림 경로를 떠나면 토글은 자동으로 OFF (다시 들어와도 OFF)
- 트위터 자체 탭바를 건드리지 않아 X.com DOM 변경에 강함


기술 스택
---------

- Manifest V3 (Chrome/Whale/Edge 호환)
- Vanilla JavaScript (Content Script)
- CSS3


프로젝트 구조
-------------

  Kiwitweet/
    manifest.json        확장 프로그램 매니페스트 (Manifest V3)
    content.js           콘텐츠 스크립트 (토글/필터 로직)
    styles.css           토글/숨김 스타일
    icons/
      icon16.png  icon48.png  icon128.png
    Kiwitweet_icon.svg   원본 픽셀아트 (16x16)
    Kiwitweet_icon.png   원본 PNG (64x64)
    Kiwitweet_icon.ico   ICO 변환본
    README.txt           (이 문서)
    WORK_LOG.md          작업 로그


다운로드
--------

다음 둘 중 한 곳에서 받을 수 있다.

- GitHub: https://github.com/Kiwwwicat/Kiwitweet
- 트위터(X) @Kiwwwicat의 배포 트윗에서 다운로드
  https://x.com/Kiwwwicat


설치 (개발자 모드)
------------------

1. 받은 zip 파일을 압축 해제
2. chrome://extensions (또는 whale://extensions, edge://extensions) 접속
3. "개발자 모드" 활성화
4. "압축해제된 확장 프로그램을 로드합니다" 클릭 -> Kiwitweet 폴더 선택
5. https://x.com/notifications 진입 -> 우상단 토글 클릭


환경 설정
---------

- 별도 API 키/서버/권한 불필요 (storage 권한도 사용 안 함)
- 어떤 데이터도 저장하지 않는다. 답글 여부는 매번 트위터 DOM에서
  reply 카운트를 직접 읽어 판정한다.


제작자
------

@Kiwwwicat
https://x.com/Kiwwwicat


개발 환경
---------

이 확장 프로그램은 Anthropic Claude(Claude Code)를 활용해 개발되었다.


버전
----

v1.0.0 (2026-04-30 릴리즈)
