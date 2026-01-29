// Mock AI service for demonstration
export async function analyzeEmailRelevance(subject, body, userDomain) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock analysis logic based on keywords and domain
  const keywords = {
    'Software Development': ['code', 'programming', 'development', 'software', 'api', 'database', 'frontend', 'backend'],
    'Healthcare': ['patient', 'medical', 'health', 'doctor', 'nurse', 'hospital', 'treatment'],
    'Finance': ['money', 'investment', 'banking', 'financial', 'budget', 'account', 'payment'],
    'Education': ['student', 'course', 'learning', 'teacher', 'school', 'university', 'education'],
    'Marketing': ['campaign', 'marketing', 'brand', 'advertising', 'social media', 'customer'],
    'Legal': ['legal', 'law', 'court', 'contract', 'attorney', 'case', 'justice'],
    'Engineering': ['engineering', 'design', 'construction', 'technical', 'project', 'infrastructure'],
    'Sales': ['sales', 'revenue', 'customer', 'deal', 'target', 'quota', 'commission'],
    'Human Resources': ['hr', 'recruitment', 'hiring', 'employee', 'training', 'payroll', 'benefits'],
    'Customer Support': ['support', 'customer service', 'help', 'ticket', 'issue', 'resolution'],
    'Design': ['design', 'ui', 'ux', 'creative', 'graphics', 'visual', 'prototype'],
    'Research': ['research', 'study', 'analysis', 'data', 'findings', 'report', 'methodology'],
    'Operations': ['operations', 'process', 'efficiency', 'logistics', 'supply chain', 'management'],
    'Consulting': ['consulting', 'advisor', 'strategy', 'recommendation', 'expertise', 'solution']
  };

  const text = `${subject} ${body}`.toLowerCase();
  const domainKeywords = keywords[userDomain] || [];
  
  // Check if email is relevant to user domain
  const isRelevant = domainKeywords.some(keyword => text.includes(keyword)) || 
                     Math.random() > 0.6; // 40% chance of being relevant

  // Generate mock reason
  const reasons = {
    true: [
      `This email contains relevant information for ${userDomain} professionals`,
      `Content aligns with your professional domain in ${userDomain}`,
      `Important updates related to ${userDomain} industry`,
      `Professional development opportunity in ${userDomain}`
    ],
    false: [
      `This email is not relevant to your ${userDomain} domain`,
      `Content does not align with your professional interests`,
      `General information not specific to ${userDomain}`,
      `Outside your area of professional expertise`
    ]
  };

  // Extract mock deadline from email content
  const deadlineRegex = /(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{4})|(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i;
  const deadlineMatch = text.match(deadlineRegex);
  
  let deadline = null;
  if (deadlineMatch && isRelevant) {
    // Convert to YYYY-MM-DD format
    const dateStr = deadlineMatch[0];
    if (dateStr.includes('-')) {
      deadline = dateStr;
    } else {
      // Mock deadline - 7 days from now
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      deadline = futureDate.toISOString().split('T')[0];
    }
  } else if (isRelevant && Math.random() > 0.7) {
    // 30% chance of having a deadline for relevant emails
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 14) + 1);
    deadline = futureDate.toISOString().split('T')[0];
  }

  return {
    isRelevant,
    reason: reasons[isRelevant][Math.floor(Math.random() * reasons[isRelevant].length)],
    deadline
  };
}
