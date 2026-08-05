# Command Studio Phase 1 구현서

> 상태: Phase 1 구현 완료  
> 작성일: 2026-08-05  
> 진입점: `Tools > Command Studio`

## 1. 목적과 범위

Command Studio는 현재 모델에서 많은 데이터를 텍스트로 뽑아 일괄 편집한 뒤, 변경 내용을 검토하고 한 번에 적용하는 도구다. 소수 항목의 폼 편집보다 수백~수만 행의 대량 수정에 초점을 둔다.

Phase 1 지원 명령은 다음 여섯 종류다.

| 명령 | 역할 | Phase 1 동작 |
|---|---|---|
| `*NODE` | 절점 좌표 | 추가, 수정, 추출 |
| `*ELEMENT` | 선 요소 연결·속성 | 추가, 수정, 추출 |
| `*MATERIAL` | 재료 | 추가, 수정, 추출 |
| `*SECTION` | 단면 | 추가, 수정, 추출 |
| `*THICKNESS` | 두께 | 추가, 수정, 추출 |
| `*CONSTRAINT` | 절점 구속 | 추가, 수정, 추출 |

삭제 명령, 하중, 벽 요소, 링크, 해석 명령은 Phase 1에 포함하지 않는다. 알 수 없는 명령은 건너뛰지 않고 오류로 처리하여 부분 적용을 방지한다.

## 2. 사용자 흐름

1. `Tools > Command Studio`를 연다.
2. 왼쪽 `Pull Model Data`에서 범위와 데이터 종류를 선택한다.
3. `Replace Draft`, `Append`, 또는 `At Cursor`로 모델 데이터를 편집기에 가져온다.
4. 찾기/바꾸기, 필드 일괄 변환, 정렬, 중복 제거로 대량 편집한다.
5. `Review Changes`에서 Add/Update/Unchanged와 오류를 확인한다.
6. `Apply to Model`을 누르고 최종 확인한다.
7. 적용 전체는 History의 `Command Studio Apply` 한 단계로 기록되며 Undo/Redo할 수 있다.

프로젝트의 현재 표시 단위가 스크립트 입력과 출력에 자동으로 적용된다. 단위는 내부 규칙이므로 Command Studio UI에 별도로 노출하지 않는다.

## 3. 명령 형식

```text
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

빈 줄과 `;` 주석은 허용한다. 필드는 쉼표로 구분하며, 이름에 쉼표가 있으면 큰따옴표로 감싼다. 같은 명령과 ID가 한 초안에 중복되면 오류다.

## 4. UI 구성

- `DraggableModal` 기반의 이동·리사이즈 가능한 단일 작업창
- 왼쪽: Selected, Story, ID Range, Entire Model 범위 및 데이터 종류 선택
- 가운데: 줄 번호가 있는 대용량 텍스트 편집기와 페이지 방식의 변경 검토
- 오른쪽: 전체/종류별 Add, Update, Unchanged, Error 집계
- 상단 도구: Open Draft, Save Draft, Clear, Sort Records, Remove Duplicates
- 편집 도구: Find/Replace, Field Transform, Go to Line
- 검토 목록: Changed Only, Errors, All Records 필터와 16행 페이지 이동

모달 전체에는 세로 스크롤을 두지 않는다. 대량 텍스트 편집 영역만 일반 코드 편집기처럼 자체 스크롤하며, 변경 검토는 페이지로 나눈다.

## 5. 엔진 구조

```text
Draft text
  -> strict tokenizer/parser
  -> semantic validation against draft + current model
  -> immutable next-state maps and Add/Update/Unchanged diff
  -> confirmation
  -> batched store commit
  -> cache invalidation + one-step Undo/Redo
```

주요 구현 파일:

| 파일 | 책임 |
|---|---|
| `frontend/src/components/tools/CommandStudioModal.tsx` | 모달 UI와 사용자 흐름 |
| `frontend/src/services/commandStudioEngine.ts` | 파싱, 검증, 직렬화, diff, 필드 변환 |
| `frontend/src/services/commandStudioTextTools.ts` | 정렬과 중복 행 제거 |
| `frontend/src/services/commandStudioApply.ts` | 일괄 적용과 캐시 무효화 |
| `frontend/src/services/externalHistory.ts` | Command Studio Material 상태의 Undo/Redo 동기화 |
| `frontend/src/store/commandStudioStore.ts` | 모달 open/close 상태 |

기존 전체 MGT Import의 permissive parser와 프로젝트 교체 경로는 사용하지 않는다. Command Studio는 현재 모델을 유지한 채 명시된 행만 upsert하는 독립적인 strict 경로다.

## 6. 검증과 안전 규칙

- 숫자는 유한값만 허용하며 빈 값이나 잘못된 문자열을 0으로 바꾸지 않는다.
- ID는 양의 안전 정수만 허용한다.
- 요소의 절점·재료·단면 참조는 초안과 현재 모델을 합친 상태에서 확인한다.
- 동일 좌표 절점, 동일 연결 요소, 자기 자신을 연결한 요소를 차단한다.
- 구속 DOF는 정확히 여섯 자리의 `0/1` 값이어야 한다.
- 오류가 하나라도 있으면 Apply가 비활성화된다.
- Apply 직전에 최신 store 상태로 다시 파싱·검증하여 오래된 미리보기를 적용하지 않는다.
- 모델 Map은 데이터 종류별로 한 번만 교체하며, Material을 포함한 전체 작업을 한 History 항목으로 묶는다.
- 적용 후 해석 envelope와 설계 결과 캐시를 무효화한다.

## 7. 자동 검사

```powershell
cd frontend
npx.cmd tsc --noEmit
npx.cmd eslint src/components/tools/CommandStudioModal.tsx src/services/commandStudio*.ts src/services/externalHistory.ts src/store/commandStudioStore.ts
npx.cmd tsx scripts/check-command-studio.ts
npx.cmd tsx scripts/check-command-studio-history.ts
```

`check-command-studio.ts`는 여섯 데이터 종류 round-trip, 추가/수정 diff, 중복·누락 참조·잘못된 DOF, 필드 변환, 20,000개 절점 파싱을 검사한다. `check-command-studio-history.ts`는 모델과 Material을 함께 적용한 뒤 일반 Undo/Redo와 2단계 jump Undo/Redo를 검사한다.

## 8. 사용자 인수 테스트

### A. 기존 절점 대량 수정

1. 작은 테스트 모델을 열고 `Selected` 또는 `Story`로 `Nodes`를 Pull한다.
2. 여러 행의 한 좌표 열을 Find/Replace 또는 Field Transform으로 변경한다.
3. Review에서 해당 절점이 `Update`로만 표시되는지 확인한다.
4. Apply 후 뷰포트 좌표를 확인하고 Undo/Redo한다.

### B. 혼합 데이터 일괄 추가

1. 새 모델에서 Material, Section, Node, Element 순서의 초안을 붙여 넣는다.
2. Review에서 참조 오류 없이 각 종류의 Add 수량을 확인한다.
3. Apply 후 Model Tree와 뷰포트에서 생성 결과를 확인한다.
4. Undo 한 번으로 모든 종류가 함께 제거되고 Redo 한 번으로 복원되는지 확인한다.

### C. 안전 차단

1. 존재하지 않는 절점을 참조하는 Element 행을 입력한다.
2. Errors 필터에서 행 번호와 참조 오류를 확인한다.
3. Apply 버튼이 비활성화되고 모델이 변하지 않는지 확인한다.

### D. 대량 초안

1. 수천 개 Node 행을 붙여 넣는다.
2. 타이핑과 Review 페이지 이동이 가능하고 모달 전체에 세로 스크롤이 생기지 않는지 확인한다.
3. Add 수량과 실제 생성 수량이 일치하는지 확인한다.

## 9. Phase 2 후보

- 명시적 Delete와 cascade preview
- Wall, Frame Release, Spring, Rigid/Elastic Link
- Static Load Case와 절점·보·면 하중
- 명령 자동완성 및 명령별 도움말
- 초대형 초안의 Web Worker 검증
- 네이티브 Electron Open/Save와 최근 초안 목록

