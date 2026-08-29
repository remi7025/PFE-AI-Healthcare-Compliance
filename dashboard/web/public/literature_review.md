# Literature Review: AI for Healthcare Compliance and Regulations Across Countries

**Project:** AI Clinic – Interactive Dashboard on AI Healthcare Compliance  
**Supervisor:** Dr. Anuradha Kar  
**Date:** March 2026

---

## Abstract

Artificial Intelligence (AI) is transforming healthcare through diagnostics, clinical decision support, drug discovery, and patient management. However, the deployment of AI in clinical settings is governed by a complex and rapidly evolving landscape of regulations, compliance frameworks, and ethical guidelines that vary significantly across countries and regions. This literature review provides a systematic synthesis of the current regulatory landscape governing AI in healthcare, drawing on policy documents, regulatory guidelines, and peer-reviewed research across 20 countries spanning North America, Europe, Asia, the Middle East, Africa, and Oceania. The review identifies seven key thematic dimensions—data privacy and governance, clinical validation and safety, regulatory approval processes, algorithmic transparency, ethical considerations, post-market surveillance, and liability—and maps their implementation maturity across jurisdictions. Findings reveal a global trend toward risk-based regulation and comprehensive data protection, with significant disparities in enforcement capacity, AI-specific legislation, and ethical governance between advanced economies and emerging markets.

---

## 1. Introduction

### 1.1 Background

The integration of AI into healthcare represents one of the most consequential technological shifts of the 21st century. AI-based Software as a Medical Device (SaMD) now assists clinicians in radiology, pathology, ophthalmology, cardiology, and genomics, among other specialties (Topol, 2019; Rajpurkar et al., 2022). The U.S. FDA alone has authorized over 950 AI/ML-enabled medical devices as of 2025, reflecting exponential growth in the field (FDA, 2025).

However, the promise of AI in healthcare is inseparable from the challenges of ensuring patient safety, data privacy, algorithmic fairness, and regulatory compliance. Unlike traditional medical devices, AI systems can be adaptive, opaque, and dependent on training data that may embed biases—raising novel regulatory questions that existing frameworks were not designed to address (Gerke et al., 2020; Char et al., 2018).

### 1.2 Motivation

Regulatory diversity across countries creates challenges for developers seeking international market access, researchers studying AI governance, and policymakers seeking to balance innovation with protection. There is a need for structured, comparative analysis of how different jurisdictions are responding to the regulatory challenges posed by AI in healthcare.

### 1.3 Objectives

This review aims to:
1. Synthesize existing literature on AI healthcare regulation across countries
2. Identify and analyze key regulatory themes
3. Map similarities and differences across regions
4. Highlight gaps, challenges, and emerging trends
5. Inform the design of an interactive compliance dashboard

### 1.4 Methodology

A structured review was conducted using:
- **Databases:** PubMed, Scopus, IEEE Xplore, Google Scholar, SSRN
- **Regulatory Sources:** FDA, EMA, MHRA, NMPA, WHO, OECD, national regulatory agencies
- **Policy Documents:** National AI strategies, data protection laws, medical device regulations
- **Search Terms:** "AI healthcare regulation," "medical device AI compliance," "SaMD regulation," "AI ethics healthcare," "health data governance," "algorithmic transparency medicine"
- **Inclusion Criteria:** Publications from 2018–2026 addressing AI regulation, compliance, or ethics in healthcare contexts
- **Scope:** 20 countries across 6 regions

---

## 2. Regulatory Frameworks for AI Medical Devices

### 2.1 Software as a Medical Device (SaMD)

The International Medical Device Regulators Forum (IMDRF) framework, published in 2014, provides the foundational categorization for software that meets the definition of a medical device without being part of a hardware device. The IMDRF risk categorization considers the significance of the information provided by the SaMD to the healthcare decision and the state of the healthcare situation or condition (IMDRF, 2014).

Most major jurisdictions have adopted or adapted the IMDRF SaMD framework:
- **United States:** FDA regulates AI/ML-based SaMD through existing 510(k), De Novo, and PMA pathways, supplemented by the 2021 AI/ML-Based SaMD Action Plan (FDA, 2021).
- **European Union:** MDR 2017/745 classifies SaMD based on intended purpose and risk, with the EU AI Act adding a high-risk AI layer (European Parliament, 2024).
- **Japan:** PMDA administers the DASH framework for SaMD evaluation (PMDA, 2020).
- **China:** NMPA issued Guiding Principles for AI Medical Device Registration in 2021 (NMPA, 2021).

### 2.2 Risk-Based Classification

A near-universal trend is the adoption of risk-based classification, where regulatory requirements are proportional to the potential harm a device can cause:

| Region | Classification System | Classes |
|--------|----------------------|---------|
| USA | FDA risk-based | Class I, II, III |
| EU | MDR risk-based | Class I, IIa, IIb, III |
| China | NMPA three-tier | Class I, II, III |
| Canada | Health Canada | Class I, II, III, IV |
| Japan | PMDA/PMD Act | Class I, II, III, IV |
| Australia | TGA | Class I, IIa, IIb, III |

Higher-risk AI applications (e.g., autonomous diagnosis, treatment planning) face more stringent pre-market evaluation, clinical evidence requirements, and post-market obligations across all mature regulatory systems (Muehlematter et al., 2021).

### 2.3 Adaptive Algorithm Challenges

Unlike traditional devices, AI/ML algorithms can evolve as they encounter new data. This poses unique regulatory challenges:
- **FDA's Predetermined Change Control Plan (PCCP):** Allows manufacturers to pre-specify anticipated algorithm modifications and the methodology for implementing them without requiring new regulatory submissions for each change (FDA, 2023).
- **EU AI Act:** Requires AI providers to implement risk management systems that account for changes over time, with ongoing conformity obligations.
- **Emerging consensus:** Regulators increasingly recognize the need for lifecycle regulatory approaches rather than point-in-time approvals (Babic et al., 2019).

---

## 3. Data Privacy and Governance

### 3.1 The GDPR Paradigm

The EU's General Data Protection Regulation (GDPR, 2018) has become the global benchmark for health data protection, establishing principles of:
- Lawfulness, fairness, and transparency
- Purpose limitation and data minimization
- Accuracy, storage limitation, and integrity
- Accountability and governance
- Data subject rights (access, rectification, erasure, portability)
- Data Protection Impact Assessments (DPIAs)

Article 22 provides the right not to be subject to purely automated decision-making, including the right to meaningful information about the logic involved—a provision with significant implications for AI clinical decision support (Goodman & Flaxman, 2017).

### 3.2 Post-GDPR Global Wave

GDPR has catalyzed a global wave of comprehensive data protection legislation:

| Country | Law | Year | GDPR Alignment |
|---------|-----|------|----------------|
| Brazil | LGPD | 2020 | High |
| India | DPDP Act | 2023 | Moderate |
| China | PIPL | 2021 | Moderate |
| South Africa | POPIA | 2021 | High |
| Nigeria | NDPA | 2023 | Moderate |
| Kenya | Data Protection Act | 2019 | Moderate |
| Thailand | PDPA | 2022 | Moderate |
| Saudi Arabia | PDPL | 2023 | Moderate |
| UAE | Federal Decree 45 | 2021 | Moderate |
| Switzerland | nFADP | 2023 | High |

### 3.3 Health-Specific Data Provisions

Beyond general data protection, several jurisdictions have health-specific provisions:
- **USA:** HIPAA (1996) predates GDPR and governs Protected Health Information (PHI) with the Privacy Rule, Security Rule, and Breach Notification Rule. The 21st Century Cures Act promotes data interoperability (Cohen & Mello, 2018).
- **EU:** The European Health Data Space (EHDS) proposes a unified framework for primary and secondary use of health data across member states.
- **Germany:** The Health Data Use Act (2024) aims to unlock health data for research while maintaining privacy.
- **Australia:** The My Health Records Act governs the national digital health record system.

### 3.4 Cross-Border Data Transfer

AI development often requires international data flows, creating tension with data localization requirements:
- **China's** Data Security Law and PIPL impose strict cross-border transfer conditions, including security assessments for health data.
- **India's** DPDP Act allows government to restrict transfers to specific countries.
- **EU** GDPR adequacy decisions and Standard Contractual Clauses govern international transfers.

This fragmented landscape complicates multinational AI development and clinical validation efforts (Vayena et al., 2018).

---

## 4. Clinical Validation and Safety

### 4.1 Evidence Requirements

The level of clinical evidence required for AI medical devices varies but generally follows risk proportionality:
- **Analytical validation:** Does the algorithm perform as intended on representative datasets?
- **Clinical validation:** Does the algorithm provide clinically meaningful outputs?
- **Clinical utility:** Does use of the algorithm improve patient outcomes?

The FDA, Health Canada, and MHRA jointly published Good Machine Learning Practice (GMLP) guiding principles in 2021, establishing 10 foundational practices for AI/ML device development including data quality, reference standards, bias mitigation, and performance monitoring (FDA et al., 2021).

### 4.2 Real-World Evidence

There is growing regulatory acceptance of Real-World Evidence (RWE) and Real-World Data (RWD) for AI device evaluation:
- **FDA:** RWE framework integrated into regulatory decision-making
- **Germany's DiGA:** Allows provisional listing based on planned evidence generation over 12–24 months
- **UK's NICE:** Evidence Standards Framework accepts RWE for digital health technologies

This trend reflects recognition that traditional randomized controlled trial designs may not fully capture AI system performance in diverse real-world clinical settings (Wu et al., 2021).

### 4.3 Bias and Fairness in Validation

A growing body of literature highlights the risk of AI systems perpetuating or amplifying healthcare disparities through biased training data:
- Dermatology AI systems showing reduced accuracy on darker skin tones (Adamson & Smith, 2018)
- Chest X-ray AI models performing differently across demographic groups (Seyyed-Kalantari et al., 2021)
- Risk prediction algorithms systematically underestimating needs of Black patients (Obermeyer et al., 2019)

Regulators are responding with requirements for diverse and representative datasets, subgroup analysis, and bias monitoring (EU AI Act, FDA guidance).

---

## 5. Algorithmic Transparency and Explainability

### 5.1 The Transparency Spectrum

Approaches to algorithmic transparency range from fully voluntary to legally mandated:

**Mandated transparency:**
- **EU AI Act:** High-risk AI systems must maintain technical documentation, enable logging, and provide information enabling human oversight. Users must be informed they are interacting with AI.
- **GDPR Article 22:** Right to meaningful information about the logic of automated decisions.
- **China:** Algorithm Recommendation Regulations require algorithm filing and user-facing transparency.

**Voluntary/Guided transparency:**
- **USA:** FDA encourages but does not mandate explainability. NIST AI RMF addresses transparency as a voluntary governance function.
- **UK:** Pro-innovation framework relies on sector regulators to determine transparency requirements.
- **Singapore:** Model AI Governance Framework provides voluntary transparency guidance.

### 5.2 Explainable AI (XAI) in Healthcare

The tension between model performance and interpretability is particularly acute in healthcare, where clinical adoption depends on practitioner trust:
- Black-box models (deep neural networks) often outperform interpretable models but resist clinical explanation (Rudin, 2019).
- Post-hoc explanation methods (SHAP, LIME, attention maps) provide approximations but may be misleading (Ghassemi et al., 2021).
- Regulatory requirements for explainability may inadvertently favor less accurate but more interpretable models, raising safety considerations (London, 2019).

The optimal approach likely combines model-appropriate transparency with rigorous clinical validation, rather than requiring full interpretability of all AI systems (Babic et al., 2021).

---

## 6. Ethical Frameworks

### 6.1 Proliferation of AI Ethics Principles

Since 2018, there has been an explosion of AI ethics frameworks globally. Jobin et al. (2019) identified over 84 AI ethics guidelines worldwide. In healthcare specifically, the WHO published "Ethics and Governance of Artificial Intelligence for Health" (2021) establishing six guiding principles:

1. Protecting human autonomy
2. Promoting human well-being and safety
3. Ensuring transparency, explainability, and intelligibility
4. Fostering responsibility and accountability
5. Ensuring inclusiveness and equity
6. Promoting AI that is responsive and sustainable

### 6.2 From Principles to Practice

A key challenge identified in the literature is the "ethics gap"—the distance between stated principles and actual implementation:
- Most national ethics frameworks remain voluntary (Mittelstadt, 2019)
- The EU AI Act represents the most significant attempt to legislate ethical requirements
- Operationalizing principles like "fairness" and "accountability" requires technical metrics and institutional mechanisms (Morley et al., 2020)

### 6.3 Regional Ethical Perspectives

Ethical frameworks reflect cultural and philosophical contexts:
- **EU:** Rights-based approach grounded in fundamental rights and human dignity
- **USA:** Innovation-oriented with market-driven ethical governance and voluntary frameworks
- **China:** State-guided ethical development emphasizing social harmony and collective benefit
- **Africa:** Ubuntu philosophy (communal ethics) informing contextual ethical discourse (Mhlambi, 2020)
- **India:** Diverse philosophical traditions influencing inclusive and developmental AI ethics
- **Middle East:** Islamic ethical principles intersecting with modernization agendas

---

## 7. Post-Market Surveillance and Lifecycle Governance

### 7.1 The Regulatory Lifecycle

Traditional medical device regulation focused on pre-market approval. AI demands continuous lifecycle governance because:
- Algorithms can drift as patient populations and data distributions change
- Software updates may alter performance characteristics
- Real-world deployment conditions differ from validation settings

The FDA's Total Product Lifecycle (TPLC) approach and the EU AI Act's ongoing compliance requirements represent emerging models for continuous AI oversight (Hwang et al., 2019).

### 7.2 Adverse Event Reporting

Most mature jurisdictions mandate adverse event reporting:
- **USA:** MedWatch system
- **EU:** Serious incident reporting under MDR
- **UK:** Yellow Card scheme
- **Brazil:** Tecnovigilância system
- **India:** Materiovigilance Programme (MvPI)

However, AI-specific adverse events (e.g., systematic bias, silent degradation) may not fit traditional reporting categories, and under-reporting remains a challenge (Petersen et al., 2022).

---

## 8. Liability and Accountability

### 8.1 Current Liability Frameworks

AI-related medical harm creates novel liability questions:
- **Who is liable:** Developer, deploying institution, clinician, or patient?
- **How to prove causation:** Opaque algorithms resist causal analysis
- **What standard applies:** Product liability, professional negligence, or new frameworks?

Most jurisdictions currently rely on existing product liability and malpractice law, which may be inadequate for AI systems (Price et al., 2019).

### 8.2 Emerging Approaches

- **EU AI Liability Directive (proposed):** Would create a rebuttable presumption of causality for AI-caused harm, shifting the burden of proof to providers and deployers.
- **EU Product Liability Directive revision:** Would explicitly cover software and AI as products.
- **USA:** Evolving case law. No federal AI liability legislation.
- **China:** Algorithmic accountability provisions embedded in algorithm-specific regulations.

---

## 9. Comparative Regional Analysis

### 9.1 North America (USA, Canada)

**Characteristics:** Advanced, innovation-friendly, risk-based frameworks. Strong regulatory agencies (FDA, Health Canada) with deep AI evaluation capacity. International harmonization leaders (GMLP). Data protection fragmented (HIPAA sector-specific vs. PIPEDA comprehensive).

**Strengths:** Largest number of AI device approvals. Sophisticated regulatory science. Industry-regulator engagement. Real-world evidence acceptance.

**Gaps:** No comprehensive federal AI law (US). Fragmented state/provincial data privacy. AIDA (Canada) stalled in legislation.

### 9.2 Europe (EU, UK, Germany, Switzerland)

**Characteristics:** Rights-based, precautionary approach. Most comprehensive regulatory framework (EU AI Act + MDR + GDPR). Strong data protection culture. Post-Brexit UK divergence creating dual-track system.

**Strengths:** World-first comprehensive AI law. Strongest data protection. Integrated ethics-regulation approach. DiGA (Germany) innovation in digital health reimbursement.

**Gaps:** Implementation complexity. Notified Body capacity. Risk of over-regulation. Innovation pace concerns.

### 9.3 East Asia (China, Japan, South Korea)

**Characteristics:** Government-driven strategies. Rapid regulatory development. Strong technology industrial base. Variable data protection maturity.

**Strengths:** High AI device approval rates (South Korea). Algorithm-specific regulations (China). Regulatory sandboxes (Japan). Strong government investment.

**Gaps:** Data localization barriers (China). Cross-border harmonization challenges. Privacy-surveillance tensions (China).

### 9.4 South/Southeast Asia (India, Thailand, Singapore)

**Characteristics:** Diverse maturity levels. Singapore as governance leader. India emerging with new frameworks. Thailand developing capacity.

**Strengths:** Singapore's AI Verify testing framework. India's digital health infrastructure (ABDM). Thailand's medical tourism driving adoption.

**Gaps:** Regulatory capacity constraints. Infrastructure gaps. Limited AI-specific device guidance.

### 9.5 Middle East (Saudi Arabia, UAE, Israel)

**Characteristics:** Ambitious AI strategies with massive investment. Israel as innovation hub. Gulf states rapidly building frameworks.

**Strengths:** Israel's unique health data infrastructure. Gulf state AI investment. UAE first AI minister globally.

**Gaps:** Regulatory maturity lagging ambitions. Domestic expertise building. Framework implementation.

### 9.6 Africa (South Africa, Nigeria, Kenya)

**Characteristics:** Earliest stages of AI healthcare regulation. Strong mobile health innovation. Data protection laws preceding AI-specific governance.

**Strengths:** POPIA (South Africa) and NDPA (Nigeria) as comprehensive data protection. Mobile health innovation culture. Leapfrogging potential.

**Gaps:** Severe regulatory capacity constraints. Infrastructure limitations. Brain drain. Basic healthcare access competes with innovation priorities.

---

## 10. Global Trends and Future Directions

### 10.1 Convergence Trends
1. **Risk-based SaMD classification** is now near-universal among mature regulators
2. **Comprehensive data protection** legislation continues to spread globally, generally modeled on GDPR
3. **International harmonization** through IMDRF, WHO guidance, and bilateral cooperation (GMLP) is accelerating
4. **Ethical frameworks** are transitioning from voluntary principles to legally binding requirements

### 10.2 Emerging Challenges
1. **Foundation models and generative AI** in healthcare create new regulatory questions not addressed by current SaMD frameworks
2. **Continuous learning systems** require lifecycle governance approaches that most regulators are still developing
3. **Global South** faces capacity gaps that risk creating a "regulatory divide" in AI healthcare access
4. **Cross-border data flows** remain contentious, with data localization trends potentially fragmenting AI development

### 10.3 Recommendations
1. **Strengthen international harmonization** through expanded IMDRF and WHO coordination
2. **Build regulatory capacity** in developing countries through technical assistance and knowledge sharing
3. **Develop AI-specific** clinical evidence methodologies that balance rigor with innovation speed
4. **Operationalize ethical principles** through concrete technical standards and assessment tools
5. **Address liability frameworks** proactively before AI-related harm cases proliferate

## 10.4 AI Use Cases in Clinical, Hospital, and Public Health Workflows (Current Trends)
Across the literature, AI healthcare adoption is not limited to one clinical specialty. Instead, AI is increasingly used as software that supports (or automates parts of) decisions in real-world clinical pathways.

1. **Radiology & imaging diagnostics**: AI is used for image triage, detection, and decision support. Compliance emphasis typically centers on clinical validation across representative populations, transparency for clinicians, and continuous monitoring after deployment.
2. **Pathology & digital pathology**: AI supports slide interpretation and workflow acceleration. Because pathology outcomes can depend heavily on data quality and labeling, evidence quality, governance of sensitive data, and lifecycle surveillance are recurring themes.
3. **Genomic analysis & precision medicine**: Genomic interpretation and risk stratification increasingly support personalized care. The review repeatedly flags privacy, data governance, and dataset representativeness as critical constraints—especially where cross-border sharing is needed for validation.
4. **Drug discovery & clinical development support**: AI supports target identification, candidate ranking, and evidence-generation workflows that influence trial design and safety documentation. Regulatory attention grows around how evidence is produced, documented, and audited.
5. **Hospital and clinic deployment of clinical decision support**: Health systems adopt AI clinical decision support as part of electronic workflows. A recurring theme is the shift from “one-time approval” to **Total Product Lifecycle** thinking, including post-market monitoring and governance for performance changes over time.
6. **AI for public health**: The review frames governance as extending beyond the individual patient when AI supports surveillance, risk scoring, and outbreak support. Accountability mechanisms and ethics-in-design are highlighted to protect human rights and enable redress.
7. **Foundation and generative AI**: The emergence of foundation models introduces governance challenges that go beyond classic SaMD assumptions, including model re-use, updates, and broader intended-use definitions that must be managed throughout the lifecycle.

---

## 11. Conclusion

The global regulatory landscape for AI in healthcare is characterized by rapid evolution, converging principles, and persistent diversity. While risk-based classification, comprehensive data protection, and ethical governance have emerged as near-universal themes, significant disparities exist in regulatory maturity, enforcement capacity, and AI-specific legislation between advanced economies and developing nations. The EU AI Act represents a watershed moment in AI regulation, and its implementation will influence regulatory approaches globally. Success in governing AI healthcare will depend on balancing innovation incentives with safety protections, strengthening international harmonization, and ensuring that regulatory frameworks are adaptive enough to keep pace with the technology they govern.

---

## References

1. Adamson, A. S., & Smith, A. (2018). Machine Learning and Health Care Disparities in Dermatology. *JAMA Dermatology*, 154(11), 1247–1248.
2. Babic, B., Gerke, S., Evgeniou, T., & Cohen, I. G. (2019). Algorithms on Regulatory Lockdown in Medicine. *Science*, 366(6470), 1202–1204.
3. Babic, B., Gerke, S., Evgeniou, T., & Cohen, I. G. (2021). Direct-to-Consumer Medical Machine Learning and Artificial Intelligence Applications. *Nature Medicine*, 27, 17–20.
4. Char, D. S., Shah, N. H., & Magnus, D. (2018). Implementing Machine Learning in Health Care — Addressing Ethical Challenges. *New England Journal of Medicine*, 378(11), 981–983.
5. Cohen, I. G., & Mello, M. M. (2018). HIPAA and Protecting Health Information in the 21st Century. *JAMA*, 320(3), 231–232.
6. European Parliament and Council. (2024). Regulation (EU) 2024/1689 — Artificial Intelligence Act.
7. FDA. (2021). Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) Action Plan.
8. FDA. (2023). Marketing Submission Recommendations for a Predetermined Change Control Plan for AI/ML-Enabled Device Software Functions.
9. FDA, Health Canada, & MHRA. (2021). Good Machine Learning Practice for Medical Device Development: Guiding Principles.
10. Gerke, S., Minssen, T., & Cohen, I. G. (2020). Ethical and Legal Challenges of Artificial Intelligence-Driven Healthcare. *Artificial Intelligence in Healthcare*, 295–336.
11. Ghassemi, M., Oakden-Rayner, L., & Beam, A. L. (2021). The False Hope of Current Approaches to Explainable AI in Health Care. *The Lancet Digital Health*, 3(11), e745–e750.
12. Goodman, B., & Flaxman, S. (2017). European Union Regulations on Algorithmic Decision-Making and a "Right to Explanation." *AI Magazine*, 38(3), 50–57.
13. Hwang, T. J., Kesselheim, A. S., & Vokinger, K. N. (2019). Lifecycle Regulation of AI- and ML-Based Software Devices in Medicine. *JAMA*, 322(23), 2285–2286.
14. IMDRF. (2014). Software as a Medical Device: Possible Framework for Risk Categorization and Corresponding Considerations.
15. Jobin, A., Ienca, M., & Vayena, E. (2019). The Global Landscape of AI Ethics Guidelines. *Nature Machine Intelligence*, 1(9), 389–399.
16. London, A. J. (2019). Artificial Intelligence and Black-Box Medical Decisions: Accuracy versus Explainability. *Hastings Center Report*, 49(1), 15–21.
17. Mhlambi, S. (2020). From Rationality to Relationality: Ubuntu as an Ethical and Human Rights Framework for Artificial Intelligence Governance. *Carr Center for Human Rights Policy Discussion Paper*.
18. Mittelstadt, B. (2019). Principles Alone Cannot Guarantee Ethical AI. *Nature Machine Intelligence*, 1(11), 501–507.
19. Morley, J., Floridi, L., Kinsey, L., & Elhalal, A. (2020). From What to How: An Initial Review of Publicly Available AI Ethics Tools, Methods and Research. *Science and Engineering Ethics*, 26, 2141–2168.
20. Muehlematter, U. J., Daniore, P., & Vokinger, K. N. (2021). Approval of Artificial Intelligence and Machine Learning-Based Medical Devices in the USA and Europe (2015–20). *The Lancet Digital Health*, 3(3), e195–e203.
21. NMPA. (2021). Guiding Principles for Registration Review of AI Medical Device Software.
22. Obermeyer, Z., Powers, B., Vogeli, C., & Mullainathan, S. (2019). Dissecting Racial Bias in an Algorithm Used to Manage the Health of Populations. *Science*, 366(6464), 447–453.
23. Petersen, C., Smith, J., Freimuth, R. R., et al. (2022). Recommendations for the Safe, Effective Use of Adaptive CDS in the US Healthcare System. *JAMIA*, 29(4), 677–684.
24. PMDA. (2020). DASH for SaMD: Regulatory Framework.
25. Price, W. N., Gerke, S., & Cohen, I. G. (2019). Potential Liability for Physicians Using Artificial Intelligence. *JAMA*, 322(18), 1765–1766.
26. Rajpurkar, P., Chen, E., Banerjee, O., & Topol, E. J. (2022). AI in Health and Medicine. *Nature Medicine*, 28, 31–38.
27. Rudin, C. (2019). Stop Explaining Black Box Machine Learning Models for High Stakes Decisions and Use Interpretable Models Instead. *Nature Machine Intelligence*, 1(5), 206–215.
28. Seyyed-Kalantari, L., Zhang, H., McDermott, M. B. A., Chen, I. Y., & Ghassemi, M. (2021). Underdiagnosis Bias of Artificial Intelligence Algorithms Applied to Chest Radiographs in Under-Served Patient Populations. *Nature Medicine*, 27, 2176–2182.
29. Topol, E. J. (2019). High-Performance Medicine: The Convergence of Human and Artificial Intelligence. *Nature Medicine*, 25, 44–56.
30. Vayena, E., Blasimme, A., & Cohen, I. G. (2018). Machine Learning in Medicine: Addressing Ethical Challenges. *PLoS Medicine*, 15(11), e1002689.
31. WHO. (2021). Ethics and Governance of Artificial Intelligence for Health. Geneva: World Health Organization.
32. Wu, E., Wu, K., Daneshjou, R., et al. (2021). How Medical AI Devices Are Evaluated: Limitations and Recommendations from an Analysis of FDA Approvals. *Nature Medicine*, 27, 582–584.
