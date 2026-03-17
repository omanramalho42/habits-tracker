export const welcomeEmailTemplate = (userName: string) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bem-vindo ao Habits</title>
</head>

<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:linear-gradient(135deg,#0a0e27 0%,#1a1f3a 100%);">

<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:0 auto;background-color:#0f1629;">

<tr>
<td style="padding:40px 30px;text-align:center;background:linear-gradient(135deg,#3B82F6 0%,#8B5CF6 100%);">
<h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:bold;">
🎯 Bem-vindo ao Habits
</h1>
</td>
</tr>

<tr>
<td style="padding:40px 30px;color:#e2e8f0;">

<h2 style="color:#3B82F6;font-size:24px;margin-top:0;">
Olá ${userName}! 👋
</h2>

<p style="font-size:16px;line-height:1.6;color:#cbd5e1;">
Estamos muito felizes em ter você no <strong>Habits</strong>, seu aliado para construir rotinas melhores e evoluir todos os dias.
</p>

<p style="font-size:16px;line-height:1.6;color:#cbd5e1;">
Comece criando seu primeiro hábito e acompanhe seu progresso diário. Pequenas ações consistentes geram grandes resultados.
</p>

<div style="margin:30px 0;padding:20px;background-color:#1a1f3a;border-radius:12px;border-left:4px solid #3B82F6;">

<h3 style="color:#3B82F6;font-size:18px;margin-top:0;">
✨ Dicas rápidas
</h3>

<ul style="color:#cbd5e1;line-height:1.8;">
<li>Defina metas realistas para seus hábitos</li>
<li>Acompanhe seu progresso diariamente</li>
<li>Ative notificações para não esquecer</li>
<li>Comemore suas sequências de progresso 🎉</li>
</ul>

</div>

<div style="text-align:center;margin:30px 0;">

<a href="https://www.habits.app.br"
style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#3B82F6 0%,#8B5CF6 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">
Começar agora
</a>

</div>

</td>
</tr>

<tr>
<td style="padding:30px;text-align:center;background-color:#0a0e27;border-top:1px solid #1a1f3a;">

<p style="margin:0;color:#64748b;font-size:14px;">
© ${new Date().getFullYear()} Habits • Construa rotinas melhores todos os dias
</p>

</td>
</tr>

</table>

</body>
</html>
`