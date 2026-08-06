# Command Studio Phase 1 구현서

> 상태: **결함 수정 + UI 재설계 완료 · 헤드리스 검사 전 PASS — 앱 라이브 스모크만 남음**
> 최초 작성일: 2026-08-05 · **정정·수정일: 2026-08-06 (상용 제품 조사 → 결정 5건 확정 → 구현)**
> 진입점: `Tools ▸ Model Automation ▸ Command Studio`

---

## 0. 이 문서의 정정 이력 (2026-08-06)

> **초판(2026-08-05)은 "Phase 1 구현 완료"로 닫혀 있었으나, 코드 전수 검토와 실측 하네스로
> 데이터 손상 경로 7건이 확인되어 상태를 되돌린다. 구현이 개발서를 어긴 것이 아니라,
> 개발서의 규칙 자체가 틀렸거나 다루지 않은 영역이 결함이 됐다.**

| 갈래 | 내용 | 해당 절 |
|---|---|---|
| **① 개발서 규칙이 그대로 결함** | 충실히 구현해서 생긴 문제. 규칙을 고쳐야 코드가 고쳐진다 | §2-1(단위) · §6-B(중복검사 범위) |
| **② 개발서가 다루지 않은 영역** | 규칙이 없어서 검사도 없었던 곳 | §6-C(왕복 보존성) · §6-D(필드 삭제) · §6-E(ID 카운터) · §4-1(편집 되돌리기) |
| **③ 문서와 코드 불일치** | 문서 예제가 실제로는 오류 | §3-1(`RECT` 예제) |

초판에서 **철회·수정된 문장**:

- ~~"단위는 내부 규칙이므로 Command Studio UI에 별도로 노출하지 않는다."~~ → **철회.** CLAUDE.md 최우선 원칙 위반이며, **조사한 상용 제품 3종이 모두 정반대로 한다**(§10 D1). `*UNIT` 명령 도입으로 대체.
- ~~"동일 좌표 절점, 동일 연결 요소, 자기 자신을 연결한 요소를 차단한다."~~ → **범위 미기재로 오구현.** §6-B로 대체.
- ~~§3 SECTION 예제의 `RECT`~~ → 실제로는 파싱 오류. §3-1에서 대소문자 무시로 통일 확정.
- ~~"Phase 1 구현 완료"~~ → "코드 구현 완료 · 검증 미완". §9 결함 대장 신설.

**초판이 근거로 든 자동 검사 2종은 지금도 통과한다. 그것이 안전의 증거가 되지 못한다는 점을 §7-1에 명시했다.**

### 0-1. 이번 정정의 조사 방법

추측을 배제하기 위해 **경쟁 상용 제품의 공식 문서를 직접 확인**했다(§13 출처). 대상은 같은 문제를 이미 푼 세 제품이다.

| 제품 | 대응 기능 | 조사 목적 |
|---|---|---|
| MIDAS Civil/Gen | **MCT Command Shell** + MGT/MCT 파일 형식 | 명령 텍스트로 현재 모델을 갱신하는 워크플로 |
| CSI ETABS / SAP2000 | **Interactive Database Editing** | 표 형태 대량 편집의 단위·Undo·오류처리 |
| Bentley STAAD.Pro | 입력 명령 파일(Editor) | 텍스트 명령의 단위 선언 규약 |

> ⚠ **IP 원칙 준수**: 확인한 것은 *"어떤 데이터·규약이 필요한가"* 이며, UI 레이아웃·컬럼 구성·문구는 복제하지 않는다(CLAUDE.md 지적재산권 독립성). 아래 결정들은 전부 **공학적 규약**(단위 선언, 검증 범위, 되돌리기 유무)이지 표현 형식이 아니다.

---

## 1. 목적과 범위

Command Studio는 현재 모델에서 많은 데이터를 텍스트로 뽑아 일괄 편집한 뒤, 변경 내용을 검토하고 한 번에 적용하는 도구다. 소수 항목의 폼 편집보다 수백~수만 행의 대량 수정에 초점을 둔다.

Phase 1 지원 명령은 다음 여섯 종류다.

| 명령 | 역할 | Phase 1 동작 |
|---|---|---|
| `*UNIT` | **초안의 단위 선언** | 필수(§2-1) |
| `*NODE` | 절점 좌표 | 추가, 수정, 추출 |
| `*ELEMENT` | 선 요소 연결·속성 | 추가, 수정, 추출 |
| `*MATERIAL` | 재료 | 추가, 수정, 추출 |
| `*SECTION` | 단면 | 추가, 수정, 추출 |
| `*THICKNESS` | 두께 | 추가, 수정, 추출 |
| `*CONSTRAINT` | 절점 구속 | 추가, 수정, 추출 |

삭제 명령, 하중, 벽 요소, 링크, 해석 명령은 Phase 1에 포함하지 않는다. 알 수 없는 명령은 건너뛰지 않고 오류로 처리하여 부분 적용을 방지한다.

### 1-1. 비대상 — **MIDAS `.mgt` 파일 임포트가 아니다**

> **Command Studio의 문법은 MGT를 참고한 DCR 자체 형식이다. 실제 `.mgt` 파일을 붙여넣으면 통째로 거부된다.**

MIDAS 공식 레퍼런스 기준 MGT `*ELEMENT`(Frame)는 `iEL, TYPE, iMAT, iPRO, iN1, iN2, ANGLE, iSUB, EXVAL` — **9필드**이고, `*MATERIAL`은 `iMAT, TYPE, MNAME, SPHEAT, HEATCO, [DATA1]` 스키마다([MGT File Quick Reference](https://manual.midasuser.com/EN_Common/Gen/891/Start/14_Appendix/MGT_File_Quick_Reference.htm)). Command Studio는 각각 6~7필드, 7~10필드만 받는다. 미지원 명령(`*STLDCASE` 등)은 오류이므로 파일 전체가 막힌다(설계 의도).

→ 릴리스노트 v0.9.253의 *"MGT-compatible command editor"* 문구는 과장이다. **정정 방식은 §10 D3 확정.**
→ 전체 `.mgt` 파일 임포트는 기존 `mgtImporter` 경로가 담당하며 Command Studio와 무관하다.

---

## 2. 사용자 흐름

1. `Tools ▸ Command Studio`를 연다.
2. 왼쪽 `Pull Model Data`에서 범위와 데이터 종류를 선택한다.
3. `Replace Draft`, `Append`, 또는 `At Cursor`로 모델 데이터를 편집기에 가져온다. **이때 `*UNIT` 헤더가 함께 방출된다.**
4. 찾기/바꾸기, 필드 일괄 변환, 정렬, 중복 제거로 대량 편집한다. **모든 편집 도구는 편집기 내 Undo로 되돌릴 수 있다.**
5. `Review Changes`에서 Add/Update/Unchanged와 오류, **그리고 값의 before → after**를 확인한다.
6. `Apply to Model`을 누르고 최종 확인한다.
7. 적용 전체는 History의 `Command Studio Apply` 한 단계로 기록되며 Undo/Redo할 수 있다.

### 2-1. 단위 규약 — **초안이 자기 단위를 소유한다** (초판 규칙 철회)

초판은 *"현재 표시 단위가 자동 적용되고 UI에 노출하지 않는다"* 고 적었고 코드는 그대로 구현됐다. 그 결과 **P0 결함 2건**이 생겼다.

**(a) 열린 초안이 단위 변경 때 재해석된다.**
파싱이 파싱 시점 단위로 `toStore`한다([engine:324](../frontend/src/services/commandStudioEngine.ts)). 모달은 `unitSystem`이 바뀌면 같은 텍스트로 plan을 다시 만들고([Modal:263,285](../frontend/src/components/tools/CommandStudioModal.tsx)), Apply 직전 재검증도 `getUnits(현재)`를 다시 읽어 막지 못한다([Modal:429](../frontend/src/components/tools/CommandStudioModal.tsx)).

실측:

```text
N,mm 에서 Pull:  *NODE\n1, 0, 0, 0\n2, 6000, 0, 0
초안 그대로 두고 단위를 kN,m 로 변경 → 재파싱 결과 node2.x = 6000000
오류 0건 → Apply 활성 상태 유지 (모델이 1000배로 늘어난다)
```

**(b) 단위 라벨이 어디에도 없다.** `serializeCommandStudio`는 §3의 `;` 헤더 주석을 **한 줄도 쓰지 않는다**(실측 출력 `"*ELEMENT\n1, TRUSS, 1, 1, 1, 2, 0"`). `kN·m` 프로젝트에서 `E=30000`을 넣으면 30000 kN/m²(=0.03 MPa)가 저장된다.

#### 확정 규약 (§10 D1)

**조사한 세 제품이 예외 없이 "편집 대상이 자기 단위를 명시적으로 소유"한다.**

- MIDAS MGT/MCT: 파일 첫머리에 `*UNIT` 명령이 있고 `; FORCE, LENGTH` 형식, 기본값 `{tonf}`, `{m}`.
- STAAD.Pro: `UNIT` 명령을 파일 어디에나 넣을 수 있고 *"all data is assumed to be in the most recent unit specification preceding that data"*, 미지정 시 ft/kip.
- CSI ETABS/SAP2000: 표의 **열 제목 바로 아래 칸에서 단위를 고르며**, *"The units chosen while interactively editing tables are temporary. All values will be converted back to the current model units when the editing is applied to the model."* — 편집 세션의 단위가 모델 단위와 분리돼 있고, 적용 시 변환된다.

따라서 DCR도 같은 구조를 채택한다.

```text
*UNIT
; FORCE, LENGTH
kN, m

*NODE
1, 0, 0, 0
```

| 규칙 | 내용 |
|---|---|
| **R1** | 초안의 수치 단위는 **`*UNIT` 선언이 결정한다.** 앱의 현재 표시 단위는 파싱에 관여하지 않는다 |
| **R2** | `Pull` 은 항상 `*UNIT`(그 시점 표시 단위)을 초안 첫머리에 방출한다 |
| **R3** | `*UNIT` 이 없는 초안은 **오류**다. 기본값을 가정하지 않는다 — 그 가정이 정확히 이번 P0-1의 원인이다. 오류 메시지에 **`*UNIT, <현재단위>` 를 첫 줄에 삽입하는 quick-fix**를 붙인다 |
| **R4** | STAAD 선례에 따라 **초안 중간에서 `*UNIT` 재선언을 허용한다.** 각 데이터 행은 바로 앞의 `*UNIT` 을 따른다(서로 다른 출처의 초안을 붙여 쓸 수 있어야 한다) |
| **R5** | 앱의 단위계를 바꿔도 **초안 텍스트와 해석 결과는 불변**이다. 상태바에 `Draft units: kN, m` 를 상시 표시한다 |
| **R6** | 힘·길이 축만 선언한다. 응력·관성·단위중량 등 파생 단위는 `getUnits()` 가 두 축에서 유도한다(현행 어댑터 그대로) |
| **R7** | `*UNIT` 은 **모델을 바꾸지 않는다.** diff·Apply 대상이 아니다 |
| **R8** | `Insert at cursor` 로 Pull 하면 삽입된 `*UNIT` 이 **그 아래 모든 행**에 계속 적용된다(R4 의 이면). 커서 뒤 행들이 조용히 다른 단위로 재해석되지 않도록, 삽입 지점에서 유효하던 선언을 블록 뒤에 자동으로 되돌려 놓는다. `Append` 는 뒤에 아무것도 없으므로 해당 없음 |

> **왜 "표시 단위 자동 추종"이 아니라 "초안이 소유"인가** — 사용자는 작업 중 단위를 언제든 바꾼다(CLAUDE.md 런타임 불변조건). 초안은 이미 숫자로 굳은 텍스트라 나중에 무슨 단위였는지 복원할 방법이 없다. 세 제품이 전부 파일/세션에 단위를 박아 두는 이유가 이것이다.

---

## 3. 명령 형식

```text
*UNIT
; FORCE, LENGTH
kN, m

*NODE
; ID, X, Y, Z
1, 0, 0, 0

*ELEMENT
; ID, TYPE, MATERIAL, SECTION, NODE-I, NODE-J, BETA
1, BEAM, 1, 1, 1, 2, 0

*MATERIAL
; ID, TYPE, NAME, GRADE, E, NU, UNIT-WEIGHT, FCK, FY, FU
1, CONCRETE, C30, C30, 30000, 0.2, 0.000024, 30, ,

*SECTION
; ID, TYPE, NAME, A, IZ, IY, J, H, BF, TF, TW, D, T, B, MEMBER-TYPE
1, RECT, B300x600, 180000, 5400000000, 1350000000, 2900000000, 600, 300, , , , , 300, BEAM

*THICKNESS
; ID, NAME, THICKNESS
1, W200, 200

*CONSTRAINT
; NODE, DOF
1, 111000
```

- `TYPE`(ELEMENT)은 `BEAM` · `TRUSS` · `TENSTR`(인장전담) · `CMPSTR`(압축전담). **DCR `mgtImporter` 의 기존 토큰과 동일**하다([mgtImporter.ts:615-628](../frontend/src/services/mgtImporter.ts)).
- **`Pull` 은 위 `;` 헤더 주석을 반드시 함께 방출한다**(현재 미구현 = P0-2). 헤더가 없으면 사용자는 열 순서를 추측해야 한다.

### 3-1. 대소문자 — **전부 무시로 통일** (§10 D4 확정)

초판 예제 `1, RECT, …` 는 **현재 코드에서 오류**다(실측: `Unsupported section type "RECT"`). 지금은 필드마다 규칙이 다르다.

| 필드 | 현재 | 확정 |
|---|---|---|
| 명령 헤더, ELEMENT TYPE, MATERIAL TYPE, MEMBER-TYPE | 대소문자 무시 | 유지 |
| **SECTION TYPE** | **구분함(`rect`만 통과)** | **무시로 변경** |

근거: MIDAS MCT·STAAD 모두 명령/키워드가 대소문자 비구분이다(STAAD 문서: *"STAAD commands are not case sensitive"*). 여섯 필드 중 하나만 예외인 것이 이 결함의 원인이므로 예외를 없앤다.
구현: `Section['type']`(`H_beam`·`C_section` 등 혼합 표기)에 대해 **소문자 정규화 매핑 테이블**을 두고 조회한다. 직렬화는 store 원표기를 그대로 쓴다.

### 3-2. 필드 개수와 빈 필드 (§10 D2 확정)

| 규칙 | 내용 |
|---|---|
| **F1** | 빈 줄과 `;` 주석 허용. 필드는 쉼표 구분. 이름에 쉼표가 있으면 큰따옴표로 감싼다 |
| **F2** | 같은 명령·ID가 한 초안에 중복되면 오류 |
| **F3** | **행 끝의 빈 필드는 무시한다.** `1, 0, 0, 0,` 은 정상 4필드로 읽는다(현재는 오류 = P1) |
| **F4** | **빈 필드 = "값 없음"이다.** 그 필드를 비우면 해당 값이 **삭제**된다 |
| **F5** | 단, **스키마에 없는 필드는 항상 보존**한다 — `fyS`·`fce`·`fye`·κ·PBSD override·`rebar`·`stiffScale`·`sectionProperties`·`subKind`·`confinement` 등. Command Studio가 모르는 값을 지우는 일은 없다 |

> **F4 근거** — MIDAS MGT 레퍼런스는 *"Blank or omitted fields typically invoke their documented default values"* 로, 빈 필드를 **기본값(=값 없음)** 으로 읽는다. CSI 표 편집도 행 전체가 그 객체의 완전한 상태다. 현재 DCR 구현(`{...기존, ...신규}` 병합)만 **"빈칸 = 유지"** 여서, 값을 지울 방법이 없고 지운 줄 알게 만든다(P0-5).
> **F5 근거** — Pull 이 방출하지 않는 필드까지 지우면 배근·단면 형상 등 다른 화면의 작업이 소실된다. "스키마가 소유한 필드만 초안이 통제한다"가 무손실 왕복의 전제다.

---

## 4. UI 구성 — **2026-08-06 재설계 확정**

> 초판 레이아웃(세로 밴드 4 × 세로 열 3 × 탭 2 = **조작 영역 9개**, 첫 화면 컨트롤 30여 개)은
> 사용자 검토에서 *"복잡하기만 하다"* 로 반려됐다. 목업 확인 후 아래 구조로 확정한다
> (CLAUDE.md 모달 목업 원칙에 따라 Artifact 목업 → 승인 → 구현 순서를 지켰다).
> **기능은 하나도 제거하지 않는다. 줄어드는 것은 구획이다.**

```text
┌ 헤더 ── Command Studio · Bulk model editor ····· [Draft units: kN, m] ● Modified [×]
├ 단일 툴바 ── [Pull Model Data ▾] │ Open  Save │ ↶ ↷ │ Find  Transform  Sort  Dedup ··· N records
├───────────────────────────────────────────────┬──────────────────────────────────┤
│ 에디터 (줄번호 + 초안 텍스트, 오류 줄 표시)      │ 검토 도크 300px (접기 가능)        │
│                                               │  Changes n │ Errors n │ All n     │
│                                               │  칩: NODE 3 · ELEMENT 1           │
│                                               │  ▌15  ELEMENT 2  Node 9 없음      │
│                                               │  ▌ 9  NODE 3     x 6 → 7.5        │
├───────────────────────────────────────────────┴──────────────────────────────────┤
└ 푸터 ── Ln 9, Col 12 · Sel 3 rows · 1 error ··············· [Close] [Apply to Model]
```

| 결정 | 내용 |
|---|---|
| **UI-1** | **좌측 Pull 패널(238px 상시 점유) 폐지** → 툴바 `Pull Model Data ▾` 팝오버(범위·데이터 종류·삽입 모드 + 확정 버튼). 세션당 한두 번 쓰는 시작 동작이 편집 내내 폭을 점유하지 않는다 |
| **UI-2** | **빈 초안일 때 에디터 자리에 시작 화면**(Pull / Open Draft / Command Reference + 지원 명령 목록). UI-1 로 잃는 발견성을 여기서 갚는다 |
| **UI-3** | **우측 `Change Summary` 패널(270px) 폐지** → 같은 자리를 **검토 도크**가 상주한다. 집계 숫자는 도크 탭 라벨(`Changes 4` / `Errors 1`)과 푸터로 충분했다(같은 숫자가 세 곳에 있었다) |
| **UI-4** | **`Data Script` / `Review Changes` 탭 폐지** — 편집과 검토를 동시에 본다. 오류는 편집하면서 봐야 하는 정보다. 푸터의 `Review Changes` 버튼도 함께 제거(이동할 곳이 없다) |
| **UI-5** | 도크 행은 **before → after 값**을 보여준다(U2). 행 클릭 = 해당 줄로 커서 이동, 에디터에도 오류 줄 표시 |
| **UI-6** | Find/Replace 와 Field Transform 은 **한 번에 하나만 열리는 인라인 바 하나**로 통합(세로 밴드 2개 절약) |
| **UI-7** | 도크는 `›` 로 접어 편집에 집중할 수 있다. 접힘 상태는 세션 동안 유지 |
| **UI-8** | 기본 크기 **980 × 600**(min 860 × 520). 초판 1180 × 760 대비 축소하되 AutoFit 이 부족분을 보정 |
| **UI-9** | 헤더에 `Draft units: <FORCE>, <LENGTH>` 칩 상시 표시(§2-1 R5). `*UNIT` 누락 시 이 칩이 경고색으로 바뀌고 quick-fix 진입점이 된다 |
| **UI-10** | 툴바에 **Undo / Redo**(D5). 신설 `Command Reference` 는 명령별 필드 순서를 보여준다(지금은 어디에도 없다) |

모달 전체에는 세로 스크롤을 두지 않는다. 에디터와 검토 도크만 자체 스크롤한다.
디자인 토큰은 기존 시스템 그대로다 — `DraggableModal`, `FONT_UI` 12px, `#c8c8c8`, 포인트 `#4ec9b0`, 확정 버튼 `#0e639c`.

### 4-1. 초판에 없던 필수 요구사항

| # | 요구사항 | 현재 | 근거 |
|---|---|---|---|
| **U1** | **편집기 자체 Undo/Redo.** Clear·Sort·Deduplicate·Replace All·Field Transform 은 수만 행을 한 번에 파괴하는데, controlled textarea라 브라우저 기본 Undo도 죽어 있다 | ❌ | CSI Interactive Database Editing 은 편집 폼 안에 자체 `Edit ▸ Undo/Redo` 를 둔다 |
| **U2** | **Review 가 before → after 값을 보여야 한다.** 지금은 `before`/`after` 를 계산해 두고([engine:746](../frontend/src/services/commandStudioEngine.ts)) 화면엔 `Update NODE 5` 만 뜬다([Modal:634](../frontend/src/components/tools/CommandStudioModal.tsx)) | ❌ | 이 사전 검토는 MIDAS·CSI 어디에도 없는 DCR 고유 강점이다. 값을 안 보여주면 그 강점이 사라진다 |
| **U3** | **Pull 개수 = 실제 추출 건수.** CONSTRAINT 가 selected/story 범위에서 절점 수를 센다 | ❌ | — |
| **U4** | **파일 전환 시 창·초안 초기화**(CLAUDE.md Environment Reset 단일 원천) | ❌ 미등록 | — |
| **U5** | 초안 텍스트가 컴포넌트 지역 state 이므로, U4 를 위해 store 로 올리거나 `fileLoadSeq` 를 구독해 비운다 | 미착수 | — |
| **U6** | 오류 행 더블클릭 → 해당 줄로 점프(구현됨) 유지 | ✅ | CSI 는 Import Log 에서 Error/Warning 버튼으로 해당 위치로 점프시킨다 |

---

## 5. 엔진 구조

```text
Draft text
  -> *UNIT 해석 → 초안 단위 확정
  -> strict tokenizer/parser
  -> semantic validation (초안이 건드린 레코드 한정)
  -> immutable next-state maps and Add/Update/Unchanged diff
  -> confirmation
  -> batched store commit
  -> cache invalidation + one-step Undo/Redo
```

| 파일 | 책임 |
|---|---|
| `frontend/src/components/tools/CommandStudioModal.tsx` | 모달 UI와 사용자 흐름 |
| `frontend/src/services/commandStudioEngine.ts` | 파싱, 검증, 직렬화, diff, 필드 변환 |
| `frontend/src/services/commandStudioTextTools.ts` | 정렬과 중복 행 제거 |
| `frontend/src/services/commandStudioApply.ts` | 일괄 적용과 캐시 무효화 |
| `frontend/src/services/externalHistory.ts` | Command Studio Material 상태의 Undo/Redo 동기화 |
| `frontend/src/store/commandStudioStore.ts` | 모달 open/close 상태 (U4·U5 로 초안 상태 추가 예정) |

기존 전체 MGT Import 의 permissive parser 와 프로젝트 교체 경로는 사용하지 않는다. Command Studio 는 현재 모델을 유지한 채 명시된 행만 upsert 하는 독립적인 strict 경로다.

**Undo/Redo 배선은 정상이다**(검증 완료). `beginExternalHistory` → `_beginBatch`(적용 전 스냅샷) → `setState` → `_endBatch` 순서가 지켜지고, Material 은 외부 채널로 동기화되어 2단계 jump Undo/Redo 까지 통과한다.

### 5-1. 적용 정책 — upsert 유지 (조사 결과 반영)

MIDAS MCT Command Shell 은 *"Loads or support conditions are accumulated by adding the entered data to the existing ones. The data for the geometric shapes of the model and related nodes, elements, materials and sections are replaced by new data."* 로, 데이터 종류마다 누적/치환이 갈린다.
DCR 은 **종류와 무관하게 "초안에 적힌 ID만 upsert"** 로 통일한다. 규칙이 하나여서 예측 가능하고, Phase 2 에서 하중을 추가해도 같은 규칙이 유지된다. 이 차이는 의도된 설계다.

### 5-2. 오류 정책 — 전량 차단 유지 (조사 결과 반영)

| 제품 | 정책 |
|---|---|
| MIDAS MCT Shell | 사전 검증 없음. `Run` 하면 바로 반영 |
| CSI Interactive DB | **부분 적용** + Import Log. 오류 레코드는 건너뛰고, 되돌리려면 `Revert to Backup` |
| **DCR Command Studio** | **사전 Review + 오류 1건이라도 있으면 전량 차단** + 적용 후 1단계 Undo |

DCR 정책을 유지한다. 구조해석 모델에서 *"일부만 들어간 상태"* 는 사용자가 알아채기 어렵고, 부분 반영된 절점·부재는 곧바로 해석 실패나 잘못된 결과로 이어진다. 다만 CSI 의 두 장점은 흡수한다 — **오류 위치로 점프(U6, 구현됨)** 와 **한 번에 되돌리기(1단계 Undo, 구현됨)**.

---

## 6. 검증과 안전 규칙

### 6-A. 유지되는 규칙 (검증 완료)

- 숫자는 유한값만 허용하며 빈 값이나 잘못된 문자열을 0으로 바꾸지 않는다.
- ID 는 양의 안전 정수만 허용한다.
- 요소의 절점·재료·단면 참조는 초안과 현재 모델을 합친 상태에서 확인한다.
- 자기 자신을 연결한 요소를 차단한다.
- 구속 DOF 는 정확히 여섯 자리의 `0/1` 값이어야 한다.
- 오류가 하나라도 있으면 Apply 가 비활성화된다(§5-2).
- Apply 직전에 최신 store 상태로 다시 파싱·검증한다.
- 모델 Map 은 데이터 종류별로 한 번만 교체하며, Material 을 포함한 전체 작업을 한 History 항목으로 묶는다.
- 적용 후 해석 envelope 와 설계 결과 캐시를 무효화한다.

### 6-B. **정정** — 검증은 "초안이 건드린 것"만 대상으로 한다

초판의 *"동일 좌표 절점, 동일 연결 요소를 차단한다"* 는 **대상 범위를 적지 않았고**, 코드는 병합 후 **전체 모델**을 훑도록 구현됐다([engine:715-734](../frontend/src/services/commandStudioEngine.ts)).

실측 — 초안이 `*MATERIAL` 한 줄뿐인데도:

```text
errors: 2  canApply: false
L1 *NODE     Node 3 has the same coordinates as node 2.
L1 *ELEMENT  Element 2 duplicates the connectivity of element 1.
```

1. **초안과 무관한 기존 모델 상태가 Apply 를 차단한다.** 중복 좌표 절점이 하나라도 있는 모델에서는 기능 전체가 무용지물이다.
2. **줄 번호가 `?? 1` 폴백이라 1행을 가리킨다.** 초안에 그 레코드가 없어 고칠 방법이 없는 막다른 오류다.

**근거 — 이 검사는 원래 다른 기능의 일이다.** ETABS 는 중복/근접 절점·부재 겹침 검사를 `Analyze ▸ Check Model` 에 두고, **길이 허용오차 입력란**과 함께 사용자가 명시적으로 실행하는 별도 단계로 만든다(Joints/Joints within Tolerance, Frame Overlaps 등). 정리·병합은 `Edit ▸ Merge Joints` 가 담당한다. 즉 **모델 위생 점검은 전용 감사 기능**이고, 편집 도구가 그것을 이유로 편집을 막지 않는다.

**DCR 에도 이미 그 기능이 있다** — `findDuplicates`(1 mm 허용오차) + `FindDuplicatesModal`. Command Studio 가 같은 일을 더 엄격한 기준으로 중복 수행하면서 편집까지 막고 있었던 것이 P0-3 이다.

```text
✅ 초안이 정의한 레코드가 (초안 안에서 / 기존 모델과) 충돌할 때만 오류
✅ 오류는 반드시 초안의 실제 행 번호를 가리킬 것 — `?? 1` 폴백 금지
✅ 좌표 중복 허용오차는 **DCR 기존 중복 검사기와 같은 1 mm** 를 쓴다
   ([modelStore.findDuplicates](../frontend/src/store/modelStore.ts) `const TOL = 1`,
    UI 는 `FindDuplicatesModal` — "nodes at the same rounded 1 mm position and line
    elements that share the same end-node pair"). 두 곳이 다른 답을 내면 안 된다.
   (현행 엔진은 1e-6 mm 라 사실상 완전일치 비교였다 — 같은 모델을 두 기능이 다르게 판정했다)
❌ 초안이 건드리지 않은 기존 객체끼리의 충돌을 Command Studio 오류로 올리는 것
```

### 6-C. **신설** — Pull → Apply 무편집 왕복은 모델을 바꾸지 않아야 한다

**(a) 부재: 양단 모멘트 해제된 보가 brace 로 바뀐다.**

```text
입력 : memberType 'beam', memberBehavior 'default', luMm 3000, 양단 Mx·My·Mz free
직렬화: 1, TRUSS, 1, 1, 1, 2, 0        ← elementType() 이 TRUSS 로 판정
적용후: memberType "brace", memberBehavior 소실
```

`elementFromRecord` 가 `truss ? 'brace' : …` 로 `memberType` 을 무조건 덮는다([engine:590-608](../frontend/src/services/commandStudioEngine.ts), 판정 [engine:792-799](../frontend/src/services/commandStudioEngine.ts)). RC 설계 라우팅과 힌지 생성이 바뀐다.

> **근거** — MGT `*ELEMENT` 행에는 보/기둥/가새 구분(`memberType`)에 해당하는 필드가 **아예 없다**. `TYPE` 은 요소 거동(BEAM/TRUSS/TENSTR/CMPSTR)만 정한다. 즉 `TYPE` 에서 `memberType` 을 추론해 덮어쓰는 동작은 어떤 선례도 없는 DCR 자체 발명이며, 그것이 결함이 됐다.

부수 문제 2건:
- `orientation: undefined` 를 무조건 써서 저장된 vecxz 를 지운다(현재 `setOrientation` 호출부가 없어 실피해는 없으나 잠재 결함).
- `TRUSS_RELEASES` 가 **모든 트러스 요소가 공유하는 모듈 상수 객체**다([engine:153-156](../frontend/src/services/commandStudioEngine.ts)). `setBoundaryCondition` 이 `[...dof]` 로 방어복사하는 이 리포 관례와 반대이며, CLAUDE.md "store 내부 객체 in-place 변이 금지" 사고의 재발 소지다.

**(b) 재료: 무편집 왕복이 항상 `update` 로 뜨고 해석결과를 무효화한다.**

`parseMaterialRows` 가 `density: gamma / 9810` 을 **항상 주입한다**([engine:404](../frontend/src/services/commandStudioEngine.ts)). `density` 가 없던 재료는 왕복만으로 필드가 생기고, 이 필드는 [analysisFreshness.ts:353](../frontend/src/services/analysisFreshness.ts) 의 **eigen 지문에 포함**된다.

> **왜 P0 인가** — ETABS 는 해석 후 모델을 잠그고, 편집하려면 사용자가 **명시적으로 unlock** 해야 하며 그 순간 *"Unlocking the model deletes all of the analysis results"* 를 알린다. **결과 폐기는 항상 사용자가 의도한 행위**다. DCR 에서 아무것도 안 고친 왕복이 조용히 결과를 무효화하면, 사용자는 무효화 경고 자체를 신뢰하지 않게 된다(CLAUDE.md R2 가드).

```text
✅ Pull 직후 아무것도 고치지 않고 Apply → 전 레코드 `unchanged`, Apply 비활성
✅ 소비처가 파생할 수 있는 값(density = gamma/9810)은 엔진이 쓰지 않는다
   — getMaterialDensity() 가 이미 같은 식으로 폴백한다
✅ 단, UNIT-WEIGHT(gamma) 가 실제로 바뀌면 기존 `density` 를 **제거**한다.
   density 가 남아 있으면 getMaterialDensity() 가 그것을 우선해 새 gamma 가 질량에
   반영되지 않는다(= 조용한 오답). gamma 가 그대로면 density 도 그대로 둔다(무편집 왕복 보존)
✅ TYPE 은 요소 거동만 결정한다. memberType 은 **신규 추가일 때만** 추론하고
   기존 부재는 보존한다
✅ orientation 은 초안이 다루지 않는 필드이므로 보존한다(F5)
✅ endReleases 는 요소마다 독립 객체로 만든다(공유 상수 대입 금지)
```

#### ★ 구현 중 확정 — TYPE 별 단부해제 규칙 (2026-08-06, 하네스 T1 이 잡아낸 건)

초안 스키마에는 단부해제 열이 없다. 그런데 TYPE 은 해제와 **부분적으로만** 연결돼 있어서,
"truss 계열이면 해제를 넣는다"로 뭉뚱그리면 왕복이 깨진다. 실제로 첫 구현이 그랬고,
`memberBehavior: 'tension_only'` 만 있고 해제는 없던 부재에 **없던 모멘트 해제가 생겼다**(강성 변화).
`elementType()` 의 판정 규칙을 그대로 뒤집은 것이 정답이다.

| TYPE | 뜻 | 기존 부재를 수정할 때 | 신규 추가일 때 |
|---|---|---|---|
| `TRUSS` | **6모멘트 전부 free 그 자체** | 해제를 truss 해제로 설정 | truss 해제 |
| `TENSTR`/`CMPSTR` | 인장/압축 전담 **거동만** 뜻함(`elementType()` 도 해제와 무관하게 판정) | **해제를 건드리지 않는다** | truss 해제 + memberType `brace` (MGT Import 관례와 동일) |
| `BEAM` | "전부 free 가 아님" | 기존이 truss 해제였다면 제거, 아니면 보존 | 해제 없음 |

```text
```

### 6-D. **신설** — 선택 필드 삭제 (§3-2 F4·F5)

현재 병합 규칙([engine:687-690](../frontend/src/services/commandStudioEngine.ts)) 때문에 빈 필드가 "유지"로 동작한다. 실측 — `fy` 칸을 비우면 **검토는 `update` 인데 결과는 `fy: 400` 그대로**다. 사용자는 지운 줄 안다. → F4 로 해소한다.

### 6-E. **신설** — ID 카운터를 되돌리지 않는다

`applyCommandStudioPlan` 이 `next*Id` 를 `max+1` 로 재설정한다([commandStudioApply.ts:21-25](../frontend/src/services/commandStudioApply.ts)). 살아있는 객체와 충돌하진 않지만 **삭제된 ID 가 재사용**되고, `materialsNextId` 는 지문 대상이라 불필요한 무효화가 추가된다.

```text
✅ next*Id = Math.max(현재값, max+1)   — 내려가지 않는다
```

---

## 7. 자동 검사

```powershell
cd frontend
npx.cmd tsc --noEmit
npx.cmd eslint src/components/tools/CommandStudioModal.tsx src/services/commandStudio*.ts src/services/externalHistory.ts src/store/commandStudioStore.ts
npx.cmd tsx scripts/check-command-studio.ts
npx.cmd tsx scripts/check-command-studio-history.ts
```

**2026-08-06 실행 결과: 전부 통과한다. 그리고 그것이 안전의 근거가 되지 못한다.**

### 7-1. 현 하네스의 사각지대

`check-command-studio.ts` 가 보는 것은 절점 좌표 숫자 왕복·추가/수정 카운트·중복/참조/DOF 오류·필드 변환·20,000행 파싱뿐이다. §6-C·§6-D·§2-1 의 결함은 **한 건도 검사 범위에 없다.** 그래서 tsc·eslint·하네스가 전부 초록불인 채로 데이터 손상 경로 7건이 남아 있었다. CLAUDE.md 가 반복 경고하는 *"음성 대조군 없이 양성 케이스만"* 패턴이다.

### 7-2. 추가해야 할 검사 (수정과 같은 작업에서)

| # | 케이스 | 음성 대조군 |
|---|---|---|
| T1 | 부재 왕복 무변경 — 양단 해제 보 / 편단 해제 보 / TENSTR / CMPSTR / 순수 BEAM 5종이 전부 `unchanged` | `memberType` 덮어쓰기를 되살리면 FAIL |
| T2 | 재료 왕복 무변경 — density 유/무, `fyS`·`fce`·κ 보유 재료 보존 | density 주입을 되살리면 FAIL |
| T3 | **지문 불변** — 무편집 Apply 전후 `computeEigenKey` 동일 | 지문을 상수화하면 FAIL |
| T4 | 검증 범위 — 기존 모델에 중복 좌표/연결이 있어도 무관한 초안은 `errors === 0` | 전체 모델 스캔을 되살리면 FAIL |
| T5 | **`*UNIT`** — ⓐ 없으면 오류 ⓑ `kN, m` 초안이 앱 단위와 무관하게 같은 내부값 ⓒ 중간 재선언이 이후 행에만 적용 | `*UNIT` 무시하고 앱 단위를 쓰면 FAIL |
| T6 | 필드 삭제 — 빈 칸이 값을 지우고(F4), 스키마 밖 필드는 보존(F5) | F5 를 빼면 rebar 소실로 FAIL |
| T7 | ID 카운터가 내려가지 않는다 | — |
| T8 | 오류 줄 번호가 초안의 실제 행을 가리킨다(`?? 1` 폴백 없음) | — |
| T9 | 대소문자 — `RECT`/`rect`/`H_BEAM`/`H_beam` 이 모두 통과 | — |
| T10 | 행 끝 빈 필드 허용(F3) | — |

### 7-3. 성능 실측 (2026-08-06)

14,000절점 / 13,000부재 모델, `buildCommandStudioPlan` 1회:

| 초안 크기 | 소요 |
|---|---|
| 한 줄 | **10.0 ms** |
| 전체 14k 절점 | **37.7 ms** |

매 keystroke 마다 Map 6개를 복제하고 전 모델 중복 스캔을 새로 한다. §6-B(검증 범위 축소)만 적용해도 상당 부분이 해소된다.

---

## 8. 사용자 인수 테스트

### A. 기존 절점 대량 수정
1. 작은 테스트 모델에서 `Selected` 또는 `Story` 로 `Nodes` 를 Pull 한다.
2. 한 좌표 열을 Find/Replace 또는 Field Transform 으로 변경한다.
3. Review 에서 해당 절점이 `Update` 로만 표시되는지, **before → after 값이 맞는지** 확인한다.
4. Apply 후 뷰포트 좌표를 확인하고 Undo/Redo 한다.

### B. 혼합 데이터 일괄 추가
1. 새 모델에서 Material, Section, Node, Element 순서의 초안을 붙여 넣는다.
2. Review 에서 참조 오류 없이 각 종류의 Add 수량을 확인한다.
3. Apply 후 Model Tree 와 뷰포트에서 생성 결과를 확인한다.
4. Undo 한 번으로 모든 종류가 함께 제거되고 Redo 한 번으로 복원되는지 확인한다.

### C. 안전 차단
1. 존재하지 않는 절점을 참조하는 Element 행을 입력한다.
2. Errors 필터에서 행 번호와 참조 오류를 확인하고, 더블클릭으로 그 줄로 점프되는지 본다.
3. Apply 가 비활성화되고 모델이 변하지 않는지 확인한다.

### D. 대량 초안
1. 수천 개 Node 행을 붙여 넣는다.
2. 타이핑과 Review 페이지 이동이 가능하고 모달 전체에 세로 스크롤이 생기지 않는지 확인한다.
3. Add 수량과 실제 생성 수량이 일치하는지 확인한다.

### E. **신설** — 무편집 왕복 (§6-C)
1. 실모델에서 Element 와 Material 을 `Entire Model` 로 Pull 한다.
2. **아무것도 고치지 않고** Review → 전 레코드 `Unchanged`, Apply 비활성이어야 한다.
3. 해석 결과가 있는 상태에서 시도해 "해석결과를 삭제할까요?" 경고가 **뜨지 않아야** 한다.

### F. **신설** — 작업 중 단위 변경 (§2-1)
1. 초안을 Pull 한 뒤 창이 열린 채로 length 단위를 바꾼다.
2. 초안 텍스트·검토 결과·Apply 가능 여부가 **전혀 변하지 않아야** 하며, 상태바의 `Draft units` 는 Pull 시점 단위를 유지해야 한다.
3. `*UNIT` 줄을 지우면 오류가 뜨고 quick-fix 로 복구되는지 확인한다.

### G. **신설** — 파일 전환 (U4)
1. 초안을 채운 채 New Project / Open Project 를 실행한다.
2. 창과 초안이 남아 새 모델에 적용 가능한 상태가 되면 안 된다.

### H. **신설** — 편집 되돌리기 (U1)
1. 수천 행 초안에서 Clear / Sort / Deduplicate / Replace All / Field Transform 을 각각 실행한다.
2. 편집기 Undo 로 직전 상태가 정확히 복원되는지 확인한다.

---

## 9. 결함 대장

> 2026-08-06 실측으로 확인하고, **같은 날 수정**했다.
> 각 수정에는 §7-2 의 대응 검사가 함께 들어갔다 — 되돌리면 하네스가 실패한다.
> 남은 항목은 **앱 라이브 스모크(§8)** 로만 확인 가능한 것과 다음 버전 과제뿐이다.

### P0 — 모델을 조용히 망가뜨리거나 기능을 원천 차단

| # | 결함 | 상태 | 수정 내용 |
|---|---|---|---|
| P0-1 | 열린 초안이 단위 변경 때 재해석 → 6000 mm 가 6,000,000 mm 로 적용 가능 | ✅ | `*UNIT` 도입, 파서가 앱 단위를 참조하지 않음(§2-1) |
| P0-2 | 단위 선언·헤더 주석이 출력에 전혀 없음 | ✅ | Pull 이 `*UNIT` + 명령별 `;` 헤더 방출, 헤더에 Draft units 칩 |
| P0-3 | 초안과 무관한 기존 모델 중복이 Apply 를 영구 차단, 오류가 1행을 가리킴 | ✅ | 검증 범위를 초안 레코드로 한정, 실제 행 번호, 1 mm 격자(§6-B) |
| P0-4 | 무편집 왕복이 `memberType` 을 brace 로 바꾸고 `memberBehavior` 를 지움 | ✅ | TYPE 별 해제 규칙 확정, memberType 은 신규만 추론(§6-C(a)) |
| P0-5 | 빈 필드로 값을 지울 수 없는데 `update` 로 표시됨 | ✅ | 스키마 소유 필드 기준 `mergeOwned`(§3-2 F4/F5) |
| P0-6 | `density` 주입으로 재료 왕복이 항상 `update` → 해석결과 무효화 | ✅ | 파생값 미기록 + gamma 변경 시 stale density 제거(§6-C(b)) |
| P0-7 | `next*Id` 하향 리셋 → ID 재사용 + `materialsNextId` 지문 변동 | ✅ | `raiseNextId` — 카운터는 내려가지 않음(§6-E) |

### P1 — 광고대로 동작하지 않음

| # | 결함 | 상태 | 수정 내용 |
|---|---|---|---|
| P1-1 | `wallElements.get(wallId)` — 이 Map 의 키는 **FEM element id** 이지 wallId 가 아님 | ✅ | 값의 `wallId` 로 필터링 |
| P1-2 | `Pull N Records` 가 CONSTRAINT 에서 절점 수를 셈 | ✅ | `countCommandStudioRecords` — 방출 경로와 같은 필터 |
| P1-3 | Field Transform 이 행 중간 선택에서 주석을 삭제하고 필드 번호가 밀림 | ✅ | 행 전체 기준 필드 계산 + indent/주석 보존 |
| P1-4 | 편집 도구에 되돌리기 없음 | ✅ | store 스냅샷 30단계 Undo/Redo(D5) |
| P1-5 | Review 가 before → after 를 안 보여줌 | ✅ | 검토 도크가 필드별 before → after 표시(UI-5) |
| P1-6 | environmentReset 미등록 — 파일 전환 후 초안 잔존 | ✅ | 초안을 store 로 올리고 reset 등록(priority 40) |
| P1-7 | §3 예제(`RECT`)가 오류 / SECTION TYPE 만 대소문자 구분 | ✅ | 소문자 정규화 매핑(D4) |
| P1-8 | 행 끝 빈 필드가 오류 | ✅ | 후행 빈 필드 무시(F3) |
| P1-9 | 릴리스노트의 "MGT-compatible" 과장 | ⏳ | **다음 버전 노트에서 정정**(D3) |

### P2 — 성능·잔여

| # | 결함 | 상태 |
|---|---|---|
| P2-1 | keystroke 당 10~38 ms(14k 모델) | 🟡 부분 — 검증 범위 축소로 전 모델 스캔이 사라졌다. **재실측 미실시** |
| P2-2 | Save Draft 가 blob 다운로드 | 🟡 부분 — `revokeObjectURL` 즉시 호출만 수정. 네이티브 대화상자는 Phase 2 |
| P2-3 | 신규 부재가 `elementTowerMap`·designMember 에 편입되지 않음 | ⏳ Phase 1 범위 밖(문서화됨) |
| P2-4 | `CommandStudioSeverity.warning` 은 죽은 분기 | ⏳ 경고 등급을 실제로 쓸 때 함께 |
| P2-5 | 최소 크기에서 좌측 패널 콘텐츠가 잘림 | ✅ 좌측 패널 자체가 없어짐(UI-1) |

### P3 — 앱 스모크에서 발견 (2026-08-06, 1차)

| # | 결함 | 상태 | 내용 |
|---|---|---|---|
| P3-1 | 본문이 푸터 밖으로 흘러넘치고 **스크롤바가 생기지 않음** | ✅ | 본문 grid 의 행이 기본값 `auto` 여서 검토 도크의 행 수만큼 높이가 늘어났다. `gridTemplateRows: minmax(0, 1fr)` 고정 + 에디터·도크 컨테이너에 `minHeight: 0`/`overflow: hidden`. 이제 에디터와 도크가 각자 휠 스크롤된다 |
| P3-2 | **before 와 after 가 같은 값인데 `update`** (`J 0.0244791904816 → 0.0244791904816`) | ✅ | 12 유효숫자 인쇄 → 되읽기에서 상대오차 ~1.6e-12 가 남아 `equalValue`(1e-12) 를 넘겼다. 저장값 스냅(`ROUNDTRIP_SNAP = 1e-9`)으로 **원본 저장값을 그대로 유지**한다 |

> **P3-2 가 왜 심각한가** — `0.4×0.8³/12` 같은 단면 상수는 12자리로 인쇄하면 되읽을 때 값이 미세하게
> 달라진다. 그대로 두면 *아무것도 고치지 않은* Pull→Apply 가 수십~수백 개 단면을 `update` 로 만들고
> 해석 지문까지 뒤집는다. CLAUDE.md 의 R2 부동소수 왕복 가드와 같은 부류다.
> **하네스 역검증 완료** — `ROUNDTRIP_SNAP` 을 0 으로 되돌리면 이 검사가 실제로 FAIL 한다.
> 반대로 진짜 편집(3.3333→3.334)은 그대로 `update` 로 잡히는 음성 대조군도 함께 넣었다.

### 검증 결과 (2026-08-06)

```text
npx tsc --noEmit                          PASS
npx eslint <Command Studio 전 파일>        PASS
npx tsx scripts/check-command-studio.ts          PASS  (T1·T2·T4·T5·T6·T8·T9·T10 + 왕복·diff·대량)
npx tsx scripts/check-command-studio-history.ts  PASS  (T3 지문 불변 · T7 카운터 · Undo/Redo/jump)
```

**남은 것은 앱 라이브 스모크(§8 A~H)뿐이다.** 헤드리스로는 확인할 수 없다.

---

## 10. 확정 결정 (2026-08-06 · 조사 근거 포함)

> 초판의 미결 항목을 **전부 확정**했다. 근거는 §13 출처.

### D1. 초안의 단위 규약 → **`*UNIT` 명령 도입 (초안이 단위를 소유)**

- MIDAS MGT/MCT `*UNIT`(FORCE, LENGTH · 기본 tonf, m), STAAD `UNIT`(파일 내 다중 선언, 직전 선언이 이후 데이터에 적용), CSI Interactive DB(편집 세션 단위가 모델 단위와 분리, 적용 시 변환) — **세 제품 모두 편집 대상이 자기 단위를 명시적으로 소유한다.**
- 채택: §2-1 R1~R7. `*UNIT` 없으면 오류 + quick-fix(기본값 가정 금지 — 그 가정이 P0-1 의 원인).
- 폐기: "표시 단위 자동 추종"(현행), "단위 변경 시 초안 숫자 재작성"(미완성 문자열·주석·서식 파괴).

### D2. 빈 필드 → **"값 없음"(삭제). 스키마 밖 필드는 항상 보존**

- MGT 레퍼런스: *"Blank or omitted fields typically invoke their documented default values"*.
- 채택: §3-2 F4·F5. 이로써 Pull 출력이 그 객체의 완전한 표현이 되어 무손실 왕복이 성립한다.

### D3. 릴리스노트 문구 → **다음 버전 노트에서 정정**

- 이미 태그·배포된 v0.9.253 노트를 소급 수정하면 GitHub release 본문과 앱 What's New 가 어긋난다(CLAUDE.md 릴리스 노트 단일 원천 규칙).
- 다음 버전 노트에 *"Command Studio uses its own MGT-style command syntax; it is not a `.mgt` file importer"* 한 줄을 넣고, 본 문서 §1-1 을 근거로 남긴다.

### D4. SECTION TYPE 대소문자 → **무시로 통일**

- MIDAS·STAAD 모두 명령·키워드 대소문자 비구분(STAAD: *"STAAD commands are not case sensitive"*).
- 여섯 필드 중 하나만 예외인 상태가 결함의 원인이므로 예외를 없앤다. 소문자 정규화 매핑 테이블로 구현.

### D5. 편집기 Undo → **자체 Undo/Redo 구현 (도구 조작 단위)**

- CSI Interactive Database Editing 은 편집 폼 안에 `Edit ▸ Undo/Redo` 를 둔다.
- 범위: 도구 조작(Clear/Sort/Deduplicate/Replace All/Field Transform/Pull) 단위로 초안 전체 문자열 스냅샷. **상한 30단계**(수만 행 × 무제한 스택은 메모리 위험).
- 타이핑 단위 undo 까지는 가지 않는다(에디터 재작성이 필요하고, 도구 조작 파괴가 실제 위험이다).

---

## 11. 진행 상황 (2026-08-06)

```text
1군  §6-B 검증 범위 · D1 *UNIT · §6-C 왕복 보존 · §6-E ID 카운터          ✅ 완료
2군  D2 필드 삭제 · P1-1 wallElements · D5 편집 undo · U4 env reset
     · §2-1(b) 헤더 방출 · U2 before/after 표시                          ✅ 완료
3군  D4 대소문자 · P1-2 카운트 · P1-3 Field Transform · P2-5              ✅ 완료
UI   §4 UI-1~UI-10 재설계 (목업 승인 후 구현)                              ✅ 완료
검사  §7-2 T1~T10 (음성 대조군 포함)                                       ✅ PASS
D3   릴리스노트 문구 정정                                                  ⏳ 다음 버전 노트
스모크 §8 A~H                                                            ⏳ 사용자 확인 대기
```

### 다음에 할 일

1. **앱 라이브 스모크(§8 A~H)** — 특히 E(무편집 왕복) · F(작업 중 단위 변경) · G(파일 전환) ·
   H(편집 되돌리기)는 이번 수정의 핵심이라 실제 앱에서 반드시 한 번 확인한다.
2. P2-1 성능 재실측 — 검증 범위 축소로 전 모델 스캔이 사라졌으나 keystroke 비용을 다시 재지 않았다.
3. D3 릴리스노트 문구 정정을 다음 버전에 포함.

---

## 12. Phase 2 후보

- 명시적 Delete 와 cascade preview
- Wall, Frame Release, Spring, Rigid/Elastic Link
- Static Load Case 와 절점·보·면 하중
- 명령 자동완성 및 명령별 도움말
- 초대형 초안의 Web Worker 검증
- 네이티브 Electron Open/Save 와 최근 초안 목록 (P2-2 동시 해소)
- MGT 원문 행 관용 파싱(`iSUB`·`EXVAL` 등 잉여 필드 수용) — §1-1 의 제약 완화

---

## 13. 참고 자료 (2026-08-06 확인)

| 항목 | 출처 |
|---|---|
| MCT Command Shell 워크플로(Insert Data → 편집 → Run, 종류별 누적/치환) | [MIDAS Civil Manual — MCT Command Shell](https://manual.midasuser.com/en_common/civil/910/Start/12_Tools/MCT_Command_Shell.htm) |
| MGT `*UNIT`·`*NODE`·`*ELEMENT`·`*MATERIAL` 필드 형식, `;` 주석, 빈 필드=기본값 | [MIDAS Gen Manual — MGT File Quick Reference](https://manual.midasuser.com/EN_Common/Gen/891/Start/14_Appendix/MGT_File_Quick_Reference.htm) |
| MCT 명령 목록 | [MIDAS — MCT Command List](https://manual.midasuser.com/EN_Common/Civil/875/Start/14_Appendix/MCT_Command_List.htm) |
| 편집 표의 단위 선택·임시 단위·적용 시 모델 단위 변환, 폼 내 Undo/Redo, Import Log | [CSI — Interactive Database Editing Form](https://docs.csiamerica.com/help-files/sap/Menus/Edit/Interactive_Database_Editing_Form.htm) |
| 모델 unlock 필요, 이름 변경 금지 경고 | [CSI SAP2000 — Interactive Database Editing](https://help.csiamerica.com/help/sap2000/26/26.0.0/SAP2000/WebHelp/Menus/Edit/Interactive_Database_Editing.htm) |
| Interactive DB 개요(모델 데이터가 DB 표로 저장·직접 편집) | [CSI Knowledge Base — Interactive database editing](https://web.wiki.csiamerica.com/wiki/spaces/kb/pages/2003233/Interactive+database+editing) |
| Import Log — 오류 레코드 skip, Error/Warning 점프, Revert to Backup | [CSI — Interactive Database Import Log Form](https://docs.csiamerica.com/help-files/csibridge/Advanced_tab/Edit_panel/Interactive_Database_Import_Log_Form.htm) |
| 중복/근접 절점·부재 겹침 검사와 허용오차는 별도 감사 기능 | [CSI ETABS — Check Model](https://docs.csiamerica.com/help-files/etabs/Menus/Analyze/Check_Model.htm) · [Merge Joints](https://docs.csiamerica.com/help-files/etabs/Menus/Edit/Merge_Joints.htm) |
| 해석 후 모델 잠금, unlock 시 결과 삭제 | [CSI ETABS — Lock Model](https://docs.csiamerica.com/help-files/etabs/Menus/Analyze/Lock_Model.htm) |
| `UNIT` 명령 구문·다중 선언·직전 선언 적용·기본 ft/kip | [Bentley STAAD.Pro — TR.3 Unit Specification](https://docs.bentley.com/LiveContent/web/STAAD.Pro%20Help-v20/en/STD_UNIT.html) |
| 입력 명령 대소문자 비구분·자유 형식 | [Bentley STAAD.Pro — STAAD Input Files](https://docs.bentley.com/LiveContent/web/STAAD.Pro%20Help-v2024/en/topics/Editor/c-stpst_STAAD_Input_Files.html) |
| 단위 변경 시 기존 입력 데이터 취급 | [Bentley STAAD.Pro — Units in STAAD.Pro](https://docs.bentley.com/LiveContent/web/STAAD.Pro%20Help-v19/en/GUID-C03F5D61-17FE-4FE3-8CB8-042D71C2F6AB.html) |
| SAP2000 `.s2k` PROGRAM CONTROL `CurrUnits` | [CSI — Export SAP2000 s2k Text File](https://help.csiamerica.com/help/sap2000/26/26.0.0/SAP2000/WebHelp/Menus/File/Export/Export_SAP2000_s2k_Text_File.htm) |
