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
      "title": "모델링 생산성"
     },
     {
      "id": "g2",
      "title": "해석 · 결과 검토"
     },
     {
      "id": "g3",
      "title": "설계 자동화"
     },
     {
      "id": "g4",
      "title": "내진성능평가 · 성능기반설계"
     },
     {
      "id": "g5",
      "title": "산출물 자동화"
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
     "html": "<div class=\"split-note\">\n      <b>STRIX는 </b>전 세계 연구자가 30년간 검증해 온 <b style=\"background-color: rgb(22, 24, 28); font-size: 21.6px;\">OpenSees </b><span style=\"font-size: 21.6px;\">엔진을 사용하고,\n      그 위에 </span><b style=\"font-size: 21.6px;\">실무자의 전·후처리 입력과 설계 자동화</b><span style=\"font-size: 21.6px;\">를 구현했습니다.\n      그리고 그 결과가 맞는지를 </span><b style=\"font-size: 21.6px;\">공개된 국제 검증예제로 스스로 증명</b><span style=\"font-size: 21.6px;\">합니다.</span><b style=\"background-color: rgb(22, 24, 28); font-size: 21.6px;\"><br></b></div>"
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
     "html": "<div class=\"card\">\n        <h3>Low-Cost</h3>\n        <p>오픈소스 엔진 기반이므로\n           라이선스 구조가 가볍습니다.</p>\n      </div>"
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
     "html": "<div class=\"split-note\">\n      확장성은 문서상의 장점이 아닙니다 — STRIX는 실제로 이 프레임워크 위에\n      <b>자체 요소와 자체 힌지 모델을 구현해</b> 쓰고 있으며, 그 요소들도 검증 대상에 포함했습니다.\n    </div>"
    }
   ],
   "ch": "c2"
  },
  {
   "id": "s09",
   "name": "아키텍처",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Architecture</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">STRIX는 이렇게 동작합니다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 253.4,
     "w": 322.4,
     "h": 360.8,
     "html": "<div class=\"card\">\n        <div class=\"num\" style=\"font-size:calc(var(--u)*1.6);color:var(--faint)\">01</div>\n        <h3>입력</h3>\n        <p>리본 UI · 3D 뷰포트 · 좌측 트리<br>\n           <span class=\"mi\">AI Modeling</span> <span class=\"mi\">AI Prompt</span><br>\n           <span class=\"mi\">Import Midas</span> DXF 임포트</p>\n      </div>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 463.2,
     "y": 253.4,
     "w": 322.4,
     "h": 360.8,
     "html": "<div class=\"card accent\">\n        <div class=\"num\" style=\"font-size:calc(var(--u)*1.6)\">02</div>\n        <h3>입력 생성</h3>\n        <p>모델을 OpenSees가 이해하는 스크립트로 변환.\n           절점·요소·재료·경계·하중·해석제어 전부 자동 생성.</p>\n      </div>"
    },
    {
     "id": "e5",
     "type": "text",
     "x": 814.4,
     "y": 253.4,
     "w": 322.4,
     "h": 360.8,
     "html": "<div class=\"card\">\n        <div class=\"num\" style=\"font-size:calc(var(--u)*1.6);color:var(--faint)\">03</div>\n        <h3>해석</h3>\n        <p>OpenSees 엔진 실행<br>\n           정적 · 고유치 · 응답스펙트럼 · P-Delta ·\n           Pushover · 시간이력(THA)</p>\n      </div>"
    },
    {
     "id": "e6",
     "type": "text",
     "x": 1165.6,
     "y": 253.4,
     "w": 322.4,
     "h": 360.8,
     "html": "<div class=\"card\">\n        <div class=\"num\" style=\"font-size:calc(var(--u)*1.6);color:var(--faint)\">04</div>\n        <h3>후처리</h3>\n        <p>결과 파싱 → 부재력·변위·응력<br>\n           → RC/강구조 설계 · 성능평가<br>\n           → 계산서 · 도면 · 물량</p>\n      </div>"
    },
    {
     "id": "e7",
     "type": "text",
     "x": 112,
     "y": 639.8,
     "w": 1376,
     "h": 108.3,
     "html": "<div class=\"split-note\">\n      중요한 것은 <b>②와 ④가 우리 코드라는 점</b>입니다.\n      해석의 정확도는 OpenSees가 책임지지만, <b>모델을 올바른 입력으로 옮겼는지</b>,\n      <b>결과를 올바르게 읽었는지</b>는 STRIX의 책임입니다.\n      그래서 검증도 <b>이 전 구간을 통째로</b> 돌려서 합니다. (다음 장)\n    </div>"
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
   "id": "s17",
   "name": "검증의 재현성",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Reproducibility</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">\"믿어 주십시오\"가 아니라 \"돌려 보십시오\"</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 302.5,
     "w": 322.4,
     "h": 262.6,
     "html": "<div class=\"card\">\n        <h3>모델 정의</h3>\n        <p>벤치마크 모델이 코드로 남아 있습니다.\n           치수·재료·하중·경계조건이 그대로 보입니다.</p>\n      </div>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 463.2,
     "y": 302.5,
     "w": 322.4,
     "h": 262.6,
     "html": "<div class=\"card\">\n        <h3>참조해 출처</h3>\n        <p>각 예제마다 <b>어느 문헌의 몇 번 예제</b>인지,\n           참조값이 어떤 식에서 나왔는지 함께 기록했습니다.</p>\n      </div>"
    },
    {
     "id": "e5",
     "type": "text",
     "x": 814.4,
     "y": 302.5,
     "w": 322.4,
     "h": 262.6,
     "html": "<div class=\"card\">\n        <h3>원시 해석 파일</h3>\n        <p>엔진에 실제로 들어간 입력 파일과\n           엔진이 뱉은 출력 파일을 <b>그대로 보관·배포</b>합니다.</p>\n      </div>"
    },
    {
     "id": "e6",
     "type": "text",
     "x": 1165.6,
     "y": 302.5,
     "w": 322.4,
     "h": 262.6,
     "html": "<div class=\"card accent\">\n        <h3>무결성 확인</h3>\n        <p>증거 묶음에 <b>해시값</b>을 함께 공개해,\n           받은 파일이 우리가 낸 그 파일인지 확인할 수 있습니다.</p>\n      </div>"
    },
    {
     "id": "e7",
     "type": "text",
     "x": 112,
     "y": 590.7,
     "w": 1376,
     "h": 108.3,
     "html": "<div class=\"split-note\">\n      검증서는 결과 숫자만 적어 두면 <b>확인할 방법이 없습니다.</b>\n      STRIX는 입력 · 출력 · 참조해 · 판정 기준을 모두 공개합니다.\n      제3자가 같은 조건으로 다시 돌려 같은 값을 얻을 수 있어야 검증입니다.\n    </div>"
    }
   ],
   "ch": "c3"
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
   "id": "s20",
   "name": "기능 ① 모델링 생산성",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Features ①</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">모델링 — 손이 덜 가게</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 216.3,
     "w": 808.4,
     "h": 525.7,
     "html": "<ul class=\"bul\">\n          <li><span class=\"mi\">AI Modeling</span> <span class=\"mi\">AI Prompt</span>\n            <span class=\"sub\">자연어로 구조 형상·부재를 지시하면 모델을 생성하거나 수정합니다.</span></li>\n          <li><span class=\"mi\">APT auto</span>\n            <span class=\"sub\">공동주택 평면의 반복 구조를 자동으로 전개합니다.</span></li>\n          <li><span class=\"mi\">Import Midas</span>\n            <span class=\"sub\">기존 자산을 버리지 않습니다. 사용하던 모델을 가져옵니다.</span></li>\n          <li><span class=\"mi\">Wall-Type Slab</span> <span class=\"mi\">Slab to Wall</span>\n            <span class=\"sub\">벽식 구조에서 슬래브와 벽의 하중 전달을 실무 방식대로 처리합니다.</span></li>\n          <li><span class=\"mi\">Story Copy</span> <span class=\"mi\">Towers</span> <span class=\"mi\">Tower Zones</span>\n            <span class=\"sub\">층 반복 생성, 그리고 <b>멀티타워 단지</b>를 한 모델에서 다룹니다.</span></li>\n          <li><span class=\"mi\">Find Duplicates</span> <span class=\"mi\">Find Orphans</span> <span class=\"mi\">Purge Nodes</span>\n            <span class=\"sub\">중복·고아 절점을 찾아 정리합니다. 해석 전에 모델을 깨끗하게 만듭니다.</span></li>\n        </ul>",
     "k": 0.9978
    },
    {
     "id": "e4",
     "type": "image",
     "x": 1057,
     "y": 216,
     "w": 323,
     "h": 274,
     "slot": "s20_ai_modeling",
     "kind": "auto",
     "src": "",
     "caption": "<span class=\"mi\">AI Modeling</span>",
     "fit": "contain",
     "recW": "1100",
     "recH": "750",
     "k": 0.9978
    },
    {
     "id": "e5",
     "type": "image",
     "x": 949.1,
     "y": 511.9,
     "w": 538.9,
     "h": 273.3,
     "slot": "s20_apt_auto",
     "kind": "auto",
     "src": "",
     "caption": "<span class=\"mi\">APT auto</span>",
     "fit": "contain",
     "recW": "1100",
     "recH": "750",
     "k": 0.9978
    }
   ],
   "ch": "c4",
   "grp": "g1",
   "grpOpen": true,
   "toc": "모델링 생산성 — 한눈에"
  },
  {
   "id": "s20a",
   "name": "AI Modeling · AI Prompt",
   "toc": "AI Modeling · AI Prompt",
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
     "html": "<div class=\"kicker\">Features ①</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">도면을 읽어 모델을 만든다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">평면 DXF에서 기둥·보·벽체를 자동으로 탐지해 3D 모델을 만듭니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>올리면 바로 생성이 아니라, 검토부터</b><span class=\"sub\">탐지 결과를 미리보기로 먼저 보여줍니다. 한 도면에 평면이 여러 개면 자동 분리해 원하는 것만 고릅니다.</span></li><li><b>실무 표기를 그대로 읽습니다</b><span class=\"sub\">기둥 C·PC / 보 B·G·CG·GR / 벽 W·SW·HW, 그리드 X1·Y1. 탐지된 벽은 간이 막대가 아니라 <b>셸 요소</b>로 생성됩니다.</span></li><li><b>한 번에 어디까지</b><span class=\"sub\">층고 · 구조형식 · fck/fy 만 정하면 절점 · 요소 · 단면 · <b>최하층 고정지점</b>까지. 단면은 기본 프리셋이므로 생성 뒤 보정하는 것을 전제로 쓰는 도구입니다.</span></li><li><b>AI Prompt — 자연어로</b><span class=\"sub\">도면 없이 말로 지시해 모델을 만들거나 고칩니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Node/Element ▸ AI Modeling</span><span class=\"mi\">Node/Element ▸ AI Prompt</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s20a_ai_modeling",
     "kind": "auto",
     "src": "assets/auto/s20a_ai_modeling.png",
     "caption": "<span class=\"mi\">AI Modeling</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s20b",
   "name": "APT auto",
   "toc": "APT auto",
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
     "html": "<div class=\"kicker\">Features ①</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">벽선 한 층만 그리면 전 층이 선다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">바닥 평면에 그려둔 벽 라인을 입력한 층 수만큼 쌓아, 벽식 아파트 골조를 통째로 생성합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 856,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>층별 복사 작업이 사라집니다</b><span class=\"sub\">한 층 평면의 벽선만 있으면 셸 벽체 · 절점 · 바닥 지점을 층 수만큼 자동 생성합니다. 층고는 전 층 동일(Uniform)과 층별 개별(Custom) 둘 다 되므로 1층 필로티 · 최상층도 그대로 다룹니다.</span></li><li><b>자투리 선을 걸러냅니다</b><span class=\"sub\"><b>Min. Length</b> 보다 짧은 선은 벽으로 만들지 않습니다. 도면에서 넘어온 노이즈가 벽이 되는 일을 막습니다.</span></li><li><b>원본을 남기지 않습니다</b><span class=\"sub\">변환에 쓴 선요소는 생성 후 자동 삭제(기본 ON)됩니다. 같은 자리에 벽과 선이 겹쳐 남는 중복이 생기지 않습니다.</span></li><li><b>바닥 지점까지</b><span class=\"sub\">생성된 1층 절점에 <b>Fixed · Pin · Base Shear</b> 중 선택한 지점이 자동으로 붙습니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Structure ▸ APT auto</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 1004,
     "y": 272,
     "w": 484,
     "h": 508,
     "slot": "s20b_apt_auto",
     "kind": "auto",
     "src": "assets/auto/s20b_apt_auto.png",
     "caption": "<span class=\"mi\">APT auto</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s20c",
   "name": "Import Midas",
   "toc": "Import Midas",
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
     "html": "<div class=\"kicker\">Features ①</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">쓰던 모델을 버리지 않는다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">Midas Gen / Civil 텍스트 모델(<b>.mgt · .mct</b>)을 읽어 STRIX 모델로 변환합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>무엇이 넘어오나</b><span class=\"sub\">절점 · 프레임 요소 · 재료 · 단면 · 경계조건 · 하중케이스 · 자중 · 절점하중 · 부재하중(등분포 · 사다리꼴 · 중간집중) · 단부해제 · <b>하중조합</b> · 단위계 · 바닥하중 타입과 패널.</span></li><li><b>아직 안 넘어오는 것</b><span class=\"sub\">판 · 솔리드 요소, 스프링, 강체링크, 온도 · 프리스트레스 · 시공단계, 지진 · 풍 · 응답스펙트럼 하중. 이 항목들은 STRIX에서 다시 정의합니다.</span></li><li><b>도면에서도</b><span class=\"sub\">DXF 도 같은 자리에서 가져옵니다.</span></li><li><b>실무에서 달라지는 것</b><span class=\"sub\">진행 중인 프로젝트를 처음부터 다시 만들지 않아도 검토를 시작할 수 있습니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">File ▸ Import Midas</span><span class=\"mi\">File ▸ Import DXF</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s20c_import_midas",
     "kind": "user",
     "src": "",
     "caption": "<span class=\"mi\">File ▸ Import Midas</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s20d",
   "name": "Wall-Type Slab · Slab to Wall",
   "toc": "Wall-Type Slab · Slab to Wall",
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
     "html": "<div class=\"kicker\">Features ①</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">같은 평면이 반복되면, 한 번만 정한다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">벽·보로 둘러싸인 바닥판을 층 <b>그룹</b> 단위로 한 번에 만듭니다. 공동주택·코어 벽식 구조를 겨냥한 기능입니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>층을 묶어 한 번만 정합니다</b><span class=\"sub\">두께 · <b>βf</b>(면내 강성 저감) · 재료 · 메쉬 크기를 그룹에 한 번 정하고, 그 사양을 쓸 층들을 체크합니다. 한 층은 한 그룹에만 속하므로 사양이 겹쳐 어긋나는 일이 없습니다.</span></li><li><b>외곽은 그리면 됩니다</b><span class=\"sub\">Slab Pressure 캔버스에서 벽·보 절점에 <b>스냅</b>해 외곽을 그리면 그룹 전 층에 슬래브가 자동 생성됩니다.</span></li><li><b>슬래브에서 벽으로, 하중을 실무 방식대로</b><span class=\"sub\"><span class=\"mi\">Slab to Wall</span> 이 바닥하중을 둘러싼 벽·보로 전달합니다. 슬래브를 판으로 풀지 않고도 벽식 구조의 하중 흐름을 그대로 반영합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Node/Element ▸ Wall-Type Slab</span><span class=\"mi\">Load ▸ Slab to Wall</span><span class=\"mi\">Load ▸ Slab Pressure</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s20d_walltype_slab",
     "kind": "auto",
     "src": "assets/auto/s20d_walltype_slab.png",
     "caption": "<span class=\"mi\">Wall-Type Slab</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s20e",
   "name": "Story Copy · Towers · Tower Zones",
   "toc": "Story Copy · Towers · Tower Zones",
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
     "html": "<div class=\"kicker\">Features ①</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">층을 쌓고, 동을 나눈다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">표준층 반복 생성, 그리고 <b>한 모델 안의 여러 동(棟)</b>을 나눠 결과·설계·내진검토를 동 단위로 봅니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>Story Copy — 표준층 반복</b><span class=\"sub\">선택한 층의 절점 · 부재 · 벽체를 위로 쌓습니다. 복사 횟수와 층고를 묶음별로 줄 수 있어 저층부·기준층·최상층이 다른 건물도 한 번에 세웁니다. 층마다 단면 · 재료 · 두께 번호를 자동으로 올리는 <b>증분</b>도 함께 줍니다.</span></li><li><b>Towers — 한 모델, 여러 동</b><span class=\"sub\">Front view 박스 드래그로 부재·벽체를 골라 동에 배정합니다. 배정하지 않은 부재는 <b>Podium / Base</b>(기단부·공용부)로 남습니다.</span></li><li><b>왜 나누나 — 단지형 건물</b><span class=\"sub\">한 기단부 위에 여러 타워가 올라가는 주상복합에서, 통합 모델로 한 번 해석하고 결과는 동별로 봅니다. 동마다 층·풍하중·지진하중·밑면전단 보정이 따로 산정됩니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Structure ▸ Story Copy</span><span class=\"mi\">Structure ▸ Towers</span><span class=\"mi\">Results ▸ Tower Results</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s20e_towers",
     "kind": "auto",
     "src": "assets/auto/s20e_towers.png",
     "caption": "<span class=\"mi\">Towers</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s20f",
   "name": "Find Duplicates · Find Orphans · Purge Nodes",
   "toc": "Find Duplicates · Find Orphans · Purge Nodes",
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
     "html": "<div class=\"kicker\">Features ①</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">해석 전에 모델을 깨끗하게</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">떠 있는 절점과 쓸데없이 쪼개진 절점을 찾아 정리합니다. <b>지저분한 모델은 틀린 결과의 입구</b>입니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>Find Orphans — 떠 있는 절점</b><span class=\"sub\">부재 · 벽체 · 슬래브 · 지점 · 스프링 · 링크 · 하중 어디에도 연결되지 않은 절점만 골라냅니다. 체크하면 뷰포트에서 함께 선택돼 위치를 눈으로 확인한 뒤 지웁니다.</span></li><li><b>Purge Nodes — 쪼개진 부재를 되돌린다</b><span class=\"sub\">한 직선 위에서 부재 2개가 만나는 중간 절점 중 다른 참조가 전혀 없는 것을 찾아 두 부재를 하나로 합칩니다. <b>자동분할(Auto-split)</b>의 역연산입니다.</span></li><li><b>왜 중요한가 — 비선형에서 드러납니다</b><span class=\"sub\">브레이스를 설치했다 지우면 보·기둥은 분절된 채 남습니다. 그 중간 절점에 푸시오버·시간이력해석이 <b>가짜 집중힌지</b>를 만듭니다. 정리해 두지 않으면 결과가 조용히 틀어집니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Node/Element ▸ Find Duplicates</span><span class=\"mi\">Find Orphans</span><span class=\"mi\">Purge Nodes</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s20f_purge",
     "kind": "auto",
     "src": "assets/auto/s20f_purge.png",
     "caption": "<span class=\"mi\">Purge Nodes</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s21",
   "name": "기능 ② 해석 · 결과 검토",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Features ②</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">해석 — 돌리기 전에 확인하고, 돌린 뒤에 검토하게</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 216.3,
     "w": 808.4,
     "h": 525.7,
     "html": "<ul class=\"bul\">\n          <li><span class=\"mi\">Model Check</span>\n            <span class=\"sub\">해석 전에 모델의 결함을 먼저 찾습니다. 잘못된 모델로 돌린 결과만큼 위험한 것이 없습니다.</span></li>\n          <li><span class=\"mi\">Analysis Ctrl</span> <span class=\"mi\">Eigenvalue</span> <span class=\"mi\">P-Delta</span>\n            <span class=\"sub\">해석 제어, 고유치 해석, 2차 효과. 주축(<span class=\"mi\">Principal Axis</span>)이 회전한 건물도 다룹니다.</span></li>\n          <li><span class=\"mi\">Plate Results</span>\n            <span class=\"sub\">슬래브·매트 판요소 결과를 컨투어로 검토합니다.</span></li>\n          <li><span class=\"mi\">Scaleup Fac.</span> <span class=\"mi\">Lateral Force Check</span>\n            <span class=\"sub\">밑면전단 보정계수, 그리고 <b>풍하중과 지진하중 중 무엇이 지배하는지</b>를 한 화면에서 판정합니다.</span></li>\n          <li><span class=\"mi\">AI Stable Chk</span>\n            <span class=\"sub\">해석 결과의 이상 징후(비정상 변위·반력·모드)를 AI가 먼저 짚어 줍니다.</span></li>\n          <li><span class=\"mi\">Tower Results</span> <span class=\"mi\">Result Tables</span>\n            <span class=\"sub\">타워별 결과 분리, 표 형태의 전체 결과 조회.</span></li>\n        </ul>",
     "k": 0.9978
    },
    {
     "id": "e4",
     "type": "image",
     "x": 949.1,
     "y": 216.3,
     "w": 538.9,
     "h": 273.3,
     "slot": "s21_model_check",
     "kind": "auto",
     "src": "",
     "caption": "<span class=\"mi\">Analysis ▸ Model Check</span>",
     "fit": "contain",
     "recW": "1100",
     "recH": "750",
     "k": 0.9978
    },
    {
     "id": "e5",
     "type": "image",
     "x": 949.1,
     "y": 511.9,
     "w": 538.9,
     "h": 273.3,
     "slot": "s21_results",
     "kind": "user",
     "src": "",
     "caption": "결과 검토 화면",
     "fit": "contain",
     "recW": "1100",
     "recH": "750",
     "k": 0.9978
    }
   ],
   "ch": "c4",
   "grp": "g2",
   "grpOpen": true,
   "toc": "해석 · 결과 검토 — 한눈에"
  },
  {
   "id": "s21a",
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
     "html": "<div class=\"kicker\">Features ②</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">돌리기 전에 결함을 먼저 찾는다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">해석 전에 모델의 결함을 먼저 찾습니다. 잘못된 모델로 돌린 결과만큼 위험한 것이 없습니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>Quick Review 로 1차, Run Deep Review 로 상세</b><span class=\"sub\">단면·재료 미할당, 지지 누락, 분리된 구조, <b>10mm</b> 미만 근접 절점을 Critical · Warning · Info 로 나눠 보고합니다.</span></li><li><b>형상만 보는 것이 아닙니다</b><span class=\"sub\">양단 핀 부재, <b>Loads to Masses</b> 누락, RSA 스펙트럼 미지정, 기본풍속 0 같은 해석 설정 오류도 점검 목록에 있습니다.</span></li><li><b>찾은 자리로 바로 갑니다</b><span class=\"sub\">보고서의 참조 칩 [E] [N] [W] 를 누르면 그 부재·절점·벽체가 뷰포트에서 선택됩니다. 다만 통과가 결과의 정확성을 보장하지는 않습니다 — 해석 전 건강검진입니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Analysis ▸ Model Check</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s21a_model_check",
     "kind": "auto",
     "src": "assets/auto/s21a_model_check.png",
     "caption": "<span class=\"mi\">Analysis ▸ Model Check</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s21b",
   "name": "Analysis Ctrl · Eigenvalue · P-Delta",
   "toc": "Analysis Ctrl · Eigenvalue · P-Delta",
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
     "html": "<div class=\"kicker\">Features ②</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">해석 제어 · 고유치 · 2차 효과</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">해석 제어, 고유치 해석, 2차 효과. 주축(Principal Axis)이 회전한 건물도 다룹니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>모드 수를 감으로 정하지 않습니다</b><span class=\"sub\">누적 질량참여율 목표(예 <b>90%</b>)를 주면 만족할 때까지 모드를 자동으로 늘립니다. X·Y 두 방향을 모두 봅니다.</span></li><li><b>P-Delta 는 지진과 함께 실려 있는 중력으로</b><span class=\"sub\">반복 횟수·수렴 허용오차와, 2차 효과에 실을 중력 하중케이스·계수를 직접 지정합니다. 고정하중 전체에 활하중 일부를 얹는 식입니다.</span></li><li><b>주축이 돌아간 건물도 다룹니다</b><span class=\"sub\">1° 씩 훑는 대신 <b>CQC 응답텐서</b>를 고유분해해 최악 입사각을 한 번에 구하고, 풍·지진 하중과 <b>Results Axis</b> 가 그 각도를 씁니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Analysis ▸ Analysis Ctrl</span><span class=\"mi\">Eigenvalue</span><span class=\"mi\">P-Delta</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s21b_analysis_ctrl",
     "kind": "auto",
     "src": "assets/auto/s21b_analysis_ctrl.png",
     "caption": "<span class=\"mi\">Analysis Ctrl</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s21c",
   "name": "Plate Results",
   "toc": "Plate Results",
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
     "html": "<div class=\"kicker\">Features ②</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">판요소 결과를 컨투어로</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">슬래브·매트 판요소 결과를 컨투어로 검토합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>위에서 보다가 돌리면 3D 가 됩니다</b><span class=\"sub\">메인 뷰포트와 같은 Three.js 화면입니다. 컨투어를 마우스로 기울이면 처짐(<b>Uz</b>)이 그대로 솟아오릅니다.</span></li><li><b>무엇을 볼지 고릅니다</b><span class=\"sub\">성분 · 컨투어 · 라벨 · 범위 필터 · MAX/MIN, 그리고 요소값과 절점평균을 고르는 <b>Averaging</b> 을 좌측에서 켭니다.</span></li><li><b>결과에서 배근까지 이어집니다</b><span class=\"sub\"><b>Wood-Armer</b> 로 설계모멘트를 만들어 배근간격을 냅니다. 조합마다 변환한 뒤 포락합니다 — 순서를 바꾸면 값이 틀립니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Results ▸ Plate Results</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s21c_plate_results",
     "kind": "user",
     "src": "",
     "caption": "<span class=\"mi\">Plate Results</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s21d",
   "name": "Scaleup Fac. · Lateral Force Check",
   "toc": "Scaleup Fac. · Lateral Force Check",
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
     "html": "<div class=\"kicker\">Features ②</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">풍하중과 지진하중, 무엇이 지배하는가</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">밑면전단 보정계수, 그리고 풍하중과 지진하중 중 무엇이 지배하는지를 한 화면에서 판정합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>같은 방식으로 재서 비교합니다</b><span class=\"sub\">풍·지진 밑면전단을 모두 최하층 층전단 컷으로 뽑아 나란히 놓고, 어느 쪽이 지배하는지 판정합니다.</span></li><li><b>최상층 변위도 같은 화면에서</b><span class=\"sub\">풍하중 옥상변위를 <b>H/500</b>(400·500·직접입력) 과 대조합니다. KDS 가 강제하는 수치가 아니라 실무 관행임을 화면에 밝힙니다.</span></li><li><b>RSA 가 작으면 보정합니다</b><span class=\"sub\">Scaleup Fac. 이 방향별로 <b>C = max(1.0, 0.85·V/Vt)</b> 를 냅니다. 부재력·층전단·전도모멘트에는 곱하고 층간변위에는 곱하지 않습니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Results ▸ Lateral Force Check</span><span class=\"mi\">Results ▸ Scaleup Fac.</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s21d_scaleup",
     "kind": "auto",
     "src": "assets/auto/s21d_scaleup.png",
     "caption": "<span class=\"mi\">Scaleup Fac.</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s21e",
   "name": "AI Stable Chk",
   "toc": "AI Stable Chk",
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
     "html": "<div class=\"kicker\">Features ②</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">이상 징후를 AI가 먼저 짚는다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">해석 결과의 이상 징후를 다섯 갈래로 자동 진단하고, 그 결과를 AI가 소견으로 정리해 줍니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>다섯 갈래를 계산으로 봅니다</b><span class=\"sub\">고유치 특성 · 반력 분포 · 층간변위 · 절점 이상 · 단면 적정성. 항목마다 <b>CRITICAL · WARNING · OK</b> 로 판정합니다.</span></li><li><b>판정은 AI 가 하지 않습니다</b><span class=\"sub\">진단은 전부 <b>규칙 기반 계산</b>입니다. AI 소견은 그 결과를 읽고 쓰는 별도 버튼이며 판정값을 바꾸지 않습니다.</span></li><li><b>무엇이 걸리나</b><span class=\"sub\">비틀림 불규칙, X/Y 강성 불균형, 병진-비틀림 연성 모드, 중력하중 인발, 무반력 지지절점, 경험식 대비 과도한 주기.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Results ▸ AI Stable Chk</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s21e_ai_stable",
     "kind": "user",
     "src": "",
     "caption": "<span class=\"mi\">AI Stable Chk</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s21f",
   "name": "Tower Results · Result Tables",
   "toc": "Tower Results · Result Tables",
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
     "html": "<div class=\"kicker\">Features ②</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">타워별로 나눠 보고, 표로 전부 본다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">타워별 결과 분리, 표 형태의 전체 결과 조회.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>통합 모델 한 번, 결과는 동별로</b><span class=\"sub\">한 모델에 여러 동을 두고 부재·벽체를 배정하면 층전단과 층변위를 동별 컬럼으로 나란히 봅니다.</span></li><li><b>동마다 따로 산정되는 것</b><span class=\"sub\">격막·층 목록·풍하중·등가정적지진하중·밑면전단 보정이 <b>동 단위</b>로 계산됩니다. 배정하지 않은 부재는 <b>Podium / Base</b> 로 남습니다.</span></li><li><b>표가 결과 검토의 중심입니다</b><span class=\"sub\">절점 변위·반력, 부재·벽체 부재력, 층 응답을 하중케이스·조합별로 조회합니다. 뷰포트와 같은 내부 원천을 씁니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Results ▸ Tower Results</span><span class=\"mi\">Results ▸ Result Tables</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s21f_result_tables",
     "kind": "auto",
     "src": "assets/auto/s21f_result_tables.png",
     "caption": "<span class=\"mi\">Result Tables</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s22",
   "name": "기능 ③ 설계 자동화",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Features ③</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">설계 — 해석에서 배근까지 끊기지 않게</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 216.3,
     "w": 808.4,
     "h": 560,
     "html": "<ul class=\"bul\">\n          <li><span class=\"mi\">Concrete</span> <span class=\"mi\">Steel</span>\n            <span class=\"sub\">RC · 강구조 부재 설계와 검토. 단면 최적화(Section Optimization)까지 이어집니다.</span></li>\n          <li><span class=\"mi\">▶ Design Walls</span> <span class=\"mi\">Wall Mark</span>\n            <span class=\"sub\">전단·P-M 을 동시에 만족하는 <b>최소 배근을 자동으로</b> 찾습니다. 벽체를 부호 단위로 관리해 설계·배근·일람표를 일관되게 만듭니다.</span></li>\n          <li><span class=\"mi\">Slab Design</span>\n            <span class=\"sub\">슬래브 설계와 부호 관리.</span></li>\n          <li><span class=\"mi\">Footing Design ▸ Isolated Footing</span> <span class=\"mi\">Mat Foundation</span> <span class=\"mi\">Pile Foundation</span>\n            <span class=\"sub\">독립기초 · 매트기초 · 파일기초를 각각 다룹니다.</span></li>\n          <li><span class=\"mi\">Safety Review</span>\n            <span class=\"sub\">설계 마지막 단계. 부재별 <b>안전율(DCR)을 모델 전체에 색으로 표시</b>해\n              어디가 위험한지를 한눈에 봅니다.</span></li>\n        </ul>",
     "k": 0.9978
    },
    {
     "id": "e4",
     "type": "image",
     "x": 949.1,
     "y": 216.3,
     "w": 538.9,
     "h": 273.3,
     "slot": "s22_wall_mark",
     "kind": "auto",
     "src": "",
     "caption": "<span class=\"mi\">Design ▸ Wall Mark</span>",
     "fit": "contain",
     "recW": "1100",
     "recH": "750",
     "k": 0.9978
    },
    {
     "id": "e5",
     "type": "image",
     "x": 949.1,
     "y": 511.9,
     "w": 538.9,
     "h": 273.3,
     "slot": "s22_safety_review",
     "kind": "user",
     "src": "",
     "caption": "<span class=\"mi\">Safety Review</span> — DCR 컨투어",
     "fit": "contain",
     "recW": "1100",
     "recH": "750",
     "k": 0.9978
    }
   ],
   "ch": "c4",
   "grp": "g3",
   "grpOpen": true,
   "toc": "설계 자동화 — 한눈에"
  },
  {
   "id": "s22a",
   "name": "Concrete · Steel",
   "toc": "Concrete · Steel",
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
     "html": "<div class=\"kicker\">Features ③</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">RC · 강구조 설계와 단면 최적화</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">RC · 강구조 부재 설계와 검토. 단면 최적화(Section Optimization)까지 이어집니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 856,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>설계와 검토를 나눠 둡니다</b><span class=\"sub\">Design Beams · Columns · Walls 가 배근을 찾고, Check 가 그 배근으로 <b>DCR</b> 을 판정합니다. 부재별 Override 로 특정 부재만 따로 줄 수 있습니다.</span></li><li><b>좌굴 가정을 먼저 고정합니다</b><span class=\"sub\">설계기준, 유효길이계수 <b>K</b>, 비지지길이 <b>Ly / Lz / Lb / Lt</b>, 세장비 한계를 전역 또는 선택 부재에 지정한 뒤 설계에 들어갑니다.</span></li><li><b>단면을 거꾸로 제안받습니다</b><span class=\"sub\">RC 는 배근이 같은 부재를 묶어 단면을 역제안하고, 강구조는 목표 DCR 범위에 드는 규격을 라이브러리에서 전부 찾아 중량 증감과 함께 보여줍니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Design ▸ Concrete</span><span class=\"mi\">Design ▸ Steel</span><span class=\"mi\">Design ▸ Parameters</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 1004,
     "y": 272,
     "w": 484,
     "h": 508,
     "slot": "s22a_concrete",
     "kind": "auto",
     "src": "assets/auto/s22a_concrete.png",
     "caption": "<span class=\"mi\">Design ▸ Concrete</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s22b",
   "name": "Design Walls",
   "toc": "Design Walls",
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
     "html": "<div class=\"kicker\">Features ③</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">벽체 배근을 손으로 고르지 않는다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">전단과 P-M 을 동시에 만족하는 <b>가장 가벼운 배근</b>을, 벽마다 · 층마다 자동으로 찾습니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 856,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>Design Walls — 최소 배근을 찾아준다</b><span class=\"sub\">가는 직경부터 올려가며 각 직경에서 <b>통과하는 가장 큰 간격</b>을 잡습니다 — 그래서 철근이 남지 않습니다. 간격 상한은 <b>KDS 14 20 72</b>, 목표 DCR 은 기본 <b>0.8</b> 입니다.</span></li><li><b>Uniform · Boundary — 방식을 벽마다 고른다</b><span class=\"sub\">웹에 균등 배근하는 <b>Uniform</b>, 양단에 집중근과 구속 띠철근을 두는 <b>Boundary</b>. 전체 기본값을 정한 뒤 특정 부호만 예외로 둘 수 있습니다.</span></li><li><b>부호 하나에 벽이 여럿이면, 지배하는 벽이 정한다</b><span class=\"sub\">W1 같은 부호에는 위치가 다른 벽이 묶입니다. <b>벽마다 따로 설계</b>해 가장 불리한 결과를 부호의 배근으로 씁니다. L · T 형이나 주축이 회전한 건물도 그대로 처리합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Design ▸ Concrete ▸ ▶ Design Walls</span><span class=\"mi\">✓ Check Walls</span><span class=\"mi\">Design ▸ Wall Mark</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 1004,
     "y": 272,
     "w": 484,
     "h": 508,
     "slot": "s22b_wall_design",
     "kind": "user",
     "src": "",
     "caption": "<span class=\"mi\">▶ Design Walls</span> — 벽 일람표",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s22c",
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
     "html": "<div class=\"kicker\">Features ③</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">슬래브 설계와 부호 관리</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">슬래브 설계와 부호 관리.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>모델의 스팬과 하중을 그대로 씁니다</b><span class=\"sub\">뷰포트에서 정의한 슬래브의 Lx·Ly 와 DL·LL 을 가져오고, 두께·fck·fy 만 넣으면 전체를 한 번에 설계합니다.</span></li><li><b>2방향은 PCA 계수법, 1방향은 따로</b><span class=\"sub\">지지조건은 2방향 <b>4변 고정</b> · 1방향 <b>양단 고정</b>으로 통일하고, 그 가정을 결과표에 배지로 드러냅니다.</span></li><li><b>같은 배근끼리 묶어 부호를 답니다</b><span class=\"sub\">Auto-Detect Groups 가 슬래브를 묶어 <b>Slab Mark</b> 를 만들고, Slab Edit 에서 손으로 병합·수정합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Design ▸ Slab Design</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s22c_slab_design",
     "kind": "user",
     "src": "",
     "caption": "<span class=\"mi\">Slab Design</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s22d",
   "name": "Isolated Footing",
   "toc": "Isolated Footing",
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
     "html": "<div class=\"kicker\">Features ③</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">독립기초 — 반력에서 치수와 배근까지</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">기둥 하부 절점의 반력을 그대로 받아, 기초 치수와 배근을 자동으로 찾습니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>반력을 다시 만들지 않습니다</b><span class=\"sub\">지지절점 반력을 그대로 받아 여러 기초를 한 화면에서 일괄 설계합니다. 허용 지내력은 직접 입력합니다.</span></li><li><b>탐색으로 치수를 찾습니다</b><span class=\"sub\">한 변과 두께(<b>400mm</b>부터)를 키워 가며 지지력 · 펀칭전단 · 1방향전단 · 휨 · 최소철근 여섯 검토를 모두 만족하는 조합을 찾습니다.</span></li><li><b>가정을 숨기지 않습니다</b><span class=\"sub\">정사각형 · 핀 지지 전제의 균등압력 설계입니다. 배근은 <b>D16~D32</b> 를 작은 것부터 올리고 간격은 <b>50mm</b> 단위로 정리합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Design ▸ Footing Design▼ ▸ Isolated Footing</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s22d_isolated_footing",
     "kind": "user",
     "src": "",
     "caption": "<span class=\"mi\">Isolated Footing</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s22e",
   "name": "Mat Foundation",
   "toc": "Mat Foundation",
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
     "html": "<div class=\"kicker\">Features ③</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">매트기초 — 여러 기둥을 한 장의 판이 받는다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">기둥 하나씩 끊어 볼 수 없는 기초입니다. 셸 요소 판해석으로 판 전체를 풀어 설계합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>셸 판해석으로 풉니다</b><span class=\"sub\">벽·기둥 실형상을 합쳐 외곽선을 만들고 메쉬를 친 뒤, 지반을 선형 <b>Winkler</b> 스프링으로 두고 반력을 판에 싣습니다.</span></li><li><b>검토마다 맞는 하중을 씁니다</b><span class=\"sub\">지지력은 사용하중 조합의 절점 최대압력으로, 펀칭전단은 계수하중 조합마다 지반압을 뺀 <b>Vu</b> 로 판정합니다.</span></li><li><b>순서를 지켜야 값이 맞습니다</b><span class=\"sub\">조합마다 <b>Wood-Armer</b> 를 적용해 상·하부 4채널을 만든 뒤 포락합니다. 먼저 포락하면 설계모멘트 자체가 틀어집니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Design ▸ Footing Design▼ ▸ Mat Foundation</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s22e_mat_foundation",
     "kind": "user",
     "src": "",
     "caption": "<span class=\"mi\">Mat Foundation</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s22f",
   "name": "Pile Foundation",
   "toc": "Pile Foundation",
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
     "html": "<div class=\"kicker\">Features ③</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">파일기초 — 말뚝까지 같은 화면에서</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">매트와 같은 판해석 화면을 쓰되, 말뚝 배치와 케이스를 따로 관리합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>먼저 자동으로 깔고 시작합니다</b><span class=\"sub\">지지절점 위치와 축력으로 말뚝을 1차 배치합니다. 간격 <b>2.5D</b>, 기초판 끝선 연단거리 <b>1.25D</b> 가 기본값입니다.</span></li><li><b>자동배치는 초안일 뿐입니다</b><span class=\"sub\">결과를 보고 말뚝 절점을 옮기고 더하고 지우며 기초판 폴리곤도 넓히거나 줄입니다. 이 편집이 실제 작업의 중심입니다.</span></li><li><b>매트와 같은 뼈대를 씁니다</b><span class=\"sub\">말뚝을 선형 스프링으로 두어 케이스별 1회 해석 뒤 조합을 사후 결합합니다. 조합이 몇 개든 다시 풀지 않습니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Design ▸ Footing Design▼ ▸ Pile Foundation</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s22f_pile_foundation",
     "kind": "user",
     "src": "",
     "caption": "<span class=\"mi\">Pile Foundation</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s22g",
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
     "html": "<div class=\"kicker\">Features ③</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">어디가 위험한지 색으로 본다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">설계 마지막 단계. 부재별 안전율(DCR)을 모델 전체에 색으로 표시해 어디가 위험한지를 한눈에 봅니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>설계의 마지막 단계입니다</b><span class=\"sub\">보 · 기둥 · 벽 · 강구조의 <b>DCR</b> 을 한곳에 모아 NG · Warning · OK · Over · Uncheck 다섯 밴드로 3D 에 칠합니다.</span></li><li><b>검토 안 된 부재를 숨기지 않습니다</b><span class=\"sub\">결과가 없는 부재는 <b>Uncheck</b> 로 따로 셉니다. Checked N/M 이 늘 함께 떠서 \"다 봤다\"는 착각을 막습니다.</span></li><li><b>색은 적녹색약을 기준으로 골랐습니다</b><span class=\"sub\">OK 초록·Warning 주황 조합을 버리고 명도까지 벌린 팔레트로 바꿨습니다. 음영내성 실측 <b>7.5 → 33.4</b>(판정선 24).</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Design ▸ Concrete ▸ Safety Review</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s22g_safety_review",
     "kind": "user",
     "src": "",
     "caption": "<span class=\"mi\">Safety Review</span> — DCR 컨투어",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s23",
   "name": "기능 ④ 내진성능평가 · 성능기반설계",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Features ④</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">내진성능평가와 성능기반설계</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">OpenSees를 엔진으로 선택한 이유가 가장 잘 드러나는 영역입니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 278.5,
     "w": 809.8,
     "h": 367.4,
     "html": "<ul class=\"bul\" style=\"--li:1\">\n          <li><b>기존 건축물 내진성능평가</b>\n            <span class=\"sub\"><span class=\"mi\">Run Pre. Eval.</span> 예비평가 →\n              <span class=\"mi\">Run m-Factor</span> 선형 m계수 평가 →\n              <span class=\"mi\">Run Pushover</span> 비선형 정적해석.\n              <span class=\"mi\">Performance Status</span> <span class=\"mi\">Hinge Status</span>로 힌지 상태를 3D로 확인합니다.</span></li>\n          <li><b>성능기반설계 — 비선형 시간이력해석</b>\n            <span class=\"sub\"><span class=\"mi\">Load Cases &amp; Scaling</span>에서 지진파를 기준에 맞게 스케일링·스펙트럼 매칭하고,\n              <span class=\"mi\">Run THA</span>로 해석합니다.</span></li>\n          <li><b>결과를 기준으로 판정</b>\n            <span class=\"sub\">층간변위 · 층전단 · 힌지 이력곡선 · <b>전단벽 압축변형률·전단력 검토</b>까지 제공합니다.</span></li>\n          <li><span class=\"mi\">Energy Balance</span>\n            <span class=\"sub\">에너지 오차로 해석 신뢰도를 확인합니다. 비선형 해석은 <b>수렴했다고 맞는 것이 아니기</b> 때문입니다.</span></li>\n        </ul>",
     "k": 0.9148
    },
    {
     "id": "e5",
     "type": "image",
     "x": 948.1,
     "y": 278.5,
     "w": 539.9,
     "h": 244.3,
     "slot": "s23_pushover",
     "kind": "auto",
     "src": "",
     "caption": "<span class=\"mi\">Pushover Curve</span>",
     "fit": "contain",
     "recW": "1100",
     "recH": "750",
     "k": 0.9148
    },
    {
     "id": "e6",
     "type": "image",
     "x": 948.1,
     "y": 543.3,
     "w": 539.9,
     "h": 244.3,
     "slot": "s23_tha_result",
     "kind": "user",
     "src": "",
     "caption": "THA 결과 화면",
     "fit": "contain",
     "recW": "1100",
     "recH": "750",
     "k": 0.9148
    }
   ],
   "ch": "c4",
   "grp": "g4",
   "grpOpen": true,
   "toc": "내진성능평가 · PBSD — 한눈에"
  },
  {
   "id": "s23a",
   "name": "기존 건축물 내진성능평가",
   "toc": "기존 건축물 내진성능평가",
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
     "html": "<div class=\"kicker\">Features ④</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">m계수로 부재마다 성능을 판정한다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">선형 절차로 부재 하나하나의 여유를 봅니다. 기존 건축물 내진성능평가의 1차 평가입니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>조합마다 처음부터 다시 셉니다</b><span class=\"sub\">재현주기 레벨 × 자동 생성 <b>64 조합</b>을 이중 루프로 돌며, m계수를 조합별 축력으로 매번 재산정합니다.</span></li><li><b>강도는 거동에 맞춰 씁니다</b><span class=\"sub\">휨은 기대강도(<b>f_ce · f_ye</b>), 전단은 공칭강도, <b>φ = 1.0</b>. 지배 케이스는 붕괴 부재 우선, 그다음 여유가 가장 작은 조합입니다.</span></li><li><b>부재만 보지 않습니다</b><span class=\"sub\">RC 보·기둥, 전단벽, 조적 채움벽, 층간변위를 함께 판정하고 <b>Performance Status</b> 로 3D 에 표시합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Seismic / PBD ▸ m-Factor</span><span class=\"mi\">▶ Run m-Factor</span><span class=\"mi\">Performance Status</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s23a_preeval",
     "kind": "auto",
     "src": "assets/auto/s23a_preeval.png",
     "caption": "<span class=\"mi\">▶ Run Pre. Eval.</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s23b",
   "name": "Run Pushover · Hinge Status",
   "toc": "Run Pushover · Hinge Status",
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
     "html": "<div class=\"kicker\">Features ④</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">비선형 정적해석과 힌지 상태</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">Run Pushover 비선형 정적해석. Pushover Curve 로 역량곡선을, Hinge Status 로 힌지 상태를 3D로 확인합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>탄성 해석 결과를 다시 씁니다</b><span class=\"sub\">Pushover 는 Eigen · RSA 결과와 Hinge Properties 의 <b>FEMA 백본</b>을 재활용합니다. 처음부터 새로 돌리지 않습니다.</span></li><li><b>한 방향에 두 분포로</b><span class=\"sub\">역삼각(Fi∝hi)과 균등을 각각 밀어 불리한 쪽을 씁니다. 제어절점은 최상층 질량중심이 기본이고 직접 찍을 수도 있습니다.</span></li><li><b>성능점과 손상 순서를 봅니다</b><span class=\"sub\"><b>FEMA 440</b> 등가선형화로 목표변위를 구하고, 스텝을 넘기며 힌지가 <b>IO · LS · CP</b> 로 번지는 순서를 3D 에서 확인합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Seismic / PBD ▸ Push. Load Case</span><span class=\"mi\">Run Pushover</span><span class=\"mi\">Pushover Curve</span><span class=\"mi\">Hinge Status</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s23b_pushover_curve",
     "kind": "auto",
     "src": "assets/auto/s23b_pushover_curve.png",
     "caption": "<span class=\"mi\">Pushover Curve</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s23c",
   "name": "Load Cases & Scaling",
   "toc": "Load Cases & Scaling",
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
     "html": "<div class=\"kicker\">Features ④</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">지진파를 기준에 맞게 스케일링한다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">Load Cases & Scaling 에서 지진파를 기준에 맞게 스케일링·스펙트럼 매칭합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>KDS 41 17 00 §7.3.4.1 그대로</b><span class=\"sub\">선정한 지진파 묶음의 평균 스펙트럼이 검사구간 <b>0.2T ~ 1.5T</b> 에서 최소응답스펙트럼 이상인지 판정합니다.</span></li><li><b>3차원은 SRSS 평균에 1.3 배</b><span class=\"sub\">쌍의 두 수평성분을 주기별 SRSS 한 평균에 목표 <b>1.3</b>, 2차원은 개별성분 평균에 1.0. X·Y 배율은 항상 같습니다.</span></li><li><b>배율로 안 되면 파형을 고칩니다</b><span class=\"sub\">시간영역 스펙트럼 매칭(<b>REQPY</b>)으로 파형 자체를 목표에 재성형합니다. 생성방법에 따라 최소목표가 0.90 · 1.10 · 0.80 으로 갈립니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Seismic / PBD ▸ Time History Load Case</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s23c_gm_scaling",
     "kind": "auto",
     "src": "assets/auto/s23c_gm_scaling.png",
     "caption": "지진파 스케일링",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s23d",
   "name": "Run THA",
   "toc": "Run THA",
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
     "html": "<div class=\"kicker\">Features ④</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">비선형 시간이력해석</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">Run THA 로 해석합니다. OpenSees를 엔진으로 선택한 이유가 가장 잘 드러나는 영역입니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>THA 는 힌지를 만들지 않습니다</b><span class=\"sub\">백본 생성은 <b>Hinge Properties</b> 전담이고 THA 는 그것을 소비만 합니다. Pushover 와 같은 백본을 공유합니다.</span></li><li><b>돌리기 전에 세 가지를 봅니다</b><span class=\"sub\">지진파 쌍 선택 · RSA 완료 · 백본 생성 상태를 한 화면에서 확인하고, 셋이 다 준비돼야 <b>Run Now</b> 가 켜집니다.</span></li><li><b>앙상블 규칙이 집계를 정합니다</b><span class=\"sub\">쌍이 <b>7개</b> 이상이면 평균, 3~6개면 포락으로 반영합니다. 모델이 바뀌어 백본이 낡으면 준비 안 됨으로 판정합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Seismic / PBD ▸ Run THA</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s23d_tha_config",
     "kind": "auto",
     "src": "assets/auto/s23d_tha_config.png",
     "caption": "<span class=\"mi\">Run THA</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s23e",
   "name": "결과를 기준으로 판정",
   "toc": "결과를 기준으로 판정",
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
     "html": "<div class=\"kicker\">Features ④</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">층간변위 · 층전단 · 힌지 이력 · 벽체 검토</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">층간변위 · 층전단 · 힌지 이력곡선 · 전단벽 압축변형률·전단력 검토까지 제공합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>층간변위는 가장자리에서 봅니다</b><span class=\"sub\">질량중심 한 점이 아니라 코너까지 판정합니다. 강막 마스터절점의 (ux, uy, rz) 로 역산하므로 지점을 바꿔도 재해석이 없습니다.</span></li><li><b>층전단은 RSA 와 겹쳐 봅니다</b><span class=\"sub\">판정이 아니라 비교입니다. 튀는 지진파가 있는지, 앙상블 평균이 탄성 MCE 기준선과 크게 다르지 않은지 눈으로 확인합니다.</span></li><li><b>벽체는 변형지배와 힘지배로 나눠</b><span class=\"sub\">콘크리트 압축 <b>0.002</b> · 철근 인장 <b>0.02</b>(내진 0.04) 로 변형률을, 전단은 <b>1.2·F_s</b> 를 공칭 <b>V_n</b> 과 대조합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Seismic / PBD ▸ Result Analysis▼</span><span class=\"mi\">Story Drift</span><span class=\"mi\">Story Shear</span><span class=\"mi\">Wall Strain</span><span class=\"mi\">Wall Shear</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s23e_story_drift",
     "kind": "auto",
     "src": "assets/auto/s23e_story_drift.png",
     "caption": "층간변위 검토",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s23f",
   "name": "Energy Balance",
   "toc": "Energy Balance",
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
     "html": "<div class=\"kicker\">Features ④</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">수렴했다고 맞는 것이 아니다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">에너지 오차로 해석 신뢰도를 확인합니다. 비선형 해석은 수렴했다고 맞는 것이 아니기 때문입니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>에너지로 되짚습니다</b><span class=\"sub\">매 스텝 입력 · 운동 · 감쇠 · 흡수 에너지를 독립 산정하고, 최대 불균형을 입력에너지로 나눠 <b>err(%)</b> 로 봅니다.</span></li><li><b>흡수를 둘로 나눕니다</b><span class=\"sub\">되돌아오는 탄성 변형에너지와 비가역 소성 소산에너지를 분리해, 신뢰도와 손상 정도를 함께 읽습니다.</span></li><li><b>판정이 아니라 신호입니다</b><span class=\"sub\">err 이 <b>2%</b> 를 넘으면 그 런의 변위·부재력·힌지를 믿기 전에 수렴 설정을 점검하라는 뜻입니다. 결과값은 바꾸지 않습니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Seismic / PBD ▸ Energy Balance</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s23f_energy_balance",
     "kind": "user",
     "src": "",
     "caption": "<span class=\"mi\">Energy Balance</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s24",
   "name": "기능 ⑤ 산출물 자동화",
   "els": [
    {
     "id": "e1",
     "type": "text",
     "x": 112,
     "y": 73.6,
     "w": 1376,
     "h": 32.4,
     "html": "<div class=\"kicker\">Features ⑤</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">해석이 끝이 아닙니다 — 내야 할 것까지</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 215.7,
     "w": 395.3,
     "h": 285.2,
     "html": "<div class=\"card\">\n        <h3>구조계산서</h3>\n        <p><span class=\"mi\">Structural Design Calculations</span><br>\n          해석·설계 결과를 계산서 형태로 자동 생성합니다.</p>\n      </div>",
     "k": 0.954
    },
    {
     "id": "e4",
     "type": "text",
     "x": 534.8,
     "y": 215.7,
     "w": 299.4,
     "h": 285.2,
     "html": "<div class=\"card\">\n        <h3>부재 계산서</h3>\n        <p><span class=\"mi\">DesignPad</span><br>\n          RC · 강구조 · PC/PSC 부재를 개별 계산하고,\n          모델에서 부재력을 가져와 일괄 검토합니다.</p>\n      </div>",
     "k": 0.954
    },
    {
     "id": "e5",
     "type": "text",
     "x": 861.7,
     "y": 215.7,
     "w": 299.4,
     "h": 285.2,
     "html": "<div class=\"card\">\n        <h3>구조도면</h3>\n        <p><span class=\"mi\">Structural Drawings</span><br>\n          구조평면도 · 배근도 · 일람표를 DXF로 반출합니다.</p>\n      </div>",
     "k": 0.954
    },
    {
     "id": "e6",
     "type": "text",
     "x": 1188.6,
     "y": 215.7,
     "w": 299.4,
     "h": 285.2,
     "html": "<div class=\"card\">\n        <h3>물량 산출</h3>\n        <p><span class=\"mi\">Quantity Takeoff</span><br>\n          콘크리트 · 철근 · 거푸집 물량을 모델에서 직접 집계합니다.</p>\n      </div>",
     "k": 0.954
    },
    {
     "id": "e7",
     "type": "image",
     "x": 112,
     "y": 531.4,
     "w": 539.4,
     "h": 254.3,
     "slot": "s24_designpad",
     "kind": "auto",
     "src": "",
     "caption": "<span class=\"mi\">DesignPad</span>",
     "fit": "contain",
     "recW": "1100",
     "recH": "700",
     "k": 0.954
    },
    {
     "id": "e8",
     "type": "image",
     "x": 678.9,
     "y": 531.4,
     "w": 809.1,
     "h": 254.3,
     "slot": "s24_output",
     "kind": "user",
     "src": "",
     "caption": "계산서 · 도면 · 물량 출력물",
     "fit": "contain",
     "recW": "1400",
     "recH": "700",
     "k": 0.954
    }
   ],
   "ch": "c4",
   "grp": "g5",
   "grpOpen": true,
   "toc": "산출물 자동화 — 한눈에"
  },
  {
   "id": "s24a",
   "name": "구조계산서",
   "toc": "구조계산서",
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
     "html": "<div class=\"kicker\">Features ⑤</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">해석·설계 결과가 곧 계산서가 된다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">Structural Design Calculations — 해석·설계 결과를 계산서 형태로 자동 생성합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>버튼 하나로 다시 씁니다</b><span class=\"sub\"><b>Generate / Update</b> 가 보 · 기둥 · 벽 Check 를 내부에서 돌려 표와 계산 시트를 다시 채웁니다.</span></li><li><b>사람이 쓴 것은 건드리지 않습니다</b><span class=\"sub\">표지 · 삽입 이미지 · 직접 편집한 섹션은 그대로 두고 자동 섹션만 갱신합니다. 모델의 배근도 바꾸지 않습니다.</span></li><li><b>화면이 곧 A4 입니다</b><span class=\"sub\">편집기 우측이 진짜 <b>A4</b> 페이지 경계로 보이고 표지·목차·간지·본문이 이어집니다. 미리보기와 PDF 가 같은 함수를 씁니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Results ▸ Structural Design Calculations</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s24a_calc_report",
     "kind": "auto",
     "src": "assets/auto/s24a_calc_report.png",
     "caption": "구조계산서",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s24b",
   "name": "DesignPad",
   "toc": "DesignPad",
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
     "html": "<div class=\"kicker\">Features ⑤</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">부재 계산서를 따로, 그리고 일괄로</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">RC · 강구조 · PC/PSC 부재를 개별 계산하고, 모델에서 부재력을 가져와 일괄 검토합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 856,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>손입력 대신 모델에서 끌어옵니다</b><span class=\"sub\"><b>Import from Model</b> 이 단면 · 재료 · 배근과 지배 부재력을 채웁니다. 배근은 있으면 채우고 없으면 비워 둡니다.</span></li><li><b>지배 부재력을 그대로 씁니다</b><span class=\"sub\">보는 I · 중앙 · J 위치별, 기둥은 <b>P-M-M</b> 과 전단, 벽은 <b>Design Walls</b> 포락, 기초는 지지절점 반력 포락을 가져옵니다.</span></li><li><b>여러 부재를 한 번에</b><span class=\"sub\">체크박스로 골라 일괄 임포트하고, 부재별로 입력을 고친 뒤 Run 해서 계산서를 이미지 · PDF 로 반출합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">DesignPad ▸ RC</span><span class=\"mi\">Steel</span><span class=\"mi\">PC/PSC</span><span class=\"mi\">Misc</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 1004,
     "y": 272,
     "w": 484,
     "h": 508,
     "slot": "s24b_designpad",
     "kind": "auto",
     "src": "assets/auto/s24b_designpad.png",
     "caption": "<span class=\"mi\">DesignPad</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s24c",
   "name": "Structural Drawings",
   "toc": "Structural Drawings",
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
     "html": "<div class=\"kicker\">Features ⑤</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">구조평면도 · 배근도 · 일람표를 DXF로</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">구조평면도 · 배근도 · 일람표를 DXF로 반출합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>두 파일로 나눕니다</b><span class=\"sub\">구조평면도가 한 장, 배근도와 일람표가 한 장입니다. 배근도에 일람표를 넣는 실무 관습을 그대로 따릅니다.</span></li><li><b>일람표는 그림이 있는 시트입니다</b><span class=\"sub\">텍스트 표가 아니라 대표단면을 배근까지 그려 넣고 규격 표를 붙입니다. 철근은 강종별로 <b>D · HD · UHD · SHD</b> 를 구분합니다.</span></li><li><b>CAD 에서 열리는 DXF 를 씁니다</b><span class=\"sub\"><b>R2000</b> 필수 골격을 전부 갖춘 단일 writer 로만 내보냅니다. A4 PDF 로도 함께 반출합니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Structural Drawings ▸ Structural Drawings</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s24c_drawings",
     "kind": "user",
     "src": "",
     "caption": "구조도면 DXF",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
    }
   ]
  },
  {
   "id": "s24d",
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
     "html": "<div class=\"kicker\">Features ⑤</div>"
    },
    {
     "id": "e2",
     "type": "text",
     "x": 112,
     "y": 120.4,
     "w": 1376,
     "h": 67.2,
     "html": "<h2 class=\"title\">물량을 모델에서 직접 집계한다</h2>"
    },
    {
     "id": "e3",
     "type": "text",
     "x": 112,
     "y": 206.8,
     "w": 1301,
     "h": 45.4,
     "html": "<p class=\"lead\">콘크리트 · 철근 · 거푸집 물량을 모델에서 직접 집계합니다.</p>"
    },
    {
     "id": "e4",
     "type": "text",
     "x": 112,
     "y": 272,
     "w": 744,
     "h": 508,
     "html": "<div class=\"fbody\"><ul class=\"bul\" style=\"--li:1\"><li><b>다섯 항목을 냅니다</b><span class=\"sub\">콘크리트 체적 · 철근 중량 · 거푸집 면적 · 철골 중량 · 철골 도장면적. 저장된 배근과 단면을 읽기만 하고 설계를 다시 돌리지 않습니다.</span></li><li><b>등급별로 나눠 셉니다</b><span class=\"sub\">fck 등급과 강재 강종마다 따로 집계하고 단가를 각각 입력합니다. 재료가 지정 안 된 요소는 <b>Unassigned</b> 로 따로 둡니다.</span></li><li><b>집계 단위를 고릅니다</b><span class=\"sub\">마크별 · 층별 · 건물 전체, 철골은 단면 사이즈별까지. 할증률은 항목마다 넣고, 단가를 채우면 참고용 원가 리포트가 함께 나옵니다.</span></li></ul><div class=\"mpath\"><span class=\"lbl\">메뉴</span><span class=\"mi\">Structural Drawings ▸ Quantity Takeoff</span></div></div>"
    },
    {
     "id": "e5",
     "type": "image",
     "x": 892,
     "y": 272,
     "w": 596,
     "h": 508,
     "slot": "s24d_quantity",
     "kind": "user",
     "src": "",
     "caption": "<span class=\"mi\">Quantity Takeoff</span>",
     "fit": "contain",
     "recW": "1400",
     "recH": "1000"
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
