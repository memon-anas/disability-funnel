// 7 questions (down from 11). Dropped: gender + marital status (sensitive, not needed to route a lead,
// can be collected on the follow-up call), duplicate age question (Q1/Q10 merged), and doctor questions Q6/Q7 merged.
export const FUNNEL_NAME = 'disability-benefits-demo';
export const quizQuestions = [
  { id: 'ageRange', title: 'What is your age range?',
    options: ['Under 40', '40–49', '50–54', '55–63', '64 or older'] },
  { id: 'workingHours', title: 'How many hours a week are you working right now?',
    options: ['Not working', '20 hours or less', 'More than 20 hours'] },
  { id: 'employmentHistory', title: 'In the past 10 years, how long have you been employed?',
    options: ['Less than 2 years', '2 to 4 years', '4 to 6 years', 'More than 6 years'] },
  { id: 'expectedWorkAbsence', title: 'Do you expect to be out of work for at least a year because of a health condition?',
    options: ['Yes', 'No', 'Not sure'] },
  { id: 'medicalCare', title: 'Are you seeing a doctor or taking prescribed medication for a health condition?',
    options: ['Yes, and I saw a doctor in the last 12 months', 'Yes, but my last visit was over 12 months ago', 'No, not currently'] },
  { id: 'currentBenefits', title: 'Which disability benefits do you receive today?',
    options: ['Social Security Disability (SSDI)', 'Supplemental Security Income (SSI)', 'Both SSDI and SSI', 'None'] },
  { id: 'pendingApplication', title: 'Do you have a Social Security Disability application pending?',
    options: ['Yes', 'No'] },
];
