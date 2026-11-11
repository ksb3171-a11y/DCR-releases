/* ════════════════════════════════════════════════════════════════════════
 *  ⚠ 자동 생성 파일 — 직접 고치지 마세요. 고쳐도 다음 빌드에서 사라집니다.
 *
 *  생성:  frontend/scripts/build-deck.mjs   (npm run deck:build)
 *  원천:  frontend/verification/records/*.json
 *
 *  검증 21건 · 대조항목 131개 · 전건 PASS
 * ══════════════════════════════════════════════════════════════════════ */
window.__DECK_DATA__ = {
 "summary": {
  "total": 21,
  "quantities": 131,
  "allPass": true,
  "failedCount": 0
 },
 "order": {
  "static": [
   "SB1",
   "SB2",
   "SB3",
   "SB5",
   "SB6",
   "SB7",
   "SB8",
   "SB9",
   "SB10",
   "SB12",
   "PD1"
  ],
  "dynamic": [
   "SM5",
   "SM5b",
   "SM6",
   "SR1",
   "SR2",
   "SR2b",
   "SP1",
   "SH1",
   "TH1",
   "P3S2"
  ]
 },
 "records": {
  "P3S2": {
   "id": "P3S2",
   "title": "막 전단벽 캔틸레버 면내 고유주기 (Timoshenko 정해)",
   "titleEn": "Membrane shear-wall cantilever — fundamental in-plane period vs exact Timoshenko beam",
   "sourceShort": "Timoshenko 캔틸레버 정해 (Huang · Cowper κ)",
   "source": "Exact Timoshenko cantilever without rotary inertia: characteristic determinant from EI ψ'' + κGA(w' − ψ) = 0, κGA(w'' − ψ') + ρAω²w = 0 with clamped–free boundary conditions (the frequency equation of T.C. Huang, J. Appl. Mech. 28 (1961) 579–584 with the rotary-inertia term removed); shear coefficient κ = 10(1+ν)/(12+11ν) (G.R. Cowper, J. Appl. Mech. 33 (1966) 335–340, rectangle). Independently checked against a converged 1-D Timoshenko finite-element solution (verification/internal/p3s2_timoshenko_selfcheck.ts).",
   "count": 4,
   "errorPct": -0.1913,
   "tolerancePct": 0.5,
   "verdict": "PASS",
   "slide": {
    "title": "P3S2 · 막 전단벽 면내 고유주기 — Timoshenko 정해 대조",
    "lead": "STRIX 엔진의 막 벽체가 캔틸레버 벽의 면내 1차 주기를 보 이론의 정해대로 재현하는지 검증합니다.",
    "points": [
     {
      "h": "검증 대상 기능",
      "b": "STRIX 엔진의 막 벽체 요소와 생산 지진질량 경로의 자중 질량. 메쉬 4단계 세분화(3×6 → 24×48)로 수렴을 봅니다."
     },
     {
      "h": "왜 이 검증이 필요한가",
      "b": "전단벽은 대부분 건물에서 강성이 가장 큰 횡저항 부재이고, 그 면내 주기가 스펙트럼 요구를 정합니다. H/W = 3 에서는 전단 유연성을 무시할 수 없어 정해가 Euler-Bernoulli 값보다 약 6% 깁니다."
     },
     {
      "h": "해석 조건",
      "b": "벽체 3000×9000 mm, 두께 200 mm, 하단 고정, 전 절점 면외 구속(바닥판 강막 이상화). 질량은 자중만이며 수평 자유도에 집중됩니다. 메쉬 3×6 · 6×12 · 12×24 · 24×48."
     },
     {
      "h": "참조해와 판정",
      "b": [
       "회전관성 없는 Timoshenko 캔틸레버 정해(Cowper κ = 0.845)는 T₁ = ",
       " s 입니다. 24×48 메쉬 오차 ",
       ", 허용오차 ",
       "."
      ]
     }
    ]
   },
   "computed": [
    {
     "quantity": "Fundamental in-plane period — mesh 3×6",
     "unit": "s",
     "strix": "0.0504698",
     "ref": "0.0505932",
     "diffPct": -0.2441,
     "verdict": "PASS"
    },
    {
     "quantity": "Fundamental in-plane period — mesh 6×12",
     "unit": "s",
     "strix": "0.0504555",
     "ref": "0.0505932",
     "diffPct": -0.2722,
     "verdict": "PASS"
    },
    {
     "quantity": "Fundamental in-plane period — mesh 12×24",
     "unit": "s",
     "strix": "0.0504811",
     "ref": "0.0505932",
     "diffPct": -0.2217,
     "verdict": "PASS"
    },
    {
     "quantity": "Fundamental in-plane period — mesh 24×48",
     "unit": "s",
     "strix": "0.0504964",
     "ref": "0.0505932",
     "diffPct": -0.1913,
     "verdict": "PASS"
    }
   ]
  },
  "PD1": {
   "id": "PD1",
   "title": "P-Delta 인장강성 (tension stiffening)",
   "titleEn": "Tension stiffening via P-Delta analysis (CSI 1-016)",
   "sourceShort": "CSI SAP2000 Ex. 1-016",
   "source": "CSI SAP2000 Software Verification Example 1-016 'Tension Stiffening Using P-Delta Analysis'; independent reference = Timoshenko, Strength of Materials Part II, 1956, eq. 23 p.28 and eqs. 43/45 p.43. Reproduced from scratch by pd1Theory() to u=1.5, deflWithIn=-0.5433047259, momentWithKin=11.4980793, matching CSI's published -0.54330 in / 11.498 k-in exactly (exact unit conversion of the same physical problem, dimensionless u is unit-invariant).",
   "count": 4,
   "errorPct": -0.050488,
   "tolerancePct": 0.1,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Uz (no tension)",
     "unit": "in",
     "strix": "-1.04193",
     "ref": "-1.04167",
     "diffPct": -0.025068,
     "verdict": "PASS"
    },
    {
     "quantity": "My (no tension)",
     "unit": "kip-in",
     "strix": "22.5",
     "ref": "22.5",
     "diffPct": 0.000094,
     "verdict": "PASS"
    },
    {
     "quantity": "Uz (w/ tension)",
     "unit": "in",
     "strix": "-0.543579",
     "ref": "-0.543305",
     "diffPct": -0.050488,
     "verdict": "PASS"
    },
    {
     "quantity": "My (w/ tension)",
     "unit": "kip-in",
     "strix": "11.4925",
     "ref": "11.4981",
     "diffPct": -0.048139,
     "verdict": "PASS"
    }
   ]
  },
  "SB1": {
   "id": "SB1",
   "title": "Euler-Bernoulli 캔틸레버 처짐",
   "titleEn": "Euler-Bernoulli 1D cantilever (tip deflection)",
   "sourceShort": "Timoshenko & Gere",
   "source": "Timoshenko & Gere, Mechanics of Materials — cantilever tip deflection under an end load (Euler-Bernoulli).",
   "count": 4,
   "errorPct": 0,
   "tolerancePct": 1,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Tip deflection u_z",
     "unit": "mm",
     "strix": "-0.107865",
     "ref": "-0.107865",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Tip rotation r_y",
     "unit": "rad",
     "strix": "5.3933e-5",
     "ref": "5.3933e-5",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Support reaction R_z",
     "unit": "N",
     "strix": "1000",
     "ref": "1000",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Support moment M_y",
     "unit": "N*mm",
     "strix": "-3.0000e+6",
     "ref": "-3.0000e+6",
     "diffPct": 0,
     "verdict": "PASS"
    }
   ]
  },
  "SB10": {
   "id": "SB10",
   "title": "비대칭 정정 2부재 트러스 축력",
   "titleEn": "Asymmetric determinate two-bar truss (brace axial force)",
   "sourceShort": "정정 트러스 폐형식해",
   "source": "Statically-determinate truss closed form — joint equilibrium (method of joints) gives the member axial forces and EA/L bar stiffness gives the apex displacement; a linear (small-displacement) bar carries no geometric offset, so every quantity is exact.",
   "count": 8,
   "errorPct": 0,
   "tolerancePct": 0.000001,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Brace E1 axial N",
     "unit": "N",
     "strix": "10000",
     "ref": "10000",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Brace E2 axial N",
     "unit": "N",
     "strix": "20000",
     "ref": "20000",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Apex displacement u_x",
     "unit": "mm",
     "strix": "-0.25",
     "ref": "-0.25",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Apex displacement u_z",
     "unit": "mm",
     "strix": "-0.5",
     "ref": "-0.5",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Support N1 reaction R_x",
     "unit": "N",
     "strix": "-6000",
     "ref": "-6000",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Support N1 reaction R_z",
     "unit": "N",
     "strix": "8000",
     "ref": "8000",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Support N2 reaction R_x",
     "unit": "N",
     "strix": "16000",
     "ref": "16000",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Support N2 reaction R_z",
     "unit": "N",
     "strix": "12000",
     "ref": "12000",
     "diffPct": 0,
     "verdict": "PASS"
    }
   ]
  },
  "SB12": {
   "id": "SB12",
   "title": "Elastic Link Beta Angle 좌표변환 (경사 6-DOF 스프링)",
   "titleEn": "Elastic Link (twoNodeLink) Beta Angle coordinate transformation — inclined 6-DOF spring",
   "sourceShort": "자체 유도 폐형식해",
   "source": "Self-designed closed form (no CSI/NAFEMS published example fits — CSI Group 6 Link catalog is dynamic-only, see devplan §12.3 SB12 note). Independent reference = exact linear-algebra congruence transform K_global = (C*T)^T * diag(k_local) * (C*T), solved by an independent Gaussian-elimination linear solve. T = blockdiag(R,R), R = MIDAS Beta-Angle local frame re-derived from scratch (benchmarks/element/SB12_elasticLink.ts, no import from production TclBuilder code) -- this is the transform under test. C = the two-node link's standard shear/rotation basic-deformation coupling (shear acts at shearDist = 0.5 of the link length, the value STRIX always emits: each shear basic deformation picks up ± half the link length times the end rotations) -- link kinematics, included only so the closed form matches the element, not itself under test. Not a FEM discretization/convergence problem -- exact linear algebra, so near-machine-precision agreement with the simulated result is expected.",
   "count": 12,
   "errorPct": -0.0001079,
   "tolerancePct": 0.01,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Oblique Ux",
     "unit": "mm",
     "strix": "0.152961",
     "ref": "0.152961",
     "diffPct": -0.0001079,
     "verdict": "PASS"
    },
    {
     "quantity": "Oblique Uy",
     "unit": "mm",
     "strix": "-0.322861",
     "ref": "-0.322861",
     "diffPct": -0.00003846,
     "verdict": "PASS"
    },
    {
     "quantity": "Oblique Uz",
     "unit": "mm",
     "strix": "0.434406",
     "ref": "0.434406",
     "diffPct": -0.00003765,
     "verdict": "PASS"
    },
    {
     "quantity": "Oblique Rx",
     "unit": "rad",
     "strix": "0.000353789",
     "ref": "0.000353789",
     "diffPct": 0.00000953,
     "verdict": "PASS"
    },
    {
     "quantity": "Oblique Ry",
     "unit": "rad",
     "strix": "-0.000237923",
     "ref": "-0.000237923",
     "diffPct": 0.00006323,
     "verdict": "PASS"
    },
    {
     "quantity": "Oblique Rz",
     "unit": "rad",
     "strix": "-4.2642e-5",
     "ref": "-4.2642e-5",
     "diffPct": 0.00017661,
     "verdict": "PASS"
    },
    {
     "quantity": "NearVert Ux",
     "unit": "mm",
     "strix": "-0.12171",
     "ref": "-0.12171",
     "diffPct": -0.00003358,
     "verdict": "PASS"
    },
    {
     "quantity": "NearVert Uy",
     "unit": "mm",
     "strix": "0.426039",
     "ref": "0.426039",
     "diffPct": -0.0000124,
     "verdict": "PASS"
    },
    {
     "quantity": "NearVert Uz",
     "unit": "mm",
     "strix": "-0.0153195",
     "ref": "-0.0153195",
     "diffPct": 0.00005683,
     "verdict": "PASS"
    },
    {
     "quantity": "NearVert Rx",
     "unit": "rad",
     "strix": "-0.000295859",
     "ref": "-0.000295859",
     "diffPct": -0.0000129,
     "verdict": "PASS"
    },
    {
     "quantity": "NearVert Ry",
     "unit": "rad",
     "strix": "-2.0239e-5",
     "ref": "-2.0239e-5",
     "diffPct": -0.0000699,
     "verdict": "PASS"
    },
    {
     "quantity": "NearVert Rz",
     "unit": "rad",
     "strix": "-0.000145984",
     "ref": "-0.000145984",
     "diffPct": -2.8e-7,
     "verdict": "PASS"
    }
   ]
  },
  "SB2": {
   "id": "SB2",
   "title": "NAFEMS LE1 타원 막판 접선응력 (메쉬 수렴)",
   "titleEn": "NAFEMS LE1 elliptic membrane (tangential edge stress at D)",
   "sourceShort": "NAFEMS Standard Benchmarks",
   "source": "NAFEMS, The Standard NAFEMS Benchmarks (Linear Elastic), Benchmark LE1 — elliptic membrane; reference tangential edge stress sigma_yy = 92.7 MPa at point D.",
   "count": 1,
   "errorPct": -2,
   "tolerancePct": 3,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Tangential edge stress sigma_yy at D",
     "unit": "MPa",
     "strix": "90.8464",
     "ref": "92.7",
     "diffPct": -2,
     "verdict": "PASS"
    }
   ]
  },
  "SB3": {
   "id": "SB3",
   "title": "Cook's membrane — 왜곡메쉬 면내휨",
   "titleEn": "Cook's membrane (skew panel, in-plane bending on a distorted mesh)",
   "sourceShort": "Cook 왜곡메쉬 벤치마크",
   "source": "Cook's membrane, a standard finite-element distortion benchmark (R.D. Cook, 1974). No closed-form solution; the reference is the fine-mesh converged tip displacement at the loaded-edge midpoint Q, PLANE STRESS, E=1, nu=1/3, unit shear resultant: normalized u_Q*E*t/P = 23.91 (literature band 23.90-23.96). The plane-strain counterpart is 21.52 (Sevilla et al. / locking-free FCFV report 21.42 converged); STRIX walls are plane stress (membrane section), and 21.42/(1-nu^2) ~= 23.9 confirms the plane-stress mid-edge value.",
   "count": 1,
   "errorPct": 0.184,
   "tolerancePct": 3,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Normalized tip displacement u_Q*E*t/P (mid loaded edge)",
     "unit": "norm.",
     "strix": "23.9541",
     "ref": "23.91",
     "diffPct": 0.184,
     "verdict": "PASS"
    }
   ]
  },
  "SB5": {
   "id": "SB5",
   "title": "얇은 판 휨 — 등분포 · 중앙집중하중",
   "titleEn": "Rectangular plate bending — thin plate, uniform & central point load",
   "sourceShort": "Timoshenko & Woinowsky-Krieger",
   "source": "Timoshenko & Woinowsky-Krieger, Theory of Plates and Shells, 2nd ed. (1959): Table 8 (SS, uniform), Eq.147 & Table 23 (SS, central point), Table 35 (clamped, uniform), Table 37 (clamped, central point), ν = 0.3. The eight-case layout follows CSI SAP2000 Verification Example 2-005 (geometry after MacNeal & Harder, 1985). STRIX recovers the scale-invariant deflection coefficient α (= w·D/(q·a⁴) uniform, w·D/(P·a²) point) and compares it to the published table value; a = short side.",
   "count": 8,
   "errorPct": -0.62,
   "tolerancePct": 2,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Deflection coefficient α",
     "unit": "",
     "strix": "0.00406",
     "ref": "0.00406",
     "diffPct": 0.064,
     "verdict": "PASS"
    },
    {
     "quantity": "Deflection coefficient α",
     "unit": "",
     "strix": "0.01294",
     "ref": "0.01297",
     "diffPct": -0.264,
     "verdict": "PASS"
    },
    {
     "quantity": "Deflection coefficient α",
     "unit": "",
     "strix": "0.00126",
     "ref": "0.00126",
     "diffPct": 0.336,
     "verdict": "PASS"
    },
    {
     "quantity": "Deflection coefficient α",
     "unit": "",
     "strix": "0.00259",
     "ref": "0.0026",
     "diffPct": -0.506,
     "verdict": "PASS"
    },
    {
     "quantity": "Deflection coefficient α",
     "unit": "",
     "strix": "0.0116",
     "ref": "0.0116",
     "diffPct": -0.003,
     "verdict": "PASS"
    },
    {
     "quantity": "Deflection coefficient α",
     "unit": "",
     "strix": "0.01694",
     "ref": "0.01695",
     "diffPct": -0.069,
     "verdict": "PASS"
    },
    {
     "quantity": "Deflection coefficient α",
     "unit": "",
     "strix": "0.00559",
     "ref": "0.0056",
     "diffPct": -0.165,
     "verdict": "PASS"
    },
    {
     "quantity": "Deflection coefficient α",
     "unit": "",
     "strix": "0.00721",
     "ref": "0.00725",
     "diffPct": -0.62,
     "verdict": "PASS"
    }
   ]
  },
  "SB6": {
   "id": "SB6",
   "title": "두꺼운 판 휨 — 횡전단 포함",
   "titleEn": "Thick rectangular plate bending — transverse shear, uniform load",
   "sourceShort": "FSDT (Reissner-Mindlin) 이론해",
   "source": "Exact first-order shear-deformation (FSDT / Reissner-Mindlin) Navier series for a hard simply-supported rectangular plate under uniform pressure (Wang relationship, exact for SS plates): w_mn = Q_mn/(D·k⁴)·[1 + D·k²/(κGh)], κ = 5/6, ν = 0.3. The eight-case-style layout and thick-plate/shear focus follow CSI SAP2000 Verification Example 2-012 (Plate Bending with Shear Deformation; Roark & Young). STRIX recovers the scale-invariant deflection coefficient α = w·D/(q·a⁴), a = short side; the shear bracket → 1 as a/t → ∞ (recovers the SB5/Timoshenko thin-plate value) and grows with thickness.",
   "count": 6,
   "errorPct": -0.156,
   "tolerancePct": 0.5,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Deflection coefficient α",
     "unit": "",
     "strix": "0.004068",
     "ref": "0.004071",
     "diffPct": -0.068,
     "verdict": "PASS"
    },
    {
     "quantity": "Deflection coefficient α",
     "unit": "",
     "strix": "0.004113",
     "ref": "0.004115",
     "diffPct": -0.061,
     "verdict": "PASS"
    },
    {
     "quantity": "Deflection coefficient α",
     "unit": "",
     "strix": "0.004271",
     "ref": "0.004273",
     "diffPct": -0.057,
     "verdict": "PASS"
    },
    {
     "quantity": "Deflection coefficient α",
     "unit": "",
     "strix": "0.004903",
     "ref": "0.004904",
     "diffPct": -0.023,
     "verdict": "PASS"
    },
    {
     "quantity": "Deflection coefficient α",
     "unit": "",
     "strix": "0.010438",
     "ref": "0.010454",
     "diffPct": -0.156,
     "verdict": "PASS"
    },
    {
     "quantity": "Deflection coefficient α",
     "unit": "",
     "strix": "0.011414",
     "ref": "0.01143",
     "diffPct": -0.139,
     "verdict": "PASS"
    }
   ]
  },
  "SB7": {
   "id": "SB7",
   "title": "Winkler 탄성지반 위 단순보",
   "titleEn": "Simply-supported beam on a Winkler elastic foundation (CSI 1-013)",
   "sourceShort": "CSI SAP2000 Ex. 1-013",
   "source": "CSI SAP2000 Software Verification Example 1-013 'Simply Supported Beam on Elastic Foundation'; independent reference = Timoshenko, Strength of Materials Part II, 1956, Problem 3, p.23 (exact continuum solution of EI y'''' + k y = 0, pinned-pinned, central load). Reproduced from scratch by sb7Theory() to −0.0893327 in / 17697.995 k-in, matching CSI's published −0.08933 in / 17698 k-in.",
   "count": 2,
   "errorPct": 0.000036,
   "tolerancePct": 0.05,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Center deflection Uz",
     "unit": "in",
     "strix": "-0.0893327",
     "ref": "-0.0893327",
     "diffPct": 0.000036,
     "verdict": "PASS"
    },
    {
     "quantity": "Center moment My",
     "unit": "kip-in",
     "strix": "17697.9",
     "ref": "17698",
     "diffPct": -0.000602,
     "verdict": "PASS"
    }
   ]
  },
  "SB8": {
   "id": "SB8",
   "title": "깊은 단순보 고유진동수 (Timoshenko)",
   "titleEn": "Deep simply-supported beam — shear-flexible (Timoshenko) natural frequencies",
   "sourceShort": "전단변형 연속체 이론해",
   "source": "Exact continuum reference: simply-supported Timoshenko (shear-flexible) beam with translational mass and rotary inertia excluded — matching the production lumped translational-mass model. The SS frequencies have a closed form with no root-finding, ωₙ² = (EI·βₙ⁴/ρA)/(1 + EI·βₙ²/κGA) with βₙ=nπ/L, which reduces to the exact Euler SS frequency ωE,ₙ²=EI·βₙ⁴/ρA in the shear-rigid limit κGA→∞. Reproduced from scratch by sb8Theory() to the values below. The shear term lowers the frequencies by 4.4% (mode 1) to 52.4% (mode 6) below Euler, so STRIX must reproduce the shear-lowered values. Genre context: NAFEMS 'Selected Benchmarks for Natural Frequency Analysis' (deep simply-supported beam, FV5); shear coefficient κ=5/6 (Cowper 1966, rectangular); Timoshenko beam dynamics closed forms (Timoshenko & Young; Blevins, Formulas for Natural Frequency and Mode Shape; Han, Benaroya & Wei 1999).",
   "count": 6,
   "errorPct": 0.047818,
   "tolerancePct": 0.05,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Natural frequency f₁",
     "unit": "Hz",
     "strix": "102.146",
     "ref": "102.149",
     "diffPct": -0.003436,
     "verdict": "PASS"
    },
    {
     "quantity": "Natural frequency f₂",
     "unit": "Hz",
     "strix": "364.017",
     "ref": "364.059",
     "diffPct": -0.011463,
     "verdict": "PASS"
    },
    {
     "quantity": "Natural frequency f₃",
     "unit": "Hz",
     "strix": "706.544",
     "ref": "706.69",
     "diffPct": -0.020668,
     "verdict": "PASS"
    },
    {
     "quantity": "Natural frequency f₄",
     "unit": "Hz",
     "strix": "1077.78",
     "ref": "1078.1",
     "diffPct": -0.029664,
     "verdict": "PASS"
    },
    {
     "quantity": "Natural frequency f₅",
     "unit": "Hz",
     "strix": "1455.24",
     "ref": "1455.8",
     "diffPct": -0.038607,
     "verdict": "PASS"
    },
    {
     "quantity": "Natural frequency f₆",
     "unit": "Hz",
     "strix": "1831.14",
     "ref": "1832.02",
     "diffPct": -0.047818,
     "verdict": "PASS"
    }
   ]
  },
  "SB9": {
   "id": "SB9",
   "title": "강재 라멘 등분포하중 — 휨 + 축변형",
   "titleEn": "Rigid steel portal frame under UDL — bending + axial deformation (CSI 1-018)",
   "sourceShort": "CSI SAP2000 Ex. 1-018",
   "source": "CSI SAP2000 Software Verification Example 1-018 'Bending, Shear and Axial Deformations in a Rigid Frame'; independent reference = unit-load (virtual-work) method, Cook & Young, Advanced Mechanics of Materials, 1985, p.244. STRIX omits the shear term (elasticBeamColumn has no shear-area argument, TclBuilder.ts:465 — Euler-Bernoulli only, same scope as SB1) and re-derives the axial + bending terms from scratch via sb9Theory(); the result matches CSI's published in-lb values (converted to N·mm) to 6 significant figures: axial 0.0076043 vs CSI 0.00760 in, bending 2.7236096 vs CSI 2.723610 in.",
   "count": 3,
   "errorPct": -0.000136,
   "tolerancePct": 0.05,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Midspan deflection Uz — combined (axial+bending)",
     "unit": "mm",
     "strix": "-69.3729",
     "ref": "-69.3728",
     "diffPct": -0.000136,
     "verdict": "PASS"
    },
    {
     "quantity": "Midspan deflection Uz — bending only (area x1e5)",
     "unit": "mm",
     "strix": "-69.1798",
     "ref": "-69.1797",
     "diffPct": -0.000111,
     "verdict": "PASS"
    },
    {
     "quantity": "Midspan deflection Uz — axial only (Iz x1e7)",
     "unit": "mm",
     "strix": "-0.193176",
     "ref": "-0.193149",
     "diffPct": -0.013856,
     "verdict": "PASS"
    }
   ]
  },
  "SH1": {
   "id": "SH1",
   "title": "자체 P-M-M 기둥힌지 요소역학 (STRIX 엔진)",
   "titleEn": "STRIX custom P-M-M column hinge — element-mechanics defense",
   "sourceShort": "자체 유도 (제3자 공개예제 부재)",
   "source": "No third-party published example exists for this STRIX-original element (unlike SP1/CSI 1-026) — devplan §12.11 honesty split: (a) the uniaxial FEMA-356/ASCE-41 4-branch backbone (elastic/hardening/post-capping softening/residual) and (b) the Fritsch & Carlson (1980, SIAM J. Numer. Anal. 17(2):238-246) monotone-cubic capacity interpolation are PUBLISHED external models — re-derived from scratch in benchmarks/nonlinear/SH1_pmmHingeBackbone.ts, never by reading the element source. (c) The biaxial Bresler-type capacity-envelope projection (independent per-direction backbones + closed-form radial scale-back beta=min(1,1/Phi)) is STRIX's own §5.9 design choice — the interaction SURFACE FORM (normalized power-law) is standard/published, but this specific combination algorithm has no external authority to validate against; quantities C_* verify the implementation is self-consistent with STRIX's own stated specification, not that the specification itself reproduces a third-party benchmark.",
   "count": 11,
   "errorPct": 0,
   "tolerancePct": 0.01,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Uniaxial backbone, mid-hardening (kappa=0.5*thetaP)",
     "unit": "N·mm",
     "strix": "1.1250e+8",
     "ref": "1.1250e+8",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Uniaxial backbone, cap boundary (kappa=thetaP)",
     "unit": "N·mm",
     "strix": "1.2500e+8",
     "ref": "1.2500e+8",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Uniaxial backbone, mid-softening (kappa=thetaP+0.5*thetaPC)",
     "unit": "N·mm",
     "strix": "7.2500e+7",
     "ref": "7.2500e+7",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Uniaxial backbone, residual plateau (kappa=thetaP+thetaPC+0.02)",
     "unit": "N·mm",
     "strix": "2.0000e+7",
     "ref": "2.0000e+7",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Elastic unload from mid-hardening (theta1->theta2, Delta_theta=-0.005 rad)",
     "unit": "N·mm",
     "strix": "6.2500e+7",
     "ref": "6.2500e+7",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Biaxial Bresler projection, symmetric ratio (kappaZ=kappaY=0.010)",
     "unit": "N·mm",
     "strix": "7.0871e+7",
     "ref": "7.0871e+7",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Biaxial Bresler projection, symmetric ratio — My",
     "unit": "N·mm",
     "strix": "7.0871e+7",
     "ref": "7.0871e+7",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Biaxial Bresler projection, asymmetric ratio (kappaZ=0.015, kappaY=0.005)",
     "unit": "N·mm",
     "strix": "7.4808e+7",
     "ref": "7.4808e+7",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Biaxial Bresler projection, asymmetric ratio — My",
     "unit": "N·mm",
     "strix": "6.6933e+7",
     "ref": "6.6933e+7",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "N-dependent cap via PCHIP, N=-1.5e6 N (interior query, table N=[-2e6,-1e6,0,1e6])",
     "unit": "N·mm",
     "strix": "9.1250e+7",
     "ref": "9.1250e+7",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "N-dependent cap via PCHIP, N=0.5e6 N",
     "unit": "N·mm",
     "strix": "1.3391e+8",
     "ref": "1.3391e+8",
     "diffPct": 0,
     "verdict": "PASS"
    }
   ]
  },
  "SM5": {
   "id": "SM5",
   "title": "고유치 — 10경간 9층 평면골조 (Bathe & Wilson)",
   "titleEn": "Bathe & Wilson eigenvalue problem — ten-bay nine-storey plane frame",
   "sourceShort": "Bathe & Wilson (1972)",
   "source": "K.-J. Bathe & E. L. Wilson, \"Large Eigenvalue Problems in Dynamic Analysis,\" ASCE J. Eng. Mech. Div. 98(EM6), 1972 (with an independent solution by Peterson, 1981). The canonical multi-DOF frame eigenvalue benchmark, reproduced as CSI SAP2000 Verification Example 1-021, SeismoStruct Verification Ex.10, Tekla Structural Designer and OpenBrIM Frame21. A ten-bay, nine-storey fixed-base 2-D frame; all members identical, one finite element per member, consistent mass from the line mass, shear-rigid (bending + axial only). The published reference values are the first three eigenvalues ω² (rad²/s²).",
   "count": 3,
   "errorPct": 0.0005,
   "tolerancePct": 0.5,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "0.589542",
     "ref": "0.589541",
     "diffPct": 0.0002,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "5.52696",
     "ref": "5.52695",
     "diffPct": 0.0002,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "16.5879",
     "ref": "16.5878",
     "diffPct": 0.0005,
     "verdict": "PASS"
    }
   ]
  },
  "SM5b": {
   "id": "SM5b",
   "title": "강막 고유치 축약 — 편심 다층건물",
   "titleEn": "Rigid-diaphragm eigenvalue condensation — eccentric multi-storey building",
   "sourceShort": "독립 조립 축약 고유문제",
   "source": "Independent reference: the SAME reduced eigenproblem assembled from first principles as a 3N×3N rigid-diaphragm shear building — per-column lateral springs k = 12EI/L³ at their plan lever arms, per-column torsion GJ/L, and lumped floor masses reduced about a reference point (M_ΘΘ = Σm·r², M_UΘ = −Σm·ay, M_VΘ = +Σm·ax) — solved with the DENSE generalised eigensolver scipy.linalg.eigh, a different solver and a separate implementation from STRIX's sparse eigsh. The rigid-diaphragm kinematics (u = U − dy·Θ, v = V + dx·Θ) follow the standard treatment (A. K. Chopra, Dynamics of Structures — rigid diaphragms with stiffness eccentricity). Since STRIX's condensed system and the numpy reference are the same discrete reduced eigenproblem, agreement is expected across all modes to near machine precision — isolating and verifying the de-Zhu condensation that SM5 left at the identity.",
   "count": 6,
   "errorPct": 0.0001,
   "tolerancePct": 0.05,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "2070.12",
     "ref": "2070.12",
     "diffPct": 0.0001,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "2667.42",
     "ref": "2667.42",
     "diffPct": 0.0001,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "3339.65",
     "ref": "3339.65",
     "diffPct": 0.0001,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "17435.1",
     "ref": "17435.1",
     "diffPct": 0.0001,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "22465.7",
     "ref": "22465.7",
     "diffPct": 0.0001,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "28127.4",
     "ref": "28127.4",
     "diffPct": 0.0001,
     "verdict": "PASS"
    }
   ]
  },
  "SM6": {
   "id": "SM6",
   "title": "ASME 고유치 골조 — 3D 고정단 파이프 프레임",
   "titleEn": "ASME eigenvalue frame — 3-D fixed-base pipe frame with lumped joint masses",
   "sourceShort": "ASME 파이프프레임 · 독립 조립",
   "source": "Independent reference: the SAME 42-DOF (six per node) 3-D frame assembled from first principles with the identical pipe Timoshenko element (local 12×12 with shear parameter φ = 12EI/GAsL², Avy=Avz=A/2, torsion GJ/L, axial EA/L, rotated to global) and the identical eps=1e-8 rotational-mass floor, then solved with the DENSE generalised eigensolver scipy.linalg.eigh — a separate implementation and a different solver from the STRIX engine's FE assembly and modal solver. Agreement to machine precision across all 24 modes verifies the eigensolver on a fully 3-D coupled structure with explicit nodal masses. The classical benchmark is Problem No. 1 of the ASME 1972 Program Verification & Qualification Library (CSI SAP2000 Verification Example 1-023); its published 'independent' column (Peterson 1981 / DeSalvo & Swanson 1977) is Guyan-reduced 42→24 DOF and so differs from the full solution by up to ±3% — hence it is used only as a secondary physical bracket, not the primary target.",
   "count": 8,
   "errorPct": 0.0015,
   "tolerancePct": 0.05,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "488559",
     "ref": "488567",
     "diffPct": -0.0015,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "529444",
     "ref": "529439",
     "diffPct": 0.0009,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "743006",
     "ref": "743004",
     "diffPct": 0.0003,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "1.8389e+6",
     "ref": "1.8389e+6",
     "diffPct": 0,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "6.4490e+6",
     "ref": "6.4490e+6",
     "diffPct": 0.0003,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "7.0477e+6",
     "ref": "7.0477e+6",
     "diffPct": 0.0003,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "8.0464e+6",
     "ref": "8.0464e+6",
     "diffPct": 0.0003,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "1.1893e+7",
     "ref": "1.1893e+7",
     "diffPct": 0.0002,
     "verdict": "PASS"
    }
   ]
  },
  "SP1": {
   "id": "SP1",
   "title": "Pushover — 캔틸레버 모멘트힌지",
   "titleEn": "Pushover cantilever moment hinge (CSI 1-026, moment-hinge scope)",
   "sourceShort": "CSI SAP2000 Ex. 1-026",
   "source": "CSI SAP2000 Software Verification Example 1-026 'Frame – Moment and Shear Hinges' (PDF confirmed, devplan §12.7) — moment-hinge backbone (My/Mc/Mr/thetaC) taken verbatim from CSI's published figure. The independent target values below are NOT CSI's own published 'Independent' column (those include a GAv shear term and a 0.4in shear-hinge plastic term with no STRIX counterpart — STRIX has no discrete shear hinge). Re-derived from scratch by sp1Theory()/sp1UzRyAt() using the SAME unit-load method (Cook & Young 1985 p.244, as CSI itself cites) minus the shear terms, with the elastic term using STRIX's actual body stiffness EI_mod=(11/10)×EI (TclBuilder.ts N_FAC=10 series-stiffness correction, RC-column FEMA lumped-hinge branch) and the hinge rotation taken from the REAL production convertFemaToModIMK() clamp output (csi mode, -10%Ke), not assumed.",
   "count": 5,
   "errorPct": -0.0000060701025836400506,
   "tolerancePct": 1,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Tip Uz at Point1 (P=My/L, elastic boundary)",
     "unit": "mm",
     "strix": "1.82808",
     "ref": "1.8281",
     "diffPct": -0.0010264289712167008,
     "verdict": "PASS"
    },
    {
     "quantity": "Base hinge rotation at Point1",
     "unit": "rad",
     "strix": "0.0025",
     "ref": "0.00250003",
     "diffPct": -0.001227255738373538,
     "verdict": "PASS"
    },
    {
     "quantity": "Tip Uz at Point2 (P=Mc/L, hardening peak)",
     "unit": "mm",
     "strix": "24.7894",
     "ref": "24.7894",
     "diffPct": -0.0000060701025836400506,
     "verdict": "PASS"
    },
    {
     "quantity": "Base hinge rotation at Point2 (= thetaC)",
     "unit": "rad",
     "strix": "0.04",
     "ref": "0.04",
     "diffPct": -0.000006011501785387262,
     "verdict": "PASS"
    },
    {
     "quantity": "Uz self-consistency across ALL recorded pre-peak (ascending) steps",
     "unit": "%",
     "strix": "-0.00102643",
     "ref": "0",
     "diffPct": -0.0010264289712167008,
     "verdict": "PASS"
    }
   ]
  },
  "SR1": {
   "id": "SR1",
   "title": "응답스펙트럼 — 2차원 라멘",
   "titleEn": "Response-spectrum analysis of a two-dimensional rigid frame",
   "sourceShort": "CSI SAP2000 Ex. 1-020",
   "source": "CSI SAP2000 Software Verification, Example 1-020 (Response-Spectrum Analysis of a Two-Dimensional Rigid Frame); independent solution = Chopra, \"Dynamics of Structures\" (1995), Ex. 13.11, p.521. A single-bay, two-story fixed-base plane frame under a 5%-damped response spectrum, bending deformations only (shear/axial ignored), mass excited in X only. Reference values (Chopra) are the two periods, the SRSS lateral displacements, and the SRSS column/beam bending moments.",
   "count": 8,
   "errorPct": 0.185,
   "tolerancePct": 1,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Period — mode 1",
     "unit": "s",
     "strix": "1.56213",
     "ref": "1.562",
     "diffPct": 0.008,
     "verdict": "PASS"
    },
    {
     "quantity": "Period — mode 2",
     "unit": "s",
     "strix": "0.58681",
     "ref": "0.5868",
     "diffPct": 0.002,
     "verdict": "PASS"
    },
    {
     "quantity": "Displacement Ux — joint 2 (floor 1)",
     "unit": "in",
     "strix": "7.576",
     "ref": "7.566",
     "diffPct": 0.131,
     "verdict": "PASS"
    },
    {
     "quantity": "Displacement Ux — joint 3 (roof)",
     "unit": "in",
     "strix": "18.838",
     "ref": "18.81",
     "diffPct": 0.149,
     "verdict": "PASS"
    },
    {
     "quantity": "Moment — story-1 column base (jt 1)",
     "unit": "kip·in",
     "strix": "12636",
     "ref": "12624",
     "diffPct": 0.091,
     "verdict": "PASS"
    },
    {
     "quantity": "Moment — story-2 column base (jt 2)",
     "unit": "kip·in",
     "strix": "6023",
     "ref": "6024",
     "diffPct": -0.018,
     "verdict": "PASS"
    },
    {
     "quantity": "Moment — floor-1 beam at column (jt 2)",
     "unit": "kip·in",
     "strix": "9810",
     "ref": "9792",
     "diffPct": 0.185,
     "verdict": "PASS"
    },
    {
     "quantity": "Moment — roof beam at column (jt 3)",
     "unit": "kip·in",
     "strix": "5222",
     "ref": "5220",
     "diffPct": 0.045,
     "verdict": "PASS"
    }
   ]
  },
  "SR2": {
   "id": "SR2",
   "title": "응답스펙트럼 — 3D 편심 강막 라멘",
   "titleEn": "Response-spectrum analysis of a three-dimensional eccentric rigid-diaphragm frame",
   "sourceShort": "CSI SAP2000 Ex. 1-024",
   "source": "CSI SAP2000 Software Verification, Example 1-024 (Response-Spectrum Analysis of a Three-Dimensional Moment Frame); independent solution = Peterson (1981), reproduced exactly by SAP2000. A two-story, two-bay-by-two-bay fixed-base 3-D moment frame with a plan eccentricity between the geometric centre (35, 25 ft) and the centre of mass (38, 27 ft), excited by a constant 0.4 g response spectrum in the X direction with 4% modal damping. Bending and axial deformations are retained; shear is ignored (shear area 0). Story mass acts in X and Y only (no rotational mass inertia), giving four natural modes. Reference values (Peterson) are the four modal periods and the roof centre-of-mass X-displacement under four modal-combination rules (SRSS, CQC, ABS, NRC-10%).",
   "count": 8,
   "errorPct": 0.104,
   "tolerancePct": 1,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Period — mode 1",
     "unit": "s",
     "strix": "0.22705",
     "ref": "0.2271",
     "diffPct": -0.022,
     "verdict": "PASS"
    },
    {
     "quantity": "Period — mode 2",
     "unit": "s",
     "strix": "0.21561",
     "ref": "0.2156",
     "diffPct": 0.006,
     "verdict": "PASS"
    },
    {
     "quantity": "Period — mode 3",
     "unit": "s",
     "strix": "0.07334",
     "ref": "0.0733",
     "diffPct": 0.058,
     "verdict": "PASS"
    },
    {
     "quantity": "Period — mode 4",
     "unit": "s",
     "strix": "0.072",
     "ref": "0.072",
     "diffPct": 0.002,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Ux — SRSS",
     "unit": "ft",
     "strix": "0.0201",
     "ref": "0.02012",
     "diffPct": -0.085,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Ux — CQC",
     "unit": "ft",
     "strix": "0.02013",
     "ref": "0.02014",
     "diffPct": -0.064,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Ux — ABS",
     "unit": "ft",
     "strix": "0.02048",
     "ref": "0.0205",
     "diffPct": -0.079,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Ux — NRC 10%",
     "unit": "ft",
     "strix": "0.02014",
     "ref": "0.02016",
     "diffPct": -0.104,
     "verdict": "PASS"
    }
   ]
  },
  "SR2b": {
   "id": "SR2b",
   "title": "응답스펙트럼 — 3D L형 가새골조",
   "titleEn": "Response-spectrum analysis of a three-dimensional L-shaped braced frame",
   "sourceShort": "CSI SAP2000 Ex. 1-025",
   "source": "CSI SAP2000 Software Verification, Example 1-025 (Response-Spectrum Analysis of a Three-Dimensional Braced Frame); independent solution = Peterson (1981), reproduced exactly (0 %) by SAP2000. A three-story, L-shaped building framed by four identical two-bay, three-story X-braced planar frames whose columns and diagonals carry axial force only (all pinned). The frames are tied by a rigid floor diaphragm at each level. All mass is concentrated at a centre-of-mass joint per level with X and Y translational mass (1.24224 kip-s²/in) and a rotational mass moment of inertia about Z (174,907.4 kip-in-s²), giving nine dynamic DOF; for consistency with Peterson only the first two modes drive the RSA. The excitation is the El-Centro-derived 5%-damped response spectrum applied in X, combined by CQC, SRSS and ABS. Reference values are the two modal frequencies, the roof centre-of-mass (joint 51) X/Y displacement and Z rotation, and the axial forces in three Frame-1 elements (a column and two diagonals) under each combination rule.",
   "count": 20,
   "errorPct": 0.142,
   "tolerancePct": 1.5,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Frequency — mode 1",
     "unit": "Hz",
     "strix": "3.05916",
     "ref": "3.0592",
     "diffPct": -0.001,
     "verdict": "PASS"
    },
    {
     "quantity": "Frequency — mode 2",
     "unit": "Hz",
     "strix": "3.11876",
     "ref": "3.1188",
     "diffPct": -0.001,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Ux — CQC",
     "unit": "in",
     "strix": "1.03204",
     "ref": "1.0329",
     "diffPct": -0.083,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Ux — SRSS",
     "unit": "in",
     "strix": "0.736576",
     "ref": "0.7372",
     "diffPct": -0.085,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Ux — ABS",
     "unit": "in",
     "strix": "1.04144",
     "ref": "1.0423",
     "diffPct": -0.083,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Uy — CQC",
     "unit": "in",
     "strix": "0.141323",
     "ref": "0.1414",
     "diffPct": -0.054,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Uy — SRSS",
     "unit": "in",
     "strix": "0.736576",
     "ref": "0.7372",
     "diffPct": -0.085,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Uy — ABS",
     "unit": "in",
     "strix": "1.04144",
     "ref": "1.0423",
     "diffPct": -0.083,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Rz — CQC",
     "unit": "rad",
     "strix": "0.000251642",
     "ref": "0.000252",
     "diffPct": -0.142,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Rz — SRSS",
     "unit": "rad",
     "strix": "0.000251642",
     "ref": "0.000252",
     "diffPct": -0.142,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Rz — ABS",
     "unit": "rad",
     "strix": "0.000251642",
     "ref": "0.000252",
     "diffPct": -0.142,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 1 — CQC",
     "unit": "kip",
     "strix": "279.249",
     "ref": "279.48",
     "diffPct": -0.082,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 1 — SRSS",
     "unit": "kip",
     "strix": "200.385",
     "ref": "200.55",
     "diffPct": -0.082,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 1 — ABS",
     "unit": "kip",
     "strix": "281.763",
     "ref": "281.99",
     "diffPct": -0.081,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 4 — CQC",
     "unit": "kip",
     "strix": "194.342",
     "ref": "194.5",
     "diffPct": -0.081,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 4 — SRSS",
     "unit": "kip",
     "strix": "139.457",
     "ref": "139.57",
     "diffPct": -0.081,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 4 — ABS",
     "unit": "kip",
     "strix": "196.091",
     "ref": "196.25",
     "diffPct": -0.081,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 6 — CQC",
     "unit": "kip",
     "strix": "120.423",
     "ref": "120.52",
     "diffPct": -0.081,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 6 — SRSS",
     "unit": "kip",
     "strix": "86.4136",
     "ref": "86.48",
     "diffPct": -0.077,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 6 — ABS",
     "unit": "kip",
     "strix": "121.507",
     "ref": "121.61",
     "diffPct": -0.085,
     "verdict": "PASS"
    }
   ]
  },
  "TH1": {
   "id": "TH1",
   "title": "시간이력 적분 SDOF 앵커 (Newmark 평균가속도 · dt 수렴)",
   "titleEn": "SDOF anchor for THA time integration (Newmark average-acceleration, dt convergence)",
   "sourceShort": "리포 내 독립 재유도",
   "source": "Independently re-derived in this repo (not transcribed from any external table) — see benchmarks/dynamic/TH1_sdofAnchor.ts header.",
   "count": 3,
   "errorPct": -0.00169887,
   "tolerancePct": 0.01,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Peak relative displacement, zeta=5%, dt=0.003125s (finest)",
     "unit": "mm",
     "strix": "200.783",
     "ref": "200.786",
     "diffPct": -0.00169887,
     "verdict": "PASS"
    },
    {
     "quantity": "Peak relative displacement, zeta=0% (undamped), dt=0.003125s (finest)",
     "unit": "mm",
     "strix": "397.855",
     "ref": "397.875",
     "diffPct": -0.00483615,
     "verdict": "PASS"
    },
    {
     "quantity": "MDOF §2 — peak roof Ux |modal-rayleigh| relative diff %, dt=0.0125s (finest)",
     "unit": "%",
     "strix": "0.000188",
     "ref": "0",
     "diffPct": 0.000188,
     "verdict": "PASS"
    }
   ]
  }
 }
}
