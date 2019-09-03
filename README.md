# Barbex - Backend

## Ambiente
- Ubuntu 18.04
- VS Code 1.37.0
- Node.js 10.15.3

## Ferramentas utilizadas
- Yarn
- Express
- Nodemon
- Multer
- Express-Handlebars
- Sequelize
- Mongoose
- BeeQueue (gerenciamento de filas de jobs)
- Nodemailer
- Sentry (tratamento de exceções)
- Yup
- Youch

## Bancos de dados
Utilizamos 3 imagens, de bancos diferentes, no Docker:
- PostgreSQL (armazena relacionamento entre as tabelas principais do sistema)
- MongoDB (para armazenar notificações ao usuário)
- Redis (fila para envio de emails)

### PostgreSQL
```bash
$ docker run --name postgrebarbex -e POSTGRES_PASSWORD=suaSenha -p 5432:5432 -d postgres
```
Caso já tenha uma instalação do PostgreSQL no PC, utilize outra porta no comando acima, por exemplo ```5433:5432```.

### MongoDB
```bash
$ docker run --name mongobarbex -p 27017:27017 -d -t mongo
```

### Redis
```bash
$ docker run --name redisbarbex -p 6379:6379 -d -t redis:alpine
```

Lembre-se de criar um arquivo ```.env```, baseado no arquivo [```.env.example```](.env.example), e alterar as variáveis de ambiente de acordo com os dados dos contêineres dos passos acima.

## Softwares Auxiliares
- Insomnia
- Docker
- Postbird
- MongoDB Compass

## Rodando a aplicação
Primeiramente execute as imagens dos bancos de dados do Docker, por exemplo:
```bash
$ docker start redisbarbex mongobarbex postgrebarbex
```

Depois abra o terminal na pasta do projeto e faça:
```bash
$ yarn dev
```

## Funcionamento (Insomnia)
![example](arquivos/example.png)
