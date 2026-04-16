# Deploy AWS para MVP

Este guia concentra todo o processo de deploy da API na AWS no formato mais simples para um MVP:

- 1 EC2 para rodar a API
- 1 RDS PostgreSQL para o banco
- Docker Compose para subir a aplicacao
- GitHub Actions para automatizar os deploys

Com isso, o fluxo fica simples:

1. voce cria a infraestrutura basica na AWS
2. voce faz o primeiro deploy manual na EC2
3. depois cada push na `main` pode atualizar a API automaticamente

## Arquitetura recomendada

- API NestJS rodando em container Docker na EC2
- PostgreSQL gerenciado no Amazon RDS
- conexao da API com o banco via `DATABASE_URL`
- deploy automatico por GitHub Actions via SSH

Esse desenho e um bom equilibrio entre simplicidade, baixo custo operacional e facilidade de manutencao.

## Como ficam as variaveis de ambiente

Hoje voce usa algo como:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/meubanco"
AUTH_TOKEN_SECRET="updin-local-secret"
```

Na AWS com RDS, a API nao usa mais `localhost` para falar com o banco. Ela precisa apontar para o endpoint do RDS.

Exemplo de producao:

```env
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgresql://updin:SUA_SENHA_FORTE@updin-db.xxxxxxxx.us-east-1.rds.amazonaws.com:5432/updin?schema=public&sslmode=require
DATABASE_SSL_REJECT_UNAUTHORIZED=false
AUTH_TOKEN_SECRET=uma-chave-bem-grande-e-aleatoria
```

Notas:

- `updin-db.xxxxxxxx.us-east-1.rds.amazonaws.com` e apenas um exemplo de endpoint
- `sslmode=require` e recomendado para o RDS
- `DATABASE_SSL_REJECT_UNAUTHORIZED=false` e o atalho mais simples para MVP com `@prisma/adapter-pg`; o caminho mais seguro depois e fornecer a CA do RDS e validar o certificado
- `AUTH_TOKEN_SECRET` deve ser diferente do ambiente local

## 1. Criar os servicos na AWS

Para esse MVP, o mais simples e usar a VPC padrao da sua conta AWS, desde que EC2 e RDS fiquem na mesma VPC.

Voce vai criar:

- 1 EC2 Ubuntu
- 1 RDS PostgreSQL
- 2 Security Groups

## 2. Criar a EC2

Configuracao sugerida:

- AMI: Ubuntu 24.04 LTS
- tipo: `t3.micro` ou `t3.small`
- storage: 20 GB
- key pair: a sua chave SSH para acessar o servidor

Crie um Security Group para a EC2 com estas regras de entrada:

- `22/tcp` vindo do seu IP
- `3000/tcp` vindo do seu IP ou do publico que voce deseja permitir

Se depois voce quiser dominio com HTTPS, o ideal sera expor `80` e `443` com um proxy reverso, mas para MVP pode comecar em `3000`.

## 3. Criar o RDS PostgreSQL

No console da AWS:

1. Entre em `RDS`
2. Clique em `Create database`
3. Escolha `PostgreSQL`
4. Use `Free tier` ou `Dev/Test`, se disponivel
5. Defina:
   - DB instance identifier: `updin-db`
   - Master username: `updin`
   - Master password: uma senha forte
6. Em conectividade:
   - use a mesma VPC da EC2
   - escolha `Public access: No`
   - selecione ou crie um Security Group proprio do banco
7. Crie o banco

Depois de criar, anote:

- endpoint do RDS
- porta
- nome do banco
- usuario

## 4. Configurar os Security Groups

Essa parte e essencial.

### Security Group da EC2

Inbound:

- `22/tcp` vindo do seu IP
- `3000/tcp` vindo do seu IP ou do publico desejado

Outbound:

- deixe o padrao liberado

### Security Group do RDS

Inbound:

- `5432/tcp`
- origem: o Security Group da EC2

Nao libere o banco para `0.0.0.0/0`.

## 5. Preparar a EC2

Conecte na EC2 por SSH e instale Docker, Docker Compose Plugin e Git:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

Valide:

```bash
docker --version
docker compose version
git --version
```

## 6. Subir a API pela primeira vez na EC2

Clone o repositorio:

```bash
cd /home/ubuntu
git clone <URL_DO_SEU_REPOSITORIO> updin-api
cd updin-api
```

Crie o arquivo de ambiente:

```bash
cp .env.ec2.example .env.ec2
nano .env.ec2
```

Preencha com os dados reais do seu RDS:

```env
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgresql://updin:SUA_SENHA_FORTE@updin-db.xxxxxxxx.us-east-1.rds.amazonaws.com:5432/updin?schema=public&sslmode=require
DATABASE_SSL_REJECT_UNAUTHORIZED=false
AUTH_TOKEN_SECRET=uma-chave-bem-grande-e-aleatoria
```

Suba a aplicacao:

```bash
docker compose up -d --build
```

Na estrutura atual:

- a imagem builda a API NestJS
- o container roda `npx prisma migrate deploy`
- depois sobe `node dist/main`

## 7. Validar o deploy manual

Ver logs:

```bash
docker compose logs -f api
```

Testar:

- `http://SEU_IP_PUBLICO:3000/api`
- `http://SEU_IP_PUBLICO:3000/docs`

Se a API subir, sua base de infraestrutura esta pronta.

## 8. Como atualizar manualmente

Antes de automatizar, este e o fluxo manual:

```bash
cd /home/ubuntu/updin-api
git pull
docker compose up -d --build
```

Se quiser, voce tambem pode usar o script do projeto:

```bash
cd /home/ubuntu/updin-api
chmod +x scripts/deploy.sh
./scripts/deploy.sh main
```

## 9. Automatizar com GitHub Actions

Depois do primeiro deploy manual funcionando, voce pode automatizar.

O fluxo fica assim:

1. voce faz push para `main`
2. o GitHub Actions dispara
3. ele conecta por SSH na EC2
4. ele executa `scripts/deploy.sh`
5. a EC2 faz `git pull`
6. a API rebuilda e sobe com a nova versao

Arquivos envolvidos:

- workflow: `.github/workflows/deploy.yml`
- script remoto: `scripts/deploy.sh`

## 10. Preparar acesso SSH do GitHub Actions para a EC2

O ideal e criar uma chave separada so para deploy.

Na sua maquina local:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f github-actions-deploy
```

Isso gera:

- `github-actions-deploy` -> chave privada
- `github-actions-deploy.pub` -> chave publica

Adicione a chave publica na EC2:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
cat >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Cole o conteudo do arquivo `.pub` e finalize com `Ctrl+D`.

## 11. Configurar os secrets no GitHub

No repositorio do GitHub, acesse:

`Settings > Secrets and variables > Actions`

Crie estes secrets:

- `EC2_HOST`
  Exemplo: IP publico ou DNS publico da EC2

- `EC2_USER`
  Exemplo: `ubuntu`

- `EC2_PORT`
  Exemplo: `22`

- `EC2_APP_DIR`
  Exemplo: `/home/ubuntu/updin-api`

- `EC2_SSH_PRIVATE_KEY`
  Conteudo completo da chave privada `github-actions-deploy`

## 12. Repositorio publico ou privado

O GitHub Actions conecta na EC2, mas quem faz `git pull` e a propria EC2.

Isso significa:

- se o repositorio for publico, normalmente funciona direto
- se o repositorio for privado, a EC2 tambem precisa ter acesso de leitura ao GitHub

Para MVP, as opcoes mais simples sao:

- usar repositorio publico
- ou configurar uma deploy key na EC2 para ler o repositorio privado

Se a EC2 nao conseguir acessar o repositorio, o workflow vai conectar, mas o `git pull` vai falhar.

## 13. Como testar a automacao

Primeiro teste o script manualmente na EC2:

```bash
cd /home/ubuntu/updin-api
chmod +x scripts/deploy.sh
./scripts/deploy.sh main
```

Depois:

1. faca push para `main`
2. abra a aba `Actions` no GitHub
3. acompanhe o workflow `Deploy API`

## 14. Erros mais comuns

- chave SSH invalida
- porta `22` bloqueada no Security Group
- `EC2_APP_DIR` incorreto
- usuario sem permissao para Docker
- EC2 sem acesso ao GitHub para rodar `git pull`
- `DATABASE_URL` apontando para host errado
- RDS sem regra liberando `5432` para o Security Group da EC2

## 15. O que acontece quando voce faz push

Com o GitHub Actions configurado, push na `main` nao atualiza o container sozinho por magia. O que acontece e:

1. o GitHub detecta o push
2. executa o workflow
3. o workflow conecta na EC2
4. a EC2 baixa o codigo novo
5. a EC2 rebuilda e reinicia a API

Ou seja, a atualizacao passa a ser automatica, mas porque o Actions executa esse processo no servidor.
