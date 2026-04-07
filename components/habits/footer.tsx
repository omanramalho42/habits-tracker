import React from 'react'

const Footer:React.FC = () => {
  return (
    <footer className="mt-15 border-t border-border/40 bg-linear-to-b from-background to-black/40">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* LOGO + SLOGAN */}
          <div className="flex flex-col gap-4">
            
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
                H
              </div>
              <span className="font-semibold text-lg">Habits</span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Construa rotinas melhores, acompanhe seus hábitos e evolua todos os dias.
            </p>

            <p className="text-xs text-muted-foreground">
              Pequenos hábitos constroem grandes resultados.
            </p>

          </div>

          {/* NAVEGAÇÃO */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground">
              Navegação
            </h4>

            <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Dashboard
            </a>

            <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Hábitos
            </a>

            <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Rotinas
            </a>

            <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Estatísticas
            </a>
          </div>

          {/* SUPORTE */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground">
              Suporte
            </h4>

            <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Central de ajuda
            </a>

            <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Contato
            </a>

            <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Reportar problema
            </a>

            <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Status do sistema
            </a>
          </div>

          {/* LEGAL */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground">
              Legal
            </h4>

            <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Política de privacidade
            </a>

            <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Termos de uso
            </a>

            <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
              LGPD
            </a>

            <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Cookies
            </a>
          </div>

        </div>


        {/* SOCIAL + COPYRIGHT */}
        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">

          {/* COPYRIGHT */}
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Habits. Todos os direitos reservados.
          </p>

          {/* SOCIAL */}
          <div className="flex items-center gap-4 text-muted-foreground">

            <a className="hover:text-primary transition-colors">
              Github
            </a>

            <a className="hover:text-primary transition-colors">
              Twitter
            </a>

            <a className="hover:text-primary transition-colors">
              LinkedIn
            </a>

            <a className="hover:text-primary transition-colors">
              Instagram
            </a>

          </div>

        </div>


        {/* LGPD */}
        <div className="mt-6 text-center text-xs text-muted-foreground max-w-3xl mx-auto leading-relaxed">

          Este aplicativo segue as diretrizes da Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018). 
          Seus dados são utilizados exclusivamente para melhorar sua experiência e nunca são compartilhados sem consentimento.

        </div>

      </div>

    </footer>
  )
}

export default Footer