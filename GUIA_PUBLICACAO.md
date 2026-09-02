# Publicar o Revisa.med gratuitamente

## 1. Criar o banco no Supabase

1. Acesse https://supabase.com e crie uma conta.
2. Clique em **New project** e escolha uma senha forte para o banco.
3. No projeto, abra **SQL Editor**.
4. Copie todo o conteúdo de `supabase/schema.sql`, cole no editor e clique em **Run**.
5. Abra **Project Settings → API** e guarde:
   - Project URL;
   - chave pública `anon` ou `publishable`.
6. Em **Authentication → URL Configuration**, adicione o futuro endereço do GitHub Pages em **Redirect URLs**:
   `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/**`

Nunca use a chave `service_role` no projeto ou no GitHub.

## 2. Testar no computador

1. Copie `.env.example` para `.env.local`.
2. Preencha a URL e a chave pública do Supabase.
3. Execute:

```bash
npm run install:ci
npm run dev
```

Crie uma conta na tela inicial. Se a confirmação de e-mail estiver ativada no Supabase, confirme o e-mail antes de entrar.

## 3. Enviar ao GitHub

Crie um repositório público vazio no GitHub e, dentro da pasta do projeto, execute:

```bash
git init
git add .
git commit -m "Primeira versão do Revisa.med"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

O arquivo `.env.local` é ignorado e não será enviado.

## 4. Configurar as variáveis no GitHub

No repositório, abra **Settings → Secrets and variables → Actions → New repository secret** e crie:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Use os valores públicos obtidos no Supabase.

## 5. Ativar o GitHub Pages

1. Abra **Settings → Pages**.
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Abra a aba **Actions** e acompanhe “Publicar no GitHub Pages”.
4. Ao terminar, o site estará em:
   `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`

## Como a sincronização funciona

- O primeiro acesso cria um registro vinculado ao usuário.
- Se houver dados antigos no navegador, eles são enviados ao banco na primeira entrada.
- Cada alteração é guardada no aparelho e enviada ao Supabase após 700 ms.
- Ao entrar com a mesma conta em outro dispositivo, o site baixa o mesmo histórico.
- As políticas de segurança do banco permitem que cada usuário acesse apenas o próprio registro.

## Solução de problemas

- **Tela “Conecte o banco de dados”**: as variáveis públicas não foram informadas durante a geração do site.
- **E-mail ou senha incorretos**: confirme o e-mail de cadastro ou redefina a senha pelo painel do Supabase.
- **Erro ao salvar**: confirme que `schema.sql` foi executado e que a conexão está ativa.
- **Página em branco no GitHub Pages**: confira se o nome do repositório não foi alterado depois da última publicação; execute novamente o workflow.
