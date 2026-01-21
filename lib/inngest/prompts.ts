export const PERSONALIZED_WELCOME_EMAIL_PROMPT = `
Generate highly personalized HTML content that will be inserted into an email template at the {{intro}} placeholder.

User profile data:
{{userProfile}}

PERSONALIZATION REQUIREMENTS:

1. Reference the user's intention to build better habits
2. Mention consistency, routine, and small daily progress
3. Use their emoji as a personal identity element
4. Make the message feel motivating, friendly, and personal

FORMATTING RULES:
- Return ONLY clean HTML
- Use a single <p> tag
- Exactly TWO sentences
- Between 30–45 words
- Use <strong> for emphasis
- Do NOT start with "Welcome"

Example:
<p>Great to have you here! Building habits with <strong>consistency</strong> is easier when you track progress daily, and your journey starts now. Small actions today will compound into powerful routines tomorrow.</p>
`
