 # Use a imagem oficial do Node.js LTS (Long Term Support) como base
FROM node:18-slim

# Instala o OpenSSL e python (dependências para node-gyp e bcrypt)
RUN apt-get update && apt-get install -y openssl python3 make g++

# Define o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Copia apenas os arquivos de definição de pacotes para o contêiner
# Isso otimiza o cache do Docker, reinstalando dependências apenas se o package.json mudar
COPY app/package*.json ./

# Instala todas as dependências. O código-fonte virá depois, via volume.
RUN npm install

# Expõe a porta da aplicação
EXPOSE 4000

# O comando para iniciar a aplicação será definido no docker-compose
CMD [ "npm", "run", "dev" ]
