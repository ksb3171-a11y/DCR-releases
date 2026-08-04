/* ════════════════════════════════════════════════════════════════════════
 *  발표 내용 — 이 파일이 슬라이드의 원본입니다.
 *
 *  ★ 화면에서 편집하세요. (덱을 열고 E 키 → 편집 모드)
 *    직접 손으로 고쳐도 되지만, 좌표(x,y,w,h)는 캔버스 1600×900 기준 픽셀입니다.
 *
 *  ⚠ 검증 수치는 여기 없습니다 — data/verification.js(자동 생성)에서 옵니다.
 *    type:'vtable' 요소와 [data-bind] 표시는 엔진이 매번 원천에서 채웁니다.
 *
 *  최초 생성: frontend/scripts/convert-deck.mjs
 * ══════════════════════════════════════════════════════════════════════ */
window.__DECK__ = {
 "meta": {
  "title": "STRIX — 한국건축구조기술사회 발표자료",
  "canvas": {
   "w": 1600,
   "h": 900
  },
  "footer": "STRIX — LPK SOFT Co., Ltd.",
  "printTheme": "light",
  "appendixA": true,
  "appendixCols": 2,
  "appendixK": 0.85,
  "chapters": [
   {
    "id": "c1",
    "title": "개요"
   },
   {
    "id": "c2",
    "title": "프로그램 소개"
   },
   {
    "id": "c3",
    "title": "정확도 검증"
   },
   {
    "id": "c4",
    "title": "주요 차별화 기능",
    "groups": [
     {
      "id": "g1",
      "title": "지원 기능"
     },
     {
      "id": "g2",
      "title": "모델링"
     },
     {
      "id": "g3",
      "title": "후처리"
     },
     {
      "id": "g4",
      "title": "내진성능평가 · PBSD"
     },
     {
      "id": "g5",
      "title": "산출물 자동화"
     },
     {
      "id": "g6",
      "title": "AI Support"
     }
    ]
   }
  ],
  "toc": {
   "after": "s01",
   "title": "목차",
   "kicker": "Contents",
   "cols": 3
  }
 },
 "slides": [
  {
   "id": "s01",
   "name": "표지",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 228.1,
     "w": 1376,
     "h": 38.9,
     "html": "<div class=\"ctag\">구조엔지니어의 기술독립을 위해 만들었습니다.</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 289.4,
     "w": 1376,
     "h": 176,
     "html": "<div class=\"ctitle\">STRIX</div>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 491,
     "w": 1376,
     "h": 64.8,
     "html": "<div class=\"csub\">OpenSees 기반 구조해석 · 설계 통합 플랫폼</div>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 710.3,
     "w": 262.7,
     "h": 49.3,
     "html": "<div class=\"ev\">한국건축구조기술사회</div>"
    },
    {
     "id": "e5",
     "type": "text",
     "x": 112,
     "y": 759.5,
     "w": 262.7,
     "h": 41.5,
     "html": "<div>2026. 8.</div>"
    },
    {
     "id": "e6",
     "type": "text",
     "x": 112,
     "y": 801,
     "w": 262.7,
     "h": 41.5,
     "html": "<div>LPK SOFT Co., Ltd.</div>"
    }
   ]
  },
  {
   "id": "s03",
   "name": "왜 만들었나",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Motivation</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">왜 만들었나?</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">더이상 상용 구조해석 프로그램의 시장독점과 횡포에 휘둘리지 않고, 구조엔지니어에게 진정으로 필요한 기능이 원활히 구현되는 실무 구조엔지니어가 직접 만드는 프로그램을 만들고 싶었습니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 352,
     "w": 439.5,
     "h": 262.6,
     "html": "<div class=\"card\">\n        <h3>① 고가의 비용</h3>\n        <p>타사 해석 프로그램의 라이선스 초기 구입비와 고가의 유지관리 비용이 부담스럽고, 이를 우리가 통제할수 없습니다.</p>\n      </div>"
    },
    {
     "id": "e5",
     "type": "text",
     "x": 580.3,
     "y": 352.2,
     "w": 439.5,
     "h": 262.6,
     "html": "<div class=\"card\">\n        <h3>② 시장횡포</h3>\n        <p>새로운 기능 추가시 별도의 모듈로 추가비용을 부담해야 하고, 유지관리 비용을 내지 않을 경우 업데이트 지원을 받을수 없는 부당함이 있었습니다.</p>\n      </div>"
    },
    {
     "id": "e6",
     "type": "text",
     "x": 1048.5,
     "y": 352.2,
     "w": 439.5,
     "h": 262.6,
     "html": "<div class=\"card\">\n        <h3>③ 업데이트</h3>\n        <p>필요한 기능 요청시 기다리는 수밖에 없습니다.\n           새로운 재료모델·요소·해석기법을 실무에 적용하려면\n           공급사의 개발 계획에 의존해야 합니다.</p>\n      </div>"
    },
    {
     "id": "e7",
     "type": "text",
     "x": 112,
     "y": 640.4,
     "w": 1376,
     "h": 73.3,
     "html": "<div class=\"split-note\">\n      세 문제의 뿌리는 하나입니다 — 실무경험이 있는&nbsp;<b>구조엔지니어가 직접 만드는 프로그램.</b>\n      그래서 STRIX는 <b>열려 있는 엔진</b>에서 시작했습니다.\n    </div>"
    }
   ],
   "ch": "c1"
  },
  {
   "id": "s02",
   "name": "3분 요약",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Executive Summary</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">&nbsp;STRIX 개요</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 291.8,
     "w": 439.5,
     "h": 283.9,
     "html": "<div class=\"card accent\">\n        <div class=\"num\"><span data-bind=\"_.total\">21</span><span style=\"font-size:.45em\">건</span></div>\n        <h3>국제 벤치마크 전건 통과</h3>\n        <p>CSI SAP2000 공식 검증예제 · NAFEMS · 고전 이론해와 대조.\n           개별 검증항목 <b data-bind=\"_.quantities\">131</b>개 전부 PASS.</p>\n      </div>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 580.3,
     "y": 291.8,
     "w": 439.5,
     "h": 283.9,
     "html": "<div class=\"card\">\n        <div class=\"num\">OpenSees</div>\n        <h3>세계 표준 연구용 솔버</h3>\n        <p>미국 PEER 주도로 개발된 오픈소스 유한요소 프레임워크.\n           비선형·지진해석 분야의 사실상 표준.</p>\n      </div>"
    },
    {
     "id": "e5",
     "type": "text",
     "x": 1048.5,
     "y": 291.8,
     "w": 439.5,
     "h": 283.9,
     "html": "<div class=\"card\">\n        <div class=\"num\">All In One</div>\n        <h3>실무 전 과정을 한 앱에</h3>\n        <p>모델링 · 해석 · 설계 · 내진성능평가 · 성능기반설계 ·\n           계산서 · 도면 · 물량까지 All In One Solution</p>\n      </div>"
    },
    {
     "id": "e6",
     "type": "text",
     "x": 112,
     "y": 601.3,
     "w": 1376,
     "h": 108.3,
     "html": "<div class=\"split-note\">\n      <b>STRIX는 </b>전 세계 연구자가 30년간 검증해 온 <b style=\"background-color: rgb(22, 24, 28); font-size: 21.6px;\">OpenSees </b><span style=\"font-size: 21.6px;\">엔진의 정확성과 </span><b style=\"font-size: 21.6px;\">구조엔지니어가 설계에 전념하도록 반복되는 전·후처리 입력과 설계 자동화</b><span style=\"font-size: 21.6px;\">를 구현했습니다.\n      그리고 그 결과가 맞는지를 </span><b style=\"font-size: 21.6px;\">공개된 국제 검증예제로 스스로 증명</b><span style=\"font-size: 21.6px;\">합니다.</span><b style=\"background-color: rgb(22, 24, 28); font-size: 21.6px;\"><br></b></div>"
    }
   ],
   "ch": "c1"
  },
  {
   "id": "s04",
   "name": "핵심 Keyword",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Core Keywords</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">STRIX를 이루는 다섯 가지</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 328,
     "w": 252.2,
     "h": 345.5,
     "html": "<div class=\"card\">\n        <h3>Open-Source<br>Solver</h3>\n        <p>해석 엔진은 <b>OpenSees</b>.\n           전 세계가 검증해 온 오픈소스 코드를 사용합니다.</p>\n      </div>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 393,
     "y": 328,
     "w": 252.2,
     "h": 345.5,
     "html": "<div class=\"card accent\">\n        <h3>Accuracy</h3>\n        <p>공개된 국제 검증예제로 <b>스스로 증명</b>합니다.\n           숫자와 증거를 함께 공개합니다.</p>\n      </div>"
    },
    {
     "id": "e5",
     "type": "text",
     "x": 673.9,
     "y": 328,
     "w": 252.2,
     "h": 345.5,
     "html": "<div class=\"card\">\n        <h3>User-friendly<br>UI</h3>\n        <p>익숙한 리본 체계.\n           <b>새로 배우지 않아도</b> 쓸 수 있는 화면을 목표로 했습니다.</p>\n      </div>"
    },
    {
     "id": "e6",
     "type": "text",
     "x": 954.9,
     "y": 328,
     "w": 252.2,
     "h": 345.5,
     "html": "<div class=\"card\">\n        <h3>AI Prompt</h3>\n        <p>전처리와 후처리 양쪽에 AI를 활용해 모델을 만들고, 편집하고, 결과를 읽어 줍니다.</p>\n      </div>"
    },
    {
     "id": "e7",
     "type": "text",
     "x": 1235.8,
     "y": 328,
     "w": 252.2,
     "h": 345.5,
     "html": "<div class=\"card\">\n        <h3>All In One</h3>\n        <p>모델링부터 설계, 최종결과물까지 제공합니다. 탄성,비탄성,판해석,단위부재설계를 모두 지원합니다.</p>\n      </div>"
    }
   ],
   "ch": "c1"
  },
  {
   "id": "s06",
   "name": "OpenSees란",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Solver</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">OpenSees</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">Open System for Earthquake Engineering Simulation</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 280.9,
     "w": 808.3,
     "h": 345.6,
     "html": "<ul class=\"bul\">\n          <li><b>지진공학·구조공학 시뮬레이션을 위한 오픈소스 유한요소 프레임워크</b>\n            <span class=\"sub\">구조물과 지반의 지진 응답을 모사하기 위해 개발되었습니다.</span></li>\n          <li><b>미국 PEER(태평양지진공학연구센터) 주도</b>\n            <span class=\"sub\">UC 버클리를 비롯한 미국 주요 대학이 참여해 개발했습니다.</span></li>\n          <li><b>전 세계 지진·구조 연구자의 표준 도구</b>\n            <span class=\"sub\">비선형 해석 논문에서 가장 널리 쓰이는 연구용 코드 중 하나입니다.</span></li>\n          <li><b>C++ 객체지향 구조</b>\n            <span class=\"sub\">재료·요소·알고리즘을 코드로 추가할 수 있게 설계되었습니다.</span></li>\n        </ul>",
     "k": 0.9986
    },
    {
     "id": "e5",
     "type": "text",
     "x": 112,
     "y": 652.1,
     "w": 808.3,
     "h": 108.2,
     "html": "<div class=\"split-note\">\n          연구 영역에서 30년 가까이 <b>수많은 연구자가 사용하고 검증해 온 코드</b>입니다.\n          STRIX는 이 검증의 축적 위에 서 있습니다.\n        </div>",
     "k": 0.9986
    },
    {
     "id": "e6",
     "type": "text",
     "x": 949.1,
     "y": 280.9,
     "w": 538.9,
     "h": 504.3,
     "html": "<svg class=\"dia\" viewBox=\"0 0 540 505\" preserveAspectRatio=\"xMidYMid meet\" role=\"img\"\n  aria-label=\"OpenSees 프레임워크 구성과 STRIX 가 맡는 자리\">\n <text x=\"0\" y=\"13\" class=\"t3\" font-size=\"12\" letter-spacing=\"1.6\">FRAMEWORK</text>\n\n <rect class=\"bx-a\" x=\"0\"  y=\"28\"  width=\"360\" height=\"62\" rx=\"6\"/>\n <text x=\"16\" y=\"52\"  class=\"ta\" font-size=\"15\">ModelBuilder</text>\n <text x=\"16\" y=\"74\"  class=\"t2\" font-size=\"12.5\">해석 모델을 정의하는 입력 계층</text>\n\n <path class=\"ln-a\" d=\"M180 90 L180 112\" stroke-width=\"1.4\"/>\n <path class=\"ln-a\" d=\"M175 106 L180 113 L185 106\" stroke-width=\"1.4\"/>\n\n <rect class=\"bx\" x=\"0\" y=\"113\" width=\"360\" height=\"104\" rx=\"6\"/>\n <text x=\"16\" y=\"137\" class=\"t1\" font-size=\"15\">Domain</text>\n <text x=\"16\" y=\"160\" class=\"t2\" font-size=\"12.5\">Node · Element · Material · Section</text>\n <text x=\"16\" y=\"180\" class=\"t2\" font-size=\"12.5\">Constraint · Load · Mass</text>\n <text x=\"16\" y=\"202\" class=\"t3\" font-size=\"11.5\">모델의 상태를 보관하는 컨테이너</text>\n\n <path class=\"ln\" d=\"M180 217 L180 239\" stroke-width=\"1.4\"/>\n <path class=\"ln\" d=\"M175 233 L180 240 L185 233\" stroke-width=\"1.4\"/>\n\n <rect class=\"bx\" x=\"0\" y=\"240\" width=\"360\" height=\"124\" rx=\"6\"/>\n <text x=\"16\" y=\"264\" class=\"t1\" font-size=\"15\">Analysis</text>\n <text x=\"16\" y=\"287\" class=\"t2\" font-size=\"12.5\">Constraint Handler · DOF Numberer</text>\n <text x=\"16\" y=\"307\" class=\"t2\" font-size=\"12.5\">System of Equations · Solver</text>\n <text x=\"16\" y=\"327\" class=\"t2\" font-size=\"12.5\">Algorithm · Integrator · Convergence Test</text>\n <text x=\"16\" y=\"349\" class=\"t3\" font-size=\"11.5\">푸는 방법을 조립해서 바꿀 수 있다</text>\n\n <path class=\"ln\" d=\"M180 364 L180 386\" stroke-width=\"1.4\"/>\n <path class=\"ln\" d=\"M175 380 L180 387 L185 380\" stroke-width=\"1.4\"/>\n\n <rect class=\"bx-a\" x=\"0\" y=\"387\" width=\"360\" height=\"62\" rx=\"6\"/>\n <text x=\"16\" y=\"411\" class=\"ta\" font-size=\"15\">Recorder</text>\n <text x=\"16\" y=\"433\" class=\"t2\" font-size=\"12.5\">계산 결과를 파일로 내보내는 출력 계층</text>\n\n <path class=\"ln-a\" d=\"M372 40 L384 40 L384 78 L372 78\" stroke-width=\"1.3\"/>\n <text x=\"392\" y=\"52\" class=\"ta\" font-size=\"12.5\">STRIX 가</text>\n <text x=\"392\" y=\"70\" class=\"ta\" font-size=\"12.5\">여기를 씁니다</text>\n <text x=\"392\" y=\"92\" class=\"t3\" font-size=\"11.5\">모델 → 입력 스크립트</text>\n\n <path class=\"ln-a\" d=\"M372 399 L384 399 L384 437 L372 437\" stroke-width=\"1.3\"/>\n <text x=\"392\" y=\"411\" class=\"ta\" font-size=\"12.5\">STRIX 가</text>\n <text x=\"392\" y=\"429\" class=\"ta\" font-size=\"12.5\">여기를 읽습니다</text>\n <text x=\"392\" y=\"451\" class=\"t3\" font-size=\"11.5\">결과 → 표 · 그래프 · 설계</text>\n\n <path class=\"ln\" d=\"M372 120 L382 120 L382 357 L372 357\" stroke-width=\"1.1\" stroke-dasharray=\"4 3\"/>\n <text x=\"392\" y=\"228\" class=\"t3\" font-size=\"11.5\">해석의 정확도는</text>\n <text x=\"392\" y=\"246\" class=\"t3\" font-size=\"11.5\">OpenSees 가</text>\n <text x=\"392\" y=\"264\" class=\"t3\" font-size=\"11.5\">책임지는 영역</text>\n\n <text x=\"0\" y=\"474\" class=\"t3\" font-size=\"11.5\">Domain 과 Analysis 가 분리돼 있어, 같은 모델을</text>\n <text x=\"0\" y=\"492\" class=\"t3\" font-size=\"11.5\">정적 · 고유치 · 응답스펙트럼 · 비선형 해석에 그대로 쓴다.</text>\n</svg>"
    }
   ],
   "ch": "c2"
  },
  {
   "id": "s07",
   "name": "OpenSees 강점",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Why OpenSees</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">왜 이 엔진인가?</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 302.5,
     "w": 439.5,
     "h": 262.6,
     "html": "<div class=\"card\">\n        <h3>강력한 비선형 해석</h3>\n        <p>구조물이 강한 지진하중을 받아 손상·붕괴에 이르는 과정과 같은\n           복잡한 <b>비선형 동적해석</b>에서 탁월한 성능을 보입니다.\n           성능기반설계가 요구하는 영역입니다.</p>\n      </div>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 580.3,
     "y": 302.5,
     "w": 439.5,
     "h": 262.6,
     "html": "<div class=\"card\">\n        <h3>오픈소스 · 확장성</h3>\n        <p>C++ 객체지향 구조로 설계되어 새로운 <b>재료모델 · 요소 · 알고리즘</b>을\n           직접 구현해 추가할 수 있습니다. 필요한 기능을 기다리지 않아도 됩니다.</p>\n      </div>"
    },
    {
     "id": "e5",
     "type": "text",
     "x": 1048.5,
     "y": 302.5,
     "w": 439.5,
     "h": 262.6,
     "html": "<div class=\"card\">\n        <h3>지반-구조물 상호작용</h3>\n        <p>구조물뿐 아니라 <b>지반의 거동까지 함께 모델링</b>할 수 있어,\n           지반과 구조물이 서로 미치는 영향을 통합적으로 다룰 수 있습니다.</p>\n      </div>"
    },
    {
     "id": "e6",
     "type": "text",
     "x": 112,
     "y": 590.7,
     "w": 1376,
     "h": 108.3,
     "html": "<div class=\"split-note\">STRIX는 실제로 이 프레임워크 위에\n      <b>자체 요소와 자체 힌지 모델을 구현해</b> 쓰고 있으며, 그 요소들도 검증 대상에 포함했습니다.\n    </div>"
    }
   ],
   "ch": "c2"
  },
  {
   "id": "s10",
   "name": "UI",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">User Interface</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">사용자를 배려한 UI / 편리한 조작감</h2>"
    },
    {
     "id": "e3",
     "type": "image",
     "x": 112,
     "y": 216,
     "w": 809,
     "h": 585,
     "slot": "s10_app_full",
     "kind": "user",
     "src": "",
     "caption": "STRIX 작업 화면",
     "fit": "fill",
     "recW": "1920",
     "recH": "1080",
     "k": 0.9978,
     "frame": "fixed"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 949.1,
     "y": 216.3,
     "w": 538.9,
     "h": 446.2,
     "html": "<ul class=\"bul\">\n          <li><b>리본 기반 상단 메뉴 17개 탭</b>\n            <span class=\"sub\">국내 실무자에게 익숙한 구성을 따랐습니다. 메뉴 제목만 보고도 기능을 찾을 수 있는 것을 목표로 했습니다.</span></li>\n          <li><b>좌측 모델 트리 · 중앙 3D 뷰포트</b>\n            <span class=\"sub\">확대·축소·회전·이동, 시점 프리셋(<span class=\"mi\">ISO</span> <span class=\"mi\">Top</span> <span class=\"mi\">Front</span>)을 우상단에서 즉시 전환합니다.</span></li>\n          <li><b>모든 입력에 확정 버튼</b>\n            <span class=\"sub\">값을 넣고 <span class=\"mi\">Apply</span>를 누르는 시점이 곧 \"내가 결정했다\"는 시점입니다. 반영 여부를 화면에서 확인할 수 있게 했습니다.</span></li>\n          <li><b>따라하기식 도움말 내장</b>\n            <span class=\"sub\">메뉴별 안내 문서를 앱 안에 두었습니다.</span></li>\n        </ul>",
     "k": 0.9978
    }
   ],
   "ch": "c2"
  },
  {
   "id": "s11",
   "name": "Accuracy — 4단계 검증 체계",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Accuracy</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">정확도를 어떻게 증명할 것인가?</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">네 단계로 나누어 접근합니다. 아래로 갈수록 실무에 가까워집니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 355.9,
     "w": 327.2,
     "h": 255.3,
     "html": "<div class=\"st now\">\n        <div class=\"n\">STEP 1 <span class=\"ko\">— 완료</span></div>\n        <h4>FEM 단위요소 검증</h4>\n        <p>보 · 셸 · 판 · 트러스 · 링크 등 <b>요소 단위</b>로\n           국제 벤치마크 및 고전 이론해와 대조.\n           <span class=\"tag pass\"><span data-bind=\"_.total\">21</span>건 전체 PASS</span></p>\n      </div>"
    },
    {
     "id": "e5",
     "type": "text",
     "x": 461.6,
     "y": 355.9,
     "w": 327.2,
     "h": 255.3,
     "html": "<div class=\"st\">\n        <div class=\"n\">STEP 2 <span class=\"ko\">— 진행 예정</span></div>\n        <h4>구조형식별 예제 검증</h4>\n        <p><b>한국건축구조기술사회</b>와 함께\n           실제 구조형식별 건물 모델로 검증.\n           1차 · 2차 연구로 구분.</p>\n      </div>"
    },
    {
     "id": "e6",
     "type": "text",
     "x": 811.2,
     "y": 355.9,
     "w": 327.2,
     "h": 255.3,
     "html": "<div class=\"st\">\n        <div class=\"n\">STEP 3</div>\n        <h4>AI Prompt 검증</h4>\n        <p>AI가 만든 모델·읽은 결과가\n           <b>맞는지</b>를 별도로 검증.\n           AI 출력도 검증 대상입니다.</p>\n      </div>"
    },
    {
     "id": "e7",
     "type": "text",
     "x": 1160.8,
     "y": 355.9,
     "w": 327.2,
     "h": 255.3,
     "html": "<div class=\"st\">\n        <div class=\"n\">STEP 4</div>\n        <h4>보고서 자동화 검토</h4>\n        <p>자동 생성되는 구조계산서의\n           내용·서식이 실무 기준에 맞는지\n           검토합니다.</p>\n      </div>"
    },
    {
     "id": "e8",
     "type": "text",
     "x": 112,
     "y": 636.8,
     "w": 1376,
     "h": 73.3,
     "html": "<div class=\"split-note\">\n      <b>순서에 뜻이 있습니다.</b> 요소가 맞지 않으면 건물도 맞지 않습니다.\n      그래서 요소 단위부터 숫자로 끝내고, 그 위에서 구조형식별 검증으로 올라갑니다.\n    </div>"
    }
   ],
   "ch": "c3",
   "toc": "4단계 검증 체계"
  },
  {
   "id": "s12",
   "name": "검증 하네스",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Step 1 · How</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">무엇을, 어떻게 검증했나</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 291.3,
     "w": 299,
     "h": 121,
     "html": "<div class=\"step\"><div class=\"t\">벤치마크 모델</div><div class=\"d\">국제 검증예제를 코드로 구성</div></div>",
     "v": "mid"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 427,
     "y": 291.3,
     "w": 28,
     "h": 121,
     "html": "<div class=\"arr\">▶</div>",
     "v": "mid"
    },
    {
     "id": "e5",
     "type": "text",
     "x": 471,
     "y": 291.3,
     "w": 299,
     "h": 121,
     "html": "<div class=\"step hi\"><div class=\"t\">실제 앱 코드경로</div><div class=\"d\">입력 생성 → 엔진 → 결과 파싱</div></div>",
     "v": "mid"
    },
    {
     "id": "e6",
     "type": "text",
     "x": 786,
     "y": 291.3,
     "w": 28,
     "h": 121,
     "html": "<div class=\"arr\">▶</div>",
     "v": "mid"
    },
    {
     "id": "e7",
     "type": "text",
     "x": 830,
     "y": 291.3,
     "w": 299,
     "h": 121,
     "html": "<div class=\"step\"><div class=\"t\">참조해와 대조</div><div class=\"d\">항목별 오차 · 허용치 판정</div></div>",
     "v": "mid"
    },
    {
     "id": "e8",
     "type": "text",
     "x": 1145,
     "y": 291.3,
     "w": 28,
     "h": 121,
     "html": "<div class=\"arr\">▶</div>",
     "v": "mid"
    },
    {
     "id": "e9",
     "type": "text",
     "x": 1189,
     "y": 291.3,
     "w": 299,
     "h": 121,
     "html": "<div class=\"step hi\"><div class=\"t\">검증 기록</div><div class=\"d\">단일 원천 · 회귀 감시</div></div>",
     "v": "mid"
    },
    {
     "id": "e10",
     "type": "text",
     "x": 112,
     "y": 447.5,
     "w": 439.5,
     "h": 262.6,
     "html": "<div class=\"card\">\n        <h3>실제 코드로 돌립니다</h3>\n        <p>검증용 별도 계산기를 만들지 않았습니다.\n           <b>사용자가 쓰는 바로 그 경로</b>(입력 생성 → OpenSees → 결과 파싱)를\n           화면만 떼고 그대로 실행합니다.</p>\n      </div>"
    },
    {
     "id": "e11",
     "type": "text",
     "x": 580.3,
     "y": 447.5,
     "w": 439.5,
     "h": 262.6,
     "html": "<div class=\"card\">\n        <h3>숫자는 한 곳에만 있습니다</h3>\n        <p>검증 결과는 기록 파일 하나에 저장되고,\n           보고서 · 웹페이지 · 이 발표자료의 표가 <b>모두 거기서 파생</b>됩니다.\n           같은 숫자를 두 번 적는 곳이 없습니다.</p>\n      </div>"
    },
    {
     "id": "e12",
     "type": "text",
     "x": 1048.5,
     "y": 447.5,
     "w": 439.5,
     "h": 262.6,
     "html": "<div class=\"card\">\n        <h3>한 번이 아니라 계속</h3>\n        <p>코드를 고칠 때마다 다시 돌립니다.\n           허용 오차를 벗어나면 <b>빌드가 실패</b>합니다.\n           \"예전엔 맞았다\"가 성립하지 않는 구조입니다.</p>\n      </div>"
    }
   ],
   "ch": "c3",
   "toc": "검증 하네스"
  },
  {
   "id": "s13",
   "name": "검증결과 ① 정적 · 요소",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Step 1 · Results ①</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">정적 · 요소 계열 검증</h2>"
    },
    {
     "id": "e3",
     "type": "vtable",
     "x": 112,
     "y": 212,
     "w": 1376,
     "h": 577.6,
     "kind": "static",
     "k": 0.8396
    }
   ],
   "note": "※ 오차 = (STRIX − 참조해) / 참조해. 허용치는 벤치마크별로 사전에 정한 값입니다.",
   "ch": "c3",
   "toc": "검증결과 ① 정적 · 요소"
  },
  {
   "id": "s14",
   "name": "검증결과 ② 동적 · 비선형",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Step 1 · Results ②</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">동적 · 비선형 계열 검증</h2>"
    },
    {
     "id": "e3",
     "type": "vtable",
     "x": 112,
     "y": 224.8,
     "w": 1376,
     "h": 551.8,
     "kind": "dynamic",
     "k": 0.8778
    }
   ],
   "note": "※ 고유치 · 응답스펙트럼 · Pushover · 시간이력 · 자체 개발 요소까지 포함합니다.",
   "ch": "c3",
   "toc": "검증결과 ② 동적 · 비선형"
  },
  {
   "id": "s15",
   "name": "대표예제 — NAFEMS LE1",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Case Study ①</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">NAFEMS LE1 — 타원 막판</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">국제 유한요소 벤치마크 협회(NAFEMS)의 표준 선형탄성 예제입니다.</p>"
    },
    {
     "id": "e4",
     "type": "image",
     "x": 112,
     "y": 280.9,
     "w": 538.9,
     "h": 504.3,
     "slot": "s15_nafems_geom",
     "kind": "user",
     "src": "",
     "caption": "NAFEMS LE1 형상 및 하중",
     "fit": "contain",
     "recW": "1000",
     "recH": "800",
     "k": 0.9986
    },
    {
     "id": "e5",
     "type": "text",
     "x": 679.6,
     "y": 280.9,
     "w": 808.4,
     "h": 356.3,
     "html": "<ul class=\"bul\">\n          <li><b>무엇을 보는가</b>\n            <span class=\"sub\">타원형 구멍이 뚫린 판의 특정 위치에서 <b>접선방향 응력</b>을 참조값과 대조합니다. 응력은 변위보다 수렴이 까다로워, 요소의 품질이 그대로 드러납니다.</span></li>\n          <li><b>왜 어려운가</b>\n            <span class=\"sub\">곡선 경계를 유한요소로 근사해야 하므로, 메쉬를 조밀하게 할수록 정답에 다가가는 <b>수렴 거동</b> 자체가 평가 대상입니다.</span></li>\n          <li><b>결과</b>\n            <span class=\"sub\">메쉬를 단계적으로 세분하며 참조값에 <b>단조 접근</b>함을 확인했고, 가장 조밀한 메쉬에서 오차\n              <b class=\"num-ok\" data-bind=\"SB2.errorPct\">-1.99 %</b>\n              (허용 <b data-bind=\"SB2.tolerancePct\">3.00 %</b>) 로 통과했습니다.</span></li>\n        </ul>",
     "k": 0.9986
    },
    {
     "id": "e6",
     "type": "text",
     "x": 679.6,
     "y": 662.7,
     "w": 808.4,
     "h": 108.2,
     "html": "<div class=\"split-note\">\n          한 번의 계산으로 \"맞았다\"고 하지 않고, <b>메쉬를 바꿔가며 수렴하는지</b>를 봅니다.\n          우연히 맞는 것과 제대로 맞는 것은 다릅니다.\n        </div>",
     "k": 0.9986
    }
   ],
   "ch": "c3",
   "toc": "대표예제 ① NAFEMS LE1"
  },
  {
   "id": "s16",
   "name": "대표예제 — 3D 편심 응답스펙트럼",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Case Study ②</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">3차원 편심 건물의 응답스펙트럼 해석</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">상용 프로그램이 자사 정확도를 증명할 때 쓰는 <b>공개 검증예제</b>와 동일한 문제를 풀었습니다.</p>"
    },
    {
     "id": "e4",
     "type": "vtable",
     "x": 112,
     "y": 280.5,
     "w": 1376,
     "h": 372.7,
     "kind": "one",
     "vid": "SR2",
     "k": 0.7138
    },
    {
     "id": "e5",
     "type": "text",
     "x": 112,
     "y": 678.5,
     "w": 1376,
     "h": 107,
     "html": "<div class=\"split-note\">\n      질량중심과 강성중심이 어긋난 <b>비틀림 거동</b>을 포함하고,\n      모드 조합법(CQC · SRSS · ABS 등)까지 각각 대조합니다.\n      실무에서 가장 자주 쓰는 해석이면서, 조합 규칙 하나만 달라도 답이 벌어지는 영역입니다.\n    </div>",
     "k": 0.9872
    }
   ],
   "ch": "c3",
   "toc": "대표예제 ② 3D 편심 응답스펙트럼"
  },
  {
   "id": "s18",
   "name": "Step 2 — 구조형식별 검증",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Step 2</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">구조형식별 예제 검증 — 공동연구 제안</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">요소 단위 검증이 끝났으니, 다음은 <b>실제 건물</b>입니다. 한국건축구조기술사회와 함께하고자 합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 277.3,
     "w": 675.9,
     "h": 393.8,
     "html": "<div class=\"card\">\n        <h3>1차 연구 — 구조형식별 실건물</h3>\n        <ul class=\"bul\" style=\"--li: 1;\">\n          <li><b>내력벽식 공동주택</b><span class=\"sub\">전이층 포함 · 파일기초 / 온통기초</span></li>\n          <li><b>건물골조 (학교 건축물)</b><span class=\"sub\"><br></span></li>\n          <li><b>강구조 공장</b><span class=\"sub\"><br></span></li>\n          <li><b>소형 건축물</b><span class=\"sub\"><br></span></li>\n        </ul>\n      </div>",
     "k": 0.8432
    },
    {
     "id": "e5",
     "type": "text",
     "x": 812.1,
     "y": 277.3,
     "w": 675.9,
     "h": 393.8,
     "html": "<div class=\"card\">\n        <h3>2차 연구 — 성능 영역</h3>\n        <ul class=\"bul\" style=\"--li: 1;\">\n          <li><b>기존 건축물 내진성능평가 (학교)</b><span class=\"sub\"><br></span></li>\n          <li><b>성능기반설계</b><span class=\"sub\"><br></span></li>\n        </ul>\n        <p style=\"color: var(--dim); font-size: calc(var(--u)*1.3);\">\n          1차가 <b style=\"color:#fff\">일반 탄성해석</b>의 정합성을 본다면,\n          2차는 <b style=\"color:#fff\">비탄성해석의 영역</b>을 봅니다.\n        </p>\n      </div>",
     "k": 0.8432
    },
    {
     "id": "e6",
     "type": "text",
     "x": 112,
     "y": 687.2,
     "w": 1376,
     "h": 101.6,
     "html": "<div class=\"split-note\" style=\"display:flex;align-items:center;gap:calc(var(--u)*1.6);padding-top:0;padding-bottom:0\">\n        <span style=\"color:var(--accent);font-size:calc(var(--u)*1.05);font-weight:700;letter-spacing:.08em;white-space:nowrap\">공동 검증 파트너</span>\n        <span style=\"width:1px;height:42%;background:var(--line);flex:none\"></span>\n        <span style=\"display:flex;align-items:center;justify-content:space-between;flex:1;color:#fff;font-size:calc(var(--u)*1.55);font-weight:700;white-space:nowrap\">\n          <span>서울대학교</span><span style=\"color:var(--accent);font-size:.8em\">●</span><span>단국대학교</span><span style=\"color:var(--accent);font-size:.8em\">●</span><span>한국건축구조기술사회</span><span style=\"color:var(--accent);font-size:.8em\">●</span><span>LPK SOFT</span>\n        </span>\n      </div>",
     "k": 0.8432
    }
   ],
   "note": "※ 2차 연구는 STRIX가 가장 자신 있는 영역이자, 가장 엄밀한 확인이 필요한 영역입니다.",
   "ch": "c3",
   "toc": "Step 2 — 구조형식별 검증"
  },
  {
   "id": "s41_01",
   "name": "탄성해석",
   "toc": "탄성해석",
   "ch": "c4",
   "grp": "g1",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">선형 탄성해석을 설계의 기준선으로</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">정적 하중과 하중조합을 선형 탄성 범위에서 해석하고, 변위와 부재력을 설계 검토로 연결합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>모델에서 해석까지</b><span class=\"sub\">절점·부재·경계조건·하중을 하나의 모델에서 구성하고 OpenSees 해석 입력으로 변환합니다.</span></li><li><b>결과를 한 흐름으로</b><span class=\"sub\">변형 형상, 반력, 축력·전단력·휨모멘트를 동일한 하중케이스와 조합 기준으로 조회합니다.</span></li><li><b>후속 설계의 출발점</b><span class=\"sub\">RC·강구조·슬래브·기초 설계와 단면 최적화가 탄성해석 결과를 직접 사용합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Analysis ▸ Run Analysis</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 878,
     "y": 272,
     "w": 702,
     "h": 426,
     "slot": "s41_01",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s41_02",
   "name": "고유치해석",
   "toc": "고유치해석",
   "ch": "c4",
   "grp": "g1",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">고유치해석</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">고유주기와 모드형상을 계산해 응답스펙트럼해석과 비선형 해석의 기본 정보를 준비합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>모드별 거동 확인</b><span class=\"sub\">모드형상과 고유주기를 통해 병진·비틀림 거동을 시각적으로 확인합니다.</span></li><li><b>질량 참여를 함께 검토</b><span class=\"sub\">방향별 유효질량과 참여 특성을 확인해 필요한 모드 수를 판단할 수 있습니다.</span></li><li><b>내진 해석과 연결</b><span class=\"sub\">응답스펙트럼, 지진파 스케일링, Pushover의 모드 기반 분포에 같은 결과를 재사용합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Analysis ▸ Eigenvalue</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 856,
     "y": 272,
     "w": 718,
     "h": 357,
     "slot": "s41_02",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s41_03",
   "name": "지원 하중",
   "toc": "지원 하중",
   "ch": "c4",
   "grp": "g1",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">정적·풍·지진·온도 하중을 한 모델에서</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">설계에 필요한 주요 하중을 하중케이스로 구분하고 조합해 구조물의 사용성과 안전성을 검토합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>정적하중</b><span class=\"sub\">자중, 절점하중, 부재하중, 바닥하중 등 기본 하중을 모델에 직접 정의합니다.</span></li><li><b>풍하중과 지진하중</b><span class=\"sub\">건물 정보와 설계 기준을 바탕으로 횡하중을 생성하고 방향별 결과를 비교합니다.</span></li><li><b>온도하중</b><span class=\"sub\">전용 Temp 진입점을 두고 있으며, 온도 변화에 따른 구조 응답 입력은 지원 범위에 포함해 확장합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Load ▸ Load Cases / Temp</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 867,
     "y": 258,
     "w": 487,
     "h": 313,
     "slot": "s41_03",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    },
    {
     "id": "e6",
     "x": 1120,
     "y": 439,
     "w": 406,
     "h": 354,
     "type": "image",
     "kind": "user",
     "src": "",
     "fit": "fill",
     "caption": "",
     "slot": "s41_03_1",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s41_04_windtunnel",
   "name": "풍동데이터 입력기능",
   "toc": "풍동데이터 입력기능",
   "ch": "c4",
   "grp": "g1",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">풍동실험 결과를 12개 풍하중으로 자동 입력</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">실험기관 엑셀의 층별 Fx·Fy·Mz 최대값을 읽어 풍하중 케이스로 모델에 자동 적용합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>풍동실험 엑셀을 그대로 활용</b><span class=\"sub\">실험기관이 제공한 층별 풍하중 데이터를 읽고 건물 정보와 감쇠비, 발행 정보를 함께 확인합니다.</span></li><li><b>12개 풍하중 케이스 자동 생성</b><span class=\"sub\">Fx·Fy·Mz 최대값을 층별 GC 또는 CM 절점에 적용해 반복 입력을 줄입니다.</span></li><li><b>입력 전 교차검증</b><span class=\"sub\">통계식과 층별 합계를 원본 표와 대조해 누락이나 잘못된 입력을 사전에 확인합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Load ▸ Wind ▸ Wind Tunnel Loads</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 869,
     "y": 272,
     "w": 702,
     "h": 427,
     "slot": "s41_04_windtunnel",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1920",
     "recH": "1080",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s41_04",
   "name": "P-Delta 해석",
   "toc": "P-Delta 해석",
   "ch": "c4",
   "grp": "g1",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">P-Delta 해석</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">중력축력과 횡변위의 상호작용을 반영해 고층·세장 구조의 증폭된 응답을 검토합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>2차 효과 반영</b><span class=\"sub\">변형된 형상에서 생기는 추가 모멘트를 고려해 1차 해석이 놓치는 영향을 확인합니다.</span></li><li><b>설정은 해석 제어에서</b><span class=\"sub\">P-Delta 적용 여부와 해석 조건을 모델의 다른 해석 옵션과 함께 관리합니다.</span></li><li><b>설계 결과로 전달</b><span class=\"sub\">증폭된 부재력과 변위가 후처리와 부재 설계의 입력으로 이어집니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Analysis ▸ P-Delta</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s41_04",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s41_08",
   "name": "판해석 (Slab · Mat · Pile)",
   "toc": "판해석 (Slab · Mat · Pile)",
   "ch": "c4",
   "grp": "g1",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">판해석 (Slab, Mat, Pile기초)</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">슬래브와 매트, 파일기초 시스템을 메쉬 모델과 판요소 결과로 일관되게 검토합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>판요소 모델링</b><span class=\"sub\">두께·재료·메쉬를 가진 Plate 요소로 면 구조의 강성과 하중 전달을 반영합니다.</span></li><li><b>결과 컨투어</b><span class=\"sub\">모멘트, 전단력, 응력, 변위 결과를 방향과 면 기준으로 전환해 확인합니다.</span></li><li><b>설계 모듈 연계</b><span class=\"sub\">Slab Design, Mat Foundation, Pile Foundation이 해석 결과와 지반·파일 정보를 이어받습니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Results ▸ Plate Results</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 283,
     "w": 643,
     "h": 436,
     "slot": "s41_08",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s41_09",
   "name": "멀티타워 모델링",
   "toc": "멀티타워 모델링",
   "ch": "c4",
   "grp": "g1",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Multi Tower 해석</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">공통 저층부와 여러 타워를 구역으로 정의하고 모델·하중·결과를 타워별로 관리합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>타워 구역 정의</b><span class=\"sub\">층과 평면 영역을 Tower Zones로 묶어 복합 단지의 소속 관계를 명확히 합니다.</span></li><li><b>공통부와 상부동 분리</b><span class=\"sub\">하나의 해석 모델을 유지하면서 타워별 응답과 공통부 거동을 구분합니다.</span></li><li><b>결과 자동 분류</b><span class=\"sub\">타워별 밑면전단, 보정계수, 층 응답을 같은 소속 규칙으로 집계합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Structure ▸ Towers</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 865,
     "y": 272,
     "w": 675,
     "h": 436,
     "slot": "s41_09",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s41_10",
   "name": "비탄성 정적 해석",
   "toc": "비탄성 정적 해석",
   "ch": "c4",
   "grp": "g1",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Pushover Analysis</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">하중을 점진적으로 증가시키며 소성힌지 발생과 성능점까지 구조물의 비선형 거동을 추적합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>비선형 모델 자동 준비</b><span class=\"sub\">부재 단면과 재료, 해석 목적에 맞춰 힌지 백본과 적용 위치를 구성합니다.</span></li><li><b>하중-변위 곡선</b><span class=\"sub\">제어절점 변위와 밑면전단 관계를 기록해 강성 저하와 최대 강도를 확인합니다.</span></li><li><b>성능 판정 연결</b><span class=\"sub\">힌지 상태와 성능점을 기존건축물 내진성능평가 및 PBSD 검토에 사용합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Seismic / PBD ▸ Run Pushover</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 837,
     "y": 272,
     "w": 697,
     "h": 423,
     "slot": "s41_10",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s41_11",
   "name": "비탄성 시간이력 해석",
   "toc": "비탄성 시간이력 해석",
   "ch": "c4",
   "grp": "g1",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Time History Analysis</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">다수의 지진파 쌍을 입력해 소성화, 층간변위, 에너지와 부재 응답을 시간 단계별로 계산합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>지진파 쌍 관리</b><span class=\"sub\">X·Y 성분과 위험수준을 묶어 해석 케이스를 구성하고 필요한 기록을 선택합니다.</span></li><li><b>비선형 응답 추적</b><span class=\"sub\">힌지·Fiber 모델과 감쇠 조건을 사용해 각 시간 단계의 응답을 기록합니다.</span></li><li><b>설계 통계로 정리</b><span class=\"sub\">지진파별 결과를 평균 또는 포락 기준으로 모아 PBSD 판정과 보고서 자료로 연결합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Seismic / PBD ▸ Run THA</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 284,
     "w": 664,
     "h": 443,
     "slot": "s41_11",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s41_12",
   "name": "DesignPad",
   "toc": "DesignPad",
   "ch": "c4",
   "grp": "g1",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">DesignPad - 단위부재설계</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">RC·Steel·PC/PSC·Misc 계산 도구를 한곳에 모아 손계산 확인과 모델 기반 설계를 지원합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>독립 계산 도구</b><span class=\"sub\">보·기둥·벽·슬래브·기초 등 필요한 부재를 모델과 별개로 빠르게 검토합니다.</span></li><li><b>모델에서 값 가져오기</b><span class=\"sub\">단면·재료·배근과 지배 부재력을 불러와 반복 입력을 줄입니다.</span></li><li><b>계산서로 바로 출력</b><span class=\"sub\">여러 부재를 일괄 검토하고 각 계산 결과를 이미지 또는 PDF 형태로 정리합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">DesignPad ▸ RC / Steel / PC·PSC / Misc</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 856,
     "y": 272,
     "w": 691,
     "h": 448,
     "slot": "s41_12",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s41_13",
   "name": "건축투시도 · 드론 영상모드",
   "toc": "건축투시도 · 드론 영상모드",
   "ch": "c4",
   "grp": "g1",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">건축투시도 / 드론 영상모드</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">F11 프레젠테이션 모드에서 원근 카메라, 외피 재질, 환경과 카메라 이동을 조합해 모델을 보여줍니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>건축투시도</b><span class=\"sub\">원근 투영과 외피 표현을 적용해 구조 모델을 이해하기 쉬운 건축 시점으로 전환합니다.</span></li><li><b>드론형 카메라 이동</b><span class=\"sub\">모델 주위를 부드럽게 회전하는 시네마틱 시점으로 규모와 전체 구성을 전달합니다.</span></li><li><b>원래 작업환경 복원</b><span class=\"sub\">프레젠테이션 모드를 종료하면 카메라와 표시 설정을 작업 전 상태로 되돌립니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">F11 ▸ Presentation Mode</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 856,
     "y": 286,
     "w": 706,
     "h": 396,
     "slot": "s41_13",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s42_01",
   "name": "마우스 뷰포트 조작",
   "toc": "마우스 뷰포트 조작",
   "ch": "c4",
   "grp": "g2",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Pan · Move · Zoom을 마우스만으로</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">별도 명령 전환 없이 마우스 드래그와 휠로 모델의 위치, 회전, 확대·축소를 바로 조절합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>우클릭으로 Pan</b><span class=\"sub\">화면 평면을 따라 시점을 이동해 보고 싶은 영역을 중앙에 놓습니다.</span></li><li><b>휠 버튼으로 회전</b><span class=\"sub\">카메라 타깃을 중심으로 모델을 회전해 부재의 공간 관계를 확인합니다.</span></li><li><b>휠로 Zoom</b><span class=\"sub\">직교·원근 카메라 모두에서 확대와 축소를 연속적으로 조절합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">3D Viewport ▸ Mouse Controls</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 864,
     "y": 272,
     "w": 678,
     "h": 439,
     "slot": "s42_01",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s42_02",
   "name": "View 시점 프리셋",
   "toc": "View 시점 프리셋",
   "ch": "c4",
   "grp": "g2",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">View Widget 지원</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">ISO·Top·Front 등 자주 쓰는 시점을 뷰포트 우상단에서 한 번에 전환합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>표준 시점 제공</b><span class=\"sub\">ISO, Front, Back, Left, Right, Top, Bottom 프리셋을 제공합니다.</span></li><li><b>현재 모델 중심 유지</b><span class=\"sub\">모델의 중심과 화면 맞춤 상태를 기준으로 카메라 방향을 바꿉니다.</span></li><li><b>AI 명령과도 동일</b><span class=\"sub\">AI Prompt의 시점 변경도 같은 프리셋 체계를 사용해 조작 결과가 일관됩니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Viewport Upper-right ▸ View Preset</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 840,
     "y": 272,
     "w": 718,
     "h": 433,
     "slot": "s42_02",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s42_03",
   "name": "AI Modeling",
   "toc": "AI Modeling",
   "ch": "c4",
   "grp": "g2",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">AI Modeling</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">사용자의 모델링 의도를 해석해 절점과 부재 생성·수정 작업을 실행 가능한 명령으로 변환합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>명령을 구조화</b><span class=\"sub\">층, 그리드, 부재 종류와 치수를 읽어 모델링 작업 순서를 구성합니다.</span></li><li><b>실행 전 확인</b><span class=\"sub\">AI가 만든 작업 내용을 사용자가 확인한 뒤 모델에 반영하도록 통제합니다.</span></li><li><b>반복 작업 단축</b><span class=\"sub\">규칙적인 골조와 수정 요청을 대화형 입력으로 처리해 클릭 수를 줄입니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Node/Element ▸ AI Modeling</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 828,
     "y": 272,
     "w": 734,
     "h": 456,
     "slot": "s42_03",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s42_04",
   "name": "Model Check",
   "toc": "Model Check",
   "ch": "c4",
   "grp": "g2",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Model Check - 해석 전에 모델 오류부터 찾는다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">연결, 속성, 경계조건과 하중의 이상을 점검해 잘못된 모델로 해석하는 위험을 줄입니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>연결성 점검</b><span class=\"sub\">분리된 절점, 고아 요소, 불완전한 연결처럼 해석 불안정을 만드는 항목을 찾습니다.</span></li><li><b>속성과 조건 점검</b><span class=\"sub\">재료·단면·두께·경계조건·하중 지정 누락을 항목별로 분류합니다.</span></li><li><b>문제 위치로 이동</b><span class=\"sub\">검사 결과에서 해당 객체를 선택하고 뷰포트에서 바로 확인·수정할 수 있습니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Analysis ▸ Model Check</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 856,
     "y": 263,
     "w": 713,
     "h": 443,
     "slot": "s42_04",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s42_05",
   "name": "Import MGT",
   "toc": "Import MGT",
   "ch": "c4",
   "grp": "g2",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">타 프로그램 Import&nbsp;</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">타사 모델링 파일을 Import하여 STRIX 모델로 변환하고 기존 프로젝트 자산을 이어받습니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>주요 모델 정보 변환</b><span class=\"sub\">절점, 프레임, 재료, 단면, 경계조건, 기본 하중과 조합을 가져옵니다.</span></li><li><b>가져온 범위 확인</b><span class=\"sub\">변환 결과와 미지원 항목을 구분해 STRIX에서 추가 정의할 부분을 명확히 합니다.</span></li><li><b>검토부터 빠르게</b><span class=\"sub\">기존 모델을 기반으로 Model Check와 해석·설계 검토를 바로 시작할 수 있습니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">File ▸ Import Midas</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 944,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s42_05",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s42_06",
   "name": "APT auto",
   "toc": "APT auto",
   "ch": "c4",
   "grp": "g2",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">APT Auto - 공동주택 자동 모델링</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">DXF 도면을 기준으로 벽체·절점과 층별 형상을 생성해 반복 모델링을 줄입니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>층고 방식 선택</b><span class=\"sub\">동일 층고와 층별 개별 층고를 모두 지원해 필로티와 변형층을 반영합니다.</span></li><li><b>도면 노이즈 정리</b><span class=\"sub\">최소 길이보다 짧은 선을 제외하고 변환 원본의 중복 잔류를 방지합니다.</span></li><li><b>지점까지 자동 배치</b><span class=\"sub\">생성된 1층 절점에 Fixed·Pin·Base Shear 지점을 선택해 적용합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Structure ▸ APT auto</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 800,
     "y": 262,
     "w": 784,
     "h": 435,
     "slot": "s42_06",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s42_07",
   "name": "Meshed Slab",
   "toc": "Meshed Slab",
   "ch": "c4",
   "grp": "g2",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Meshed Slab</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">슬래브 경계와 개구부를 기준으로 판요소를 분할하고 연결 상태를 구조 모델에 반영합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>형상 기반 메쉬 생성</b><span class=\"sub\">슬래브 외곽과 내부 경계를 따라 해석에 적합한 절점과 Plate 요소를 만듭니다.</span></li><li><b>하중과 질량 보존</b><span class=\"sub\">메쉬 전후에도 슬래브 하중과 지진질량이 누락되지 않도록 동일 데이터 흐름을 사용합니다.</span></li><li><b>판 결과와 설계 연결</b><span class=\"sub\">생성된 요소가 Plate Results와 Slab Design의 결과·설계 영역으로 이어집니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Node/Element ▸ Add Plate</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 665,
     "h": 438,
     "slot": "s42_07",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s42_08",
   "name": "Multi Tower Modeling",
   "toc": "Multi Tower Modeling",
   "ch": "c4",
   "grp": "g2",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Multi Tower 모델링 및 후처리 지원</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">Tower Zones와 Towers를 이용해 공통부 위 여러 동의 모델링과 결과 소속을 일관되게 유지합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>공간 소속 자동 판정</b><span class=\"sub\">층과 평면 위치를 기준으로 부재와 슬래브가 어느 타워에 속하는지 정리합니다.</span></li><li><b>타워별 작업 범위</b><span class=\"sub\">표시·선택·결과 집계를 타워 단위로 좁혀 대형 모델도 관리하기 쉽게 만듭니다.</span></li><li><b>해석 후에도 같은 기준</b><span class=\"sub\">하중 생성과 Scaleup, Tower Results가 동일한 타워 소속 정보를 공유합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Structure ▸ Tower Zones / Towers</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 850,
     "y": 272,
     "w": 725,
     "h": 450,
     "slot": "s42_08",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s42_09",
   "name": "Find Orphans · Purge Nodes",
   "toc": "Find Orphans · Purge Nodes",
   "ch": "c4",
   "grp": "g2",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Find Orphans / Purge Nodes</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">연결되지 않은 요소와 사용되지 않는 절점을 찾아 모델의 위상 오류와 불필요한 데이터를 제거합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>Find Orphans</b><span class=\"sub\">다른 구조 요소와 올바르게 연결되지 않은 객체를 찾아 선택 상태로 보여줍니다.</span></li><li><b>Purge Nodes</b><span class=\"sub\">어떤 요소에도 쓰이지 않는 절점을 찾아 안전하게 정리합니다.</span></li><li><b>해석 전 정리 습관</b><span class=\"sub\">Model Check와 함께 사용해 특이행렬과 의도하지 않은 자유도를 사전에 줄입니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Node/Element ▸ Find Orphans / Purge Nodes</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s42_09",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s42_10",
   "name": "Slab to Wall",
   "toc": "Slab to Wall",
   "ch": "c4",
   "grp": "g2",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Slab to Wall - 벽식구조 바닥하중 절점하중 변환</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">벽식 구조의 슬래브 하중을 지지선과 분담영역에 따라 벽체로 변환해 하중 전달을 명확히 합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>지지 관계 인식</b><span class=\"sub\">슬래브 경계와 인접 벽체를 바탕으로 실제 하중을 받을 지지선을 찾습니다.</span></li><li><b>분담 하중 생성</b><span class=\"sub\">면하중을 벽체 또는 연결 요소가 사용할 수 있는 선하중 형태로 배분합니다.</span></li><li><b>변환 결과 확인</b><span class=\"sub\">생성된 하중을 뷰포트와 하중 목록에서 확인하고 원본 슬래브와 대조합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Load ▸ Slab to Wall</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 817,
     "y": 272,
     "w": 758,
     "h": 433,
     "slot": "s42_10",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s42_11",
   "name": "Principal Axis",
   "toc": "Principal Axis",
   "ch": "c4",
   "grp": "g2",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">회전된 건물의 실제 주축을 자동 산정</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">본 해석 전에 고유치해석을 통해 건물의 주축 방향을 찾고 횡하중·응답 검토의 기준축으로 사용합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>고유치해석을 통한 주축 산정</b><span class=\"sub\">절점과 부재 분포의 2차 모멘트를 이용해 지배적인 평면 방향을 산정합니다.</span></li><li><b>각도로 명확히 표시</b><span class=\"sub\">전역축과 주축의 차이를 각도로 보여주어 회전 건물의 방향을 쉽게 확인합니다.</span></li><li><b>모델을 Rotate하지 않고 지진하중의 입사각을 조정</b><span class=\"sub\">응답스펙트럼 방향과 횡력 검토 등 방향성이 필요한 기능에 같은 축 정보를 사용합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Analysis ▸ Analysis Ctrl ▸ Principal Axis</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 856,
     "y": 272,
     "w": 723,
     "h": 441,
     "slot": "s42_11",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s43_01",
   "name": "Scaleup Factor",
   "toc": "Scaleup Factor",
   "ch": "c4",
   "grp": "g3",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Scaleup Factor</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">정적 지진하중과 응답스펙트럼 밑면전단을 비교해 방향별 보정계수를 계산하고 저장합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>방향별 자동 계산</b><span class=\"sub\">X·Y 방향의 V와 Vt를 같은 층전단 기준으로 추출해 필요한 계수를 구합니다.</span></li><li><b>적용 대상을 구분</b><span class=\"sub\">부재력·층전단·전도모멘트·층변위와 층간변위의 적용 규칙을 분리합니다.</span></li><li><b>계산 근거 출력</b><span class=\"sub\">주기, 스펙트럼, 밑면전단과 계수 산정 과정을 계산서 형태로 확인할 수 있습니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Results ▸ Scaleup Fac.</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 663,
     "h": 479,
     "slot": "s43_01",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s43_02",
   "name": "Lateral Force Check",
   "toc": "Lateral Force Check",
   "ch": "c4",
   "grp": "g3",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Lateral Force Check</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">방향별 지진하중과 풍하중 Base Shear와 최상층 변위를 비교해 횡력 설계의 지배 조건을 빠르게 판단합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>동일 기준으로 비교</b><span class=\"sub\">풍·등가정적지진·응답스펙트럼 결과를 같은 방향과 층 기준으로 나란히 정리합니다.</span></li><li><b>사용성도 함께 확인</b><span class=\"sub\">최상층 풍변위를 설정한 높이비 기준과 대조해 강도와 사용성을 함께 봅니다.</span></li><li><b>검토 자료 저장</b><span class=\"sub\">표와 모델 이미지를 포함한 독립 계산서로 현재 판정 근거를 남깁니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Results ▸ Lateral Force Check</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s43_02",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s43_03",
   "name": "Plate Results",
   "toc": "Plate Results",
   "ch": "c4",
   "grp": "g3",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Plate Result</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">슬래브·벽·매트의 모멘트, 전단, 응력과 변위를 2D·3D 결과 화면에서 확인합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>결과 성분 전환</b><span class=\"sub\">Mxx·Myy·Mxy, 전단력, 응력과 변위 등 필요한 판 결과를 선택합니다.</span></li><li><b>표시 기준 제어</b><span class=\"sub\">Local·Global 방향, Top·Bottom 면, 평균화와 색상 범위를 검토 목적에 맞게 바꿉니다.</span></li><li><b>설계 위치를 발견</b><span class=\"sub\">피크와 분포를 시각적으로 확인하고 슬래브·기초 설계가 필요한 구간을 찾습니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Results ▸ Plate Results</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 856,
     "y": 272,
     "w": 719,
     "h": 419,
     "slot": "s43_03",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s43_04",
   "name": "Beam · Column Section Optimization",
   "toc": "Beam · Column Section Optimization",
   "ch": "c4",
   "grp": "g3",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Beam, Column Section Optimization</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">보와 기둥의 해석·설계 결과를 바탕으로 안전성과 경제성을 함께 만족하는 후보 단면을 비교합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>후보군 일괄 검토</b><span class=\"sub\">사용자가 정한 단면 범위에서 각 후보의 강도와 사용성 조건을 계산합니다.</span></li><li><b>지배 조건 표시</b><span class=\"sub\">축력-모멘트, 전단, 처짐과 세장비 등 단면을 결정한 검토 항목을 보여줍니다.</span></li><li><b>선택 결과 반영</b><span class=\"sub\">채택한 단면을 모델 속성에 반영하고 재해석·재설계 흐름으로 이어갑니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Design Manager ▸ Beam / Column Section Optimization</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s43_04",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s43_05",
   "name": "Safety Review",
   "toc": "Safety Review",
   "ch": "c4",
   "grp": "g3",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Safety Review</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">부재별 검토 결과를 공통 이용률 지표로 모아 위험 구간과 과도한 여유 구간을 시각화합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>설계 결과 통합</b><span class=\"sub\">보·기둥·벽 등 서로 다른 설계 모듈의 지배 D/C 또는 이용률을 한 화면에 모읍니다.</span></li><li><b>색상으로 우선순위화</b><span class=\"sub\">불합격, 주의, 적정, 과다 여유 구간을 색상과 필터로 빠르게 구분합니다.</span></li><li><b>해당 부재로 이동</b><span class=\"sub\">목록과 3D 모델을 연결해 검토가 필요한 부재의 상세 결과를 즉시 엽니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Design Manager ▸ Safety Review</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 817,
     "y": 272,
     "w": 771,
     "h": 412,
     "slot": "s43_05",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s43_06",
   "name": "RC 보 · 기둥 설계",
   "toc": "RC 보 · 기둥 설계",
   "ch": "c4",
   "grp": "g3",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">RC 보, 기둥 최적 설계</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">RC 보와 기둥의 지배 부재력을 조합해 휨·축력·전단 강도와 배근 적정성을 검토합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>보 설계</b><span class=\"sub\">위치별 휨모멘트와 전단력을 포락해 주근·스터럽 요구량과 강도를 검토합니다.</span></li><li><b>기둥 설계</b><span class=\"sub\">축력-이축모멘트 상호작용과 전단, 세장효과를 함께 확인합니다.</span></li><li><b>모델과 계산서 일치</b><span class=\"sub\">모델의 재료·단면·배근과 설계 결과를 같은 데이터로 사용해 계산서를 생성합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Design ▸ Concrete</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 817,
     "y": 272,
     "w": 748,
     "h": 420,
     "slot": "s43_06",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s43_07",
   "name": "전단벽 최적화설계",
   "toc": "전단벽 최적화설계",
   "ch": "c4",
   "grp": "g3",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">전단벽 최적화 설계</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">벽체별 축력·휨·전단 요구량과 경계요소 조건을 검토해 적정 두께와 배근 대안을 찾습니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>벽체력 포락</b><span class=\"sub\">하중조합별 벽체 축력·모멘트·전단력을 설계 위치와 방향별로 정리합니다.</span></li><li><b>배근 대안 비교</b><span class=\"sub\">수직·수평철근과 경계부 배근 후보의 강도와 이용률을 비교합니다.</span></li><li><b>전체 모델 최적화</b><span class=\"sub\">벽체별 결과를 목록과 3D 색상으로 확인해 반복 설계 범위를 줄입니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Design ▸ Design Walls</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 823,
     "y": 261,
     "w": 734,
     "h": 490,
     "slot": "s43_07",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s43_08",
   "name": "강구조 강도검증",
   "toc": "강구조 강도검증",
   "ch": "c4",
   "grp": "g3",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">강구조 설계</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">강구조 단면의 조합력과 좌굴·횡비틀림좌굴 조건을 반영해 부재 강도비를 계산합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>부재별 한계상태</b><span class=\"sub\">인장·압축·휨·전단과 조합강도식을 단면과 지지조건에 맞게 적용합니다.</span></li><li><b>안정성 조건 반영</b><span class=\"sub\">유효길이, 비지지길이와 강·약축 세장비를 설계 파라미터로 관리합니다.</span></li><li><b>지배식 확인</b><span class=\"sub\">최종 이용률뿐 아니라 어떤 검토식과 조합이 단면을 지배했는지 계산서에 표시합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Design ▸ Steel</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 848,
     "y": 272,
     "w": 732,
     "h": 403,
     "slot": "s43_08",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s43_09",
   "name": "Slab Design",
   "toc": "Slab Design",
   "ch": "c4",
   "grp": "g3",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Slab Design</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">판요소 모멘트 결과를 설계 스트립과 방향별 요구철근으로 변환해 슬래브 배근을 검토합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>설계 결과 추출</b><span class=\"sub\">하중조합과 위치별 판모멘트를 설계 방향과 상·하부 기준으로 정리합니다.</span></li><li><b>배근 자동 산정</b><span class=\"sub\">두께, 재료, 피복과 철근 간격 후보로 요구강도와 최소철근 조건을 만족하는 배근을 찾습니다.</span></li><li><b>도면·물량으로 연결</b><span class=\"sub\">확정된 배근 정보를 구조도면과 Quantity Takeoff의 기초 데이터로 활용합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Design ▸ Slab Design</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 884,
     "y": 264,
     "w": 691,
     "h": 495,
     "slot": "s43_09",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s43_10",
   "name": "독립기초 설계",
   "toc": "독립기초 설계",
   "ch": "c4",
   "grp": "g3",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">독립기초 설계</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">지지절점 반력과 지반조건을 이용해 독립기초의 지압, 전단, 휨과 배근을 검토합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>반력 자동 연결</b><span class=\"sub\">선택한 기둥 또는 지점의 하중조합별 축력·모멘트·전단을 가져옵니다.</span></li><li><b>기초 안정 검토</b><span class=\"sub\">지반지지력, 편심, 전도·활동과 접지압 분포를 확인합니다.</span></li><li><b>구조 강도 설계</b><span class=\"sub\">일방향전단, 뚫림전단, 휨과 정착 조건을 계산해 크기와 철근을 결정합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Design ▸ Footing Design ▸ Isolated Footing</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 856,
     "y": 272,
     "w": 715,
     "h": 486,
     "slot": "s43_10",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s43_11",
   "name": "매트기초 설계",
   "toc": "매트기초 설계",
   "ch": "c4",
   "grp": "g3",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Mat 기초 설계</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">상부 구조 반력과 지반 스프링을 매트 모델에 연결하고 판 결과를 배근 설계에 사용합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>상부 반력 전달</b><span class=\"sub\">기둥·벽체의 반력을 매트 절점과 하중케이스에 일관되게 매핑합니다.</span></li><li><b>지반-구조 상호작용</b><span class=\"sub\">지반계수와 접촉 조건을 반영해 침하, 접지압과 매트 부재력을 계산합니다.</span></li><li><b>영역별 배근 검토</b><span class=\"sub\">판모멘트와 전단 결과로 상·하부 방향별 필요 배근과 취약 구역을 확인합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Design ▸ Footing Design ▸ Mat Foundation</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 817,
     "y": 272,
     "w": 770,
     "h": 465,
     "slot": "s43_11",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s43_12",
   "name": "파일기초 설계",
   "toc": "파일기초 설계",
   "ch": "c4",
   "grp": "g3",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Pile 기초 설계</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">파일군의 위치·강성과 파일캡 모델을 구성해 말뚝 축력 분담과 캡 강도를 설계합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>파일 자동 배치</b><span class=\"sub\">기초 형상과 간격 조건에 맞춰 파일 배열 후보를 만들고 편심을 관리합니다.</span></li><li><b>파일군 반력 확인</b><span class=\"sub\">상부 하중에 대한 파일별 압축·인장 반력과 허용지지력 만족 여부를 확인합니다.</span></li><li><b>파일캡 설계</b><span class=\"sub\">캡의 휨·전단·뚫림전단과 배근을 검토해 기초 시스템을 완성합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Design ▸ Footing Design ▸ Pile Foundation</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 834,
     "y": 262,
     "w": 737,
     "h": 444,
     "slot": "s43_12",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s44_01",
   "name": "m-Factor",
   "toc": "m-Factor",
   "ch": "c4",
   "grp": "g4",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">m-factor method</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">부재 정보와 평가 조건을 바탕으로 m계수와 허용 기준을 적용해 1차 내진성능평가를 수행합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>부재별 기준 자동 매핑</b><span class=\"sub\">재료, 부재 종류, 상세와 지배 거동에 맞는 m계수 표를 선택합니다.</span></li><li><b>하중조합 일관 적용</b><span class=\"sub\">평가 단계의 전용 하중조합과 기대강도를 사용해 수요와 능력을 비교합니다.</span></li><li><b>결과를 단계별 분류</b><span class=\"sub\">부재별 만족 여부와 취약 위치를 정리해 상세평가 또는 보강 대상 선정에 활용합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Seismic / PBD ▸ Run m-Factor</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 840,
     "y": 272,
     "w": 738,
     "h": 409,
     "slot": "s44_01",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s44_02",
   "name": "Pushover",
   "toc": "Pushover",
   "ch": "c4",
   "grp": "g4",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">Pushover&nbsp;</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">비선형 정적해석으로 하중-변위 곡선, 힌지 상태와 성능점을 함께 확인합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>해석 케이스 구성</b><span class=\"sub\">방향, 하중분포, 제어절점과 목표변위를 지정해 Pushover 케이스를 만듭니다.</span></li><li><b>힌지 상태 시각화</b><span class=\"sub\">각 증분에서 IO·LS·CP 등 부재별 비선형 상태를 모델과 표로 확인합니다.</span></li><li><b>성능점 산정</b><span class=\"sub\">능력곡선을 ADRS 형식으로 변환해 요구스펙트럼과의 교점 및 평가 결과를 구합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Seismic / PBD ▸ Run Pushover</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 856,
     "y": 291,
     "w": 713,
     "h": 408,
     "slot": "s44_02",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s44_03",
   "name": "PBSD",
   "toc": "PBSD",
   "ch": "c4",
   "grp": "g4",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">PBSD (Performance Based Seismic Design)</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">신축 성능기반설계 기준에 맞춰 기대강도, 힌지·Fiber 모델, 지진파와 부재별 판정을 연결합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>PBSD 전용 재료 기준</b><span class=\"sub\">콘크리트와 철근의 기대강도와 성능 한계를 평가 목적에 맞게 관리합니다.</span></li><li><b>부재별 상세 응답</b><span class=\"sub\">벽체 변형률·전단, 연결보 회전, 층간변위 등 비선형 시간이력 결과를 검토합니다.</span></li><li><b>심의 자료로 정리</b><span class=\"sub\">지진파 메타데이터, 응답 도표와 판정 근거를 보고서 소스로 바로 사용할 수 있게 구성합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Seismic / PBD</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 879,
     "y": 272,
     "w": 689,
     "h": 480,
     "slot": "s44_03",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s44_04",
   "name": "THA 멀티 병렬해석",
   "toc": "THA 멀티 병렬해석",
   "ch": "c4",
   "grp": "g4",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">THA 병렬해석</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">Multi-Turbo Engine이 선택한 지진파 케이스를 병렬 실행해 긴 비선형 해석의 대기시간을 줄입니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>케이스별 독립 실행</b><span class=\"sub\">각 지진파 쌍을 별도 작업으로 구성해 가능한 실행 자원을 병렬로 활용합니다.</span></li><li><b>진행상태 한눈에</b><span class=\"sub\">대기·실행·완료·실패 상태와 단계 진행률을 전용 Run Board에서 확인합니다.</span></li><li><b>완료 결과 자동 수집</b><span class=\"sub\">각 작업의 기록 결과를 모델 케이스에 다시 연결해 평균·포락 후처리로 넘깁니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Seismic / PBD ▸ Run THA</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 294,
     "w": 664,
     "h": 472,
     "slot": "s44_04",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s44_05",
   "name": "지진파 스케일링 · 생성",
   "toc": "지진파 스케일링 · 생성",
   "ch": "c4",
   "grp": "g4",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">목표스펙트럼에 맞는 지진파 스케일링</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">지진파 라이브러리, X·Y 페어링, 응답스펙트럼 비교와 자동 스케일링·매칭을 한 화면에서 수행합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>지진파 가져오기와 페어링</b><span class=\"sub\">AT2·텍스트 기록을 관리하고 성분과 위험수준을 기준으로 해석 쌍을 구성합니다.</span></li><li><b>목표스펙트럼 적합성</b><span class=\"sub\">고유주기 구간에서 세트 평균이 목표스펙트럼 최소 기준을 만족하는지 자동 판정합니다.</span></li><li><b>스케일링과 생성</b><span class=\"sub\">진폭 조정, 스펙트럼 매칭과 인공 지진파 생성 옵션으로 필요한 입력 세트를 준비합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Seismic / PBD ▸ Load Cases &amp; Scaling</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 866,
     "y": 284,
     "w": 675,
     "h": 455,
     "slot": "s44_05",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s45_01",
   "name": "Structural Design Calculations",
   "toc": "Structural Design Calculations",
   "ch": "c4",
   "grp": "g5",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">구조계산서 자동생성</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">프로젝트 정보, 하중, 해석, 설계 결과와 그림을 섹션 단위로 모아 구조계산서를 생성합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>단일 데이터 원천</b><span class=\"sub\">모델과 저장된 설계 결과를 그대로 사용해 화면 수치와 보고서 수치의 불일치를 줄입니다.</span></li><li><b>필요 섹션 선택</b><span class=\"sub\">프로젝트 개요부터 하중·해석·부재설계까지 제출 범위에 맞게 목차를 구성합니다.</span></li><li><b>검토 가능한 출력</b><span class=\"sub\">표, 수식, 그림과 판정 근거를 포함한 문서를 생성해 편집·검토 후 제출합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Results ▸ Structural Design Calculations</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 885,
     "y": 288,
     "w": 691,
     "h": 473,
     "slot": "s45_01",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s45_02",
   "name": "구조평면도 · 배근도",
   "toc": "구조평면도 · 배근도",
   "ch": "c4",
   "grp": "g5",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">구조평면도,배근도 자동지원</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">층별 구조평면과 부재 정보를 정리하고 배근 데이터를 도면 요소로 변환해 반복 작도를 줄입니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>층별 구조평면</b><span class=\"sub\">기둥·벽·보·슬래브와 그리드를 층 기준으로 배치해 구조 일반도를 만듭니다.</span></li><li><b>배근 정보 표기</b><span class=\"sub\">확정된 보·기둥·벽·슬래브 배근과 부재 마크를 도면에 연결합니다.</span></li><li><b>DXF로 후속 편집</b><span class=\"sub\">생성 결과를 CAD에서 보완할 수 있는 DXF 형식으로 내보냅니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Structural Drawings ▸ Structural Drawings</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 843,
     "y": 281,
     "w": 693,
     "h": 449,
     "slot": "s45_02",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s45_03",
   "name": "Quantity Takeoff",
   "toc": "Quantity Takeoff",
   "ch": "c4",
   "grp": "g5",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">공사비 자동 산출</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">부재 형상, 재료와 배근 정보를 기준으로 콘크리트·거푸집·철근 물량을 산출합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>모델 기반 집계</b><span class=\"sub\">층·부재·재료별 치수와 수량을 모델에서 직접 읽어 반복 산식을 줄입니다.</span></li><li><b>분류 기준 제공</b><span class=\"sub\">타워, 층, 부재 종류와 재료 규격별로 물량을 묶어 비교할 수 있습니다.</span></li><li><b>설계 변경 즉시 반영</b><span class=\"sub\">단면이나 배근이 바뀌면 같은 데이터로 물량을 다시 산출해 대안별 차이를 확인합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Structural Drawings ▸ Quantity Takeoff</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 867,
     "y": 272,
     "w": 696,
     "h": 450,
     "slot": "s45_03",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s45_04",
   "name": "PBSD 보고서 소스",
   "toc": "PBSD 보고서 소스",
   "ch": "c4",
   "grp": "g5",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">PBSD 보고서 소스제공</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">비선형 모델, 지진파, 해석 결과와 부재별 판정 데이터를 표·그래프·이미지 소스로 제공합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>지진파 근거 자료</b><span class=\"sub\">기록 메타데이터, 시간이력과 응답스펙트럼, 스케일링 결과를 보고서용으로 정리합니다.</span></li><li><b>부재·층 성능 결과</b><span class=\"sub\">벽 변형률·전단, 연결보 회전, 층간변위·층전단 등 검토 자료를 생성합니다.</span></li><li><b>편집 가능한 소스 제공</b><span class=\"sub\">최종 보고서 형식에 맞게 사용자가 재배치하고 설명을 보완할 수 있는 원본 자료를 제공합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Seismic / PBD ▸ Result Analysis</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 887,
     "y": 272,
     "w": 693,
     "h": 438,
     "slot": "s45_04",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "fill",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s46_01",
   "name": "AI Prompt",
   "toc": "AI Prompt",
   "ch": "c4",
   "grp": "g6",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">AI Prompt</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">사용자의 문장을 기능 명령으로 해석해 모델링, 선택, 시점 변경과 검토 작업을 대화형으로 수행합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>기능을 찾지 않아도</b><span class=\"sub\">메뉴 위치를 몰라도 원하는 작업을 문장으로 설명하면 관련 명령과 입력 흐름을 제안합니다.</span></li><li><b>실행 가능한 도구 호출</b><span class=\"sub\">모델 객체 생성·수정, 조회와 View preset 같은 지원 명령을 구조화해 실행합니다.</span></li><li><b>사용자가 최종 통제</b><span class=\"sub\">변경 내용과 결과를 확인한 뒤 적용하도록 해 자동화와 검토 가능성을 함께 유지합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Node/Element ▸ AI Prompt</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 856,
     "y": 285,
     "w": 707,
     "h": 381,
     "slot": "s46_01",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s46_02",
   "name": "AI Stable Check",
   "toc": "AI Stable Check",
   "ch": "c4",
   "grp": "g6",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">주요 차별화 기능</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">AI Stable Check</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">고유치·반력·층간변위·절점·단면 지표를 규칙으로 판정하고 AI가 결과의 의미와 조치 순서를 설명합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>다섯 영역 자동 진단</b><span class=\"sub\">동적 특성, 반력 분포, 층 응답, 절점 이상과 단면 적정성을 한 번에 확인합니다.</span></li><li><b>판정과 설명을 분리</b><span class=\"sub\">CRITICAL·WARNING·OK는 계산 규칙이 결정하고 AI는 판정값을 바꾸지 않습니다.</span></li><li><b>다음 검토를 제안</b><span class=\"sub\">이상 위치와 원인을 요약하고 사용자가 확인할 모델·해석 조건을 우선순위로 안내합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Results ▸ AI Stable Chk</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 865,
     "y": 290,
     "w": 722,
     "h": 389,
     "slot": "s46_02",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000",
     "frame": "fixed"
    }
   ]
  },
  {
   "id": "s25",
   "name": "맺음 · 제안",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Closing</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">제안드립니다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 216.9,
     "w": 440.2,
     "h": 217.8,
     "html": "<div class=\"card\">\n        <h3>지금까지</h3>\n        <p>요소 단위 검증을 <b>국제 벤치마크로 전건 통과</b>했습니다.\n           숫자와 원시 증거를 함께 공개합니다.</p>\n      </div>",
     "k": 0.9623
    },
    {
     "id": "e4",
     "type": "text",
     "x": 579.9,
     "y": 216.9,
     "w": 440.2,
     "h": 217.8,
     "html": "<div class=\"card accent\">\n        <h3>다음 단계</h3>\n        <p><b>구조형식별 예제 검증</b>을\n           한국건축구조기술사회와 함께 수행하고자 합니다.\n           1차 · 2차 연구로 나누어 제안드립니다.</p>\n      </div>",
     "k": 0.9623
    },
    {
     "id": "e5",
     "type": "text",
     "x": 1047.8,
     "y": 216.9,
     "w": 440.2,
     "h": 217.8,
     "html": "<div class=\"card\">\n        <h3>그 이후</h3>\n        <p>AI 출력 검증과 보고서 자동화 검토까지 마쳐,\n           <b>실무에서 그대로 쓸 수 있는 도구</b>로 완성하겠습니다.</p>\n      </div>",
     "k": 0.9623
    },
    {
     "id": "e6",
     "type": "text",
     "x": 112,
     "y": 473.2,
     "w": 1376,
     "h": 64.8,
     "html": "<div style=\"font-size: calc(var(--u)*2.6); color: rgb(255, 255, 255); font-weight: 700;\">\n        감사합니다\n      </div>",
     "k": 0.9623
    },
    {
     "id": "e7",
     "type": "text",
     "x": 112,
     "y": 556.5,
     "w": 1376,
     "h": 37.4,
     "html": "<div style=\"color:var(--dim);font-size:calc(var(--u)*1.5)\">LPK SOFT Co., Ltd.</div>",
     "k": 0.9623
    },
    {
     "id": "e8",
     "type": "text",
     "x": 112,
     "y": 600.8,
     "w": 1376,
     "h": 37.4,
     "html": "<div style=\"color: var(--accent); font-size: calc(var(--u)*1.5);\">strix-build.com</div>",
     "k": 0.9623
    },
    {
     "id": "e9",
     "type": "image",
     "x": 112,
     "y": 656.7,
     "w": 1376,
     "h": 127.9,
     "slot": "s25_contact",
     "kind": "user",
     "src": "",
     "caption": "",
     "fit": "contain",
     "recW": "600",
     "recH": "600",
     "k": 0.9623
    }
   ]
  },
  {
   "id": "apx",
   "name": "부록 표지",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Appendix</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 539.5,
     "y": 360.5,
     "w": 520.9,
     "h": 96,
     "html": "<h2 class=\"title\" style=\"text-align:center\">부록 — 참고자료</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 542.6,
     "y": 480.5,
     "w": 514.8,
     "h": 93.3,
     "html": "<p style=\"color: var(--dim); font-size: calc(var(--u)*1.8); text-align: center;\">\n      검증 결과 전체 상세 · 전체 기능 목록<br>\n      <span style=\"color:var(--faint);font-size:.85em\">발표 시에는 넘겨 주시고, 배포본에서 확인해 주십시오.</span>\n    </p>"
    }
   ],
   "apx": true,
   "apxCover": true
  },
  {
   "id": "apxB",
   "name": "부록 B — 전체 메뉴 지도",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Appendix B · 1 / 3</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">전체 메뉴 지도 — 모델링</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">상단 리본 17개 탭 구성입니다. 명칭은 앱 화면 그대로입니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 279.8,
     "w": 448.6,
     "h": 211.2,
     "html": "<div class=\"card\" style=\"padding:calc(var(--u)*1)\">\n        <h3 style=\"font-size:calc(var(--u)*1.25)\">File</h3>\n        <p>New · Open · Save · Save As · Import DXF · <b>Import Midas</b> · Export · Settings</p>\n      </div>",
     "k": 0.9481
    },
    {
     "id": "e5",
     "type": "text",
     "x": 575.7,
     "y": 279.8,
     "w": 448.6,
     "h": 211.2,
     "html": "<div class=\"card\" style=\"padding:calc(var(--u)*1)\">\n        <h3 style=\"font-size:calc(var(--u)*1.25)\">View</h3>\n        <p>View Preset(ISO/Top/Front/Left/Right/Back) · Zoom All · Zoom Window · Model Only · Labels · Snap · Render Mode</p>\n      </div>",
     "k": 0.9481
    },
    {
     "id": "e6",
     "type": "text",
     "x": 1039.4,
     "y": 279.8,
     "w": 448.6,
     "h": 211.2,
     "html": "<div class=\"card\" style=\"padding:calc(var(--u)*1)\">\n        <h3 style=\"font-size:calc(var(--u)*1.25)\">Structure</h3>\n        <p>Material · Section · Thickness · Sec. Stiff · Wall Stiff · Story · Diaphragm · Bldg. Control · Tower Zones · Towers · <b>APT auto</b> · Story Copy</p>\n      </div>",
     "k": 0.9481
    },
    {
     "id": "e7",
     "type": "text",
     "x": 112,
     "y": 506.2,
     "w": 448.6,
     "h": 280,
     "html": "<div class=\"card\" style=\"padding:calc(var(--u)*1)\">\n        <h3 style=\"font-size:calc(var(--u)*1.25)\">Node/Element</h3>\n        <p><b>AI Modeling</b> · <b>AI Prompt</b> · Add Node/Beam/Truss/Wall/Plate · Wall-Type Slab · Move/Copy · Extrude · Mirror · Rotate · Scale · Merge · Divide · Change Para. · Auto Wall ID · Find Duplicates · Find Orphans · Purge Nodes</p>\n      </div>",
     "k": 0.9481
    },
    {
     "id": "e8",
     "type": "text",
     "x": 575.7,
     "y": 506.2,
     "w": 448.6,
     "h": 280,
     "html": "<div class=\"card\" style=\"padding:calc(var(--u)*1)\">\n        <h3 style=\"font-size:calc(var(--u)*1.25)\">Boundary</h3>\n        <p>Support · Point Spring · Beam End Release · Rigid Link · Constraint · Elastic Link · Panel Zone · Diaphragm · Diaphragm Disconnect</p>\n      </div>",
     "k": 0.9481
    },
    {
     "id": "e9",
     "type": "text",
     "x": 1039.4,
     "y": 506.2,
     "w": 448.6,
     "h": 280,
     "html": "<div class=\"card\" style=\"padding:calc(var(--u)*1)\">\n        <h3 style=\"font-size:calc(var(--u)*1.25)\">Load</h3>\n        <p>Load Case · Self Wt · Slab Load · Beam Load · Point Load · Loads to Masses · Body Force · <b>Wind Load</b> · Equiv. Static · Response Spectrum · RS Functions · RS Load Cases · Slab to Wall · Slab Pressure</p>\n      </div>",
     "k": 0.9481
    }
   ],
   "apx": true
  },
  {
   "id": "apxB2",
   "name": "부록 B — 전체 메뉴 지도 (2/3)",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Appendix B · 2 / 3</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">전체 메뉴 지도 — 해석 · 설계</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 289.3,
     "w": 449.6,
     "h": 295.4,
     "html": "<div class=\"card\" style=\"padding:calc(var(--u)*1)\">\n        <h3 style=\"font-size:calc(var(--u)*1.25)\">Analysis</h3>\n        <p>Analysis Ctrl · P-Delta · Eigenvalue · <b>Model Check</b> · Run · Stop · TCL Preview</p>\n      </div>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 575.2,
     "y": 289.3,
     "w": 449.6,
     "h": 295.4,
     "html": "<div class=\"card\" style=\"padding:calc(var(--u)*1)\">\n        <h3 style=\"font-size:calc(var(--u)*1.25)\">Results</h3>\n        <p>Load Combo · <b>Scaleup Fac.</b> · Deformed · Reactions · Bending M · Shear V · Axial N · <b>Plate Results</b> · Result Tables · Eigenvalue Results · Mode Shape · <b>Lateral Force Check</b> · <b>Tower Results</b> · <b>AI Stable Chk</b> · <b>Structural Design Calculations</b></p>\n      </div>"
    },
    {
     "id": "e5",
     "type": "text",
     "x": 1038.4,
     "y": 289.3,
     "w": 449.6,
     "h": 295.4,
     "html": "<div class=\"card\" style=\"padding:calc(var(--u)*1)\">\n        <h3 style=\"font-size:calc(var(--u)*1.25)\">Design</h3>\n        <p>Parameters · Concrete · Steel · SRC · <b>Wall Mark</b> · <b>Slab Design</b> · <b>Footing Design</b>(Isolated Footing / Mat Foundation / Pile Foundation)</p>\n      </div>"
    },
    {
     "id": "e6",
     "type": "text",
     "x": 112,
     "y": 598.3,
     "w": 449.6,
     "h": 113.9,
     "html": "<div class=\"card\" style=\"padding:calc(var(--u)*1)\">\n        <h3 style=\"font-size:calc(var(--u)*1.25)\">DesignPad</h3>\n        <p>RC · Steel · PC/PSC · Misc</p>\n      </div>"
    }
   ],
   "apx": true
  },
  {
   "id": "apxB3",
   "name": "부록 B — 전체 메뉴 지도 (3/3)",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Appendix B · 3 / 3</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">전체 메뉴 지도 — 성능 · 산출물 · 도구</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 232.3,
     "w": 448.6,
     "h": 346.2,
     "html": "<div class=\"card\" style=\"padding:calc(var(--u)*1)\">\n        <h3 style=\"font-size:calc(var(--u)*1.25)\">Seismic / PBD</h3>\n        <p>Global Options · Material · Inelastic Hinge · Infill Define/Assign · Site &amp; Hazard · Member Classify · Irregularity Check · <b>Run Pre. Eval.</b> · Story Performance · <b>Run m-Factor</b> · Performance Status · Push. Load Case · <b>Run Pushover</b> · Pushover Curve · Hinge Status · <b>Load Cases &amp; Scaling</b> · <b>Run THA</b> · Energy Balance · Result Table</p>\n      </div>",
     "k": 0.9408
    },
    {
     "id": "e4",
     "type": "text",
     "x": 575.7,
     "y": 232.3,
     "w": 448.6,
     "h": 346.2,
     "html": "<div class=\"card\" style=\"padding:calc(var(--u)*1)\">\n        <h3 style=\"font-size:calc(var(--u)*1.25)\">Structural Drawings</h3>\n        <p>Structural Drawings(DXF) · <b>Quantity Takeoff</b></p>\n      </div>",
     "k": 0.9408
    },
    {
     "id": "e5",
     "type": "text",
     "x": 1039.4,
     "y": 232.3,
     "w": 448.6,
     "h": 346.2,
     "html": "<div class=\"card\" style=\"padding:calc(var(--u)*1)\">\n        <h3 style=\"font-size:calc(var(--u)*1.25)\">Query</h3>\n        <p>Node Info · Elem Info · Distance · Angle</p>\n      </div>",
     "k": 0.9408
    },
    {
     "id": "e6",
     "type": "text",
     "x": 112,
     "y": 593.6,
     "w": 448.6,
     "h": 175.5,
     "html": "<div class=\"card\" style=\"padding:calc(var(--u)*1)\">\n        <h3 style=\"font-size:calc(var(--u)*1.25)\">Tools</h3>\n        <p>Capture · HotKey · Options · Script Runner</p>\n      </div>",
     "k": 0.9408
    },
    {
     "id": "e7",
     "type": "text",
     "x": 575.7,
     "y": 593.6,
     "w": 448.6,
     "h": 175.5,
     "html": "<div class=\"card\" style=\"padding:calc(var(--u)*1)\">\n        <h3 style=\"font-size:calc(var(--u)*1.25)\">Windows / Help</h3>\n        <p>Tree Menu · History / Help · About STRIX · Account</p>\n      </div>",
     "k": 0.9408
    },
    {
     "id": "e8",
     "type": "text",
     "x": 1039.4,
     "y": 593.6,
     "w": 448.6,
     "h": 175.5,
     "html": "<div class=\"card\" style=\"padding:calc(var(--u)*1)\">\n        <h3 style=\"font-size:calc(var(--u)*1.25)\">Plugins</h3>\n        <p>Plugin Development · Plugin Install · Installed Plugins · Browse Marketplace · Plugin Settings</p>\n      </div>",
     "k": 0.9408
    }
   ],
   "apx": true
  }
 ]
}
