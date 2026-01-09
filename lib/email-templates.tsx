export const welcomeEmailTemplate = (userName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Wisey</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #0f1629;">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);">
        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🎯 Welcome to Wisey</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px; color: #e2e8f0;">
        <h2 style="color: #3B82F6; font-size: 24px; margin-top: 0;">Hello ${userName}! 👋</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
          We're thrilled to have you join Wisey, your personal coach for mindfulness and cognitive growth!
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
          Start your journey by creating your first habit and tracking your daily mood. Build better routines that last!
        </p>
        <div style="margin: 30px 0; padding: 20px; background-color: #1a1f3a; border-radius: 12px; border-left: 4px solid #3B82F6;">
          <h3 style="color: #3B82F6; font-size: 18px; margin-top: 0;">✨ Quick Tips:</h3>
          <ul style="color: #cbd5e1; line-height: 1.8;">
            <li>Set realistic goals for your habits</li>
            <li>Track your mood daily for better insights</li>
            <li>Enable notifications to stay on track</li>
            <li>Celebrate your streaks! 🎉</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Get Started</a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; text-align: center; background-color: #0a0e27; border-top: 1px solid #1a1f3a;">
        <p style="margin: 0; color: #64748b; font-size: 14px;">
          © ${new Date().getFullYear()} Wisey. Your personal growth companion.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`

export const dailyReminderEmailTemplate = (userName: string, habitsToday: Array<{ name: string; icon: string }>) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Habit Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #0f1629;">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%);">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">☀️ Good Morning!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px; color: #e2e8f0;">
        <h2 style="color: #3B82F6; font-size: 22px; margin-top: 0;">Hello ${userName}! 🌟</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
          Time to start your day right! Here are your habits for today:
        </p>
        <div style="margin: 25px 0;">
          ${habitsToday
            .map(
              (habit) => `
            <div style="padding: 16px; margin: 12px 0; background-color: #1a1f3a; border-radius: 10px; border-left: 4px solid #3B82F6;">
              <span style="font-size: 24px; margin-right: 12px;">${habit.icon}</span>
              <span style="color: #e2e8f0; font-size: 16px; font-weight: 500;">${habit.name}</span>
            </div>
          `,
            )
            .join("")}
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
          Remember: Small steps lead to big changes. You've got this! 💪
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Track Your Habits</a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; text-align: center; background-color: #0a0e27; border-top: 1px solid #1a1f3a;">
        <p style="margin: 0; color: #64748b; font-size: 14px;">
          © ${new Date().getFullYear()} Wisey. Your personal growth companion.
        </p>
        <p style="margin: 10px 0 0 0; color: #64748b; font-size: 12px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #64748b; text-decoration: underline;">Manage notifications</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`
