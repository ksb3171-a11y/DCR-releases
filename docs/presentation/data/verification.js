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
   "title": "자체 안정화 파라미터 민감도 (벽 모드주기)",
   "titleEn": "Custom stabilization parameter sensitivity (wall modal periods)",
   "sourceShort": "내부 V&V 합격기준",
   "source": "Internal V&V acceptance criterion. The custom artificial stabilizers (-drillingStab, -rotFloor) exist only to remove spurious zero-energy rotational modes; a valid stabilization must leave physical response invariant. Acceptance: the mass-dominant modal periods change by less than the tolerance as each stabilizer is swept over two orders of magnitude about its production value.",
   "count": 4,
   "errorPct": 0.19,
   "tolerancePct": 0.5,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Membrane · mode 1 (X 68%)",
     "unit": "s",
     "strix": "0.0505095",
     "ref": "0.0505295",
     "diffPct": 0.0394,
     "verdict": "PASS"
    },
    {
     "quantity": "Membrane · mode 3 (X 6%) governing",
     "unit": "s",
     "strix": "0.00467991",
     "ref": "0.00468882",
     "diffPct": 0.19,
     "verdict": "PASS"
    },
    {
     "quantity": "Plate · mode 1 (Y 66%)",
     "unit": "s",
     "strix": "0.714623",
     "ref": "0.714754",
     "diffPct": 0.0183,
     "verdict": "PASS"
    },
    {
     "quantity": "Plate · mode 4 (X 68%) governing",
     "unit": "s",
     "strix": "0.0505095",
     "ref": "0.0505295",
     "diffPct": 0.0394,
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
   "errorPct": -0.035217,
   "tolerancePct": 0.1,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Uz (no tension)",
     "unit": "in",
     "strix": "-1.04161",
     "ref": "-1.04167",
     "diffPct": 0.005039,
     "verdict": "PASS"
    },
    {
     "quantity": "My (no tension)",
     "unit": "kip-in",
     "strix": "22.499",
     "ref": "22.5",
     "diffPct": -0.004274,
     "verdict": "PASS"
    },
    {
     "quantity": "Uz (w/ tension)",
     "unit": "in",
     "strix": "-0.543496",
     "ref": "-0.543305",
     "diffPct": -0.035217,
     "verdict": "PASS"
    },
    {
     "quantity": "My (w/ tension)",
     "unit": "kip-in",
     "strix": "11.4937",
     "ref": "11.4981",
     "diffPct": -0.038374,
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
   "errorPct": 0.0002,
   "tolerancePct": 1,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Tip deflection u_z",
     "unit": "mm",
     "strix": "-0.107865",
     "ref": "-0.107865",
     "diffPct": 0.0002,
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
   "source": "Self-designed closed form (no CSI/NAFEMS published example fits — CSI Group 6 Link catalog is dynamic-only, see devplan §12.3 SB12 note). Independent reference = exact linear-algebra congruence transform K_global = (C*T)^T * diag(k_local) * (C*T), solved by an independent Gaussian-elimination linear solve. T = blockdiag(R,R), R = MIDAS Beta-Angle local frame re-derived from scratch (benchmarks/element/SB12_elasticLink.ts, no import from production TclBuilder code) -- this is the transform under test. C = OpenSees TwoNodeLink's own shear/rotation basic-deformation coupling (TwoNodeLink.cpp setTranLocalBasic(), confirmed against OpenSees/OpenSees GitHub source; shearDist fixed 0.5 as DCR always emits) -- real, documented, non-DCR element physics, included only so the closed form matches the engine, not itself under test. Not a FEM discretization/convergence problem -- exact linear algebra, so near-machine-precision agreement with the simulated result is expected.",
   "count": 12,
   "errorPct": 0.00008086,
   "tolerancePct": 0.01,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Oblique Ux",
     "unit": "mm",
     "strix": "0.152961",
     "ref": "0.152961",
     "diffPct": 0.00008086,
     "verdict": "PASS"
    },
    {
     "quantity": "Oblique Uy",
     "unit": "mm",
     "strix": "-0.322861",
     "ref": "-0.322861",
     "diffPct": 0.00009459,
     "verdict": "PASS"
    },
    {
     "quantity": "Oblique Uz",
     "unit": "mm",
     "strix": "0.434406",
     "ref": "0.434406",
     "diffPct": -0.00006821,
     "verdict": "PASS"
    },
    {
     "quantity": "Oblique Rx",
     "unit": "rad",
     "strix": "0.000353789",
     "ref": "0.000353789",
     "diffPct": 0.00008411,
     "verdict": "PASS"
    },
    {
     "quantity": "Oblique Ry",
     "unit": "rad",
     "strix": "-0.000237923",
     "ref": "-0.000237923",
     "diffPct": -0.00002007,
     "verdict": "PASS"
    },
    {
     "quantity": "Oblique Rz",
     "unit": "rad",
     "strix": "-4.2642e-5",
     "ref": "-4.2642e-5",
     "diffPct": 0.00006371,
     "verdict": "PASS"
    },
    {
     "quantity": "NearVert Ux",
     "unit": "mm",
     "strix": "-0.12171",
     "ref": "-0.12171",
     "diffPct": 0.00027024,
     "verdict": "PASS"
    },
    {
     "quantity": "NearVert Uy",
     "unit": "mm",
     "strix": "0.426039",
     "ref": "0.426039",
     "diffPct": 0.00008999,
     "verdict": "PASS"
    },
    {
     "quantity": "NearVert Uz",
     "unit": "mm",
     "strix": "-0.0153195",
     "ref": "-0.0153195",
     "diffPct": 0.00006334,
     "verdict": "PASS"
    },
    {
     "quantity": "NearVert Rx",
     "unit": "rad",
     "strix": "-0.000295859",
     "ref": "-0.000295859",
     "diffPct": 0.00013526,
     "verdict": "PASS"
    },
    {
     "quantity": "NearVert Ry",
     "unit": "rad",
     "strix": "-2.0239e-5",
     "ref": "-2.0239e-5",
     "diffPct": -0.0000487,
     "verdict": "PASS"
    },
    {
     "quantity": "NearVert Rz",
     "unit": "rad",
     "strix": "-0.000145984",
     "ref": "-0.000145984",
     "diffPct": -0.00006456,
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
   "errorPct": -1.994,
   "tolerancePct": 3,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Tangential edge stress sigma_yy at D",
     "unit": "MPa",
     "strix": "90.8514",
     "ref": "92.7",
     "diffPct": -1.994,
     "verdict": "PASS"
    }
   ]
  },
  "SB3": {
   "id": "SB3",
   "title": "Cook's membrane — 왜곡메쉬 면내휨",
   "titleEn": "Cook's membrane (skew panel, in-plane bending on a distorted mesh)",
   "sourceShort": "Cook 왜곡메쉬 벤치마크",
   "source": "Cook's membrane, a standard finite-element distortion benchmark (R.D. Cook, 1974). No closed-form solution; the reference is the fine-mesh converged tip displacement at the loaded-edge midpoint Q, PLANE STRESS, E=1, nu=1/3, unit shear resultant: normalized u_Q*E*t/P = 23.91 (literature band 23.90-23.96). The plane-strain counterpart is 21.52 (Sevilla et al. / locking-free FCFV report 21.42 converged); DCR walls are plane stress (membrane section), and 21.42/(1-nu^2) ~= 23.9 confirms the plane-stress mid-edge value.",
   "count": 1,
   "errorPct": 0.2,
   "tolerancePct": 3,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Normalized tip displacement u_Q*E*t/P (mid loaded edge)",
     "unit": "norm.",
     "strix": "23.9578",
     "ref": "23.91",
     "diffPct": 0.2,
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
   "errorPct": -0.621,
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
     "diffPct": -0.002,
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
     "diffPct": -0.621,
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
     "strix": "0.004112",
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
   "errorPct": 0.000057,
   "tolerancePct": 0.05,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Center deflection Uz",
     "unit": "in",
     "strix": "-0.0893327",
     "ref": "-0.0893327",
     "diffPct": 0.000057,
     "verdict": "PASS"
    },
    {
     "quantity": "Center moment My",
     "unit": "kip-in",
     "strix": "17697.9",
     "ref": "17698",
     "diffPct": -0.000747,
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
   "errorPct": 0.017469,
   "tolerancePct": 0.05,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Natural frequency f₁",
     "unit": "Hz",
     "strix": "102.149",
     "ref": "102.149",
     "diffPct": -0.000039,
     "verdict": "PASS"
    },
    {
     "quantity": "Natural frequency f₂",
     "unit": "Hz",
     "strix": "364.057",
     "ref": "364.059",
     "diffPct": -0.000679,
     "verdict": "PASS"
    },
    {
     "quantity": "Natural frequency f₃",
     "unit": "Hz",
     "strix": "706.672",
     "ref": "706.69",
     "diffPct": -0.002599,
     "verdict": "PASS"
    },
    {
     "quantity": "Natural frequency f₄",
     "unit": "Hz",
     "strix": "1078.04",
     "ref": "1078.1",
     "diffPct": -0.006033,
     "verdict": "PASS"
    },
    {
     "quantity": "Natural frequency f₅",
     "unit": "Hz",
     "strix": "1455.64",
     "ref": "1455.8",
     "diffPct": -0.011021,
     "verdict": "PASS"
    },
    {
     "quantity": "Natural frequency f₆",
     "unit": "Hz",
     "strix": "1831.7",
     "ref": "1832.02",
     "diffPct": -0.017469,
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
   "errorPct": 0.010571,
   "tolerancePct": 0.05,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Midspan deflection Uz — combined (axial+bending)",
     "unit": "mm",
     "strix": "-69.3655",
     "ref": "-69.3728",
     "diffPct": 0.010571,
     "verdict": "PASS"
    },
    {
     "quantity": "Midspan deflection Uz — bending only (area x1e5)",
     "unit": "mm",
     "strix": "-69.1723",
     "ref": "-69.1797",
     "diffPct": 0.010674,
     "verdict": "PASS"
    },
    {
     "quantity": "Midspan deflection Uz — axial only (Iz x1e7)",
     "unit": "mm",
     "strix": "-0.193176",
     "ref": "-0.193149",
     "diffPct": -0.01393,
     "verdict": "PASS"
    }
   ]
  },
  "SH1": {
   "id": "SH1",
   "title": "자체 P-M-M 기둥힌지 (DcrPMMHinge3d) 요소역학",
   "titleEn": "DcrPMMHinge3d custom P-M-M column hinge — element-mechanics defense",
   "sourceShort": "자체 유도 (제3자 공개예제 부재)",
   "source": "No third-party published example exists for this DCR-original element (unlike SP1/CSI 1-026) — devplan §12.11 honesty split: (a) the uniaxial FEMA-356/ASCE-41 4-branch backbone (elastic/hardening/post-capping softening/residual) and (b) the Fritsch & Carlson (1980, SIAM J. Numer. Anal. 17(2):238-246) monotone-cubic capacity interpolation are PUBLISHED external models — re-derived from scratch in benchmarks/nonlinear/SH1_pmmHingeBackbone.ts, never by reading DcrPMMHinge3d.cpp. (c) The biaxial Bresler-type capacity-envelope projection (independent per-direction backbones + closed-form radial scale-back beta=min(1,1/Phi)) is DCR's own §5.9 design choice — the interaction SURFACE FORM (normalized power-law) is standard/published, but this specific combination algorithm has no external authority to validate against; quantities C_* verify the implementation is self-consistent with DCR's own stated specification, not that the specification itself reproduces a third-party benchmark.",
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
     "strix": "0.589538",
     "ref": "0.589541",
     "diffPct": -0.0005,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "5.52693",
     "ref": "5.52695",
     "diffPct": -0.0004,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "16.5878",
     "ref": "16.5878",
     "diffPct": -0.0002,
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
   "source": "Independent reference: the SAME 42-DOF (six per node) 3-D frame assembled from first principles with the identical pipe Timoshenko element (local 12×12 with shear parameter φ = 12EI/GAsL², Avy=Avz=0.9A, torsion GJ/L, axial EA/L, rotated to global) and the identical eps=1e-8 rotational-mass floor, then solved with the DENSE generalised eigensolver scipy.linalg.eigh — a separate implementation and a different solver from STRIX's OpenSees FE assembly + sparse eigsh. Agreement to machine precision across all 24 modes verifies the eigensolver on a fully 3-D coupled structure with explicit nodal masses. The classical benchmark is Problem No. 1 of the ASME 1972 Program Verification & Qualification Library (CSI SAP2000 Verification Example 1-023); its published 'independent' column (Peterson 1981 / DeSalvo & Swanson 1977) is Guyan-reduced 42→24 DOF and so differs from the full solution by up to ±3% — hence it is used only as a secondary physical bracket, not the primary target.",
   "count": 8,
   "errorPct": 0.0014,
   "tolerancePct": 0.05,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "506339",
     "ref": "506332",
     "diffPct": 0.0014,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "553804",
     "ref": "553811",
     "diffPct": -0.0011,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "771531",
     "ref": "771530",
     "diffPct": 0.0001,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "1.9049e+6",
     "ref": "1.9049e+6",
     "diffPct": 0.0006,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "6.6926e+6",
     "ref": "6.6925e+6",
     "diffPct": 0.0003,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "7.4352e+6",
     "ref": "7.4352e+6",
     "diffPct": 0.0002,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "8.5056e+6",
     "ref": "8.5056e+6",
     "diffPct": 0.0002,
     "verdict": "PASS"
    },
    {
     "quantity": "Eigenvalue ω²",
     "unit": "rad^2/s^2",
     "strix": "1.2767e+7",
     "ref": "1.2767e+7",
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
   "errorPct": 0.00017296955481079692,
   "tolerancePct": 1,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Tip Uz at Point1 (P=My/L, elastic boundary)",
     "unit": "mm",
     "strix": "5",
     "ref": "5",
     "diffPct": -0.000007053399126863812,
     "verdict": "PASS"
    },
    {
     "quantity": "Base hinge rotation at Point1",
     "unit": "rad",
     "strix": "0.00768032",
     "ref": "0.00768032",
     "diffPct": 0.00005302337698475143,
     "verdict": "PASS"
    },
    {
     "quantity": "Tip Uz at Point2 (P=Mc/L, hardening peak)",
     "unit": "mm",
     "strix": "24.9983",
     "ref": "24.9983",
     "diffPct": 0.00017296955481079692,
     "verdict": "PASS"
    },
    {
     "quantity": "Base hinge rotation at Point2 (= thetaC)",
     "unit": "rad",
     "strix": "0.0403531",
     "ref": "0.0403531",
     "diffPct": -0.00005073244730166147,
     "verdict": "PASS"
    },
    {
     "quantity": "Uz self-consistency across ALL recorded pre-peak (ascending) steps",
     "unit": "%",
     "strix": "-0.000769162",
     "ref": "0",
     "diffPct": -0.0007691621465968322,
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
   "errorPct": 0.219,
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
     "strix": "7.579",
     "ref": "7.566",
     "diffPct": 0.165,
     "verdict": "PASS"
    },
    {
     "quantity": "Displacement Ux — joint 3 (roof)",
     "unit": "in",
     "strix": "18.844",
     "ref": "18.81",
     "diffPct": 0.183,
     "verdict": "PASS"
    },
    {
     "quantity": "Moment — story-1 column base (jt 1)",
     "unit": "kip·in",
     "strix": "12640",
     "ref": "12624",
     "diffPct": 0.126,
     "verdict": "PASS"
    },
    {
     "quantity": "Moment — story-2 column base (jt 2)",
     "unit": "kip·in",
     "strix": "6025",
     "ref": "6024",
     "diffPct": 0.016,
     "verdict": "PASS"
    },
    {
     "quantity": "Moment — floor-1 beam at column (jt 2)",
     "unit": "kip·in",
     "strix": "9813",
     "ref": "9792",
     "diffPct": 0.219,
     "verdict": "PASS"
    },
    {
     "quantity": "Moment — roof beam at column (jt 3)",
     "unit": "kip·in",
     "strix": "5224",
     "ref": "5220",
     "diffPct": 0.079,
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
   "errorPct": 0.069,
   "tolerancePct": 1,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Period — mode 1",
     "unit": "s",
     "strix": "0.22705",
     "ref": "0.2271",
     "diffPct": -0.021,
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
     "strix": "0.02011",
     "ref": "0.02012",
     "diffPct": -0.05,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Ux — CQC",
     "unit": "ft",
     "strix": "0.02013",
     "ref": "0.02014",
     "diffPct": -0.029,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Ux — ABS",
     "unit": "ft",
     "strix": "0.02049",
     "ref": "0.0205",
     "diffPct": -0.045,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Ux — NRC 10%",
     "unit": "ft",
     "strix": "0.02015",
     "ref": "0.02016",
     "diffPct": -0.069,
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
   "errorPct": 0.108,
   "tolerancePct": 1.5,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Frequency — mode 1",
     "unit": "Hz",
     "strix": "3.05908",
     "ref": "3.0592",
     "diffPct": -0.004,
     "verdict": "PASS"
    },
    {
     "quantity": "Frequency — mode 2",
     "unit": "Hz",
     "strix": "3.11867",
     "ref": "3.1188",
     "diffPct": -0.004,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Ux — CQC",
     "unit": "in",
     "strix": "1.03241",
     "ref": "1.0329",
     "diffPct": -0.048,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Ux — SRSS",
     "unit": "in",
     "strix": "0.736835",
     "ref": "0.7372",
     "diffPct": -0.05,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Ux — ABS",
     "unit": "in",
     "strix": "1.04181",
     "ref": "1.0423",
     "diffPct": -0.047,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Uy — CQC",
     "unit": "in",
     "strix": "0.141363",
     "ref": "0.1414",
     "diffPct": -0.026,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Uy — SRSS",
     "unit": "in",
     "strix": "0.736835",
     "ref": "0.7372",
     "diffPct": -0.05,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Uy — ABS",
     "unit": "in",
     "strix": "1.04181",
     "ref": "1.0423",
     "diffPct": -0.047,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Rz — CQC",
     "unit": "rad",
     "strix": "0.000251727",
     "ref": "0.000252",
     "diffPct": -0.108,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Rz — SRSS",
     "unit": "rad",
     "strix": "0.000251727",
     "ref": "0.000252",
     "diffPct": -0.108,
     "verdict": "PASS"
    },
    {
     "quantity": "Roof CM Rz — ABS",
     "unit": "rad",
     "strix": "0.000251727",
     "ref": "0.000252",
     "diffPct": -0.108,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 1 — CQC",
     "unit": "kip",
     "strix": "279.348",
     "ref": "279.48",
     "diffPct": -0.047,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 1 — SRSS",
     "unit": "kip",
     "strix": "200.455",
     "ref": "200.55",
     "diffPct": -0.047,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 1 — ABS",
     "unit": "kip",
     "strix": "281.862",
     "ref": "281.99",
     "diffPct": -0.045,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 4 — CQC",
     "unit": "kip",
     "strix": "194.409",
     "ref": "194.5",
     "diffPct": -0.047,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 4 — SRSS",
     "unit": "kip",
     "strix": "139.505",
     "ref": "139.57",
     "diffPct": -0.047,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 4 — ABS",
     "unit": "kip",
     "strix": "196.159",
     "ref": "196.25",
     "diffPct": -0.046,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 6 — CQC",
     "unit": "kip",
     "strix": "120.464",
     "ref": "120.52",
     "diffPct": -0.046,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 6 — SRSS",
     "unit": "kip",
     "strix": "86.4431",
     "ref": "86.48",
     "diffPct": -0.043,
     "verdict": "PASS"
    },
    {
     "quantity": "Axial elm 6 — ABS",
     "unit": "kip",
     "strix": "121.548",
     "ref": "121.61",
     "diffPct": -0.051,
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
   "errorPct": -0.00159813,
   "tolerancePct": 0.01,
   "verdict": "PASS",
   "computed": [
    {
     "quantity": "Peak relative displacement, zeta=5%, dt=0.003125s (finest)",
     "unit": "mm",
     "strix": "200.783",
     "ref": "200.786",
     "diffPct": -0.00159813,
     "verdict": "PASS"
    },
    {
     "quantity": "Peak relative displacement, zeta=0% (undamped), dt=0.003125s (finest)",
     "unit": "mm",
     "strix": "397.855",
     "ref": "397.875",
     "diffPct": -0.00491982,
     "verdict": "PASS"
    },
    {
     "quantity": "MDOF §2 — peak roof Ux |modal-rayleigh| relative diff %, dt=0.0125s (finest)",
     "unit": "%",
     "strix": "0.000259",
     "ref": "0",
     "diffPct": 0.000259,
     "verdict": "PASS"
    }
   ]
  }
 }
}
