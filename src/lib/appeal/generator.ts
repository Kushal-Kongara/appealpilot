import { DenialInfo, AppealPackage } from "../types";
import { generateWithAI } from "../clients/ai-provider";

export async function generateAppealPackage(
  parsed: DenialInfo,
  researchSummary: string,
  denialText: string
): Promise<AppealPackage> {
  const aiPrompt = `You are an expert insurance appeal specialist. Generate a complete appeal package as valid JSON.

Denial letter: "${denialText.slice(0, 500)}"
Insurer: ${parsed.insuranceCompany}
Denial reason: ${parsed.denialReason}
Treatment: ${parsed.treatment}
Deadline: ${parsed.appealDeadline}
Research: ${researchSummary.slice(0, 400)}

Return ONLY valid JSON with these exact keys:
{
  "summary": "2-3 sentence plain-English summary of the denial and appeal strategy",
  "appealLetter": "Complete formal appeal letter with [PLACEHOLDERS] for personal info",
  "emailDraft": "Complete email draft ready to send",
  "phoneScript": "Detailed phone call script with opening, key points, escalation, and closing",
  "documentChecklist": ["item1", "item2", ...],
  "nextSteps": ["step1", "step2", ...]
}`;

  const aiResult = await generateWithAI(aiPrompt);
  if (aiResult) {
    try {
      const jsonMatch = aiResult.match(/\{[\s\S]+\}/);
      if (jsonMatch) {
        const parsed2 = JSON.parse(jsonMatch[0]) as AppealPackage;
        if (parsed2.summary && parsed2.appealLetter) return parsed2;
      }
    } catch {
      // fall through to templates
    }
  }

  return buildFromTemplates(parsed, researchSummary);
}

function buildFromTemplates(
  parsed: DenialInfo,
  _research: string
): AppealPackage {
  const { insuranceCompany, denialReason, appealDeadline, treatment, requiredDocuments } = parsed;
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const summary = `Your claim for ${treatment} was denied by ${insuranceCompany} citing "${denialReason}." You have ${appealDeadline} to file a formal appeal — this package contains a complete appeal letter, email draft, phone script, and document checklist to maximize your chances of overturning this decision.`;

  const docList = requiredDocuments.map((d, i) => `${i + 1}. ${d}`).join("\n");

  const appealLetter = `${today}

Appeals Department
${insuranceCompany}

RE: FORMAL APPEAL — DENIAL OF COVERAGE FOR ${treatment.toUpperCase()}
Member ID: [YOUR MEMBER ID]
Claim Number: [YOUR CLAIM NUMBER]
Date of Denial: [DENIAL DATE ON YOUR LETTER]

To Whom It May Concern:

I am writing to formally appeal the denial of coverage for ${treatment}. Your denial notice cited "${denialReason}" as the basis for this decision. I respectfully disagree with this determination and request a full, fair, and independent review of my case.

MEDICAL NECESSITY

My treating physician has determined that ${treatment} is medically necessary based on:

• Clinical evidence and peer-reviewed literature supporting this treatment for my diagnosis
• My complete medical history and documented response to prior therapies
• Current clinical practice guidelines established by recognized medical authorities
• A thorough risk-benefit analysis showing this treatment is the most appropriate course of care

The denial on grounds of "${denialReason}" is inconsistent with the medical evidence supporting my case and contradicts my physician's professional medical judgment.

APPEAL RIGHTS

Under the Affordable Care Act and applicable state law, I have the right to appeal this coverage decision. I am entitled to:

• A full review of all clinical criteria used in the denial determination
• Access to the specific clinical guidelines cited in the denial
• An External Independent Review if this internal appeal is denied
• An expedited review if my medical condition requires urgent treatment

REQUESTED ACTION

I respectfully request that ${insuranceCompany} overturn this denial and approve coverage for ${treatment}. Enclosed are all required documents supporting the medical necessity of this treatment.

If this appeal is upheld, please provide in writing:
• The exact clinical criteria applied and why my case does not meet them
• The name and specialty of the reviewing physician
• Complete instructions for requesting an External Independent Review (IRO)

I expect a written response within 30 days as required by law. For urgent medical situations, I request an expedited review within 72 hours.

Sincerely,

[YOUR FULL NAME]
[YOUR ADDRESS]
[YOUR CITY, STATE, ZIP]
[YOUR PHONE NUMBER]
[YOUR EMAIL ADDRESS]

Enclosures:
${docList}`;

  const emailDraft = `To: appeals@${insuranceCompany.toLowerCase().replace(/\s+/g, "")}insurance.com
Subject: Formal Appeal — Denial of Coverage for ${treatment} | Member ID: [YOUR ID] | Claim #: [CLAIM #]

Dear ${insuranceCompany} Appeals Team,

I am submitting this formal appeal regarding the denial of coverage for ${treatment} (denial date: [DENIAL DATE]).

DENIAL INFORMATION
• Denial Reason Cited: ${denialReason}
• Appeal Deadline: ${appealDeadline}
• Member ID: [YOUR MEMBER ID]
• Claim Number: [YOUR CLAIM NUMBER]

DOCUMENTS ATTACHED
${requiredDocuments.map((d, i) => `${i + 1}. ${d}`).join("\n")}
${requiredDocuments.length + 1}. Formal appeal letter (attached)
${requiredDocuments.length + 2}. Letter of medical necessity from treating physician

My physician has confirmed that ${treatment} is medically necessary for my condition. The denial on grounds of "${denialReason}" does not align with the clinical evidence in my case.

I request:
1. Confirmation of receipt of this appeal
2. An expedited review given the ongoing nature of my condition
3. Written notification of the decision within 30 days

Please do not hesitate to contact me at [YOUR PHONE] or [YOUR EMAIL] if additional information is needed.

Thank you for your prompt attention.

Best regards,
[YOUR FULL NAME]
Member ID: [YOUR MEMBER ID]
Date of Birth: [YOUR DOB]
Phone: [YOUR PHONE NUMBER]`;

  const phoneScript = `──────────────────────────────────────────
PHONE CALL SCRIPT — ${insuranceCompany} Appeals
──────────────────────────────────────────

BEFORE YOU CALL
□ Denial letter in hand
□ Member ID card ready
□ Claim number from denial letter
□ Pen and paper to take notes
□ Quiet space — calls can take 20–45 minutes
→ Call the Member Services number on the back of your insurance card
→ Ask specifically for: "Appeals Department"

──────────────────────────────────────────
OPENING
──────────────────────────────────────────
"Hello, my name is [YOUR NAME]. My Member ID is [YOUR MEMBER ID] and my date of birth is [YOUR DOB]. I'm calling to file a formal appeal regarding a claim denial I received for ${treatment}. The denial stated '${denialReason}.' I'd like to be connected with the Appeals Department, please."

── If transferred, repeat your name and Member ID to new rep ──

──────────────────────────────────────────
KEY POINTS TO MAKE
──────────────────────────────────────────
1. "My treating physician has determined this treatment is medically necessary."
2. "I'd like to request a peer-to-peer review between my doctor and your medical reviewer."
3. "Can you provide the specific clinical criteria or guidelines used to deny my claim?"
4. "Please confirm my appeal deadline — I understand it's ${appealDeadline}."
5. "I'd like to know the name and specialty of the physician who reviewed my case."

──────────────────────────────────────────
IF THEY ASK FOR MORE DOCUMENTATION
──────────────────────────────────────────
"I'm happy to provide additional documentation. Please email or mail me a specific list of what's needed and the submission deadline. My email is [YOUR EMAIL]."

──────────────────────────────────────────
ESCALATION LANGUAGE
──────────────────────────────────────────
"I'd like this escalated to a supervisor, please."
"If this appeal is denied, I will be requesting an External Independent Review."
"I will also be filing a complaint with my state's Department of Insurance."

──────────────────────────────────────────
CLOSING
──────────────────────────────────────────
"Please note this call in my account. Can I get a reference number? And may I have your full name and employee ID for my records?"

NOTES:
Rep Name: _________________ Employee ID: _________
Call Date/Time: _________________ Reference #: _________
What was said: ________________________________________________`;

  const documentChecklist = [
    ...requiredDocuments,
    "Completed appeal request form (available on insurer website or by calling Member Services)",
    "Copy of the original denial letter",
    "Letter of medical necessity — signed and dated by your treating physician",
    "Relevant peer-reviewed medical literature supporting treatment efficacy",
    "Your complete medical history relevant to this condition",
    "Documentation of all prior treatments tried (step therapy evidence)",
    "Any imaging, lab results, or diagnostic reports",
    "Proof of submission — certified mail receipt or email read-receipt",
  ];

  const nextSteps = [
    `⚡ URGENT: File your appeal before the deadline — ${appealDeadline}`,
    "Call your physician TODAY to request a Letter of Medical Necessity",
    "Ask your doctor to request a peer-to-peer review with the insurer's medical director",
    "Send all documents via BOTH certified mail AND email — keep proof of delivery",
    "Follow up by phone within 5 business days of submission to confirm receipt",
    "If internal appeal is denied, immediately request an External Independent Review (IRO) — it's free and binding",
    "Contact your state's Department of Insurance if appeals are delayed or handled improperly",
    "Consider contacting your employer's HR/benefits team if this is an employer-sponsored plan",
  ];

  return {
    summary,
    appealLetter,
    emailDraft,
    phoneScript,
    documentChecklist: [...new Set(documentChecklist)],
    nextSteps,
  };
}
