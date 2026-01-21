export const WELCOME_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="format-detection" content="telephone=no"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <title>Bem-vindo ao Budget Tracker</title>

  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->

  <style>
    @media (prefers-color-scheme: dark) {
      .container { background-color:#0b0b0b !important; border-color:#262626 !important; }
      .card { background-color:#111111 !important; border-color:#262626 !important; }
      .text { color:#ffffff !important; }
      .text-muted { color:#a1a1aa !important; }
    }

    @media only screen and (max-width:600px) {
      .container { width:100% !important; }
      .padding { padding:24px !important; }
      .title { font-size:22px !important; }
      .cta a { width:100% !important; }
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#050505; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#050505;">
  <tr>
    <td align="center" style="padding:40px 20px;">

      <!-- Container -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
        class="container"
        style="max-width:600px; background-color:#0b0b0b; border-radius:14px; border:1px solid #262626; overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="padding:28px 32px 20px 32px;">
            <h2 style="margin:0; font-size:20px; font-weight:600; color:#facc15;">
              💰 Budget Tracker
            </h2>
          </td>
        </tr>

        <!-- Hero Image -->
        <tr>
          <td align="center">
            <img
              src="https://res.cloudinary.com/dxx3qxsxt/image/upload/v1767154309/cloudinary-budget/ChatGPT_Image_31_de_dez._de_2025_01_11_19_gbiwbo.png"
              alt="Gerencie suas finanças com o Budget Tracker"
              width="100%"
              style="display:block; max-width:600px; width:100%; height:auto;"
            />
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td class="padding" style="padding:32px;">

            <h1 class="title text" style="margin:0 0 16px 0; font-size:26px; font-weight:600; color:#ffffff;">
              Olá, {{name}} 👋
            </h1>

            <p class="text-muted" style="margin:0 0 24px 0; font-size:16px; line-height:1.6; color:#a1a1aa;">
              Seja muito bem-vindo ao <strong style="color:#ffffff;">Budget Tracker</strong>.
              Aqui você controla depósitos, retiradas e mantém seu orçamento sempre sob controle,
              de forma simples e eficiente.
            </p>

            <!-- Feature Cards -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td class="card" style="background:#111111; border:1px solid #262626; border-radius:10px; padding:16px;">
                  <p style="margin:0; color:#22c55e; font-weight:600;">
                    ▲ Controle de depósitos
                  </p>
                  <p style="margin:6px 0 0 0; color:#a1a1aa; font-size:14px;">
                    Acompanhe suas entradas em tempo real.
                  </p>
                </td>
              </tr>

              <tr><td height="12"></td></tr>

              <tr>
                <td class="card" style="background:#111111; border:1px solid #262626; border-radius:10px; padding:16px;">
                  <p style="margin:0; color:#ef4444; font-weight:600;">
                    ▼ Gestão de retiradas
                  </p>
                  <p style="margin:6px 0 0 0; color:#a1a1aa; font-size:14px;">
                    Visualize gastos por categoria e evite excessos.
                  </p>
                </td>
              </tr>
            </table>

            <p class="text-muted" style="margin:24px 0 32px 0; font-size:16px; line-height:1.6; color:#a1a1aa;">
              Seu painel já está pronto. Comece agora mesmo adicionando suas primeiras transações.
            </p>

            <!-- CTA (CORRIGIDO: 100% dentro do container) -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="cta">
              <tr>
                <td align="center">
                  <a
                    href="https://budget-tracker-app-pearl.vercel.app/"
                    style="
                      display:block;
                      width:100%;
                      max-width:100%;
                      background:linear-gradient(135deg,#fde047,#facc15);
                      color:#1a1a1a;
                      text-decoration:none;
                      padding:16px 0;
                      border-radius:10px;
                      font-size:16px;
                      font-weight:600;
                      text-align:center;
                    ">
                    Acessar painel
                  </a>
                </td>
              </tr>
            </table>

            <!-- Footer -->
            <p style="margin:40px 0 0 0; font-size:13px; line-height:1.5; color:#71717a; text-align:center;">
              © 2025 Budget Tracker<br/>
              <a href="{{appUrl}}" style="color:#a1a1aa; text-decoration:underline;">Visitar aplicação</a> ·
              <a href="{{unsubscribeUrl}}" style="color:#a1a1aa; text-decoration:underline;">Cancelar inscrição</a>
            </p>

          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>
</body>
</html>`;
