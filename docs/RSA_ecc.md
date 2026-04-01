# 우발편심 지진하중 (ES: Eccentricity Seismic) 구현 계획

## 1. 배경 및 현재 문제

### 현재 구현 (잘못된 방식)

```
ES = subtractLoadCaseResult(CQC(Xpe), CQC(X))
```

- `CQC(Xpe)`: 편심 질량 위치로 OpenSees 모달해석 → CQC 조합 → 절댓값 결과
- `CQC(X)`: 기본 질량 위치로 모달해석 → CQC 조합 → 절댓값 결과
- 두 절댓값을 빼면 부호 정보가 없어짐

**결과 문제:**
- CQC는 항상 ≥ 0 이므로, 편심으로 응답이 *감소*하는 부재에서 ES 부호가 틀림
- 대칭 건물에서 대칭 위치 부재들이 반대 부호가 나와야 하는데 같은 부호가 나오거나, 반대로 나오는 경우 발생
- MIDAS와 비교 시 186건의 부호 불일치 확인 (42개 부재 전체에 걸쳐 발생)

### MIDAS 방식 (올바른 방식)

**정적 비틀림 모멘트 적용법 (Static Torsion Method)**

```
Step 1: RSA(RX, RY) 수행 → 층전단력(절댓값, CQC) 산출
Step 2: 층전단력 × 편심거리(e = 5%×평면 치수) = 층별 비틀림 모멘트
Step 3: 비틀림 모멘트를 각 층 다이어프램 중심에 정적 하중으로 적용
Step 4: ±편심 4케이스 정적해석 수행 → 부호 있는 부재력 산출
Step 5: 4케이스 결과를 모두 저장
```

ES는 **독립된 정적 하중케이스**이므로 부재 위치에 따라 부호가 자연스럽게 결정됨.

---

## 2. 물리적 의미

### 왜 대칭 부재에서 반대 부호가 나오는가

```
+편심 정적해석 결과:
  부재A (왼쪽 기둥): N = +5 kN  (편심 비틀림으로 추가 압축)
  부재B (오른쪽 기둥): N = -5 kN (편심 비틀림으로 감소)

-편심 정적해석 결과:
  부재A (왼쪽 기둥): N = -5 kN
  부재B (오른쪽 기둥): N = +5 kN
```

→ 정적해석이므로 부재 위치에 따라 **부호가 자연스럽게 반대**로 나옴

CQC 차감 방식에서는 CQC(Xpe)와 CQC(X)가 둘 다 양수이므로 이 정보가 사라짐.

---

## 3. ES 결과의 두 가지 활용

### 3-1. Result Table 표시 (대표값)

4케이스 중 부재별·성분별로 절댓값 최대인 케이스의 값을 부호 포함하여 표시.

```
부재A:
  ES_RX_plus  N = +5  ← abs 최대
  ES_RX_minus N = -5
  → RX(ES) 표시값 = +5

부재B:
  ES_RX_plus  N = -5
  ES_RX_minus N = +5  ← abs 최대
  → RX(ES) 표시값 = +5  (부호는 -편심 케이스의 부호)
```

**표시 전용**이며 실제 설계에 직접 쓰이지 않음.

### 3-2. 설계 하중조합 (원본값 직접 사용)

4케이스 원본값을 별도 하중케이스로 저장하고, 하중조합에서 단순 산술로 조합.

```
cLCB_a = DL + LL + RS_RX + ES_RX_plus
cLCB_b = DL + LL + RS_RX + ES_RX_minus
cLCB_c = DL + LL + RS_RY + ES_RY_plus
cLCB_d = DL + LL + RS_RY + ES_RY_minus
```

- 부재A는 cLCB_a에서, 부재B는 cLCB_b에서 자연스럽게 최악값이 산출됨
- 별도 엔벨로프 로직 불필요 — 단순 산술로 끝남

---

## 4. 구현해야 할 내용

### 4-1. 백엔드: ES 정적해석 4케이스 추가

**위치:** RSA 해석 완료 직후 (RsaRunner 또는 TclBuilder)

#### Step A: RSA 완료 후 층전단력 추출

```
층별 절점 식별: Z 좌표로 층 구분
층전단력 = 해당 층 이상 모든 절점의 지진방향 반력 합 (RSA 결과에서 추출)

storyShear_RX[i] : i층의 RX 방향 층전단력 (절댓값, CQC 결과)
storyShear_RY[i] : i층의 RY 방향 층전단력 (절댓값, CQC 결과)
```

#### Step B: 편심 비틀림 모멘트 계산

```
KBC 기준: e = 0.05 × L
  e_x = 0.05 × B_y  (Y방향 건물 치수의 5%, RX 방향 편심)
  e_y = 0.05 × B_x  (X방향 건물 치수의 5%, RY 방향 편심)

4케이스 층별 비틀림 모멘트:
  Mt_RX_plus[i]  = +storyShear_RX[i] × e_x
  Mt_RX_minus[i] = -storyShear_RX[i] × e_x
  Mt_RY_plus[i]  = +storyShear_RY[i] × e_y
  Mt_RY_minus[i] = -storyShear_RY[i] × e_y
```

#### Step C: OpenSees 정적해석 4회 수행

각 케이스마다 별도 TCL 작성 및 실행:

```tcl
# 예: ES_RX_plus 케이스
pattern Plain 1 Linear {
    # 각 층 다이어프램 중심 절점에 비틀림 모멘트(Mz) 적용
    load $masterNode_story1  0.0  0.0  0.0  0.0  0.0  $Mt_RX_plus_1
    load $masterNode_story2  0.0  0.0  0.0  0.0  0.0  $Mt_RX_plus_2
    # ... 전 층
}
analyze 1
# 부재력 출력 (recorder element 또는 직접 추출)
```

4케이스:
- `ES_RX_plus`  : RX 방향 +편심 정적해석
- `ES_RX_minus` : RX 방향 -편심 정적해석
- `ES_RY_plus`  : RY 방향 +편심 정적해석
- `ES_RY_minus` : RY 방향 -편심 정적해석

결과 파일 저장 위치 예시:
```
{resultsDir}/RSA/ES_RX_plus.json
{resultsDir}/RSA/ES_RX_minus.json
{resultsDir}/RSA/ES_RY_plus.json
{resultsDir}/RSA/ES_RY_minus.json
```

---

### 4-2. 프론트엔드: ES 결과 저장 구조 변경

#### resultStore 키 구조

현재 `ES_KEY_OFFSET = 150000` 구조를 확장:

```typescript
// 현재: lcId + ES_KEY_OFFSET (1개)
// 변경: 4개 케이스 별도 저장

ES_RX_PLUS_KEY_OFFSET  = 150000   // ES_RX_plus  결과
ES_RX_MINUS_KEY_OFFSET = 160000   // ES_RX_minus 결과
ES_RY_PLUS_KEY_OFFSET  = 170000   // ES_RY_plus  결과
ES_RY_MINUS_KEY_OFFSET = 180000   // ES_RY_minus 결과
```

또는 lcId 기반 매핑으로 별도 Map에 저장.

#### Result Table 표시용 대표값 계산

```typescript
// 부재별·성분별 abs 최대 선택 (표시 전용)
function computeEsRepresentative(plus: LoadCaseResult, minus: LoadCaseResult): LoadCaseResult {
  // 각 elemId, 각 성분(Ni, Viy, ..., Mjz)별로
  // abs(plus) >= abs(minus) ? plus값 : minus값
}
```

#### 하중조합에서 직접 참조

하중조합 케이스 정의 시 ES_RX_plus, ES_RX_minus 등을 별도 케이스 ID로 참조:

```typescript
// 하중조합 예시
{ caseId: lcId + ES_RX_PLUS_KEY_OFFSET,  factor: 1.0 }
{ caseId: lcId + ES_RX_MINUS_KEY_OFFSET, factor: 1.0 }
```

---

### 4-3. 보간 함수 변경

ES가 정적해석 결과가 되면 정적 규약 그대로 적용:

```typescript
// 현재 ForceEnvelopeUtil.ts
if (lcId >= RSA_KEY_OFFSET && lcId < ES_KEY_OFFSET) return interpElemForcesRsa(...)
if (lcId >= ES_KEY_OFFSET)                          return interpElemForcesEs(...)  // ← 삭제

// 변경 후
if (lcId >= RSA_KEY_OFFSET && lcId < ES_KEY_OFFSET) return interpElemForcesRsa(...)
return interpElemForces(...)  // ES 포함 모든 정적케이스에 동일 적용
```

단, ES는 분포하중이 없으므로 세그먼트 계산 범위 조정:

```typescript
// ES 케이스는 getDistribSegs 호출 불필요 → 빈 배열 반환
if (lcId < RSA_KEY_OFFSET) {
    ({ segsY, segsZ } = getDistribSegs(...))
}
// lcId >= RSA_KEY_OFFSET (RSA, ES 모두) → segsY/segsZ = []
```

---

## 5. 현재 잘못된 코드 위치

| 파일 | 위치 | 변경 내용 |
|------|------|---------|
| `frontend/src/services/analysisApi.ts` | `applyRsaCombination()` 내 ES 블록 | CQC 차감 방식 → 정적해석 결과 로드로 대체 |
| `frontend/src/services/RsaCalculator.ts` | `subtractLoadCaseResult()` | ES 용도 제거 (다른 용도 없으면 삭제) |
| `frontend/src/services/design/ForceEnvelopeUtil.ts` | `interpElemForcesEs()` | 삭제 후 `interpElemForces`로 대체 |
| 해석 엔진 (TCL 생성) | Xpe/Ype 모달해석 부분 | 제거 → 정적 ES 해석 4케이스로 교체 |
| `frontend/src/store/resultStore.ts` | `RsaModalResultMap` (Xpe/Ype 필드) | ES 전환 후 제거 가능 |

---

## 6. 단계별 구현 계획

> **원칙: 매 스텝 완료 후 반드시 코드 오류 검토를 2회 실시하고 오류 수정 완료 후 다음 스텝으로 진행.**
>
> - 1차 검토: TypeScript 타입 오류 및 컴파일 오류 (`tsc --noEmit`)
> - 2차 검토: 로직 오류 및 누락 케이스 수동 검토 (관련 파일 전체 재독)

---

### STEP 1 — 층전단력 추출 유틸리티 (Backend)

**목표:** RSA 결과에서 층별 X/Y 방향 층전단력을 계산하는 함수 작성

**작업 파일:**
- `frontend/electron/services/RsaRunner.ts` (또는 해당 위치)

**작업 내용:**
1. RSA 결과(`LoadCaseResult`)와 모델 절점 정보를 입력받아 층 구분
2. Z 좌표 기준으로 층 목록 구성 (고유 Z값 정렬)
3. 각 층에서 지진 방향(X 또는 Y) 반력 합산 → 층전단력 배열 반환
4. 건물 평면 치수(B_x, B_y) 계산 — 절점 좌표 min/max로 산출
5. 편심거리: `e_x = 0.05 × B_y`, `e_y = 0.05 × B_x`

**검토 체크리스트 (1차 — 컴파일):**
- [ ] TypeScript 타입 오류 없음 (`tsc --noEmit`)
- [ ] 반환 타입 명시적 선언 확인

**검토 체크리스트 (2차 — 로직):**
- [ ] 층전단력이 층 경계 반력 합산으로 올바르게 계산되는지
- [ ] 최하층(기초) 반력이 누적되어 최상층으로 갈수록 감소하는지 확인
- [ ] B_x, B_y 계산 시 수평 방향 절점만 포함하는지

---

### STEP 2 — ES 정적해석 TCL 생성 (Backend)

**목표:** ±편심 4케이스의 OpenSees 정적해석 TCL 파일 생성

**작업 파일:**
- `frontend/electron/services/TclBuilder.ts` (또는 해당 위치)

**작업 내용:**
1. STEP 1에서 계산한 층전단력·편심거리로 4케이스 비틀림 모멘트 배열 계산
2. 각 케이스별 TCL 작성:
   - 기존 구조 모델 재사용 (새로 빌드 불필요, RSA와 같은 모델)
   - `pattern Plain` 으로 각 층 마스터 노드에 Mz 하중 적용
   - `analyze 1` 정적해석 1스텝 수행
   - `recorder Element` 로 전 부재 단면력 출력
3. 4개 TCL 파일 생성: `es_rx_plus.tcl`, `es_rx_minus.tcl`, `es_ry_plus.tcl`, `es_ry_minus.tcl`
4. 다이어프램 마스터 노드 식별 로직 포함 (층별 Z좌표 기준)

**검토 체크리스트 (1차 — 컴파일):**
- [ ] TypeScript 타입 오류 없음
- [ ] TCL 문자열 생성 시 undefined/null 없음

**검토 체크리스트 (2차 — 로직):**
- [ ] 층별 마스터 노드가 올바르게 식별되는지
- [ ] Mz 방향 부호: +편심과 -편심이 정확히 반대 부호인지
- [ ] RSA와 동일한 경계조건(boundary conditions) 적용 확인
- [ ] recorder 출력 형식이 기존 파서와 호환되는지

---

### STEP 3 — ES 정적해석 실행 및 결과 파싱 (Backend)

**목표:** 4케이스 OpenSees 정적해석 실행 및 결과 JSON 저장

**작업 파일:**
- `frontend/electron/services/RsaRunner.ts`
- `frontend/electron/services/ResultParser.ts` (또는 해당 위치)

**작업 내용:**
1. RsaRunner에서 RSA 해석 완료 후 ES 4케이스 순차 실행
2. 각 케이스 결과를 기존 `ElementForce` 구조로 파싱
3. 결과 파일 저장:
   ```
   {resultsDir}/RSA/ES_RX_plus.json
   {resultsDir}/RSA/ES_RX_minus.json
   {resultsDir}/RSA/ES_RY_plus.json
   {resultsDir}/RSA/ES_RY_minus.json
   ```
4. 기존 Xpe/Ype 모달해석 코드 제거 또는 비활성화

**검토 체크리스트 (1차 — 컴파일):**
- [ ] TypeScript 타입 오류 없음
- [ ] 파일 경로 문자열 처리 오류 없음

**검토 체크리스트 (2차 — 로직):**
- [ ] 4케이스 모두 실행되는지 (하나라도 실패 시 에러 처리)
- [ ] 파싱된 부재력의 단위 일치 (N, N·mm 기준 확인)
- [ ] 기존 정적해석 파서와 동일한 구조(`Ni, Viy, Viz, ...`) 유지
- [ ] Xpe/Ype 모달해석 제거 후 기존 RSA 결과에 영향 없음 확인

---

### STEP 4 — Electron fileHandler: ES 결과 로드 (Frontend/Electron)

**목표:** 프로젝트 열기 시 ES 4케이스 결과 파일 로드

**작업 파일:**
- `frontend/electron/handlers/fileHandler.ts`
- `frontend/src/electron.d.ts`
- `frontend/electron/preload.ts`

**작업 내용:**
1. `loadResultsIfAvailable` 핸들러에서 ES 4케이스 JSON 파일 존재 확인 및 로드
2. 반환 타입에 4케이스 필드 추가:
   ```typescript
   esRxPlus?:  unknown   // ES_RX_plus 결과
   esRxMinus?: unknown   // ES_RX_minus 결과
   esRyPlus?:  unknown   // ES_RY_plus 결과
   esRyMinus?: unknown   // ES_RY_minus 결과
   ```
3. `electron.d.ts` 타입 선언 업데이트
4. 기존 `rsaResults`의 Xpe/Ype 필드 제거

**검토 체크리스트 (1차 — 컴파일):**
- [ ] `tsc --noEmit` 오류 없음
- [ ] `electron.d.ts` 타입과 실제 반환값 일치

**검토 체크리스트 (2차 — 로직):**
- [ ] 4케이스 파일 중 일부만 있을 때 graceful 처리 (부분 로드)
- [ ] 기존 rsaResults 로드 로직에 영향 없음
- [ ] preload.ts 노출 API와 electron.d.ts 선언 완전 일치

---

### STEP 5 — resultStore 키 구조 확장 (Frontend)

**목표:** ES 4케이스를 별도 키로 resultStore에 저장

**작업 파일:**
- `frontend/src/store/resultStore.ts`

**작업 내용:**
1. 키 오프셋 상수 추가:
   ```typescript
   export const ES_RX_PLUS_KEY_OFFSET  = 150000
   export const ES_RX_MINUS_KEY_OFFSET = 160000
   export const ES_RY_PLUS_KEY_OFFSET  = 170000
   export const ES_RY_MINUS_KEY_OFFSET = 180000
   // 기존 ES_KEY_OFFSET = 150000 → ES_RX_PLUS_KEY_OFFSET으로 rename 또는 deprecated 처리
   ```
2. `RsaModalResultMap`에서 Xpe/Ype 필드 제거
3. ES 4케이스 결과 저장을 위한 별도 상태 또는 results Map 확장

**검토 체크리스트 (1차 — 컴파일):**
- [ ] `tsc --noEmit` 오류 없음
- [ ] 기존 `ES_KEY_OFFSET` 참조 파일 전체 확인 및 업데이트

**검토 체크리스트 (2차 — 로직):**
- [ ] 키 오프셋 범위가 기존 RSA_KEY_OFFSET, COMBO_KEY_OFFSET과 겹치지 않음
- [ ] `mergeResults` 호출 시 4케이스 모두 병합되는지
- [ ] fileApi.ts의 직렬화/역직렬화 로직과 호환 확인

---

### STEP 6 — analysisApi.ts: ES 저장 로직 변경 (Frontend)

**목표:** CQC 차감 방식 제거, ES 정적해석 결과를 resultStore에 저장

**작업 파일:**
- `frontend/src/services/analysisApi.ts`
- `frontend/src/services/fileApi.ts`

**작업 내용:**
1. `applyRsaCombination()` 내 ES 블록 제거:
   - `subtractLoadCaseResult` 호출 코드 삭제
   - Xpe/Ype 관련 `combineVariant` 호출 삭제
2. ES 4케이스 결과를 resultStore에 저장하는 새 함수 작성:
   ```typescript
   function applyEsResults(esRxPlus, esRxMinus, esRyPlus, esRyMinus): void
   ```
3. `fileApi.ts`에서 파일 열기 시 ES 4케이스 로드 및 저장 처리
4. RSA 해석 완료 콜백에서 ES 결과 로드 호출

**검토 체크리스트 (1차 — 컴파일):**
- [ ] `tsc --noEmit` 오류 없음
- [ ] `subtractLoadCaseResult` 제거 후 미사용 import 정리

**검토 체크리스트 (2차 — 로직):**
- [ ] RSA 해석 완료 → ES 결과 자동 로드 흐름 확인
- [ ] 파일 열기 시 ES 결과 로드 흐름 확인
- [ ] RSA 캐시(rsa_combined_cache.json) 저장 로직과 충돌 없음
- [ ] `esMerge` 제거 후 `saveRsaCombinedCache` 호출 인자 수정 확인

---

### STEP 7 — ForceEnvelopeUtil.ts: 보간 함수 정리 (Frontend)

**목표:** `interpElemForcesEs` 제거, ES를 정적 규약으로 보간

**작업 파일:**
- `frontend/src/services/design/ForceEnvelopeUtil.ts`

**작업 내용:**
1. `interpElemForcesEs()` 함수 삭제
2. `getElemForcesAt` 단일 케이스 라우팅 수정:
   ```typescript
   // 변경 후
   if (lcId >= RSA_KEY_OFFSET && lcId < ES_RX_PLUS_KEY_OFFSET)
       return interpElemForcesRsa(...)
   return interpElemForces(...)  // ES 포함 모든 정적 케이스
   ```
3. `getElemForcesAt` 조합 케이스 라우팅도 동일하게 수정
4. ES 케이스는 분포하중 없으므로 `getDistribSegs` 호출 범위 조정:
   ```typescript
   // lcId < RSA_KEY_OFFSET 인 경우만 세그먼트 계산
   if (caseId < RSA_KEY_OFFSET) {
       ({ segsY, segsZ } = getDistribSegs(...))
   }
   ```

**검토 체크리스트 (1차 — 컴파일):**
- [ ] `tsc --noEmit` 오류 없음
- [ ] `interpElemForcesEs` 참조 파일 전체 확인

**검토 체크리스트 (2차 — 로직):**
- [ ] RSA 케이스(100000~149999) 라우팅 유지 확인
- [ ] ES 케이스(150000~) 가 `interpElemForces`로 라우팅되는지
- [ ] 조합 케이스 내 ES 성분도 동일하게 처리되는지

---

### STEP 8 — Result Table: ES 대표값 표시 (Frontend)

**목표:** Result Table에서 RX(ES), RY(ES) 표시 시 abs 최대 대표값 사용

**작업 파일:**
- `frontend/src/components/result/ResultTablesModal.tsx` (또는 해당 위치)
- `frontend/src/lib/MemberForceInterp.ts` (필요 시)

**작업 내용:**
1. Result Table에서 ES 케이스 표시 시:
   - `ES_RX_PLUS`와 `ES_RX_MINUS` 두 케이스를 각 위치(I, 2/4, J)에서 계산
   - 성분별 abs 최대 선택 → 부호 포함 표시
2. 대표값 계산 헬퍼:
   ```typescript
   function esRepresentativeAt(plus: SixForces, minus: SixForces): SixForces {
     return {
       N:  absMax(plus.N,  minus.N),
       Vy: absMax(plus.Vy, minus.Vy),
       // ...
     }
   }
   function absMax(a: number, b: number): number {
     return Math.abs(a) >= Math.abs(b) ? a : b
   }
   ```

**검토 체크리스트 (1차 — 컴파일):**
- [ ] `tsc --noEmit` 오류 없음
- [ ] ES 케이스 ID 참조가 새 오프셋 상수 사용

**검토 체크리스트 (2차 — 로직):**
- [ ] I, 2/4, J 세 위치 모두 독립적으로 abs 최대 계산
- [ ] 성분별 독립 선택 (N과 Vy가 서로 다른 케이스에서 올 수 있음)
- [ ] 기존 RSA, 정적 케이스 표시에 영향 없음

---

### STEP 9 — 하중조합 케이스 참조 변경 (Frontend)

**목표:** 설계 하중조합이 ES 4케이스 원본값을 직접 참조

**작업 파일:**
- `frontend/src/store/modelStore.ts` (하중조합 타입)
- 지진하중 설정 UI 및 조합 생성 로직

**작업 내용:**
1. 하중조합 케이스 정의에서 ES 참조 방식 변경:
   - 기존: `lcId + ES_KEY_OFFSET` (단일)
   - 변경: `lcId + ES_RX_PLUS_KEY_OFFSET` 또는 `lcId + ES_RX_MINUS_KEY_OFFSET`
2. 지진하중 조합 자동생성 로직 수정:
   ```
   cLCB = ... + RS_RX + ES_RX_plus   (factor: +1.0)
   cLCB = ... + RS_RX + ES_RX_minus  (factor: +1.0)
   cLCB = ... + RS_RY + ES_RY_plus   (factor: +1.0)
   cLCB = ... + RS_RY + ES_RY_minus  (factor: +1.0)
   ```
3. 기존 단일 ES 케이스 참조 제거

**검토 체크리스트 (1차 — 컴파일):**
- [ ] `tsc --noEmit` 오류 없음
- [ ] 조합 타입 변경 시 관련 컴포넌트 전체 확인

**검토 체크리스트 (2차 — 로직):**
- [ ] 4케이스 조합이 설계 엔벨로프에 모두 포함되는지
- [ ] 기존 조합 파일(.dcr) 하위호환 — 구버전 ES 조합 로드 시 graceful 처리
- [ ] EnvelopeCache 무효화 처리 (ES 변경 시 캐시 재계산)

---

### STEP 10 — 통합 검증

**목표:** 전체 플로우 검증 및 MIDAS 비교

**작업 내용:**
1. test11 모델 RSA + ES 재해석 실행
2. Result Table 확인:
   - RX(ES), RY(ES) 대표값이 MIDAS와 부호/크기 일치
   - 대칭 부재 쌍(DCR 1↔7, 3↔9 등) 반대 부호 확인
3. 하중조합 결과 확인:
   - cLCB3~9 값이 MIDAS와 일치
4. 파일 저장/열기 사이클 확인:
   - ES 4케이스 결과 저장 → 재로드 시 동일값
5. 빌드 최종 확인 (`tsc --noEmit`)

**합격 기준:**
- [ ] 부호 불일치 186건 → 0건
- [ ] 크기 차이 2% 이내
- [ ] 빌드 오류 0건
- [ ] 파일 열기/저장 정상 동작

---

## 7. 참고사항

### 다이어프램 마스터 노드 식별

각 층의 질량 중심 절점에 비틀림 모멘트를 적용해야 함.

- **강성 다이어프램**: 마스터 노드가 이미 존재 → 해당 절점에 Mz 적용
- **유연 다이어프램**: 각 절점별 질량 비례로 배분하여 적용

현재 모델에서 다이어프램 마스터 노드 구조 확인 필요.

### 편심거리 (KBC 기준)

```
e_a = 0.05 × L
L = 지진 방향에 수직인 방향의 건물 치수
```

### 현재 Xpe/Ype 모달해석 제거

현재 RsaRunner에서 편심 질량 위치로 별도 모달해석을 수행하는 코드가 있음.
정적 ES 방식으로 전환 후 해당 코드 제거 → 해석 시간 단축 효과도 있음.

---

## 8. 검증 방법

```
1. test11 모델 RSA + ES 정적해석 재실행
2. DCR Result Table의 RX(ES), RY(ES) 값을 D:/Downloads/동고비/Midas_Force.csv와 비교
3. 확인 항목:
   - 대칭 부재 쌍 (DCR 1↔7, 3↔9 등)에서 반대 부호 확인
   - 부호 불일치 186건 → 0건
   - 크기 차이 1~2% 이내 (현재 수준 유지)
4. 하중조합 결과(cLCB3~9)도 MIDAS와 재비교
```

---

## 9. 현재 코드 상태 분석 (2026-03-25 기준)

> 이 섹션은 실제 코드를 읽어 파악한 현황이다. 구현 전 반드시 재확인할 것.

### 9.1 핵심 상수 / 오프셋 현황

**파일:** `frontend/src/store/resultStore.ts`

```typescript
export const RSA_KEY_OFFSET  = 100000   // RSA 결과 키
export const ES_KEY_OFFSET   = 150000   // ES 결과 키 (현재 단일 — 변경 필요)
export const COMBO_KEY_OFFSET = 200000  // 하중조합 결과 키

export interface RsaModalResultMap {
  X?:   LoadCaseResult[]   // X방향 RS 모달
  Y?:   LoadCaseResult[]   // Y방향 RS 모달
  Xpe?: LoadCaseResult[]   // X방향 +5% 편심 모달 (삭제 예정)
  Ype?: LoadCaseResult[]   // Y방향 +5% 편심 모달 (삭제 예정)
}
```

→ **변경 대상**: `ES_KEY_OFFSET` 단일 → 4개 오프셋 + `Xpe`/`Ype` 제거

---

### 9.2 현재 ES 계산 흐름 (기존 방식)

```
[analysisHandler.ts Phase 4]
  accEcc=true && accStories.length > 0 이면:
    1. computeModalForces(eigenResult, nodeMassMap, dirs, true, accStories)
       → Xpe, Xme, Ype, Yme 4개 variant 생성
    2. filter: tag.endsWith('pe') → Xpe, Ype만 사용 (+5% 편심만)
    3. buildRsaStaticTcl(model, precompForcesXpeYpe) 로 TCL 생성
       → rsa_Xpe_mode{m}_{disp|react|force|wall}.out 파일 출력
    4. OpenSees 실행 (rsa_ecc.tcl)
    5. parseRsaMode(rsaDir, 'Xpe', m, hasWall) × numModes
       → rsaResults.Xpe[], rsaResults.Ype[] 저장

[analysisApi.ts applyRsaCombination()]
  rsaModalResults.Xpe가 있으면:
    eccResult  = combineVariant(Xpe modals, ...)  ← CQC 조합
    baseResult = combineVariant(X   modals, ...)  ← CQC 조합
    esResult   = subtractLoadCaseResult(eccResult, baseResult)  ← 차감
    → esMerge.set(lcId + ES_KEY_OFFSET, esResult)
    → mergeResults(esMerge)
    → saveRsaCombinedCache(rsaMerge + esMerge, validCombined)

[ForceEnvelopeUtil.ts getElemForcesAt()]
  if (caseId >= ES_KEY_OFFSET) → interpElemForcesEs(fi, fj, L, t)
    → j단 값 일정 + 모멘트만 보간 (정적 평형 부호반전 미적용)
```

---

### 9.3 ⚠️ 이미 준비된 코드 (미연결 상태)

**중요: 새 방식의 인프라가 이미 작성되어 있으나 `analysisHandler.ts`에서 호출되지 않고 있다.**

| 함수/파일 | 위치 | 상태 | 내용 |
|---|---|---|---|
| `computeEsStoryMoments()` | `RsaForceComputer.ts` | ✅ 구현됨, ❌ 미호출 | CQC 층전단력 × 편심거리 → `EsDirectionMoments[]` 반환 |
| `buildEsStaticTcl()` | `TclBuilder.ts` | ✅ 구현됨, ❌ 미호출 | ES 정적 해석 TCL 생성 (Mz를 master node에 적용) |
| `parseEsResult()` | `ResultParser.ts` | ✅ 구현됨, ❌ 미호출 | `rsa_XES_*.out` / `rsa_YES_*.out` 파싱 |

**`computeEsStoryMoments()` 동작 방식:**
```typescript
// precompForces.variants에서 tag='X' 또는 'Y' (순수 RS variant)만 필터
// 각 층별 floor forces → top-down 누적 → 층전단력(per mode)
// CQC 조합 후 × eccY (X방향) 또는 × eccX (Y방향)
// EsDirectionMoments[] 반환:
//   [{ tag: 'XES', dir: 'X', patId: 80001, moments: [{masterId, Mt}, ...] },
//    { tag: 'YES', dir: 'Y', patId: 81001, moments: [{masterId, Mt}, ...] }]
// Mt는 항상 양수 (+편심만 계산)
```

**`buildEsStaticTcl()` 동작 방식:**
```
esData를 순회: tag='XES', tag='YES' 각각
→ timeSeries Constant patId
→ pattern Plain patId patId { load masterId 0 0 0 0 0 Mt }
→ analyze 1 (정적해석 1스텝)
→ 결과 출력: rsa_XES_disp.out, rsa_XES_react.out, rsa_XES_force.out, rsa_XES_wall.out
             rsa_YES_disp.out, rsa_YES_react.out, rsa_YES_force.out, rsa_YES_wall.out
→ remove loadPattern patId
```

**현재 `buildEsStaticTcl`의 한계: ± 부호 미지원**
- `Mt`가 항상 양수 → `+편심`(XES)만 생성
- `-편심`(XES_minus)는 별도 구현 필요
- 단, 선형 탄성이므로 `-편심 결과 = -1 × +편심 결과` (OpenSees 2회 실행 불필요)

---

### 9.4 파일별 현황 및 변경 범위

#### `frontend/electron/handlers/analysisHandler.ts`
- **현재 Phase 4 (lines ~836~918)**: `buildRsaStaticTcl(model, precompForcesXpeYpe)` 호출
  → Xpe/Ype 모달 해석 (기존 방식)
- **변경 내용**:
  1. Phase 4 기존 코드 전체 교체
  2. `computeEsStoryMoments(precompForces, accStories, eigenResult.modes, 0.05)` 호출
  3. `buildEsStaticTcl(model, esData)` 로 TCL 생성
  4. OpenSees 실행 → `rsa_XES_*.out`, `rsa_YES_*.out`
  5. `parseEsResult(rsaDir, 'XES', hasWall)` + `parseEsResult(rsaDir, 'YES', hasWall)` 파싱
  6. 결과를 `rsaResults`에 `XES`, `YES` 키로 저장 (Xpe/Ype 제거)
  7. **± 처리**: `XES_minus = negateLoadCaseResult(XES)` (재실행 없이 부호 반전)

#### `frontend/src/store/resultStore.ts`
- **현재**: `ES_KEY_OFFSET = 150000`, `RsaModalResultMap.Xpe?/Ype?`
- **변경 내용**:
  ```typescript
  // 기존 ES_KEY_OFFSET = 150000 → 아래로 분리
  export const ES_RX_PLUS_KEY_OFFSET  = 150000   // XES (+편심)
  export const ES_RX_MINUS_KEY_OFFSET = 160000   // XES_minus (-편심)
  export const ES_RY_PLUS_KEY_OFFSET  = 170000   // YES (+편심)
  export const ES_RY_MINUS_KEY_OFFSET = 180000   // YES_minus (-편심)
  // ⚠️ 기존 ES_KEY_OFFSET = 150000은 ES_RX_PLUS_KEY_OFFSET으로 통일
  //    참조 파일 전체 업데이트 필요 (아래 9.5 참조)

  // RsaModalResultMap — Xpe/Ype 제거
  export interface RsaModalResultMap {
    X?: LoadCaseResult[]
    Y?: LoadCaseResult[]
    // Xpe, Ype 삭제
  }
  ```

#### `frontend/src/services/analysisApi.ts`
- **현재 (lines ~492~527)**: ES 블록 — `subtractLoadCaseResult` + `esMerge.set(lcId + ES_KEY_OFFSET, ...)`
- **변경 내용**:
  1. ES 블록 제거 (`hasXpe`, `hasYpe`, `esMerge`, `subtractLoadCaseResult` 관련 코드 전체)
  2. 대신 `rsaModalResults.XES`, `rsaModalResults.XES_minus` 등을 `mergeResults`에 직접 저장
  3. `saveRsaCombinedCache` 호출 시 `esMerge` 인자 제거 (또는 ES 4케이스 포함)
  4. `subtractLoadCaseResult` import 제거

#### `frontend/src/services/design/ForceEnvelopeUtil.ts`
- **현재 (lines ~498~531)**: `isEs = caseId >= ES_KEY_OFFSET` → `interpElemForcesEs()`
- **변경 내용**:
  ```typescript
  // 변경 후: ES 포함 모든 정적케이스 → interpElemForces 사용
  // ⚠️ 단, ES는 분포하중 없으므로 segsY/segsZ = []
  if (caseId >= RSA_KEY_OFFSET && caseId < ES_RX_PLUS_KEY_OFFSET)
      return interpElemForcesRsa(...)
  // ES 포함 모든 정적 케이스
  return interpElemForces(fi, fj, [], [], L, t)  // ES는 분포하중 없음
  // → interpElemForcesEs 함수 삭제
  ```
  - 단, 분포하중 세그먼트 조건: `caseId < RSA_KEY_OFFSET` 인 경우만 (`ES 포함 >= RSA_KEY_OFFSET`이면 빈 배열)
  - **현재 이미 이 조건 적용 중** (`if (caseId < RSA_KEY_OFFSET)` 분기 존재)

#### `frontend/electron/handlers/fileHandler.ts`
- **현재 (lines ~192~202)**: `Xpe`, `Ype` 파일 파싱 후 `rsaResults`에 저장
- **변경 내용**:
  ```typescript
  // 기존 Xpe/Ype 루프 제거
  // 대신 XES/XES_minus/YES/YES_minus 파일 로드
  for (const tag of ['XES', 'YES'] as const) {
    if (rsaFiles.some(f => f === `rsa_${tag}_force.out`)) {
      rsaResults[tag]       = parseEsResult(rsaDir, tag, hasWall)
      rsaResults[`${tag}_minus`] = negateLoadCaseResult(rsaResults[tag])
    }
  }
  ```

#### `frontend/src/electron.d.ts`
- **현재**: `rsaResults?: unknown` (내부에 Xpe/Ype 포함)
- **변경 내용**: 타입 선언 업데이트 (XES/YES 포함 구조로)
  - `electron.d.ts`의 `rsaResults?: unknown` 타입은 이미 느슨하므로 큰 변경 불필요

#### `frontend/src/services/fileApi.ts`
- **현재 (lines ~289~310)**: `setRsaModalResults(rsaResults)` + `applyRsaCombination(rsaResults, eigenResult)` 또는 캐시 로드
- **변경 내용**:
  1. `setRsaModalResults` 후 ES 4케이스를 `mergeResults`로 직접 저장하는 로직 추가
  2. 또는 `applyRsaCombination` 내부에서 XES/YES를 ES 오프셋에 저장하도록 변경

#### `frontend/src/components/structure/LoadCombinationModal.tsx`
- **현재**: `lc.accEcc && rsaModalResults?.Xpe` 존재 여부로 ES 케이스 노출
  → ES 케이스가 1개: `lcId + ES_KEY_OFFSET`
- **변경 내용**:
  - ES 케이스 존재 판단: `rsaModalResults?.XES` 또는 `results.has(lcId + ES_RX_PLUS_KEY_OFFSET)` 기준으로 변경
  - 케이스 노출: `+편심`, `-편심` 2개(또는 4개) 분리 or 대표값 1개 유지 결정 필요
  - **현재 단순화 방안**: `+편심` 1개를 `(ES)` 케이스로 노출 (기존과 동일 인터페이스 유지)

#### `frontend/src/components/results/ResultTablesModal.tsx`
- **현재**: `ES_KEY_OFFSET` 기준으로 그룹 분류 및 `(ES)` 라벨 표시
- **변경 내용**:
  - `ES_RX_PLUS_KEY_OFFSET ~ ES_RY_MINUS_KEY_OFFSET` 범위를 `'es'` 그룹으로 분류
  - 4케이스 중 abs 최대 대표값 표시 (§3-1 방식)

---

### 9.5 ES_KEY_OFFSET 참조 파일 전체 목록

`ES_KEY_OFFSET`을 직접 참조하는 파일 목록 (모두 업데이트 필요):

```
frontend/src/store/resultStore.ts          → 상수 정의
frontend/src/services/analysisApi.ts       → esMerge.set(lcId + ES_KEY_OFFSET, ...)
frontend/src/services/design/ForceEnvelopeUtil.ts  → isEs = caseId >= ES_KEY_OFFSET
frontend/src/components/results/ResultTablesModal.tsx  → 그룹 분류 로직
frontend/src/components/structure/LoadCombinationModal.tsx  → ES 케이스 노출
```

---

### 9.6 ± 편심 처리 전략

MD 문서(§4)는 4케이스 별도 OpenSees 실행을 제안하지만, **선형 탄성 해석이므로 최적화 가능**:

```
옵션 A (MD 문서 원안): 4회 OpenSees 실행
  XES_plus  → +Mt Mz 하중 → OpenSees
  XES_minus → −Mt Mz 하중 → OpenSees (= 위 결과 × −1)
  YES_plus  → +Mt Mz 하중 → OpenSees
  YES_minus → −Mt Mz 하중 → OpenSees (= 위 결과 × −1)
  → 불필요하게 2배 실행

옵션 B (최적안, 권장): 2회 OpenSees 실행
  XES_plus  → +Mt Mz 하중 → OpenSees 실행 → 결과 저장
  XES_minus → XES_plus 결과 × −1           → 별도 저장 (재실행 없음)
  YES_plus  → +Mt Mz 하중 → OpenSees 실행 → 결과 저장
  YES_minus → YES_plus 결과 × −1           → 별도 저장 (재실행 없음)
```

→ `negateLoadCaseResult(r: LoadCaseResult): LoadCaseResult` 헬퍼 추가 필요
   (기존 `subtractLoadCaseResult` 로직 활용 가능, 또는 factor=-1로 `scaleLoadCaseResult` 재사용)

**`scaleLoadCaseResult`는 이미 `RsaCalculator.ts`에 존재하는지 확인 필요**

---

### 9.7 accStories 구조

`computeAccStories(model: TclModel)` (RsaForceComputer.ts):
- `model.stories`에서 `diaphragm=true`인 층 필터
- 각 층에서 `n.hidden=true` 절점을 CM node로 식별
- `eccX = 0.05 × (X범위)`, `eccY = 0.05 × (Y범위)` 계산
- `AccStoryInfo { storyId, level, masterId, nodeIds, eccX, eccY }` 반환

**구현 시 확인 사항**: `accStories.length === 0`이면 `computeEsStoryMoments`가 빈 배열 반환 → ES 해석 skip

---

### 9.8 캐시 처리

`saveRsaCombinedCache`는 현재 `rsaMerge + esMerge` 를 `rsa_combined_cache.json`에 저장:
```typescript
const cacheEntries: [number, LoadCaseResult][] = [
  ...Array.from(rsaMerge.entries()),   // RSA 결과
  ...Array.from(esMerge.entries()),    // ES 결과 (현재 단일)
]
```

변경 후: ES 4케이스를 `esMerge` 대신 `es4Merge` 등의 이름으로 저장 후 동일하게 캐시 포함.

---

### 9.9 구현 시 주의사항 (코드 읽고 파악한 것)

| # | 파일 | 주의 |
|---|---|---|
| ① | `analysisHandler.ts` | `runRsaAsync`는 `jobId` signal로 취소 처리 — ES 해석도 signal 체크 필수 |
| ② | `analysisHandler.ts` | Phase 4 Xpe/Ype 코드 제거 시 `precompForcesXpeYpe` 변수도 완전 제거 |
| ③ | `ForceEnvelopeUtil.ts` | `interpElemForcesEs` 삭제 시 조합 케이스 루프 (line ~499) + 단일 케이스 (line ~530) 두 곳 모두 수정 |
| ④ | `LoadCombinationModal.tsx` | ES 케이스 가시성 판단 조건 `rsaModalResults?.Xpe` → 새 기준으로 변경 |
| ⑤ | `ResultTablesModal.tsx` | `id < COMBO_KEY_OFFSET` 범위 내 ES 그룹 분류 범위 확장 (150000~199999) |
| ⑥ | `fileApi.ts` | 파일 열기 시 캐시 존재 → `applyRsaCombination` 생략 — ES 4케이스도 캐시에서 로드 확인 |
| ⑦ | `RsaCalculator.ts` | `subtractLoadCaseResult` — ES 용도 제거 후 다른 사용처 없으면 삭제 가능 |
| ⑧ | `analysisHandler.ts` | `rsa_ecc.tcl` 파일명 → `es_static.tcl`로 변경 (내용 완전히 다름) |
| ⑨ | `TclBuilder.ts` | `buildEsStaticTcl`은 이미 완성됨 — ±편심 추가만 필요 (tag: `XES`→`XES` 유지, minus는 후처리) |

---

### 9.10 수정된 구현 순서 (기존 STEP 1~10 재정렬)

기존 MD §6의 STEP 순서는 백엔드 우선이나, 이미 준비된 코드를 고려해 재조정:

```
STEP 1 → analysisHandler.ts Phase 4 교체 (핵심)
  - buildEsStaticTcl/computeEsStoryMoments 연결
  - ±편심: XES_minus = negateLoadCaseResult(XES)
  - 출력 파일: rsa_XES_*.out, rsa_YES_*.out (기존 rsa_Xpe_mode{m}_*.out 제거)

STEP 2 → resultStore.ts: ES_KEY_OFFSET → 4개 오프셋, RsaModalResultMap Xpe/Ype 제거

STEP 3 → analysisApi.ts: ES 블록 제거 + XES/YES 결과 직접 merge
  - esMerge → es4Merge로 교체
  - subtractLoadCaseResult import 제거

STEP 4 → ForceEnvelopeUtil.ts: interpElemForcesEs 삭제 + 라우팅 수정

STEP 5 → fileHandler.ts + fileApi.ts: Xpe/Ype 로드 → XES/YES 로드로 교체

STEP 6 → LoadCombinationModal.tsx: ES 케이스 판단 조건 변경

STEP 7 → ResultTablesModal.tsx: ES 그룹 범위 확장

STEP 8 → 통합 검증 (test11 모델 재실행 + MIDAS 비교)
```

---

### 9.11 새 방식에서 파일 시스템 결과 구조

```
{projectName}_results/
  RSA/
    rsa_X_mode{m}_disp.out      ← 기존 RS 결과 (유지)
    rsa_X_mode{m}_react.out
    rsa_X_mode{m}_force.out
    rsa_X_mode{m}_wall.out
    rsa_Y_mode{m}_*.out         ← 기존 RS 결과 (유지)
    rsa_XES_disp.out            ← 신규 (기존 rsa_Xpe_mode{m}_*.out 대체)
    rsa_XES_react.out
    rsa_XES_force.out
    rsa_XES_wall.out
    rsa_YES_disp.out            ← 신규 (기존 rsa_Ype_mode{m}_*.out 대체)
    rsa_YES_react.out
    rsa_YES_force.out
    rsa_YES_wall.out
    rsa_combined_cache.json     ← RSA + ES 4케이스 포함 (기존과 동일 구조)
    es_static.tcl               ← 신규 (기존 rsa_ecc.tcl 대체)
    [기존 rsa_Xpe_mode{m}_*.out, rsa_Ype_mode{m}_*.out → 삭제]
```
